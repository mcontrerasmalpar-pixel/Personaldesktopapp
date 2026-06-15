Add a Ransomizer-style rendering to JournalWindow.tsx.
When the user saves their journal entry, the text transforms into a ransom note aesthetic —
different fonts, sizes, rotations per letter, like words cut from different magazines.

--- CONCEPT ---
User writes freely in a normal textarea.
Clicks "Save" — the textarea disappears and the text renders as a ransom note.
Each character gets random: font family, font size, font weight, color, rotation, vertical offset.
An "Edit" button lets them go back to the textarea to modify.
The transformation feels like magic — your words become something physical and alive.

--- STEP 1: Add Google Fonts to index.html or App.tsx ---

Add these font imports (they match the Ransomizer aesthetic):

<link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Abril+Fatface&family=Pacifico&family=Lobster&family=Berkshire+Swash&family=Comic+Neue:wght@700&family=Courier+Prime:wght@700&family=Rye&display=swap" rel="stylesheet">

Or add via @import in CSS:
@import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Abril+Fatface&family=Pacifico&family=Lobster&family=Berkshire+Swash&family=Comic+Neue:wght@700&family=Courier+Prime:wght@700&family=Rye&display=swap');

--- STEP 2: Create RansomText component ---

Create a new component RansomText.tsx (or inline in JournalWindow):

const RANSOM_FONTS = [
  "Alfa Slab One",
  "Abril Fatface", 
  "Pacifico",
  "Lobster",
  "Berkshire Swash",
  "Comic Neue",
  "Courier Prime",
  "Rye",
  "VT323",  // keep the retro feel
];

const RANSOM_COLORS = [
  "#000000",  // black (most common — like real newspaper)
  "#000000",
  "#000000",
  "#CC0000",  // red accent
  "#000080",  // navy accent
  "#1a1a1a",
  "#333333",
  "#FF6B9D",  // Tomodachi pink (occasional)
  "#4D9DE0",  // Tomodachi blue (occasional)
];

// Seeded random using character index so it's consistent on re-render
const seededRandom = (seed: number) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

interface RansomTextProps {
  text: string;
}

export function RansomText({ text }: RansomTextProps) {
  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-end",
      gap: "1px",
      lineHeight: 1.4,
      padding: "8px 4px",
    }}>
      {text.split("").map((char, i) => {
        if (char === "\n") return <div key={i} style={{ width: "100%", height: 8 }} />;
        if (char === " ") return <span key={i} style={{ width: "0.4em", display: "inline-block" }} />;

        const r1 = seededRandom(i * 7);
        const r2 = seededRandom(i * 13);
        const r3 = seededRandom(i * 17);
        const r4 = seededRandom(i * 23);
        const r5 = seededRandom(i * 31);
        const r6 = seededRandom(i * 37);
        const r7 = seededRandom(i * 41);

        const font = RANSOM_FONTS[Math.floor(r1 * RANSOM_FONTS.length)];
        const size = 14 + Math.floor(r2 * 16);  // 14px to 30px
        const color = RANSOM_COLORS[Math.floor(r3 * RANSOM_COLORS.length)];
        const rotation = (r4 - 0.5) * 14;  // -7deg to +7deg
        const vertOffset = (r5 - 0.5) * 8; // -4px to +4px
        const isBold = r6 > 0.4;
        const isItalic = r7 > 0.75;

        // Cutout paper effect: slight background + border
        const hasCutout = seededRandom(i * 43) > 0.6;
        const cutoutBg = hasCutout ? "#f5f0e8" : "transparent";  // aged paper color
        const cutoutBorder = hasCutout ? "0.5px solid rgba(0,0,0,0.15)" : "none";
        const cutoutPadding = hasCutout ? "1px 3px" : "0";
        const cutoutShadow = hasCutout ? "1px 1px 0 rgba(0,0,0,0.2)" : "none";

        return (
          <span
            key={i}
            style={{
              fontFamily: `'${font}', serif`,
              fontSize: size,
              color,
              fontWeight: isBold ? 700 : 400,
              fontStyle: isItalic ? "italic" : "normal",
              transform: `rotate(${rotation}deg) translateY(${vertOffset}px)`,
              display: "inline-block",
              lineHeight: 1,
              background: cutoutBg,
              border: cutoutBorder,
              padding: cutoutPadding,
              boxShadow: cutoutShadow,
              marginBottom: Math.abs(vertOffset),
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
}

--- STEP 3: Update JournalWindow.tsx ---

Add state:
  const [isPreview, setIsPreview] = useState(false)
  const [savedText, setSavedText] = useState("")

Update the Save button handler:
  const handleSave = () => {
    if (!journalText.trim()) return;
    setSavedText(journalText);
    setIsPreview(true);
    onJournalSaved?.(journalText);  // trigger pet reaction (existing)
    // Show saved confirmation as before
  };

In the JSX, show either the textarea OR the RansomText:

  {!isPreview ? (
    // Normal writing mode
    <div>
      <textarea
        value={journalText}
        onChange={e => setJournalText(e.target.value)}
        placeholder="what's on your mind today..."
        style={{
          width: "100%",
          minHeight: 160,
          fontFamily: "'VT323', monospace",
          fontSize: 16,
          padding: 8,
          border: "2px solid",
          borderColor: "#555 #fff #fff #555",
          background: "#fff",
          resize: "vertical",
          outline: "none",
          color: "#000",
        }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <BevelBtn onClick={handleSave}>💾 Save</BevelBtn>
      </div>
    </div>
  ) : (
    // Ransom note preview mode
    <div>
      <div style={{
        background: "#faf8f3",  // aged paper background
        border: "2px solid",
        borderColor: "#555 #fff #fff #555",
        minHeight: 160,
        padding: 8,
        position: "relative",
      }}>
        <RansomText text={savedText} />
      </div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
      }}>
        <div style={{
          fontSize: 13,
          color: "#808080",
          fontFamily: "'VT323', monospace",
        }}>
          {new Date().toLocaleDateString("en-GB", {
            day: "numeric", month: "long", year: "numeric"
          })}
        </div>
        <BevelBtn onClick={() => setIsPreview(false)}>✏ Edit</BevelBtn>
      </div>
    </div>
  )}

--- STEP 4: Transformation animation ---

When switching from textarea to RansomText (isPreview becomes true),
add a brief animation so the transformation feels magical:

Wrap the RansomText div in:
  <div style={{
    animation: "ransomReveal 0.4s ease forwards",
  }}>
    <RansomText text={savedText} />
  </div>

Add keyframe:
  @keyframes ransomReveal {
    from { opacity: 0; transform: scale(0.97); filter: blur(2px); }
    to   { opacity: 1; transform: scale(1);    filter: blur(0); }
  }

--- STEP 5: Paper texture background for the journal window ---

In JournalWindow, add a subtle paper texture to the window background:
  The aged paper color #faf8f3 on the content area.
  A very subtle noise texture via CSS:
    background-image: url("data:image/svg+xml,...") — or just keep the flat color.
  The VT323 date stamp in the corner.

--- RESULT ---
User opens Journal → writes freely in a clean textarea → clicks Save →
text transforms with a soft animation into a ransom note collage —
different fonts, sizes, rotations, occasional paper cutout backgrounds.
Clicking Edit returns to the textarea with the original text intact.
The journal entry looks like something physical, handmade, uniquely yours.
