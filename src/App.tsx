import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { type Exam, saveScore } from "./api/examApi";
import Creator from "./components/Creator";
import type { Status } from "./types/status";
import ExamView from "./components/ExamView";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import AuthPage from "./pages/AuthPage";
import Navbar from "./components/Navbar";
import HistoryPage from "./pages/HistoryPage";
import PlansPage from "./pages/PlansPage";

/* ── Route guards ── */

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );
  return user ? <Navigate to="/home" replace /> : <>{children}</>;
}

/* ── Background orbs (shared) ── */
function Orbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <div className="absolute -top-60 -right-60 w-175 h-175 bg-violet-700/20 rounded-full blur-[140px]" />
      <div className="absolute top-1/2 -left-60 w-150 h-150 bg-purple-900/25 rounded-full blur-[120px]" />
      <div className="absolute -bottom-60 right-1/3 w-125 h-125 bg-pink-900/15 rounded-full blur-[120px]" />
    </div>
  );
}

/* ── /home ── */

function HomePage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  // Load exam passed from history page (runs once, no setState in effect body)
  useState(() => {
    const raw = sessionStorage.getItem("pendingExam");
    if (!raw) return;
    sessionStorage.removeItem("pendingExam");
    try {
      setExam(JSON.parse(raw) as Exam);
      setStatus("ready");
    } catch { /* ignore */ }
  });
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>(() => {
    try {
      const raw = sessionStorage.getItem("pendingExamAnswers");
      return raw ? (JSON.parse(raw).mcqAnswers ?? {}) : {};
    } catch { return {}; }
  });
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>(() => {
    try {
      const raw = sessionStorage.getItem("pendingExamAnswers");
      if (!raw) return {};
      sessionStorage.removeItem("pendingExamAnswers");
      return (JSON.parse(raw).openAnswers ?? {});
    } catch { sessionStorage.removeItem("pendingExamAnswers"); return {}; }
  });

  function pickMcqAnswer(qId: string, key: "A" | "B" | "C" | "D") {
    setMcqAnswers((prev) => ({ ...prev, [qId]: key }));
  }
  function setOpenAnswer(qId: string, text: string) {
    setOpenAnswers((prev) => ({ ...prev, [qId]: text }));
  }

  // Auto-save in-progress answers to localStorage
  useEffect(() => {
    if (status !== "ready" || !exam?.examId) return;
    localStorage.setItem(
      `exam_progress_${exam.examId}`,
      JSON.stringify({ mcqAnswers, openAnswers }),
    );
  }, [mcqAnswers, openAnswers, status, exam?.examId]);

  async function onSubmit() {
    if (exam?.examId) localStorage.removeItem(`exam_progress_${exam.examId}`);
    setStatus("finished");
    if (exam?.examId && session?.access_token) {
      const mcqQuestions = exam.questions.filter((q) => q.type === "mcq");
      let correct = 0;
      for (const q of mcqQuestions) {
        if (q.type === "mcq" && mcqAnswers[q.id] === q.correctKey) correct++;
      }
      saveScore(exam.examId, { correct, total: exam.questions.length }, mcqAnswers, session.access_token).catch(() => {});
    }
  }

  function reset() {
    if (exam?.examId) localStorage.removeItem(`exam_progress_${exam.examId}`);
    setStatus("idle");
    setExam(null);
    setMcqAnswers({});
    setOpenAnswers({});
    setErrorMsg("");
  }

  return (
    <div className="min-h-screen bg-[#080810] text-white relative overflow-x-hidden">
      <Orbs />
      <Navbar />

      <div
        className="relative z-10 flex flex-col items-center md:items-start md:flex-row md:gap-12 gap-8 pt-20 sm:pt-22 px-4 sm:px-8 md:px-14 pb-10"
        dir="rtl"
      >
        {/* Left panel */}
        <div className="w-full md:w-80 shrink-0">
          <div className="mb-6">
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
              <span className="text-white">Behan</span>
              <span className="gradient-text"> Oti</span>
            </h1>
            <p className="text-white/40 text-sm mt-2 tracking-wide">
              מעלים קובץ ← יוצרים מבחן ← בודקים תשובות
            </p>
          </div>

          <p className="text-white/60 leading-relaxed text-sm mb-6 max-w-xs">
            <span className="text-white font-medium">יש לך סיכומים ואתה לא בטוח אם אתה מוכן?</span>
            <br />
            אנחנו יוצרים מבחן חכם מהחומר שלך — בלי מאמץ.
          </p>

          <div className="flex flex-col gap-2 mb-6">
            {["שאלות אמריקאיות + פתוחות", "בדיקה והסברים מיידיים", "מותאם לקושי ולכמות"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-white/50">
                <span className="w-4 h-4 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-[10px] text-violet-400 shrink-0">✓</span>
                {f}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate("/history")}
            className="w-full rounded-2xl border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 transition-all px-4 py-3 text-sm text-violet-300/70 hover:text-violet-300 cursor-pointer mb-4 flex items-center justify-center"
          >
            <span>היסטוריית מבחנים ←</span>
          </button>
        </div>

        {/* Right panel */}
        <div className="w-full md:flex-1 flex justify-center">
          {exam && (status === "ready" || status === "finished") ? (
            <ExamView
              exam={exam}
              status={status}
              mcqAnswers={mcqAnswers}
              openAnswers={openAnswers}
              onPickMcqAnswer={pickMcqAnswer}
              onSetOpenAnswer={setOpenAnswer}
              onSubmit={onSubmit}
              onReset={reset}
              token={session?.access_token ?? ""}
            />
          ) : (
            <Creator
              setStatus={setStatus}
              setExam={setExam}
              setMcqAnswers={setMcqAnswers}
              setOpenAnswers={setOpenAnswers}
              errorMsg={errorMsg}
              setErrorMsg={setErrorMsg}
              status={status}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── /history ── */

function HistoryRoute() {
  const navigate = useNavigate();

  function startExamFromHistory(ex: Exam) {
    sessionStorage.setItem("pendingExam", JSON.stringify(ex));
    navigate("/home");
  }

  return (
    <div className="min-h-screen bg-[#080810] text-white relative overflow-x-hidden">
      <Orbs />
      <Navbar />
      <HistoryPage onBack={() => navigate("/home")} onStartExam={startExamFromHistory} />
    </div>
  );
}

/* ── Router ── */

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<RedirectIfAuth><AuthPage /></RedirectIfAuth>} />
      <Route path="/home"  element={<RequireAuth><HomePage /></RequireAuth>} />
      <Route path="/history" element={<RequireAuth><HistoryRoute /></RequireAuth>} />
      <Route path="/plans" element={<RequireAuth><PlansPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </AuthProvider>
  );
}
