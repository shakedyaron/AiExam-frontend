import React, { useMemo, useRef, useState } from "react";
import { generateExam, type Difficulty, type Exam } from "../api/examApi";
import type { Status } from "../types/status";
import FloatBox from "../motion/FloatBox";
import FilePreview from "./FilePreview";
import LoadingButton from "./LoadingButton";
import { generateDemoExam } from "../api/examApi";

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

export default function Creator({
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0); // ✅ reset hard

  const canGenerate = useMemo(
    () => !!file && status !== "loading",
    [file, status]
  );

  function clearFile() {
    setFile(null);
    setStatus("idle");
    setErrorMsg("");
    setExam(null);
    setAnswers({});

    // ✅ reset input value + remount input
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFileInputKey((k) => k + 1);
  }

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

  async function onGenerateDemo() {
    setStatus("loading");
    setErrorMsg("");
    setExam(null);
    setAnswers({});
    setFile(null);

    try {
      const ex = await generateDemoExam({ numQuestions, difficulty });
      setExam(ex);
      setStatus("ready");
    } catch (err: unknown) {
      const e = err as { error?: string; details?: { message?: string } };
      setErrorMsg(e?.details?.message ?? e?.error ?? "שגיאה לא צפויה.");
      setStatus("error");
    }
  }

  return (
    <FloatBox className="bg-white border shadow-lg/20 rounded-2xl p-6 mt-6 w-10/12 overflow-hidden">
      <div className="flex flex-col gap-6">
        {/* File */}
        <div>
          <label className="block text-sm text-neutral-500 mb-2 font-medium">
            קובץ (PDF / DOCX)
          </label>

          <input
            key={fileInputKey}
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            // ✅ מאפשר לבחור שוב אותו קובץ
            onClick={(e) => {
              (e.currentTarget as HTMLInputElement).value = "";
            }}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-neutral-200 file:text-neutral-900 file:px-4 file:py-2 file:font-semibold"
          />

          {file && <FilePreview file={file} onClear={clearFile} />}
        </div>

        {/* Controls */}
        <div className="flex gap-6 justify-center">
          <div className="w-2/5">
            <label className="block text-sm text-neutral-500 mb-2 font-medium">
              מספר שאלות
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-white"
            />
          </div>

          <div className="w-2/5">
            <label className="block text-sm text-neutral-500 mb-2 font-medium">
              רמת קושי
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-white"
            >
              <option value="easy">קל</option>
              <option value="medium">בינוני</option>
              <option value="hard">קשה</option>
            </select>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center flex-col gap-3">
          <LoadingButton
            loading={status === "loading"}
            disabled={!canGenerate}
            onClick={onGenerate}
            className="w-2/6 shadow-xl/30 bg-linear-to-r from-purple-800 via-purple-600 to-purple-500 text-white"
          >
            {status === "loading" ? "מייצר מבחן..." : "צור מבחן"}
          </LoadingButton>

          <button
            type="button"
            onClick={onGenerateDemo}
            disabled={status === "loading"}
            className="text-purple-600 text-sm font-medium inline-flex items-center gap-1 group disabled:opacity-50"
          >
            נסה דוגמה (בלי קובץ)
            <span className="transition-transform group-hover:-translate-x-1">
              »
            </span>
          </button>
        </div>

        {/* Error */}
        {status === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}
      </div>
    </FloatBox>
  );
}
