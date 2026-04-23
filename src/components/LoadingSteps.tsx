import { useEffect, useState } from "react";

const STEPS = [
  { label: "מעלה את הקבצים...", icon: "📤" },
  { label: "קורא ומנתח את התוכן...", icon: "📖" },
  { label: "יוצר שאלות עם AI...", icon: "🤖" },
  { label: "מסיים ומסדר...", icon: "✨" },
];

const STEP_DURATIONS = [1500, 2500, 8000, Infinity];

export default function LoadingSteps() {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    setStepIdx(0);
    let current = 0;

    function advance() {
      current++;
      if (current < STEPS.length - 1) {
        setStepIdx(current);
        timer = setTimeout(advance, STEP_DURATIONS[current]);
      } else {
        setStepIdx(STEPS.length - 1);
      }
    }

    let timer = setTimeout(advance, STEP_DURATIONS[0]);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 py-4" dir="rtl">
      {/* Spinner */}
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border border-t-purple-400/40 border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
        <span className="absolute inset-0 flex items-center justify-center text-xl">
          {STEPS[stepIdx].icon}
        </span>
      </div>

      {/* Current step */}
      <div className="text-center">
        <p className="text-white/80 font-medium text-sm">{STEPS[stepIdx].label}</p>
        <p className="text-white/30 text-xs mt-1">זה עשוי לקחת 15-30 שניות</p>
      </div>

      {/* Steps dots */}
      <div className="flex gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: i === stepIdx ? "24px" : "6px",
              background: i <= stepIdx
                ? "linear-gradient(90deg,#7c3aed,#a855f7)"
                : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
