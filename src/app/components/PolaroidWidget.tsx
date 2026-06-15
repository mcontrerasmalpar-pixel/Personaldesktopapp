import React, { useState, useRef } from "react";
import { PaintWindow } from "./PaintWindow";

const NORMAL_PROMPTS = [
  "📸 something orange",
  "📸 a texture you love",
  "📸 what's outside your window",
  "📸 something that made you smile",
  "📸 your favorite corner",
  "📸 something round",
  "📸 what you're drinking right now",
  "📸 something old",
  "📸 a color that feels like today",
  "📸 something tiny",
  "📸 light and shadow",
  "📸 something you use every day",
  "📸 a random item near you",
  "📸 something that feels soft",
  "📸 what's on your desk right now",
  "📸 something unexpected",
  "📸 a moment before it disappears",
  "📸 something that represents today",
  "📸 your hands doing something",
  "📸 something perfectly imperfect",
];

const HEALING_PROMPTS = [
  "📸 something that gives you warmth",
  "📸 a color that feels safe",
  "📸 something soft nearby",
  "📸 what comfort looks like today",
  "📸 something small and beautiful",
  "📸 a spot where you feel okay",
  "📸 something that smells nice",
  "📸 a gentle thing",
  "📸 what peace looks like right now",
  "📸 something that's always been there",
];

const getDailyPrompt = (mood: number): string => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const list = mood >= 3 ? HEALING_PROMPTS : NORMAL_PROMPTS;
  return list[dayOfYear % list.length];
};

interface PolaroidWidgetProps {
  mood?: number;
}

export function PolaroidWidget({ mood = 0 }: PolaroidWidgetProps) {
  const [imageUrl, setImageUrl]   = useState<string | null>(null);
  const [pos, setPos]             = useState(() => ({ x: Math.max(0, window.innerWidth - 340), y: 20 }));
  const [paintOpen, setPaintOpen] = useState(false);
  const [rotation]  = useState(() => Math.random() * 4 - 2);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const prompt = getDailyPrompt(mood);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    if ((e.target as HTMLElement).closest(".no-drag")) return;
    e.preventDefault();
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };

    const move = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth  - 280, dragRef.current.px + ev.clientX - dragRef.current.sx)),
        y: Math.max(0, Math.min(window.innerHeight - 320, dragRef.current.py + ev.clientY - dragRef.current.sy)),
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSavePaint = (dataUrl: string) => {
    setImageUrl(dataUrl);
    setPaintOpen(false);
  };

  const WIDGET_W = 280;
  const PHOTO_W  = 248;
  const PHOTO_H  = 200;

  return (
    <>
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: "fixed",
          left: pos.x, top: pos.y,
          transform: `rotate(${rotation}deg)`,
          zIndex: 200,
          cursor: "grab",
          userSelect: "none",
          width: WIDGET_W,
        }}
      >
        {/* Pushpin */}
        <div style={{
          position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
          zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          pointerEvents: "none",
        }}>
          <div style={{
            width: 13, height: 13, borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #ff6666, #cc0000)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
          }} />
          <div style={{ width: 2, height: 16, background: "#888" }} />
        </div>

        {/* Polaroid frame */}
        <div style={{
          background: "#fff",
          padding: "10px 10px 44px 10px",
          boxShadow: "3px 3px 12px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.06)",
          position: "relative",
        }}>
          {/* Photo area */}
          {imageUrl ? (
            <div style={{ width: PHOTO_W, height: PHOTO_H, position: "relative", overflow: "hidden" }}>
              <img
                src={imageUrl}
                alt="today"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <div
                className="no-drag"
                onClick={() => fileRef.current?.click()}
                style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "rgba(0,0,0,0)",
                  color: "transparent",
                  fontFamily: "'VT323', monospace", fontSize: 13,
                  textAlign: "center", padding: "3px 0",
                  transition: "background 0.15s, color 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.35)";
                  (e.currentTarget as HTMLDivElement).style.color = "#fff";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0)";
                  (e.currentTarget as HTMLDivElement).style.color = "transparent";
                }}
              >
                change photo
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: PHOTO_W, height: PHOTO_H,
                border: "2px dashed #C0C0C0",
                background: "#faf8f3",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                gap: 8,
                padding: 12,
                textAlign: "center",
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontSize: 36 }}>📷</div>
              <div style={{
                fontFamily: "'VT323', monospace",
                fontSize: 15,
                color: "#555",
                lineHeight: 1.35,
              }}>
                {prompt}
              </div>
              <div style={{
                fontFamily: "'VT323', monospace",
                fontSize: 13,
                color: "#aaa",
                marginTop: 2,
              }}>
                click to upload
              </div>
            </div>
          )}

          {/* Paint icon */}
          {imageUrl && (
            <button
              className="no-drag"
              onClick={() => setPaintOpen(true)}
              title="Draw on photo"
              style={{
                position: "absolute", top: 8, right: 8,
                width: 26, height: 26,
                background: "#C0C0C0",
                border: "2px solid", borderColor: "#fff #555 #555 #fff",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, padding: 0,
                fontFamily: "monospace",
              }}
            >
              🎨
            </button>
          )}

          {/* Caption area */}
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: 44,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 10px",
          }}>
            {imageUrl ? (
              <>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: "#555", lineHeight: 1.2, textAlign: "center" }}>{prompt}</div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: "#aaa" }}>{dateStr}</div>
              </>
            ) : (
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: "#aaa" }}>{dateStr}</div>
            )}
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {paintOpen && imageUrl && (
        <PaintWindow
          photoUrl={imageUrl}
          onSave={handleSavePaint}
          onClose={() => setPaintOpen(false)}
          zIndex={5000}
        />
      )}
    </>
  );
}
