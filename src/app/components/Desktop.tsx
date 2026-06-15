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
import { DesktopIcon, FolderIcon, MailboxIcon, CapsuleState } from "./DesktopIcons";

// fix #7 — localStorage persistence helpers
function loadLS<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function saveLS(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const MOOD_BG: Record<number, string> = {
  0: "#F0E5C0", 1: "#F2DFD5", 2: "#D8ECEA", 3: "#CDD6DB", 4: "#F0D8D8",
};

interface WindowState {
  id: string; open: boolean; minimized: boolean; zIndex: number;
}
type WindowId = "myspace" | "memories" | "journal" | "goals";

const WINDOW_CONFIGS: {
  id: WindowId; title: string; label: string; color: string;
  initialPos: { x: number; y: number }; width: number; minHeight: number;
  desktopIconHidden?: boolean; iconType?: "folder" | "blob";
}[] = [
  { id: "myspace",  title: "My Space",  label: "my space",  color: "#E76F51", initialPos: { x: 80,  y: 80  }, width: 480, minHeight: 420, iconType: "folder" },
  { id: "memories", title: "Memories",  label: "memories",  color: "#2A9D8F", initialPos: { x: 240, y: 80  }, width: 520, minHeight: 440, iconType: "folder" },
  { id: "journal",  title: "Journal",   label: "journal",   color: "#E9C46A", initialPos: { x: 560, y: 80  }, width: 440, minHeight: 360, desktopIconHidden: true },
  { id: "goals",    title: "Goals",     label: "goals",     color: "#264653", initialPos: { x: 580, y: 100 }, width: 480, minHeight: 500, desktopIconHidden: true },
];

const DEFAULT_ICON_POSITIONS: Record<string, { x: number; y: number }> = {
  myspace:     { x: 20, y: 56  },
  memories:    { x: 20, y: 144 },
  timecapsule: { x: 20, y: 232 },
};

function getCapsuleState(): CapsuleState {
  try {
    const caps: Array<{ openDate: string }> = JSON.parse(localStorage.getItem("personalos_capsules") ?? "[]");
    if (caps.length === 0) return "empty";
    const last = caps[caps.length - 1];
    const open = new Date(last.openDate); open.setHours(0,0,0,0);
    const today = new Date(); today.setHours(0,0,0,0);
    return open <= today ? "ready" : "sealed";
  } catch { return "empty"; }
}

const VALID_COMPANIONS = ["cat","dog","chicken","cow","redpanda","frog"];

interface Props {
  username: string;
  initialMood?: number;
  journalText?: string;
  onJournalSaved?: (text: string) => void;
}

export function Desktop({ username, initialMood, journalText = "", onJournalSaved }: Props) {
  // fix #7: persist icon positions
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(
    () => loadLS("personalos_icon_positions", DEFAULT_ICON_POSITIONS)
  );
  const updateIconPos = useCallback((id: string, pos: { x: number; y: number }) => {
    setIconPositions(prev => {
      const next = { ...prev, [id]: pos };
      saveLS("personalos_icon_positions", next);
      return next;
    });
  }, []);

  const [windows, setWindows] = useState<Record<WindowId, WindowState>>(
    Object.fromEntries(
      WINDOW_CONFIGS.map((c, i) => [c.id, { id: c.id, open: false, minimized: false, zIndex: 100 + i }])
    ) as Record<WindowId, WindowState>
  );
  const [topZ, setTopZ]         = useState(200);
  const [activeId, setActiveId] = useState<WindowId | null>(null);

  // fix #2: proper double-click with ref (no stale state)
  const lastClickTime = useRef<Record<string, number>>({});
  const [tcLastClick, setTcLastClick] = useState(0);

  const [selectedMood, setSelectedMood] = useState<number | null>(initialMood ?? null);
  const [petHappy, setPetHappy]         = useState(false);
  const petHappyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // fix #7: persist wallpaper
  const [wallpaper, setWallpaper] = useState<WallpaperOption | null>(
    () => loadLS<WallpaperOption | null>("personalos_wallpaper", null)
  );
  const applyWallpaper = (w: WallpaperOption) => {
    setWallpaper(w);
    saveLS("personalos_wallpaper", w);
  };

  const [wallpaperPickerOpen, setWallpaperPickerOpen] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

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
  const [capsuleState, setCapsuleState]   = useState<CapsuleState>(getCapsuleState);
  const [timeCapsuleOpen, setTimeCapsuleOpen] = useState(false);
  const [timeCapsuleZ, setTimeCapsuleZ]   = useState(150);

  // fix #3: include initialMood in dep array
  useEffect(() => {
    if (initialMood !== undefined) setSelectedMood(initialMood);
  }, [initialMood]);

  // fix #1: pet cursor RAF — stable refs, single loop, proper cleanup
  const petPosRef    = useRef({ x: 200, y: 200 });
  const targetPosRef = useRef({ x: 200, y: 200 });
  const petRafRef    = useRef<number>(0); // renamed from rafRef to avoid confusion
  const [petDisplayPos, setPetDisplayPos] = useState({ x: 200, y: 200 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetPosRef.current = { x: e.clientX + 18, y: e.clientY + 14 };
    };
    window.addEventListener("mousemove", onMove);
    const LERP = 0.07;
    const animate = () => {
      petPosRef.current = {
        x: petPosRef.current.x + (targetPosRef.current.x - petPosRef.current.x) * LERP,
        y: petPosRef.current.y + (targetPosRef.current.y - petPosRef.current.y) * LERP,
      };
      setPetDisplayPos({ ...petPosRef.current });
      petRafRef.current = requestAnimationFrame(animate);
    };
    petRafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(petRafRef.current); // fix #1: guaranteed cleanup
    };
  }, []); // empty deps is correct — uses only refs

  const PET_REACTIONS = ["that sounds hard","I'm proud of you","yay!","thank you for sharing","I'm here with you","you did that","this matters"];

  const handleJournalSaved = useCallback((text: string) => {
    onJournalSaved?.(text);
    if (petThoughtTimer.current) clearTimeout(petThoughtTimer.current);
    const msg = PET_REACTIONS[Math.floor(Math.random() * PET_REACTIONS.length)];
    setPetThought(msg);
    petThoughtTimer.current = setTimeout(() => setPetThought(null), 4000);
  }, [onJournalSaved]);

  const handleIntentionComplete = useCallback(() => {
    setIntentionJustCompleted(true);
    setTimeout(() => setIntentionJustCompleted(false), 150);
  }, []);

  const petMoodStr: "blooming"|"neutral"|"healing"|undefined =
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
    setTopZ(newZ); setActiveId("memories");
    setWindows(prev => ({ ...prev, memories: { ...prev.memories, open: true, minimized: false, zIndex: newZ } }));
  }, [topZ]);

  const closeWindow    = useCallback((id: WindowId) => {
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], open: false } }));
    if (activeId === id) setActiveId(null);
  }, [activeId]);

  const minimizeWindow = useCallback((id: WindowId) => {
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], minimized: true } }));
    if (activeId === id) setActiveId(null);
  }, [activeId]);

  const restoreWindow = useCallback((id: string) => {
    const wid = id as WindowId;
    const newZ = topZ + 1;
    setTopZ(newZ); setActiveId(wid);
    setWindows(prev => ({ ...prev, [wid]: { ...prev[wid], minimized: false, zIndex: newZ } }));
  }, [topZ]);

  // fix #2: use ref for double-click, no stale state
  const handleIconClick = (id: WindowId) => {
    const now = Date.now();
    const last = lastClickTime.current[id] ?? 0;
    if (now - last < 400) { openWindow(id); lastClickTime.current[id] = 0; }
    else { lastClickTime.current[id] = now; }
  };

  const handleTimeCapsuleClick = () => {
    const now = Date.now();
    if (now - tcLastClick < 400) {
      const newZ = topZ + 1;
      setTopZ(newZ); setTimeCapsuleZ(newZ); setTimeCapsuleOpen(true); setTcLastClick(0);
    } else { setTcLastClick(now); }
  };

  const minimizedWindows = WINDOW_CONFIGS
    .filter(c => windows[c.id].open && windows[c.id].minimized)
    .map(c => ({ id: c.id, title: c.label }));
  const desktopIconConfigs = WINDOW_CONFIGS.filter(c => !c.desktopIconHidden);

  // fix #8: dot pattern background instead of barely-visible blobs
  const bgColor = wallpaper?.value ?? MOOD_BG[selectedMood ?? 0] ?? "#F4EAD5";
  const dotColor = selectedMood !== null ? "rgba(38,70,83,0.12)" : "rgba(38,70,83,0.08)";

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
      {/* fix #8: subtle dot grid pattern */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        zIndex: 0,
      }} />

      {/* Folder icons — now using unified DesktopIcon component (fix #6) */}
      {desktopIconConfigs.map(config => (
        <DesktopIcon
          key={config.id}
          label={config.label}
          icon={config.iconType === "folder" ? <FolderIcon /> : <div style={{ width:52, height:52, background:"#FFC83A", borderRadius:"60% 40% 55% 45% / 45% 55% 45% 55%" }} />}
          position={iconPositions[config.id] ?? DEFAULT_ICON_POSITIONS[config.id] ?? { x:20, y:56 }}
          onPositionChange={pos => updateIconPos(config.id, pos)}
          onClick={() => handleIconClick(config.id)}
          selected={windows[config.id].open && !windows[config.id].minimized}
        />
      ))}

      {/* Time Capsule icon */}
      <DesktopIcon
        label={capsuleState === "ready" ? "time capsule ✨" : capsuleState === "sealed" ? "time capsule 🔒" : "time capsule"}
        icon={<MailboxIcon state={capsuleState} />}
        position={iconPositions["timecapsule"] ?? DEFAULT_ICON_POSITIONS["timecapsule"]}
        onPositionChange={pos => updateIconPos("timecapsule", pos)}
        onClick={handleTimeCapsuleClick}
        selected={timeCapsuleOpen}
        glowAnimation={capsuleState === "ready"}
      />

      {/* App Windows — now pass isActive (fix #10) */}
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
            isActive={activeId === config.id}
            initialPosition={config.initialPos}
            width={config.width}
            minHeight={config.minHeight}
          >
            <WindowContent
              id={config.id} username={username}
              currentMood={selectedMood ?? undefined} companion={companion}
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
          id="timecapsule" title="Time Capsule"
          icon={<span style={{ fontSize:13 }}>📬</span>}
          onClose={() => setTimeCapsuleOpen(false)}
          onMinimize={() => setTimeCapsuleOpen(false)}
          onFocus={() => { const z = topZ+1; setTopZ(z); setTimeCapsuleZ(z); }}
          zIndex={timeCapsuleZ}
          isActive={activeId === null && timeCapsuleOpen}
          initialPosition={{ x:300, y:100 }} width={360} minHeight={380}
        >
          <TimeWindow onCapsuleSealed={() => setCapsuleState(getCapsuleState())} />
        </DraggableWindow>
      )}

      {/* Widgets — fix #9: all three are now draggable via DraggableWidget wrapper */}
      <DraggableWidget storageKey="widget_polaroid" defaultPos={{ x: "calc(100vw - 220px)", y: "120px" }}>
        <PolaroidWidget mood={selectedMood ?? 0} />
      </DraggableWidget>
      <DraggableWidget storageKey="widget_weather" defaultPos={{ x: "calc(100vw - 220px)", y: "340px" }}>
        <WeatherWidget companionId={companion} />
      </DraggableWidget>
      <DraggableWidget storageKey="widget_meaning" defaultPos={{ x: "calc(100vw - 420px)", y: "120px" }}>
        <MeaningBoardWidget />
      </DraggableWidget>

      {companionPickerOpen && (
        <CompanionPicker
          currentId={companion}
          onSelect={id => { setCompanion(id); localStorage.setItem("personalos_companion", id); }}
          onClose={() => setCompanionPickerOpen(false)}
        />
      )}

      {showMemorama && (
        <CatMemorama mood={selectedMood ?? undefined} onComplete={handleMemoramaComplete} onClose={() => setShowMemorama(false)} />
      )}

      {wallpaperPickerOpen && (
        <WallpaperPicker
          current={wallpaper ?? WALLPAPERS[0]}
          onApply={applyWallpaper}
          onClose={() => setWallpaperPickerOpen(false)}
        />
      )}

      {/* Context menu */}
      {ctxMenu && (
        <div
          style={{
            position: "fixed", left: ctxMenu.x,
            top: Math.min(ctxMenu.y, window.innerHeight - 120),
            background: "#C0C0C0", border: "2px solid",
            borderColor: "#fff #555 #555 #fff",
            boxShadow: "2px 2px 8px rgba(0,0,0,0.3)",
            zIndex: 7000, minWidth: 160, padding: "2px 0",
          }}
          onClick={e => e.stopPropagation()}
        >
          {[
            { label: "Change Wallpaper…", action: () => { setWallpaperPickerOpen(true); setCtxMenu(null); } },
            { label: "Companion…",        action: () => { setCompanionPickerOpen(true); setCtxMenu(null); } },
          ].map((item, i) => (
            <div key={i} onClick={item.action}
              style={{ padding:"4px 16px", cursor:"pointer", fontFamily:"'VT323',monospace", fontSize:15, color:"#000" }}
              onMouseEnter={e => { e.currentTarget.style.background="#000080"; e.currentTarget.style.color="#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#000"; }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}

      {/* Pet cursor follower */}
      <div style={{
        position: "fixed", left: petDisplayPos.x, top: petDisplayPos.y,
        zIndex: 9000, pointerEvents: "none", transform: "translate(-50%,-50%)",
      }}>
        {petThought && (
          <div style={{
            position:"absolute", bottom:"100%", left:"50%",
            transform:"translateX(-50%)", marginBottom:6,
            background:"#FFFDF6", border:"1px solid rgba(38,70,83,0.15)",
            borderRadius:10, boxShadow:"0 3px 12px rgba(38,70,83,0.12)",
            padding:"6px 12px", fontFamily:"'Fraunces',serif",
            fontSize:13, color:"#264653", whiteSpace:"nowrap",
            animation:"thoughtIn 0.2s ease-out",
          }}>
            {petThought}
          </div>
        )}
        <PixelPet
          companionId={companion} mood={petMoodStr}
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
        @keyframes winOpen   { from { transform:scale(0.92); opacity:0; } to { transform:scale(1); opacity:1; } }
        @keyframes thoughtIn { from { opacity:0; transform:translateX(-50%) translateY(4px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes capsuleGlow {
          0%,100% { filter:drop-shadow(0 0 4px rgba(255,200,50,0.6)); }
          50%     { filter:drop-shadow(0 0 12px rgba(255,200,50,1)); }
        }
      `}</style>
    </div>
  );
}

/* ─── DraggableWidget wrapper (fix #9 — all widgets now draggable) ────────────────── */
function DraggableWidget({
  children, storageKey, defaultPos,
}: {
  children: React.ReactNode;
  storageKey: string;
  defaultPos: { x: string; y: string };
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(() => {
    try {
      const s = localStorage.getItem(storageKey);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on the widget's drag handle (top bar)
    if (!(e.target as HTMLElement).closest(".widget-drag-handle")) return;
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: rect.left, py: rect.top };
    const move = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const nx = Math.max(0, Math.min(window.innerWidth - 180, dragRef.current.px + ev.clientX - dragRef.current.sx));
      const ny = Math.max(36, Math.min(window.innerHeight - 60, dragRef.current.py + ev.clientY - dragRef.current.sy));
      const newPos = { x: nx, y: ny };
      setPos(newPos);
      try { localStorage.setItem(storageKey, JSON.stringify(newPos)); } catch {}
    };
    const up = () => {
      dragRef.current = null;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const style: React.CSSProperties = pos
    ? { position: "fixed", left: pos.x, top: pos.y, zIndex: 200 }
    : { position: "fixed", right: defaultPos.x.startsWith("calc") ? 20 : parseInt(defaultPos.x), top: parseInt(defaultPos.y), zIndex: 200 };

  return (
    <div ref={containerRef} style={style} onMouseDown={handleMouseDown}>
      {/* Subtle drag handle */}
      <div className="widget-drag-handle" style={{
        height: 8, cursor: "grab", opacity: 0,
        transition: "opacity 0.2s",
      }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
      />
      {children}
    </div>
  );
}

/* ─── WindowContent ───────────────────────────────────────────────────────────────── */
function WindowContent({
  id, username, currentMood, companion, journalText,
  onAllIntentionsComplete, onIntentionComplete, onOpenJournal, onOpenGoals, onAllGoalsSaved, onJournalSaved,
}: {
  id: WindowId; username: string; currentMood?: number; companion?: string; journalText?: string;
  onAllIntentionsComplete?: () => void; onIntentionComplete?: () => void;
  onOpenJournal?: () => void; onOpenGoals?: () => void;
  onAllGoalsSaved?: () => void; onJournalSaved?: (text: string) => void;
}) {
  switch (id) {
    case "myspace": return (
      <MySpaceWindow
        username={username} currentMood={currentMood}
        onAllComplete={onAllIntentionsComplete} onIntentionComplete={onIntentionComplete}
        onOpenJournal={onOpenJournal} onOpenGoals={onOpenGoals}
      />
    );
    case "memories": return <MemoriesWindow />;
    case "journal":  return <JournalWindow mood={currentMood} initialText={journalText} onJournalSaved={onJournalSaved} />;
    case "goals":    return <GoalsWindow onAllGoalsSaved={onAllGoalsSaved} />;
    default:         return null;
  }
}
