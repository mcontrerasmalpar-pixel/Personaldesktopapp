import React, { useState, useEffect, useRef } from "react";
import { getCompanionIdleImage } from "./PixelPet";

const MOODS = [
  { label: "great",    color: "#E9C46A", emoji: "😄", bgColor: "#FFF3C4" },
  { label: "good",     color: "#4CAF50", emoji: "🙂", bgColor: "#C8E6C9" },
  { label: "meh",      color: "#64B5F6", emoji: "😐", bgColor: "#BBDEFB" },
  { label: "sad",      color: "#CE93D8", emoji: "😔", bgColor: "#E1BEE7" },
  { label: "stressed", color: "#F48FB1", emoji: "😤", bgColor: "#FCE4EC" },
];

interface Props {
  username: string;
  companionId: string;
  canvasSnapshot?: string | null;
  onComplete: (moodIndex: number) => void;
}

export function MoodScreen({ username, companionId, canvasSnapshot, onComplete }: Props) {
  const [selected, setSelected]         = useState<number | null>(null);
  const [hovered, setHovered]           = useState<number | null>(null);
  const [contentVisible, setContentVisible] = useState(false);
  const [visibleChars, setVisibleChars] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const TITLE = `how are you, ${username || "friend"}?`;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisibleChars(prev => {
        if (prev >= TITLE.length) {
          clearInterval(intervalRef.current!);
          setTimeout(() => setContentVisible(true), 300);
          return prev;
        }
        return prev + 1;
      });
    }, 55);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [TITLE]);

  // Background color transitions based on mood
  const bgColor = selected !== null ? MOODS[selected].bgColor : "#FFFFFF";
  const bgIsLight = selected !== null;

  return (
    <div style={{
      width: "100%", height: "100vh",
      position: "relative",
      overflow: "hidden",
      background: bgColor,
      transition: "background 0.7s ease",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Canvas snapshot fades out */}
      {canvasSnapshot && (
        <img src={canvasSnapshot} alt="" style={{
          position: "fixed", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          filter: "blur(10px)",
          transform: "scale(1.05)",
          animation: "snapshotFade 2s ease forwards",
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.3,
        }} />
      )}


      {/* Main dialog window */}
      <div style={{
        position: "relative",
        zIndex: 2,
        border: "2px solid",
        borderColor: "#fff #555 #555 #fff",
        boxShadow: "4px 4px 10px rgba(0,0,0,0.4)",
        width: 480,
        animation: "winFadeIn 0.3s ease-out",
      }}>

        {/* Title bar */}
        <div style={{
          background: "linear-gradient(90deg, #000080, #1084D0)",
          color: "#fff",
          padding: "5px 10px",
          fontFamily: "'VT323', monospace",
          fontSize: 18,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span>🌡️</span>
          Mood Check — Personal OS
          <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
            {["_", "□", "✕"].map((s, i) => (
              <div key={i} style={{ width: 14, height: 14, background: "#C0C0C0", border: "2px solid", borderColor: "#fff #555 #555 #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Dialog body */}
        <div style={{ background: "#C0C0C0", padding: "16px 20px" }}>

          {/* Greeting */}
          <div style={{
            background: "#fff",
            border: "2px solid",
            borderColor: "#555 #fff #fff #555",
            padding: "8px 12px",
            marginBottom: 14,
            fontFamily: "'VT323', monospace",
            fontSize: 20,
            color: "#000080",
            minHeight: 40,
          }}>
            {TITLE.slice(0, visibleChars)}
            <span style={{ opacity: visibleChars < TITLE.length ? 1 : 0, animation: "blink 0.7s step-end infinite" }}>_</span>
          </div>

          {/* Subtitle */}
          <div style={{
            fontFamily: "'VT323', monospace",
            fontSize: 16,
            color: "#444",
            marginBottom: 14,
            opacity: contentVisible ? 1 : 0,
            transition: "opacity 0.5s",
          }}>
            tap how you feel right now:
          </div>

          {/* Mood buttons row */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 16,
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.5s, transform 0.5s",
          }}>
            {MOODS.map((mood, i) => {
              const isSelected = selected === i;
              const isHovered  = hovered === i;
              return (
                <div
                  key={i}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}
                >
                  <div
                    onClick={() => setSelected(i)}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      width: 64, height: 64,
                      borderRadius: "50%",
                      background: mood.color,
                      border: isSelected ? "3px solid #000080" : isHovered ? "3px solid #4A90D9" : "3px solid",
                      borderColor: isSelected ? "#000080" : isHovered ? "#4A90D9" : "#fff #555 #555 #fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      cursor: "pointer",
                      transform: isSelected ? "scale(1.15) translateY(-4px)" : isHovered ? "scale(1.08) translateY(-2px)" : "scale(1)",
                      transition: "transform 0.15s, border-color 0.15s",
                      boxShadow: isSelected
                        ? `0 6px 16px ${mood.color}80, inset 0 1px 0 rgba(255,255,255,0.4)`
                        : isHovered
                        ? `0 4px 10px ${mood.color}60`
                        : "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.1)",
                      userSelect: "none",
                    }}
                  >
                    {mood.emoji}
                  </div>
                  <div style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: 14,
                    color: isSelected ? "#000080" : "#444",
                    textAlign: "center",
                    transition: "color 0.15s",
                  }}>
                    {mood.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* OK button row */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            borderTop: "1px solid #808080",
            paddingTop: 10,
            opacity: contentVisible ? 1 : 0,
            transition: "opacity 0.5s 0.2s",
          }}>
            <button
              disabled={selected === null}
              onClick={() => selected !== null && onComplete(selected)}
              style={{
                background: selected !== null ? "#C0C0C0" : "#A0A0A0",
                border: "2px solid",
                borderColor: selected !== null ? "#fff #555 #555 #fff" : "#888",
                fontFamily: "'VT323', monospace",
                fontSize: 17,
                cursor: selected !== null ? "pointer" : "not-allowed",
                padding: "5px 24px",
                color: selected !== null ? "#000" : "#666",
                minWidth: 120,
              }}
            >
              {selected !== null ? `enter my space ✦` : "select a mood"}
            </button>
          </div>
        </div>
      </div>

      {/* Pet bottom-right */}
      <img
        src={getCompanionIdleImage(companionId)}
        alt="companion"
        style={{
          position: "fixed",
          bottom: 16, right: 20,
          width: 64, height: 80,
          imageRendering: "pixelated",
          objectFit: "contain",
          animation: "petFloat 2s ease-in-out infinite",
          zIndex: 10,
          opacity: contentVisible ? 1 : 0,
          transition: "opacity 0.8s ease 0.8s",
        }}
      />

      <style>{`
        @keyframes petFloat    { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes snapshotFade { 0% { opacity: 0.3; } 100% { opacity: 0; } }
        @keyframes winFadeIn   { from { opacity: 0; transform: scale(0.94) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes blink       { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
