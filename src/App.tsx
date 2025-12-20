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
    <div className="min-h-screen bg-gray-600 text-neutral-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold mb-2">AI Exam</h1>
        <p className="text-neutral-400 mb-8">
          מעלים קובץ → יוצרים מבחן → בודקים תשובות.
        </p>

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
  );
}
