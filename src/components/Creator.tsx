import React, { useMemo, useState } from "react";
import { generateExam, type Difficulty, type Exam } from "../api/examApi";
import type { Status } from "../types/status";

type Props = {
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  setExam: React.Dispatch<React.SetStateAction<Exam | null>>;
  setAnswers: React.Dispatch<
    React.SetStateAction<Record<string, "A" | "B" | "C" | "D">>
  >;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
  errorMsg: string;
  status: Status;
};

function Creator({
  setStatus,
  setExam,
  setAnswers,
  setErrorMsg,
  errorMsg,
  status,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

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
    } catch (err: unknown) {
      const e = err as { error?: string; details?: { message?: string } };
      if (e?.error === "NotEnoughContent") {
        setErrorMsg(e.details?.message ?? "המסמך קצר מדי...");
      } else if (e?.error === "ValidationError") {
        setErrorMsg("הגדרות לא תקינות...");
      } else {
        setErrorMsg(e?.error ?? "שגיאה לא צפויה.");
      }
      setStatus("error");
    }
  }

  return (
    <div className="bg-white border  shadow-xl/30 rounded-2xl p-5 mb-7">
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
  );
}

export default Creator;
