import React, { useState } from "react";

// ── PNG imports — source: src/imports/Components/ ────────────────────────────
import imgDogNormal   from "../../imports/Components/a3aba56236df3e009899cd44748fa3fb2594fa79.png";
import imgDogHappy    from "../../imports/Components/59c40a89acd3ab948e3263faae34307ba96321fa.png";
import imgDogConfused from "../../imports/Components/5407b76004e7109ebc0dcf3bbe817db65d022a97.png";

import imgChickenNormal  from "../../imports/Components/056daea3e23b85874a49f9d1b3b55df9d7feed37.png";
import imgChickenHappy   from "../../imports/Components/74c08537e9de651c965c833cbc886a83e5e4a738.png";
import imgChickenPlayful from "../../imports/Components/3e29485db4913e0708819862c4f1453f05f97922.png";

import imgCowNormal  from "../../imports/Components/54667fa33104887699e98cc0e1aedb92740d9cae.png";
import imgCowHappy   from "../../imports/Components/989e96204bea6dafb606addfa5db712ea83caeea.png";
import imgCowConfused from "../../imports/Components/d8e84de11d81e7ad71d442ce59d8c9903a8fe9c3.png";
import imgCowPlayful from "../../imports/Components/2ed10909bb2638c27348ac6c86713935f3761fba.png";
import imgCowOvni    from "../../imports/Components/6a5d98d52abac04c850504a40bec3082f2d6e1ae.png";

import imgRedpandaNormal  from "../../imports/Components/cee63fc307e538e4ec31b3975d61e5405437ad27.png";
import imgRedpandaHappy   from "../../imports/Components/3cfa2e471442d59dbb15f6c41ed83ca98ec5a20e.png";
import imgRedpandaConfused from "../../imports/Components/39d9aeaff80c23ae2719613d5b745ee3a91016b7.png";
import imgRedpandaPlayful from "../../imports/Components/dae2e8845ab007c9887c0b1d3caa3e618a3252eb.png";

import imgCatNormal  from "../../imports/Components/1965e60cdcba599dd7556ea4f58d3193ec4a6034.png";
import imgCatHappy   from "../../imports/Components/aa86590ac4174c2e15bc0d114f96c5d98c794ec9.png";
import imgCatConfused from "../../imports/Components/178e5cd6754d7a600167027a3df909797d74bf67.png";

import imgFrogRana   from "../../imports/Components/08fb1d99544cf4c99b3d4920e266417e5a8f6b97.png";
import imgFrogHappy  from "../../imports/Components/1703b902a931ac8f4a771ab14f1733c72d26a810.png";
import imgFrogConfused from "../../imports/Components/6264ea720fb7153d7c62ebed9790cb4b7084c437.png";

// ── Types ────────────────────────────────────────────────────────────────────

export type PetPose = "normal" | "happy" | "confused" | "playful" | "ovni" | "rana";

type AnimalPoses = Partial<Record<PetPose, string>>;

// companion id → asset key (now 1:1)
const COMPANION_TO_ASSET: Record<string, string> = {
  cat:      "cat",
  dog:      "dog",
  chicken:  "chicken",
  cow:      "cow",
  redpanda: "redpanda",
  frog:     "frog",
};

const PET_IMAGES: Record<string, AnimalPoses> = {
  dog: {
    normal:  imgDogNormal,
    happy:   imgDogHappy,
    confused: imgDogConfused,
    // playful → fallback to normal
  },
  chicken: {
    normal:  imgChickenNormal,
    happy:   imgChickenHappy,
    playful: imgChickenPlayful,
    // confused → fallback to normal
  },
  cow: {
    normal:  imgCowNormal,
    happy:   imgCowHappy,
    confused: imgCowConfused,
    playful: imgCowPlayful,
    ovni:    imgCowOvni,
  },
  redpanda: {
    normal:  imgRedpandaNormal,
    happy:   imgRedpandaHappy,
    confused: imgRedpandaConfused,
    playful: imgRedpandaPlayful,
  },
  cat: {
    normal:  imgCatNormal,
    happy:   imgCatHappy,
    confused: imgCatConfused,
    // playful → fallback to normal
  },
  frog: {
    rana:    imgFrogRana,
    happy:   imgFrogHappy,
    confused: imgFrogConfused,
    // normal maps to rana for frog
  },
};

// For frog the resting pose is named "rana", not "normal"
function getIdlePose(companionId: string): PetPose {
  return companionId === "frog" ? "rana" : "normal";
}

function resolveImage(companionId: string, pose: PetPose): string {
  const assetId = COMPANION_TO_ASSET[companionId] ?? "dog";
  const map = PET_IMAGES[assetId] ?? PET_IMAGES.dog;
  // Normalise: "normal" → "rana" for frog, frog has no "normal" key
  const key: PetPose = (assetId === "frog" && pose === "normal") ? "rana" : pose;
  return map[key] ?? map.normal ?? map.rana ?? imgDogNormal;
}

// Exported so CompanionPicker can show idle previews
export function getCompanionIdleImage(companionId: string): string {
  return resolveImage(companionId, getIdlePose(companionId));
}

// ── Pose resolution (pure, no timers) ────────────────────────────────────────

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

// ── Tooltips ─────────────────────────────────────────────────────────────────

const POSE_TOOLTIPS: Record<PetPose, string[]> = {
  normal:  ["psst.. click something!", "i'm here with you~", "need a snack break? 🍪", "you're doing great!"],
  rana:    ["ribbit… nice and calm.", "patient as ever 🌿", "no judgement here~"],
  happy:   ["yay!! you did it! 🎉", "so proud of you!!", "best day ever!!"],
  confused: ["it's okay to feel lost 💙", "we'll figure it out together.", "one step at a time~"],
  playful: ["let's gooo!! 🌸", "full energy today!", "you're on fire!!"],
  ovni:    ["🛸 beep boop… special day!", "the universe noticed you!", "achievement unlocked 🛸"],
};

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  companionId: string;
  mood?: "blooming" | "neutral" | "healing";
  intentionJustCompleted?: boolean;
  allIntentionsDone?: boolean;
  showOvni?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export function PixelPet({
  companionId,
  mood,
  intentionJustCompleted = false,
  allIntentionsDone = false,
  showOvni = false,
}: Props) {
  const [showTip, setShowTip] = useState(false);

  const pose = resolvePose(companionId, mood, intentionJustCompleted, allIntentionsDone, showOvni);
  const imgSrc = resolveImage(companionId, pose);
  const tips = POSE_TOOLTIPS[pose];
  const tip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div
      style={{ position: "relative", width: 64, height: 80, cursor: "pointer" }}
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
      <img
        src={imgSrc}
        alt={pose}
        style={{
          width: 64, height: 80,
          objectFit: "contain",
          imageRendering: "pixelated",
          display: "block",
        }}
      />
    </div>
  );
}
