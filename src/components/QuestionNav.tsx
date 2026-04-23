import type { Exam } from "../api/examApi";
import type { Status } from "../types/status";

type AnswerKey = "A" | "B" | "C" | "D";
type Evaluation = { score: number; feedback: string; loading?: boolean };

type Props = {
  exam: Exam;
  status: Status;
  mcqAnswers: Record<string, AnswerKey>;
  openAnswers: Record<string, string>;
  evaluations: Record<string, Evaluation>;
  onJump: (qId: string) => void;
};

export default function QuestionNav({ exam, status, mcqAnswers, openAnswers, evaluations, onJump }: Props) {
  const isFinished = status === "finished";

  return (
    <div dir="rtl" className="flex flex-wrap gap-1.5">
      {exam.questions.map((q, idx) => {
        let style = "border-white/10 bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60";

        if (q.type === "mcq") {
          const chosen = mcqAnswers[q.id];
          const hasAnswer = !!chosen;
          const isCorrect = isFinished && chosen === q.correctKey;
          const isWrong = isFinished && hasAnswer && chosen !== q.correctKey;

          if (isCorrect) style = "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
          else if (isWrong) style = "border-red-500/40 bg-red-500/10 text-red-400";
          else if (hasAnswer) style = "border-violet-500/40 bg-violet-500/10 text-violet-400";
        } else {
          const hasText = !!openAnswers[q.id]?.trim();
          const ev = evaluations[q.id];
          const hasEval = ev && !ev.loading;

          if (hasEval) {
            if (ev.score >= 70) style = "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
            else if (ev.score >= 50) style = "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
            else style = "border-red-500/40 bg-red-500/10 text-red-400";
          } else if (hasText) {
            style = "border-violet-500/40 bg-violet-500/10 text-violet-400";
          }
        }

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onJump(q.id)}
            className={`h-7 w-7 rounded-full text-xs font-bold border transition-all cursor-pointer ${style}`}
            title={q.type === "open" ? "שאלה פתוחה" : ""}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
}
