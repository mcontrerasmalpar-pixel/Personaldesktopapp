import React, { useState } from "react";

const RANSOM_FONTS = [
  "Alfa Slab One",
  "Abril Fatface",
  "Pacifico",
  "Lobster",
  "Berkshire Swash",
  "Comic Neue",
  "Courier Prime",
  "Rye",
];

const RANSOM_COLORS = [
  "#000000",
  "#CC0000",
  "#000080",
  "#1a6b2a",
  "#FF6B9D",
  "#4D9DE0",
  "#E15FED",
  "#8B4513",
];

const seededRandom = (seed: number) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

function RansomTitle({ text }: { text: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      gap: 2,
      flexWrap: "nowrap",
      marginBottom: 12,
    }}>
      {text.split("").map((char, i) => {
        if (char === " ") return <span key={i} style={{ width: "0.5em" }} />;

        const font      = RANSOM_FONTS[Math.floor(seededRandom(i * 7)  * RANSOM_FONTS.length)];
        const size      = 22 + Math.floor(seededRandom(i * 13) * 18);
        const color     = RANSOM_COLORS[Math.floor(seededRandom(i * 17) * RANSOM_COLORS.length)];
        const rotation  = (seededRandom(i * 23) - 0.5) * 16;
        const vertOffset = (seededRandom(i * 31) - 0.5) * 6;
        const isBold    = seededRandom(i * 37) > 0.4;
        const isItalic  = seededRandom(i * 41) > 0.7;
        const hasCutout = seededRandom(i * 43) > 0.55;

        return (
          <span
            key={i}
            style={{
              fontFamily: `'${font}', serif`,
              fontSize: size,
              color,
              fontWeight: isBold ? 700 : 400,
              fontStyle: isItalic ? "italic" : "normal",
              transform: `rotate(${rotation}deg) translateY(${vertOffset}px)`,
              display: "inline-block",
              lineHeight: 1,
              background: hasCutout ? "#f5f0e8" : "transparent",
              border: hasCutout ? "0.5px solid rgba(0,0,0,0.15)" : "none",
              padding: hasCutout ? "1px 4px" : "0",
              boxShadow: hasCutout ? "1px 1px 0 rgba(0,0,0,0.2)" : "none",
              marginBottom: Math.abs(vertOffset),
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
}

interface Props {
  onJournalSaved?: (text: string) => void;
}

export function JournalWindow({ onJournalSaved }: Props) {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const handleSave = () => {
    setSaved(true);
    onJournalSaved?.(text);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{
      fontFamily: "'VT323', monospace",
      fontSize: 16,
      padding: 10,
      display: "flex",
      flexDirection: "column",
      height: "100%",
      boxSizing: "border-box",
    }}>
      <RansomTitle text="Journal" />

      <div style={{
        textAlign: "right",
        color: "#808080",
        fontSize: 15,
        marginBottom: 8,
        flexShrink: 0,
      }}>
        {dateStr}
      </div>

      <textarea
        value={text}
        onChange={e => { setText(e.target.value); setSaved(false); }}
        placeholder="what's on your mind today..."
        style={{
          flex: 1,
          width: "100%",
          boxSizing: "border-box",
          background: "#fff",
          border: "2px solid",
          borderColor: "#555 #fff #fff #555",
          fontFamily: "'VT323', monospace",
          fontSize: 16,
          padding: "6px 8px",
          resize: "none",
          outline: "none",
          lineHeight: 1.6,
        }}
      />

      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: 10,
        flexShrink: 0,
      }}>
        <button
          onClick={handleSave}
          style={{
            background: saved ? "#e0f7f4" : "#C0C0C0",
            border: "2px solid",
            borderColor: "#fff #555 #555 #fff",
            padding: "4px 16px",
            fontFamily: "'VT323', monospace",
            fontSize: 18,
            cursor: "pointer",
            color: saved ? "#2d6a4f" : "#000",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          {saved ? "✓ Saved!" : "💾 Save"}
        </button>
      </div>
    </div>
  );
}
