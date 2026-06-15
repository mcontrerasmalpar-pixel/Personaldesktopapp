Redesign LoginScreen.tsx with an interactive Kandinsky-style canvas as the full background.
Remove the boot sequence entirely. Remove the ASCII camera effect.
This is your space — it should feel like creation, not surveillance.

--- CONCEPT ---

The entire login background is a live interactive canvas.
Before entering, you create something — draw shapes, make sounds.
Your art stays on screen as you type your username and password.
You enter your space having already made something yours.

--- PART 1: Interactive Canvas Background ---

Create a full-screen HTML5 canvas behind everything (position: fixed, inset 0, z-index 0).
Canvas fills 100vw x 100vh. Background: #1a1a2e (deep dark blue, warm not cold).

TWO interaction modes:

MODE A — Click = Blob:
  On mousedown (no drag, just click):
  - Draw an organic blob shape at click position
  - Blob style: filled circle with irregular radius (use Math.sin/cos with random offsets
    to create organic edge — 12 points around center, each radius += Math.random()*15-7)
  - Size: random between 30-70px radius
  - Color: pick randomly from Tomodachi palette:
    ["#FF6B9D", "#FFE566", "#6BCB77", "#4D9DE0", "#E15FED", "#FF9A9E", "#A1C4FD"]
  - Opacity: starts at 0.85, fades out over 3s using requestAnimationFrame
    (decrease opacity by 0.004 per frame, remove when opacity <= 0)
  - Play a short tone (see Audio section below): duration 0.3s, pitch based on Y position

MODE B — Drag = Freehand stroke:
  On mousedown + mousemove (isDrawing = true):
  - Draw smooth freehand line following the mouse
  - Line style: strokeStyle from Tomodachi palette (cycle through on each new stroke)
  - lineWidth: based on mouse speed — fast = thin (2px), slow = thick (8px)
    Calculate speed: distance between current and last point per frame
  - lineCap: "round", lineJoin: "round"
  - The line has a glow effect: ctx.shadowBlur = 12, ctx.shadowColor = same as strokeStyle
  - While dragging: play continuous tone (see Audio), pitch changes with Y position
  - On mouseup: stop tone, stroke is permanent (does not fade)

TOUCH SUPPORT:
  Add touch event listeners (touchstart, touchmove, touchend) that mirror mouse events.
  Use e.touches[0].clientX/clientY for position.

--- PART 2: Web Audio API — Sound System ---

Initialize AudioContext on first user interaction (browser requires this):
  let audioCtx = null
  const initAudio = () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  Call initAudio() on first mousedown/touchstart.

SHORT TONE (for blob click):
  const playTone = (frequency, duration) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.type = "sine"
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime)
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration)
    osc.start()
    osc.stop(audioCtx.currentTime + duration)
  }

CONTINUOUS TONE (for drag stroke):
  let dragOsc = null
  let dragGain = null

  startDragTone(frequency):
    dragOsc = audioCtx.createOscillator()
    dragGain = audioCtx.createGain()
    dragOsc.connect(dragGain)
    dragGain.connect(audioCtx.destination)
    dragOsc.type = "triangle"
    dragOsc.frequency.value = frequency
    dragGain.gain.setValueAtTime(0.15, audioCtx.currentTime)
    dragOsc.start()

  updateDragTone(frequency):
    if dragOsc: dragOsc.frequency.setValueAtTime(frequency, audioCtx.currentTime)

  stopDragTone():
    if dragGain: dragGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1)
    if dragOsc: dragOsc.stop(audioCtx.currentTime + 0.1)
    dragOsc = null

FREQUENCY MAPPING (Y position → musical note):
  Map canvas Y position to pentatonic scale (always sounds good, never dissonant):
  const PENTATONIC = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00]
  const freq = PENTATONIC[Math.floor((1 - y/canvasHeight) * PENTATONIC.length)]
  Top of screen = high notes, bottom = low notes.

MOUSE SPEED → line width + volume:
  const speed = Math.sqrt(dx*dx + dy*dy) (distance from last point)
  lineWidth = Math.max(2, Math.min(12, 20 - speed * 0.3))
  dragGain.gain.value = Math.min(0.3, 0.05 + speed * 0.005)

--- PART 3: Login Panel (floats above canvas) ---

Position: centered, z-index 10, position absolute or fixed.

Keep Windows 95 dialog style exactly as it is:
  background #C0C0C0, bevel borders, title bar gradient #000080→#1084D0.
  "Login — personal.os", USERNAME + PASSWORD fields, ENTER.exe button.

Add a subtle backdrop: behind the panel only, a semi-transparent dark rectangle
  (background rgba(0,0,0,0.4), borderRadius 4px, padding 20px, blur optional)
  so the panel is readable over the colorful canvas.

--- PART 4: Title and invitation text (above canvas, below title) ---

Title "PERSONAL OS" — multicolor Tomodachi style (keep from previous design):
  Each character its own span, VT323 48px, fontWeight 900
  -webkit-text-stroke: 3px #000, paintOrder stroke fill
  filter: drop-shadow(4px 4px 0 rgba(0,0,0,0.4))
  Colors cycling: #FF6B9D, #FFE566, #6BCB77, #4D9DE0, #E15FED

Subtitle: "your space. your rules. ✦"
  VT323 20px, color white, -webkit-text-stroke: 1px rgba(0,0,0,0.4)

Invitation text (bottom-left corner of screen, not center):
  "make something before you enter ✦"
  VT323 18px, color rgba(255,255,255,0.6)
  position: fixed, bottom 20px, left 24px
  No instructions, just an invitation. Disappears after 8s (fadeOut).

Decorative row below subtitle: "🌸 ⛩ 🌸 ⛩ 🌸"

--- PART 5: Canvas does NOT clear on login ---

When the user types username/password and clicks ENTER.exe:
  The canvas stays visible during the transition.
  The art they created is still on screen as the login processes.
  Then the MoodScreen fades in over it.
  Their creation was the key that opened the door.

--- PART 6: Flow ---

User arrives at login → canvas is dark and empty → they click or drag →
colors and sounds fill the background → they feel something → they log in →
MoodScreen (Tomodachi blobs) → CatMemorama → Desktop.

--- REMOVE entirely ---
- All boot sequence code (BOOT_LINES, bootDone, bootProgress, visibleLines states)
- The black boot screen div
- The ASCII camera code
- The WalkingCat SVG
- Any TV static effect

--- KEEP ---
- CompanionPickerModal for first login (localStorage check)
- handleSubmit logic and form validation
- The phrase tooltip cycling (attach to bottom-left invitation text instead)