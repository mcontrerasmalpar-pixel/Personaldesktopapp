import React, { useState } from "react";

export type PetPose = "normal" | "happy" | "confused" | "playful" | "ovni" | "rana";

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
  if (mood === "healing") return "confused";
  if (companionId === "frog") return "rana";
  return "normal";
}

const POSE_TOOLTIPS: Record<PetPose, string[]> = {
  normal:   ["psst.. click something!", "i'm here with you~", "need a snack break? 🍪", "you're doing great!"],
  rana:     ["ribbit… nice and calm.", "patient as ever 🌿", "no judgement here~"],
  happy:    ["yay!! you did it! 🎉", "so proud of you!!", "best day ever!!"],
  confused: ["it's okay to feel lost 💙", "we'll figure it out together.", "one step at a time~"],
  playful:  ["let's gooo!! 🌸", "full energy today!", "you're on fire!!"],
  ovni:     ["🛸 beep boop… special day!", "the universe noticed you!", "achievement unlocked 🛸"],
};

// ── SVG pets ────────────────────────────────────────────────────────────────

function CatSVG({ pose }: { pose: PetPose }) {
  const tailColor = pose === "happy" ? "#FFD700" : "#C4903A";
  return (
    <svg width="120" height="100" viewBox="0 0 120 100">
      <g fontSize="9" fontFamily="monospace">
        <text x="25" y="65" fill="#D4A054">× × × × × × ×</text>
        <text x="22" y="74" fill="#C4903A">× × × × × × × ×</text>
        <text x="20" y="83" fill="#D4A054">× × × × × × × × ×</text>
        <text x="25" y="92" fill="#8B7355">× × × × × × ×</text>
        <text x="30" y="65" fill="#8B6914" fontSize={8}>| | | | |</text>
        <text x="28" y="74" fill="#8B6914" fontSize={8}>| | | | | |</text>
      </g>
      <g fill="none" stroke="#C4903A" strokeWidth="1">
        {[20,26,32,38,44,50,56,62,68,74,80,85].map((cx,i) => (
          <ellipse key={i} cx={cx} cy={i < 8 ? 70 : 70+(i-7)*5} rx="3" ry="2"/>
        ))}
        {[80,74,68,62,56,50,44,38,32,26,20].map((cx,i) => (
          <ellipse key={i} cx={cx} cy="93" rx="3" ry="2"/>
        ))}
      </g>
      <g fill="none" stroke="#C4903A" strokeWidth="1">
        {[[24,50],[28,47],[33,45],[38,44],[43,44],[48,45],[52,47],[55,50],[55,55],[52,59],[24,55],[24,60]].map(([cx,cy],i) => (
          <ellipse key={i} cx={cx} cy={cy} rx="3" ry="2"/>
        ))}
      </g>
      <polygon points="26,44 30,36 36,44" fill="none" stroke="#C4903A" strokeWidth="1"/>
      <polygon points="46,44 50,36 54,44" fill="none" stroke="#C4903A" strokeWidth="1"/>
      <circle cx="33" cy="52" r="2.5" fill="#111"/>
      <circle cx="46" cy="52" r="2.5" fill="#111"/>
      {pose === "happy" && <><circle cx="33" cy="52" r="1.2" fill="#fff"/><circle cx="46" cy="52" r="1.2" fill="#fff"/></>}
      <ellipse cx="39" cy="57" rx="3" ry="2" fill="#F4A0A0" stroke="#E08080" strokeWidth="0.5"/>
      {pose === "happy"
        ? <path d="M34,59 Q39,64 44,59" fill="none" stroke="#C4903A" strokeWidth="1.2"/>
        : <path d="M34,60 Q39,62 44,60" fill="none" stroke="#C4903A" strokeWidth="1"/>}
      <line x1="20" y1="56" x2="32" y2="57" stroke="#888" strokeWidth="0.7"/>
      <line x1="20" y1="59" x2="32" y2="58" stroke="#888" strokeWidth="0.7"/>
      <line x1="48" y1="57" x2="60" y2="56" stroke="#888" strokeWidth="0.7"/>
      <line x1="48" y1="58" x2="60" y2="59" stroke="#888" strokeWidth="0.7"/>
      <path d="M85,82 Q105,70 100,55" fill="none" stroke={tailColor} strokeWidth="2"/>
      <g fill="none" stroke={tailColor} strokeWidth="1">
        <ellipse cx="90" cy="75" rx="3" ry="2" transform="rotate(-30,90,75)"/>
        <ellipse cx="96" cy="68" rx="3" ry="2" transform="rotate(-50,96,68)"/>
        <ellipse cx="100" cy="60" rx="3" ry="2" transform="rotate(-70,100,60)"/>
      </g>
      <text x="20" y="99" fill="#111" fontSize="7" fontFamily="monospace">|||</text>
      <text x="65" y="99" fill="#111" fontSize="7" fontFamily="monospace">|||</text>
    </svg>
  );
}

function DogSVG({ pose }: { pose: PetPose }) {
  return (
    <svg width="120" height="110" viewBox="0 0 120 110">
      <g fontSize="9" fontFamily="monospace">
        <text x="30" y="65" fill="#C8B89A">× × × × × ×</text>
        <text x="28" y="74" fill="#B8A88A">× × × × × × ×</text>
        <text x="28" y="83" fill="#C8B89A">× × × × × × ×</text>
      </g>
      <g fill="none" stroke="#A89070" strokeWidth="1">
        {[[28,60],[34,58],[40,57],[46,57],[52,57],[58,57],[64,58],[70,60],[75,64],[78,69],[78,75],[78,81],[75,87]].map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="3" ry="2"/>
        ))}
        {[[68,90],[62,90],[56,90],[50,90],[44,90],[38,90],[32,90],[28,87],[25,82],[25,76],[25,70]].map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="3" ry="2"/>
        ))}
      </g>
      <g fill="none" stroke="#A89070" strokeWidth="1">
        {[[20,40],[24,36],[29,33],[35,32],[41,32],[47,33],[52,36],[55,40],[55,46],[52,51],[20,46],[22,52]].map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="3" ry="2"/>
        ))}
      </g>
      <path d="M18,38 Q8,50 12,62" fill="none" stroke="#A89070" strokeWidth="1.5"/>
      <g fill="none" stroke="#A89070" strokeWidth="1">
        <ellipse cx="13" cy="44" rx="3" ry="2" transform="rotate(20,13,44)"/>
        <ellipse cx="10" cy="52" rx="3" ry="2" transform="rotate(30,10,52)"/>
        <ellipse cx="11" cy="60" rx="3" ry="2" transform="rotate(10,11,60)"/>
      </g>
      <g fill="none" stroke="#8B7050" strokeWidth="1">
        <ellipse cx="32" cy="30" rx="4" ry="3"/><ellipse cx="38" cy="28" rx="4" ry="3"/><ellipse cx="44" cy="29" rx="4" ry="3"/>
      </g>
      <circle cx="31" cy="43" r="2.5" fill="#111"/>
      <circle cx="44" cy="43" r="2.5" fill="#111"/>
      {pose === "happy" && <><circle cx="30" cy="42" r="1" fill="#fff"/><circle cx="43" cy="42" r="1" fill="#fff"/></>}
      <circle cx="30" cy="49" r="3" fill="#111"/>
      {pose === "happy"
        ? <path d="M32,53 Q38,58 44,53" fill="none" stroke="#333" strokeWidth="1.2"/>
        : <path d="M32,52 Q38,55 44,52" fill="none" stroke="#333" strokeWidth="1"/>}
      <g fill="none" stroke="#A89070" strokeWidth="1">
        <ellipse cx="32" cy="58" rx="3" ry="2"/><ellipse cx="38" cy="57" rx="3" ry="2"/>
        <ellipse cx="44" cy="57" rx="3" ry="2"/><ellipse cx="50" cy="58" rx="3" ry="2"/>
      </g>
      <ellipse cx="41" cy="61" rx="3" ry="3" fill="none" stroke="#FFD700" strokeWidth="1.5"/>
      <path d="M78,65 Q95,55 90,42" fill="none" stroke="#A89070" strokeWidth="1.5"/>
      <g fill="none" stroke="#A89070" strokeWidth="1">
        <ellipse cx="84" cy="59" rx="3" ry="2" transform="rotate(-40,84,59)"/>
        <ellipse cx="89" cy="52" rx="3" ry="2" transform="rotate(-60,89,52)"/>
        <ellipse cx="91" cy="45" rx="3" ry="2" transform="rotate(-80,91,45)"/>
      </g>
      <g fill="none" stroke="#A89070" strokeWidth="1">
        <ellipse cx="36" cy="95" rx="3" ry="2"/><ellipse cx="42" cy="97" rx="3" ry="2"/>
        <ellipse cx="60" cy="95" rx="3" ry="2"/><ellipse cx="66" cy="97" rx="3" ry="2"/>
      </g>
      <text x="32" y="104" fill="#111" fontSize="7" fontFamily="monospace">|||</text>
      <text x="58" y="104" fill="#111" fontSize="7" fontFamily="monospace">|||</text>
    </svg>
  );
}

function FrogSVG({ pose }: { pose: PetPose }) {
  const bodyColor = pose === "happy" ? "#7DC57D" : "#6DB56D";
  return (
    <svg width="110" height="100" viewBox="0 0 110 100">
      <g fontSize="9" fontFamily="monospace">
        <text x="25" y="65" fill={bodyColor}>× × × × × ×</text>
        <text x="22" y="74" fill="#5A9E5A">× × × × × × ×</text>
        <text x="25" y="83" fill={bodyColor}>× × × × × ×</text>
      </g>
      <g fill="none" stroke="#4A8A4A" strokeWidth="1">
        {[[25,60],[31,58],[37,57],[43,57],[49,57],[55,57],[61,58],[67,60],[70,65],[70,71],[70,77],[67,83],[61,87],[55,88],[49,88],[43,88],[37,87],[31,83],[28,77],[28,71],[28,65]].map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="3" ry="2"/>
        ))}
      </g>
      <circle cx="36" cy="48" r="8" fill="none" stroke="#4A8A4A" strokeWidth="1"/>
      <circle cx="62" cy="48" r="8" fill="none" stroke="#4A8A4A" strokeWidth="1"/>
      <g fontSize="8" fontFamily="monospace" fill="#5A9E5A">
        <text x="30" y="52">× ×</text><text x="56" y="52">× ×</text>
      </g>
      <circle cx="36" cy="48" r="3.5" fill="#111"/>
      <circle cx="62" cy="48" r="3.5" fill="#111"/>
      <circle cx="35" cy="47" r="1" fill="#fff"/>
      <circle cx="61" cy="47" r="1" fill="#fff"/>
      {pose === "happy"
        ? <path d="M33,68 Q49,78 65,68" fill="none" stroke="#4A8A4A" strokeWidth="1.5"/>
        : <path d="M36,70 Q49,78 62,70" fill="none" stroke="#4A8A4A" strokeWidth="1.5"/>}
      <path d="M28,75 Q10,80 8,92" fill="none" stroke="#4A8A4A" strokeWidth="1.5"/>
      <path d="M70,75 Q88,80 90,92" fill="none" stroke="#4A8A4A" strokeWidth="1.5"/>
      <text x="4" y="97" fill="#4A8A4A" fontSize="8" fontFamily="monospace">~~ ~~</text>
      <text x="86" y="97" fill="#4A8A4A" fontSize="8" fontFamily="monospace">~~ ~~</text>
    </svg>
  );
}

function CowSVG({ pose }: { pose: PetPose }) {
  return (
    <svg width="130" height="110" viewBox="0 0 130 110">
      <g fontSize="9" fontFamily="monospace">
        <text x="28" y="65" fill="#E8E0D0">× × × × × × ×</text>
        <text x="25" y="74" fill="#D8D0C0">× × × × × × × ×</text>
        <text x="25" y="83" fill="#E8E0D0">× × × × × × × ×</text>
        <text x="38" y="65" fill="#8B7355">× × ×</text>
        <text x="55" y="74" fill="#8B7355">× × ×</text>
        <text x="35" y="83" fill="#8B7355">× ×</text>
      </g>
      <g fill="none" stroke="#A89878" strokeWidth="1">
        {[[25,60],[31,58],[37,57],[43,57],[49,57],[55,57],[61,57],[67,57],[73,58],[79,60],[84,65],[84,71],[84,77],[84,83],[82,89],[76,92],[70,92],[64,92],[58,92],[52,92],[46,92],[40,92],[34,92],[28,89],[25,83],[25,77],[25,71]].map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="3" ry="2"/>
        ))}
      </g>
      <g fill="none" stroke="#A89878" strokeWidth="1">
        {[[22,38],[27,34],[33,31],[39,30],[45,30],[51,31],[56,34],[60,38],[61,44],[58,50],[22,44],[24,50]].map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="3" ry="2"/>
        ))}
      </g>
      <line x1="30" y1="30" x2="26" y2="20" stroke="#C8B89A" strokeWidth="2"/>
      <line x1="50" y1="30" x2="54" y2="20" stroke="#C8B89A" strokeWidth="2"/>
      <circle cx="33" cy="41" r="2.5" fill="#111"/>
      <circle cx="49" cy="41" r="2.5" fill="#111"/>
      {pose === "happy" && <><circle cx="32" cy="40" r="1" fill="#fff"/><circle cx="48" cy="40" r="1" fill="#fff"/></>}
      <ellipse cx="41" cy="48" rx="6" ry="4" fill="#F4C0B0" stroke="#E09080" strokeWidth="0.8"/>
      <circle cx="39" cy="48" r="1.2" fill="#C07060"/>
      <circle cx="43" cy="48" r="1.2" fill="#C07060"/>
      {pose === "happy" && <path d="M36,52 Q41,57 46,52" fill="none" stroke="#E09080" strokeWidth="1.2"/>}
      <g fill="none" stroke="#A89878" strokeWidth="1">
        <ellipse cx="38" cy="56" rx="3" ry="2"/><ellipse cx="44" cy="55" rx="3" ry="2"/><ellipse cx="50" cy="56" rx="3" ry="2"/>
      </g>
      <ellipse cx="44" cy="60" rx="4" ry="4" fill="none" stroke="#FFD700" strokeWidth="1.5"/>
      {pose === "ovni" && (
        <g>
          <ellipse cx="54" cy="30" rx="18" ry="8" fill="none" stroke="#9B59B6" strokeWidth="1.5"/>
          <ellipse cx="54" cy="28" rx="10" ry="5" fill="none" stroke="#3498DB" strokeWidth="1"/>
          <text x="48" y="20" fontSize="14">🛸</text>
        </g>
      )}
      <g fill="none" stroke="#A89878" strokeWidth="1">
        <ellipse cx="38" cy="97" rx="3" ry="2"/><ellipse cx="44" cy="99" rx="3" ry="2"/>
        <ellipse cx="62" cy="97" rx="3" ry="2"/><ellipse cx="68" cy="99" rx="3" ry="2"/>
      </g>
      <text x="34" y="106" fill="#333" fontSize="7" fontFamily="monospace">||  ||</text>
      <text x="59" y="106" fill="#333" fontSize="7" fontFamily="monospace">||  ||</text>
      <path d="M84,70 Q98,60 96,48" fill="none" stroke="#A89878" strokeWidth="1.5"/>
      <text x="92" y="46" fill="#A89878" fontSize="9" fontFamily="monospace">o</text>
    </svg>
  );
}

function RedPandaSVG({ pose }: { pose: PetPose }) {
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <g fontSize="9" fontFamily="monospace">
        <text x="25" y="65" fill="#C4552A">× × × × × ×</text>
        <text x="22" y="74" fill="#B4451A">× × × × × × ×</text>
        <text x="25" y="83" fill="#C4552A">× × × × × ×</text>
      </g>
      <g fill="none" stroke="#A03A15" strokeWidth="1">
        {[[25,60],[31,58],[37,57],[43,57],[49,57],[55,57],[61,58],[67,60],[70,65],[70,71],[70,77],[67,83],[61,87],[55,88],[49,88],[43,88],[37,87],[31,83],[28,77],[28,71],[28,65]].map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="3" ry="2"/>
        ))}
      </g>
      <g fill="none" stroke="#A03A15" strokeWidth="1">
        {[[26,42],[31,38],[37,35],[43,34],[49,34],[55,35],[60,38],[64,42],[64,48],[61,53],[26,48],[28,53]].map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="3" ry="2"/>
        ))}
      </g>
      <circle cx="32" cy="33" r="6" fill="none" stroke="#A03A15" strokeWidth="1.2"/>
      <circle cx="58" cy="33" r="6" fill="none" stroke="#A03A15" strokeWidth="1.2"/>
      <circle cx="32" cy="33" r="3" fill="#F4A0A0" opacity="0.7"/>
      <circle cx="58" cy="33" r="3" fill="#F4A0A0" opacity="0.7"/>
      <g fontSize="8" fontFamily="monospace" fill="#FFF8F0">
        <text x="33" y="47">× ×</text><text x="48" y="47">× ×</text>
      </g>
      <circle cx="36" cy="45" r="2.5" fill="#111"/>
      <circle cx="54" cy="45" r="2.5" fill="#111"/>
      <circle cx="35" cy="44" r="1" fill="#fff"/>
      <circle cx="53" cy="44" r="1" fill="#fff"/>
      <ellipse cx="45" cy="51" rx="3" ry="2" fill="#111"/>
      {pose === "happy" && <path d="M38,54 Q45,59 52,54" fill="none" stroke="#A03A15" strokeWidth="1.2"/>}
      <path d="M70,72 Q90,68 100,80 Q105,90 95,95" fill="none" stroke="#A03A15" strokeWidth="3"/>
      <path d="M70,72 Q90,68 100,80 Q105,90 95,95" fill="none" stroke="#E8D0A0" strokeWidth="1.5" strokeDasharray="4,4"/>
      <text x="32" y="98" fill="#111" fontSize="7" fontFamily="monospace">|||</text>
      <text x="56" y="98" fill="#111" fontSize="7" fontFamily="monospace">|||</text>
    </svg>
  );
}

function ChickenSVG({ pose }: { pose: PetPose }) {
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <g fontSize="9" fontFamily="monospace">
        <text x="28" y="65" fill="#E8DFC8">× × × × × ×</text>
        <text x="25" y="74" fill="#D8CFC0">× × × × × × ×</text>
        <text x="28" y="83" fill="#E8DFC8">× × × × × ×</text>
      </g>
      <g fill="none" stroke="#B0A888" strokeWidth="1">
        {[[28,60],[34,58],[40,57],[46,57],[52,57],[58,57],[64,58],[68,62],[68,68],[68,74],[65,80],[60,85],[54,87],[48,87],[42,87],[36,85],[30,80],[27,74],[27,68],[27,62]].map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="3" ry="2"/>
        ))}
      </g>
      <path d="M62,62 Q80,68 75,80" fill="none" stroke="#B0A888" strokeWidth="1.5"/>
      <g fontSize="8" fontFamily="monospace" fill="#B0A888">
        <text x="68" y="68">×</text><text x="71" y="74">×</text><text x="70" y="80">×</text>
      </g>
      <g fill="none" stroke="#B0A888" strokeWidth="1">
        {[[28,40],[33,36],[39,34],[45,33],[51,34],[56,37],[59,41],[59,47],[56,52],[28,46],[30,52]].map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="3" ry="2"/>
        ))}
      </g>
      <path d="M36,33 Q38,24 40,28 Q42,20 44,25 Q46,18 48,24 Q50,19 52,25" fill="none" stroke="#CC3333" strokeWidth="2"/>
      <polygon points="43,50 50,48 43,55" fill="#E8A020" stroke="#C88010" strokeWidth="0.8"/>
      <circle cx="38" cy="43" r="2.5" fill="#111"/>
      <circle cx="37" cy="42" r="1" fill="#fff"/>
      {pose === "happy" && <path d="M36,52 Q43,57 50,52" fill="none" stroke="#B0A888" strokeWidth="1.2"/>}
      <ellipse cx="40" cy="55" rx="4" ry="5" fill="none" stroke="#CC3333" strokeWidth="1.2"/>
      <line x1="40" y1="87" x2="36" y2="100" stroke="#E8A020" strokeWidth="1.5"/>
      <line x1="50" y1="87" x2="54" y2="100" stroke="#E8A020" strokeWidth="1.5"/>
      <text x="30" y="105" fill="#E8A020" fontSize="8" fontFamily="monospace">^^^</text>
      <text x="50" y="105" fill="#E8A020" fontSize="8" fontFamily="monospace">^^^</text>
    </svg>
  );
}

const PET_COMPONENTS: Record<string, React.FC<{ pose: PetPose }>> = {
  cat:      CatSVG,
  dog:      DogSVG,
  frog:     FrogSVG,
  cow:      CowSVG,
  redpanda: RedPandaSVG,
  chicken:  ChickenSVG,
};

export function getCompanionIdleImage(_companionId: string): string {
  return "";
}

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
  const tips = POSE_TOOLTIPS[pose];
  const tip = tips[Math.floor(Math.random() * tips.length)];
  const PetSVG = PET_COMPONENTS[companionId] ?? PET_COMPONENTS.cat;

  return (
    <div
      style={{ position: "relative", cursor: "pointer", display: "inline-block" }}
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
      <PetSVG pose={pose} />
    </div>
  );
}
