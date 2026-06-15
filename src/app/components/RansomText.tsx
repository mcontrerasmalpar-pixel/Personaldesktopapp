import React from "react";

const RANSOM_FONTS = [
  "Alfa Slab One",
  "Abril Fatface",
  "Pacifico",
  "Lobster",
  "Berkshire Swash",
  "Comic Neue",
  "Courier Prime",
  "Rye",
  "VT323",
];

const RANSOM_COLORS = [
  "#000000",
  "#000000",
  "#000000",
  "#CC0000",
  "#000080",
  "#1a1a1a",
  "#333333",
  "#FF6B9D",
  "#4D9DE0",
];

const seededRandom = (seed: number) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

interface RansomTextProps {
  text: string;
}

export function RansomText({ text }: RansomTextProps) {
  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-end",
      gap: "1px",
      lineHeight: 1.4,
      padding: "8px 4px",
    }}>
      {text.split("").map((char, i) => {
        if (char === "\n") return <div key={i} style={{ width: "100%", height: 8 }} />;
        if (char === " ")  return <span key={i} style={{ width: "0.4em", display: "inline-block" }} />;

        const r1 = seededRandom(i * 7);
        const r2 = seededRandom(i * 13);
        const r3 = seededRandom(i * 17);
        const r4 = seededRandom(i * 23);
        const r5 = seededRandom(i * 31);
        const r6 = seededRandom(i * 37);
        const r7 = seededRandom(i * 41);

        const font       = RANSOM_FONTS[Math.floor(r1 * RANSOM_FONTS.length)];
        const size       = 14 + Math.floor(r2 * 16);
        const color      = RANSOM_COLORS[Math.floor(r3 * RANSOM_COLORS.length)];
        const rotation   = (r4 - 0.5) * 14;
        const vertOffset = (r5 - 0.5) * 8;
        const isBold     = r6 > 0.4;
        const isItalic   = r7 > 0.75;

        const hasCutout    = seededRandom(i * 43) > 0.6;
        const cutoutBg     = hasCutout ? "#f5f0e8" : "transparent";
        const cutoutBorder = hasCutout ? "0.5px solid rgba(0,0,0,0.15)" : "none";
        const cutoutPad    = hasCutout ? "1px 3px" : "0";
        const cutoutShadow = hasCutout ? "1px 1px 0 rgba(0,0,0,0.2)" : "none";

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
              background: cutoutBg,
              border: cutoutBorder,
              padding: cutoutPad,
              boxShadow: cutoutShadow,
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
