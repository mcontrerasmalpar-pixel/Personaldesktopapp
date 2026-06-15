import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LANGUAGE_OPTIONS, resolveLanguage } from "./quotes";

// ── References: graaatio-style motion painting
// Letters from the quote are "painted" by your body movement in front of the camera.
// Motion detection → ink-like colored trails → letters emerge from those trails.
// No camera permission = fallback mouse paint mode.

const RANSOM_FONTS = [
  "'Abril Fatface', cursive",
  "'Fraunces', serif",
  "'VT323', monospace",
  "'Pacifico', cursive",
  "'Courier Prime', monospace",
];

const INK_COLORS = [
  "#F4C97F",  // warm gold
  "#FF6B9D",  // pink
  "#7EC8E3",  // cyan
  "#B5EAD7",  // mint
  "#FFDAC1",  // peach
  "#C7CEEA",  // lavender
  "#FF9AA2",  // coral
];

interface Letter {
  char: string;
  x: number;
  y: number;
  color: string;
  font: string;
  size: number;
  rotation: number;
  opacity: number;
  targetOpacity: number;
  vx: number;
  vy: number;
  spawned: boolean;
}

interface Trail {
  x: number;
  y: number;
  color: string;
  radius: number;
  opacity: number;
  age: number;
}

interface Props {
  quote: string;
  language: string;
  onComplete: (quote: string) => void;
  onClose: () => void;
}

export function FallingLetters({ quote, language, onComplete, onClose }: Props) {
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const videoRef        = useRef<HTMLVideoElement>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef       = useRef<MediaStream | null>(null);
  const rafRef          = useRef<number>(0);
  const prevFrameRef    = useRef<Uint8ClampedArray | null>(null);
  const cameraReadyRef  = useRef(false);
  const frameRef        = useRef(0);

  // Letters state
  const lettersRef = useRef<Letter[]>([]);
  const trailsRef  = useRef<Trail[]>([]);
  const nextLetterIdxRef = useRef(0);  // which char to spawn next
  const motionEnergyRef  = useRef(0);  // accumulated motion for spawning

  const [cameraState, setCameraState] = useState<"idle" | "requesting" | "active" | "error" | "denied">("idle");
  const [allSpawned, setAllSpawned]    = useState(false);

  const chars = quote.split("").filter(c => c.trim() !== "");
  const words = quote.split(" ");

  // ── Spawn a letter at a screen position
  const spawnLetter = (x: number, y: number) => {
    const idx = nextLetterIdxRef.current;
    if (idx >= chars.length) { setAllSpawned(true); return; }
    const color = INK_COLORS[Math.floor(Math.random() * INK_COLORS.length)];
    lettersRef.current.push({
      char:  chars[idx],
      x:     x + (Math.random() - 0.5) * 60,
      y:     y + (Math.random() - 0.5) * 60,
      color,
      font:  RANSOM_FONTS[Math.floor(Math.random() * RANSOM_FONTS.length)],
      size:  28 + Math.floor(Math.random() * 26),
      rotation: (Math.random() - 0.5) * 30,
      opacity: 0,
      targetOpacity: 0.85 + Math.random() * 0.15,
      vx:  (Math.random() - 0.5) * 1.2,
      vy: -0.6 - Math.random() * 0.8,
      spawned: true,
    });
    nextLetterIdxRef.current = idx + 1;
    if (idx + 1 >= chars.length) setAllSpawned(true);
  };

  // ── Render loop (canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      frameRef.current++;

      // Motion detection every 2 frames
      if (frameRef.current % 2 === 0 && cameraReadyRef.current) {
        detectAndPaint();
      }

      // Fade canvas slightly — ink trail persistence
      ctx.fillStyle = "rgba(10, 8, 12, 0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw trails
      const trails = trailsRef.current;
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.opacity -= 0.012;
        t.age++;
        if (t.opacity <= 0) { trails.splice(i, 1); continue; }
        ctx.beginPath();
        const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.radius);
        grad.addColorStop(0, hexAlpha(t.color, t.opacity * 0.7));
        grad.addColorStop(1, hexAlpha(t.color, 0));
        ctx.fillStyle = grad;
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw letters
      const letters = lettersRef.current;
      for (const l of letters) {
        // Fade in
        if (l.opacity < l.targetOpacity) l.opacity = Math.min(l.targetOpacity, l.opacity + 0.04);
        // Gentle float
        l.x += l.vx;
        l.y += l.vy;
        l.vx *= 0.98;
        l.vy *= 0.98;
        // Keep on screen
        if (l.x < 20) l.vx = Math.abs(l.vx);
        if (l.x > canvas.width - 20) l.vx = -Math.abs(l.vx);
        if (l.y < 20) l.vy = Math.abs(l.vy);
        if (l.y > canvas.height - 60) l.vy = -Math.abs(l.vy);

        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate((l.rotation * Math.PI) / 180);
        ctx.globalAlpha = l.opacity;
        ctx.font = `${l.size}px ${l.font}`;
        ctx.fillStyle = l.color;
        // Subtle glow
        ctx.shadowColor = l.color;
        ctx.shadowBlur  = 12;
        ctx.fillText(l.char, 0, 0);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ── Motion detection → spawn ink trails + letters
  const detectAndPaint = () => {
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
      const canvas = canvasRef.current!;
      let totalMotion = 0;

      for (let py = 0; py < H; py += 2) {
        for (let px = 0; px < W; px += 2) {
          const pidx = (py * W + px) * 4;
          const diff =
            Math.abs(current[pidx]   - prev[pidx])   +
            Math.abs(current[pidx+1] - prev[pidx+1]) +
            Math.abs(current[pidx+2] - prev[pidx+2]);

          if (diff > 25) {
            totalMotion += diff;
            // Mirror horizontally (camera is flipped)
            const screenX = (1 - px / W) * canvas.width;
            const screenY = (py / H)     * canvas.height;
            const colorIdx = Math.floor(Math.random() * INK_COLORS.length);
            const color = INK_COLORS[colorIdx];
            const radius = 18 + (diff / 255) * 40;

            trailsRef.current.push({
              x: screenX + (Math.random() - 0.5) * 20,
              y: screenY + (Math.random() - 0.5) * 20,
              color,
              radius,
              opacity: 0.4 + (diff / 255) * 0.5,
              age: 0,
            });

            // Accumulate motion energy to spawn letters
            motionEnergyRef.current += diff * 0.002;
            if (motionEnergyRef.current >= 1 && nextLetterIdxRef.current < chars.length) {
              motionEnergyRef.current = 0;
              spawnLetter(screenX, screenY);
            }
          }
        }
      }
      // Cap trails array
      if (trailsRef.current.length > 600) trailsRef.current.splice(0, 100);
    }
    prevFrameRef.current = new Uint8ClampedArray(current);
  };

  // ── Mouse/touch fallback paint (no camera)
  const mouseRef = useRef(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (cameraState !== "error" && cameraState !== "denied") return;
    const color = INK_COLORS[Math.floor(Math.random() * INK_COLORS.length)];
    trailsRef.current.push({ x: e.clientX, y: e.clientY, color, radius: 28, opacity: 0.55, age: 0 });
    motionEnergyRef.current += 0.15;
    if (motionEnergyRef.current >= 1 && nextLetterIdxRef.current < chars.length) {
      motionEnergyRef.current = 0;
      spawnLetter(e.clientX, e.clientY);
    }
  };

  // ── Start camera
  const startCamera = async () => {
    setCameraState("requesting");
    if (!navigator.mediaDevices?.getUserMedia) { setCameraState("error"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" } });
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

  useEffect(() => {
    startCamera();
    return () => {
      cameraReadyRef.current = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const resolvedLang = resolveLanguage(language);
  const langOpt = LANGUAGE_OPTIONS.find(l => l.id === resolvedLang);

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9500, cursor: "crosshair" }}
      onMouseMove={handleMouseMove}
    >
      {/* Main canvas — dark bg + trails + letters */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "#0a080c" }} />

      {/* Hidden motion detection canvas */}
      <canvas ref={motionCanvasRef} style={{ display: "none" }} />

      {/* Hidden camera feed */}
      <video ref={videoRef} muted playsInline style={{ display: "none" }} />

      {/* ── Camera state overlays ── */}
      {cameraState === "idle" || cameraState === "requesting" ? (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 16, pointerEvents: "none",
        }}>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 22, color: "rgba(255,255,255,0.5)", letterSpacing: 1 }}>
            {cameraState === "requesting" ? "opening the lens..." : "preparing..."}
          </div>
          <div style={{ width: 48, height: 48, border: "2px solid rgba(244,201,127,0.4)", borderTopColor: "#F4C97F", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        </div>
      ) : null}

      {cameraState === "denied" && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)",
          textAlign: "center", pointerEvents: "none",
        }}>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 18, color: "rgba(255,200,127,0.7)", lineHeight: 2 }}>
            camera access denied
          </div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.35)" }}>
            move your mouse to paint the words instead
          </div>
        </div>
      )}

      {/* ── Instructions overlay (active camera) ── */}
      {cameraState === "active" && nextLetterIdxRef.current === 0 && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center", pointerEvents: "none",
          animation: "fadeInUp 0.8s ease both",
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✋</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontStyle: "italic", color: "rgba(255,253,246,0.55)", lineHeight: 1.7 }}>
            move your hands<br />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>the words will follow</span>
          </div>
        </div>
      )}

      {/* ── Small live camera preview (corner) ── */}
      {cameraState === "active" && (
        <video
          ref={videoRef}
          muted
          playsInline
          style={{
            position: "fixed", bottom: 80, right: 20,
            width: 100, height: 75,
            borderRadius: 8,
            opacity: 0.35,
            transform: "scaleX(-1)",
            objectFit: "cover",
            border: "1px solid rgba(255,255,255,0.1)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Progress dots ── */}
      <div style={{
        position: "fixed", bottom: 56, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 400, justifyContent: "center",
        pointerEvents: "none",
      }}>
        {chars.map((_, i) => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: "50%",
            background: i < nextLetterIdxRef.current ? INK_COLORS[i % INK_COLORS.length] : "rgba(255,255,255,0.12)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>

      {/* Language attribution */}
      {langOpt && (
        <div style={{
          position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)",
          fontFamily: "'VT323', monospace", fontSize: 13,
          color: "rgba(255,255,255,0.18)", letterSpacing: 0.8,
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
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
      >
        ✕ skip
      </div>

      {/* Save — appears when all letters spawned */}
      {allSpawned && (
        <button onClick={() => onComplete(quote)} style={{
          position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)",
          background: "transparent",
          border: "1px solid rgba(244,201,127,0.4)",
          color: "rgba(244,201,127,0.85)",
          padding: "8px 34px",
          fontFamily: "'VT323', monospace", fontSize: 20,
          cursor: "pointer", letterSpacing: 1, borderRadius: 2,
          animation: "fadeInUp 0.6s ease both",
          zIndex: 9502,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,201,127,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          ✦ save this quote
        </button>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}

// ── Utility: hex color + alpha → rgba string
function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
