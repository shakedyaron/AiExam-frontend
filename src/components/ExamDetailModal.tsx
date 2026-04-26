import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  getExamDetail,
  type ExamDetail,
  type MCQQuestion,
  type OpenQuestion,
} from "../api/examApi";

type Props = {
  examId: string;
  token: string;
  onClose: () => void;
};

const diffLabel: Record<string, string> = {
  easy: "קל",
  medium: "בינוני",
  hard: "קשה",
};

function scoreColor(pct: number) {
  if (pct >= 80) return "text-emerald-400";
  if (pct >= 60) return "text-yellow-400";
  return "text-red-400";
}
function scoreBg(pct: number) {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

export default function ExamDetailModal({
  examId,
  token,
  onClose,
}: Props) {
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExamDetail(examId, token)
      .then(setExam)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [examId, token]);

  const pct = exam?.score
    ? Math.round((exam.score.correct / exam.score.total) * 100)
    : null;
  const mcqAnswers = exam?.score?.mcqAnswers ?? {};

  const wrongCount = exam
    ? exam.questions.filter(
        (q) =>
          q.type === "mcq" &&
          mcqAnswers[q.id] &&
          mcqAnswers[q.id] !== q.correctKey,
      ).length
    : 0;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: "rgba(0,0,0,0.88)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 overflow-hidden"
        style={{ background: "#0d0d1a" }}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/8 shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white truncate">
              {loading ? "טוען..." : exam?.title}
            </h2>
            {exam && (
              <p className="text-xs text-white/40 mt-0.5">
                {new Date(exam.created_at).toLocaleDateString("he-IL")} ·{" "}
                {diffLabel[exam.difficulty]}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors cursor-pointer text-lg shrink-0 mr-2"
          >
            ✕
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto custom-scroll p-5 space-y-5">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 rounded-full border-2 border-violet-500/40 border-t-violet-500 animate-spin" />
            </div>
          )}

          {!loading && exam && (
            <>
              {/* Score summary */}
              {pct !== null && (
                <div
                  className="rounded-2xl border border-white/8 p-4"
                  style={{ background: "#111120" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/40">ציון כולל</span>
                    <span className={`text-3xl font-bold ${scoreColor(pct)}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${scoreBg(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/30 mt-2">
                    <span>
                      {exam.score!.correct} נכון מתוך {exam.score!.total}
                    </span>
                    {wrongCount > 0 && (
                      <span className="text-red-400">{wrongCount} טעויות</span>
                    )}
                  </div>
                </div>
              )}

              {/* Analysis */}
              {pct !== null && (
                <div
                  className="rounded-2xl border border-white/8 p-4 space-y-2"
                  style={{ background: "#111120" }}
                >
                  <div className="text-xs font-semibold text-white/50 mb-2">
                    ניתוח ביצועים
                  </div>
                  <AnalysisRow
                    icon={pct >= 70 ? "✓" : "✗"}
                    color={pct >= 70 ? "text-emerald-400" : "text-red-400"}
                    label={
                      pct >= 80
                        ? "ביצועים מצוינים!"
                        : pct >= 60
                          ? "ביצועים טובים, יש מקום לשיפור"
                          : "מומלץ לחזור על החומר"
                    }
                  />
                  {wrongCount > 0 && (
                    <AnalysisRow
                      icon="⚠"
                      color="text-yellow-400"
                      label={`יש לך ${wrongCount} שאלות שטעית בהן — כדאי לחזור עליהן`}
                    />
                  )}
                  <AnalysisRow
                    icon="📚"
                    color="text-violet-400"
                    label={`רמת קושי: ${diffLabel[exam.difficulty]}`}
                  />
                </div>
              )}

              {/* Generate from mistakes button */}
              {/* {wrongCount > 0 && (
                <div
                  className="rounded-2xl border border-violet-500/20 p-4"
                  style={{ background: "#14102a" }}
                >
                  <div className="text-sm font-semibold text-white/80 mb-1">
                    צור מבחן חדש לפי הטעויות שלי
                  </div>
                  <div className="text-xs text-white/40 mb-3">
                    AI יצור {Math.min(5, wrongCount * 2)} שאלות חדשות על הנושאים
                    שטעית בהם
                  </div>
                  {genError && (
                    <div className="text-xs text-red-400 mb-2">{genError}</div>
                  )}
                  <button
                    type="button"
                    onClick={handleGenerateFromMistakes}
                    disabled={generating}
                    className="btn-gradient w-full rounded-xl py-2.5 text-sm font-bold text-white cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />{" "}
                        יוצר...
                      </>
                    ) : (
                      "✦ צור מבחן על הטעויות שלי"
                    )}
                  </button>
                </div>
              )} */}

              {/* Questions list */}
              <div>
                <div className="text-xs font-semibold text-white/50 mb-3">
                  שאלות ותשובות
                </div>
                <div className="space-y-3">
                  {exam.questions.map((q, idx) =>
                    q.type === "mcq" ? (
                      <MCQReview
                        key={q.id}
                        q={q}
                        idx={idx}
                        userAnswer={mcqAnswers[q.id]}
                      />
                    ) : (
                      <OpenReview key={q.id} q={q} idx={idx} />
                    ),
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function AnalysisRow({
  icon,
  color,
  label,
}: {
  icon: string;
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className={`shrink-0 font-bold ${color}`}>{icon}</span>
      <span className="text-white/60">{label}</span>
    </div>
  );
}

function MCQReview({
  q,
  idx,
  userAnswer,
}: {
  q: MCQQuestion;
  idx: number;
  userAnswer?: string;
}) {
  const hasAnswer = !!userAnswer;
  const isCorrect = userAnswer === q.correctKey;
  const borderColor = !hasAnswer
    ? "border-white/8"
    : isCorrect
      ? "border-emerald-500/30"
      : "border-red-500/30";
  const bg = !hasAnswer ? "#111120" : isCorrect ? "#0f1f18" : "#1f0f12";

  return (
    <div
      className={`rounded-2xl border p-4`}
      style={{
        background: bg,
        borderColor: borderColor.replace("border-", ""),
      }}
    >
      <div className="flex items-start gap-2 mb-3">
        <span className="text-xs text-white/30 shrink-0 mt-0.5">
          {idx + 1}.
        </span>
        <div className="text-sm text-white/85 leading-relaxed">
          {q.question}
        </div>
        {hasAnswer && (
          <span
            className={`shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-lg ${isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
          >
            {isCorrect ? "✓" : "✗"}
          </span>
        )}
      </div>
      <div className="grid gap-1.5">
        {q.choices.map((c) => {
          const isRight = c.key === q.correctKey;
          const isChosen = c.key === userAnswer;
          let style = "border-white/6 bg-white/3 text-white/40";
          if (isRight)
            style = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
          else if (isChosen && !isRight)
            style = "border-red-500/40 bg-red-500/10 text-red-300";
          return (
            <div
              key={c.key}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${style}`}
            >
              <span className="font-bold shrink-0">{c.key}</span>
              <span>{c.text}</span>
              {isRight && <span className="mr-auto text-emerald-400">✓</span>}
              {isChosen && !isRight && (
                <span className="mr-auto text-red-400">✗</span>
              )}
            </div>
          );
        })}
      </div>
      {q.explanation && (
        <div className="mt-3 text-xs text-white/40 border-t border-white/6 pt-2">
          <span className="text-white/60 font-medium">הסבר: </span>
          {q.explanation}
        </div>
      )}
    </div>
  );
}

function OpenReview({ q, idx }: { q: OpenQuestion; idx: number }) {
  return (
    <div
      className="rounded-2xl border border-purple-500/20 p-4"
      style={{ background: "#13102a" }}
    >
      <div className="flex items-start gap-2 mb-3">
        <span className="text-xs text-white/30 shrink-0 mt-0.5">
          {idx + 1}.
        </span>
        <div className="flex-1">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 mr-2">
            פתוחה
          </span>
          <span className="text-sm text-white/85 leading-relaxed">
            {q.question}
          </span>
        </div>
      </div>
      <div className="space-y-1.5">
        {q.keyPoints.map((kp, i) => (
          <div key={i} className="flex gap-2 text-xs text-white/50">
            <span className="text-violet-400 shrink-0">·</span>
            {kp}
          </div>
        ))}
      </div>
      {q.modelAnswer && (
        <div className="mt-3 text-xs text-white/40 border-t border-white/6 pt-2">
          <span className="text-white/60 font-medium">תשובה מודל: </span>
          {q.modelAnswer}
        </div>
      )}
    </div>
  );
}
