import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

// ── Cat images via public CDN (replaces missing local PNG assets) ───────────
const CAT_POOL: string[] = [
  "https://cataas.com/cat/says/nya?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/meow?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/hi?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/owo?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/uwu?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/:3?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/~?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/purrr?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/boop?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/omg?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/nap?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/help?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/ok?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/what?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/mood?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/yes?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/no?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/fine?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/sus?width=200&height=200&fontSize=40&fontColor=white",
  "https://cataas.com/cat/says/cute?width=200&height=200&fontSize=40&fontColor=white",
];

const WIN_MESSAGES = [
  "memories unlocked ✦",
  "there you are",
  "welcome to your archive",
  "your memories are waiting",
  "the archive is open 📼",
];

const CONFETTI_SYMBOLS = ["♥", "★", "♥", "✦", "★", "♥", "✦", "★"];
const CONFETTI_COLORS  = ["#FF8C94", "#FFD93D", "#6BCB77", "#4D9DE0", "#FF6B6B", "#C77DFF"];

interface CardState {
  uid: number;
  pairId: number;
  src: string;
  flipped: boolean;
  matched: boolean;
}

interface Props {
  mood?: number;
  onComplete: () => void;
  onClose?: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): CardState[] {
  const pool = shuffle(CAT_POOL);
  const chosen = pool.slice(0, 3);
  const pairs: CardState[] = [];
  chosen.forEach((src, pairId) => {
    pairs.push({ uid: pairId * 2,     pairId, src, flipped: false, matched: false });
    pairs.push({ uid: pairId * 2 + 1, pairId, src, flipped: false, matched: false });
  });
  return shuffle(pairs);
}

export function CatMemorama({ mood, onComplete, onClose }: Props) {
  const isSadStressed = mood !== undefined && (mood === 3 || mood === 4);

  const [cards, setCards] = useState<CardState[]>(() => buildDeck());
  const [faceUp, setFaceUp] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);
  const [prizeUid, setPrizeUid] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [winMsg] = useState(() => WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]);
  const [showConfetti, setShowConfetti] = useState(false);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const winTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flip = useCallback((uid: number) => {
    if (disabled) return;
    const card = cards.find(c => c.uid === uid);
    if (!card || card.flipped || card.matched) return;

    const nextFaceUp = [...faceUp, uid];
    setCards(prev => prev.map(c => c.uid === uid ? { ...c, flipped: true } : c));
    setFaceUp(nextFaceUp);

    if (nextFaceUp.length === 2) {
      setDisabled(true);
      const [a, b] = nextFaceUp.map(id => cards.find(c => c.uid === id)!);

      checkTimer.current = setTimeout(() => {
        if (a.pairId === b.pairId) {
          const newMatched = matchedCount + 1;
          setCards(prev => prev.map(c =>
            c.uid === a.uid || c.uid === b.uid ? { ...c, matched: true } : c
          ));
          setPrizeUid(b.uid);
          setTimeout(() => setPrizeUid(null), 1000);
          setMatchedCount(newMatched);
          setFaceUp([]);
          setDisabled(false);

          if (newMatched === 3) {
            setWon(true);
            setShowConfetti(true);
            winTimer.current = setTimeout(() => onComplete(), 2200);
          }
        } else {
          setCards(prev => prev.map(c =>
            c.uid === a.uid || c.uid === b.uid ? { ...c, flipped: false } : c
          ));
          setFaceUp([]);
          setDisabled(false);
        }
      }, 800);
    }
  }, [cards, faceUp, disabled, matchedCount, onComplete]);

  useEffect(() => () => {
    if (checkTimer.current) clearTimeout(checkTimer.current);
    if (winTimer.current)  clearTimeout(winTimer.current);
  }, []);

  const confettiParticles = Array.from({ length: 24 }, (_, i) => ({
    sym: CONFETTI_SYMBOLS[i % CONFETTI_SYMBOLS.length],
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    x: Math.random() * 340 - 20,
    delay: Math.random() * 0.4,
  }));

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'VT323', monospace",
      zIndex: 5000,
    }}>
      <AnimatePresence>
        {showConfetti && (
          <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
            {confettiParticles.map((p, i) => (
              <motion.span
                key={i}
                initial={{ x: p.x + 260, y: -20, opacity: 1, rotate: 0 }}
                animate={{ y: 520, opacity: 0, rotate: 360 }}
                transition={{ duration: 1.6, delay: p.delay, ease: "easeIn" }}
                style={{
                  position: "absolute", top: 0, left: 0,
                  color: p.color, fontSize: 18, lineHeight: 1,
                  userSelect: "none",
                }}
              >
                {p.sym}
              </motion.span>
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{
              position: "fixed", inset: 0, zIndex: 999,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{
              background: "#C0C0C0",
              border: "3px solid", borderColor: "#fff #555 #555 #fff",
              boxShadow: "2px 2px 0 #000",
              padding: "28px 36px",
              textAlign: "center",
              minWidth: 260,
            }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🐱</div>
              <div style={{ fontSize: 26, color: "#000080", marginBottom: 6 }}>{winMsg}</div>
              <div style={{ fontSize: 15, color: "#808080" }}>opening your archive...</div>
              <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 6 }}>
                {[0.2, 0.5, 0.8, 1.1].map((d, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: d }}
                    style={{ width: 8, height: 8, background: "#000080", borderRadius: "50%" }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        style={{
          background: "#C0C0C0",
          border: "2px solid", borderColor: "#fff #555 #555 #fff",
          boxShadow: "2px 2px 0 #000, 4px 4px 0 rgba(0,0,0,0.2)",
          width: 360,
          userSelect: "none",
        }}
      >
        <div style={{
          background: "linear-gradient(90deg, #000080, #1084D0)",
          color: "#fff",
          padding: "4px 6px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 17,
        }}>
          <span>📼 unlock your memories — memorama.exe</span>
          {onClose && (
            <div
              onClick={onClose}
              style={{
                width: 16, height: 16,
                background: "#C0C0C0",
                border: "2px solid", borderColor: "#fff #555 #555 #fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "#000", fontFamily: "monospace",
                cursor: "pointer", flexShrink: 0,
              }}
            >✕</div>
          )}
        </div>

        <div style={{
          borderBottom: "1px solid #808080", borderTop: "1px solid #fff",
          padding: "1px 4px", background: "#C0C0C0", fontSize: 14,
          color: "#555",
        }} />

        <div style={{ padding: "14px 16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 38, height: 38, flexShrink: 0,
              background: "#4D9DE0",
              border: "2px solid", borderColor: "#fff #333 #333 #fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>
              🐱
            </div>
            <div>
              <div style={{ fontSize: 18, lineHeight: 1.2 }}>
                {isSadStressed
                  ? "take your time — just match the cats 💛"
                  : "match the cats to open the archive"}
              </div>
              <div style={{ fontSize: 14, color: "#808080" }}>no timer, no pressure ✦</div>
            </div>
          </div>

          <div style={{
            height: 0, borderTop: "1px solid #808080", borderBottom: "1px solid #fff",
            margin: "10px 0",
          }} />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            justifyItems: "center",
          }}>
            {cards.map(card => (
              <MemCard
                key={card.uid}
                card={card}
                isPrize={card.uid === prizeUid}
                onClick={() => flip(card.uid)}
              />
            ))}
          </div>

          <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 8 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: "50%",
                background: i < matchedCount ? "#2d6a4f" : "#C0C0C0",
                border: "2px solid", borderColor: i < matchedCount ? "#52b788 #1b4332 #1b4332 #52b788" : "#fff #808080 #808080 #fff",
                transition: "background 0.3s",
              }} />
            ))}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: "#808080", textAlign: "right" }}>
            personalOS · memorama.exe v1.0
          </div>
        </div>
      </motion.div>

      <style>{`
        .memcard-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .memcard-inner.flipped { transform: rotateY(180deg); }
        .memcard-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .memcard-front { transform: rotateY(180deg); }
        @keyframes cardBounce {
          0%   { transform: rotateY(180deg) scale(1); }
          30%  { transform: rotateY(180deg) scale(1.18); }
          60%  { transform: rotateY(180deg) scale(0.96); }
          80%  { transform: rotateY(180deg) scale(1.06); }
          100% { transform: rotateY(180deg) scale(1); }
        }
        .memcard-inner.prize { animation: cardBounce 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}

function MemCard({ card, isPrize, onClick }: {
  card: CardState;
  isPrize: boolean;
  onClick: () => void;
}) {
  const isFlipped = card.flipped || card.matched;
  const innerClass = ["memcard-inner", isFlipped ? "flipped" : "", isPrize ? "prize" : ""].join(" ").trim();

  return (
    <div
      onClick={onClick}
      style={{
        width: 90, height: 90,
        perspective: 600,
        cursor: card.matched ? "default" : "pointer",
      }}
    >
      <div className={innerClass}>
        <div
          className="memcard-face memcard-back"
          style={{
            background: "#4D9DE0",
            border: "3px solid", borderColor: "#6BB8F0 #1a5c8a #1a5c8a #6BB8F0",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.15)",
          }}
        >
          <span style={{ fontSize: 32, color: "#fff", opacity: 0.9, fontFamily: "'VT323', monospace" }}>?</span>
        </div>

        <div
          className="memcard-face memcard-front"
          style={{
            borderColor: card.matched
              ? "#52b788 #1b4332 #1b4332 #52b788"
              : "#fff #555 #555 #fff",
            border: "3px solid",
            overflow: "hidden",
            background: "#f0f0f0",
          }}
        >
          <img
            src={card.src}
            alt="cat meme"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          {card.matched && (
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(82,183,136,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 22, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}>✓</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
