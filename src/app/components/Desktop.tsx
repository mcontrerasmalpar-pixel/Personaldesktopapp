import React, { useState, useCallback, useRef, useEffect } from "react";
import { CatMemorama } from "./CatMemorama";
import { DraggableWindow } from "./DraggableWindow";
import { Taskbar } from "./Taskbar";
import { PixelPet } from "./PixelPet";
import { MySpaceWindow } from "./windows/MySpaceWindow";
import { MemoriesWindow } from "./windows/MemoriesWindow";
import { JournalWindow } from "./windows/JournalWindow";
import { GoalsWindow } from "./windows/GoalsWindow";
import { PolaroidWidget } from "./PolaroidWidget";
import { WallpaperPicker, WallpaperOption, WALLPAPERS } from "./WallpaperPicker";
import { CompanionPicker } from "./CompanionPicker";
import { WeatherWidget } from "./WeatherWidget";
import { MeaningBoardWidget } from "./MeaningBoardWidget";
import { TimeWindow } from "./windows/TimeWindow";

const MOOD_BG: Record<number, string> = {
  0: "#F0E5C0",
  1: "#F2DFD5",
  2: "#D8ECEA",
  3: "#CDD6DB",
  4: "#F0D8D8",
};

const FOLDER_YELLOW = "#FFC83A";

interface WindowState {
  id: string;
  open: boolean;
  minimized: boolean;
  zIndex: number;
}

type WindowId = "myspace" | "memories" | "journal" | "goals";

const WINDOW_CONFIGS: {
  id: WindowId;
  title: string;
  label: string;
  color: string;
  initialPos: { x: number; y: number };
  width: number;
  minHeight: number;
  desktopIconHidden?: boolean;
  iconType?: "folder" | "blob";
}[] = [
  { id: "myspace",  title: "My Space",  label: "my space",  color: "#E76F51", initialPos: { x: 80,  y: 80  }, width: 480, minHeight: 420, iconType: "folder" },
  { id: "memories", title: "Memories",  label: "memories",  color: "#2A9D8F", initialPos: { x: 240, y: 80  }, width: 520, minHeight: 440, iconType: "folder" },
  { id: "journal",  title: "Journal",   label: "journal",   color: "#E9C46A", initialPos: { x: 560, y: 80  }, width: 440, minHeight: 360, desktopIconHidden: true },
  { id: "goals",    title: "Goals",     label: "goals",     color: "#264653", initialPos: { x: 580, y: 100 }, width: 480, minHeight: 500, desktopIconHidden: true },
];

const DEFAULT_ICON_POSITIONS: Record<string, { x: number; y: number }> = {
  myspace:      { x: 20, y: 56  },
  memories:     { x: 20, y: 144 },
  timecapsule:  { x: 20, y: 232 },
};

type CapsuleState = "empty" | "sealed" | "ready";

function getCapsuleState(): CapsuleState {
  try {
    const caps: Array<{ openDate: string }> = JSON.parse(localStorage.getItem("personalos_capsules") ?? "[]");
    if (caps.length === 0) return "empty";
    const last = caps[caps.length - 1];
    const open = new Date(last.openDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    open.setHours(0, 0, 0, 0);
    return open <= today ? "ready" : "sealed";
  } catch { return "empty"; }
}

interface Props {
  username: string;
  initialMood?: number;
  journalText?: string;
  onJournalSaved?: (text: string) => void;
}

export function Desktop({ username, initialMood, journalText = "", onJournalSaved }: Props) {
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>(
    Object.fromEntries(
      WINDOW_CONFIGS.map((c, i) => [c.id, { id: c.id, open: false, minimized: false, zIndex: 100 + i }])
    ) as Record<WindowId, WindowState>
  );
  const [topZ, setTopZ]     = useState(200);
  const [activeId, setActiveId] = useState<WindowId | null>(null);
  const [doubleClickTimer, setDoubleClickTimer] = useState<Record<string, number>>({});
  const [selectedMood, setSelectedMood] = useState<number | null>(initialMood ?? null);
  const [petHappy, setPetHappy]         = useState(false);
  const petHappyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [wallpaper, setWallpaper]       = useState<WallpaperOption | null>(null);
  const [wallpaperPickerOpen, setWallpaperPickerOpen] = useState(false);
  const [ctxMenu, setCtxMenu]           = useState<{ x: number; y: number } | null>(null);
  const VALID_COMPANIONS = ["cat", "dog", "chicken", "cow", "redpanda", "frog"];
  const [companion, setCompanion] = useState(() => {
    const saved = localStorage.getItem("personalos_companion") ?? "";
    return VALID_COMPANIONS.includes(saved) ? saved : "cat";
  });
  const [companionPickerOpen, setCompanionPickerOpen] = useState(false);
  const [intentionJustCompleted, setIntentionJustCompleted] = useState(false);
  const [allGoalsSaved, setAllGoalsSaved] = useState(false);
  const [petThought, setPetThought]       = useState<string | null>(null);
  const petThoughtTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [memoramaShown, setMemoramaShown] = useState(false);
  const [showMemorama, setShowMemorama]   = useState(false);
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(
    DEFAULT_ICON_POSITIONS
  );

  // Time Capsule state
  const [capsuleState, setCapsuleState] = useState<CapsuleState>(getCapsuleState);
  const [timeCapsuleOpen, setTimeCapsuleOpen] = useState(false);
  const [timeCapsuleZ, setTimeCapsuleZ] = useState(150);
  const [tcClickTimer, setTcClickTimer] = useState(0);

  // ── Pet cursor following ───────────────────────────────────────────────────
  const petPosRef    = useRef({ x: 200, y: 200 });
  const targetPosRef = useRef({ x: 200, y: 200 });
  const rafRef       = useRef<number>(0);
  const [petDisplayPos, setPetDisplayPos] = useState({ x: 200, y: 200 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetPosRef.current = { x: e.clientX + 18, y: e.clientY + 14 };
    };
    window.addEventListener("mousemove", onMove);

    const animate = () => {
      const LERP = 0.07;
      petPosRef.current = {
        x: petPosRef.current.x + (targetPosRef.current.x - petPosRef.current.x) * LERP,
        y: petPosRef.current.y + (targetPosRef.current.y - petPosRef.current.y) * LERP,
      };
      setPetDisplayPos({ x: petPosRef.current.x, y: petPosRef.current.y });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const PET_JOURNAL_REACTIONS = ["that sounds hard", "I'm proud of you", "yay!", "thank you for sharing", "I'm here with you", "you did that", "this matters"];

  const handleJournalSaved = useCallback((text: string) => {
    // Bubble up to App.tsx so text persists across window open/close
    onJournalSaved?.(text);
    if (petThoughtTimer.current) clearTimeout(petThoughtTimer.current);
    const msg = PET_JOURNAL_REACTIONS[Math.floor(Math.random() * PET_JOURNAL_REACTIONS.length)];
    setPetThought(msg);
    petThoughtTimer.current = setTimeout(() => setPetThought(null), 4000);
  }, [onJournalSaved]);

  const handleIntentionComplete = useCallback(() => {
    setIntentionJustCompleted(true);
    setTimeout(() => setIntentionJustCompleted(false), 150);
  }, []);

  const petMoodStr: "blooming" | "neutral" | "healing" | undefined =
    selectedMood === null ? undefined : selectedMood <= 1 ? "blooming" : selectedMood === 2 ? "neutral" : "healing";

  const handleAllIntentionsComplete = useCallback(() => {
    if (petHappyTimer.current) clearTimeout(petHappyTimer.current);
    setPetHappy(true);
    petHappyTimer.current = setTimeout(() => setPetHappy(false), 3000);
  }, []);

  const focusWindow = useCallback((id: WindowId) => {
    const newZ = topZ + 1;
    setTopZ(newZ);
    setActiveId(id);
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], zIndex: newZ } }));
  }, [topZ]);

  const openWindow = useCallback((id: WindowId) => {
    if (id === "memories" && !memoramaShown) { setShowMemorama(true); return; }
    const newZ = topZ + 1;
    setTopZ(newZ);
    setActiveId(id);
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], open: true, minimized: false, zIndex: newZ } }));
  }, [topZ, memoramaShown]);

  const handleMemoramaComplete = useCallback(() => {
    setShowMemorama(false);
    setMemoramaShown(true);
    const newZ = topZ + 1;
    setTopZ(newZ);
    setActiveId("memories");
    setWindows(prev => ({ ...prev, memories: { ...prev.memories, open: true, minimized: false, zIndex: newZ } }));
  }, [topZ]);

  const closeWindow    = useCallback((id: WindowId) => { setWindows(prev => ({ ...prev, [id]: { ...prev[id], open: false } })); if (activeId === id) setActiveId(null); }, [activeId]);
  const minimizeWindow = useCallback((id: WindowId) => { setWindows(prev => ({ ...prev, [id]: { ...prev[id], minimized: true } })); if (activeId === id) setActiveId(null); }, [activeId]);

  const restoreWindow = useCallback((id: string) => {
    const wid = id as WindowId;
    const newZ = topZ + 1;
    setTopZ(newZ);
    setActiveId(wid);
    setWindows(prev => ({ ...prev, [wid]: { ...prev[wid], minimized: false, zIndex: newZ } }));
  }, [topZ]);

  const handleIconClick = (id: WindowId) => {
    const now = Date.now();
    const last = doubleClickTimer[id] || 0;
    if (now - last < 400) { openWindow(id); setDoubleClickTimer(prev => ({ ...prev, [id]: 0 })); }
    else { setDoubleClickTimer(prev => ({ ...prev, [id]: now })); }
  };

  const handleTimeCapsuleClick = () => {
    const now = Date.now();
    if (now - tcClickTimer < 400) {
      const newZ = topZ + 1;
      setTopZ(newZ);
      setTimeCapsuleZ(newZ);
      setTimeCapsuleOpen(true);
      setTcClickTimer(0);
    } else {
      setTcClickTimer(now);
    }
  };

  useEffect(() => { if (initialMood !== undefined) setSelectedMood(initialMood); }, []);

  const minimizedWindows = WINDOW_CONFIGS.filter(c => windows[c.id].open && windows[c.id].minimized).map(c => ({ id: c.id, title: c.label }));
  const desktopIconConfigs = WINDOW_CONFIGS.filter(c => !c.desktopIconHidden);
  const bgColor = wallpaper?.value ?? MOOD_BG[selectedMood ?? 0] ?? "#F4EAD5";

  return (
    <div
      style={{
        width: "100%", height: "100vh",
        background: bgColor,
        position: "relative", overflow: "hidden",
        fontFamily: "'Fraunces', serif",
        transition: "background 0.7s ease",
        cursor: "default",
        paddingTop: 36,
        boxSizing: "border-box",
      }}
      onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
      onClick={() => setCtxMenu(null)}
    >
      {/* Subtle background shapes */}
      <div style={{ position: "absolute", top: -40, right: "20%", width: 200, height: 300, background: "#2A9D8F", opacity: 0.06, borderRadius: "80% 20% 60% 40% / 50% 60% 40% 50%", transform: "rotate(20deg)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 60, left: "10%", width: 160, height: 120, background: "#E76F51", opacity: 0.07, borderRadius: "0% 100% 0% 100% / 60% 40% 60% 40%", transform: "rotate(-15deg)", pointerEvents: "none" }} />

      {/* Folder icons — draggable */}
      {desktopIconConfigs.map(config => (
        <DraggableDesktopIcon
          key={config.id}
          label={config.label}
          iconType={config.iconType ?? "blob"}
          position={iconPositions[config.id] ?? DEFAULT_ICON_POSITIONS[config.id] ?? { x: 20, y: 56 }}
          onPositionChange={pos => setIconPositions(prev => ({ ...prev, [config.id]: pos }))}
          onClick={() => handleIconClick(config.id)}
          selected={windows[config.id].open && !windows[config.id].minimized}
        />
      ))}

      {/* Time Capsule icon */}
      <TimeCapsuleIcon
        state={capsuleState}
        position={iconPositions["timecapsule"] ?? DEFAULT_ICON_POSITIONS["timecapsule"]}
        onPositionChange={pos => setIconPositions(prev => ({ ...prev, timecapsule: pos }))}
        onClick={handleTimeCapsuleClick}
        selected={timeCapsuleOpen}
      />

      {/* App Windows */}
      {WINDOW_CONFIGS.map(config => {
        const w = windows[config.id];
        if (!w.open || w.minimized) return null;
        return (
          <DraggableWindow
            key={config.id}
            id={config.id}
            title={config.title}
            icon={<FolderIcon small />}
            onClose={() => closeWindow(config.id)}
            onMinimize={() => minimizeWindow(config.id)}
            onFocus={() => focusWindow(config.id)}
            zIndex={w.zIndex}
            initialPosition={config.initialPos}
            width={config.width}
            minHeight={config.minHeight}
          >
            <WindowContent
              id={config.id}
              username={username}
              currentMood={selectedMood ?? undefined}
              companion={companion}
              journalText={journalText}
              onAllIntentionsComplete={handleAllIntentionsComplete}
              onIntentionComplete={handleIntentionComplete}
              onOpenJournal={() => openWindow("journal")}
              onOpenGoals={() => openWindow("goals")}
              onAllGoalsSaved={() => setAllGoalsSaved(true)}
              onJournalSaved={handleJournalSaved}
            />
          </DraggableWindow>
        );
      })}

      {/* Time Capsule Window */}
      {timeCapsuleOpen && (
        <DraggableWindow
          id="timecapsule"
          title="Time Capsule"
          icon={<span style={{ fontSize: 13 }}>📬</span>}
          onClose={() => setTimeCapsuleOpen(false)}
          onMinimize={() => setTimeCapsuleOpen(false)}
          onFocus={() => {
            const newZ = topZ + 1;
            setTopZ(newZ);
            setTimeCapsuleZ(newZ);
          }}
          zIndex={timeCapsuleZ}
          initialPosition={{ x: 300, y: 100 }}
          width={360}
          minHeight={380}
        >
          <TimeWindow onCapsuleSealed={() => setCapsuleState(getCapsuleState())} />
        </DraggableWindow>
      )}

      {/* Widgets */}
      <PolaroidWidget mood={selectedMood ?? 0} />
      <WeatherWidget companionId={companion} />
      <MeaningBoardWidget />

      {/* Companion picker */}
      {companionPickerOpen && (
        <CompanionPicker
          currentId={companion}
          onSelect={id => { setCompanion(id); localStorage.setItem("personalos_companion", id); }}
          onClose={() => setCompanionPickerOpen(false)}
        />
      )}

      {/* Memorama gate for Memories */}
      {showMemorama && (
        <CatMemorama mood={selectedMood ?? undefined} onComplete={handleMemoramaComplete} onClose={() => setShowMemorama(false)} />
      )}

      {/* Wallpaper picker */}
      {wallpaperPickerOpen && (
        <WallpaperPicker
          current={wallpaper ?? WALLPAPERS[0]}
          onApply={w => setWallpaper(w)}
          onClose={() => setWallpaperPickerOpen(false)}
        />
      )}

      {/* Context menu */}
      {ctxMenu && (
        <div
          style={{
            position: "fixed",
            left: ctxMenu.x,
            top: Math.min(ctxMenu.y, window.innerHeight - 120),
            background: "#C0C0C0",
            border: "2px solid",
            borderColor: "#fff #555 #555 #fff",
            boxShadow: "2px 2px 8px rgba(0,0,0,0.3)",
            zIndex: 7000,
            minWidth: 160,
            padding: "2px 0",
          }}
          onClick={e => e.stopPropagation()}
        >
          {[
            { label: "Change Wallpaper…", action: () => { setWallpaperPickerOpen(true); setCtxMenu(null); } },
            { label: "Companion…",        action: () => { setCompanionPickerOpen(true); setCtxMenu(null); } },
          ].map((item, i) => (
            <div key={i} onClick={item.action} style={{ padding: "4px 16px", cursor: "pointer", fontFamily: "'VT323', monospace", fontSize: 15, color: "#000" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#000080"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#000"; }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}

      {/* Pet follows cursor */}
      <div style={{
        position: "fixed",
        left: petDisplayPos.x,
        top: petDisplayPos.y,
        zIndex: 9000,
        pointerEvents: "none",
        transform: "translate(-50%, -50%)",
      }}>
        {petThought && (
          <div style={{
            position: "absolute", bottom: "100%", left: "50%",
            transform: "translateX(-50%)",
            marginBottom: 6,
            background: "#FFFDF6",
            border: "1px solid rgba(38,70,83,0.15)",
            borderRadius: 10,
            boxShadow: "0 3px 12px rgba(38,70,83,0.12)",
            padding: "6px 12px",
            fontFamily: "'Fraunces', serif",
            fontSize: 13,
            color: "#264653",
            whiteSpace: "nowrap",
            animation: "thoughtIn 0.2s ease-out",
          }}>
            {petThought}
          </div>
        )}
        <PixelPet
          companionId={companion}
          mood={petMoodStr}
          intentionJustCompleted={intentionJustCompleted}
          allIntentionsDone={petHappy}
          showOvni={petHappy && allGoalsSaved && companion === "cow"}
        />
      </div>

      <Taskbar
        minimizedWindows={minimizedWindows}
        onRestoreWindow={restoreWindow}
        activeWindowId={activeId}
        onOpenWallpaperPicker={() => setWallpaperPickerOpen(true)}
        onOpenCompanionPicker={() => setCompanionPickerOpen(true)}
      />

      <style>{`
        @keyframes winOpen   { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes thoughtIn { from { opacity: 0; transform: translateX(-50%) translateY(4px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes capsuleGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(255,200,50,0.6)); }
          50%       { filter: drop-shadow(0 0 12px rgba(255,200,50,1)); }
        }
      `}</style>
    </div>
  );
}

/* ─── WindowContent ──────────────────────────────────────────────────────── */
function WindowContent({ id, username, currentMood, companion, journalText, onAllIntentionsComplete, onIntentionComplete, onOpenJournal, onOpenGoals, onAllGoalsSaved, onJournalSaved }: {
  id: WindowId; username: string; currentMood?: number; companion?: string;
  journalText?: string;
  onAllIntentionsComplete?: () => void; onIntentionComplete?: () => void;
  onOpenJournal?: () => void; onOpenGoals?: () => void;
  onAllGoalsSaved?: () => void; onJournalSaved?: (text: string) => void;
}) {
  switch (id) {
    case "myspace":
      return (
        <MySpaceWindow
          username={username}
          currentMood={currentMood}
          onAllComplete={onAllIntentionsComplete}
          onIntentionComplete={onIntentionComplete}
          onOpenJournal={onOpenJournal}
          onOpenGoals={onOpenGoals}
        />
      );
    case "memories":  return <MemoriesWindow />;
    case "journal":   return (
      <JournalWindow
        mood={currentMood}
        initialText={journalText}
        onJournalSaved={onJournalSaved}
      />
    );
    case "goals":     return <GoalsWindow onAllGoalsSaved={onAllGoalsSaved} />;
    default:          return null;
  }
}

/* ─── Folder SVG ─────────────────────────────────────────────────────────── */
function FolderIcon({ small }: { small?: boolean }) {
  const w = small ? 14 : 52;
  const h = small ? 12 : 44;
  return (
    <svg width={w} height={h} viewBox="0 0 52 44" fill="none">
      <path d="M2 12 L2 10 Q2 8 4 8 L20 8 L24 4 Q25 2 27 2 L50 2 Q52 2 52 4 L52 8 L2 8 Z" fill={FOLDER_YELLOW} opacity="0.8" />
      <rect x="2" y="8" width="49" height="33" rx="2" fill={FOLDER_YELLOW} />
      <rect x="2" y="8" width="49" height="5" rx="1" fill="white" fillOpacity="0.3" />
      <rect x="6" y="16" width="40" height="2" rx="1" fill="white" fillOpacity="0.15" />
      <rect x="6" y="21" width="32" height="2" rx="1" fill="white" fillOpacity="0.12" />
      <rect x="2" y="38" width="49" height="3" rx="1" fill="black" fillOpacity="0.08" />
    </svg>
  );
}

/* ─── Mailbox SVG ────────────────────────────────────────────────────────── */
function MailboxIcon({ state }: { state: CapsuleState }) {
  const flagColor = state === "ready" ? "#CC0000" : state === "sealed" ? "#888" : "#C0C0C0";
  const bodyColor = state === "ready" ? "#4A7FD4" : "#6A8FB0";
  return (
    <svg width="52" height="48" viewBox="0 0 52 48" fill="none">
      {/* Post */}
      <rect x="22" y="34" width="8" height="14" fill="#888" />
      {/* Box body */}
      <rect x="4" y="14" width="44" height="22" rx="3" fill={bodyColor} />
      {/* Box highlight */}
      <rect x="4" y="14" width="44" height="5" rx="2" fill="white" fillOpacity="0.2" />
      {/* Slot for letters */}
      <rect x="10" y="22" width="32" height="3" rx="1" fill="rgba(0,0,0,0.3)" />
      {/* Door hinge line */}
      <rect x="4" y="28" width="44" height="1" fill="rgba(0,0,0,0.15)" />
      {/* Flag pole */}
      <rect x="44" y="10" width="2" height="18" fill="#888" />
      {/* Flag */}
      <path d={state === "sealed" || state === "ready" ? "M46 10 L46 18 L52 14 Z" : "M46 22 L46 28 L52 25 Z"} fill={flagColor} />
      {/* Envelope peek when sealed/ready */}
      {(state === "sealed" || state === "ready") && (
        <rect x="12" y="18" width="20" height="2" rx="1" fill="#fff" fillOpacity="0.6" />
      )}
      {/* Glow ring when ready */}
      {state === "ready" && (
        <rect x="2" y="12" width="48" height="26" rx="4" fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.8" />
      )}
    </svg>
  );
}

/* ─── Time Capsule Desktop Icon ──────────────────────────────────────────── */
function TimeCapsuleIcon({
  state, position, onPositionChange, onClick, selected,
}: {
  state: CapsuleState;
  position: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }) => void;
  onClick: () => void;
  selected?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number; moved: boolean } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: position.x, py: position.y, moved: false };
    const move = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.sx;
      const dy = ev.clientY - dragRef.current.sy;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true;
      if (dragRef.current.moved) {
        onPositionChange({
          x: Math.max(0, Math.min(window.innerWidth - 80, dragRef.current.px + dx)),
          y: Math.max(36, Math.min(window.innerHeight - 80, dragRef.current.py + dy)),
        });
      }
    };
    const up = () => {
      if (dragRef.current && !dragRef.current.moved) onClick();
      dragRef.current = null;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const label = state === "ready" ? "time capsule ✨" : state === "sealed" ? "time capsule 🔒" : "time capsule";

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        left: position.x, top: position.y,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        width: 76, cursor: "default",
        transform: hovered ? "scale(1.08) translateY(-2px)" : "scale(1)",
        transition: "transform 0.15s ease",
        zIndex: 50,
        userSelect: "none",
        animation: state === "ready" ? "capsuleGlow 2s ease-in-out infinite" : "none",
      }}
    >
      <div style={{ opacity: selected ? 1 : hovered ? 0.95 : 0.85 }}>
        <MailboxIcon state={state} />
      </div>
      <div style={{
        fontFamily: "'VT323', monospace",
        fontSize: 12,
        color: "#264653",
        textAlign: "center",
        background: selected ? "rgba(0,0,128,0.18)" : hovered ? "rgba(0,0,128,0.08)" : "transparent",
        padding: "1px 4px",
        borderRadius: 2,
        lineHeight: 1.2,
      }}>
        {label}
      </div>
    </div>
  );
}

/* ─── Draggable Desktop Icon ────────────────────────────────────────────── */
function DraggableDesktopIcon({
  label, iconType, position, onPositionChange, onClick, selected,
}: {
  label: string; iconType: "folder" | "blob";
  position: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }) => void;
  onClick: () => void; selected?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number; moved: boolean } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: position.x, py: position.y, moved: false };

    const move = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.sx;
      const dy = ev.clientY - dragRef.current.sy;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true;
      if (dragRef.current.moved) {
        onPositionChange({
          x: Math.max(0, Math.min(window.innerWidth - 80, dragRef.current.px + dx)),
          y: Math.max(36, Math.min(window.innerHeight - 80, dragRef.current.py + dy)),
        });
      }
    };

    const up = () => {
      if (dragRef.current && !dragRef.current.moved) onClick();
      dragRef.current = null;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        left: position.x, top: position.y,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        width: 76, cursor: "default",
        transform: hovered ? "scale(1.08) translateY(-2px)" : "scale(1)",
        transition: "transform 0.15s ease",
        zIndex: 50,
        userSelect: "none",
      }}
    >
      {iconType === "folder" ? (
        <div style={{ opacity: selected ? 1 : hovered ? 0.95 : 0.85 }}>
          <FolderIcon />
        </div>
      ) : (
        <div style={{
          width: 52, height: 52,
          background: FOLDER_YELLOW,
          borderRadius: "60% 40% 55% 45% / 45% 55% 45% 55%",
          opacity: selected ? 1 : hovered ? 0.9 : 0.75,
        }} />
      )}
      <div style={{
        fontFamily: "'VT323', monospace",
        fontSize: 13,
        color: "#264653",
        textAlign: "center",
        background: selected ? "rgba(0,0,128,0.18)" : hovered ? "rgba(0,0,128,0.08)" : "transparent",
        padding: "1px 5px",
        borderRadius: 2,
        letterSpacing: 0.2,
      }}>
        {label}
      </div>
    </div>
  );
}
