import React, { useState } from "react";

// ── Emoji-based pet rendering (replaces missing PNG assets) ──────────────────

export type PetPose = "normal" | "happy" | "confused" | "playful" | "ovni" | "rana";

type AnimalEmojis = Partial<Record<PetPose, string>>;

const PET_EMOJIS: Record<string, AnimalEmojis> = {
  cat: {
    normal:  "🐱",
    happy:   "😺",
    confused: "😿",
    playful: "😻",
  },
  dog: {
    normal:  "🐶",
    happy:   "🐕",
    confused: "🐩",
    playful: "🦎",
  },
  chicken: {
    normal:  "🐔",
    happy:   "🐣",
    playful: "🦚",
    confused: "🐦",
  },
  cow: {
    normal:  "🐮",
    happy:   "🐄",
    confused: "🐃",
    playful: "🐂",
    ovni:    "🐮🛸",
  },
  redpanda: {
    normal:  "🦝",
    happy:   "🦝",
    confused: "🦝",
    playful: "🦝",
  },
  frog: {
    rana:    "🐸",
    happy:   "🐸",
    confused: "🐸",
    normal:  "🐸",
  },
};

function getIdlePose(companionId: string): PetPose {
  return companionId === "frog" ? "rana" : "normal";
}

function resolveEmoji(companionId: string, pose: PetPose): string {
  const map = PET_EMOJIS[companionId] ?? PET_EMOJIS.cat;
  const key: PetPose = (companionId === "frog" && pose === "normal") ? "rana" : pose;
  return map[key] ?? map.normal ?? map.rana ?? "🐱";
}

export function getCompanionIdleImage(companionId: string): string {
  // Returns empty string since we use emoji rendering now
  return "";
}

function resolvePose(
  companionId: string,
  mood: "blooming" | "neutral" | "healing" | undefined,
  intentionJustCompleted: boolean,
  allIntentionsDone: boolean,
  showOvni: boolean,
): PetPose {
  if (showOvni && companionId === "cow") return "ovni";
  if (allIntentionsDone || intentionJustCompleted) return "happy";
  if (mood === "blooming") return "playful";
  if (mood === "healing")  return "confused";
  return getIdlePose(companionId);
}

const POSE_TOOLTIPS: Record<PetPose, string[]> = {
  normal:  ["psst.. click something!", "i'm here with you~", "need a snack break? 🍪", "you're doing great!"],
  rana:    ["ribbit… nice and calm.", "patient as ever 🌿", "no judgement here~"],
  happy:   ["yay!! you did it! 🎉", "so proud of you!!", "best day ever!!"],
  confused: ["it's okay to feel lost 💙", "we'll figure it out together.", "one step at a time~"],
  playful: ["let's gooo!! 🌸", "full energy today!", "you're on fire!!"],
  ovni:    ["🛸 beep boop… special day!", "the universe noticed you!", "achievement unlocked 🛸"],
};

interface Props {
  companionId: string;
  mood?: "blooming" | "neutral" | "healing";
  intentionJustCompleted?: boolean;
  allIntentionsDone?: boolean;
  showOvni?: boolean;
}

export function PixelPet({
  companionId,
  mood,
  intentionJustCompleted = false,
  allIntentionsDone = false,
  showOvni = false,
}: Props) {
  const [showTip, setShowTip] = useState(false);

  const pose = resolvePose(companionId, mood, intentionJustCompleted, allIntentionsDone, showOvni);
  const emoji = resolveEmoji(companionId, pose);
  const tips = POSE_TOOLTIPS[pose];
  const tip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div
      style={{ position: "relative", width: 64, height: 80, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      {showTip && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 4px)",
          right: 0,
          background: "#ffffc0",
          border: "1px solid #000",
          padding: "4px 8px",
          fontSize: 13,
          fontFamily: "'VT323', monospace",
          whiteSpace: "nowrap",
          zIndex: 9999,
          lineHeight: 1.2,
        }}>
          {tip}
          <div style={{
            position: "absolute", bottom: -5, right: 12,
            width: 0, height: 0,
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: "5px solid #000",
          }} />
        </div>
      )}
      <span style={{ fontSize: 42, lineHeight: 1, userSelect: "none" }}>{emoji}</span>
    </div>
  );
}
