import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type Category = "crochet" | "stationery" | "ai+nlp" | "travel";

interface Post {
  id: number;
  title: string;
  source: string;
  category: Category;
  emoji: string;
  date: string;
  starred: boolean;
  snippet: string;
  url?: string;
}

const INITIAL_POSTS: Post[] = [
  {
    id: 1, title: "10 Cozy Crochet Patterns for Summer",
    source: "YarnLovers Blog", category: "crochet", emoji: "🧶", date: "Jun 9",
    starred: false, url: "https://yarnlovers.example.com",
    snippet: "From sun hats to market bags, these patterns are perfect for warm-weather crafting.",
  },
  {
    id: 2, title: "The Perfect Washi Tape Haul Guide",
    source: "Stationery Nerd", category: "stationery", emoji: "📎", date: "Jun 8",
    starred: false, url: "",
    snippet: "How to curate a washi tape collection that sparks joy every journaling session.",
  },
  {
    id: 3, title: "LLM Attention Mechanisms Explained",
    source: "AI Weekly", category: "ai+nlp", emoji: "🤖", date: "Jun 7",
    starred: true, url: "https://aiweekly.example.com/attention",
    snippet: "A deep dive into how transformers decide what to pay attention to, with visual examples.",
  },
  {
    id: 4, title: "Hidden Cafés in Kyoto's Old Town",
    source: "Wanderlust Diaries", category: "travel", emoji: "✈️", date: "Jun 6",
    starred: false, url: "https://wanderlust.example.com/kyoto",
    snippet: "The locals-only spots that Kyoto tourists always walk right past.",
  },
  {
    id: 5, title: "Crochet Mushroom Cottagecore",
    source: "Cottagecore Craft", category: "crochet", emoji: "🍄", date: "Jun 5",
    starred: true, url: "",
    snippet: "Tiny amigurumi mushrooms, fern bookmarks and more to fuel your forest fantasy.",
  },
  {
    id: 6, title: "RAG vs Fine-tuning: When to Use Each",
    source: "NLP Papers Daily", category: "ai+nlp", emoji: "🧠", date: "Jun 4",
    starred: false, url: "https://nlppapers.example.com/rag",
    snippet: "Practical guidance on choosing your knowledge augmentation strategy.",
  },
];

const CATEGORY_COLORS: Record<Category, string> = {
  crochet: "#ff9a9e", stationery: "#a1c4fd", "ai+nlp": "#84fab0", travel: "#ffecd2",
};

const CATEGORIES: Category[] = ["crochet", "stationery", "ai+nlp", "travel"];
type Filter = "all" | Category;

const EMPTY_FORM = { title: "", source: "", category: "crochet" as Category, emoji: "📌", url: "", snippet: "" };

let postIdCounter = 100;

export function HobbiesWindow() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [filter, setFilter] = useState<Filter>("all");
  const [queueMode, setQueueMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const toggleStar = (id: number) =>
    setPosts(prev => prev.map(p => p.id === id ? { ...p, starred: !p.starred } : p));

  const handleAddPost = () => {
    if (!form.title.trim()) return;
    setPosts(prev => [
      {
        id: ++postIdCounter,
        title: form.title, source: form.source,
        category: form.category, emoji: form.emoji,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        starred: false, url: form.url, snippet: form.snippet,
      },
      ...prev,
    ]);
    setForm(EMPTY_FORM);
    setAddOpen(false);
  };

  const starredPosts = posts.filter(p => p.starred);
  const filteredPosts = queueMode
    ? starredPosts
    : filter === "all" ? posts : posts.filter(p => p.category === filter);

  const filters: { val: Filter; label: string }[] = [
    { val: "all", label: "All" },
    { val: "crochet", label: "🧶 Crochet" },
    { val: "stationery", label: "📎 Stationery" },
    { val: "ai+nlp", label: "🤖 AI+NLP" },
    { val: "travel", label: "✈️ Travel" },
  ];

  return (
    <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Toolbar row — fixed, no scroll */}
      <div style={{
        display: "flex", alignItems: "flex-start", flexShrink: 0,
        justifyContent: "space-between", gap: 8, marginBottom: 10, flexWrap: "wrap",
      }}>
        {/* Category filters + Add button */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {!queueMode && filters.map(f => (
            <button
              key={f.val}
              onClick={() => setFilter(f.val)}
              style={{
                background: filter === f.val ? "#000080" : "#C0C0C0",
                color: filter === f.val ? "#fff" : "#000",
                border: "2px solid",
                borderColor: filter === f.val ? "#0000a0 #000040 #000040 #0000a0" : "#fff #555 #555 #fff",
                padding: "3px 10px",
                fontFamily: "'VT323', monospace", fontSize: 15, cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setAddOpen(true)}
            style={{
              background: "#C0C0C0", border: "2px solid", borderColor: "#fff #555 #555 #fff",
              padding: "3px 10px", fontFamily: "'VT323', monospace", fontSize: 15, cursor: "pointer",
            }}
          >
            + Add Post
          </button>
        </div>

        {/* Reading queue toggle */}
        <button
          onClick={() => setQueueMode(q => !q)}
          style={{
            background: queueMode ? "#000080" : "#C0C0C0",
            color: queueMode ? "#fff" : "#000",
            border: "2px solid",
            borderColor: queueMode ? "#0000a0 #000040 #000040 #0000a0" : "#fff #555 #555 #fff",
            padding: "3px 10px",
            fontFamily: "'VT323', monospace", fontSize: 15, cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          📋 Reading Queue ({starredPosts.length} saved)
        </button>
      </div>

      {/* Scrollable post area */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>

      {/* Queue mode: retro file-manager list */}
      {queueMode ? (
        <div style={{ border: "2px solid", borderColor: "#555 #fff #fff #555", background: "#fff" }}>
          <div style={{
            background: "#000080", color: "#fff",
            padding: "3px 8px", fontSize: 15, letterSpacing: 1,
          }}>
            📋 READING QUEUE — {starredPosts.length} item{starredPosts.length !== 1 ? "s" : ""}
          </div>
          {starredPosts.length === 0 ? (
            <div style={{ padding: 16, color: "#808080", fontSize: 15 }}>
              No starred posts yet. Star a post to add it to your queue.
            </div>
          ) : (
            starredPosts.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "5px 8px",
                  borderBottom: "1px solid #E0E0E0",
                  background: i % 2 === 0 ? "#fff" : "#f8f8f8",
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{p.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#808080" }}>{p.source}</div>
                </div>
                {p.url && (
                  <button
                    onClick={() => window.open(p.url, "_blank")}
                    style={{
                      background: "#C0C0C0", border: "2px solid", borderColor: "#fff #555 #555 #fff",
                      padding: "2px 8px", fontFamily: "'VT323', monospace", fontSize: 14,
                      cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    }}
                  >
                    ▶ visit
                  </button>
                )}
                <button
                  onClick={() => toggleStar(p.id)}
                  title="Remove from queue"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#FF6600", fontSize: 16, padding: 0, flexShrink: 0 }}
                >
                  ★
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Normal card view */
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} onToggleStar={() => toggleStar(post.id)} />
          ))}
          {filteredPosts.length === 0 && (
            <div style={{ textAlign: "center", padding: 20, color: "#808080" }}>
              No posts in this category yet.
            </div>
          )}
        </div>
      )}

      </div>{/* end scrollable */}

      {/* Add Post dialog */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            key="add"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0,
              background: "rgba(192,192,192,0.96)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 10,
            }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 26 }}
              style={{
                background: "#C0C0C0", border: "2px solid",
                borderColor: "#fff #555 #555 #fff", width: 320,
              }}
            >
              <div style={{
                background: "linear-gradient(90deg,#000080,#1084D0)",
                color: "#fff", padding: "4px 8px",
                display: "flex", justifyContent: "space-between", fontSize: 17,
              }}>
                <span>+ Add Post</span>
                <button onClick={() => setAddOpen(false)} style={closeBtnStyle}>✕</button>
              </div>

              <div style={{ padding: 14 }}>
                <FieldRow label="Title *">
                  <StyledInput value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="article title..." />
                </FieldRow>
                <FieldRow label="Source">
                  <StyledInput value={form.source} onChange={v => setForm(f => ({ ...f, source: v }))} placeholder="blog name..." />
                </FieldRow>
                <FieldRow label="Category">
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                    style={{
                      width: "100%", background: "#fff", border: "2px solid",
                      borderColor: "#555 #fff #fff #555",
                      fontFamily: "'VT323', monospace", fontSize: 16,
                      padding: "3px 6px", outline: "none",
                    }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FieldRow>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <FieldRow label="Emoji">
                      <StyledInput value={form.emoji} onChange={v => setForm(f => ({ ...f, emoji: v.slice(-2) || v }))} placeholder="📌" style={{ width: 64 }} />
                    </FieldRow>
                  </div>
                </div>
                <FieldRow label="URL (optional)">
                  <StyledInput value={form.url} onChange={v => setForm(f => ({ ...f, url: v }))} placeholder="https://..." />
                </FieldRow>
                <FieldRow label="Snippet (optional)">
                  <StyledInput value={form.snippet} onChange={v => setForm(f => ({ ...f, snippet: v }))} placeholder="brief description..." />
                </FieldRow>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                  <BevelBtn onClick={() => setAddOpen(false)}>Cancel</BevelBtn>
                  <BevelBtn onClick={handleAddPost} disabled={!form.title.trim()}>💾 Save</BevelBtn>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Post card ─────────────────────────────────────────────────────── */
function PostCard({ post, onToggleStar }: { post: Post; onToggleStar: () => void }) {
  return (
    <div style={{
      background: "#fff",
      border: "2px solid #C0C0C0",
      borderLeft: `4px solid ${CATEGORY_COLORS[post.category]}`,
      padding: "8px 10px",
      display: "flex", gap: 10,
    }}>
      {/* Thumbnail */}
      <div style={{
        width: 48, height: 48, background: CATEGORY_COLORS[post.category],
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, border: "1px solid #ccc",
      }}>
        {post.emoji}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 17, lineHeight: 1.2, marginBottom: 2 }}>{post.title}</div>
          <button
            onClick={onToggleStar}
            style={{
              background: "none", border: "none", fontSize: 18, cursor: "pointer",
              color: post.starred ? "#ff6600" : "#C0C0C0", flexShrink: 0, padding: 0,
            }}
            title="Read later"
          >★</button>
        </div>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 3 }}>
          {post.source} · {post.date}
          <span style={{
            marginLeft: 8, background: CATEGORY_COLORS[post.category],
            padding: "1px 5px", fontSize: 11, border: "1px solid #ccc",
          }}>
            {post.category}
          </span>
        </div>
        {post.snippet && (
          <div style={{ fontSize: 14, color: "#333", lineHeight: 1.3 }}>{post.snippet}</div>
        )}
        {post.url && (
          <button
            onClick={() => window.open(post.url, "_blank")}
            style={{
              marginTop: 5,
              background: "#C0C0C0", border: "2px solid", borderColor: "#fff #555 #555 #fff",
              padding: "2px 8px", fontFamily: "'VT323', monospace", fontSize: 14,
              cursor: "pointer",
            }}
          >
            ▶ visit
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────── */
function BevelBtn({ onClick, children, disabled }: {
  onClick: () => void; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? "#A0A0A0" : "#C0C0C0",
      border: "2px solid", borderColor: "#fff #555 #555 #fff",
      padding: "4px 12px", fontFamily: "'VT323', monospace",
      fontSize: 16, cursor: disabled ? "not-allowed" : "pointer",
      color: disabled ? "#666" : "#000",
    }}>
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

function StyledInput({ value, onChange, placeholder, style }: {
  value: string; onChange: (v: string) => void; placeholder?: string; style?: React.CSSProperties;
}) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: "100%", boxSizing: "border-box",
        background: "#fff", border: "2px solid", borderColor: "#555 #fff #fff #555",
        fontFamily: "'VT323', monospace", fontSize: 16,
        padding: "3px 6px", outline: "none", ...style,
      }}
    />
  );
}

const closeBtnStyle: React.CSSProperties = {
  background: "#C0C0C0", border: "2px solid",
  borderColor: "#fff #555 #555 #fff",
  color: "#000", cursor: "pointer", fontSize: 11, padding: "0 4px",
};
