import { useState } from "react";
import { type Exam } from "./api/examApi";
import Creator from "./components/Creator";
import type { Status } from "./types/status";
import ExamView from "./components/ExamView";

export default function App() {
  const [exam, setExam] = useState<Exam | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>(
    {}
  );

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

  return (
    <div className="min-h-screen bg-linear-to-r from-gray-50 to-gray-300 text-neutral-100  ">
      <div className="flex gap-24 h-full p-10 pt-20">
        <div className="max-w-3xl w-4/12 ">
          <h1 className="text-6xl font-extrabold mb-2">
            <span className="text-gray-950">Behan</span>
            <span className="text-purple-800">Oti</span>
          </h1>

          <p className="text-neutral-700 mb-8 text-l">
            .מעלים קובץ ← יוצרים מבחן ← בודקים תשובות
          </p>

          <p
            dir="rtl"
            className="text-neutral-700 mb-8 text-right leading-relaxed max-w-md"
          >
            <span className="font-medium">
              יש לך סיכומים ואתה לא בטוח אם אתה באמת מוכן?
            </span>{" "}
            <br />
            אין צורך להכין שאלות או לנחש, אנחנו יוצרים עבורך מבחן חכם מהחומר
            שלך.
          </p>
        </div>
        <div className=" w-7/12">
          {/* Creator */}
          <Creator
            setStatus={setStatus}
            setExam={setExam}
            setAnswers={setAnswers}
            errorMsg={errorMsg}
            setErrorMsg={setErrorMsg}
            status={status}
          />
          {/* Exam */}
          {exam && status !== "idle" && (
            <ExamView
              exam={exam}
              status={status}
              answers={answers}
              onPickAnswer={pickAnswer}
              onSubmit={onSubmit}
              onReset={reset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
