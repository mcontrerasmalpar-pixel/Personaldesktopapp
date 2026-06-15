import React, { useState } from "react";
import { createPortal } from "react-dom";
import { LANGUAGE_OPTIONS } from "./quotes";

interface LanguagePickerProps {
  initialLanguage: string | null;
  onSelect: (language: string) => void;
  onCancel: () => void;
}

export function LanguagePicker({ initialLanguage, onSelect, onCancel }: LanguagePickerProps) {
  const [selected, setSelected] = useState(initialLanguage ?? "japanese");
  const option = LANGUAGE_OPTIONS.find(l => l.id === selected) ?? LANGUAGE_OPTIONS[0];

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.38)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9600,
      }}
    >
      <div
        style={{
          width: 380,
          background: "#C0C0C0",
          border: "2px solid",
          borderColor: "#fff #555 #555 #fff",
          boxShadow: "3px 3px 0 #808080",
          userSelect: "none",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            background: "linear-gradient(90deg, #000080, #1084D0)",
            padding: "4px 8px",
            color: "#fff",
            fontFamily: "'VT323', monospace",
            fontSize: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>choose your language ✦</span>
          <div
            onClick={onCancel}
            style={{
              width: 18,
              height: 18,
              background: "#C0C0C0",
              border: "2px solid",
              borderColor: "#fff #555 #555 #fff",
              color: "#000",
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              lineHeight: 1,
              fontFamily: "monospace",
            }}
          >
            ✕
          </div>
        </div>

        {/* Menu bar divider */}
        <div style={{ borderBottom: "1px solid #808080", borderTop: "1px solid #fff", height: 2, background: "#C0C0C0" }} />

        {/* Two-column body */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: 12,
            fontFamily: "'VT323', monospace",
          }}
        >
          {/* Left — language list */}
          <div
            style={{
              width: 140,
              height: 210,
              overflowY: "auto",
              border: "2px solid",
              borderColor: "#555 #fff #fff #555",
              background: "#fff",
              flexShrink: 0,
            }}
          >
            {LANGUAGE_OPTIONS.map(opt => (
              <div
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                style={{
                  padding: "5px 8px",
                  background: selected === opt.id ? "#000080" : "transparent",
                  color: selected === opt.id ? "#fff" : "#000",
                  cursor: "pointer",
                  fontSize: 16,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onMouseEnter={e => {
                  if (selected !== opt.id) {
                    e.currentTarget.style.background = "#000080";
                    e.currentTarget.style.color = "#fff";
                  }
                }}
                onMouseLeave={e => {
                  if (selected !== opt.id) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#000";
                  }
                }}
              >
                <span>{opt.flag}</span>
                <span>{opt.label}</span>
              </div>
            ))}
          </div>

          {/* Right — preview */}
          <div
            style={{
              flex: 1,
              height: 210,
              border: "2px solid",
              borderColor: "#555 #fff #fff #555",
              background: "#e8e8e8",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 12px",
              gap: 6,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, lineHeight: 1 }}>{option.flag}</div>
            <div style={{ fontSize: 20, color: "#000080", lineHeight: 1.1 }}>{option.label}</div>
            <div
              style={{
                fontSize: 18,
                fontStyle: "italic",
                color: "#111",
                lineHeight: 1.3,
                maxWidth: 160,
              }}
            >
              {option.example}
            </div>
            <div style={{ fontSize: 13, color: "#808080", lineHeight: 1.2 }}>
              {option.hint}
            </div>
            <div style={{ fontSize: 12, color: "#808080", marginTop: 4 }}>
              you'll figure out the rest 🔍
            </div>
          </div>
        </div>

        {/* Separator */}
        <div
          style={{
            height: 1,
            background: "#808080",
            borderBottom: "1px solid #fff",
            margin: "0 0 10px 0",
          }}
        />

        {/* Footer buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            padding: "0 12px 12px",
          }}
        >
          <button
            onClick={() => onSelect(selected)}
            style={{
              background: "#000080",
              color: "#fff",
              border: "2px solid",
              borderColor: "#fff #555 #555 #fff",
              padding: "4px 16px",
              fontFamily: "'VT323', monospace",
              fontSize: 17,
              cursor: "pointer",
              minWidth: 110,
            }}
          >
            Set language
          </button>
          <button
            onClick={onCancel}
            style={{
              background: "#C0C0C0",
              border: "2px solid",
              borderColor: "#fff #555 #555 #fff",
              padding: "4px 16px",
              fontFamily: "'VT323', monospace",
              fontSize: 17,
              cursor: "pointer",
              minWidth: 80,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
