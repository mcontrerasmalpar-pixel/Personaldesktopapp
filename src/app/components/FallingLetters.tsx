import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LANGUAGE_OPTIONS, resolveLanguage } from "./quotes";

// Cinematic word-by-word reveal quote experience
// Each word fades + slides in from below, one after another

interface WordState {
  word: string;
  visible: boolean;
  highlight: boolean;
}

const HIGHLIGHT_WORDS = new Set(["love","life","death","time","self","soul","heart","mind","fear","hope","joy","pain","peace","free","light","dark","truth","dream","real","now","amour","vie","coeur","amor","alma","tiempo","ahora","herz","zeit","leben"]);

interface Props {
  quote: string;
  language: string;
  onComplete: (quote: string) => void;
  onClose: () => void;
}

export function FallingLetters({ quote, language, onComplete, onClose }: Props) {
  const words = quote.split(" ").filter(Boolean);
  const [revealed, setRevealed] = useState<boolean[]>(new Array(words.length).fill(false));
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Reveal words one by one — faster for short words, slower for long ones
    let delay = 300;
    const timers: ReturnType<typeof setTimeout>[] = [];
    words.forEach((w, i) => {
      const t = setTimeout(() => {
        setRevealed(prev => { const next = [...prev]; next[i] = true; return next; });
      }, delay);
      timers.push(t);
      delay += Math.max(180, Math.min(500, w.length * 55));
    });
    // Mark done after last word + buffer
    const doneT = setTimeout(() => setDone(true), delay + 600);
    timers.push(doneT);
    timerRef.current = timers;
    return () => timers.forEach(clearTimeout);
  }, []);

  const resolvedLang = resolveLanguage(language);
  const langOpt = LANGUAGE_OPTIONS.find(l => l.id === resolvedLang);

  return createPortal(
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(15, 12, 10, 0.93)",
      zIndex: 9500,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Subtle vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
      }} />

      {/* Quote word cloud */}
      <div style={{
        position: "relative",
        maxWidth: 680,
        padding: "0 40px",
        textAlign: "center",
        lineHeight: 1.7,
        zIndex: 1,
      }}>
        {words.map((word, i) => {
          const isHighlight = HIGHLIGHT_WORDS.has(word.toLowerCase().replace(/[^a-z\u00C0-\u024F]/g, ""));
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.35em",
                fontFamily: isHighlight ? "'Abril Fatface', cursive" : "'Fraunces', serif",
                fontSize: isHighlight ? 42 : 28,
                fontWeight: isHighlight ? 700 : 300,
                fontStyle: isHighlight ? "normal" : "italic",
                color: isHighlight ? "#F4C97F" : "rgba(255,253,246,0.88)",
                opacity: revealed[i] ? 1 : 0,
                transform: revealed[i] ? "translateY(0px)" : "translateY(18px)",
                transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1)",
                letterSpacing: isHighlight ? 1 : 0.2,
                verticalAlign: "baseline",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Language attribution */}
      {langOpt && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
          fontFamily: "'VT323', monospace", fontSize: 14,
          color: "rgba(255,255,255,0.2)",
          letterSpacing: 0.8,
          opacity: done ? 1 : 0,
          transition: "opacity 0.8s ease 0.3s",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}>
          {langOpt.flag} {langOpt.label}
        </div>
      )}

      {/* Skip button — top right, subtle */}
      <div onClick={onClose} style={{
        position: "fixed", top: 24, right: 28,
        fontFamily: "'VT323', monospace", fontSize: 15,
        color: "rgba(255,255,255,0.22)",
        cursor: "pointer", letterSpacing: 0.5,
        transition: "color 0.2s",
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.22)")}
      >
        \u2715 skip
      </div>

      {/* Save button — appears after reveal */}
      <button
        onClick={() => onComplete(quote)}
        style={{
          position: "fixed", bottom: 28,
          left: "50%", transform: "translateX(-50%)",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.25)",
          color: "rgba(255,253,246,0.75)",
          padding: "8px 32px",
          fontFamily: "'VT323', monospace", fontSize: 20,
          cursor: "pointer",
          letterSpacing: 1,
          borderRadius: 2,
          opacity: done ? 1 : 0,
          transition: "opacity 0.6s ease, background 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        \u2726 save this quote
      </button>
    </div>,
    document.body
  );
}
