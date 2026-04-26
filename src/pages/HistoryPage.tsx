import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  getExamHistory,
  getExamDetail,
  generateFromMistakes,
  type HistoryItem,
  type Exam,
} from "../api/examApi";
import ExamDetailModal from "../components/ExamDetailModal";

type Props = {
  onBack: () => void;
  onStartExam: (exam: Exam) => void;
};

type SortKey = "date_desc" | "date_asc" | "score_desc" | "score_asc";
type Filter = "all" | "easy" | "medium" | "hard" | "weak";

/* ── Score comparison (retry vs original) ── */
type ScoreComparison = { prevPct: number; currPct: number; delta: number } | null;

/* ────────────────────────── helpers ────────────────────────── */

function scorePct(item: HistoryItem): number | null {
  if (!item.score) return null;
  return Math.round((item.score.correct / item.score.total) * 100);
}

const diffColor: Record<string, string> = {
  easy: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  medium: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  hard: "text-red-400 border-red-500/30 bg-red-500/10",
};
const diffLabel: Record<string, string> = {
  easy: "קל", medium: "בינוני", hard: "קשה",
};

function ScoreBadge({ pct }: { pct: number | null }) {
  if (pct === null)
    return <span className="text-xs text-white/25">לא הוגש</span>;
  const cls =
    pct >= 80 ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30"
    : pct >= 60 ? "text-yellow-400 bg-yellow-500/15 border-yellow-500/30"
    : "text-red-400 bg-red-500/15 border-red-500/30";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      {pct}%
    </span>
  );
}

/* ── Coach data based on avg ── */
function getCoachData(avg: number | null, weakCount: number) {
  if (avg === null)
    return { emoji: "🚀", title: "ברוך הבא לאזור הצמיחה!", body: "תתחיל עם המבחן הראשון שלך וקבל ניתוח מותאם אישית.", color: "from-violet-600/20 to-purple-700/10", border: "border-violet-500/25" };
  if (avg >= 85)
    return { emoji: "🏆", title: "ביצועים מצוינים!", body: `ממוצע ${avg}% — אתה ברמה גבוהה. שמור על הקצב ואתגר את עצמך עם נושאים חדשים.`, color: "from-emerald-600/20 to-teal-700/10", border: "border-emerald-500/25" };
  if (avg >= 70)
    return { emoji: "📈", title: "אתה בדרך הנכונה!", body: `ממוצע ${avg}% — עוד ${weakCount > 0 ? `שיפור ב-${weakCount} נושאים חלשים` : "קצת עבודה"} ותגיע ל-90%.`, color: "from-blue-600/20 to-indigo-700/10", border: "border-blue-500/25" };
  if (avg >= 50)
    return { emoji: "⚠️", title: "יש פוטנציאל גדול כאן!", body: `ממוצע ${avg}% — זיהינו ${weakCount} נושאים שדורשים תשומת לב. תרגול ממוקד יקפיץ אותך קדימה.`, color: "from-yellow-600/15 to-orange-700/10", border: "border-yellow-500/25" };
  return { emoji: "🔥", title: "הגיע הזמן להתאמץ!", body: `ממוצע ${avg}% — רוב הנושאים דורשים שיפור. תרגול ממוקד על הטעויות שלך יעזור לך לזנק.`, color: "from-red-600/20 to-rose-700/10", border: "border-red-500/25" };
}

/* ────────────────────────── sub-components ────────────────────────── */

function CoachBanner({
  avg, weakCount, worstExam, onOpenExam,
}: {
  avg: number | null; weakCount: number; worstExam: HistoryItem | null; onOpenExam: (id: string) => void;
}) {
  const c = getCoachData(avg, weakCount);
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${c.border} p-5 mb-5 bg-gradient-to-l ${c.color}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xl">{c.emoji}</span>
            <span className="text-base font-bold text-white">{c.title}</span>
            <span className="text-[10px] font-semibold text-white/30 border border-white/10 rounded-full px-2 py-0.5 bg-white/5">
              המלצה חכמה 🤖
            </span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">{c.body}</p>
          {worstExam && (
            <p className="text-xs text-white/35 mt-1.5">
              הנושא החלש ביותר:{" "}
              <span className="text-red-400/80 font-medium">
                {worstExam.title.slice(0, 45)}{worstExam.title.length > 45 ? "…" : ""}
              </span>
            </p>
          )}
        </div>
        {worstExam && (
          <button
            type="button"
            onClick={() => onOpenExam(worstExam.id)}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white cursor-pointer transition-all whitespace-nowrap shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
          >
            שפר עכשיו ←
          </button>
        )}
      </div>
    </motion.div>
  );
}

function MotivationBlock({ avg, weakCount }: { avg: number; weakCount: number }) {
  const target = 90;
  const progress = Math.min((avg / target) * 100, 100);
  const remaining = Math.max(0, target - avg);
  if (avg >= target) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl border border-violet-500/20 p-4 mb-5"
      style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.08),rgba(168,85,247,0.04))" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-violet-300">
          🎯 יעד: 90% — {remaining > 0 ? `עוד ${remaining}% ותגיע!` : "הגעת ליעד!"}
        </span>
        {weakCount > 0 && (
          <span className="text-xs text-white/30">{weakCount} נושאים חלשים לשיפור</span>
        )}
      </div>
      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg,#7c3aed,#a855f7,#ec4899)" }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-white/25 mt-1">
        <span>0%</span>
        <span className="text-violet-400/70 font-medium">{avg}% עכשיו</span>
        <span>90%</span>
      </div>
    </motion.div>
  );
}

function InteractiveChart({ data }: { data: { pct: number; title: string; date: string }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.pct), 1);
  return (
    <div className="rounded-2xl border border-white/8 p-5 mb-5" style={{ background: "#111120" }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-white/40">התקדמות לאורך זמן</span>
        {hovered !== null && (
          <motion.span key={hovered} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-violet-300">
            {data[hovered].title.slice(0, 30)} — {data[hovered].pct}%
          </motion.span>
        )}
      </div>
      <div className="flex items-end gap-2 h-24">
        {data.map((d, i) => {
          const isHovered = hovered === i;
          const barColor = d.pct >= 80 ? "#10b981" : d.pct >= 60 ? "#eab308" : "#ef4444";
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1 cursor-pointer relative"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-7 bg-[#1a1a2e] border border-white/15 rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap z-10 pointer-events-none"
                  >
                    {d.pct}%
                  </motion.div>
                )}
              </AnimatePresence>
              <span className={`text-[10px] transition-colors ${isHovered ? "text-white" : "text-white/25"}`}>
                {d.pct}%
              </span>
              <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: "56px" }}>
                <motion.div
                  className="absolute bottom-0 w-full rounded-t-lg"
                  style={{
                    height: `${(d.pct / max) * 56}px`,
                    background: barColor,
                    opacity: isHovered ? 1 : 0.55,
                    boxShadow: isHovered ? `0 0 12px ${barColor}80` : "none",
                    transition: "opacity 0.15s, box-shadow 0.15s",
                  }}
                />
              </div>
              <span className={`text-[9px] transition-colors text-center leading-tight ${isHovered ? "text-white/70" : "text-white/20"}`}>
                {d.date}
              </span>
            </div>
          );
        })}
      </div>
      {data.length >= 2 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          {(() => {
            const delta = data[data.length - 1].pct - data[0].pct;
            if (delta > 0) return <span className="text-[11px] text-emerald-400">↑ שיפור של {delta}% מאז ההתחלה 🎉</span>;
            if (delta < 0) return <span className="text-[11px] text-red-400">↓ ירידה של {Math.abs(delta)}% — בוא נהפוך את זה!</span>;
            return <span className="text-[11px] text-white/30">→ יציבות — שחק עם הקושי!</span>;
          })()}
        </div>
      )}
    </div>
  );
}

/* ── Spinner helper ── */
function Spinner() {
  return <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />;
}

/* ── ExamCard ── */
function ExamCard({
  item,
  index,
  comparison,
  onOpen,
  onSmartExam,
  onResume,
}: {
  item: HistoryItem;
  index: number;
  comparison: ScoreComparison;
  onOpen: () => void;
  onSmartExam: () => Promise<void>;
  onResume: () => void;
}) {
  const pct = scorePct(item);
  const isUnfinished = item.score === null;
  const [loading, setLoading] = useState(false);

  async function handleAction(e: React.MouseEvent) {
    e.stopPropagation();
    setLoading(true);
    await onSmartExam();
    setLoading(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className={`rounded-2xl border p-4 flex flex-col transition-all ${
        isUnfinished
          ? "border-dashed border-amber-500/30 hover:border-amber-500/50"
          : "border-white/8 hover:border-violet-500/25"
      }`}
      style={{ background: "#111120" }}
    >
      {/* Title + badge — clickable for details */}
      <button
        type="button"
        onClick={isUnfinished ? onResume : onOpen}
        className="flex items-start justify-between gap-2 mb-2 text-right cursor-pointer w-full"
      >
        <div className="font-semibold text-white/85 text-sm leading-tight line-clamp-2 flex-1">
          {item.title}
        </div>
        {isUnfinished ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400 whitespace-nowrap shrink-0">
            לא הושלם
          </span>
        ) : (
          <ScoreBadge pct={pct} />
        )}
      </button>

      {/* Score comparison (retry exams) */}
      {comparison && (
        <div className="flex items-center gap-2 text-xs mb-2 flex-wrap">
          <span className="text-white/35">ציון קודם: <span className="text-white/55 font-medium">{comparison.prevPct}%</span></span>
          <span className="text-white/20">→</span>
          <span className={comparison.delta >= 0 ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
            ציון חדש: {comparison.currPct}%
          </span>
          <span className={`font-bold ${comparison.delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {comparison.delta >= 0 ? `↑ +${comparison.delta}% 🎉` : `↓ ${comparison.delta}%`}
          </span>
        </div>
      )}

      {/* Progress bar */}
      {pct !== null && (
        <div className="h-1 rounded-full bg-white/8 overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, delay: index * 0.04 }}
            className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
          />
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-white/30 mb-3">
        <span>{new Date(item.created_at).toLocaleDateString("he-IL")}</span>
        <div className="flex items-center gap-2">
          <span className={`px-1.5 py-0.5 rounded-lg border text-[10px] ${diffColor[item.difficulty] ?? "text-white/30"}`}>
            {diffLabel[item.difficulty]}
          </span>
          {item.score && <span>{item.score.correct}/{item.score.total}</span>}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto pt-2 border-t border-white/5">
        {isUnfinished ? (
          <button
            type="button"
            onClick={onResume}
            className="w-full rounded-xl py-2 text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all border border-amber-500/30 bg-amber-500/8 text-amber-300 hover:bg-amber-500/15"
          >
            המשך מבחן ←
          </button>
        ) : pct === 100 ? (
          <div className="flex items-center justify-center gap-2 py-1.5">
            <span className="text-base leading-none">🏆</span>
            <span className="text-xs font-semibold text-emerald-400">כל הכבוד! עברת בהצלחה מלאה</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAction}
            disabled={loading}
            className="w-full rounded-xl py-2 text-xs font-semibold text-white cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
          >
            {loading ? <Spinner /> : "לתקן את הטעויות שלי 🎯"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ── Fallback toast ── */
function FallbackToast({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-6 right-6 z-50 rounded-2xl border border-violet-500/30 px-4 py-3 text-sm text-white/80 flex items-center gap-2 max-w-xs"
          style={{ background: "rgba(20,10,40,0.95)", backdropFilter: "blur(12px)" }}
        >
          <span>👍</span>
          <span>לא נמצאו טעויות לניתוח — יצרנו לך מבחן חזרה כללי</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ────────────────────────── main page ────────────────────────── */

export default function HistoryPage({ onStartExam }: Props) {
  const { session } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fallbackToast, setFallbackToast] = useState(false);

  useEffect(() => {
    if (!session?.access_token) return;
    getExamHistory(session.access_token)
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const withScore = history.filter((h) => h.score);
    const pcts = withScore.map((h) => scorePct(h)!);
    const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;
    const best = pcts.length ? Math.max(...pcts) : null;
    const trend = pcts.length >= 2 ? pcts[pcts.length - 1] - pcts[pcts.length - 2] : null;
    const weakExams = withScore.filter((h) => scorePct(h)! < 60);
    const worstExam = weakExams.length
      ? [...weakExams].sort((a, b) => scorePct(a)! - scorePct(b)!)[0]
      : null;
    return { total: history.length, avg, best, trend, weakCount: weakExams.length, worstExam };
  }, [history]);

  /* ── Score comparisons: retry exams vs their originals ── */
  const comparisons = useMemo<Map<string, ScoreComparison>>(() => {
    const map = new Map<string, ScoreComparison>();
    for (const item of history) {
      const isRetry =
        item.title.startsWith("חזרה על טעויות: ") ||
        item.title.startsWith("חזרה כללית: ");
      if (!isRetry || !item.score) continue;
      const originalTitle = item.title.replace(/^חזרה (על טעויות|כללית): /, "");
      const original = history.find(
        (h) => h.title === originalTitle && h.id !== item.id && h.score,
      );
      if (!original) continue;
      const prevPct = scorePct(original)!;
      const currPct = scorePct(item)!;
      map.set(item.id, { prevPct, currPct, delta: currPct - prevPct });
    }
    return map;
  }, [history]);

  /* ── Chart data ── */
  const chartData = useMemo(
    () =>
      history
        .filter((h) => h.score)
        .slice(-8)
        .map((h) => ({
          pct: scorePct(h)!,
          title: h.title,
          date: new Date(h.created_at).toLocaleDateString("he-IL", { month: "numeric", day: "numeric" }),
        })),
    [history],
  );

  /* ── Filtered + sorted ── */
  const filtered = useMemo(() => {
    let list = [...history];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((h) => h.title.toLowerCase().includes(q));
    }
    if (filter === "weak")
      list = list.filter((h) => { const p = scorePct(h); return p !== null && p < 60; });
    else if (filter !== "all")
      list = list.filter((h) => h.difficulty === filter);

    list.sort((a, b) => {
      if (sort === "date_desc") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "date_asc") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      const pa = scorePct(a) ?? -1, pb = scorePct(b) ?? -1;
      return sort === "score_desc" ? pb - pa : pa - pb;
    });
    return list;
  }, [history, search, filter, sort]);

  /* ── Resume: fetch full exam, restore saved answers, launch ── */
  async function resumeExam(examId: string) {
    if (!session?.access_token) return;
    try {
      const detail = await getExamDetail(examId, session.access_token);
      if (!detail) return;
      const savedRaw = localStorage.getItem(`exam_progress_${examId}`);
      if (savedRaw) sessionStorage.setItem("pendingExamAnswers", savedRaw);
      onStartExam({ examId: detail.id, title: detail.title, difficulty: detail.difficulty, questions: detail.questions });
    } catch { /* ignore */ }
  }

  /* ── Replay: fetch full exam and launch ── */
  async function replayExam(examId: string) {
    if (!session?.access_token) return;
    try {
      const detail = await getExamDetail(examId, session.access_token);
      if (!detail) return;
      onStartExam({ examId: detail.id, title: detail.title, difficulty: detail.difficulty, questions: detail.questions });
    } catch {
      // silently ignore — user stays on page
    }
  }

  /* ── Smart exam: from mistakes with built-in fallback ── */
  async function generateSmartExam(item: HistoryItem) {
    if (!session?.access_token) return;
    const hasWrong = item.score && item.score.correct < item.score.total;

    if (hasWrong && item.score?.mcqAnswers) {
      try {
        const exam = await generateFromMistakes({ examId: item.id, numQuestions: 6, token: session.access_token });
        if (exam.fallback) setFallbackToast(true);
        onStartExam(exam);
      } catch {
        // Any failure → silently fallback to replay
        await replayExam(item.id);
      }
    } else {
      // Perfect score or no mcq data → generate from mistakes anyway (backend will do general review)
      try {
        const exam = await generateFromMistakes({ examId: item.id, numQuestions: 6, token: session.access_token });
        if (exam.fallback) setFallbackToast(true);
        onStartExam(exam);
      } catch {
        await replayExam(item.id);
      }
    }
  }

  /* ── Stat cards ── */
  const statCards = [
    { label: "סה״כ מבחנים", value: stats.total, suffix: "", color: "text-white" },
    {
      label: "ממוצע", value: stats.avg ?? "—", suffix: stats.avg !== null ? "%" : "",
      color: stats.avg === null ? "text-white" : stats.avg >= 80 ? "text-emerald-400" : stats.avg >= 60 ? "text-yellow-400" : "text-red-400",
    },
    {
      label: "שיא", value: stats.best ?? "—", suffix: stats.best !== null ? "%" : "",
      color: stats.best !== null && stats.best >= 80 ? "text-emerald-400" : "text-white",
    },
    {
      label: "מגמה", value: stats.trend !== null ? (stats.trend > 0 ? `+${stats.trend}` : stats.trend) : "—", suffix: stats.trend !== null ? "%" : "",
      color: stats.trend === null ? "text-white" : stats.trend > 0 ? "text-emerald-400" : stats.trend < 0 ? "text-red-400" : "text-white/50",
    },
  ];

  const filterPills: { key: Filter; label: string; activeClass: string }[] = [
    { key: "all", label: "הכל", activeClass: "border-violet-500/50 bg-violet-500/15 text-violet-300" },
    { key: "easy", label: "קל", activeClass: diffColor.easy },
    { key: "medium", label: "בינוני", activeClass: diffColor.medium },
    { key: "hard", label: "קשה", activeClass: diffColor.hard },
    { key: "weak", label: "רק חלשים ⚠️", activeClass: "border-red-500/50 bg-red-500/15 text-red-300" },
  ];

  return (
    <div className="min-h-screen bg-[#080810] text-white" dir="rtl">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-60 -right-60 w-175 h-175 bg-violet-700/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-150 h-150 bg-purple-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 pt-22 pb-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">ההתקדמות שלך 📈</h1>
          <p className="text-white/40 text-sm mt-0.5">מערכת האימון החכמה שלך — נתח, שפר, הצלח</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 rounded-full border-2 border-violet-500/40 border-t-violet-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Coach banner */}
            {stats.total > 0 && (
              <CoachBanner
                avg={stats.avg}
                weakCount={stats.weakCount}
                worstExam={stats.worstExam}
                onOpenExam={setSelectedId}
              />
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {statCards.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-white/8 p-4 text-center"
                  style={{ background: "#111120" }}
                >
                  <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}{s.suffix}</div>
                  <div className="text-xs text-white/35 mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Motivation progress */}
            {stats.avg !== null && stats.avg < 90 && (
              <MotivationBlock avg={stats.avg} weakCount={stats.weakCount} />
            )}

            {/* Interactive chart */}
            {chartData.length > 1 && <InteractiveChart data={chartData} />}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="חפש מבחן..."
                  className="glass-input w-full rounded-xl px-4 py-2.5 text-sm pr-9"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 text-sm">🔍</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {filterPills.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setFilter(p.key)}
                    className={`rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer border
                      ${filter === p.key ? p.activeClass : "border-white/8 bg-white/3 text-white/40 hover:text-white/60"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="glass-input rounded-xl px-3 py-2 text-xs cursor-pointer"
              >
                <option value="date_desc">תאריך: חדש ראשון</option>
                <option value="date_asc">תאריך: ישן ראשון</option>
                <option value="score_desc">ציון: גבוה ראשון</option>
                <option value="score_asc">ציון: נמוך ראשון</option>
              </select>
            </div>

            {/* Exam grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-white/25">
                {history.length === 0 ? (
                  <>
                    <div className="text-4xl mb-3">📝</div>
                    <div className="text-sm">עדיין אין מבחנים — צור את הראשון!</div>
                  </>
                ) : (
                  "לא נמצאו תוצאות"
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((item, i) => (
                  <ExamCard
                    key={item.id}
                    item={item}
                    index={i}
                    comparison={comparisons.get(item.id) ?? null}
                    onOpen={() => setSelectedId(item.id)}
                    onSmartExam={() => generateSmartExam(item)}
                    onResume={() => resumeExam(item.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail modal */}
      {selectedId && session?.access_token && (
        <ExamDetailModal
          examId={selectedId}
          token={session.access_token}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Fallback toast */}
      <FallbackToast visible={fallbackToast} onDismiss={() => setFallbackToast(false)} />
    </div>
  );
}
