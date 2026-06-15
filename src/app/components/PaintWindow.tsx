import React, { useRef, useEffect, useState } from "react";
import { DraggableWindow } from "./DraggableWindow";

const PALETTE: string[] = [
  "#000000", "#ffffff", "#808080", "#c0c0c0",
  "#800000", "#ff0000", "#800080", "#ff00ff",
  "#008000", "#00ff00", "#808000", "#ffff00",
  "#000080", "#0000ff", "#008080", "#00ffff",
];

const TOOLS = [
  { id: "brush",  label: "✏️", title: "Brush" },
  { id: "eraser", label: "🧹", title: "Eraser" },
  { id: "text",   label: "A",  title: "Text" },
  { id: "fill",   label: "🪣", title: "Fill" },
  { id: "line",   label: "╱",  title: "Line" },
];

const BRUSH_SIZES = [
  { px: 2, label: "S" },
  { px: 5, label: "M" },
  { px: 10, label: "L" },
];

const CANVAS_W = 400;
const CANVAS_H = 270;

interface Props {
  photoUrl: string;
  onSave: (dataUrl: string) => void;
  onClose: () => void;
  zIndex?: number;
}

export function PaintWindow({ photoUrl, onSave, onClose, zIndex = 5000 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);
  const [tool, setTool]       = useState("brush");
  const [color, setColor]     = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [coords, setCoords]   = useState({ x: 0, y: 0 });

  // Seed the canvas with the photo once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H);
    img.src = photoUrl;
  }, [photoUrl]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top)  * scaleY),
    };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    drawing.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    applyStyle(ctx);
    // Place a dot on click
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getPos(e);
    setCoords({ x, y });
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const onMouseUp = () => { drawing.current = false; };

  const applyStyle = (ctx: CanvasRenderingContext2D) => {
    if (tool === "eraser") {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = brushSize * 4;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const handleSave = () => {
    const dataUrl = canvasRef.current?.toDataURL("image/png") ?? "";
    onSave(dataUrl);
    onClose();
  };

  const toolBtnStyle = (id: string): React.CSSProperties => ({
    width: 32, height: 32,
    background: "#C0C0C0",
    border: "2px solid",
    borderColor: tool === id
      ? "#555 #fff #fff #555"   // sunken = selected
      : "#fff #555 #555 #fff",  // raised = unselected
    cursor: "pointer",
    fontFamily: "'VT323', monospace",
    fontSize: id === "text" ? 18 : 16,
    display: "flex", alignItems: "center", justifyContent: "center",
    userSelect: "none",
  });

  return (
    <DraggableWindow
      id="paint"
      title="untitled - Paint"
      icon={<span style={{ fontSize: 14 }}>🎨</span>}
      onClose={onClose}
      onMinimize={onClose}
      onFocus={() => {}}
      zIndex={zIndex}
      initialPosition={{ x: 80, y: 40 }}
      width={560}
      minHeight={460}
    >
      <div style={{
        display: "flex", flexDirection: "column",
        height: "100%", overflow: "hidden",
        fontFamily: "'VT323', monospace",
        background: "#C0C0C0",
      }}>

        {/* ── Menu bar ──────────────────────────────────────────── */}
        <div style={{
          borderBottom: "1px solid #808080",
          padding: "2px 6px",
          display: "flex", gap: 16,
          fontSize: 15, color: "#000",
          flexShrink: 0,
          background: "#C0C0C0",
        }}>
          {["File", "Edit", "View", "Image", "Options", "Help"].map(m => (
            <span key={m} style={{ cursor: "default", padding: "1px 4px" }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = "#000080"; (e.target as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = "transparent"; (e.target as HTMLElement).style.color = "#000"; }}
            >{m}</span>
          ))}
        </div>

        {/* ── Main area: sidebar + canvas ───────────────────────── */}
        <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>

          {/* Left tool sidebar */}
          <div style={{
            width: 44, flexShrink: 0,
            background: "#C0C0C0",
            borderRight: "1px solid #808080",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 4, padding: "6px 4px",
          }}>
            {/* Tools */}
            {TOOLS.map(t => (
              <button
                key={t.id}
                title={t.title}
                onClick={() => setTool(t.id)}
                style={toolBtnStyle(t.id)}
              >
                {t.label}
              </button>
            ))}

            {/* Divider */}
            <div style={{ width: "80%", height: 1, background: "#808080", margin: "4px 0" }} />

            {/* Brush size picker */}
            {BRUSH_SIZES.map(s => (
              <button
                key={s.px}
                title={`${s.px}px`}
                onClick={() => setBrushSize(s.px)}
                style={{
                  width: 32, height: 24,
                  background: "#C0C0C0",
                  border: "2px solid",
                  borderColor: brushSize === s.px
                    ? "#555 #fff #fff #555"
                    : "#fff #555 #555 #fff",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <div style={{
                  width: s.px * 2 + 2, height: s.px * 2 + 2,
                  borderRadius: "50%",
                  background: "#000",
                }} />
              </button>
            ))}

            {/* Active color preview */}
            <div style={{ width: "80%", height: 1, background: "#808080", margin: "4px 0" }} />
            <div style={{
              width: 28, height: 28,
              background: color,
              border: "2px solid", borderColor: "#555 #fff #fff #555",
            }} />
          </div>

          {/* Canvas wrapper */}
          <div style={{
            flex: 1, overflow: "hidden",
            background: "#808080",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 4,
          }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "100%",
                cursor: tool === "eraser" ? "cell" : "crosshair",
                border: "2px solid", borderColor: "#555 #fff #fff #555",
                boxShadow: "1px 1px 3px rgba(0,0,0,0.3)",
              }}
            />
          </div>
        </div>

        {/* ── Color palette ─────────────────────────────────────── */}
        <div style={{
          borderTop: "1px solid #808080", borderBottom: "1px solid #808080",
          padding: "4px 6px",
          display: "flex", alignItems: "center", gap: 2,
          flexShrink: 0, background: "#C0C0C0",
        }}>
          {/* Current color swatch (larger) */}
          <div style={{
            width: 24, height: 24,
            background: color,
            border: "2px solid", borderColor: "#555 #fff #fff #555",
            marginRight: 6, flexShrink: 0,
          }} />
          {PALETTE.map(c => (
            <div
              key={c}
              onClick={() => setColor(c)}
              title={c}
              style={{
                width: 16, height: 16,
                background: c,
                border: color === c
                  ? "2px solid #000"
                  : "1px solid #555",
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* ── Status bar ────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "2px 8px",
          borderTop: "1px solid #fff",
          fontSize: 13, color: "#444",
          flexShrink: 0, background: "#C0C0C0",
        }}>
          <span>x: {coords.x}, y: {coords.y}</span>
          <span style={{ color: "#808080" }}>{CANVAS_W}×{CANVAS_H}px</span>
        </div>

        {/* ── Footer buttons ────────────────────────────────────── */}
        <div style={{
          display: "flex", justifyContent: "flex-end", gap: 8,
          padding: "6px 8px",
          borderTop: "2px solid #fff",
          flexShrink: 0, background: "#C0C0C0",
        }}>
          <button
            onClick={onClose}
            style={footerBtn}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{ ...footerBtn, fontWeight: "bold" }}
          >
            💾 Save to photo
          </button>
        </div>
      </div>
    </DraggableWindow>
  );
}

const footerBtn: React.CSSProperties = {
  background: "#C0C0C0",
  border: "2px solid", borderColor: "#fff #555 #555 #fff",
  fontFamily: "'VT323', monospace", fontSize: 16,
  padding: "4px 14px", cursor: "pointer",
};
