import React, { useState, useRef } from "react";

interface DayMemory {
  date: string;       // "YYYY-MM-DD"
  photoUrl?: string;
  caption?: string;
  prompt?: string;
  emoji?: string;
  color?: string;
}

const COLOR_OPTIONS = ["#ffd8a8","#ffc8dd","#b5ead7","#c8e4ff","#cdb4db","#f9dcc4"];
const EMOJI_OPTIONS = ["🌄","🏔","🌸","🎂","☕","🎵","🐱","✨","🌅","💌","🎨","🌊","🍰","📷","🌟","🏖"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function todayStr() { return new Date().toISOString().split("T")[0]; }

function monthDays(date: Date): { cells: (number | null)[]; year: number; month: number } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return { cells, year, month };
}

function padDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const EMPTY_FORM = { caption: "", emoji: "📷", color: COLOR_OPTIONS[0], prompt: "" };

export function MemoriesWindow() {
  const [memories, setMemories] = useState<DayMemory[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{ date: string; memory: DayMemory | null } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const { cells, year, month } = monthDays(currentMonth);
  const monthLabel = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const today = todayStr();

  const memByDate = Object.fromEntries(memories.map(m => [m.date, m]));

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleDayClick = (day: number) => {
    const date = padDate(year, month, day);
    setSelectedDay({ date, memory: memByDate[date] ?? null });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleAdd = () => {
    const date = selectedDay?.date ?? today;
    const mem: DayMemory = {
      date,
      caption: form.caption || undefined,
      emoji: form.emoji,
      color: form.color,
      prompt: form.prompt || undefined,
      photoUrl: previewUrl ?? undefined,
    };
    setMemories(prev => [...prev.filter(m => m.date !== date), mem]);
    setSelectedDay({ date, memory: mem });
    setForm(EMPTY_FORM);
    setPreviewUrl(null);
    setAddOpen(false);
  };

  const handleDelete = (date: string) => {
    setMemories(prev => prev.filter(m => m.date !== date));
    setSelectedDay(null);
  };

  const cellSize = 46;

  const sunkenInput: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "#fff", border: "2px solid", borderColor: "#555 #fff #fff #555",
    fontFamily: "'VT323', monospace", fontSize: 16,
    padding: "3px 6px", outline: "none",
  };

  return (
    <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, userSelect: "none" }}>

      {/* ── Month header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", marginBottom: 6 }}>
        <button onClick={prevMonth} style={navBtnStyle}>◀</button>
        <div style={{ fontSize: 20 }}>{monthLabel}</div>
        <button onClick={nextMonth} style={navBtnStyle}>▶</button>
      </div>

      {/* ── Days of week ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #C0C0C0", marginBottom: 2 }}>
        {DOW.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 13, color: "#808080", padding: "2px 0" }}>{d}</div>
        ))}
      </div>

      {/* ── Calendar grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={i} style={{ height: cellSize, background: "#F5F5F5" }} />;
          }
          const date = padDate(year, month, day);
          const mem = memByDate[date];
          const isToday = date === today;
          const isSelected = selectedDay?.date === date;

          return (
            <div
              key={i}
              onClick={() => handleDayClick(day)}
              style={{
                height: cellSize,
                position: "relative",
                background: isSelected ? "#D8E8FF" : isToday ? "#FFF9E6" : "#fff",
                border: isSelected ? "2px solid #000080" : isToday ? "1px solid #F0C040" : "1px solid #E0E0E0",
                cursor: "pointer",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {/* Photo thumbnail fills cell */}
              {mem?.photoUrl && (
                <img
                  src={mem.photoUrl}
                  alt=""
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
              {/* Day number */}
              <div style={{
                position: "absolute", top: 2, left: 4,
                fontSize: 13,
                color: mem?.photoUrl ? "#fff" : "#555",
                textShadow: mem?.photoUrl ? "0 1px 2px rgba(0,0,0,0.8)" : "none",
                zIndex: 1,
              }}>
                {day}
              </div>
              {/* Emoji dot */}
              {mem && !mem.photoUrl && (
                <div style={{
                  position: "absolute", bottom: 2, right: 3,
                  fontSize: 16,
                }}>
                  {mem.emoji}
                </div>
              )}
              {/* Color strip if has memory but no photo */}
              {mem && !mem.photoUrl && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: 4,
                  background: mem.color ?? "#FFE566",
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Detail panel ── */}
      {selectedDay && (
          <div
            style={{
              marginTop: 10,
              background: "#F0F0F0",
              border: "2px solid", borderColor: "#555 #fff #fff #555",
              padding: 10,
              animation: "fadeIn 0.18s ease",
            }}
          >
            {selectedDay.memory ? (
              <>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  {selectedDay.memory.photoUrl && (
                    <img
                      src={selectedDay.memory.photoUrl}
                      alt=""
                      style={{ width: 80, height: 64, objectFit: "cover", flexShrink: 0, border: "1px solid #C0C0C0" }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    {selectedDay.memory.emoji && (
                      <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 4 }}>{selectedDay.memory.emoji}</div>
                    )}
                    {selectedDay.memory.caption && (
                      <div style={{ fontSize: 16, marginBottom: 3 }}>{selectedDay.memory.caption}</div>
                    )}
                    {selectedDay.memory.prompt && (
                      <div style={{ fontSize: 13, fontStyle: "italic", color: "#808080", marginBottom: 3 }}>
                        {selectedDay.memory.prompt}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: "#555" }}>{selectedDay.date}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                  <BevelBtn onClick={() => setSelectedDay(null)}>✕ close</BevelBtn>
                  <BevelBtn onClick={() => handleDelete(selectedDay.date)}>🗑 delete</BevelBtn>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 15, color: "#808080", marginBottom: 8 }}>
                  nothing saved for {selectedDay.date}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <BevelBtn onClick={() => setAddOpen(true)}>+ add memory</BevelBtn>
                  <BevelBtn onClick={() => setSelectedDay(null)}>✕ close</BevelBtn>
                </div>
              </>
            )}
          </div>
        )}

      {/* ── Add memory dialog ── */}
        {addOpen && (
          <div
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 9000,
              animation: "fadeIn 0.15s ease",
            }}
          >
            <div
              style={{
                background: "#C0C0C0", border: "2px solid",
                borderColor: "#fff #555 #555 #fff", width: 340,
                animation: "scaleIn 0.15s ease",
              }}
            >
              <div style={{
                background: "linear-gradient(90deg, #000080, #1084D0)",
                color: "#fff", padding: "4px 8px",
                display: "flex", justifyContent: "space-between", fontSize: 17,
              }}>
                <span>📸 Add Memory — {selectedDay?.date ?? today}</span>
                <button onClick={() => setAddOpen(false)} style={closeBtnStyle}>✕</button>
              </div>

              <div style={{ padding: 14 }}>
                {/* Photo */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 15, marginBottom: 4 }}>Photo</div>
                  <div
                    onClick={() => photoRef.current?.click()}
                    style={{
                      width: 140, height: 100,
                      border: "2px dashed #808080",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", overflow: "hidden", background: "#f0f0f0",
                    }}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontFamily: "'VT323', monospace", color: "#808080", fontSize: 14, textAlign: "center", padding: 4 }}>
                        📷<br />click to add photo
                      </span>
                    )}
                  </div>
                  <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
                </div>

                {/* Caption */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 15, marginBottom: 4 }}>Caption</div>
                  <input
                    value={form.caption}
                    onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                    placeholder="describe this memory..."
                    style={sunkenInput}
                  />
                </div>

                {/* Emoji */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 15, marginBottom: 4 }}>Emoji</div>
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(8, 1fr)",
                    gap: 2, background: "#fff",
                    border: "2px solid", borderColor: "#555 #fff #fff #555", padding: 3,
                  }}>
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setForm(f => ({ ...f, emoji }))}
                        style={{
                          width: 28, height: 28, padding: 0, fontSize: 16,
                          background: form.emoji === emoji ? "#D8E8FF" : "transparent",
                          border: "2px solid",
                          borderColor: form.emoji === emoji ? "#000080" : "transparent",
                          cursor: "pointer",
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 15, marginBottom: 4 }}>Color</div>
                  <div style={{ display: "flex", gap: 5 }}>
                    {COLOR_OPTIONS.map(c => (
                      <div
                        key={c}
                        onClick={() => setForm(f => ({ ...f, color: c }))}
                        style={{
                          width: 26, height: 26, background: c,
                          border: "2px solid",
                          borderColor: form.color === c ? "#000080" : "#808080",
                          cursor: "pointer",
                          boxShadow: form.color === c ? "0 0 0 1px #000080" : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <BevelBtn onClick={() => setAddOpen(false)}>Cancel</BevelBtn>
                  <BevelBtn onClick={handleAdd}>💾 Save</BevelBtn>
                </div>
              </div>
            </div>
          </div>
        )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

function BevelBtn({ onClick, children, disabled }: {
  onClick: () => void; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? "#A0A0A0" : "#C0C0C0",
      border: "2px solid", borderColor: "#fff #555 #555 #fff",
      padding: "4px 10px", fontFamily: "'VT323', monospace",
      fontSize: 16, cursor: disabled ? "not-allowed" : "pointer",
      color: disabled ? "#666" : "#000",
    }}>
      {children}
    </button>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: "#C0C0C0", border: "2px solid",
  borderColor: "#fff #555 #555 #fff",
  fontFamily: "'VT323', monospace", fontSize: 16,
  cursor: "pointer", padding: "2px 10px", color: "#000",
};

const closeBtnStyle: React.CSSProperties = {
  background: "#C0C0C0", border: "2px solid",
  borderColor: "#fff #555 #555 #fff",
  color: "#000", cursor: "pointer", fontSize: 11, padding: "0 4px",
};
