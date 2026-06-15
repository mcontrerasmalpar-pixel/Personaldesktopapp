import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ContactWindow } from "./ContactWindow";

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

const INITIAL_CONTACTS: Contact[] = [
  { id: 1, name: "Alex Chen",   avatar: "🧑‍💻", lastContact: "2026-06-08", status: "online" },
  { id: 2, name: "Sofia M.",    avatar: "👩‍🎨", lastContact: "2026-06-06", status: "away" },
  { id: 3, name: "Jordan Lee",  avatar: "🧑‍🎸", lastContact: "2026-06-01", status: "offline" },
  { id: 4, name: "Priya K.",    avatar: "👩‍🔬", lastContact: "2026-05-28", status: "online" },
  { id: 5, name: "Milo D.",     avatar: "🧑‍🍳", lastContact: "2026-05-15", status: "offline" },
];

const STATUS_COLORS = { online: "#00aa00", away: "#aaaa00", offline: "#808080" };

let reminderIdCounter = 100;
let contactIdCounter  = 200;

/* Track which contact windows are open and their z-indices */
interface OpenContact { id: number; zIndex: number }

export function MyNetworkWindow() {
  const [contacts, setContacts]   = useState<Contact[]>(INITIAL_CONTACTS);
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: 1, contactId: 1, plan: "coffee next week",  date: "Jun 17", note: "ask about his favorite music", done: false },
    { id: 2, contactId: 3, plan: "catching up call",  date: "Jun 20", note: "share hiking trail photos",   done: false },
    { id: 3, contactId: 4, plan: "birthday lunch",    date: "Jul 2",  note: "she likes ramen",             done: true  },
  ]);

  const [openContacts, setOpenContacts] = useState<OpenContact[]>([]);
  const [topZ, setTopZ] = useState(3000); // high enough to float above all desktop windows

  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState<{
    name: string; avatar: string; status: Contact["status"];
  }>({ name: "", avatar: "👤", status: "offline" });

  /* ── Open / close / focus contact windows ──────────────────────── */
  const openContact = (id: number) => {
    if (openContacts.some(w => w.id === id)) {
      // already open — just focus it
      focusContact(id);
      return;
    }
    const newZ = topZ + 1;
    setTopZ(newZ);
    setOpenContacts(prev => [...prev, { id, zIndex: newZ }]);
  };

  const closeContact = (id: number) =>
    setOpenContacts(prev => prev.filter(w => w.id !== id));

  const focusContact = useCallback((id: number) => {
    setTopZ(prev => {
      const newZ = prev + 1;
      setOpenContacts(oc => oc.map(w => w.id === id ? { ...w, zIndex: newZ } : w));
      return newZ;
    });
  }, []);

  /* ── Reminder handlers ──────────────────────────────────────────── */
  const handleAddReminder = (
    contactId: number, plan: string, date: string, note: string
  ) => {
    setReminders(prev => [
      ...prev,
      { id: ++reminderIdCounter, contactId, plan, date, note, done: false },
    ]);
  };

  const toggleDone = (id: number) =>
    setReminders(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r));

  /* ── Add Contact ────────────────────────────────────────────────── */
  const handleAddContact = () => {
    if (!contactForm.name.trim()) return;
    setContacts(prev => [...prev, {
      id: ++contactIdCounter,
      name: contactForm.name,
      avatar: contactForm.avatar || "👤",
      lastContact: new Date().toISOString().split("T")[0],
      status: contactForm.status,
    }]);
    setContactForm({ name: "", avatar: "👤", status: "offline" });
    setContactOpen(false);
  };

  /* ── Initial position stagger for contact windows ───────────────── */
  const posForContact = (id: number) => {
    const idx = contacts.findIndex(c => c.id === id);
    return { x: 460 + (idx % 4) * 24, y: 80 + (idx % 4) * 28 };
  };

  return (
    <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, position: "relative" }}>

      {/* Header info bar */}
      <div style={{
        background: "#D8D8D8", border: "2px solid",
        borderColor: "#555 #fff #fff #555",
        padding: "4px 8px", marginBottom: 8, fontSize: 15, color: "#555",
      }}>
        {contacts.length} contacts · {reminders.filter(r => !r.done).length} pending reminders
      </div>

      {/* Contact list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 10 }}>
        {contacts.map(contact => {
          const isOpen = openContacts.some(w => w.id === contact.id);
          return (
            <div
              key={contact.id}
              onClick={() => openContact(contact.id)}
              style={{
                padding: "6px 8px",
                background: isOpen ? "#000080" : "transparent",
                color: isOpen ? "#fff" : "#000",
                cursor: "pointer",
                borderBottom: "1px solid #D0D0D0",
              }}
              onMouseEnter={e => {
                if (!isOpen) {
                  e.currentTarget.style.background = "#0000C0";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={e => {
                if (!isOpen) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#000";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "#E0E0E0", border: "2px solid", borderColor: "#fff #555 #555 #fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>
                  {contact.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 18 }}>{contact.name}</div>
                  <div style={{ fontSize: 13, color: isOpen ? "#ccc" : "#808080" }}>
                    last: {contact.lastContact}
                  </div>
                </div>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: STATUS_COLORS[contact.status],
                  border: "1px solid #555", flexShrink: 0,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom action */}
      <div style={{ display: "flex", gap: 8 }}>
        <BevelBtn onClick={() => setContactOpen(true)}>👤 Add Contact</BevelBtn>
      </div>

      {/* Add Contact dialog */}
      <AnimatePresence>
        {contactOpen && (
          <motion.div
            key="contact-dialog"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "absolute", inset: 0,
              background: "rgba(192,192,192,0.96)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 10,
            }}
          >
            <div style={{
              background: "#C0C0C0", border: "2px solid",
              borderColor: "#fff #555 #555 #fff", width: 310,
            }}>
              <div style={{
                background: "linear-gradient(90deg, #000080, #1084D0)",
                color: "#fff", padding: "4px 8px",
                display: "flex", justifyContent: "space-between", fontSize: 17,
              }}>
                <span>👤 Add Contact</span>
                <button onClick={() => setContactOpen(false)} style={closeBtnStyle}>✕</button>
              </div>
              <div style={{ padding: 14 }}>
                <FieldRow label="Name *">
                  <StyledInput
                    value={contactForm.name}
                    onChange={v => setContactForm(f => ({ ...f, name: v }))}
                    placeholder="Full name..."
                  />
                </FieldRow>
                <FieldRow label="Avatar emoji">
                  <StyledInput
                    value={contactForm.avatar}
                    onChange={v => setContactForm(f => ({ ...f, avatar: v.slice(-2) || v }))}
                    placeholder="👤"
                  />
                </FieldRow>
                <FieldRow label="Status">
                  <select
                    value={contactForm.status}
                    onChange={e => setContactForm(f => ({ ...f, status: e.target.value as Contact["status"] }))}
                    style={{
                      width: "100%", background: "#fff", border: "2px solid",
                      borderColor: "#555 #fff #fff #555",
                      fontFamily: "'VT323', monospace", fontSize: 16,
                      padding: "3px 6px", outline: "none",
                    }}
                  >
                    <option value="online">online</option>
                    <option value="away">away</option>
                    <option value="offline">offline</option>
                  </select>
                </FieldRow>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                  <BevelBtn onClick={() => setContactOpen(false)}>Cancel</BevelBtn>
                  <BevelBtn onClick={handleAddContact} disabled={!contactForm.name.trim()}>💾 Save</BevelBtn>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact windows — rendered via DraggableWindow (position: fixed) */}
      {openContacts.map(({ id, zIndex }) => {
        const contact = contacts.find(c => c.id === id);
        if (!contact) return null;
        return (
          <ContactWindow
            key={id}
            contact={contact}
            reminders={reminders.filter(r => r.contactId === id)}
            zIndex={zIndex}
            initialPos={posForContact(id)}
            onClose={() => closeContact(id)}
            onFocus={() => focusContact(id)}
            onToggleDone={toggleDone}
            onAddReminder={handleAddReminder}
          />
        );
      })}
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */
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
        padding: "4px 12px",
        fontFamily: "'VT323', monospace", fontSize: 17,
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
