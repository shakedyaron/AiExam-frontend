import React, { useMemo, useRef, useState } from "react";
import { generateExam, type Difficulty, type Exam } from "../api/examApi";
import type { Status } from "../types/status";
import FloatBox from "../motion/FloatBox";
import FilePreview from "./FilePreview";
import { generateDemoExam } from "../api/examApi";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import LoadingSteps from "./LoadingSteps";
import { PLAN_LIMITS } from "../lib/planLimits";
import type { Plan } from "../lib/planLimits";

type Props = {
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  setExam: React.Dispatch<React.SetStateAction<Exam | null>>;
  setMcqAnswers: React.Dispatch<
    React.SetStateAction<Record<string, "A" | "B" | "C" | "D">>
  >;
  setOpenAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
  errorMsg: string;
  status: Status;
};

export default function Creator({
  setStatus,
  setExam,
  setMcqAnswers,
  setOpenAnswers,
  setErrorMsg,
  errorMsg,
  status,
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [includeOpen, setIncludeOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const { session } = useAuth();
  const { info, refresh: refreshUser } = useUser();
  const navigate = useNavigate();

  const plan = (info?.plan ?? "free") as Plan;
  const maxQuestions = PLAN_LIMITS[plan]?.maxQuestions ?? 10;
  const overPlanLimit = info !== null && numQuestions > maxQuestions;
  const canUseOpenQuestions = info === null || PLAN_LIMITS[plan]?.allowOpenQuestions;

  const LIMIT_MESSAGES: Record<Plan, { main: string; sub: string; showUpgrade: boolean }> = {
    free: {
      main: `בחבילה החינמית ניתן ליצור מבחן עם עד ${PLAN_LIMITS.free.maxQuestions} שאלות בלבד.`,
      sub: "כדי ליצור מבחן עם יותר שאלות, צריך לשדרג למסלול גבוה יותר.",
      showUpgrade: true,
    },
    student: {
      main: `במסלול Student ניתן ליצור מבחן עם עד ${PLAN_LIMITS.student.maxQuestions} שאלות בלבד.`,
      sub: "כדי ליצור מבחן עם יותר שאלות, צריך לשדרג למסלול Pro.",
      showUpgrade: true,
    },
    pro: {
      main: `במסלול Pro ניתן ליצור מבחן עם עד ${PLAN_LIMITS.pro.maxQuestions} שאלות בלבד.`,
      sub: "",
      showUpgrade: false,
    },
  };

  const canGenerate = useMemo(
    () => files.length > 0 && status !== "loading" && !overPlanLimit,
    [files, status, overPlanLimit],
  );

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    setFiles((prev) => {
      const combined = [...prev, ...Array.from(newFiles)];
      return combined.slice(0, 5); // max 5 files
    });
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function clearAll() {
    setFiles([]);
    setStatus("idle");
    setErrorMsg("");
    setLimitReached(false);
    setExam(null);
    setMcqAnswers({});
    setOpenAnswers({});
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFileInputKey((k) => k + 1);
  }

  async function onGenerate() {
    if (!files.length) return;
    setStatus("loading");
    setErrorMsg("");
    setExam(null);
    setMcqAnswers({});
    setOpenAnswers({});
    try {
      const token = session?.access_token ?? "";
      const ex = await generateExam({
        files,
        numQuestions,
        difficulty,
        includeOpen,
        token,
      });
      setExam(ex);
      setStatus("ready");
      refreshUser();
    } catch (err: unknown) {
      const e = err as { error?: string; details?: { message?: string } };
      if (e?.error === "PlanLimitExceeded") {
        setLimitReached(true);
        setStatus("error");
      } else if (e?.error === "NotEnoughContent") {
        setErrorMsg(e.details?.message ?? "המסמך קצר מדי...");
        setStatus("error");
      } else {
        setErrorMsg(e?.error ?? "שגיאה לא צפויה.");
        setStatus("error");
      }
    }
  }

  async function onGenerateDemo() {
    setStatus("loading");
    setErrorMsg("");
    setExam(null);
    setMcqAnswers({});
    setOpenAnswers({});
    setFiles([]);
    try {
      const ex = await generateDemoExam({
        numQuestions,
        difficulty,
        includeOpen,
      });
      setExam(ex);
      setStatus("ready");
    } catch (err: unknown) {
      const e = err as { error?: string; details?: { message?: string } };
      setErrorMsg(e?.details?.message ?? e?.error ?? "שגיאה לא צפויה.");
      setStatus("error");
    }
  }

  if (status === "loading") {
    return (
      <FloatBox className="glass rounded-3xl p-8 w-full max-w-lg">
        <LoadingSteps />
      </FloatBox>
    );
  }

  if (limitReached) {
    return (
      <FloatBox className="glass rounded-3xl p-8 w-full max-w-lg text-center">
        <div dir="rtl">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-white mb-2">
            הגעת למגבלת המבחנים החודשית
          </h2>
          <p className="text-white/50 text-sm mb-6">
            רוצה להמשיך לתרגל ולהשתפר? שדרג לתוכנית גבוהה יותר.
          </p>
          <button
            type="button"
            onClick={() => navigate("/plans")}
            className="btn-gradient w-full rounded-2xl py-3.5 text-sm font-bold text-white mb-3 cursor-pointer"
          >
            ראה את כל המסלולים 🚀
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="text-white/30 text-xs hover:text-white/60 transition-colors cursor-pointer"
          >
            חזור ←
          </button>
        </div>
      </FloatBox>
    );
  }

  const difficultyOptions = [
    { value: "easy", label: "קל" },
    { value: "medium", label: "בינוני" },
    { value: "hard", label: "קשה" },
  ];

  return (
    <FloatBox className="glass rounded-3xl p-6 sm:p-8 w-full max-w-lg">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div dir="rtl">
          <h2 className="text-xl font-bold text-white">צור מבחן חדש</h2>
          <p className="text-white/40 text-sm mt-0.5">
            העלה עד 5 קבצי PDF או DOCX
          </p>
        </div>

        {/* File upload zone */}
        <div dir="rtl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/30">
              {files.length}/5 קבצים
            </span>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wide">
              קבצים (PDF / DOCX)
            </label>
          </div>

          {/* Drop zone */}
          {files.length < 5 && (
            <label className="flex items-center justify-center gap-2 w-full rounded-2xl border border-dashed border-white/15 bg-white/3 hover:bg-white/6 hover:border-violet-500/40 transition-all cursor-pointer px-4 py-4 text-sm text-white/40">
              <span className="text-lg">+</span>
              <span>לחץ להוספת קובץ</span>
              <input
                key={fileInputKey}
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => addFiles(e.target.files)}
                className="hidden"
              />
            </label>
          )}

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-2 space-y-2">
              {files.map((f, i) => (
                <FilePreview key={i} file={f} onClear={() => removeFile(i)} />
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4" dir="rtl">
          <div className="flex-1">
            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wide">
              מספר שאלות
            </label>
            <input
              type="number"
              min={1}
              max={45}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="glass-input w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wide">
              רמת קושי
            </label>
            <div className="flex gap-1.5">
              {difficultyOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDifficulty(opt.value as Difficulty)}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-medium transition-all cursor-pointer
                    ${
                      difficulty === opt.value
                        ? "bg-violet-600/30 border border-violet-500/50 text-violet-300"
                        : "glass-input border border-white/10 text-white/40 hover:text-white/70"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Plan question-limit warning */}
        {overPlanLimit && (
          <div
            dir="rtl"
            className="rounded-2xl border border-amber-500/25 bg-amber-500/8 px-4 py-3"
          >
            <p className="text-amber-300 text-sm font-medium mb-0.5">
              {LIMIT_MESSAGES[plan].main}
            </p>
            {LIMIT_MESSAGES[plan].sub && (
              <p className="text-amber-300/55 text-xs mb-2">
                {LIMIT_MESSAGES[plan].sub}
              </p>
            )}
            {LIMIT_MESSAGES[plan].showUpgrade && (
              <button
                type="button"
                onClick={() => navigate("/plans")}
                className="btn-gradient rounded-xl px-4 py-1.5 text-xs font-bold text-white cursor-pointer mt-1"
              >
                שדרג ←
              </button>
            )}
          </div>
        )}

        {/* Include open questions toggle */}
        <div dir="rtl" className="flex flex-col gap-2">
          <div className="flex items-center justify-between glass rounded-2xl px-4 py-3">
            <div>
              <div className={`text-sm font-medium ${canUseOpenQuestions ? "text-white/80" : "text-white/35"}`}>
                כלול שאלות פתוחות
              </div>
              <div className="text-xs text-white/30 mt-0.5">
                {canUseOpenQuestions
                  ? "כ-50% מהשאלות יהיו פתוחות עם ניקוד AI"
                  : "זמין במסלול Student ומעלה"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!canUseOpenQuestions) return;
                setIncludeOpen((v) => !v);
              }}
              className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${
                canUseOpenQuestions
                  ? "cursor-pointer " + (includeOpen ? "bg-violet-600" : "bg-white/10")
                  : "cursor-not-allowed bg-white/5 opacity-40"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${includeOpen && canUseOpenQuestions ? "left-5.5" : "left-0.5"}`}
              />
            </button>
          </div>

          {/* Upgrade nudge for Free plan */}
          {!canUseOpenQuestions && info !== null && (
            <div
              className="rounded-2xl border border-violet-500/20 bg-violet-500/6 px-4 py-3"
            >
              <p className="text-violet-300 text-sm font-medium mb-0.5">
                שאלות פתוחות זמינות רק במסלול Student או Pro.
              </p>
              <p className="text-violet-300/50 text-xs mb-2">
                כדי ליצור מבחן עם שאלות פתוחות, צריך לשדרג למסלול גבוה יותר.
              </p>
              <button
                type="button"
                onClick={() => navigate("/plans")}
                className="btn-gradient rounded-xl px-4 py-1.5 text-xs font-bold text-white cursor-pointer"
              >
                שדרג ←
              </button>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate}
            className="btn-gradient w-full rounded-2xl text-white font-bold py-3.5 text-sm"
          >
            ✦ צור מבחן
          </button>
          <button
            type="button"
            onClick={onGenerateDemo}
            disabled={status === "loading"}
            className="text-white/30 text-xs font-medium hover:text-violet-400 transition-colors disabled:opacity-50 cursor-pointer"
          >
            נסה דוגמה בלי קובץ »
          </button>
        </div>

        {/* Error */}
        {status === "error" && (
          <div
            className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 text-right"
            dir="rtl"
          >
            {errorMsg}
          </div>
        )}
      </div>
    </FloatBox>
  );
}
