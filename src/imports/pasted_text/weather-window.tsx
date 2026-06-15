Apply these 4 changes to PersonalOS:

================================================================
CHANGE 1: Fix WeatherWindow — poetic weather with real API
================================================================

In WeatherWindow.tsx, replace the mock data with a real weather API call
using Open-Meteo (free, no API key needed).

Replace the entire component with:

import React, { useState, useEffect } from "react";

const POETIC_PHRASES: Record<string, string[]> = {
  sunny_hot: [
    "the sun showed up for you today ☀️",
    "a good day to exist outside",
    "golden hour starts early today",
  ],
  sunny_mild: [
    "soft light, good energy ☀️",
    "the world is bright today",
    "step outside, even for a minute",
  ],
  cloudy: [
    "a grey sky is still a sky",
    "good day to stay in with something warm",
    "the world is being quiet today ☁️",
  ],
  partly_cloudy: [
    "soft light, no harsh shadows today",
    "clouds are just the sky being thoughtful",
    "perfect light for photos ⛅",
  ],
  rainy: [
    "rain is just the sky journaling 🌧",
    "good day for crochet and lo-fi",
    "let it rain. you're inside.",
  ],
  cold: [
    "bundle up, the world is cold today 🧣",
    "a blanket day if there ever was one",
    "warm drink first, everything else after",
  ],
  default: [
    "whatever the sky is doing, you're here ✦",
    "the weather is just the background today",
  ],
};

const PET_SUGGESTIONS: Record<string, string> = {
  sunny_hot: "go outside for 10 min, even just to feel it 🌿",
  sunny_mild: "a walk sounds good today 🌸",
  cloudy: "open a window, let some air in ☁️",
  partly_cloudy: "good light for photos today 📷",
  rainy: "perfect excuse to stay cozy 🍵",
  cold: "warm drink first, everything else after 🧣",
  default: "check the window instead 🪟",
};

const getWeatherKey = (code: number, temp: number): string => {
  if (code === 0) return temp > 25 ? "sunny_hot" : "sunny_mild";
  if (code <= 2) return "partly_cloudy";
  if (code <= 48) return "cloudy";
  if (code <= 67) return "rainy";
  if (code <= 77) return "cold";
  if (code <= 82) return "rainy";
  return temp < 5 ? "cold" : "cloudy";
};

const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export function WeatherWindow({ companionId = "cat" }: { companionId?: string }) {
  const [weather, setWeather] = useState<{
    temp: number; desc: string; key: string;
  } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Brussels coordinates — update if user location changes
    const lat = 50.85;
    const lon = 4.35;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&temperature_unit=celsius`
    )
      .then(r => r.json())
      .then(data => {
        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weathercode;
        const key = getWeatherKey(code, temp);
        const descs: Record<string, string> = {
          sunny_hot: "Sunny", sunny_mild: "Sunny",
          partly_cloudy: "Partly Cloudy", cloudy: "Cloudy",
          rainy: "Rainy", cold: "Cold",
        };
        setWeather({ temp, desc: descs[key] ?? "Unknown", key });
      })
      .catch(() => setError(true));
  }, []);

  const petImg = `/assets/pets/${companionId}-normal.png`;
  const phrase = weather ? pickRandom(POETIC_PHRASES[weather.key] ?? POETIC_PHRASES.default) : null;
  const suggestion = weather ? PET_SUGGESTIONS[weather.key] : PET_SUGGESTIONS.default;

  if (error || !weather) {
    return (
      <div style={{ fontFamily: "'VT323', monospace", padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 16, color: "#808080", marginBottom: 16 }}>
          couldn't reach the sky today
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
          <img src={petImg} style={{ width: 48, height: 60, imageRendering: "pixelated" }} />
          <div style={{
            background: "#FFFFC0", border: "1px solid #333",
            padding: "6px 10px", borderRadius: 6,
            fontSize: 14, fontFamily: "'VT323', monospace",
          }}>
            check the window instead 🪟
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'VT323', monospace", padding: "12px 14px" }}>
      
      {/* Location */}
      <div style={{
        background: "#000080", color: "#fff",
        padding: "4px 10px", marginBottom: 14,
        fontSize: 18, display: "flex", alignItems: "center", gap: 6,
      }}>
        📍 Brussels, BE
      </div>

      {/* Temperature */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 64, lineHeight: 1, color: "#000" }}>
          {weather.temp}°C
        </div>
        <div style={{ fontSize: 18, color: "#555" }}>{weather.desc}</div>
      </div>

      {/* Poetic phrase */}
      <div style={{
        textAlign: "center",
        fontSize: 18,
        fontStyle: "italic",
        color: "#333",
        padding: "10px 12px",
        borderTop: "1px solid #C0C0C0",
        borderBottom: "1px solid #C0C0C0",
        marginBottom: 14,
        lineHeight: 1.4,
      }}>
        {phrase}
      </div>

      {/* Pet recommendation */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src={petImg}
          style={{ width: 48, height: 60, imageRendering: "pixelated", flexShrink: 0 }}
        />
        <div style={{
          background: "#FFFFC0",
          border: "1px solid #333",
          borderRadius: 6,
          padding: "6px 10px",
          fontSize: 14,
          position: "relative",
        }}>
          {suggestion}
        </div>
      </div>

    </div>
  );
}

Also pass companionId from Desktop.tsx:
  <WeatherWindow companionId={companion} />

================================================================
CHANGE 2: Polaroid widget — bigger photo area
================================================================

In PolaroidWidget.tsx, update these sizes:

Photo area (upload zone):
  width: 160px
  height: 130px

Polaroid white frame:
  width: 180px
  padding: 8px 8px 32px 8px

Caption text below:
  fontSize: 13px

Everything else (draggable, rotation, pushpin) stays the same.

================================================================
CHANGE 3: All desktop icons → folder style
================================================================

In Desktop.tsx, update ALL icon images EXCEPT Time and Weather.

The icons to change: My Space, My Network, Memories, My Hobbies

For each of these 4 icons, replace the current icon image/emoji with
a Windows 95 pixel art folder SVG. Each folder has a unique color tab
to differentiate them:

const FOLDER_ICONS = {
  myspace:   { tabColor: "#FF6B9D", bodyColor: "#F0C040" },  // pink tab
  mynetwork: { tabColor: "#4D9DE0", bodyColor: "#F0C040" },  // blue tab
  memories:  { tabColor: "#6BCB77", bodyColor: "#F0C040" },  // green tab
  hobbies:   { tabColor: "#E15FED", bodyColor: "#F0C040" },  // purple tab
};

Folder SVG component (48x48px viewBox):
function FolderIcon({ tabColor, bodyColor }: { tabColor: string; bodyColor: string }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" style={{ imageRendering: "pixelated" }}>
      {/* Folder tab */}
      <rect x="4" y="14" width="16" height="6" rx="2" fill={tabColor} />
      {/* Folder body */}
      <rect x="4" y="18" width="40" height="26" rx="2" fill={bodyColor} />
      {/* Folder body highlight */}
      <rect x="4" y="18" width="40" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
      {/* Folder shadow */}
      <rect x="4" y="40" width="40" height="4" rx="2" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}

Keep Time and Weather with their existing icons unchanged.

================================================================
CHANGE 4: Memories → Calendar view
================================================================

Replace MemoriesWindow.tsx content with a calendar-based layout.

CONCEPT:
Each day of the month shows as a calendar cell.
Days where the user uploaded a photo show a tiny thumbnail.
Clicking a day opens a detail view of that day's photo + caption + prompt.

DATA STRUCTURE:
interface DayMemory {
  date: string;       // "2026-06-12"
  photoUrl?: string;  // from URL.createObjectURL
  caption?: string;   // user's caption
  prompt?: string;    // the daily prompt that was shown ("something orange")
  emoji?: string;     // chosen emoji
  color?: string;     // polaroid color
}

State: const [memories, setMemories] = useState<DayMemory[]>([])
State: const [currentMonth, setCurrentMonth] = useState(new Date())
State: const [selectedDay, setSelectedDay] = useState<DayMemory | null>(null)

CALENDAR LAYOUT:

Header row:
  "◀" button | "June 2026" in VT323 20px | "▶" button
  Navigation changes currentMonth state

Days of week row: Sun Mon Tue Wed Thu Fri Sat
  VT323 14px, color #808080, borderBottom 1px solid #C0C0C0

Calendar grid (7 columns):
  Each cell: ~52px wide, ~52px tall
  Border: 1px solid #E0E0E0
  
  Empty days (before month starts): light grey background #F5F5F5
  
  Regular days:
    Day number: top-left, VT323 14px color #555
    
    If memory exists for that day:
      Show photo thumbnail (fill entire cell, objectFit: cover)
      Day number overlaid on top-left with white text + dark shadow
      Small colored dot bottom-right matching the memory emoji/color
    
    If no memory:
      White background
      Day number top-left grey
      Today's date: slightly highlighted (#FFF9E6 background, amber border)
  
  On click any day: setSelectedDay with that day's memory (or null if empty)

DETAIL VIEW (when selectedDay is set):
  Shows below the calendar OR as an overlay:
  
  If day has memory:
    Photo (if exists): 200px wide, objectFit: cover
    Emoji: 32px
    Caption: VT323 16px
    Prompt: VT323 13px italic color #808080 ("📸 something orange")
    Date: VT323 14px color #555
    "✕ close" and "🗑 delete" buttons
  
  If day is empty:
    "nothing saved for this day"
    "+ add memory" button → opens Add Memory dialog (keep existing dialog)

ADD MEMORY:
  Keep the existing Add Memory dialog exactly as it is.
  When a memory is saved, associate it with today's date automatically.
  It appears in the calendar on today's cell.

RESULT:
Memories is now a personal photo calendar.
You can scroll through months and see your days at a glance.
Days with photos are filled with color — empty days are blank waiting.
The polaroid widget on the desktop feeds directly into this calendar.