import React, { useState, useEffect, useRef, useCallback } from "react";
import { CompanionPickerModal } from "./CompanionPicker";

const TOMODACHI = ["#E76F51", "#E9C46A", "#2A9D8F", "#264653", "#E63946", "#F4A261"];
const PENTATONIC = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

interface Props {
  onLogin: (username: string, snapshot: string | null) => void;
}

export function LoginScreen({ onLogin }: Props) {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const blobCanvasRef = useRef<HTMLCanvasElement>(null);

  const audioCtxRef    = useRef<AudioContext | null>(null);
  const dragOscRef     = useRef<OscillatorNode | null>(null);
  const dragGainRef    = useRef<GainNode | null>(null);
  const strokeColorRef = useRef(0);
  const isDrawingRef   = useRef(false);
  const lastPosRef     = useRef<{ x: number; y: number } | null>(null);

  const blobsRef = useRef<{ x: number; y: number; r: number; color: string; points: number[]; opacity: number }[]>([]);
  const rafRef   = useRef<number>(0);

  const [username, setUsername]               = useState("");
  const [password, setPassword]               = useState("");
  const [error, setError]                     = useState("");
  const [btnPressed, setBtnPressed]           = useState(false);
  const [showCompanionPicker, setShowCompanionPicker] = useState(false);
  const [pendingUsername, setPendingUsername]         = useState("");

  // ── Canvas resize ────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
      const blobCanvas = blobCanvasRef.current;
      if (blobCanvas) { blobCanvas.width = window.innerWidth; blobCanvas.height = window.innerHeight; }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ── Blob animation ───────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const canvas = blobCanvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const alive: typeof blobsRef.current = [];
        for (const b of blobsRef.current) {
          b.opacity -= 0.003;
          if (b.opacity > 0) {
            ctx.save(); ctx.globalAlpha = b.opacity; ctx.fillStyle = b.color;
            ctx.beginPath();
            const pts = b.points; const n = pts.length / 2;
            for (let i = 0; i < n; i++) {
              const angle = (i / n) * Math.PI * 2;
              const r = b.r + pts[i * 2];
              const x = b.x + Math.cos(angle) * r;
              const y = b.y + Math.sin(angle) * r;
              if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath(); ctx.fill(); ctx.restore(); alive.push(b);
          }
        }
        blobsRef.current = alive;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Audio ────────────────────────────────────────────────────────────────
  const initAudio = () => {
    if (!audioCtxRef.current)
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  };
  const yToFreq = (y: number) => {
    const h = canvasRef.current?.height ?? window.innerHeight;
    const idx = Math.floor((1 - y / h) * PENTATONIC.length);
    return PENTATONIC[Math.max(0, Math.min(PENTATONIC.length - 1, idx))];
  };
  const playTone = (freq: number, dur = 0.3) => {
    const ctx = audioCtxRef.current; if (!ctx) return;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine"; osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(); osc.stop(ctx.currentTime + dur);
  };
  const startDragTone = (freq: number) => {
    const ctx = audioCtxRef.current; if (!ctx) return;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "triangle"; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime); osc.start();
    dragOscRef.current = osc; dragGainRef.current = gain;
  };
  const updateDragTone = (freq: number, speed: number) => {
    const osc = dragOscRef.current; const gain = dragGainRef.current; const ctx = audioCtxRef.current;
    if (!osc || !gain || !ctx) return;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.value = Math.min(0.3, 0.05 + speed * 0.005);
  };
  const stopDragTone = () => {
    const gain = dragGainRef.current; const osc = dragOscRef.current; const ctx = audioCtxRef.current;
    if (gain && ctx) gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    if (osc && ctx) osc.stop(ctx.currentTime + 0.1);
    dragOscRef.current = null; dragGainRef.current = null;
  };

  // ── Drawing ──────────────────────────────────────────────────────────────
  const spawnBlob = (x: number, y: number) => {
    const r = 30 + Math.random() * 40; const n = 12; const points: number[] = [];
    for (let i = 0; i < n; i++) points.push(Math.random() * 15 - 7, 0);
    blobsRef.current.push({ x, y, r, color: TOMODACHI[Math.floor(Math.random() * TOMODACHI.length)], points, opacity: 0.85 });
  };
  const getCanvasPos = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) };
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    initAudio();
    const { x, y } = getCanvasPos(e.clientX, e.clientY);
    isDrawingRef.current = true;
    lastPosRef.current = { x, y };
    // FIX: beginPath + moveTo aquí, sin lineTo todavía — evita el punto inicial
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) { ctx.beginPath(); ctx.moveTo(x, y); }
    startDragTone(yToFreq(y));
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const { x, y } = getCanvasPos(e.clientX, e.clientY);
    const last = lastPosRef.current;
    // FIX: si no hay last, solo mueve sin dibujar — evita punto al reanudar
    if (!last) { ctx.beginPath(); ctx.moveTo(x, y); lastPosRef.current = { x, y }; return; }
    const dx = x - last.x, dy = y - last.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    // Solo dibuja si hay movimiento real (evita punto estático)
    if (speed < 0.5) return;
    const lw = Math.max(2, Math.min(12, 20 - speed * 0.3));
    const color = TOMODACHI[strokeColorRef.current % TOMODACHI.length];
    ctx.lineWidth = lw; ctx.strokeStyle = color;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.shadowBlur = 12; ctx.shadowColor = color;
    ctx.lineTo(x, y); ctx.stroke();
    ctx.shadowBlur = 0;
    // FIX: beginPath + moveTo después de stroke para no acumular path anterior
    ctx.beginPath(); ctx.moveTo(x, y);
    updateDragTone(yToFreq(y), speed);
    lastPosRef.current = { x, y };
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDrawingRef.current) return;
    const { x, y } = getCanvasPos(e.clientX, e.clientY);
    const last = lastPosRef.current;
    const dist = last ? Math.hypot(x - last.x, y - last.y) : 0;
    if (dist < 6) { spawnBlob(x, y); playTone(yToFreq(y)); }
    else { strokeColorRef.current++; }
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.beginPath();
    stopDragTone();
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.beginPath();
    stopDragTone();
    isDrawingRef.current = false;
    lastPosRef.current = null;
    strokeColorRef.current++;
  }, []);

  const toMouse = (touch: React.Touch) => ({ clientX: touch.clientX, clientY: touch.clientY });
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => { e.preventDefault(); handleMouseDown({ ...toMouse(e.touches[0]) } as React.MouseEvent<HTMLCanvasElement>); };
  const handleTouchMove  = (e: React.TouchEvent<HTMLCanvasElement>) => { e.preventDefault(); handleMouseMove({ ...toMouse(e.touches[0]) } as React.MouseEvent<HTMLCanvasElement>); };
  const handleTouchEnd   = (e: React.TouchEvent<HTMLCanvasElement>) => { e.preventDefault(); handleMouseUp({ ...toMouse(e.changedTouches[0]) } as React.MouseEvent<HTMLCanvasElement>); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError("Please enter both fields to continue."); return; }
    setError("");
    const name = username.trim();
    const snapshot = canvasRef.current?.toDataURL("image/png") ?? null;
    if (!localStorage.getItem("personalos_companion")) {
      setPendingUsername(name); setShowCompanionPicker(true);
    } else { onLogin(name, snapshot); }
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", overflow: "hidden", background: "#FFFFFF" }}>
      <canvas ref={blobCanvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, display: "block", pointerEvents: "none" }} />
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        style={{ position: "fixed", inset: 0, zIndex: 1, display: "block", touchAction: "none", background: "transparent" }}
      />
      <div style={{ position: "fixed", inset: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ pointerEvents: "all", marginBottom: 12, fontFamily: "'VT323', monospace", fontSize: 28, color: "#000080", textAlign: "center", letterSpacing: 1 }}>
          Welcome to Personal OS
        </div>
        <div style={{ pointerEvents: "all", width: 340, border: "2px solid", borderColor: "#fff #555 #555 #fff", boxShadow: "4px 4px 10px rgba(0,0,0,0.6)" }}>
          <div style={{ background: "linear-gradient(90deg, #000080, #1084D0)", color: "#fff", padding: "5px 8px", fontFamily: "'VT323', monospace", fontSize: 18, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>🖥️</span>
            Personal OS — Login
            <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
              {["#C0C0C0","#C0C0C0","#C0C0C0"].map((c,i)=>(
                <div key={i} style={{ width: 14, height: 14, background: c, border: "2px solid", borderColor: "#fff #555 #555 #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontFamily: "monospace" }}>
                  {i===2?"✕":i===1?"□":"_"}
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#C0C0C0", padding: 16 }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: "#000", marginBottom: 4 }}>User name:</div>
                <input value={username} onChange={e=>setUsername(e.target.value)} autoComplete="off" spellCheck={false} placeholder="who are you today?" style={xpInputStyle}/>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: "#000", marginBottom: 4 }}>Password:</div>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="your secret" style={xpInputStyle}/>
              </div>
              {error && <div style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: "#CC0000", marginBottom: 10 }}>⚠ {error}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="submit" onMouseDown={()=>setBtnPressed(true)} onMouseUp={()=>setBtnPressed(false)} onMouseLeave={()=>setBtnPressed(false)}
                  style={{ ...xpBtnStyle, borderColor: btnPressed?"#555 #fff #fff #555":"#fff #555 #555 #fff", transform: btnPressed?"translate(1px,1px)":"none", minWidth: 80, fontFamily: "'VT323', monospace", fontSize: 17 }}>
                  OK
                </button>
                <button type="button" onClick={()=>{setUsername("");setPassword("");setError("");}} style={{ ...xpBtnStyle, minWidth: 80, fontFamily: "'VT323', monospace", fontSize: 17 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
        <div style={{ pointerEvents: "none", marginTop: 14, fontFamily: "'VT323', monospace", fontSize: 15, color: "rgba(0,0,128,0.5)", textAlign: "center" }}>
          draw on the screen before entering ✦
        </div>
      </div>
      {showCompanionPicker && (
        <CompanionPickerModal
          onConfirm={id=>{ localStorage.setItem("personalos_companion",id); setShowCompanionPicker(false); onLogin(pendingUsername, canvasRef.current?.toDataURL("image/png")??null); }}
          onSkip={()=>{ setShowCompanionPicker(false); onLogin(pendingUsername, canvasRef.current?.toDataURL("image/png")??null); }}
        />
      )}
    </div>
  );
}

const xpInputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", background: "#fff", border: "2px solid", borderColor: "#555 #fff #fff #555", fontFamily: "'VT323', monospace", fontSize: 17, padding: "3px 6px", outline: "none", color: "#000" };
const xpBtnStyle: React.CSSProperties = { background: "#C0C0C0", border: "2px solid", borderColor: "#fff #555 #555 #fff", fontFamily: "'VT323', monospace", fontSize: 16, cursor: "pointer", padding: "4px 14px", color: "#000" };
