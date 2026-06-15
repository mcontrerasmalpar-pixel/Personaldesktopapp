import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { LANGUAGE_OPTIONS, resolveLanguage } from "./quotes";

const NATURE_IMAGES = [
  "https://images.unsplash.com/photo-1490750967868-88df5691cc99?w=1600&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1600&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=80",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1600&q=80",
  "https://images.unsplash.com/photo-1432958576632-8a39f6b97dc7?w=1600&q=80",
];

const TILE_SIZE = 52;

interface Tile {
  col: number;
  row: number;
  revealed: boolean;
  flipProgress: number;
  wordIndex: number;
}

interface Props {
  quote: string;
  language: string;
  onComplete: (quote: string) => void;
  onClose: () => void;
}

export function FallingLetters({ quote, language, onComplete, onClose }: Props) {
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const videoRef         = useRef<HTMLVideoElement>(null);
  const motionCanvasRef  = useRef<HTMLCanvasElement>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const rafRef           = useRef<number>(0);
  const prevFrameRef     = useRef<Uint8ClampedArray | null>(null);
  const cameraReadyRef   = useRef(false);
  const frameRef         = useRef(0);
  const imgRef           = useRef<HTMLImageElement | null>(null);
  const imgLoadedRef     = useRef(false);
  const tilesRef         = useRef<Tile[][]>([]);
  const revealedCountRef = useRef(0);
  const totalTilesRef    = useRef(1);
  const imageUrl         = useRef(NATURE_IMAGES[Math.floor(Math.random() * NATURE_IMAGES.length)]);

  const [cameraState, setCameraState] = useState<"idle"|"requesting"|"active"|"error"|"denied">("idle");
  const [showSave, setShowSave]       = useState(false);
  const [hint, setHint]               = useState(true);

  const resolvedLang = resolveLanguage(language);
  const langOpt      = LANGUAGE_OPTIONS.find(l => l.id === resolvedLang);
  const words        = quote.split(" ").filter(Boolean);

  // Build tile grid
  const buildGrid = useCallback((cols: number, rows: number) => {
    const total = cols * rows;
    totalTilesRef.current = total;
    const step = Math.floor(total / Math.max(words.length, 1));
    const wordTileIndices = new Set<number>();
    for (let i = 0; i < words.length; i++) {
      wordTileIndices.add(Math.min(Math.round(step * i + step * 0.6), total - 1));
    }
    const wordTileArr = Array.from(wordTileIndices);
    const grid: Tile[][] = [];
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        grid[r][c] = { col: c, row: r, revealed: false, flipProgress: 0, wordIndex: wordTileArr.indexOf(idx) };
        idx++;
      }
    }
    tilesRef.current = grid;
  }, [words]);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl.current;
    img.onload  = () => { imgRef.current = img; imgLoadedRef.current = true; };
    img.onerror = () => { imgLoadedRef.current = false; };
    imgRef.current = img;
  }, []);

  // Reveal tile
  const revealTile = useCallback((col: number, row: number) => {
    const grid = tilesRef.current;
    if (!grid[row]?.[col]) return;
    const tile = grid[row][col];
    if (!tile.revealed) {
      tile.revealed = true;
      revealedCountRef.current++;
      if (revealedCountRef.current > totalTilesRef.current * 0.5) setShowSave(true);
      if (hint) setHint(false);
    }
  }, [hint]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const cols = Math.ceil(canvas.width  / TILE_SIZE);
      const rows = Math.ceil(canvas.height / TILE_SIZE);
      buildGrid(cols, rows);
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      frameRef.current++;
      const W = canvas.width, H = canvas.height;
      const cols = Math.ceil(W / TILE_SIZE);
      const rows = Math.ceil(H / TILE_SIZE);

      if (frameRef.current % 2 === 0 && cameraReadyRef.current) detectMotion(cols, rows);

      // Always paint solid dark background first — no bleed-through
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, W, H);

      // Draw nature image cover-fit
      if (imgRef.current && imgLoadedRef.current) {
        const img = imgRef.current;
        const iw = img.naturalWidth, ih = img.naturalHeight;
        const scale = Math.max(W / iw, H / ih);
        const dw = iw * scale, dh = ih * scale;
        ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
        ctx.fillStyle = "rgba(0,0,0,0.38)";
        ctx.fillRect(0, 0, W, H);
      }

      // Draw tiles on top
      const grid = tilesRef.current;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tile = grid[r]?.[c];
          if (!tile) continue;

          if (tile.revealed && tile.flipProgress < 1) {
            tile.flipProgress = Math.min(1, tile.flipProgress + 0.14);
          }

          const fp  = tile.flipProgress;
          const tx  = c * TILE_SIZE;
          const ty  = r * TILE_SIZE;
          const mid = tx + TILE_SIZE / 2;

          if (fp < 1) {
            const scaleX = fp < 0.5 ? 1 - fp * 2 : (fp - 0.5) * 2;
            ctx.save();
            ctx.translate(mid, ty);
            ctx.scale(scaleX, 1);

            if (fp < 0.5) {
              // Tile face
              ctx.fillStyle = "#C0C0C0";
              ctx.fillRect(-TILE_SIZE / 2, 0, TILE_SIZE, TILE_SIZE);
              // Highlight (top-left)
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(-TILE_SIZE / 2, 0, TILE_SIZE, 2);
              ctx.fillRect(-TILE_SIZE / 2, 0, 2, TILE_SIZE);
              // Shadow (bottom-right)
              ctx.fillStyle = "#808080";
              ctx.fillRect(-TILE_SIZE / 2, TILE_SIZE - 2, TILE_SIZE, 2);
              ctx.fillRect(TILE_SIZE / 2 - 2, 0, 2, TILE_SIZE);
              ctx.fillStyle = "#404040";
              ctx.fillRect(-TILE_SIZE / 2 + 1, TILE_SIZE - 1, TILE_SIZE - 1, 1);
              ctx.fillRect(TILE_SIZE / 2 - 1, 1, 1, TILE_SIZE - 1);
            }
            ctx.restore();
          }

          // Draw word
          if (tile.wordIndex >= 0 && tile.revealed && words[tile.wordIndex]) {
            const wordOpacity = Math.max(0, (fp - 0.5) * 2);
            if (wordOpacity > 0) {
              ctx.save();
              ctx.globalAlpha    = wordOpacity;
              ctx.font           = `italic 26px 'Fraunces', serif`;
              ctx.fillStyle      = "#FFFDF6";
              ctx.shadowColor    = "rgba(0,0,0,0.95)";
              ctx.shadowBlur     = 16;
              ctx.textAlign      = "center";
              ctx.textBaseline   = "middle";
              ctx.fillText(words[tile.wordIndex], tx + TILE_SIZE / 2, ty + TILE_SIZE / 2);
              ctx.restore();
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, [buildGrid, words, hint]);

  // Motion detection
  const detectMotion = (cols: number, rows: number) => {
    if (!videoRef.current || !motionCanvasRef.current) return;
    const mctx = motionCanvasRef.current.getContext("2d");
    if (!mctx) return;
    const MW = 64, MH = 48;
    motionCanvasRef.current.width  = MW;
    motionCanvasRef.current.height = MH;
    try { mctx.drawImage(videoRef.current, 0, 0, MW, MH); } catch { return; }
    let current: Uint8ClampedArray;
    try { current = mctx.getImageData(0, 0, MW, MH).data; } catch { return; }

    if (prevFrameRef.current) {
      const prev = prevFrameRef.current;
      const SW = window.innerWidth, SH = window.innerHeight;
      for (let my = 0; my < MH; my++) {
        for (let mx = 0; mx < MW; mx++) {
          const pidx = (my * MW + mx) * 4;
          const diff =
            Math.abs(current[pidx]   - prev[pidx])   +
            Math.abs(current[pidx+1] - prev[pidx+1]) +
            Math.abs(current[pidx+2] - prev[pidx+2]);
          if (diff > 22) {
            const sx = (1 - mx / MW) * SW;
            const sy = (my / MH) * SH;
            const col = Math.floor(sx / TILE_SIZE);
            const row = Math.floor(sy / TILE_SIZE);
            revealTile(col, row);
            if (diff > 45) {
              revealTile(col - 1, row); revealTile(col + 1, row);
              revealTile(col, row - 1); revealTile(col, row + 1);
            }
          }
        }
      }
    }
    prevFrameRef.current = new Uint8ClampedArray(current);
  };

  // Mouse fallback
  const handleMouseMove = (e: React.MouseEvent) => {
    if (cameraState === "active") return;
    const col = Math.floor(e.clientX / TILE_SIZE);
    const row = Math.floor(e.clientY / TILE_SIZE);
    revealTile(col, row);
    revealTile(col - 1, row); revealTile(col + 1, row);
    revealTile(col, row - 1); revealTile(col, row + 1);
  };

  // Camera
  useEffect(() => {
    const start = async () => {
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
    start();
    return () => { cameraReadyRef.current = false; streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9500, cursor: cameraState === "active" ? "none" : "default" }}
      onMouseMove={handleMouseMove}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <video ref={videoRef} muted playsInline style={{ display: "none" }} />
      <canvas ref={motionCanvasRef} style={{ display: "none" }} />

      {/* Loading */}
      {(cameraState === "idle" || cameraState === "requesting") && (
        <div style={{
          position: "absolute", inset: 0,
          background: "#C0C0C0",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
          pointerEvents: "none",
        }}>
          <div style={{ width: 40, height: 40, border: "2px solid #808080", borderTopColor: "#000080", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 18, color: "#000080" }}>opening the lens...</div>
        </div>
      )}

      {/* Hint */}
      {hint && cameraState === "active" && (
        <div style={{
          position: "absolute", bottom: 100, left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,128,0.9)", color: "#fff",
          fontFamily: "'VT323', monospace", fontSize: 18,
          padding: "10px 24px", letterSpacing: 0.8,
          border: "2px solid", borderColor: "#fff #555 #555 #fff",
          pointerEvents: "none", whiteSpace: "nowrap",
          animation: "fadeInUp 0.6s ease both",
        }}>
          ✋ move your body — uncover the message
        </div>
      )}

      {hint && (cameraState === "denied" || cameraState === "error") && (
        <div style={{
          position: "absolute", bottom: 100, left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,128,0.9)", color: "#fff",
          fontFamily: "'VT323', monospace", fontSize: 18,
          padding: "10px 24px", letterSpacing: 0.8,
          border: "2px solid", borderColor: "#fff #555 #555 #fff",
          pointerEvents: "none", whiteSpace: "nowrap",
        }}>
          🖱 move your mouse to uncover
        </div>
      )}

      {langOpt && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          fontFamily: "'VT323', monospace", fontSize: 13,
          color: "rgba(255,255,255,0.25)", letterSpacing: 0.8,
          whiteSpace: "nowrap", pointerEvents: "none",
        }}>
          {langOpt.flag} {langOpt.label}
        </div>
      )}

      {/* Skip */}
      <div onClick={onClose} style={{
        position: "fixed", top: 22, right: 26,
        fontFamily: "'VT323', monospace", fontSize: 15,
        color: "rgba(255,255,255,0.4)", cursor: "pointer",
        transition: "color 0.2s", zIndex: 9501, letterSpacing: 0.5,
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
      >
        ✕ skip
      </div>

      {/* Save */}
      {showSave && (
        <button onClick={() => onComplete(quote)} style={{
          position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)",
          background: "#C0C0C0",
          border: "2px solid", borderColor: "#fff #555 #555 #fff",
          color: "#000",
          padding: "8px 32px",
          fontFamily: "'VT323', monospace", fontSize: 20,
          cursor: "pointer", letterSpacing: 1,
          boxShadow: "2px 2px 0 #808080",
          animation: "fadeInUp 0.5s ease both",
          zIndex: 9502, whiteSpace: "nowrap",
        }}
          onMouseDown={e  => { e.currentTarget.style.borderColor = "#555 #fff #fff #555"; }}
          onMouseUp={e    => { e.currentTarget.style.borderColor = "#fff #555 #555 #fff"; }}
        >
          ✦ save this quote
        </button>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateX(-50%) translateY(12px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
