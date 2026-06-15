Fix these runtime errors in PersonalOS. The build compiles cleanly but these issues
cause crashes or broken behavior at runtime.

================================================================
FIX 1: MemoriesWindow — remove motion/react dependency
================================================================

MemoriesWindow.tsx imports from "motion/react":
  import { motion, AnimatePresence } from "motion/react";

This causes runtime issues when motion is not fully compatible.
Replace all motion animations with plain CSS transitions:

1. Remove the import entirely:
   DELETE: import { motion, AnimatePresence } from "motion/react";

2. Replace <AnimatePresence> wrapper with a plain <div>

3. Replace <motion.div ...> elements with plain <div> elements.
   Convert motion props to CSS:
   - initial={{ opacity: 0, y: 10 }} → style={{ opacity: 0 }} with CSS transition
   - animate={{ opacity: 1, y: 0 }} → use useState + useEffect to trigger
   - exit={{ opacity: 0 }} → handle with conditional rendering

Simplest approach — replace the animated detail panel with:

{selectedDay && (
  <div style={{
    marginTop: 12,
    padding: 12,
    background: "#E8E8E8",
    border: "2px solid",
    borderColor: "#fff #555 #555 #fff",
    animation: "fadeIn 0.2s ease",
  }}>
    {/* detail content here — unchanged */}
  </div>
)}

Add to global styles: @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

================================================================
FIX 2: WeatherWindow — fix Open-Meteo API call
================================================================

The current WeatherWindow fetches from Open-Meteo but may fail due to
CORS or network issues in the Make preview environment.

Add proper error handling and a loading state:

export function WeatherWindow({ companionId = "cat" }: { companionId?: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=50.85&longitude=4.35&current=temperature_2m,weathercode&temperature_unit=celsius",
      { signal: controller.signal }
    )
      .then(r => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then(data => {
        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weathercode;
        const key = getWeatherKey(code, temp);
        setWeather({ temp, key });
        setLoading(false);
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(true);
        setLoading(false);
      });
    
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div style={{ fontFamily: "'VT323', monospace", padding: 20, textAlign: "center", color: "#808080" }}>
        reaching the sky...
      </div>
    );
  }

  // ... rest of component
}

================================================================
FIX 3: PolaroidWidget — fix initial position
================================================================

The PolaroidWidget starts at x:0 which places it at the far left.
Fix the initial position to be top-right of the desktop:

Change:
  const [pos, setPos] = useState({ x: 0, y: 20 });

To:
  const [pos, setPos] = useState(() => ({
    x: Math.max(0, window.innerWidth - 220),
    y: 20,
  }));

Also make sure the polaroid size matches the spec:
  Photo area: width 160px, height 130px
  White frame: width 180px, padding "8px 8px 32px 8px"

================================================================
FIX 4: FallingLetters — fix camera not activating
================================================================

The camera activation in FallingLetters.tsx may fail silently.
Add explicit checks and user feedback:

In the startCamera function, add this check FIRST:
  if (!navigator.mediaDevices) {
    setCameraError(true);
    console.warn("Camera API unavailable — app needs https:// or localhost");
    return;
  }

Also add a visible "activate camera" button that the user clicks manually
instead of auto-activating:

Add state: const [cameraRequested, setCameraRequested] = useState(false)

Show a button in the UI:
  {!cameraActive && !cameraError && !cameraRequested && (
    <button
      onClick={() => {
        setCameraRequested(true);
        startCamera();
      }}
      style={{
        position: "fixed",
        bottom: 80, right: 20,
        fontFamily: "'VT323', monospace",
        fontSize: 16,
        background: "#C0C0C0",
        border: "2px solid",
        borderColor: "#fff #555 #555 #fff",
        padding: "4px 12px",
        cursor: "pointer",
        zIndex: 9001,
      }}
    >
      📷 activate camera
    </button>
  )}

  {cameraError && (
    <div style={{
      position: "fixed",
      bottom: 80, right: 20,
      fontFamily: "'VT323', monospace",
      fontSize: 13,
      color: "#CC0000",
      background: "#fff",
      border: "1px solid #CC0000",
      padding: "4px 8px",
      zIndex: 9001,
    }}>
      📷 camera unavailable — use mouse to catch words
    </div>
  )}

================================================================
FIX 5: Taskbar — fix quote zone click area
================================================================

The "✦ click for today's quote" zone may not be receiving click events
if pointer-events is blocked by a parent element.

In Taskbar.tsx, make sure the quote zone has:
  style={{
    ...existing styles,
    cursor: "pointer",
    userSelect: "none",
    pointerEvents: "all",  // ← add this
  }}

Also verify the permission dialog renders at z-index 9000 so it appears
above the desktop and all windows.

================================================================
FIX 6: Desktop — remove camera test button (cleanup)
================================================================

The "📷 test camera" debug button was for diagnostics only.
Remove it from Desktop.tsx now that the camera system is in FallingLetters:

Remove these state variables:
  const [cameraTest, setCameraTest] = useState(...)
  const cameraVideoRef = useRef(...)

Remove the testCamera function.
Remove the stopCamera function.
Remove the camera test JSX block (the div with fixed bottom/left positioning).

Keep everything else unchanged.

================================================================
FIX 7: RansomText — add Google Fonts link
================================================================

RansomText.tsx uses custom fonts (Alfa Slab One, Abril Fatface, etc.)
but they may not be loaded. Add the font import to index.html:

In index.html <head>, add:
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Abril+Fatface&family=Pacifico&family=Lobster&family=Berkshire+Swash&family=Comic+Neue:wght@700&family=Courier+Prime:wght@700&family=Rye&display=swap" rel="stylesheet">

This ensures ransomizer fonts load correctly for Journal title,
Time Capsule message reveal, and any other RansomText usage.

================================================================
SUMMARY OF FIXES
================================================================
1. MemoriesWindow — remove motion/react, use plain CSS animation
2. WeatherWindow — add loading state + proper error handling for API
3. PolaroidWidget — fix initial position to top-right
4. FallingLetters — add manual camera button + graceful fallback
5. Taskbar — add pointerEvents: "all" to quote zone
6. Desktop — remove debug camera test button
7. index.html — add Google Fonts for ransomizer