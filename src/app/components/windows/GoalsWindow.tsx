import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";

interface Props {
  onAllGoalsSaved?: () => void;
}

export function GoalsWindow({ onAllGoalsSaved }: Props) {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [destination, setDestination] = useState("");
  const [when, setWhen] = useState("");
  const [why, setWhy] = useState("");
  const [quote, setQuote] = useState("");
  const [lyric, setLyric] = useState("");
  const [artist, setArtist] = useState("");

  const photoRef = useRef<HTMLInputElement>(null);
  const firedRef = useRef(false);

  const allFilled =
    !!photoUrl && destination.trim() !== "" &&
    quote.trim() !== "" && lyric.trim() !== "";

  useEffect(() => {
    if (allFilled && !firedRef.current) {
      firedRef.current = true;
      onAllGoalsSaved?.();
    }
    if (!allFilled) firedRef.current = false;
  }, [allFilled]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  return (
    <div style={{
      fontFamily: "'VT323', monospace",
      fontSize: 16,
      padding: 10,
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflowY: "auto",
      boxSizing: "border-box",
      gap: 14,
    }}>

      {/* ── Destination section ─────────────────────────────────── */}
      <div style={cardStyle("#87CEEB")}>
        <div style={cardHeader}>📍 where are you going next?</div>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Photo upload */}
          <div
            onClick={() => photoRef.current?.click()}
            style={{
              width: 160,
              height: 105,
              border: "2px dashed #808080",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              overflow: "hidden",
              background: "#f0f0f0",
              flexShrink: 0,
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="destination"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ color: "#808080", fontSize: 14, textAlign: "center", lineHeight: 1.4 }}>
                📷<br />click to upload
              </span>
            )}
          </div>
          <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />

          {/* Text inputs */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 140 }}>
            <input
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="destination (e.g. Machu Picchu)"
              style={inputStyle}
            />
            <input
              value={when}
              onChange={e => setWhen(e.target.value)}
              placeholder="when? (e.g. August 2026)"
              style={inputStyle}
            />
            <textarea
              value={why}
              onChange={e => setWhy(e.target.value)}
              placeholder="why this place? (optional)"
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
        </div>
      </div>

      {/* ── Quote card ──────────────────────────────────────────── */}
      <div style={cardStyle("#FAEEDA")}>
        <div style={cardHeader}>✨ a quote I'm living by</div>
        <textarea
          value={quote}
          onChange={e => setQuote(e.target.value)}
          placeholder="type a quote that moves you..."
          rows={3}
          style={{
            ...inputStyle,
            fontSize: 18,
            textAlign: "center",
            resize: "vertical",
          }}
        />
      </div>

      {/* ── Lyric card ──────────────────────────────────────────── */}
      <div style={cardStyle("#F4C0D1")}>
        <div style={cardHeader}>🎵 a lyric I keep coming back to</div>
        <textarea
          value={lyric}
          onChange={e => setLyric(e.target.value)}
          placeholder="a line that lives in your head..."
          rows={3}
          style={{
            ...inputStyle,
            fontSize: 18,
            fontStyle: "italic",
            resize: "vertical",
          }}
        />
        <input
          value={artist}
          onChange={e => setArtist(e.target.value)}
          placeholder="— Artist, Song"
          style={{ ...inputStyle, marginTop: 6, fontSize: 14, color: "#555" }}
        />
      </div>

      {/* ── All filled banner ────────────────────────────────────── */}
      {allFilled && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "linear-gradient(135deg, #e0f7f4, #b2ead8)",
            border: "1px solid #52b788",
            borderLeft: "4px solid #2d6a4f",
            padding: "8px 12px",
            fontSize: 17,
            color: "#1b4332",
          }}
        >
          🌟 vision board complete — you know where you're headed!
        </motion.div>
      )}
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function cardStyle(accentColor: string): React.CSSProperties {
  return {
    background: "#D8D8D8",
    border: "2px solid",
    borderColor: "#fff #555 #555 #fff",
    borderLeft: `4px solid ${accentColor}`,
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flexShrink: 0,
  };
}

const cardHeader: React.CSSProperties = {
  fontSize: 17,
  color: "#000080",
  marginBottom: 2,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "#fff",
  border: "2px solid",
  borderColor: "#555 #fff #fff #555",
  fontFamily: "'VT323', monospace",
  fontSize: 16,
  padding: "4px 6px",
  outline: "none",
};
