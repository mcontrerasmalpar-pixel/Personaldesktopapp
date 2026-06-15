export const QUOTES_BY_LANGUAGE: Record<string, string[]> = {
  japanese: [
    "今日も生きている",
    "小さな一歩も一歩",
    "ここにいていい",
    "休むことも大切",
    "今日をよくやった",
    "ゆっくりでいい",
    "あなたはここにいる",
    "今日も頑張った",
  ],
  quechua: [
    "Sumaq kawsay",
    "Llank'ay munay yachay",
    "Pacha mama munakuwan",
    "Wiñay wayna",
    "Kay pacha sumaqmi",
    "Allin p'unchay",
    "Riq'sikunki",
    "Ama suwa ama llulla",
  ],
  french: [
    "tu es là aujourd'hui",
    "chaque jour compte",
    "respire, tu y es",
    "tu fais de ton mieux",
    "c'est assez pour aujourd'hui",
    "tu appartiens ici",
    "petit à petit",
    "la vie continue",
  ],
  italian: [
    "ce la fai",
    "un passo alla volta",
    "sei abbastanza",
    "oggi sei qui",
    "respira piano",
    "vai avanti",
    "sei forte",
    "ogni giorno è nuovo",
  ],
  korean: [
    "오늘도 수고했어",
    "잘 하고 있어",
    "괜찮아",
    "천천히 가도 돼",
    "넌 충분해",
    "오늘 하루도 버텼어",
    "여기 있어도 돼",
    "잘 될 거야",
  ],
  swahili: [
    "pumzika kidogo",
    "uko hapa leo",
    "pole pole",
    "unatosha",
    "jua lina angaza",
    "kila siku ni mpya",
    "umefika leo",
    "endelea tu",
  ],
  arabic: [
    "أنت هنا اليوم",
    "خطوة واحدة تكفي",
    "استرح قليلاً",
    "أنت كافٍ",
    "كل يوم جديد",
    "تنفس ببطء",
    "أنت بخير",
    "اليوم يهم",
  ],
};

export const LANGUAGE_OPTIONS = [
  { id: "japanese", label: "Japanese",    flag: "🌸", example: "今日も生きている",       hint: "still alive today" },
  { id: "quechua",  label: "Quechua",     flag: "🦙", example: "Sumaq kawsay",          hint: "good living" },
  { id: "french",   label: "French",      flag: "🥐", example: "tu es là aujourd'hui",  hint: "you are here today" },
  { id: "italian",  label: "Italian",     flag: "🌺", example: "ce la fai",             hint: "you can do it" },
  { id: "korean",   label: "Korean",      flag: "🌙", example: "오늘도 수고했어",        hint: "you worked hard today too" },
  { id: "swahili",  label: "Swahili",     flag: "🌍", example: "pole pole",             hint: "slowly slowly" },
  { id: "arabic",   label: "Arabic",      flag: "✨", example: "كل يوم جديد",          hint: "every day is new" },
  { id: "surprise", label: "Surprise me", flag: "🎲", example: "random every day",      hint: "a different language each day" },
];

function dayOfYear(): number {
  return Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
}

export function resolveLanguage(language: string): string {
  if (language !== "surprise") return language;
  const langs = Object.keys(QUOTES_BY_LANGUAGE);
  return langs[dayOfYear() % langs.length];
}

export function getDailyQuote(language: string): string {
  const day = dayOfYear();
  const lang = resolveLanguage(language);
  const quotes = QUOTES_BY_LANGUAGE[lang] ?? QUOTES_BY_LANGUAGE.japanese;
  return quotes[day % quotes.length];
}
