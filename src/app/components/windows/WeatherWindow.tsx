import React, { useState, useEffect } from "react";
import { getCompanionIdleImage } from "../PixelPet";

const POETIC_PHRASES: Record<string, string[]> = {
  sunny_hot: [
    "the sun showed up for you today ☀️",
    "a good day to exist outside",
    "golden hour starts early today",
  ],
  sunny_mild: [
    "soft light, good energy ☀️",
    "the world is bright today",
    "step outside, even for a minute",
  ],
  cloudy: [
    "a grey sky is still a sky",
    "good day to stay in with something warm",
    "the world is being quiet today ☁️",
  ],
  partly_cloudy: [
    "soft light, no harsh shadows today",
    "clouds are just the sky being thoughtful",
    "perfect light for photos ⛅",
  ],
  rainy: [
    "rain is just the sky journaling 🌧",
    "good day for crochet and lo-fi",
    "let it rain. you're inside.",
  ],
  cold: [
    "bundle up, the world is cold today 🧣",
    "a blanket day if there ever was one",
    "warm drink first, everything else after",
  ],
  default: [
    "whatever the sky is doing, you're here ✦",
    "the weather is just the background today",
  ],
};

const PET_SUGGESTIONS: Record<string, string> = {
  sunny_hot:    "go outside for 10 min, even just to feel it 🌿",
  sunny_mild:   "a walk sounds good today 🌸",
  cloudy:       "open a window, let some air in ☁️",
  partly_cloudy:"good light for photos today 📷",
  rainy:        "perfect excuse to stay cozy 🍵",
  cold:         "warm drink first, everything else after 🧣",
  default:      "check the window instead 🪟",
};

const getWeatherKey = (code: number, temp: number): string => {
  if (code === 0) return temp > 25 ? "sunny_hot" : "sunny_mild";
  if (code <= 2)  return "partly_cloudy";
  if (code <= 48) return "cloudy";
  if (code <= 67) return "rainy";
  if (code <= 77) return "cold";
  if (code <= 82) return "rainy";
  return temp < 5 ? "cold" : "cloudy";
};

const DESCS: Record<string, string> = {
  sunny_hot: "Sunny", sunny_mild: "Sunny",
  partly_cloudy: "Partly Cloudy", cloudy: "Cloudy",
  rainy: "Rainy", cold: "Cold",
};

const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export function WeatherWindow({ companionId = "cat" }: { companionId?: string }) {
  const [weather, setWeather] = useState<{ temp: number; desc: string; key: string } | null>(null);
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
        setWeather({ temp, desc: DESCS[key] ?? "Cloudy", key });
        setLoading(false);
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const petImg = getCompanionIdleImage(companionId);
  const poeticPhrase = weather
    ? pickRandom(POETIC_PHRASES[weather.key] ?? POETIC_PHRASES.default)
    : null;
  const suggestion = weather
    ? PET_SUGGESTIONS[weather.key] ?? PET_SUGGESTIONS.default
    : PET_SUGGESTIONS.default;

  if (loading) {
    return (
      <div style={{ fontFamily: "'VT323', monospace", padding: 20, textAlign: "center", color: "#808080" }}>
        reaching the sky...
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div style={{ fontFamily: "'VT323', monospace", padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 16, color: "#808080", marginBottom: 16 }}>
          couldn't reach the sky today
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
          <img src={petImg} style={{ width: 48, height: 60, imageRendering: "pixelated" }} alt="companion" />
          <div style={{
            background: "#FFFFC0", border: "1px solid #333",
            padding: "6px 10px",
            fontSize: 14, fontFamily: "'VT323', monospace",
            position: "relative",
          }}>
            {error ? "check the window instead 🪟" : "one moment..."}
            <div style={{
              position: "absolute", left: -7, bottom: 10,
              width: 0, height: 0,
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderRight: "7px solid #FFFFC0",
            }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'VT323', monospace", padding: "12px 14px" }}>
      {/* Location */}
      <div style={{
        background: "#000080", color: "#fff",
        padding: "4px 10px", marginBottom: 14,
        fontSize: 18, display: "flex", alignItems: "center", gap: 6,
      }}>
        📍 Brussels, BE
      </div>

      {/* Temperature */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 64, lineHeight: 1, color: "#000" }}>{weather.temp}°C</div>
        <div style={{ fontSize: 18, color: "#555" }}>{weather.desc}</div>
      </div>

      {/* Poetic phrase */}
      <div style={{
        textAlign: "center",
        fontSize: 18,
        fontStyle: "italic",
        color: "#333",
        padding: "10px 12px",
        borderTop: "1px solid #C0C0C0",
        borderBottom: "1px solid #C0C0C0",
        marginBottom: 14,
        lineHeight: 1.4,
      }}>
        {poeticPhrase}
      </div>

      {/* Pet recommendation */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src={petImg}
          alt="companion"
          style={{ width: 48, height: 60, imageRendering: "pixelated", flexShrink: 0 }}
        />
        <div style={{
          background: "#FFFFC0",
          border: "1px solid #333",
          padding: "6px 10px",
          fontSize: 14,
          position: "relative",
        }}>
          {suggestion}
          <div style={{
            position: "absolute", left: -7, bottom: 10,
            width: 0, height: 0,
            borderTop: "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderRight: "7px solid #FFFFC0",
          }} />
          <div style={{
            position: "absolute", left: -9, bottom: 9,
            width: 0, height: 0,
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            borderRight: "8px solid #333",
          }} />
        </div>
      </div>
    </div>
  );
}
