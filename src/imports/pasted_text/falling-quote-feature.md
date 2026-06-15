Add an interactive falling letters quote system to the taskbar in PersonalOS.
The taskbar phrase zone is empty by default. Clicking it reveals the daily quote
through a camera-powered falling letters experience.

--- CONCEPT ---
Taskbar starts empty where the phrase used to be.
User clicks the empty zone → dialog asks permission → camera activates →
letters of the daily quote rain down in ransomizer style →
user's hands (detected via webcam brightness/motion) push and interact with letters →
quote assembles and stays in the taskbar for the rest of the session.

================================================================
STEP 1: Daily quotes bank
================================================================

Add to Taskbar.tsx or a separate quotes.ts file:

const DAILY_QUOTES = [
  "you showed up today",
  "small steps are still steps",
  "rest is productive",
  "you are allowed to take up space",
  "today counts",
  "be here now",
  "you are doing better than you think",
  "one thing at a time",
  "you belong here",
  "it is okay to not be okay",
  "your pace is the right pace",
  "you made it to today",
  "breathe first everything else after",
  "you are enough as you are",
  "this too shall pass",
  "pequeños pasos también son pasos",
  "hoy llegaste aquí",
  "eres suficiente",
];

Pick using day of year (consistent all day, different tomorrow):
const getDailyQuote = (): string => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
};

================================================================
STEP 2: Taskbar zone — empty with invitation
================================================================

In Taskbar.tsx, replace the existing static phrase with:

State:
  const [quoteRevealed, setQuoteRevealed] = useState(false)
  const [quoteText, setQuoteText] = useState("")
  const [showQuoteExperience, setShowQuoteExperience] = useState(false)
  const [showPermissionDialog, setShowPermissionDialog] = useState(false)

In the taskbar JSX, where the phrase was:

  {!quoteRevealed ? (
    <div
      onClick={() => setShowPermissionDialog(true)}
      style={{
        fontFamily: "'VT323', monospace",
        fontSize: 14,
        color: "#808080",
        padding: "0 12px",
        cursor: "pointer",
        letterSpacing: 1,
        borderLeft: "1px solid #888",
        borderRight: "1px solid #888",
        height: "100%",
        display: "flex",
        alignItems: "center",
        transition: "color 0.2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.color = "#000")}
      onMouseLeave={e => (e.currentTarget.style.color = "#808080")}
    >
      ✦ click for today's quote
    </div>
  ) : (
    <div style={{
      fontFamily: "'VT323', monospace",
      fontSize: 14,
      color: "#333",
      padding: "0 12px",
      fontStyle: "italic",
      letterSpacing: 1,
    }}>
      {quoteText}
    </div>
  )}

================================================================
STEP 3: Permission dialog — Windows 95 style
================================================================

When showPermissionDialog is true, render a small Windows 95 dialog
centered on screen (z-index 9000):

  <div style={{
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9000,
  }}>
    <div style={{
      width: 320,
      background: "#C0C0C0",
      border: "2px solid",
      borderColor: "#fff #555 #555 #fff",
      boxShadow: "3px 3px 0 #808080",
    }}>
      {/* Title bar */}
      <div style={{
        background: "linear-gradient(90deg, #000080, #1084D0)",
        padding: "4px 8px",
        color: "white",
        fontSize: 15,
        fontFamily: "'VT323', monospace",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>✦ today's quote</span>
        <div
          style={{ cursor: "pointer", fontSize: 13 }}
          onClick={() => setShowPermissionDialog(false)}
        >✕</div>
      </div>
      
      {/* Body */}
      <div style={{ padding: 16 }}>
        <div style={{
          fontFamily: "'VT323', monospace",
          fontSize: 16,
          color: "#000",
          marginBottom: 14,
          lineHeight: 1.5,
        }}>
          want to know your quote for today? ✦
          <br/>
          <span style={{ fontSize: 13, color: "#808080" }}>
            your camera will be used to interact with the letters.
            it stays on only while you play.
          </span>
        </div>
        
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={() => setShowPermissionDialog(false)}
            style={bevelBtnStyle}
          >
            not now
          </button>
          <button
            onClick={() => {
              setShowPermissionDialog(false);
              setShowQuoteExperience(true);
            }}
            style={{ ...bevelBtnStyle, background: "#000080", color: "#fff" }}
          >
            yes, show me ✦
          </button>
        </div>
      </div>
    </div>
  </div>

================================================================
STEP 4: FallingLetters component — the main experience
================================================================

Create a new component: src/app/components/FallingLetters.tsx

This is a full-screen overlay that appears over everything (z-index 8000).

Props:
  interface FallingLettersProps {
    quote: string;
    onComplete: (quote: string) => void;
    onClose: () => void;
  }

RANSOMIZER FONTS (same as Journal):
const RANSOM_FONTS = [
  "Alfa Slab One", "Abril Fatface", "Pacifico",
  "Lobster", "Berkshire Swash", "Comic Neue",
  "Courier Prime", "Rye", "VT323",
];

const RANSOM_COLORS = [
  "#000000", "#CC0000", "#000080", "#1a6b2a",
  "#FF6B9D", "#4D9DE0", "#E15FED", "#8B4513",
];

LETTER PHYSICS (using requestAnimationFrame):

Each letter of the quote is an independent particle:
interface LetterParticle {
  char: string;
  x: number;       // current x position
  y: number;       // current y position
  vy: number;      // vertical velocity (gravity)
  vx: number;      // horizontal velocity
  font: string;
  size: number;    // 20-40px
  color: string;
  rotation: number;
  landed: boolean; // true when it hits the bottom or is placed
}

On mount:
  Initialize particles from the quote string.
  Spread them across the top of the screen at random x positions.
  Each starts at y: -50 with vy: 1 + Math.random() * 2 (falling speed)
  Stagger start times: letter i starts falling after i * 200ms delay

Physics loop (requestAnimationFrame):
  Each frame:
    For each particle not landed:
      particle.vy += 0.15 (gravity)
      particle.y += particle.vy
      particle.x += particle.vx * 0.98 (friction)
      if particle.y > screenHeight - 80: particle.landed = true; particle.y = screenHeight - 80

CAMERA HAND DETECTION:
  Request camera: navigator.mediaDevices.getUserMedia({ video: true })
  Draw video frame to hidden canvas every 2 frames
  Sample a grid of pixels (20x15 grid across the canvas)
  Detect motion by comparing current frame to previous frame:
    brightness difference > threshold (30) = motion detected at that grid point
  
  For each motion point detected:
    Convert grid position to screen position
    Find any letter particle within 60px radius
    Apply force to that particle:
      particle.vx += (particleX - motionX) * 0.3  (push away)
      particle.vy += (particleY - motionY) * 0.3  (push away)
      particle.landed = false  (unlift the letter)

FALLBACK (no camera or permission denied):
  If camera fails: letters still fall with gravity
  User can click/drag letters with mouse instead
  On mousedown near a letter: pick it up (follow mouse)
  On mouseup: release with velocity

RENDER (HTML5 canvas or absolute-positioned divs):
  Recommend absolute-positioned divs for each letter (easier to style with fonts)
  Each letter is a <span> with position: absolute, transform: rotate()
  Update positions via state or direct DOM manipulation for performance

BACKGROUND:
  Semi-transparent white overlay: rgba(255,255,255,0.85)
  The desktop is visible but blurred underneath
  Small camera feed shown in bottom-right corner (80x60px, rounded, low opacity)
  showing the user what the camera sees

COMPLETE button:
  Fixed bottom-center: "✦ save this quote" bevel button
  On click: onComplete(quote) — passes the assembled quote text up
  The quote text is always the full quote (the interaction is visual, not semantic)

CLOSE button:
  Top-right: "✕ skip" small link
  On click: onClose() — dismisses without saving

================================================================
STEP 5: Wire everything together in Taskbar.tsx
================================================================

When showQuoteExperience is true:
  Render FallingLetters overlay:
    <FallingLetters
      quote={getDailyQuote()}
      onComplete={(q) => {
        setQuoteText(q);
        setQuoteRevealed(true);
        setShowQuoteExperience(false);
      }}
      onClose={() => setShowQuoteExperience(false)}
    />

Pass showQuoteExperience state up to Desktop or App level if needed
(since FallingLetters needs to render above everything).

================================================================
RESULT
================================================================

Taskbar starts empty — a gentle invitation "✦ click for today's quote"
Click → Windows 95 dialog asks nicely with camera warning
Accept → full screen experience: letters of the quote fall from the top
Your hands push the letters around (or mouse if no camera)
Click "save this quote" → quote settles into the taskbar
It stays there the rest of the session

For the demo:
Show the empty taskbar → click the invite → letters rain down →
move your hands in front of the camera → letters scatter and drift →
click save → the quote lands in the taskbar

"you showed up today" — assembled by your own hands.
That's the moment.
