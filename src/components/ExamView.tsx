import { useEffect, useMemo, useRef, useState } from "react";
import type { Exam, MCQQuestion, OpenQuestion } from "../api/examApi";
import type { Status } from "../types/status";
import QuestionNav from "./QuestionNav";
import { evaluateAnswer } from "../api/examApi";

type AnswerKey = "A" | "B" | "C" | "D";

type Evaluation = { score: number; feedback: string; loading?: boolean };

type Props = {
  exam: Exam | null;
  status: Status;
  mcqAnswers: Record<string, AnswerKey>;
  openAnswers: Record<string, string>;
  onPickMcqAnswer: (qId: string, key: AnswerKey) => void;
  onSetOpenAnswer: (qId: string, text: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  token: string;
};

export default function ExamView({
  exam,
  status,
  mcqAnswers,
  openAnswers,
  onPickMcqAnswer,
  onSetOpenAnswer,
  onSubmit,
  onReset,
  token,
}: Props) {
  const isFinished = status === "finished";
  const qRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>(
    {},
  );
  const [evaluating, setEvaluating] = useState(false);

  const mcqQuestions = useMemo(
    () => exam?.questions.filter((q) => q.type === "mcq") ?? [],
    [exam],
  );
  const openQuestions = useMemo(
    () => exam?.questions.filter((q) => q.type === "open") ?? [],
    [exam],
  );

  // Auto-evaluate all open questions when exam is submitted
  useEffect(() => {
    if (!isFinished || openQuestions.length === 0) return;

    const unevaluated = openQuestions.filter(
      (q) => !evaluations[q.id] && openAnswers[q.id]?.trim(),
    );
    if (unevaluated.length === 0) return;

    setEvaluating(true);
    // Mark all as loading
    setEvaluations((prev) => {
      const next = { ...prev };
      for (const q of unevaluated)
        next[q.id] = { score: 0, feedback: "", loading: true };
      return next;
    });

    // Evaluate all in parallel
    Promise.all(
      unevaluated.map(async (q) => {
        try {
          const result = await evaluateAnswer({
            question: q.question,
            keyPoints: q.keyPoints,
            modelAnswer: q.modelAnswer,
            userAnswer: openAnswers[q.id],
            token,
          });
          return { id: q.id, ...result, loading: false };
        } catch {
          return {
            id: q.id,
            score: 0,
            feedback: "שגיאה בהערכה",
            loading: false,
          };
        }
      }),
    ).then((results) => {
      setEvaluations((prev) => {
        const next = { ...prev };
        for (const r of results)
          next[r.id] = { score: r.score, feedback: r.feedback, loading: false };
        return next;
      });
      setEvaluating(false);
    });
  }, [isFinished]); // eslint-disable-line react-hooks/exhaustive-deps

  const mcqScore = useMemo(() => {
    let correct = 0;
    for (const q of mcqQuestions) {
      if (q.type === "mcq" && mcqAnswers[q.id] === q.correctKey) correct++;
    }
    return correct;
  }, [mcqQuestions, mcqAnswers]);

  const openScore = useMemo(() => {
    let total = 0;
    let counted = 0;
    for (const q of openQuestions) {
      const ev = evaluations[q.id];
      if (ev && !ev.loading) {
        total += ev.score;
        counted++;
      }
    }
    return counted > 0 ? total / counted : null;
  }, [openQuestions, evaluations]);

  const answeredMcqCount = useMemo(
    () => mcqQuestions.filter((q) => mcqAnswers[q.id]).length,
    [mcqQuestions, mcqAnswers],
  );

  const total = exam?.questions.length ?? 0;
  const answeredCount =
    answeredMcqCount +
    Object.keys(openAnswers).filter((k) => openAnswers[k]?.trim()).length;
  const progress = total ? Math.round((answeredCount / total) * 100) : 0;

  const allMcqAnswered = answeredMcqCount === mcqQuestions.length;
  const allOpenAnswered = openQuestions.every((q) => openAnswers[q.id]?.trim());
  const canSubmit = allMcqAnswered && allOpenAnswered;

  function jumpTo(qId: string) {
    qRefs.current[qId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!exam) return null;

  const finalScorePercent =
    isFinished && !evaluating
      ? Math.round(
          ((mcqScore +
            (openScore !== null
              ? (openScore / 100) * openQuestions.length
              : 0)) /
            total) *
            100,
        )
      : 0;
  const scoreColor =
    finalScorePercent >= 70
      ? "text-emerald-400"
      : finalScorePercent >= 50
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="w-full flex flex-col max-h-[calc(100vh-8rem)]">
      <div className="glass rounded-3xl overflow-hidden flex flex-col flex-1 min-h-0">
        {/* ── Header — fixed, never scrolls ── */}
        <div
          className="border-b border-white/6 shrink-0"
          style={{ background: "rgba(8,8,16,0.9)" }}
        >
          <div className="p-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-2 shrink-0">
              <button
                onClick={onReset}
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-medium text-white/60 hover:text-white transition-all cursor-pointer"
              >
                ← חזור
              </button>
              {status === "ready" && (
                <button
                  onClick={onSubmit}
                  type="button"
                  disabled={!canSubmit}
                  className="rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
                  title={!canSubmit ? "ענה על כל השאלות כדי לשלוח" : ""}
                >
                  שלח לבדיקה ✓
                </button>
              )}
            </div>
            <div dir="rtl" className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">
                {exam.title}
              </h2>
              <p className="text-xs text-white/30 mt-0.5">
                {exam.difficulty} · {total} שאלות
                {openQuestions.length > 0 &&
                  ` (${openQuestions.length} פתוחות)`}
                · ענית {answeredCount}/{total}
              </p>
              <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background:
                      "linear-gradient(90deg,#7c3aed,#a855f7,#ec4899)",
                  }}
                />
              </div>
            </div>
          </div>
          <div className="px-4 pb-3">
            <QuestionNav
              exam={exam}
              status={status}
              mcqAnswers={mcqAnswers}
              openAnswers={openAnswers}
              evaluations={evaluations}
              onJump={jumpTo}
            />
          </div>
        </div>

        {/* ── Scroll area ── */}
        <div className="h-[60vh] sm:h-[70vh] overflow-y-auto p-4 custom-scroll">
          <div className="space-y-3">
            {exam.questions.map((q, idx) => (
              <div
                key={q.id}
                ref={(el) => {
                  qRefs.current[q.id] = el;
                }}
                className="glass rounded-2xl p-5"
              >
                {q.type === "mcq" ? (
                  <MCQCard
                    q={q}
                    idx={idx}
                    chosen={mcqAnswers[q.id]}
                    isFinished={isFinished}
                    onPick={onPickMcqAnswer}
                  />
                ) : (
                  <OpenCard
                    q={q}
                    idx={idx}
                    answer={openAnswers[q.id] ?? ""}
                    isFinished={isFinished}
                    evaluation={evaluations[q.id]}
                    onAnswer={onSetOpenAnswer}
                  />
                )}
              </div>
            ))}

            {/* Final score */}
            {isFinished && (
              <div className="glass rounded-2xl p-6 text-center">
                {evaluating ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                    <p className="text-white/50 text-sm">
                      מעריך שאלות פתוחות עם AI...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className={`text-5xl font-bold mb-2 ${scoreColor}`}>
                      {finalScorePercent}%
                    </div>
                    <div className="text-white/50 text-sm mb-1">
                      QCM: {mcqScore}/{mcqQuestions.length}
                      {openQuestions.length > 0 &&
                        openScore !== null &&
                        ` · פתוחות: ${openScore.toFixed(0)}/100`}
                    </div>
                    <div className="text-xs text-white/30 mt-2">
                      {finalScorePercent >= 80
                        ? "מצוין! אתה מוכן 🎉"
                        : finalScorePercent >= 60
                          ? "טוב, כדאי לחזור על כמה נושאים 📚"
                          : "כדאי ללמוד שוב את החומר 💪"}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MCQ Card ── */
function MCQCard({
  q,
  idx,
  chosen,
  isFinished,
  onPick,
}: {
  q: MCQQuestion;
  idx: number;
  chosen?: string;
  isFinished: boolean;
  onPick: (id: string, key: AnswerKey) => void;
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex-1">
        <div
          dir="rtl"
          className="font-medium text-white/90 mb-4 leading-relaxed text-sm [unicode-bidi:plaintext]"
        >
          {q.question}
        </div>
        <div className="grid gap-2">
          {q.choices.map((c) => {
            const selected = chosen === c.key;
            const correct = q.correctKey === c.key;
            let style =
              "border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/20 text-white/70";
            if (selected && !isFinished)
              style = "border-violet-500/60 bg-violet-500/15 text-white";
            if (isFinished && correct)
              style =
                "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
            if (isFinished && selected && !correct)
              style = "border-red-500/50 bg-red-500/10 text-red-300";
            return (
              <button
                key={c.key}
                type="button"
                disabled={isFinished}
                onClick={() => onPick(q.id, c.key)}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all text-right flex flex-row-reverse items-center gap-3 cursor-pointer disabled:cursor-default ${style}`}
              >
                <span className="text-xs font-bold opacity-50 shrink-0">
                  {c.key}
                </span>
                <span className="flex-1">{c.text}</span>
              </button>
            );
          })}
        </div>
        {isFinished && (
          <div
            className="mt-3 rounded-xl border border-white/8 bg-white/3 p-3 text-xs text-white/50"
            dir="rtl"
          >
            <span className="text-white/70 font-medium">תשובה: </span>
            <span className="text-violet-400 font-bold">{q.correctKey}</span>
            <span className="mx-1">·</span>
            {q.explanation}
          </div>
        )}
      </div>
      <div className="text-white/20 text-xs font-bold pt-0.5 shrink-0">
        {idx + 1}
      </div>
    </div>
  );
}

/* ── Open Question Card ── */
function OpenCard({
  q,
  idx,
  answer,
  isFinished,
  evaluation,
  onAnswer,
}: {
  q: OpenQuestion;
  idx: number;
  answer: string;
  isFinished: boolean;
  evaluation?: Evaluation;
  onAnswer: (id: string, text: string) => void;
}) {
  const hasEval = evaluation && !evaluation.loading;
  const scoreColor = hasEval
    ? evaluation.score >= 70
      ? "text-emerald-400"
      : evaluation.score >= 50
        ? "text-yellow-400"
        : "text-red-400"
    : "";

  return (
    <div className="flex gap-3 items-start">
      <div className="flex-1">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-3" dir="rtl">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400">
            שאלה פתוחה
          </span>
        </div>
        <div
          dir="rtl"
          className="font-medium text-white/90 mb-4 leading-relaxed text-sm [unicode-bidi:plaintext]"
        >
          {q.question}
        </div>

        {/* Answer textarea */}
        <textarea
          dir="rtl"
          value={answer}
          onChange={(e) => onAnswer(q.id, e.target.value)}
          disabled={isFinished}
          rows={3}
          placeholder="כתוב את תשובתך כאן..."
          className="glass-input w-full rounded-xl px-4 py-3 text-sm resize-none disabled:opacity-60"
        />

        {/* Loading state while evaluating */}
        {evaluation?.loading && (
          <div className="mt-2 flex items-center gap-2 text-xs text-white/40 justify-center">
            <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            מעריך עם AI...
          </div>
        )}

        {/* Evaluation result */}
        {hasEval && (
          <div
            className="mt-3 rounded-xl border border-white/10 bg-white/3 p-4"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-2xl font-bold ${scoreColor}`}>
                {evaluation.score}/100
              </span>
              <span className="text-xs text-white/40">ניקוד AI</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              {evaluation.feedback}
            </p>
            <div className="mt-3 pt-3 border-t border-white/8">
              <span className="text-xs text-white/40">תשובה מודל: </span>
              <span className="text-xs text-white/60">{q.modelAnswer}</span>
            </div>
          </div>
        )}

        {/* Key points hint (after submit, before eval result) */}
        {isFinished && !hasEval && !evaluation?.loading && (
          <div
            className="mt-3 rounded-xl border border-white/8 bg-white/3 p-3"
            dir="rtl"
          >
            <div className="text-xs text-white/40 mb-1.5">נקודות מפתח:</div>
            <ul className="space-y-1">
              {q.keyPoints.map((kp, i) => (
                <li key={i} className="text-xs text-white/60 flex gap-2">
                  <span className="text-violet-400">·</span>
                  {kp}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="text-white/20 text-xs font-bold pt-0.5 shrink-0">
        {idx + 1}
      </div>
    </div>
  );
}
