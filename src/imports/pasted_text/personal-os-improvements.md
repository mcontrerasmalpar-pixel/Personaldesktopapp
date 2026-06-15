Apply these 6 improvements to the existing PersonalOS codebase:

--- 1. MySpaceWindow.tsx — Intentions as checklist with pet celebration ---

Replace the 3 text inputs in "Intentions for Today" with checkboxes.
Each intention has: a checkbox, a text input for the intention label, and a delete button.
Add an "Add intention" button that appends a new empty row (max 5 items).

When a checkbox is checked:
- Trigger onIntentionComplete() callback prop
- Show a small confetti burst inline (5 pixel hearts/stars, CSS keyframe, 0.8s)
- Display tooltip next to checkbox: random from ["you did that!", "small wins count!", "proud of you ✦", "that took courage"]

When ALL intentions are checked:
- Trigger onAllComplete() callback prop (parent sets pet mood to "happy" for 3 seconds)
- Show a full-width banner: "you showed up for yourself today 🌸" in VT323 font
- Banner background: linear-gradient from #e0f7f4 to #b2ead8, same style as welcome banner

The checkbox style: Windows 95 sunken square (2px border, white top-left, #555 bottom-right).
Checked state: filled with #000080 and a white pixel checkmark inside.

--- 2. MyNetworkWindow.tsx — Replace messages with reminders ---

Remove the "📨 New Message" button and dialog entirely.
Replace with "📌 Add Reminder" button.

Reminder dialog fields:
- "Plan:" text input (e.g. "coffee with Alex next week")
- "Date:" text input (e.g. "Jun 17")
- "Remember to:" text input (e.g. "ask about his favorite music")

Each contact in the list shows their pending reminders below their name as small sticky-note style tags:
- Background: #FFFFC0 (pixel yellow)
- Border: 1px solid #C8C800
- Font: VT323 13px
- Format: "📌 Jun 17 · ask about his music"
- Max 2 visible, rest hidden with "+N more" tag

Reminder completed: click the 📌 tag to mark done (strikethrough + faded).
Keep "👤 Add Contact" button as-is.

--- 3. MemoriesWindow.tsx — Simplify add dialog, remove photo upload ---

In the "Add Memory" dialog, remove any file upload or image input fields.
Keep only:
- Caption (text input, required)
- Date (text input, e.g. "Jun 2026")
- Emoji (single character input, shown large as 32px preview)
- A "color" field: 6 small colored squares the user clicks to pick the polaroid background

The polaroid card on the grid shows: emoji (large, centered), caption (Caveat font if available, else VT323), date (small, muted). No photo upload at all.

--- 4. HobbiesWindow.tsx — Add URL field and reading queue mode ---

Add a URL field to each post card (both in the data and in the add-post dialog).
In each post card, show a small "▶ visit" button that calls window.open(url, '_blank') — only visible when url is not empty.

Add a "Reading Queue" toggle button at the top right (next to the category filters).
When active: show only starred posts in a simplified list view (title + source + "▶ visit" button), styled as a retro file manager list. Label: "📋 Reading Queue (N saved)"

Add an "Add Post" button in the toolbar that opens a dialog:
Fields: title, source, category (dropdown), URL (optional), emoji.
Save adds it to the top of the list.

--- 5. Taskbar.tsx — Personal phrase in taskbar ---

Between the Start button divider and the minimized windows area, add a personal phrase zone.
Default text: "made it through another one ✦"

Style: VT323 font 15px, color #555, italic, no border — just text floating in the taskbar.
Double-click to edit: becomes an inline text input, same font, same size, borderless except bottom 1px #808080.
Press Enter or click away to save. Persists in component state.

Max width: 220px, truncate with ellipsis if longer.

--- 6. Desktop.tsx — Daily photo polaroid widget ---

Add a draggable polaroid widget on the desktop surface (not inside any window).
It starts at position { x: desktopWidth - 140, y: 20 } (top-right area).

The polaroid widget:
- White background, 8px padding on sides, 28px padding at bottom
- Inside: a colored placeholder rectangle (120x100px) showing "📷 today" centered in VT323 font
- When user clicks the placeholder: trigger a hidden file input (accept="image/*")
- On image select: display the image inside the polaroid using URL.createObjectURL()
- Below the photo area: today's date in Caveat font (or VT323), auto-populated
- A small pixel pushpin icon (CSS: 8x8 red circle + 1px gray line) at top-center

The polaroid is draggable by its body (same drag logic as DraggableWindow but simplified).
It has a subtle random rotation between -3deg and 3deg on mount.
No title bar, no close button — it's a permanent desktop widget.

--- Pet sprite integration (for when Aseprite sprites are ready) ---

In PixelPet.tsx, add a prop: spritesheetUrl?: string
If provided, render an  tag instead of the SVG, using CSS background-position animation:
- Spritesheet layout: 4 frames wide × 5 rows tall, each frame 32×40px (render at 64×80px)
- Row mapping: 0=idle, 1=walk, 2=happy, 3=comfort, 4=sleepy
- Animate with setInterval at 150ms, cycling background-position-x
- Use image-rendering: pixelated and width/height: 64px/80px on the img wrapper

Keep the SVG fallback when spritesheetUrl is not provided.

--- Windows logo (for when pixel art asset is ready) ---

In Taskbar.tsx, the Start button already imports imgWindowsLogo at 24×24px.
When you replace it with your Aseprite asset: export from Aseprite at 16×16px native,
the CSS renders it at 24×24px via: style={{ width: 24, height: 24, imageRendering: 'pixelated' }}
No code change needed — just swap the imported PNG file.