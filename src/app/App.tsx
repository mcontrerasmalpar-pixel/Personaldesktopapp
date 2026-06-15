import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { MoodScreen } from "./components/MoodScreen";
import { Desktop } from "./components/Desktop";

type Stage = "login" | "mood" | "desktop";

export default function App() {
  const [stage, setStage] = useState<Stage>("login");
  const [username, setUsername] = useState("");
  const [initialMood, setInitialMood] = useState<number | undefined>(undefined);
  const [canvasSnapshot, setCanvasSnapshot] = useState<string | null>(null);
  // Persist journal text across window open/close sessions
  const [journalText, setJournalText] = useState("");

  const handleLogin = (name: string, snapshot: string | null) => {
    setUsername(name);
    setCanvasSnapshot(snapshot);
    setStage("mood");
  };

  const handleMoodComplete = (moodIndex: number) => {
    setInitialMood(moodIndex);
    setStage("desktop");
  };

  const companionId = (() => {
    const saved = localStorage.getItem("personalos_companion") ?? "";
    const valid = ["cat", "dog", "chicken", "cow", "redpanda", "frog"];
    return valid.includes(saved) ? saved : "cat";
  })();

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body, html { margin: 0; padding: 0; overflow: hidden; cursor: default; }
        ::-webkit-scrollbar { width: 14px; height: 14px; }
        ::-webkit-scrollbar-track { background: #C0C0C0; }
        ::-webkit-scrollbar-thumb {
          background: #C0C0C0;
          border: 2px solid;
          border-color: #fff #555 #555 #fff;
        }
        ::-webkit-scrollbar-corner { background: #C0C0C0; }
        @keyframes winOpen {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        @keyframes catBlink {
          0%, 88%, 100% { transform: scaleY(1); }
          94%           { transform: scaleY(0.1); }
        }
        @keyframes catWag {
          0%, 100% { transform: rotate(0deg); }
          25%      { transform: rotate(-10deg); }
          75%      { transform: rotate(10deg); }
        }
        @keyframes catBounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes catWalk {
          0%, 100% { transform: translateY(0); }
          25%      { transform: translateY(-2px); }
          75%      { transform: translateY(1px); }
        }
        @keyframes catLegSwing {
          0%, 100% { transform: rotate(12deg); }
          50%      { transform: rotate(-12deg); }
        }
        @keyframes catTailWalk {
          0%, 100% { transform: rotate(-15deg); }
          50%      { transform: rotate(15deg); }
        }
        @keyframes confettiFall {
          from { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          to   { transform: translateY(60px)  rotate(360deg); opacity: 0; }
        }
      `}</style>
      <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
        {stage === "login"   && <LoginScreen onLogin={handleLogin} />}
        {stage === "mood"    && <MoodScreen username={username} companionId={companionId} canvasSnapshot={canvasSnapshot} onComplete={handleMoodComplete} />}
        {stage === "desktop" && (
          <Desktop
            username={username}
            initialMood={initialMood}
            journalText={journalText}
            onJournalSaved={setJournalText}
          />
        )}
      </div>
    </>
  );
}
