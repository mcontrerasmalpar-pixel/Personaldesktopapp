import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Intention {
  id: number;
  text: string;
  checked: boolean;
}

interface Props {
  username: string;
  currentMood?: number;
  showWelcome?: boolean;
  onAllComplete?: () => void;
  onIntentionComplete?: () => void;
  onOpenJournal?: () => void;
  onOpenGoals?: () => void;
}

const MOODS = [
  { emoji: "😄", label: "great" },
  { emoji: "🙂", label: "good" },
  { emoji: "😐", label: "meh" },
  { emoji: "😔", label: "sad" },
  { emoji: "😤", label: "stressed" },
];

const WELCOME_MESSAGES = [
  "it takes courage to feel your feelings. we're glad you're here ♥",
  "you matter more than you know. take it one breath at a time.",
  "you showed up today, and that's enough. be gentle with yourself.",
];

const CHECK_TOOLTIPS = [
  "you did that!",
  "small wins count!",
  "proud of you ✦",
  "that took courage",
];

let intentionIdCounter = 10;

export function MySpaceWindow({
  username,
  currentMood,
  showWelcome,
  onAllComplete,
  onIntentionComplete,
  onOpenJournal,
  onOpenGoals,
}: Props) {
  const [intentions, setIntentions] = useState<Intention[]>([
    { id: 1, text: "", checked: false },
    { id: 2, text: "", checked: false },
    { id: 3, text: "", checked: false },
  ]);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [allCompleteBanner, setAllCompleteBanner] = useState(false);
  const [welcomeMsg] = useState(
    () => WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]
  );

  useEffect(() => {
    if (showWelcome) setWelcomeVisible(true);
  }, [showWelcome]);

  const filledIntentions = useMemo(
    () => intentions.filter(i => i.text.trim()),
    [intentions]
  );
  const allDone =
    filledIntentions.length > 0 && filledIntentions.every(i => i.checked);

  useEffect(() => {
    if (allDone) {
      setAllCompleteBanner(true);
      onAllComplete?.();
    }
  }, [allDone]);

  const greeting = getGreeting();

  const addIntention = () => {
    if (intentions.length >= 5) return;
    setIntentions(prev => [
      ...prev,
      { id: ++intentionIdCounter, text: "", checked: false },
    ]);
  };
  const removeIntention = (id: number) =>
    setIntentions(prev => prev.filter(i => i.id !== id));
  const updateText = (id: number, text: string) =>
    setIntentions(prev => prev.map(i => (i.id === id ? { ...i, text } : i)));
  const toggleCheck = (id: number) => {
    setIntentions(prev => {
      const item = prev.find(i => i.id === id);
      if (item && !item.checked) onIntentionComplete?.();
      return prev.map(i => (i.id === id ? { ...i, checked: !i.checked } : i));
    });
  };

  return (
    <div
      style={{
        fontFamily: "'VT323', monospace",
        fontSize: 16,
        padding: 4,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Welcome banner */}
      <AnimatePresence>
        {welcomeVisible && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: -10, scaleY: 0.85 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            style={{
              background: "linear-gradient(135deg, #e0f7f4, #b2ead8)",
              border: "1px solid #52b788",
              borderLeft: "4px solid #2d6a4f",
              borderRadius: 4,
              padding: "10px 36px 10px 14px",
              marginBottom: 10,
              position: "relative",
              fontSize: 17,
              color: "#1b4332",
              lineHeight: 1.4,
              boxShadow: "0 2px 8px rgba(44,122,84,0.12)",
              flexShrink: 0,
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }}
              style={{ marginRight: 8, display: "inline-block" }}
            >
              💚
            </motion.span>
            {welcomeMsg}
            <button onClick={() => setWelcomeVisible(false)} style={closeBtnStyle}>
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greeting */}
      <div
        style={{
          background: "linear-gradient(90deg, #000080, #1084D0)",
          color: "#fff",
          padding: "8px 12px",
          marginBottom: 12,
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        good {greeting}, {username} ✨
      </div>

      {/* Mood — read-only */}
      {currentMood !== undefined && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            flexShrink: 0,
            padding: "5px 8px",
            background: "#D8D8D8",
            border: "2px solid",
            borderColor: "#fff #808080 #808080 #fff",
            fontSize: 15,
          }}
        >
          <span style={{ fontSize: 20 }}>{MOODS[currentMood].emoji}</span>
          <span style={{ color: "#000080" }}>
            today: <strong>{MOODS[currentMood].label}</strong>
          </span>
          {(currentMood === 3 || currentMood === 4) && (
            <span style={{ color: "#808080", marginLeft: 4 }}>
              — it's okay to feel this way.
            </span>
          )}
        </div>
      )}

      {/* Intentions */}
      <Section title="🎯 Intentions for Today">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {intentions.map(item => (
            <IntentionRow
              key={item.id}
              item={item}
              onToggle={() => toggleCheck(item.id)}
              onTextChange={t => updateText(item.id, t)}
              onDelete={() => removeIntention(item.id)}
            />
          ))}
        </div>
        {intentions.length < 5 && (
          <button
            onClick={addIntention}
            style={{
              marginTop: 8,
              background: "#C0C0C0",
              border: "2px solid",
              borderColor: "#fff #555 #555 #fff",
              fontFamily: "'VT323', monospace",
              fontSize: 15,
              cursor: "pointer",
              padding: "2px 10px",
              color: "#555",
            }}
          >
            + Add intention
          </button>
        )}
        <AnimatePresence>
          {allCompleteBanner && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0.8 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              style={{
                marginTop: 10,
                background: "linear-gradient(135deg, #e0f7f4, #b2ead8)",
                border: "1px solid #52b788",
                borderLeft: "4px solid #2d6a4f",
                borderRadius: 4,
                padding: "8px 12px",
                fontSize: 18,
                color: "#1b4332",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>you showed up for yourself today 🌸</span>
              <button
                onClick={() => setAllCompleteBanner(false)}
                style={{ ...closeBtnStyle, position: "static" }}
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      {/* Open Journal */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: "auto",
          paddingTop: 12,
          flexShrink: 0,
        }}
      >
        <button onClick={onOpenJournal} style={openBtnStyle}>
          📓 Open Journal
        </button>
      </div>
    </div>
  );
}

/* ─── Intention row ─────────────────────────────────────────────────────── */
function IntentionRow({
  item,
  onToggle,
  onTextChange,
  onDelete,
}: {
  item: Intention;
  onToggle: () => void;
  onTextChange: (t: string) => void;
  onDelete: () => void;
}) {
  const [justChecked, setJustChecked] = useState(false);
  const [tooltip, setTooltip] = useState("");

  const handleCheck = () => {
    if (!item.checked) {
      const msg = CHECK_TOOLTIPS[Math.floor(Math.random() * CHECK_TOOLTIPS.length)];
      setTooltip(msg);
      setJustChecked(true);
      setTimeout(() => { setJustChecked(false); setTooltip(""); }, 1400);
    }
    onToggle();
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
      <div
        onClick={handleCheck}
        style={{
          width: 16, height: 16, flexShrink: 0,
          background: item.checked ? "#000080" : "#fff",
          border: "2px solid", borderColor: "#555 #fff #fff #555",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}
      >
        {item.checked && (
          <svg width="10" height="8" viewBox="0 0 10 8">
            <polyline points="1,4 4,7 9,1" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <MiniConfetti active={justChecked} />
      </div>

      <AnimatePresence>
        {tooltip && (
          <motion.div
            key="tip"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", left: 22, top: -2,
              background: "#ffffc0", border: "1px solid #c8c800",
              padding: "1px 8px", fontSize: 13, whiteSpace: "nowrap",
              pointerEvents: "none", zIndex: 20, boxShadow: "1px 1px 0 #808080",
            }}
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>

      <input
        value={item.text}
        onChange={e => onTextChange(e.target.value)}
        placeholder="what will you do today..."
        style={{
          flex: 1, background: "#fff",
          border: "2px solid", borderColor: "#555 #fff #fff #555",
          fontFamily: "'VT323', monospace", fontSize: 16,
          padding: "2px 6px", outline: "none",
          textDecoration: item.checked ? "line-through" : "none",
          color: item.checked ? "#888" : "#000",
          transition: "color 0.2s",
        }}
      />

      <button
        onClick={onDelete}
        style={{
          background: "#C0C0C0", border: "2px solid", borderColor: "#fff #555 #555 #fff",
          width: 18, height: 18, padding: 0, cursor: "pointer",
          fontFamily: "monospace", fontSize: 11, color: "#555",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

/* ─── Mini confetti ─────────────────────────────────────────────────────── */
const MINI_PARTICLES = [
  { dx: -22, dy: -28, sym: "♥", color: "#20B2AA" },
  { dx: 18,  dy: -32, sym: "★", color: "#FFB300" },
  { dx: -32, dy: -14, sym: "♥", color: "#FF8C00" },
  { dx: 26,  dy: -18, sym: "★", color: "#008B8B" },
  { dx: 2,   dy: -38, sym: "♥", color: "#FFB300" },
];

function MiniConfetti({ active }: { active: boolean }) {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 10 }}>
      <AnimatePresence>
        {active && MINI_PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.8, delay: i * 0.04, ease: "easeOut" }}
            style={{ position: "absolute", color: p.color, fontSize: 11, lineHeight: 1, userSelect: "none" }}
          >
            {p.sym}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12, flexShrink: 0 }}>
      <div style={{
        borderTop: "2px solid #fff", borderLeft: "2px solid #fff",
        borderBottom: "2px solid #808080", borderRight: "2px solid #808080",
        padding: "2px 6px", marginBottom: 6,
        background: "#D0D0D0", fontSize: 16,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

const openBtnStyle: React.CSSProperties = {
  flex: 1,
  background: "#C0C0C0",
  border: "2px solid",
  borderColor: "#fff #555 #555 #fff",
  fontFamily: "'VT323', monospace",
  fontSize: 17,
  cursor: "pointer",
  padding: "6px 10px",
  color: "#000",
  textAlign: "center",
};

const closeBtnStyle: React.CSSProperties = {
  position: "absolute", top: 6, right: 8,
  background: "none", border: "none",
  color: "#52b788", cursor: "pointer",
  fontSize: 16, lineHeight: 1, padding: 2,
  fontFamily: "monospace",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
