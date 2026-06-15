import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { LANGUAGE_OPTIONS, resolveLanguage } from "./quotes";

// Scratch-card reveal experience:
// ─ Canvas layer 1 (bottom): beautiful nature image + quote text centered
// ─ Canvas layer 2 (top):    solid dark overlay
// Movement from camera (or mouse) erases the dark layer → revealing the image + quote beneath
// Like scratching a lottery card with your body.

const NATURE_IMAGES = [
  "https://images.unsplash.com/photo-1490750967868-88df5691cc99?w=1600&q=80", // pink flowers field
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1600&q=80", // orange wildflowers
  "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=1600&q=80", // misty forest
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=80", // aerial mountain meadow
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1600&q=80", // lake reflection
];

interface Props {
  quote: string;
  language: string;
  onComplete: (quote: string) => void;
  onClose: () => void;
}

export function FallingLetters({ quote, language, onComplete, onClose }: Props) {
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null); // dark scratch layer
  const videoRef         = useRef<HTMLVideoElement>(null);
  const motionCanvasRef  = useRef<HTMLCanvasElement>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const rafRef           = useRef<number>(0);
  const prevFrameRef     = useRef<Uint8ClampedArray | null>(null);
  const cameraReadyRef   = useRef(false);
  const frameRef         = useRef(0);
  const revealedRef      = useRef(0); // 0→1 percentage revealed
  const imgRef           = useRef<HTMLImageElement | null>(null);
  const imgLoadedRef     = useRef(false);
  const brushSizeRef     = useRef(90); // radius of scratch brush

  const [cameraState, setCameraState] = useState<"idle" | "requesting" | "active" | "error" | "denied">("idle");
  const [showSave, setShowSave]       = useState(false);
  const [hint, setHint]               = useState(true);

  // Pick a random nature image
  const imageUrl = useRef(NATURE_IMAGES[Math.floor(Math.random() * NATURE_IMAGES.length)]);

  const resolvedLang = resolveLanguage(language);
  const langOpt = LANGUAGE_OPTIONS.find(l => l.id === resolvedLang);

  // ── Draw the base scene (image + quote) on a separate offscreen canvas
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const buildBaseCanvas = useCallback(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const base = document.createElement("canvas");
    base.width  = W;
    base.height = H;
    const ctx = base.getContext("2d")!;

    // Draw image cover-fit
    if (imgRef.current && imgLoadedRef.current) {
      const img = imgRef.current;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const scale = Math.max(W / iw, H / ih);
      const dw = iw * scale, dh = ih * scale;
      const dx = (W - dw) / 2, dy = (H - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      // Fallback gradient
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#1a0533");
      g.addColorStop(0.5, "#2d1b69");
      g.addColorStop(1, "#0d3b2e");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // Dark overlay on image so quote is readable
    ctx.fillStyle = "rgba(0,0,0,0.38)";
    ctx.fillRect(0, 0, W, H);

    // Quote text — centered, word wrap, beautiful
    const words = quote.split(" ");
    const maxW  = Math.min(700, W * 0.75);
    const lineH = 62;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";

    // Build lines
    const lines: string[] = [];
    let current = "";
    ctx.font = "italic 400 42px 'Fraunces', serif";
    for (const w of words) {
      const test = current ? current + " " + w : w;
      if (ctx.measureText(test).width > maxW && current) {
        lines.push(current);
        current = w;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);

    const totalH = lines.length * lineH;
    const startY = H / 2 - totalH / 2;

    // Glow background behind text
    const pad = 40;
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    const rx = W / 2 - maxW / 2 - pad;
    const ry = startY - pad;
    const rw = maxW + pad * 2;
    const rh = totalH + pad * 2;
    ctx.roundRect(rx, ry, rw, rh, 16);
    ctx.fill();

    // Draw each line
    lines.forEach((line, i) => {
      const y = startY + i * lineH + lineH / 2;
      // Shadow
      ctx.shadowColor  = "rgba(0,0,0,0.8)";
      ctx.shadowBlur   = 20;
      ctx.fillStyle    = "rgba(255,253,246,0.92)";
      ctx.font         = "italic 300 42px 'Fraunces', serif";
      ctx.fillText(line, W / 2, y);
    });
    ctx.shadowBlur = 0;

    baseCanvasRef.current = base;
  }, [quote]);

  // ── Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl.current;
    img.onload = () => {
      imgRef.current    = img;
      imgLoadedRef.current = true;
      buildBaseCanvas();
    };
    img.onerror = () => {
      imgLoadedRef.current = false;
      buildBaseCanvas();
    };
    imgRef.current = img;
    return () => { img.onload = null; img.onerror = null; };
  }, [buildBaseCanvas]);

  // ── Init overlay (dark scratch layer)
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      buildBaseCanvas();
      // Fill dark
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0a080c";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [buildBaseCanvas]);

  // ── Scratch at a position (erase dark layer, reveal base beneath)
  const scratch = useCallback((x: number, y: number, radius: number) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || !baseCanvasRef.current) return;
    const ctx = canvas.getContext("2d")!;

    // Composite: destination-out erases the dark overlay
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0,   "rgba(0,0,0,1)");
    g.addColorStop(0.6, "rgba(0,0,0,0.8)");
    g.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, []);

  // ── Render loop: composite base + overlay on screen
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const loop = () => {
      frameRef.current++;
      if (frameRef.current % 2 === 0 && cameraReadyRef.current) detectMotion();

      // Check reveal percentage every 30 frames
      if (frameRef.current % 30 === 0) {
        const ctx = canvas.getContext("2d")!;
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let transparent = 0;
        for (let i = 3; i < data.length; i += 4 * 8) { // sample every 8th pixel
          if (data[i] < 128) transparent++;
        }
        const ratio = transparent / (data.length / (4 * 8));
        revealedRef.current = ratio;
        if (ratio > 0.55 && !showSave) setShowSave(true);
        if (ratio > 0.05 && hint) setHint(false);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [showSave, hint, scratch]);

  // ── Motion detection → scratch where movement is
  const detectMotion = () => {
    if (!videoRef.current || !motionCanvasRef.current) return;
    const mctx = motionCanvasRef.current.getContext("2d");
    if (!mctx) return;
    const W = 64, H = 48;
    motionCanvasRef.current.width  = W;
    motionCanvasRef.current.height = H;
    try { mctx.drawImage(videoRef.current, 0, 0, W, H); } catch { return; }
    let current: Uint8ClampedArray;
    try { current = mctx.getImageData(0, 0, W, H).data; } catch { return; }

    if (prevFrameRef.current) {
      const prev = prevFrameRef.current;
      const SW = window.innerWidth, SH = window.innerHeight;

      for (let py = 0; py < H; py += 1) {
        for (let px = 0; px < W; px += 1) {
          const pidx = (py * W + px) * 4;
          const diff =
            Math.abs(current[pidx]   - prev[pidx])   +
            Math.abs(current[pidx+1] - prev[pidx+1]) +
            Math.abs(current[pidx+2] - prev[pidx+2]);

          if (diff > 20) {
            // Mirror x — camera is flipped
            const sx = (1 - px / W) * SW;
            const sy = (py / H) * SH;
            const radius = brushSizeRef.current * (0.5 + (diff / 255) * 0.8);
            scratch(sx, sy, radius);
          }
        }
      }
    }
    prevFrameRef.current = new Uint8ClampedArray(current);
  };

  // ── Mouse fallback
  const handleMouseMove = (e: React.MouseEvent) => {
    if (cameraState === "active") return; // camera handles it
    scratch(e.clientX, e.clientY, brushSizeRef.current * 1.2);
  };

  // ── Camera start
  useEffect(() => {
    const start = async () => {
      setCameraState("requesting");
      if (!navigator.mediaDevices?.getUserMedia) { setCameraState("error"); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          cameraReadyRef.current = true;
        }
        setCameraState("active");
      } catch (err: unknown) {
        const name = (err as { name?: string })?.name ?? "";
        setCameraState(name === "NotAllowedError" || name === "PermissionDeniedError" ? "denied" : "error");
      }
    };
    start();
    return () => {
      cameraReadyRef.current = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9500, cursor: cameraState === "active" ? "none" : "crosshair" }}
      onMouseMove={handleMouseMove}
    >
      {/* Base layer: image + quote (always visible beneath) */}
      {baseCanvasRef.current && (
        <canvas
          ref={el => {
            if (el && baseCanvasRef.current) {
              el.width  = baseCanvasRef.current.width;
              el.height = baseCanvasRef.current.height;
              el.getContext("2d")!.drawImage(baseCanvasRef.current, 0, 0);
            }
          }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}

      {/* Scratch overlay */}
      <canvas
        ref={overlayCanvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      {/* Hidden camera + motion canvas */}
      <video ref={videoRef} muted playsInline style={{ display: "none" }} />
      <canvas ref={motionCanvasRef} style={{ display: "none" }} />

      {/* Loading spinner */}
      {(cameraState === "idle" || cameraState === "requesting") && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 14, pointerEvents: "none",
        }}>
          <div style={{ width: 44, height: 44, border: "2px solid rgba(255,255,255,0.15)", borderTopColor: "rgba(255,255,255,0.7)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>
            {cameraState === "requesting" ? "opening the lens..." : "starting..."}
          </div>
        </div>
      )}

      {/* Instructions */}
      {hint && cameraState === "active" && (
        <div style={{
          position: "absolute", bottom: 110, left: "50%", transform: "translateX(-50%)",
          textAlign: "center", pointerEvents: "none",
          animation: "fadeInUp 0.8s ease both",
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>\u270B</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontStyle: "italic", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            move your hands to reveal<br />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.28)" }}>what's waiting beneath</span>
          </div>
        </div>
      )}

      {/* Camera denied — mouse fallback message */}
      {(cameraState === "denied" || cameraState === "error") && hint && (
        <div style={{
          position: "absolute", bottom: 110, left: "50%", transform: "translateX(-50%)",
          textAlign: "center", pointerEvents: "none",
        }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontStyle: "italic", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            drag your mouse to scratch<br />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.28)" }}>what's waiting beneath</span>
          </div>
        </div>
      )}

      {/* Language */}
      {langOpt && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          fontFamily: "'VT323', monospace", fontSize: 13,
          color: "rgba(255,255,255,0.2)", letterSpacing: 0.8,
          whiteSpace: "nowrap", pointerEvents: "none",
        }}>
          {langOpt.flag} {langOpt.label}
        </div>
      )}

      {/* Skip */}
      <div onClick={onClose} style={{
        position: "fixed", top: 22, right: 26,
        fontFamily: "'VT323', monospace", fontSize: 15,
        color: "rgba(255,255,255,0.2)", cursor: "pointer", letterSpacing: 0.5,
        transition: "color 0.2s", zIndex: 9501,
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
      >
        \u2715 skip
      </div>

      {/* Save */}
      {showSave && (
        <button onClick={() => onComplete(quote)} style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "rgba(255,253,246,0.9)",
          padding: "9px 36px",
          fontFamily: "'VT323', monospace", fontSize: 20,
          cursor: "pointer", letterSpacing: 1, borderRadius: 3,
          backdropFilter: "blur(8px)",
          animation: "fadeInUp 0.6s ease both",
          zIndex: 9502,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.55)"; }}
        >
          \u2726 save this quote
        </button>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateX(-50%) translateY(14px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
