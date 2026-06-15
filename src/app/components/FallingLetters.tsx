import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LANGUAGE_OPTIONS, resolveLanguage } from "./quotes";

const RANSOM_FONTS = [
  "'Alfa Slab One', serif",
  "'Abril Fatface', cursive",
  "'Pacifico', cursive",
  "'Lobster', cursive",
  "'Comic Neue', cursive",
  "'Courier Prime', monospace",
  "'VT323', monospace",
];

const RANSOM_COLORS = [
  "#000000", "#CC0000", "#000080", "#1a6b2a",
  "#FF6B9D", "#4D9DE0", "#E15FED", "#8B4513",
];

interface Particle {
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  font: string;
  size: number;
  color: string;
  rotation: number;
  rotVel: number;
  landed: boolean;
  startTime: number;
  isSpace: boolean;
}

interface DragState {
  idx: number;
  offsetX: number;
  offsetY: number;
  lastX: number;
  lastY: number;
  velX: number;
  velY: number;
}

function initParticles(quote: string): Particle[] {
  const t0 = performance.now();
  return quote.split("").map((char, i) => ({
    char,
    x: 60 + Math.random() * (window.innerWidth - 120),
    y: -60 - Math.random() * 200,
    vx: (Math.random() - 0.5) * 2,
    vy: 0.5 + Math.random() * 1.5,
    font: RANSOM_FONTS[Math.floor(Math.random() * RANSOM_FONTS.length)],
    size: 24 + Math.floor(Math.random() * 20),
    color: char.trim() === "" ? "transparent" : RANSOM_COLORS[Math.floor(Math.random() * RANSOM_COLORS.length)],
    rotation: (Math.random() - 0.5) * 25,
    rotVel: (Math.random() - 0.5) * 2,
    landed: false,
    startTime: t0 + i * 180,
    isSpace: char.trim() === "",
  }));
}

interface FallingLettersProps {
  quote: string;
  language: string;
  onComplete: (quote: string) => void;
  onClose: () => void;
}

export function FallingLetters({ quote, language, onComplete, onClose }: FallingLettersProps) {
  // Lazy-initialize particles once (synchronous, before first render)
  const particlesRef = useRef<Particle[] | null>(null);
  if (particlesRef.current === null) {
    particlesRef.current = initParticles(quote);
  }
  const particles = particlesRef.current;

  const letterEls = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const frameCountRef = useRef(0);
  const cameraReadyRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [cameraRequested, setCameraRequested] = useState(false);

  // Physics + motion detection loop
  useEffect(() => {
    const FLOOR = window.innerHeight - 110;

    const detectMotion = () => {
      if (!cameraReadyRef.current || !videoRef.current || !motionCanvasRef.current) return;
      const ctx = motionCanvasRef.current.getContext("2d");
      if (!ctx) return;

      const W = 40, H = 30;
      motionCanvasRef.current.width = W;
      motionCanvasRef.current.height = H;

      try {
        ctx.drawImage(videoRef.current, 0, 0, W, H);
      } catch { return; }

      let current: Uint8ClampedArray;
      try {
        current = ctx.getImageData(0, 0, W, H).data;
      } catch { return; }

      if (prevFrameRef.current) {
        const prev = prevFrameRef.current;
        for (let py = 0; py < H; py += 2) {
          for (let px = 0; px < W; px += 2) {
            const idx = (py * W + px) * 4;
            const diff =
              Math.abs(current[idx]   - prev[idx]) +
              Math.abs(current[idx+1] - prev[idx+1]) +
              Math.abs(current[idx+2] - prev[idx+2]);

            if (diff > 40) {
              // Camera feed is mirrored — flip x
              const screenX = (1 - px / W) * window.innerWidth;
              const screenY = (py / H) * window.innerHeight;

              for (const p of particles) {
                if (p.isSpace) continue;
                const dx = p.x - screenX;
                const dy = p.y - screenY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100 && dist > 1) {
                  p.vx += (dx / dist) * 4;
                  p.vy += (dy / dist) * 2;
                  p.landed = false;
                }
              }
            }
          }
        }
      }

      prevFrameRef.current = new Uint8ClampedArray(current);
    };

    const loop = (ts: number) => {
      frameCountRef.current++;
      if (frameCountRef.current % 3 === 0) detectMotion();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.isSpace || ts < p.startTime) continue;
        if (dragRef.current?.idx === i) continue;

        if (!p.landed) {
          p.vy = Math.min(p.vy + 0.22, 14);
          p.y += p.vy;
          p.x += p.vx;
          p.vx *= 0.99;
          p.rotation += p.rotVel;
          p.rotVel *= 0.97;

          if (p.y >= FLOOR) {
            p.y = FLOOR;
            p.vy *= -0.22;
            p.vx *= 0.75;
            if (Math.abs(p.vy) < 0.8) { p.vy = 0; p.landed = true; }
          }
          if (p.x < 5)                    { p.x = 5;                    p.vx =  Math.abs(p.vx) * 0.5; }
          if (p.x > window.innerWidth - 45) { p.x = window.innerWidth - 45; p.vx = -Math.abs(p.vx) * 0.5; }
        }

        const el = letterEls.current[i];
        if (el) el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [particles]);

  // Camera — manual activation
  const startCamera = async () => {
    if (!navigator.mediaDevices) {
      setCameraError(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 160, height: 120, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().then(() => { cameraReadyRef.current = true; }).catch(() => {});
      }
      setCameraActive(true);
    } catch {
      setCameraError(true);
    }
  };

  useEffect(() => {
    return () => {
      cameraReadyRef.current = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Mouse drag interaction
  const handleMouseDown = (i: number, e: React.MouseEvent) => {
    e.preventDefault();
    const p = particles[i];
    p.landed = false;
    dragRef.current = {
      idx: i,
      offsetX: e.clientX - p.x,
      offsetY: e.clientY - p.y,
      lastX: e.clientX,
      lastY: e.clientY,
      velX: 0,
      velY: 0,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const d = dragRef.current;
    const p = particles[d.idx];
    d.velX = e.clientX - d.lastX;
    d.velY = e.clientY - d.lastY;
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    p.x = e.clientX - d.offsetX;
    p.y = e.clientY - d.offsetY;
    const el = letterEls.current[d.idx];
    if (el) el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
  };

  const handleMouseUp = () => {
    if (!dragRef.current) return;
    const { idx, velX, velY } = dragRef.current;
    particles[idx].vx = velX * 0.5;
    particles[idx].vy = velY * 0.5;
    dragRef.current = null;
  };

  const resolvedLang = resolveLanguage(language);
  const langOpt = LANGUAGE_OPTIONS.find(l => l.id === resolvedLang);

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(255,255,255,0.87)",
        backdropFilter: "blur(3px)",
        zIndex: 9500,
        overflow: "hidden",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Camera feed — shown in corner, also used for motion detection */}
      <video
        ref={videoRef}
        muted
        playsInline
        style={{
          position: "fixed",
          bottom: 72,
          right: 20,
          width: 80,
          height: 60,
          borderRadius: 6,
          opacity: cameraActive ? 0.45 : 0,
          transform: "scaleX(-1)",
          objectFit: "cover",
          border: "1px solid rgba(0,0,0,0.15)",
          transition: "opacity 0.4s",
          pointerEvents: "none",
        }}
      />

      {/* Hidden canvas for motion pixel comparison */}
      <canvas ref={motionCanvasRef} style={{ display: "none" }} />

      {/* Letter particles */}
      {particles.map((p, i) =>
        p.isSpace ? null : (
          <div
            key={i}
            ref={el => { letterEls.current[i] = el; }}
            onMouseDown={e => handleMouseDown(i, e)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`,
              fontFamily: p.font,
              fontSize: p.size,
              color: p.color,
              cursor: "grab",
              userSelect: "none",
              willChange: "transform",
              lineHeight: 1,
              whiteSpace: "nowrap",
              WebkitTextStroke: "0.4px rgba(0,0,0,0.08)",
            } as React.CSSProperties}
          >
            {p.char}
          </div>
        )
      )}

      {/* Language attribution — bottom left, subtle */}
      {langOpt && (
        <div
          style={{
            position: "fixed",
            bottom: 72,
            left: 20,
            fontFamily: "'VT323', monospace",
            fontSize: 14,
            color: "rgba(0,0,0,0.28)",
            pointerEvents: "none",
            letterSpacing: 0.5,
          }}
        >
          {langOpt.flag} {langOpt.label} · figure it out ✦
        </div>
      )}

      {/* Camera interaction hint */}
      {cameraActive && (
        <div
          style={{
            position: "fixed",
            bottom: 136,
            right: 20,
            fontFamily: "'VT323', monospace",
            fontSize: 11,
            color: "rgba(0,0,0,0.3)",
            pointerEvents: "none",
            textAlign: "right",
          }}
        >
          move your hands ✦
        </div>
      )}

      {/* Manual camera activate button */}
      {!cameraActive && !cameraError && !cameraRequested && (
        <button
          onClick={() => { setCameraRequested(true); startCamera(); }}
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            fontFamily: "'VT323', monospace",
            fontSize: 16,
            background: "#C0C0C0",
            border: "2px solid",
            borderColor: "#fff #555 #555 #fff",
            padding: "4px 12px",
            cursor: "pointer",
            zIndex: 9501,
          }}
        >
          📷 activate camera
        </button>
      )}

      {/* Camera error notice */}
      {cameraError && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            fontFamily: "'VT323', monospace",
            fontSize: 13,
            color: "#CC0000",
            background: "#fff",
            border: "1px solid #CC0000",
            padding: "4px 8px",
            zIndex: 9501,
          }}
        >
          📷 camera unavailable — use mouse to catch words
        </div>
      )}

      {/* Skip */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 20,
          right: 24,
          fontFamily: "'VT323', monospace",
          fontSize: 17,
          color: "#808080",
          cursor: "pointer",
          letterSpacing: 0.5,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "#000")}
        onMouseLeave={e => (e.currentTarget.style.color = "#808080")}
      >
        ✕ skip
      </div>

      {/* Save button */}
      <button
        onClick={() => onComplete(quote)}
        style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#C0C0C0",
          border: "2px solid",
          borderColor: "#fff #555 #555 #fff",
          padding: "6px 28px",
          fontFamily: "'VT323', monospace",
          fontSize: 20,
          cursor: "pointer",
          boxShadow: "2px 2px 0 #808080",
          whiteSpace: "nowrap",
        }}
      >
        ✦ save this quote
      </button>
    </div>,
    document.body
  );
}
