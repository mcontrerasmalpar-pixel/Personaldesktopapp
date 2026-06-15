# 🖥️ personalOS — A Retro Personal Desktop Experience

> *A playful digital universe for capturing mood, memory, and meaning — built with React, TypeScript and Figma.*

[![Figma Design](https://img.shields.io/badge/Figma-Design%20File-orange?logo=figma)](https://www.figma.com/design/z78BK8481zg03YyqfioVDe/Retro-Personal-Desktop-App)
[![Built with React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)](https://vitejs.dev)

---

## ✨ What is personalOS?

**personalOS** is an interactive retro desktop app that turns self-expression into play. It's not a productivity tool — it's a personal digital universe where every interaction is intentional, emotional, and a little bit magical.

Inspired by the nostalgia of Windows 95 and the personal web of early 2000s, it brings back the feeling of a computer that feels *yours*.

---

## 🌊 The Experience Flow

```
🎨 Login Screen
  └─ Draw with your cursor → music is generated from your strokes

🌈 Mood Screen  
  └─ Pick a color that matches how you feel today
      └─ The entire desktop palette adapts to your mood

🖥️ Desktop
  ├─ 📓 Journal         → unlock with a cat meme memorama (no timer, no pressure)
  ├─ 🗓️ Memories        → calendar of photos, emojis and captions per day
  ├─ 🌟 My Space        → your personal profile + journal hub
  ├─ 📸 Polaroid Widget → shoot a mood-prompted photo, edit in Paint
  ├─ 🕰️ Time Capsule    → write a message to your future self
  ├─ 🎯 Goals           → track what matters
  ├─ 🎮 Hobbies         → showcase your passions
  ├─ 🌐 My Network      → your personal contact web
  ├─ 🌤️ Weather Widget  → retro weather at a glance
  ├─ 💬 Falling Letters → activate your camera, move, and watch quotes rain down
  └─ 🐾 Pixel Pet       → your animated companion lives on the desktop
```

---

## 🐱 Signature Moments

| Feature | Why it's special |
|---|---|
| **Drawing Login** | You draw on the screen with your cursor — the strokes generate ambient music |
| **Mood-Adaptive Desktop** | The entire UI color palette changes based on the mood you pick |
| **Cat Memorama Gate** | To open your Journal, you must match cat meme pairs — no timer, relaxing |
| **Falling Letters** | Open your camera, move your body, and watch quote letters fall with your motion |
| **Time Capsule** | Write a message sealed until a future date you choose |
| **Polaroid + Paint** | Take a mood-prompted photo, then customize it in a retro paint editor |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| UI components | shadcn/ui |
| Animation | Framer Motion (`motion/react`) |
| Fonts | VT323 (retro monospace), Google Fonts |
| Package manager | pnpm (workspace) |
| Design source | Figma |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

> **Tip:** For the best experience, open in fullscreen and allow camera access when prompted.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── App.tsx                  # Root — manages login → mood → desktop flow
│   └── components/
│       ├── LoginScreen.tsx       # Canvas drawing + music generation
│       ├── MoodScreen.tsx        # Mood color picker
│       ├── Desktop.tsx           # Main desktop environment
│       ├── CatMemorama.tsx       # Cat meme memorama (Journal gate)
│       ├── FallingLetters.tsx    # Camera-motion quote experience
│       ├── PolaroidWidget.tsx    # Mood-prompted photo capture
│       ├── PaintWindow.tsx       # Retro paint editor
│       ├── PixelPet.tsx          # Animated desktop companion
│       ├── MeaningBoardWidget.tsx
│       ├── WeatherWidget.tsx
│       ├── RansomText.tsx        # Ransom-note style typography
│       ├── DraggableWindow.tsx   # Draggable OS window system
│       ├── Taskbar.tsx
│       ├── WallpaperPicker.tsx
│       ├── LanguagePicker.tsx
│       ├── CompanionPicker.tsx
│       ├── quotes.ts
│       └── windows/
│           ├── JournalWindow.tsx    # Private journal (gated by CatMemorama)
│           ├── MemoriesWindow.tsx   # Calendar memory archive
│           ├── MySpaceWindow.tsx    # Personal profile hub
│           ├── TimeWindow.tsx       # Time capsule
│           ├── HobbiesWindow.tsx
│           ├── GoalsWindow.tsx
│           ├── MyNetworkWindow.tsx
│           ├── ContactWindow.tsx
│           └── WeatherWindow.tsx
├── imports/                      # Figma-exported assets
└── styles/
```

---

## 🎨 Design

The original design was created in Figma and is available here:  
👉 [Retro Personal Desktop App — Figma File](https://www.figma.com/design/z78BK8481zg03YyqfioVDe/Retro-Personal-Desktop-App)

The visual language draws from:
- **Windows 95 / 98** UI chrome (beveled borders, title bars, C0C0C0 gray)
- **Early web 2000s** personal pages (MySpace, geocities energy)
- **Pixel art** aesthetics for the companion and icons

---

## 📜 Attributions

See [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) for asset credits.

---

*Made with 💾 and nostalgia.*
