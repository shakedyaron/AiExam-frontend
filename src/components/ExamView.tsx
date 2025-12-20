import type { Exam } from "../api/examApi";
import type { Status } from "../types/status";

type AnswerKey = "A" | "B" | "C" | "D";

type Props = {
  exam: Exam;
  status: Status;
  answers: Record<string, AnswerKey>;
  onPickAnswer: (qId: string, key: AnswerKey) => void;
  onSubmit: () => void;
  onReset: () => void;
};

export default function ExamView({
  exam,
  status,
  answers,
  onPickAnswer,
  onSubmit,
  onReset,
}: Props) {
  const isFinished = status === "finished";

  const score = (() => {
    let correct = 0;
    for (const q of exam.questions) {
      if (answers[q.id] && answers[q.id] === q.correctKey) correct++;
    }
    return { correct, total: exam.questions.length };
  })();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{exam.title}</h2>
          <p className="text-sm text-neutral-400">
            קושי: {exam.difficulty} • שאלות: {exam.questions.length}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="rounded-xl border border-neutral-800 px-3 py-2 text-sm"
            type="button"
          >
            איפוס
          </button>

          {status === "ready" && (
            <button
              onClick={onSubmit}
              className="rounded-xl bg-emerald-300 text-neutral-900 font-bold px-4 py-2 text-sm"
              type="button"
            >
              שלח לבדיקה
            </button>
          )}
        </div>
      </div>

      {/* Questions */}
      {exam.questions.map((q, idx) => {
        const chosen = answers[q.id];

        return (
          <div
            key={q.id}
            className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5"
          >
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <div
                  dir="rtl"
                  className="font-semibold mb-3 text-right leading-relaxed wrap-break-words [unicode-bidi:plaintext]"
                >
                  {q.question}
                </div>

                <div className="grid gap-2">
                  {q.choices.map((c) => {
                    const selected = chosen === c.key;
                    const correct = q.correctKey === c.key;

                    const baseStyle = selected
                      ? "bg-neutral-800 border-neutral-200"
                      : "bg-neutral-950 border-neutral-800";

                    const finalStyle =
                      isFinished && correct
                        ? "bg-emerald-950/40 border-emerald-500"
                        : isFinished && selected && !correct
                        ? "bg-red-950/40 border-red-500"
                        : baseStyle;

                    return (
                      <button
                        key={c.key}
                        type="button"
                        disabled={isFinished}
                        onClick={() => onPickAnswer(q.id, c.key)}
                        className={`w-full rounded-xl border px-3 py-2 transition
                          ${finalStyle}
                          hover:bg-neutral-900
                          text-right flex flex-row-reverse items-center justify-between gap-3`}
                      >
                        <span className="font-bold">{c.key}.</span>
                        <span className="flex-1">{c.text}</span>
                      </button>
                    );
                  })}
                </div>

                {isFinished && (
                  <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-sm">
                    <div className="font-semibold mb-1">
                      תשובה נכונה:{" "}
                      <span className="text-neutral-200">{q.correctKey}</span>
                    </div>
                    <div className="text-neutral-300">{q.explanation}</div>
                  </div>
                )}
              </div>

              <div className="text-neutral-400 font-bold">.{idx + 1}</div>
            </div>
          </div>
        );
      })}

      {/* Score */}
      {isFinished && (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
          <div className="text-lg font-bold">
            ציון: {score.correct}/{score.total}
          </div>
          <div className="text-sm text-neutral-400 mt-1">
            טיפ: “תרגול טעויות” בשלב הבא — נייצר מבחן חדש רק על מה שטעית בו.
          </div>
        </div>
      )}
    </div>
  );
}
