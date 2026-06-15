Redesign TimeWindow.tsx and WeatherWindow.tsx with new concepts:
Time → personal time capsule (message to your future self)
Weather → poetic climate with pet recommendation

--- PART 1: TimeWindow.tsx — Time Capsule ---

Replace the current clock display with a time capsule experience.

CONCEPT:
The user writes a message to their future self, sets an opening date,
and the capsule seals. Until that date, it shows as a sealed envelope on the desktop.
On the opening date, the envelope glows and can be opened.

--- TimeWindow layout ---

Window title: "Time — timecapsule.exe"
Width: 380px

TWO STATES: writing mode and sealed mode.

STATE 1 — WRITING MODE (no capsule exists yet, or user is creating new one):

Header in VT323 20px: "a message to your future self"
Subtitle in VT323 14px color #808080: "seal it. forget it. find it later."

Form fields:
  "open on:" — date input (styled as Windows 95 sunken input)
    min date: tomorrow
    placeholder: "pick a date"

  "dear future me," — label in VT323 16px italic color #555
  Textarea (min-height 120px, VT323 16px, #fff background, sunken border):
    placeholder: "what do you want to remember? what are you hoping for?"

  Optional photo:
    Small upload area (80x60px, dashed border):
    "📷 add a photo of today (optional)"
    On upload: shows thumbnail preview

  Seal button: "💌 seal the capsule"
    Bevel style, full width, VT323 18px
    On click: saves capsule data to state, switches to SEALED MODE

STATE 2 — SEALED MODE (capsule exists, opening date not reached):

Show a large envelope illustration (CSS/SVG pixel art):
  Envelope body: #f5f0e8 (aged paper)
  Envelope flap: sealed with a red wax seal (circle #CC0000 with ✦ inside)
  Border: 2px solid #8B6914 (warm brown)
  Size: 200x140px, centered
  Subtle drop shadow

Below envelope:
  "sealed on: [date written]" VT323 14px color #808080
  "opens on: [opening date]" VT323 16px color #000080 bold
  Countdown: "X days to go" VT323 14px color #555

If optional photo was added:
  Show a tiny polaroid (40x40px) peeking out from behind the envelope, slightly rotated

"write a new capsule" small link below — opens writing mode for a new capsule
(keeps the old sealed one, adds to a list)

STATE 3 — OPENING DAY (current date >= opening date):

The envelope glows with a warm pulse animation:
  @keyframes capsuleGlow {
    0%, 100% { box-shadow: 0 0 8px rgba(255,200,50,0.4); }
    50%       { box-shadow: 0 0 20px rgba(255,200,50,0.8); }
  }

Header changes to: "✨ it's time" VT323 24px
Subtitle: "your past self left you something"

"open capsule" bevel button — on click:
  Envelope flap animates open (CSS transform on the flap element)
  Message appears with a fade-in, rendered in ransomizer style:
    Use the RansomTitle component but for the full message text
    Each word gets random font/size/color — like a real found letter
  If photo exists: shows the photo as a polaroid
  Date written shows at bottom: "written on [date], [X] days ago"

--- Desktop integration for sealed capsule ---

When a capsule is sealed, show a small envelope icon on the desktop
(position: fixed, near the polaroid widget, or as a desktop icon).
On opening day: the envelope icon pulses with the glow animation.
Clicking it opens TimeWindow directly to the opening state.

In Desktop.tsx:
  Add state: const [capsule, setCapsule] = useState(null)
  Pass onCapsuleSealed and capsule props between TimeWindow and Desktop.

--- PART 2: WeatherWindow.tsx — Poetic Weather ---

Replace current weather display with a warm, poetic interpretation
of real weather data + a pet recommendation.

CONCEPT:
Not a weather app. Your pet tells you about the weather in their own words,
with a poetic phrase and a personal suggestion based on conditions.

--- WeatherWindow layout ---

Window title: "Weather — sky.dat"
Width: 320px

Top section — current conditions:
  Large pixel art weather icon (CSS art, 64x64px):
    ☀️ sun: yellow circle with rays
    ⛅ partly cloudy: sun + cloud overlapping
    ☁️ cloudy: grey cloud
    🌧 rain: cloud + falling pixel drops (animated)
    ❄️ snow: cloud + falling pixel flakes (animated)
    🌫 fog: horizontal lines
  
  Temperature in VT323 48px: "19°C"
  Location in VT323 14px color #808080: "Brussels, BE"

Middle section — poetic phrase:
  A warm sentence interpreting the weather, VT323 18px, centered, italic:
  
  Map weather conditions to poetic phrases:
  
  Sunny + warm (>20°C):
    "the sun showed up for you today ☀️"
    "a good day to exist outside"
    "golden hour starts early today"
  
  Partly cloudy:
    "soft light, no harsh shadows today"
    "clouds are just the sky being thoughtful"
    "perfect light for photos"
  
  Cloudy:
    "a grey sky is still a sky"
    "good day to stay in with something warm"
    "the world is being quiet today"
  
  Rainy:
    "rain is just the sky journaling"
    "good day for crochet and lo-fi"
    "let it rain. you're inside."
  
  Cold (<10°C):
    "bundle up, the world is cold today"
    "a blanket day if there ever was one"
  
  Pick randomly from the matching list each time the window opens.

Bottom section — pet recommendation:
  Show the companion's current pose image (same as desktop pet)
  Speech bubble next to pet with a specific suggestion:
  
  Sunny: "go outside for 10 min, even just to feel it 🌿"
  Cloudy: "open a window, let some air in ☁️"
  Rainy: "perfect excuse to stay cozy 🍵"
  Cold: "warm drink first, everything else after 🧣"
  Hot (>28°C): "hydrate! seriously 💧"
  
  Speech bubble style: #FFFFC0 background, 1px solid #333, VT323 14px,
  small triangle tail pointing to pet, same as journal reaction bubble.

Weather data:
  Use the existing WeatherWindow API call (already implemented).
  If API fails: show a fallback — "couldn't reach the sky today"
  with the pet saying "check the window instead 🪟"

--- RESULT ---

TimeWindow: a personal ritual — write to your future self, seal it, wait.
The sealed envelope lives on your desktop until opening day.
On that day it glows and your past self speaks to you.

WeatherWindow: not data, not a dashboard.
Your pet tells you about the sky in their own words.
"rain is just the sky journaling" — warm, human, yours.