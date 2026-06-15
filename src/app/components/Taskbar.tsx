import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FallingLetters } from "./FallingLetters";
import { LanguagePicker } from "./LanguagePicker";
import { getDailyQuote } from "./quotes";

interface MinimizedWindow {
  id: string;
  title: string;
}

interface Props {
  minimizedWindows: MinimizedWindow[];
  onRestoreWindow: (id: string) => void;
  activeWindowId: string | null;
  onOpenWallpaperPicker: () => void;
  onOpenCompanionPicker: () => void;
}

export function Taskbar({ minimizedWindows, onRestoreWindow, activeWindowId, onOpenWallpaperPicker, onOpenCompanionPicker }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(
    localStorage.getItem("personalos_quote_language") ?? null
  );
  const [quoteRevealed, setQuoteRevealed]             = useState(false);
  const [quoteText, setQuoteText]                     = useState("");
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker]     = useState(false);
  const [showQuoteExperience, setShowQuoteExperience]   = useState(false);

  const handlePermissionAccept = () => {
    setShowPermissionDialog(false);
    if (!selectedLanguage) {
      setShowLanguagePicker(true);
    } else {
      setShowQuoteExperience(true);
    }
  };

  const handleLanguageSelect = (lang: string) => {
    localStorage.setItem("personalos_quote_language", lang);
    setSelectedLanguage(lang);
    setShowLanguagePicker(false);
    setShowQuoteExperience(true);
  };

  const handleQuoteComplete = (q: string) => {
    setQuoteText(q);
    setQuoteRevealed(true);
    setShowQuoteExperience(false);
  };

  return (
    <>
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: 36,
        background: "#C0C0C0",
        borderBottom: "2px solid",
        borderColor: "#fff #555 #555 #fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px",
        zIndex: 8000,
        userSelect: "none",
      }}>
        {/* Quote zone — centered, full width */}
        {!quoteRevealed ? (
          <div
            onClick={() => setShowPermissionDialog(true)}
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: 16,
              color: "#000080",
              cursor: "pointer",
              letterSpacing: 0.5,
              opacity: 0.75,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.75")}
          >
            ✦ click for today's quote
          </div>
        ) : (
          <div
            onClick={() => setShowLanguagePicker(true)}
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: 16,
              color: "#000080",
              cursor: "pointer",
              letterSpacing: 0.3,
              maxWidth: "80%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textAlign: "center",
              transition: "opacity 0.15s",
              opacity: 0.85,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.85")}
            title={quoteText}
          >
            ✦ {quoteText}
          </div>
        )}
      </div>

      {/* Permission dialog */}
      {showPermissionDialog && createPortal(
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9500,
        }}>
          <div style={{
            border: "2px solid",
            borderColor: "#fff #555 #555 #fff",
            boxShadow: "4px 4px 10px rgba(0,0,0,0.5)",
            width: 340,
          }}>
            <div style={{
              background: "linear-gradient(90deg, #000080, #1084D0)",
              color: "#fff",
              padding: "5px 10px",
              fontFamily: "'VT323', monospace",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span>✦ today's quote</span>
              <button onClick={() => setShowPermissionDialog(false)} style={closeBtnStyle}>✕</button>
            </div>
            <div style={{ background: "#C0C0C0", padding: "16px 18px" }}>
              <div style={{ fontFamily: "'VT323', monospace", fontSize: 17, color: "#000", marginBottom: 14, lineHeight: 1.4 }}>
                want to know your quote for today?<br />
                <span style={{ fontSize: 14, color: "#555" }}>your camera can interact with the letters as they fall.</span>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setShowPermissionDialog(false)} style={xpBtnStyle}>not now</button>
                <button onClick={handlePermissionAccept} style={xpBtnStyle}>yes, show me ✦</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Language picker */}
      {showLanguagePicker && (
        <LanguagePicker
          initialLanguage={selectedLanguage}
          onSelect={handleLanguageSelect}
          onCancel={() => setShowLanguagePicker(false)}
        />
      )}

      {/* Falling letters */}
      {showQuoteExperience && selectedLanguage && (
        <FallingLetters
          quote={getDailyQuote(selectedLanguage)}
          language={selectedLanguage}
          onComplete={handleQuoteComplete}
          onClose={() => setShowQuoteExperience(false)}
        />
      )}
    </>
  );
}

const xpBtnStyle: React.CSSProperties = {
  background: "#C0C0C0",
  border: "2px solid",
  borderColor: "#fff #555 #555 #fff",
  fontFamily: "'VT323', monospace",
  fontSize: 16,
  cursor: "pointer",
  padding: "4px 14px",
  color: "#000",
};

const closeBtnStyle: React.CSSProperties = {
  background: "#C0C0C0",
  border: "2px solid",
  borderColor: "#fff #555 #555 #fff",
  color: "#000",
  cursor: "pointer",
  fontSize: 12,
  padding: "0 5px",
  lineHeight: 1.4,
  fontFamily: "monospace",
};
