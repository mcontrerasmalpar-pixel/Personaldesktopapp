import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DraggableWindow } from "../DraggableWindow";

interface Reminder {
  id: number;
  contactId: number;
  plan: string;
  date: string;
  note: string;
  done: boolean;
}

interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastContact: string;
  status: "online" | "away" | "offline";
}

interface Props {
  contact: Contact;
  reminders: Reminder[];
  zIndex: number;
  initialPos: { x: number; y: number };
  onClose: () => void;
  onFocus: () => void;
  onToggleDone: (reminderId: number) => void;
  onAddReminder: (contactId: number, plan: string, date: string, note: string) => void;
}

const STATUS_COLORS = { online: "#00aa00", away: "#aaaa00", offline: "#808080" };
const STATUS_LABELS = { online: "online", away: "away", offline: "offline" };

export function ContactWindow({
  contact,
  reminders,
  zIndex,
  initialPos,
  onClose,
  onFocus,
  onToggleDone,
  onAddReminder,
}: Props) {
  const [reminderOpen, setReminderOpen] = useState(false);
  const [form, setForm] = useState({ plan: "", date: "", note: "" });
  const [lastTalked, setLastTalked] = useState("");

  const lastSeenDate = new Date(contact.lastContact).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const handleSaveReminder = () => {
    if (!form.plan.trim()) return;
    onAddReminder(contact.id, form.plan, form.date, form.note);
    setForm({ plan: "", date: "", note: "" });
    setReminderOpen(false);
  };

  return (
    <DraggableWindow
      id={`contact-${contact.id}`}
      title={`${contact.name} — contact.vcf`}
      icon={<span style={{ fontSize: 16 }}>{contact.avatar}</span>}
      onClose={onClose}
      onMinimize={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
      initialPosition={initialPos}
      width={300}
      minHeight={320}
    >
      <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, position: "relative" }}>

        {/* Avatar + name + status */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 48, height: 48,
            background: "#E0E0E0",
            border: "2px solid", borderColor: "#fff #555 #555 #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, flexShrink: 0,
          }}>
            {contact.avatar}
          </div>
          <div>
            <div style={{ fontSize: 20, lineHeight: 1.2 }}>{contact.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, color: "#555" }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: STATUS_COLORS[contact.status],
                border: "1px solid #555", flexShrink: 0,
              }} />
              {STATUS_LABELS[contact.status]}
            </div>
            <div style={{ fontSize: 13, color: "#808080" }}>last seen: {lastSeenDate}</div>
          </div>
        </div>

        <Divider />

        {/* Reminders section */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 15, color: "#000080", marginBottom: 6 }}>📌 Reminders</div>

          {reminders.length === 0 ? (
            <div style={{ fontSize: 14, color: "#808080", marginBottom: 6 }}>No reminders yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 6 }}>
              {reminders.map(r => (
                <ReminderRow key={r.id} reminder={r} onToggle={() => onToggleDone(r.id)} />
              ))}
            </div>
          )}

          <BevelBtn onClick={() => setReminderOpen(true)}>📌 Add Reminder</BevelBtn>
        </div>

        <Divider />

        {/* Last talked note */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 14, color: "#808080", marginBottom: 4 }}>
            what we talked about last time
          </div>
          <textarea
            value={lastTalked}
            onChange={e => setLastTalked(e.target.value)}
            placeholder="jot a quick note..."
            rows={3}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "#fff",
              border: "2px solid", borderColor: "#555 #fff #fff #555",
              fontFamily: "'VT323', monospace", fontSize: 15,
              padding: "4px 6px", resize: "vertical", outline: "none",
            }}
          />
        </div>

        {/* Add Reminder dialog — floats inside this window */}
        <AnimatePresence>
          {reminderOpen && (
            <motion.div
              key="rdlg"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.12 }}
              style={{
                position: "absolute", inset: 0,
                background: "rgba(192,192,192,0.97)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 10,
              }}
            >
              <div style={{
                background: "#C0C0C0",
                border: "2px solid", borderColor: "#fff #555 #555 #fff",
                width: "100%",
              }}>
                <div style={{
                  background: "linear-gradient(90deg, #000080, #1084D0)",
                  color: "#fff", padding: "4px 8px",
                  display: "flex", justifyContent: "space-between", fontSize: 17,
                }}>
                  <span>📌 Add Reminder</span>
                  <button onClick={() => setReminderOpen(false)} style={closeBtnStyle}>✕</button>
                </div>
                <div style={{ padding: 12 }}>
                  <FieldRow label="Plan:">
                    <StyledInput
                      value={form.plan}
                      onChange={v => setForm(f => ({ ...f, plan: v }))}
                      placeholder="coffee next week"
                    />
                  </FieldRow>
                  <FieldRow label="Date:">
                    <StyledInput
                      value={form.date}
                      onChange={v => setForm(f => ({ ...f, date: v }))}
                      placeholder="Jun 17"
                    />
                  </FieldRow>
                  <FieldRow label="Remember to:">
                    <StyledInput
                      value={form.note}
                      onChange={v => setForm(f => ({ ...f, note: v }))}
                      placeholder="ask about his music"
                    />
                  </FieldRow>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                    <BevelBtn onClick={() => setReminderOpen(false)}>Cancel</BevelBtn>
                    <BevelBtn onClick={handleSaveReminder} disabled={!form.plan.trim()}>💾 Save</BevelBtn>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DraggableWindow>
  );
}

/* ─── Reminder row ──────────────────────────────────────────────────────── */
function ReminderRow({ reminder, onToggle }: { reminder: Reminder; onToggle: () => void }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "flex-start", gap: 6,
        background: reminder.done ? "#f0f0f0" : "#FFFFC0",
        border: `1px solid ${reminder.done ? "#C0C0C0" : "#C8C800"}`,
        padding: "4px 7px",
        opacity: reminder.done ? 0.65 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {/* Checkbox */}
      <div
        onClick={onToggle}
        style={{
          width: 14, height: 14, flexShrink: 0, marginTop: 2,
          background: reminder.done ? "#000080" : "#fff",
          border: "2px solid", borderColor: "#555 #fff #fff #555",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {reminder.done && (
          <svg width="8" height="6" viewBox="0 0 8 6">
            <polyline points="1,3 3,5 7,1" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div style={{
        flex: 1, fontSize: 14,
        color: reminder.done ? "#888" : "#333",
        textDecoration: reminder.done ? "line-through" : "none",
        lineHeight: 1.3,
      }}>
        {reminder.date && <span style={{ color: "#555" }}>{reminder.date} · </span>}
        {reminder.note || reminder.plan}
      </div>
    </div>
  );
}

/* ─── Shared helpers ────────────────────────────────────────────────────── */
function Divider() {
  return (
    <div style={{
      height: 0,
      borderTop: "1px solid #808080",
      borderBottom: "1px solid #fff",
      margin: "8px 0",
    }} />
  );
}

function BevelBtn({
  onClick, children, disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#A0A0A0" : "#C0C0C0",
        border: "2px solid", borderColor: "#fff #555 #555 #fff",
        padding: "3px 10px",
        fontFamily: "'VT323', monospace", fontSize: 16,
        cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? "#666" : "#000",
      }}
    >
      {children}
    </button>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 15, marginBottom: 3 }}>{label}</div>
      {children}
    </div>
  );
}

function StyledInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", boxSizing: "border-box",
        background: "#fff", border: "2px solid", borderColor: "#555 #fff #fff #555",
        fontFamily: "'VT323', monospace", fontSize: 16,
        padding: "3px 6px", outline: "none",
      }}
    />
  );
}

const closeBtnStyle: React.CSSProperties = {
  background: "#C0C0C0", border: "2px solid",
  borderColor: "#fff #555 #555 #fff",
  color: "#000", cursor: "pointer", fontSize: 11, padding: "0 4px",
};
