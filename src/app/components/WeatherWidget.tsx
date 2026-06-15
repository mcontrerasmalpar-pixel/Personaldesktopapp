import React, { useState, useRef, useEffect } from "react";
import { PixelPet } from "./PixelPet";

const POETIC_PHRASES: Record<string, string[]> = {
  sunny_hot:     ["the sun showed up for you today", "a good day to exist outside", "golden hour starts early today"],
  sunny_mild:    ["soft light, good energy", "the world is bright today", "step outside, even for a minute"],
  cloudy:        ["a grey sky is still a sky", "good day to stay in with something warm", "the world is being quiet today"],
  partly_cloudy: ["soft light, no harsh shadows", "clouds are just the sky being thoughtful", "perfect light for photos"],
  rainy:         ["rain is just the sky journaling", "good day for something cosy", "let it rain. you\u2019re inside."],
  cold:          ["bundle up, the world is cold today", "a blanket day if there ever was one", "warm drink first, everything else after"],
  default:       ["whatever the sky is doing, you\u2019re here \u2726", "the weather is just the background today"],
};

const WEATHER_EMOJIS: Record<string, string> = {
  sunny_hot: "\u2600\uFE0F", sunny_mild: "\uD83C\uDF24", partly_cloudy: "\u26C5",
  cloudy: "\u2601\uFE0F", rainy: "\uD83C\uDF27", cold: "\uD83C\uDF28",
};
const DESCS: Record<string, string> = {
  sunny_hot: "Sunny", sunny_mild: "Sunny", partly_cloudy: "Partly Cloudy",
  cloudy: "Cloudy", rainy: "Rainy", cold: "Cold",
};

function getWeatherKey(code: number, temp: number): string {
  if (code === 0) return temp > 25 ? "sunny_hot" : "sunny_mild";
  if (code <= 2)  return "partly_cloudy";
  if (code <= 48) return "cloudy";
  if (code <= 67) return "rainy";
  if (code <= 77) return "cold";
  if (code <= 82) return "rainy";
  return temp < 5 ? "cold" : "cloudy";
}
function pickRandom(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)]; }

function useClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function WeatherWidget({ companionId = "cat" }: { companionId?: string }) {
  const [weather, setWeather] = useState<{ temp: number; desc: string; key: string; phrase: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const time = useClock();

  useEffect(() => {
    const controller = new AbortController();
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=50.85&longitude=4.35&current=temperature_2m,weathercode&temperature_unit=celsius",
      { signal: controller.signal }
    )
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        const temp = Math.round(data.current.temperature_2m);
        const key  = getWeatherKey(data.current.weathercode, temp);
        setWeather({ temp, key, desc: DESCS[key] ?? "Cloudy", phrase: pickRandom(POETIC_PHRASES[key] ?? POETIC_PHRASES.default) });
        setLoading(false);
      })
      .catch(err => { if (err.name !== "AbortError") { setError(true); setLoading(false); } });
    return () => controller.abort();
  }, []);

  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");
  const ss = time.getSeconds().toString().padStart(2, "0");
  const dateStr = time.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const emoji = weather ? (WEATHER_EMOJIS[weather.key] ?? "\uD83C\uDF24") : "\uD83C\uDF24";

  return (
    <div style={{
      position: "fixed",
      // Centered horizontally, vertically at ~38% of screen
      left: "50%",
      top: "38%",
      transform: "translate(-50%, -50%)",
      width: 320,
      zIndex: 300,
      userSelect: "none",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 0,
      pointerEvents: "none",
    }}>
      {/* Clock */}
      <div style={{
        fontFamily: "'VT323', monospace",
        fontSize: 72,
        color: "rgba(38,70,83,0.18)",
        lineHeight: 1,
        letterSpacing: 4,
        textAlign: "center",
      }}>
        {hh}<span style={{ opacity: time.getSeconds() % 2 === 0 ? 1 : 0.3 }}>:</span>{mm}
        <span style={{ fontSize: 36, opacity: 0.5, marginLeft: 6 }}>{ss}</span>
      </div>

      {/* Date */}
      <div style={{
        fontFamily: "'Fraunces', serif",
        fontSize: 13,
        color: "rgba(38,70,83,0.35)",
        letterSpacing: 0.5,
        marginBottom: 10,
        textAlign: "center",
      }}>
        {dateStr}
      </div>

      {/* Weather pill */}
      {loading && (
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 12, color: "rgba(38,70,83,0.25)", fontStyle: "italic" }}>reaching the sky...</div>
      )}
      {weather && (
        <div style={{
          background: "rgba(255,253,246,0.72)",
          backdropFilter: "blur(8px)",
          borderRadius: 20,
          padding: "8px 20px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          border: "1px solid rgba(38,70,83,0.08)",
          boxShadow: "0 2px 16px rgba(38,70,83,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 22 }}>{emoji}</span>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: "#264653", fontWeight: 300 }}>{weather.temp}\u00b0</span>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 13, color: "rgba(38,70,83,0.55)" }}>{weather.desc}</span>
          </div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 12, fontStyle: "italic", color: "rgba(38,70,83,0.5)", textAlign: "center", lineHeight: 1.4 }}>
            {weather.phrase}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <div style={{ transform: "scale(0.22)", transformOrigin: "left center", width: 26, height: 22, overflow: "hidden", flexShrink: 0, pointerEvents: "auto" }}>
              <PixelPet companionId={companionId} />
            </div>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 11, color: "rgba(38,70,83,0.3)", letterSpacing: 0.3 }}>Brussels, BE</span>
          </div>
        </div>
      )}
      {error && (
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 12, color: "rgba(38,70,83,0.35)", fontStyle: "italic" }}>check the window instead \uD83E\uDEDF</div>
      )}
    </div>
  );
}
