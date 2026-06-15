import React, { useState, useRef } from "react";

interface Props {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  zIndex: number;
  initialPosition?: { x: number; y: number };
  width?: number;
  minHeight?: number;
}

export function DraggableWindow({
  title,
  icon,
  children,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  initialPosition = { x: 120, y: 80 },
  width = 520,
  minHeight = 380,
}: Props) {
  const [pos, setPos]             = useState(initialPosition);
  const [maximized, setMaximized] = useState(false);
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".win-ctrl")) return;
    if (maximized) return;
    e.preventDefault();
    onFocus();
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };

    const move = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - width, dragRef.current.px + ev.clientX - dragRef.current.sx)),
        y: Math.max(36, Math.min(window.innerHeight - 60, dragRef.current.py + ev.clientY - dragRef.current.sy)),
      });
    };
    const up = () => {
      dragRef.current = null;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const windowStyle: React.CSSProperties = maximized
    ? { position: "fixed", left: 0, top: 36, width: "100vw", height: "calc(100vh - 36px)", zIndex }
    : { position: "fixed", left: pos.x, top: pos.y, width, minHeight, zIndex };

  return (
    <div
      style={{
        ...windowStyle,
        border: "2px solid",
        borderColor: "#fff #555 #555 #fff",
        boxShadow: "4px 4px 10px rgba(0,0,0,0.45)",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
        overflow: "hidden",
        animation: "winOpen 0.15s ease-out",
      }}
      onClick={onFocus}
    >
      {/* Windows-style title bar */}
      <div
        onMouseDown={handleTitleMouseDown}
        style={{
          background: "linear-gradient(90deg, #000080 0%, #1084D0 100%)",
          color: "#fff",
          padding: "3px 4px 3px 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "grab",
          flexShrink: 0,
          minHeight: 22,
          userSelect: "none",
        }}
      >
        {/* Title left side */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          fontFamily: "'VT323', monospace",
          fontSize: 17,
          fontWeight: 400,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {icon && <span style={{ lineHeight: 1, flexShrink: 0, fontSize: 14 }}>{icon}</span>}
          {title.split(" — ")[0]}
        </div>

        {/* Win-style buttons */}
        <div style={{ display: "flex", gap: 2, flexShrink: 0 }} className="win-ctrl">
          <WinBtn label="–" onClick={onMinimize} title="Minimize" />
          <WinBtn label="□" onClick={() => setMaximized(m => !m)} title="Maximize" />
          <WinBtn label="✕" onClick={onClose} title="Close" />
        </div>
      </div>

      {/* Thin menu-bar separator */}
      <div style={{
        background: "#C0C0C0",
        borderBottom: "1px solid #808080",
        height: 2,
        flexShrink: 0,
      }} />

      {/* Content area */}
      <div style={{
        flex: 1,
        overflow: "auto",
        background: "#FFFDF6",
        fontFamily: "'VT323', monospace",
        fontSize: 16,
        color: "#000",
        padding: 10,
        position: "relative",
      }}>
        {children}
      </div>
    </div>
  );
}

function WinBtn({ label, onClick, title }: { label: string; onClick: () => void; title?: string }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      onMouseDown={e => { e.stopPropagation(); setPressed(true); }}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      title={title}
      style={{
        width: 16,
        height: 14,
        background: "#C0C0C0",
        border: "2px solid",
        borderColor: pressed ? "#555 #fff #fff #555" : "#fff #555 #555 #fff",
        cursor: "pointer",
        padding: 0,
        fontFamily: "monospace",
        fontSize: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
        flexShrink: 0,
        transform: pressed ? "translate(1px, 1px)" : "none",
        color: "#000",
      }}
    >
      {label}
    </button>
  );
}
