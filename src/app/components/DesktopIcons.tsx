// Extracted from Desktop.tsx — audit improvement #5 (split 27KB file)
import React, { useState, useRef } from "react";

const FOLDER_YELLOW = "#FFC83A";

export type CapsuleState = "empty" | "sealed" | "ready";

// ── Shared draggable icon logic (fixes #6 — was 80% duplicated)
function useDraggableIcon(
  position: { x: number; y: number },
  onPositionChange: (pos: { x: number; y: number }) => void,
  onClick: () => void
) {
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number; moved: boolean } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: position.x, py: position.y, moved: false };
    const move = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.sx;
      const dy = ev.clientY - dragRef.current.sy;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true;
      if (dragRef.current.moved) {
        onPositionChange({
          x: Math.max(0, Math.min(window.innerWidth - 80, dragRef.current.px + dx)),
          y: Math.max(36, Math.min(window.innerHeight - 80, dragRef.current.py + dy)),
        });
      }
    };
    const up = () => {
      if (dragRef.current && !dragRef.current.moved) onClick();
      dragRef.current = null;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  return { handleMouseDown };
}

// ── Generic Desktop Icon (fixes #6 — replaces DraggableDesktopIcon + TimeCapsuleIcon duplication)
export function DesktopIcon({
  label, icon, position, onPositionChange, onClick, selected, glowAnimation,
}: {
  label: string;
  icon: React.ReactNode;
  position: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }) => void;
  onClick: () => void;
  selected?: boolean;
  glowAnimation?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const { handleMouseDown } = useDraggableIcon(position, onPositionChange, onClick);

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        left: position.x, top: position.y,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        width: 76, cursor: "default",
        transform: hovered ? "scale(1.08) translateY(-2px)" : "scale(1)",
        transition: "transform 0.15s ease",
        zIndex: 50,
        userSelect: "none",
        animation: glowAnimation ? "capsuleGlow 2s ease-in-out infinite" : "none",
      }}
    >
      <div style={{ opacity: selected ? 1 : hovered ? 0.95 : 0.85 }}>
        {icon}
      </div>
      <div style={{
        fontFamily: "'VT323', monospace",
        fontSize: 12,
        color: "#264653",
        textAlign: "center",
        background: selected ? "rgba(0,0,128,0.18)" : hovered ? "rgba(0,0,128,0.08)" : "transparent",
        padding: "1px 5px",
        borderRadius: 2,
        lineHeight: 1.2,
        letterSpacing: 0.2,
      }}>
        {label}
      </div>
    </div>
  );
}

// ── Folder SVG
export function FolderIcon({ small }: { small?: boolean }) {
  const w = small ? 14 : 52, h = small ? 12 : 44;
  return (
    <svg width={w} height={h} viewBox="0 0 52 44" fill="none">
      <path d="M2 12 L2 10 Q2 8 4 8 L20 8 L24 4 Q25 2 27 2 L50 2 Q52 2 52 4 L52 8 L2 8 Z" fill={FOLDER_YELLOW} opacity="0.8" />
      <rect x="2" y="8" width="49" height="33" rx="2" fill={FOLDER_YELLOW} />
      <rect x="2" y="8" width="49" height="5" rx="1" fill="white" fillOpacity="0.3" />
      <rect x="6" y="16" width="40" height="2" rx="1" fill="white" fillOpacity="0.15" />
      <rect x="6" y="21" width="32" height="2" rx="1" fill="white" fillOpacity="0.12" />
      <rect x="2" y="38" width="49" height="3" rx="1" fill="black" fillOpacity="0.08" />
    </svg>
  );
}

// ── Mailbox SVG
export function MailboxIcon({ state }: { state: CapsuleState }) {
  const flagColor = state === "ready" ? "#CC0000" : state === "sealed" ? "#888" : "#C0C0C0";
  const bodyColor = state === "ready" ? "#4A7FD4" : "#6A8FB0";
  return (
    <svg width="52" height="48" viewBox="0 0 52 48" fill="none">
      <rect x="22" y="34" width="8" height="14" fill="#888" />
      <rect x="4" y="14" width="44" height="22" rx="3" fill={bodyColor} />
      <rect x="4" y="14" width="44" height="5" rx="2" fill="white" fillOpacity="0.2" />
      <rect x="10" y="22" width="32" height="3" rx="1" fill="rgba(0,0,0,0.3)" />
      <rect x="4" y="28" width="44" height="1" fill="rgba(0,0,0,0.15)" />
      <rect x="44" y="10" width="2" height="18" fill="#888" />
      <path d={state === "sealed" || state === "ready" ? "M46 10 L46 18 L52 14 Z" : "M46 22 L46 28 L52 25 Z"} fill={flagColor} />
      {(state === "sealed" || state === "ready") && (
        <rect x="12" y="18" width="20" height="2" rx="1" fill="#fff" fillOpacity="0.6" />
      )}
      {state === "ready" && (
        <rect x="2" y="12" width="48" height="26" rx="4" fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.8" />
      )}
    </svg>
  );
}
