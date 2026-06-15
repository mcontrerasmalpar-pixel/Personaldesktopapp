import React, { useState, useRef, useEffect } from "react";
import { getCompanionIdleImage } from "./PixelPet";

const POETIC_PHRASES: Record<string, string[]> = {
  sunny_hot:     ["the sun showed up for you today", "a good day to exist outside", "golden hour starts early today"],
  sunny_mild:    ["soft light, good energy", "the world is bright today", "step outside, even for a minute"],
  cloudy:        ["a grey sky is still a sky", "good day to stay in with something warm", "the world is being quiet today"],
  partly_cloudy: ["soft light, no harsh shadows", "clouds are just the sky being thoughtful", "perfect light for photos"],
  rainy:         ["rain is just the sky journaling", "good day for something cosy", "let it rain. you're inside."],
  cold:          ["bundle up, the world is cold today", "a blanket day if there ever was one", "warm drink first, everything else after"],
  default:       ["whatever the sky is doing, you're here ✦", "the weather is just the background today"],
};

const WEATHER_EMOJIS: Record<string, string> = {
  sunny_hot: "☀️", sunny_mild: "🌤", partly_cloudy: "⛅", cloudy: "☁️", rainy: "🌧", cold: "🌨",
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

export function WeatherWidget({ companionId = "cat" }: { companionId?: string }) {
  const [weather, setWeather] = useState<{ temp: number; desc: string; key: string; phrase: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [pos, setPos]         = useState(() => ({ x: Math.max(0, window.innerWidth - 228), y: 238 }));
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);

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

  const handleBarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
    const move = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 210, dragRef.current.px + ev.clientX - dragRef.current.sx)),
        y: Math.max(0, Math.min(window.innerHeight - 160, dragRef.current.py + ev.clientY - dragRef.current.sy)),
      });
    };
    const up = () => { dragRef.current = null; document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const petImg = getCompanionIdleImage(companionId);
  const emoji  = weather ? (WEATHER_EMOJIS[weather.key] ?? "🌤") : "🌤";

  return (
    <div style={{
      position: "fixed", left: pos.x, top: pos.y, width: 210,
      zIndex: 300, userSelect: "none",
      border: "2px solid",
      borderColor: "#fff #555 #555 #fff",
      boxShadow: "4px 4px 8px rgba(0,0,0,0.35)",
    }}>
      {/* Title bar — Windows pixel style */}
      <div
        onMouseDown={handleBarMouseDown}
        style={{
          background: "linear-gradient(90deg, #000080, #1084D0)",
          color: "#fff",
          padding: "4px 8px",
          fontFamily: "'VT323', monospace",
          fontSize: 17,
          cursor: "grab",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {emoji} weather
      </div>

      {/* Content — unchanged inner style */}
      <div style={{ background: "#FFFDF6", padding: "10px 12px", fontFamily: "'Fraunces', serif" }}>
        {loading && <div style={{ fontSize: 13, color: "#264653", opacity: 0.5, fontStyle: "italic" }}>reaching the sky...</div>}

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src={petImg} style={{ width: 32, height: 40, imageRendering: "pixelated" }} alt="" />
            <div style={{ fontSize: 13, color: "#264653", opacity: 0.6 }}>check the window instead 🪟</div>
          </div>
        )}

        {weather && (
          <>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 38, lineHeight: 1, color: "#264653", fontWeight: 300 }}>{weather.temp}°</span>
              <span style={{ fontSize: 13, color: "#264653", opacity: 0.6 }}>{weather.desc}</span>
            </div>
            <div style={{ fontSize: 13, fontStyle: "italic", color: "#264653", opacity: 0.75, lineHeight: 1.4, borderTop: "1px solid rgba(38,70,83,0.1)", paddingTop: 6, marginTop: 4 }}>
              {weather.phrase}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <img src={petImg} style={{ width: 28, height: 34, imageRendering: "pixelated" }} alt="" />
              <span style={{ fontSize: 11, color: "#264653", opacity: 0.4, letterSpacing: 0.3 }}>Brussels, BE</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
