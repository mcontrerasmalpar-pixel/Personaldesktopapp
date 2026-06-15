import React, { useState, useRef } from "react";

const BOARD_IMAGES = [
  { id: 1, url: "https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300", label: "01", category: "🍓 fruit" },
  { id: 2, url: "https://images.unsplash.com/photo-1602734846297-9299fc2d4703?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300", label: "02", category: "🧸 plushie" },
  { id: 3, url: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300", label: "03", category: "🐶 animal" },
  { id: 4, url: "https://images.unsplash.com/photo-1503803548695-c2a7b4a5b875?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300", label: "04", category: "⛵ destination" },
  { id: 5, url: "https://images.unsplash.com/photo-1595967444215-4901e8436909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300", label: "05", category: "🦋 animal" },
  { id: 6, url: "https://images.unsplash.com/photo-1439853949127-fa647821eba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300", label: "06", category: "⛰️ landscape" },
];

// Selection handle corner marks
function SelectionHandles() {
  const sz = 5;
  const color = "#4A90D9";
  const positions = [
    { top: -sz/2, left: -sz/2 }, { top: -sz/2, left: "50%", marginLeft: -sz/2 }, { top: -sz/2, right: -sz/2 },
    { top: "50%", left: -sz/2,  marginTop: -sz/2 },                                { top: "50%", right: -sz/2, marginTop: -sz/2 },
    { bottom: -sz/2, left: -sz/2 }, { bottom: -sz/2, left: "50%", marginLeft: -sz/2 }, { bottom: -sz/2, right: -sz/2 },
  ];
  return (
    <>
      {positions.map((p, i) => (
        <div key={i} style={{ position: "absolute", width: sz, height: sz, background: color, zIndex: 2, ...p as React.CSSProperties }} />
      ))}
    </>
  );
}

export function MeaningBoardWidget() {
  const [pos, setPos] = useState(() => ({ x: Math.max(0, window.innerWidth - 310), y: 300 }));
  const [meanings, setMeanings] = useState<Record<number, string>>({});
  const [focused, setFocused] = useState<number | null>(null);
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);

  const handleBarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
    const move = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 300, dragRef.current.px + ev.clientX - dragRef.current.sx)),
        y: Math.max(0, Math.min(window.innerHeight - 120, dragRef.current.py + ev.clientY - dragRef.current.sy)),
      });
    };
    const up = () => { dragRef.current = null; document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  return (
    <div style={{
      position: "fixed",
      left: pos.x, top: pos.y,
      width: 300,
      zIndex: 250,
      userSelect: "none",
      boxShadow: "4px 4px 10px rgba(0,0,0,0.4)",
      border: "2px solid",
      borderColor: "#fff #555 #555 #fff",
    }}>
      {/* Title bar */}
      <div
        onMouseDown={handleBarMouseDown}
        style={{
          background: "linear-gradient(90deg, #000080, #1084D0)",
          color: "#fff",
          padding: "4px 8px",
          fontFamily: "'VT323', monospace",
          fontSize: 18,
          cursor: "grab",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          userSelect: "none",
        }}
      >
        <span>🎴 meaning board</span>
        <span style={{ fontSize: 12, opacity: 0.7 }}>what does it mean to you?</span>
      </div>

      {/* Sub-header */}
      <div style={{
        background: "#C0C0C0",
        borderBottom: "2px solid",
        borderColor: "#555 #fff #fff #555",
        padding: "4px 8px",
        fontFamily: "'VT323', monospace",
        fontSize: 13,
        color: "#444",
      }}>
        click each image — write your personal meaning below it
      </div>

      {/* Grid */}
      <div style={{
        background: "#D4D0C8",
        maxHeight: 380,
        overflowY: "auto",
        padding: 6,
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 6,
        }}>
          {BOARD_IMAGES.map(img => {
            const isFocused = focused === img.id;
            return (
              <div
                key={img.id}
                onClick={() => setFocused(img.id)}
                style={{
                  background: "#fff",
                  border: isFocused ? "1px solid #4A90D9" : "1px solid #808080",
                  position: "relative",
                  cursor: "pointer",
                  boxShadow: isFocused ? "0 0 0 1px #4A90D9" : "none",
                  transition: "border-color 0.1s",
                }}
              >
                {isFocused && <SelectionHandles />}

                {/* Image */}
                <div style={{ width: "100%", height: 75, overflow: "hidden", position: "relative" }}>
                  <img
                    src={img.url}
                    alt={img.category}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    draggable={false}
                  />
                  {/* Number label */}
                  <div style={{
                    position: "absolute", top: 2, left: 3,
                    fontFamily: "'VT323', monospace",
                    fontSize: 13,
                    color: "#fff",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.9)",
                    pointerEvents: "none",
                  }}>
                    {img.label}.
                  </div>
                </div>

                {/* Category label */}
                <div style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: 11,
                  color: "#555",
                  padding: "1px 3px",
                  borderBottom: "1px solid #D0D0D0",
                  background: "#F5F5F5",
                }}>
                  {img.category}
                </div>

                {/* Meaning text */}
                <textarea
                  value={meanings[img.id] || ""}
                  onChange={e => setMeanings(prev => ({ ...prev, [img.id]: e.target.value }))}
                  onFocus={() => setFocused(img.id)}
                  onClick={e => e.stopPropagation()}
                  placeholder="what this means..."
                  rows={2}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "none",
                    borderTop: "1px solid #E0E0E0",
                    resize: "none",
                    fontFamily: "'VT323', monospace",
                    fontSize: 13,
                    padding: "2px 4px",
                    outline: "none",
                    background: isFocused ? "#FFFFF0" : "#FAFAFA",
                    color: "#222",
                    transition: "background 0.15s",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom status bar */}
      <div style={{
        background: "#C0C0C0",
        borderTop: "2px solid",
        borderColor: "#fff #555 #555 #fff",
        padding: "2px 8px",
        fontFamily: "'VT323', monospace",
        fontSize: 12,
        color: "#555",
        display: "flex",
        justifyContent: "space-between",
      }}>
        <span>{Object.values(meanings).filter(v => v.trim()).length} / {BOARD_IMAGES.length} meanings added</span>
        <span style={{ opacity: 0.6 }}>your meanings are private ✦</span>
      </div>
    </div>
  );
}
