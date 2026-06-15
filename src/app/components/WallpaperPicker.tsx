import React, { useRef, useState } from "react";
import { DraggableWindow } from "./DraggableWindow";

// Public URL — replaces missing local ../../imports/windows.jpg
const BLISS_URL = "https://upload.wikimedia.org/wikipedia/en/1/1e/Windowsxp.png";

export type WallpaperOption = {
  id: string;
  label: string;
  value: string;
  thumb?: string;
  mood?: "blooming" | "neutral" | "healing";
};

export const WALLPAPERS: WallpaperOption[] = [
  {
    id: "bliss",
    label: "Bliss (default)",
    value: `url(${BLISS_URL}) center/cover no-repeat`,
    thumb: `url(${BLISS_URL}) center/cover no-repeat`,
  },
];

interface Props {
  current: WallpaperOption;
  onApply: (w: WallpaperOption) => void;
  onClose: () => void;
}

export function WallpaperPicker({ current, onApply, onClose }: Props) {
  const [selected, setSelected] = useState<WallpaperOption>(current);
  const [customWp, setCustomWp] = useState<WallpaperOption | null>(
    current.id.startsWith("custom-") ? current : null
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newWp: WallpaperOption = {
      id: `custom-${Date.now()}`,
      label: file.name.replace(/\.[^.]+$/, ""),
      value: `url(${url}) center/cover no-repeat`,
      thumb: `url(${url}) center/cover no-repeat`,
    };
    setCustomWp(newWp);
    setSelected(newWp);
    e.target.value = "";
  };

  const allOptions: WallpaperOption[] = customWp
    ? [...WALLPAPERS, customWp]
    : WALLPAPERS;

  return (
    <DraggableWindow
      id="wallpaper-picker"
      title="Display Properties"
      icon={<span style={{ fontSize: 14 }}>🖥️</span>}
      onClose={onClose}
      onMinimize={onClose}
      onFocus={() => {}}
      zIndex={9000}
      initialPosition={{
        x: Math.max(40, (window.innerWidth - 400) / 2),
        y: Math.max(40, (window.innerHeight - 420) / 2),
      }}
      width={400}
      minHeight={400}
    >
      <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, padding: 4 }}>

        {/* Tabs row */}
        <div style={{
          display: "flex",
          borderBottom: "2px solid #808080",
          marginBottom: 10,
        }}>
          <div style={{
            padding: "3px 14px",
            background: "#C0C0C0",
            border: "2px solid",
            borderBottom: "none",
            borderColor: "#fff #555 #fff #fff",
            fontSize: 15,
            marginRight: 2,
            marginBottom: -2,
          }}>
            Background
          </div>
        </div>

        {/* Mini desktop preview */}
        <div style={{
          width: "100%", height: 110,
          background: selected.value,
          border: "2px solid", borderColor: "#555 #fff #fff #555",
          marginBottom: 10,
          position: "relative",
          overflow: "hidden",
          display: "flex", alignItems: "flex-start", justifyContent: "center",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: "#C0C0C0", borderBottom: "1px solid #808080" }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            color: "rgba(255,255,255,0.8)",
            fontFamily: "'VT323', monospace", fontSize: 13,
            textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
          }}>
            {selected.label}
          </div>
        </div>

        {/* Wallpaper list */}
        <div style={{ fontSize: 14, color: "#555", marginBottom: 6 }}>Wallpaper:</div>
        <div style={{
          border: "2px solid", borderColor: "#555 #fff #fff #555",
          background: "#fff",
          marginBottom: 10,
          maxHeight: 120,
          overflowY: "auto",
        }}>
          {allOptions.map(wp => (
            <div
              key={wp.id}
              onClick={() => setSelected(wp)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 8px",
                background: selected.id === wp.id ? "#000080" : "transparent",
                color: selected.id === wp.id ? "#fff" : "#000",
                cursor: "pointer",
                fontSize: 15,
              }}
            >
              <div style={{
                width: 32, height: 22,
                background: wp.thumb ?? wp.value,
                border: "1px solid #808080",
                flexShrink: 0,
              }} />
              {wp.label}
            </div>
          ))}
        </div>

        {/* Upload section */}
        <div style={{
          background: "#D8D8D8",
          border: "2px solid", borderColor: "#555 #fff #fff #555",
          padding: "8px 10px",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, color: "#333", marginBottom: 3 }}>Browse...</div>
            <div style={{ fontSize: 12, color: "#808080" }}>
              {customWp ? customWp.label : "upload your own image"}
            </div>
          </div>
          <BevelBtn onClick={() => fileRef.current?.click()}>
            Browse
          </BevelBtn>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
        </div>

        {/* OK / Apply / Cancel */}
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <BevelBtn onClick={onClose}>Cancel</BevelBtn>
          <BevelBtn onClick={() => { onApply(selected); onClose(); }}>Apply</BevelBtn>
          <BevelBtn onClick={() => { onApply(selected); onClose(); }}>OK</BevelBtn>
        </div>
      </div>
    </DraggableWindow>
  );
}

function BevelBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#C0C0C0",
        border: "2px solid", borderColor: "#fff #555 #555 #fff",
        padding: "3px 14px",
        fontFamily: "'VT323', monospace", fontSize: 16,
        cursor: "pointer",
        minWidth: 60,
        color: "#000",
      }}
    >
      {children}
    </button>
  );
}
