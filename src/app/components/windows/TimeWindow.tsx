import React, { useState, useRef } from "react";
import { RansomText } from "../RansomText";

interface Capsule {
  message: string;
  sealedDate: string;   // ISO date string
  openDate: string;     // ISO date string (YYYY-MM-DD)
  photoUrl?: string;
}

const STORAGE_KEY = "personalos_capsules";

function loadCapsules(): Capsule[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}

function saveCapsules(caps: Capsule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(caps));
}

function daysUntil(openDate: string): number {
  const open = new Date(openDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  open.setHours(0, 0, 0, 0);
  return Math.ceil((open.getTime() - today.getTime()) / 86400000);
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

/* ── Envelope SVG ────────────────────────────────────────────────────────── */
function Envelope({ glowing, onOpen, isOpening }: {
  glowing: boolean;
  onOpen?: () => void;
  isOpening: boolean;
}) {
  return (
    <div style={{
      position: "relative",
      width: 200, height: 140,
      animation: glowing ? "capsuleGlow 2s ease-in-out infinite" : "none",
    }}>
      {/* Envelope body */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "#f5f0e8",
        border: "2px solid #8B6914",
        boxShadow: "2px 3px 8px rgba(0,0,0,0.25)",
      }} />
      {/* Envelope bottom-left triangle */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0,
        width: 0, height: 0,
        borderLeft: "100px solid #e8e3d9",
        borderTop: "70px solid transparent",
      }} />
      {/* Envelope bottom-right triangle */}
      <div style={{
        position: "absolute",
        bottom: 0, right: 0,
        width: 0, height: 0,
        borderRight: "100px solid #ddd8cc",
        borderTop: "70px solid transparent",
      }} />
      {/* Envelope flap (top) */}
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: 0, height: 0,
        borderLeft: "100px solid transparent",
        borderRight: "100px solid transparent",
        borderTop: isOpening ? "0px solid transparent" : "72px solid #ede8de",
        transition: "border-top-width 0.6s ease",
        transformOrigin: "top center",
      }} />
      {/* Wax seal */}
      {!isOpening && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 32, height: 32,
          borderRadius: "50%",
          background: "radial-gradient(circle at 40% 40%, #dd2222, #880000)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: "#ffeecc",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          border: "1px solid #660000",
          zIndex: 2,
        }}>
          ✦
        </div>
      )}
      {/* Shine lines on envelope */}
      <div style={{
        position: "absolute",
        top: 8, left: 12,
        width: 30, height: 1,
        background: "rgba(255,255,255,0.5)",
        transform: "rotate(-10deg)",
      }} />

      {onOpen && glowing && !isOpening && (
        <button
          onClick={onOpen}
          style={{
            position: "absolute",
            bottom: -40, left: "50%",
            transform: "translateX(-50%)",
            background: "#FFE566",
            border: "2px solid #000",
            padding: "4px 18px",
            fontFamily: "'VT323', monospace",
            fontSize: 17,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          open capsule ✨
        </button>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
interface Props {
  onCapsuleSealed?: (capsule: Capsule) => void;
}

export function TimeWindow({ onCapsuleSealed }: Props) {
  const [capsules, setCapsules] = useState<Capsule[]>(() => loadCapsules());
  const [mode, setMode] = useState<"writing" | "sealed" | "opening" | "opened">(
    () => {
      const caps = loadCapsules();
      if (caps.length === 0) return "writing";
      const last = caps[caps.length - 1];
      const days = daysUntil(last.openDate);
      if (days > 0) return "sealed";
      return "opening";
    }
  );
  const [isOpening, setIsOpening] = useState(false);

  // Writing state
  const [message, setMessage]   = useState("");
  const [openDate, setOpenDate] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const activeCapsule = capsules[capsules.length - 1] ?? null;

  const handleSeal = () => {
    if (!message.trim() || !openDate) return;
    const cap: Capsule = {
      message: message.trim(),
      sealedDate: new Date().toISOString(),
      openDate,
      photoUrl: photoUrl ?? undefined,
    };
    const next = [...capsules, cap];
    setCapsules(next);
    saveCapsules(next);
    setMode("sealed");
    onCapsuleSealed?.(cap);
    setMessage("");
    setOpenDate("");
    setPhotoUrl(null);
  };

  const handleOpen = () => {
    setIsOpening(true);
    setTimeout(() => setMode("opened"), 700);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  const sunkenInput: React.CSSProperties = {
    background: "#fff",
    border: "2px solid",
    borderColor: "#555 #fff #fff #555",
    fontFamily: "'VT323', monospace",
    fontSize: 16,
    padding: "4px 8px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  /* ── Writing mode ── */
  if (mode === "writing") {
    return (
      <div style={{ fontFamily: "'VT323', monospace", padding: 12, fontSize: 16 }}>
        <div style={{ fontSize: 20, marginBottom: 2 }}>a message to your future self</div>
        <div style={{ fontSize: 14, color: "#808080", marginBottom: 14 }}>
          seal it. forget it. find it later.
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ marginBottom: 4, color: "#555" }}>open on:</div>
          <input
            type="date"
            min={tomorrowISO()}
            value={openDate}
            onChange={e => setOpenDate(e.target.value)}
            style={sunkenInput}
          />
        </div>

        <div style={{ marginBottom: 4, fontStyle: "italic", color: "#555", fontSize: 16 }}>
          dear future me,
        </div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="what do you want to remember? what are you hoping for?"
          style={{
            ...sunkenInput,
            minHeight: 120,
            resize: "vertical",
            lineHeight: 1.5,
            marginBottom: 10,
            display: "block",
          }}
        />

        {/* Optional photo */}
        <div style={{ marginBottom: 12 }}>
          {photoUrl ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img src={photoUrl} alt="today" style={{ width: 80, height: 60, objectFit: "cover", border: "1px solid #999" }} />
              <button
                onClick={() => setPhotoUrl(null)}
                style={{ ...sunkenInput, width: "auto", fontSize: 13, cursor: "pointer" }}
              >
                remove
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: 80, height: 60,
                border: "2px dashed #C0C0C0",
                background: "#faf8f3",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 11, color: "#999",
                textAlign: "center", lineHeight: 1.3,
              }}
            >
              📷 add a photo of today (optional)
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        </div>

        <button
          onClick={handleSeal}
          disabled={!message.trim() || !openDate}
          style={{
            width: "100%",
            background: message.trim() && openDate ? "#C0C0C0" : "#E8E8E8",
            border: "2px solid",
            borderColor: "#fff #555 #555 #fff",
            padding: "6px 0",
            fontFamily: "'VT323', monospace",
            fontSize: 18,
            cursor: message.trim() && openDate ? "pointer" : "default",
            color: message.trim() && openDate ? "#000" : "#999",
          }}
        >
          💌 seal the capsule
        </button>

        <style>{`
          @keyframes capsuleGlow {
            0%, 100% { box-shadow: 0 0 8px rgba(255,200,50,0.4); }
            50%       { box-shadow: 0 0 20px rgba(255,200,50,0.8); }
          }
        `}</style>
      </div>
    );
  }

  /* ── Sealed mode ── */
  if (mode === "sealed" && activeCapsule) {
    const days = daysUntil(activeCapsule.openDate);
    return (
      <div style={{ fontFamily: "'VT323', monospace", padding: 12, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, marginTop: 8, position: "relative" }}>
          <Envelope glowing={false} isOpening={false} />
          {activeCapsule.photoUrl && (
            <div style={{
              position: "absolute",
              bottom: -8, right: "calc(50% - 110px)",
              width: 40, height: 40,
              background: "#fff",
              padding: 3,
              boxShadow: "1px 1px 4px rgba(0,0,0,0.25)",
              transform: "rotate(-8deg)",
            }}>
              <img src={activeCapsule.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
        </div>

        <div style={{ fontSize: 14, color: "#808080", marginBottom: 2 }}>
          sealed on: {fmtDate(activeCapsule.sealedDate.split("T")[0])}
        </div>
        <div style={{ fontSize: 16, color: "#000080", marginBottom: 4 }}>
          opens on: {fmtDate(activeCapsule.openDate)}
        </div>
        <div style={{ fontSize: 14, color: "#555", marginBottom: 20 }}>
          {days > 0 ? `${days} day${days !== 1 ? "s" : ""} to go` : "today's the day ✨"}
        </div>

        <button
          onClick={() => setMode("writing")}
          style={{
            background: "none", border: "none",
            fontFamily: "'VT323', monospace",
            fontSize: 14, color: "#808080",
            cursor: "pointer", textDecoration: "underline",
          }}
        >
          write a new capsule
        </button>

        <style>{`
          @keyframes capsuleGlow {
            0%, 100% { box-shadow: 0 0 8px rgba(255,200,50,0.4); }
            50%       { box-shadow: 0 0 20px rgba(255,200,50,0.8); }
          }
        `}</style>
      </div>
    );
  }

  /* ── Opening day ── */
  if (mode === "opening" && activeCapsule) {
    return (
      <div style={{ fontFamily: "'VT323', monospace", padding: 12, textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 4 }}>✨ it's time</div>
        <div style={{ fontSize: 15, color: "#555", marginBottom: 20 }}>
          your past self left you something
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <Envelope glowing={true} onOpen={handleOpen} isOpening={isOpening} />
        </div>

        <style>{`
          @keyframes capsuleGlow {
            0%, 100% { box-shadow: 0 0 8px rgba(255,200,50,0.4); }
            50%       { box-shadow: 0 0 20px rgba(255,200,50,0.8); }
          }
        `}</style>
      </div>
    );
  }

  /* ── Opened ── */
  if (mode === "opened" && activeCapsule) {
    const sealedAgo = Math.round(
      (Date.now() - new Date(activeCapsule.sealedDate).getTime()) / 86400000
    );
    return (
      <div style={{ fontFamily: "'VT323', monospace", padding: 12 }}>
        <div style={{ fontSize: 18, marginBottom: 4, textAlign: "center" }}>
          ✉️ your past self wrote:
        </div>
        <div style={{
          background: "#faf8f3",
          border: "2px solid",
          borderColor: "#555 #fff #fff #555",
          marginBottom: 10,
          animation: "ransomReveal 0.5s ease forwards",
        }}>
          <RansomText text={activeCapsule.message} />
        </div>

        {activeCapsule.photoUrl && (
          <div style={{
            display: "flex", justifyContent: "center", marginBottom: 10,
          }}>
            <div style={{
              background: "#fff",
              padding: "6px 6px 22px",
              boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
              transform: "rotate(-2deg)",
            }}>
              <img
                src={activeCapsule.photoUrl}
                alt="memory"
                style={{ width: 100, height: 80, objectFit: "cover", display: "block" }}
              />
            </div>
          </div>
        )}

        <div style={{ fontSize: 13, color: "#808080", textAlign: "center" }}>
          written on {fmtDate(activeCapsule.sealedDate.split("T")[0])}, {sealedAgo} day{sealedAgo !== 1 ? "s" : ""} ago
        </div>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button
            onClick={() => {
              setMode("writing");
              setIsOpening(false);
            }}
            style={{
              background: "#C0C0C0",
              border: "2px solid",
              borderColor: "#fff #555 #555 #fff",
              padding: "4px 16px",
              fontFamily: "'VT323', monospace",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            write a new capsule
          </button>
        </div>

        <style>{`
          @keyframes ransomReveal {
            from { opacity: 0; transform: scale(0.97); filter: blur(2px); }
            to   { opacity: 1; transform: scale(1);    filter: blur(0); }
          }
        `}</style>
      </div>
    );
  }

  return null;
}
