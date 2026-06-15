import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { LANGUAGE_OPTIONS, resolveLanguage } from "./quotes";

// Two-canvas approach:
// Canvas A (bottom): nature image + quote text, always fully drawn
// Canvas B (top):    grey Win95 tiles — revealed tiles are simply skipped (not drawn)
// Motion → mark tile revealed → it disappears from B → image shows through

const NATURE_IMAGES = [
  "https://images.unsplash.com/photo-1490750967868-88df5691cc99?w=1600&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1600&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=80",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1600&q=80",
  "https://images.unsplash.com/photo-1432958576632-8a39f6b97dc7?w=1600&q=80",
];

const TILE = 52;

interface Props {
  quote: string;
  language: string;
  onComplete: (quote: string) => void;
  onClose: () => void;
}

export function FallingLetters({ quote, language, onComplete, onClose }: Props) {
  // Two canvases
  const imgCanvasRef   = useRef<HTMLCanvasElement>(null); // bottom: image + quote
  const tileCanvasRef  = useRef<HTMLCanvasElement>(null); // top: grey tiles
  const videoRef       = useRef<HTMLVideoElement>(null);
  const motionRef      = useRef<HTMLCanvasElement>(null);
  const streamRef      = useRef<MediaStream | null>(null);
  const rafRef         = useRef<number>(0);
  const prevFrameRef   = useRef<Uint8ClampedArray | null>(null);
  const cameraReadyRef = useRef(false);
  const frameRef       = useRef(0);
  const imgRef         = useRef<HTMLImageElement | null>(null);
  const imgLoadedRef   = useRef(false);

  // Tile grid: flat boolean array (true = revealed)
  const revealedRef    = useRef<boolean[]>([]);
  const colsRef        = useRef(0);
  const rowsRef        = useRef(0);
  const revealCountRef = useRef(0);
  const totalRef       = useRef(1);

  // Word positions: wordIndex → tile linear index
  const wordTilesRef   = useRef<number[]>([]);

  const [cameraState, setCameraState] = useState<"idle"|"requesting"|"active"|"error"|"denied">("idle");
  const [showSave, setShowSave]       = useState(false);
  const [hint, setHint]               = useState(true);
  const imageUrl = useRef(NATURE_IMAGES[Math.floor(Math.random() * NATURE_IMAGES.length)]);

  const resolvedLang = resolveLanguage(language);
  const langOpt = LANGUAGE_OPTIONS.find(l => l.id === resolvedLang);
  const words = quote.split(" ").filter(Boolean);

  // ── Build grid
  const buildGrid = useCallback((cols: number, rows: number) => {
    const total = cols * rows;
    colsRef.current  = cols;
    rowsRef.current  = rows;
    totalRef.current = total;
    revealedRef.current   = new Array(total).fill(false);
    revealCountRef.current = 0;
    // Distribute words evenly
    const step = total / Math.max(words.length, 1);
    wordTilesRef.current = words.map((_, i) => Math.min(Math.round(step * i + step * 0.55), total - 1));
  }, [words]);

  // ── Draw image canvas (once per resize / image load)
  const drawImageCanvas = useCallback(() => {
    const canvas = imgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;

    // Background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, W, H);

    if (imgRef.current && imgLoadedRef.current) {
      const img = imgRef.current;
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }

    // Dark veil
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.fillRect(0, 0, W, H);

    // Quote words at their tile positions
    const cols = colsRef.current;
    wordTilesRef.current.forEach((tileIdx, wi) => {
      const col = tileIdx % cols;
      const row = Math.floor(tileIdx / cols);
      const cx  = col * TILE + TILE / 2;
      const cy  = row * TILE + TILE / 2;
      const word = words[wi];

      // Word background pill
      ctx.font = "italic 600 22px 'Fraunces', serif";
      const tw = ctx.measureText(word).width;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      // @ts-ignore
      ctx.roundRect(cx - tw / 2 - 10, cy - 16, tw + 20, 32, 6);
      ctx.fill();

      ctx.fillStyle   = "#FFFDF6";
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur  = 12;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(word, cx, cy);
      ctx.shadowBlur = 0;
    });
  }, [words]);

  // ── Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl.current;
    img.onload = () => {
      imgRef.current     = img;
      imgLoadedRef.current = true;
      drawImageCanvas();
    };
    img.onerror = () => {
      imgLoadedRef.current = false;
      drawImageCanvas();
    };
    imgRef.current = img;
  }, [drawImageCanvas]);

  // ── Resize handler
  useEffect(() => {
    const resize = () => {
      const W = window.innerWidth, H = window.innerHeight;
      if (imgCanvasRef.current)  { imgCanvasRef.current.width  = W; imgCanvasRef.current.height  = H; }
      if (tileCanvasRef.current) { tileCanvasRef.current.width = W; tileCanvasRef.current.height = H; }
      const cols = Math.ceil(W / TILE);
      const rows = Math.ceil(H / TILE);
      buildGrid(cols, rows);
      drawImageCanvas();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [buildGrid, drawImageCanvas]);

  // ── Reveal a tile
  const revealTile = useCallback((col: number, row: number) => {
    const cols = colsRef.current, rows = rowsRef.current;
    if (col < 0 || row < 0 || col >= cols || row >= rows) return;
    const idx = row * cols + col;
    if (revealedRef.current[idx]) return;
    revealedRef.current[idx] = true;
    revealCountRef.current++;
    if (revealCountRef.current > totalRef.current * 0.45) setShowSave(true);
    if (hint) setHint(false);
  }, [hint]);

  // ── Tile canvas render loop
  useEffect(() => {
    const canvas = tileCanvasRef.current;
    if (!canvas) return;

    const loop = () => {
      frameRef.current++;
      if (frameRef.current % 2 === 0 && cameraReadyRef.current) detectMotion();

      const ctx  = canvas.getContext("2d")!;
      const cols = colsRef.current;
      const rows = rowsRef.current;
      const W    = canvas.width;
      const H    = canvas.height;

      // Clear to transparent so image canvas shows through revealed tiles
      ctx.clearRect(0, 0, W, H);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          if (revealedRef.current[idx]) continue; // skip → image shows through

          const tx = c * TILE;
          const ty = r * TILE;

          // Win95 raised tile
          ctx.fillStyle = "#C0C0C0";
          ctx.fillRect(tx, ty, TILE, TILE);

          // Highlight top-left
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(tx,          ty,          TILE, 2);
          ctx.fillRect(tx,          ty,          2,    TILE);

          // Shadow bottom-right
          ctx.fillStyle = "#808080";
          ctx.fillRect(tx,          ty + TILE - 2, TILE, 2);
          ctx.fillRect(tx + TILE - 2, ty,          2,    TILE);

          ctx.fillStyle = "#404040";
          ctx.fillRect(tx + 1,       ty + TILE - 1, TILE - 1, 1);
          ctx.fillRect(tx + TILE - 1, ty + 1,       1,        TILE - 1);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Motion detection
  const detectMotion = () => {
    if (!videoRef.current || !motionRef.current) return;
    const mctx = motionRef.current.getContext("2d");
    if (!mctx) return;
    const MW = 64, MH = 48;
    motionRef.current.width  = MW;
    motionRef.current.height = MH;
    try { mctx.drawImage(videoRef.current, 0, 0, MW, MH); } catch { return; }
    let cur: Uint8ClampedArray;
    try { cur = mctx.getImageData(0, 0, MW, MH).data; } catch { return; }

    if (prevFrameRef.current) {
      const prev = prevFrameRef.current;
      const SW   = window.innerWidth;
      const SH   = window.innerHeight;
      for (let my = 0; my < MH; my++) {
        for (let mx = 0; mx < MW; mx++) {
          const i    = (my * MW + mx) * 4;
          const diff = Math.abs(cur[i]-prev[i]) + Math.abs(cur[i+1]-prev[i+1]) + Math.abs(cur[i+2]-prev[i+2]);
          if (diff > 20) {
            const sx  = (1 - mx / MW) * SW; // mirror x
            const sy  = (my / MH) * SH;
            const col = Math.floor(sx / TILE);
            const row = Math.floor(sy / TILE);
            revealTile(col, row);
            if (diff > 40) {
              revealTile(col-1, row); revealTile(col+1, row);
              revealTile(col, row-1); revealTile(col, row+1);
            }
            if (diff > 80) {
              revealTile(col-2, row); revealTile(col+2, row);
              revealTile(col, row-2); revealTile(col, row+2);
            }
          }
        }
      }
    }
    prevFrameRef.current = new Uint8ClampedArray(cur);
  };

  // ── Mouse fallback
  const handleMouseMove = (e: React.MouseEvent) => {
    if (cameraState === "active") return;
    const col = Math.floor(e.clientX / TILE);
    const row = Math.floor(e.clientY / TILE);
    revealTile(col, row);
    revealTile(col-1, row); revealTile(col+1, row);
    revealTile(col, row-1); revealTile(col, row+1);
  };

  // ── Camera
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
        const name = (err as {name?:string})?.name ?? "";
        setCameraState(name === "NotAllowedError" || name === "PermissionDeniedError" ? "denied" : "error");
      }
    };
    start();
    return () => { cameraReadyRef.current = false; streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  return createPortal(
    <div style={{ position:"fixed", inset:0, zIndex:9500, cursor: cameraState==="active"?"none":"default" }}
      onMouseMove={handleMouseMove}
    >
      {/* Bottom: image + quote */}
      <canvas ref={imgCanvasRef}  style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />
      {/* Top: tiles (transparent where revealed) */}
      <canvas ref={tileCanvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />

      <video  ref={videoRef}  muted playsInline style={{ display:"none" }} />
      <canvas ref={motionRef} style={{ display:"none" }} />

      {/* Loading */}
      {(cameraState==="idle" || cameraState==="requesting") && (
        <div style={{ position:"absolute", inset:0, background:"#C0C0C0",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, pointerEvents:"none" }}>
          <div style={{ width:40, height:40, border:"2px solid #808080", borderTopColor:"#000080", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
          <div style={{ fontFamily:"'VT323',monospace", fontSize:18, color:"#000080" }}>opening the lens...</div>
        </div>
      )}

      {/* Hint */}
      {hint && cameraState==="active" && (
        <div style={{ position:"absolute", bottom:100, left:"50%", transform:"translateX(-50%)",
          background:"rgba(0,0,128,0.9)", color:"#fff", fontFamily:"'VT323',monospace", fontSize:18,
          padding:"10px 24px", letterSpacing:0.8, border:"2px solid", borderColor:"#fff #555 #555 #fff",
          pointerEvents:"none", whiteSpace:"nowrap", animation:"fadeInUp 0.6s ease both" }}>
          ✋ move your body — uncover the message
        </div>
      )}
      {hint && (cameraState==="denied" || cameraState==="error") && (
        <div style={{ position:"absolute", bottom:100, left:"50%", transform:"translateX(-50%)",
          background:"rgba(0,0,128,0.9)", color:"#fff", fontFamily:"'VT323',monospace", fontSize:18,
          padding:"10px 24px", letterSpacing:0.8, border:"2px solid", borderColor:"#fff #555 #555 #fff",
          pointerEvents:"none", whiteSpace:"nowrap" }}>
          🖱 move your mouse to uncover
        </div>
      )}

      {langOpt && (
        <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)",
          fontFamily:"'VT323',monospace", fontSize:13, color:"rgba(255,255,255,0.25)",
          letterSpacing:0.8, whiteSpace:"nowrap", pointerEvents:"none" }}>
          {langOpt.flag} {langOpt.label}
        </div>
      )}

      {/* Skip */}
      <div onClick={onClose} style={{ position:"fixed", top:22, right:26,
        fontFamily:"'VT323',monospace", fontSize:15, color:"rgba(255,255,255,0.45)",
        cursor:"pointer", transition:"color 0.2s", zIndex:9501, letterSpacing:0.5 }}
        onMouseEnter={e=>(e.currentTarget.style.color="#fff")}
        onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.45)")}
      >
        ✕ skip
      </div>

      {/* Save */}
      {showSave && (
        <button onClick={()=>onComplete(quote)} style={{ position:"fixed", bottom:18,
          left:"50%", transform:"translateX(-50%)",
          background:"#C0C0C0", border:"2px solid", borderColor:"#fff #555 #555 #fff",
          color:"#000", padding:"8px 32px", fontFamily:"'VT323',monospace",
          fontSize:20, cursor:"pointer", letterSpacing:1, boxShadow:"2px 2px 0 #808080",
          animation:"fadeInUp 0.5s ease both", zIndex:9502, whiteSpace:"nowrap" }}
          onMouseDown={e=>{e.currentTarget.style.borderColor="#555 #fff #fff #555";}}
          onMouseUp={e=>{e.currentTarget.style.borderColor="#fff #555 #555 #fff";}}
        >
          ✦ save this quote
        </button>
      )}

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateX(-50%) translateY(12px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
