# PersonalOS — Matisse Design System
## The single source of truth. Define once, apply everywhere.

---

## CONCEPT

PersonalOS is an experience of reconnection, not a productivity app.
The core metaphor: **art brings color back to life.**
You arrive disconnected (muted), and each creative act restores color.

Visual language: **Henri Matisse cut-outs (gouaches découpés)**
— organic paper shapes, flat vibrant colors, lots of breathing room, serene simplicity.

Why Matisse: timeless and simple (what you loved about retro) but with warmth,
coherence, and calm. Every screen speaks this one language.

---

## 1. COLOR PALETTE

Base palette (the Matisse cut-out colors):
- Cream background:  #F4EAD5
- Sea green:         #2A9D8F
- Coral:             #E76F51
- Mustard:           #E9C46A
- Deep blue:         #264653
- Vivid red:         #E63946
- Soft orange:       #F4A261

These are the ONLY colors. Every screen uses only these.

---

## 2. MOOD SYSTEM (Option A — mood tints everything)

Each mood has ONE dominant Matisse color that bathes the entire space.
The mood is chosen on entry and colors the whole experience that session.

| Mood      | Index | Dominant color      | Feeling                    |
|-----------|-------|---------------------|----------------------------|
| great     | 0     | Mustard #E9C46A     | warm, radiant, golden      |
| good      | 1     | Coral #E76F51       | warm, active, alive        |
| meh       | 2     | Sea green #2A9D8F   | neutral, balanced, calm    |
| sad       | 3     | Deep blue #264653   | cool, introspective, quiet |
| stressed  | 4     | Vivid red #E63946   | intense, but held gently   |

The dominant color washes the background of all screens.
Other palette colors appear as accent cut-out shapes.
The space breathes your emotion — but always in Matisse's serene language.

---

## 3. TYPOGRAPHY

Primary: an elegant SERIF (editorial, calm, timeless).
Recommended fonts (Google Fonts):
- "Fraunces" — modern serif with character, warm
- "DM Serif Display" — elegant, high contrast
- "Cormorant" — refined, airy

Use Fraunces as primary. It has personality without being loud.

Hierarchy:
- Titles:     Fraunces, 44-56px, weight 400-500
- Quotes:     Fraunces, 32-40px, weight 400, italic optional
- Body:       Fraunces, 18-20px, weight 400
- Captions:   Fraunces, 13-15px, weight 400, opacity 0.6

Remove VT323 (pixel font) everywhere — it clashes with Matisse.

Import:
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&display=swap');

---

## 4. SHAPE VOCABULARY (cut-out library)

Reusable organic shapes that appear across all screens.
Build these as CSS border-radius blobs or SVG paths.

LEAF (curved, Matisse algae):
  border-radius: 0% 100% 0% 100% / 60% 40% 60% 40%;

BLOB (organic round):
  border-radius: 60% 40% 55% 45% / 45% 55% 45% 55%;

CORAL (tall wavy):
  border-radius: 80% 20% 60% 40% / 50% 60% 40% 50%;

STAR (cut-out star):
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);

WAVE (flowing):
  border-radius: 100% 0% 100% 0% / 40% 60% 40% 60%;

All shapes: flat fill (one color), opacity 0.9-0.95, slight rotation for life.
Never use gradients. Never use shadows (except very subtle for depth).

---

## 5. SPACING

Matisse breathes. Nothing is crowded.
- Minimum 24px between elements
- Compositions are never full — leave negative space
- Shapes float with room around them
- Center of attention has the most space

---

## 6. SCREEN-BY-SCREEN APPLICATION

### LOGIN (Kandinsky → Matisse)
- Background: cream #F4EAD5
- Drawing creates organic cut-out shapes in palette colors (not lines)
- Each stroke/click spawns a Matisse blob/leaf that drifts gently
- Title "PERSONAL OS" in Fraunces, deep blue
- Sound stays (pentatonic) — drawing makes shapes + sound
- The art you make becomes color shapes that persist

### MOOD SELECT
- Background: cream, fading from the frozen login art
- 5 mood blobs as organic Matisse cut-outs in their dominant colors
- "how are you today?" in Fraunces serif, typing slowly
- Selecting a mood: that color washes outward, tinting the space
- Silence (no music) — the breathing moment

### QUOTE (the redesign you wanted)
- Background: your mood's dominant color, serene and clean
- NO scanner bars, NO paper rectangles, NO falling chaos
- Your camera silhouette appears soft, like a Matisse cut-out figure
- Your movement leaves organic color trails (like flowing paper ribbons)
  in complementary palette colors
- Quote words emerge in Fraunces serif between the color shapes
- They reveal calmly as you move — not falling, emerging
- Below: translation in small Fraunces, opacity 0.6
- "respira piano" / "breathe slowly"

### DESKTOP (Windows 95 → Matisse)
- Background: cream tinted with your mood color
- NO grey windows, NO bevels, NO Windows 95 chrome
- Your "things that matter" as paper cut-out objects with meaning
- Widgets float as organic shapes: polaroid, time capsule, weather+pet
- Icons become Matisse cut-out forms, not folders
- Everything breathes — lots of cream space between elements
- The pet sits among the shapes naturally

---

## 7. WHAT TO REMOVE

- VT323 pixel font → replaced by Fraunces serif
- Windows 95 bevels, grey #C0C0C0, title bars → gone
- Scanner bars in quote → gone
- Paper rectangle cutouts in quote → gone (words emerge clean)
- Black technical backgrounds → replaced by mood-tinted cream
- My Network (contacts) → removed (this is about you, not others)
- Sharp rectangles → replaced by organic shapes

---

## 8. WHAT TO KEEP

- The Kandinsky drawing + sound (becomes Matisse shapes)
- The mood system (now tints everything in Matisse colors)
- The quote experience (redesigned, serene)
- The multilingual quotes + translation tooltip
- Memories as a calendar of daily photos
- The pet companion (sits among Matisse shapes)
- Time capsule + weather as floating widgets
- "Things that matter" — objects you give meaning (replaces Hobbies)

---

## 9. THE FLOW (the ritual)

1. Arrive — cream space, muted, calm
2. Kandinsky — draw with sound, color shapes are born
3. Mood — choose how you feel, that color washes the world
4. Quote — move, color trails flow, words emerge in serif
5. Desktop — rest in your space, your things around you, breathing

Each step adds color. By the end, your world is full. You reconnected.

---

## IMPLEMENTATION ORDER (with your vacation time)

Day 1: Mood select + Quote redesign (the heart, most visible)
Day 2: Login Kandinsky → Matisse shapes
Day 3: Desktop → Matisse (biggest change)
Day 4: Widgets + things that matter + polish
Day 5: Video + description
Buffer: imperfections, testing on mobile/tablet

One system. Applied consistently. No more style decisions — just execution.
