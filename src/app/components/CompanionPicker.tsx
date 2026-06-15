import React, { useState } from "react";
import { DraggableWindow } from "./DraggableWindow";
import { getCompanionIdleImage } from "./PixelPet";

export interface Companion {
  id: string;
  label: string;
  description: string;
}

export const COMPANIONS: Companion[] = [
  { id: "cat",      label: "Cat",       description: "Calm and observant. Always knows when you need company." },
  { id: "dog",      label: "Dog",       description: "Loyal and gentle. Wags its whole body when you succeed." },
  { id: "chicken",  label: "Chicken",   description: "Cheerful little one. Pecks happily on your best days." },
  { id: "cow",      label: "Cow",       description: "Steady and warm. Has a secret UFO mode for special days 🛸" },
  { id: "redpanda", label: "Red Panda", description: "Cozy explorer. Curls up with you on hard days." },
  { id: "frog",     label: "Frog",      description: "Patient and chill. Blinks slowly, judges nothing." },
];

/* ─── Shared dialog body ─────────────────────────────────────────────── */
export function CompanionPickerBody({
  initialId,
  onConfirm,
  onCancel,
}: {
  initialId: string;
  onConfirm: (id: string) => void;
  onCancel: () => void;
}) {
  const [selectedId, setSelectedId] = useState(initialId);
  const selected = COMPANIONS.find(c => c.id === selectedId) ?? COMPANIONS[0];

  return (
    <div style={{ fontFamily: "'VT323', monospace", fontSize: 16 }}>
      {/* Two-column body */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {/* LEFT — list box */}
        <div style={{
          width: 130,
          height: 160,
          overflowY: "auto",
          border: "2px solid",
          borderColor: "#555 #fff #fff #555",
          background: "#fff",
          flexShrink: 0,
        }}>
          {COMPANIONS.map(c => (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              style={{
                padding: "4px 8px",
                background: selectedId === c.id ? "#000080" : "transparent",
                color: selectedId === c.id ? "#fff" : "#000",
                cursor: "pointer",
                fontSize: 15,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onMouseEnter={e => {
                if (selectedId !== c.id) {
                  e.currentTarget.style.background = "#000080";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={e => {
                if (selectedId !== c.id) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#000";
                }
              }}
            >
              {c.label}
            </div>
          ))}
        </div>

        {/* RIGHT — preview */}
        <div style={{
          flex: 1,
          height: 160,
          border: "2px solid",
          borderColor: "#555 #fff #fff #555",
          background: "#e8e8e8",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 10px",
          gap: 4,
          textAlign: "center",
        }}>
          <img
            src={getCompanionIdleImage(selectedId)}
            alt={selected.label}
            style={{
              width: 64, height: 80, flexShrink: 0,
              objectFit: "contain",
              imageRendering: "pixelated",
            }}
          />
          <div style={{ fontSize: 15, color: "#000080", lineHeight: 1.1 }}>
            {selected.label}
          </div>
          <div style={{
            fontSize: 13, color: "#555",
            lineHeight: 1.3,
            maxWidth: 120,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          } as React.CSSProperties}>
            {selected.description}
          </div>
        </div>
      </div>

      {/* Separator */}
      <div style={{ height: 1, background: "#808080", borderBottom: "1px solid #fff", margin: "0 -8px 10px -8px" }} />

      {/* Footer buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        <BevelBtn onClick={() => onConfirm(selectedId)} minWidth={90}>
          Set as Default
        </BevelBtn>
        <BevelBtn onClick={onCancel} minWidth={90}>
          Cancel
        </BevelBtn>
      </div>
    </div>
  );
}

/* ─── Desktop version — wrapped in DraggableWindow ────────────────────── */
export function CompanionPicker({
  currentId,
  onSelect,
  onClose,
}: {
  currentId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const handleConfirm = (id: string) => {
    onSelect(id);
    onClose();
  };

  return (
    <DraggableWindow
      id="companion-picker"
      title="Choose your companion"
      icon={<span style={{ fontSize: 16 }}>🐾</span>}
      onClose={onClose}
      onMinimize={onClose}
      onFocus={() => {}}
      zIndex={9100}
      initialPosition={{
        x: Math.max(40, (window.innerWidth - 340) / 2),
        y: Math.max(40, (window.innerHeight - 300) / 2),
      }}
      width={340}
      minHeight={240}
    >
      <CompanionPickerBody
        initialId={currentId}
        onConfirm={handleConfirm}
        onCancel={onClose}
      />
    </DraggableWindow>
  );
}

/* ─── Login-screen modal overlay version ─────────────────────────────── */
export function CompanionPickerModal({
  onConfirm,
  onSkip,
}: {
  onConfirm: (id: string) => void;
  onSkip: () => void;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.65)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9800,
    }}>
      <div style={{
        background: "#C0C0C0",
        border: "2px solid",
        borderColor: "#fff #555 #555 #fff",
        boxShadow: "2px 2px 0 #808080",
        width: 340,
        userSelect: "none",
      }}>
        {/* Title bar */}
        <div style={{
          background: "linear-gradient(90deg, #000080 0%, #1084D0 100%)",
          color: "#fff",
          padding: "3px 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 28,
        }}>
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 18 }}>
            🐾 Choose your companion
          </span>
          <button
            onClick={onSkip}
            style={{
              width: 20, height: 20,
              background: "#C0C0C0",
              border: "2px solid", borderColor: "#fff #555 #555 #fff",
              color: "#000", cursor: "pointer",
              fontFamily: "monospace", fontSize: 11,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 0, lineHeight: 1, flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Thin menu-bar divider */}
        <div style={{
          borderBottom: "1px solid #808080",
          borderTop: "1px solid #fff",
          padding: "1px 4px",
          background: "#C0C0C0",
        }} />

        {/* Body */}
        <div style={{ padding: 8 }}>
          <div style={{
            fontFamily: "'VT323', monospace",
            fontSize: 14,
            color: "#555",
            marginBottom: 8,
          }}>
            Who will keep you company in PersonalOS?
          </div>
          <CompanionPickerBody
            initialId="cat"
            onConfirm={id => {
              localStorage.setItem("personalos_companion", id);
              onConfirm(id);
            }}
            onCancel={onSkip}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Helper ─────────────────────────────────────────────────────────── */
function BevelBtn({
  onClick,
  children,
  minWidth,
}: {
  onClick: () => void;
  children: React.ReactNode;
  minWidth?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#C0C0C0",
        border: "2px solid", borderColor: "#fff #555 #555 #fff",
        padding: "4px 10px",
        minWidth,
        fontFamily: "'VT323', monospace", fontSize: 17,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
