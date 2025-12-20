import { useMemo, useState } from "react";
import { generateExam, type Difficulty, type Exam } from "./api/examApi";

type Status = "idle" | "loading" | "ready" | "error" | "finished";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  const [status, setStatus] = useState<Status>("idle");
  const [exam, setExam] = useState<Exam | null>(null);

  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>(
    {}
  );
  const [errorMsg, setErrorMsg] = useState<string>("");

  const canGenerate = useMemo(
    () => !!file && status !== "loading",
    [file, status]
  );

  async function onGenerate() {
    if (!file) return;
    setStatus("loading");
    setErrorMsg("");
    setExam(null);
    setAnswers({});

    try {
      const ex = await generateExam({ file, numQuestions, difficulty });
      setExam(ex);
      setStatus("ready");
    } catch (err: any) {
      // טיפול יפה בשגיאות מהשרת
      if (err?.error === "NotEnoughContent") {
        const details = err?.details;
        setErrorMsg(
          details?.message ?? "המסמך קצר מדי בשביל מספר השאלות שבחרת."
        );
      } else if (err?.error === "ValidationError") {
        setErrorMsg("הגדרות לא תקינות. בדוק מספר שאלות/קושי.");
      } else {
        setErrorMsg(err?.error ?? "שגיאה לא צפויה.");
      }
      setStatus("error");
    }
  }

  function pickAnswer(qId: string, key: "A" | "B" | "C" | "D") {
    setAnswers((prev) => ({ ...prev, [qId]: key }));
  }

  function onSubmit() {
    setStatus("finished");
  }

  function reset() {
    setStatus("idle");
    setExam(null);
    setAnswers({});
    setErrorMsg("");
  }

  const score = useMemo(() => {
    if (!exam) return { correct: 0, total: 0 };
    let correct = 0;
    for (const q of exam.questions) {
      if (answers[q.id] && answers[q.id] === q.correctKey) correct++;
    }
    return { correct, total: exam.questions.length };
  }, [exam, answers]);

  return (
    <div className="min-h-screen bg-gray-200 text-neutral-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold mb-2">AI Exam</h1>
        <p className="text-neutral-400 mb-8">
          מעלים קובץ → יוצרים מבחן → בודקים תשובות.
        </p>

        {/* Creator */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 mb-7">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-3">
              <label className="block text-sm text-neutral-300 mb-2">
                קובץ (PDF / DOCX)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-neutral-200 file:text-neutral-900 file:px-4 file:py-2 file:font-semibold"
              />
              {file && (
                <p className="text-xs text-neutral-400 mt-2">
                  נבחר: <span className="text-neutral-200">{file.name}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">
                מספר שאלות
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">
                רמת קושי
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2"
              >
                <option value="easy">קל</option>
                <option value="medium">בינוני</option>
                <option value="hard">קשה</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                disabled={!canGenerate}
                onClick={onGenerate}
                className="w-full rounded-xl bg-neutral-100 text-neutral-900 font-bold px-4 py-2 disabled:opacity-40"
              >
                {status === "loading" ? "מייצר מבחן..." : "צור מבחן"}
              </button>
            </div>
          </div>

          {status === "error" && (
            <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Exam */}
        {exam && status !== "idle" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{exam.title}</h2>
                <p className="text-sm text-neutral-400">
                  קושי: {exam.difficulty} • שאלות: {exam.questions.length}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="rounded-xl border border-neutral-800 px-3 py-2 text-sm"
                >
                  איפוס
                </button>

                {status === "ready" && (
                  <button
                    onClick={onSubmit}
                    className="rounded-xl bg-emerald-300 text-neutral-900 font-bold px-4 py-2 text-sm"
                  >
                    שלח לבדיקה
                  </button>
                )}
              </div>
            </div>

            {exam.questions.map((q, idx) => {
              const chosen = answers[q.id];
              const isFinished = status === "finished";

              return (
                <div
                  key={q.id}
                  className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5"
                >
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <div
                        dir="rtl"
                        className="font-semibold mb-3 text-right leading-relaxed wrap-break-words"
                      >
                        {q.question}
                      </div>

                      <div className="grid gap-2">
                        {q.choices.map((c) => {
                          const selected = chosen === c.key;
                          const correct = q.correctKey === c.key;
                          const isFinished = status === "finished";

                          const baseStyle = selected
                            ? "bg-neutral-800 border-neutral-200"
                            : "bg-neutral-950 border-neutral-800";

                          const finishedStyle =
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
                              onClick={() => pickAnswer(q.id, c.key)}
                              className={`w-full rounded-xl border px-3 py-2 transition
                  ${finishedStyle}
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
                            <span className="text-neutral-200">
                              {q.correctKey}
                            </span>
                          </div>
                          <div className="text-neutral-300">
                            {q.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-neutral-400 font-bold">.{idx + 1}</div>
                  </div>
                </div>
              );
            })}

            {status === "finished" && (
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
                <div className="text-lg font-bold">
                  ציון: {score.correct}/{score.total}
                </div>
                <div className="text-sm text-neutral-400 mt-1">
                  טיפ: תרצה “תרגול טעויות” בשלב הבא — נייצר מבחן חדש רק על מה
                  שטעית בו.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
