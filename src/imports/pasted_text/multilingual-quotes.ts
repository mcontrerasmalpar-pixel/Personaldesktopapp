Update the FallingLetters quote system to include a language selector.
The language is chosen the first time the user clicks "✦ click for today's quote".

--- STEP 1: Quotes bank in multiple languages ---

Replace the English-only DAILY_QUOTES with a multilingual bank:

const QUOTES_BY_LANGUAGE: Record<string, string[]> = {
  japanese: [
    "今日も生きている",        // still alive today
    "小さな一歩も一歩",        // a small step is still a step
    "ここにいていい",          // you are allowed to be here
    "休むことも大切",          // rest is also important
    "今日をよくやった",        // you did well today
    "ゆっくりでいい",          // it's okay to go slowly
    "あなたはここにいる",      // you are here
    "今日も頑張った",          // you tried today too
  ],
  quechua: [
    "Sumaq kawsay",            // good living / buen vivir
    "Ama suwa, ama llulla, ama qella",  // don't steal, don't lie, don't be lazy
    "Llank'ay munay yachay",   // work, love, wisdom
    "Pacha mama munakuwan",    // pachamama loves you
    "Wiñay wayna",             // forever young / eternal youth
    "Kay pacha sumaqmi",       // this world is beautiful
    "Allin p'unchay",          // good day
    "Riq'sikunki",             // you know yourself
  ],
  french: [
    "tu es là aujourd'hui",    // you are here today
    "chaque jour compte",      // every day counts
    "respire, tu y es",        // breathe, you're there
    "tu fais de ton mieux",    // you are doing your best
    "c'est assez pour aujourd'hui",  // it's enough for today
    "tu appartiens ici",       // you belong here
    "petit à petit",           // little by little
    "la vie continue",         // life goes on
  ],
  italian: [
    "ce la fai",               // you can do it
    "un passo alla volta",     // one step at a time
    "sei abbastanza",          // you are enough
    "oggi sei qui",            // today you are here
    "respira piano",           // breathe slowly
    "vai avanti",              // keep going
    "sei forte",               // you are strong
    "ogni giorno è nuovo",     // every day is new
  ],
  korean: [
    "오늘도 수고했어",          // you worked hard today too
    "잘 하고 있어",             // you are doing well
    "괜찮아",                   // it's okay
    "천천히 가도 돼",           // it's okay to go slowly
    "넌 충분해",                // you are enough
    "오늘 하루도 버텼어",       // you made it through today
    "여기 있어도 돼",           // you are allowed to be here
    "잘 될 거야",               // it will be okay
  ],
  swahili: [
    "pumzika kidogo",          // rest a little
    "uko hapa leo",            // you are here today
    "pole pole",               // slowly slowly (hakuna matata energy)
    "unatosha",                // you are enough
    "jua lina angaza",         // the sun is shining
    "kila siku ni mpya",       // every day is new
    "umefika leo",             // you made it today
    "endelea tu",              // just keep going
  ],
  arabic: [
    "أنت هنا اليوم",           // you are here today
    "خطوة واحدة تكفي",        // one step is enough
    "استرح قليلاً",            // rest a little
    "أنت كافٍ",               // you are enough
    "كل يوم جديد",            // every day is new
    "تنفس ببطء",              // breathe slowly
    "أنت بخير",               // you are okay
    "اليوم يهم",              // today matters
  ],
  surprise: [], // handled separately — picks random language each day
};

const LANGUAGE_OPTIONS = [
  {
    id: "japanese",
    label: "Japanese",
    flag: "🌸",
    example: "今日も生きている",
    hint: "still alive today",
  },
  {
    id: "quechua",
    label: "Quechua",
    flag: "🦙",
    example: "Sumaq kawsay",
    hint: "good living",
  },
  {
    id: "french",
    label: "French",
    flag: "🥐",
    example: "tu es là aujourd'hui",
    hint: "you are here today",
  },
  {
    id: "italian",
    label: "Italian",
    flag: "🌺",
    example: "ce la fai",
    hint: "you can do it",
  },
  {
    id: "korean",
    label: "Korean",
    flag: "🌙",
    example: "오늘도 수고했어",
    hint: "you worked hard today too",
  },
  {
    id: "swahili",
    label: "Swahili",
    flag: "🌍",
    example: "pole pole",
    hint: "slowly slowly",
  },
  {
    id: "arabic",
    label: "Arabic",
    flag: "✨",
    example: "كل يوم جديد",
    hint: "every day is new",
  },
  {
    id: "surprise",
    label: "Surprise me",
    flag: "🎲",
    example: "random every day",
    hint: "a different language each day",
  },
];

const getDailyQuote = (language: string): string => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );

  let lang = language;
  if (language === "surprise") {
    const langs = Object.keys(QUOTES_BY_LANGUAGE).filter(l => l !== "surprise");
    lang = langs[dayOfYear % langs.length];
  }

  const quotes = QUOTES_BY_LANGUAGE[lang] ?? QUOTES_BY_LANGUAGE.japanese;
  return quotes[dayOfYear % quotes.length];
};

--- STEP 2: Language selector state in Taskbar.tsx ---

Add state:
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(
    localStorage.getItem("personalos_quote_language") ?? null
  )
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)

Update the permission dialog click flow:
  When user clicks "yes, show me ✦":
    if (!selectedLanguage) {
      setShowPermissionDialog(false);
      setShowLanguagePicker(true);  // show language picker first
    } else {
      setShowPermissionDialog(false);
      setShowQuoteExperience(true); // go straight to experience
    }

--- STEP 3: Language picker dialog — Windows 95 list style ---

When showLanguagePicker is true, render a dialog styled exactly like
the CompanionPicker — list on left, preview on right.

Width: 380px. Title: "choose your language ✦"

LEFT SIDE — scrollable list (same style as companion list):
  Each item: flag + label in VT323 16px
  Selected: background #000080, color white
  Hover: same as selected
  On click: setSelectedLanguage(id), update right preview

RIGHT SIDE — preview panel:
  Selected language flag (large, 32px)
  Language name in VT323 20px color #000080
  Example quote in VT323 18px italic
  Hint translation in VT323 13px color #808080
  Small note: "you'll figure out the rest 🔍"

Footer buttons:
  "Set language" (bevel, primary):
    localStorage.setItem("personalos_quote_language", selectedLanguage)
    setShowLanguagePicker(false)
    setShowQuoteExperience(true)  // proceed to falling letters
  
  "Cancel" (bevel):
    setShowLanguagePicker(false)

The language persists across sessions via localStorage.

--- STEP 4: Change language option in taskbar ---

After the quote is revealed in the taskbar, show a tiny link below it:
  "change language" in VT323 11px color #808080
  On click: setShowLanguagePicker(true) — lets user pick a new language
  After picking: the next day's quote will use the new language
  (current session quote stays as is)

--- STEP 5: Update FallingLetters to receive language ---

Pass language to FallingLetters:
  <FallingLetters
    quote={getDailyQuote(selectedLanguage ?? "surprise")}
    language={selectedLanguage ?? "surprise"}
    onComplete={...}
    onClose={...}
  />

In FallingLetters, show the language name subtly in the corner:
  Bottom-left: flag + language name in VT323 14px color rgba(0,0,0,0.3)
  Example: "🦙 Quechua · figure it out ✦"
  This reminds the user to investigate without giving away the translation.

--- RESULT ---

First time clicking "✦ click for today's quote":
  Permission dialog → language picker (Windows 95 list style) →
  falling letters in chosen language → quote lands in taskbar

Next time:
  Permission dialog → falling letters directly (language remembered)

The quote is in a language the user doesn't fully know.
No translation is given — just a tiny hint in the preview.
The user investigates. That's the ritual.

"Sumaq kawsay" falls letter by letter, assembled by their hands.
They don't know what it means yet. They go find out.
That's the moment. 🦙✨