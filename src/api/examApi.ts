export type Difficulty = "easy" | "medium" | "hard";

export type Exam = {
  title: string;
  difficulty: Difficulty;
  questions: {
    id: string;
    type: "mcq";
    question: string;
    choices: { key: "A" | "B" | "C" | "D"; text: string }[];
    correctKey: "A" | "B" | "C" | "D";
    explanation: string;
  }[];
};

type ApiError =
  | { error: "NotEnoughContent"; details?: any }
  | { error: "ValidationError"; details?: any }
  | { error: string; details?: any };

export async function generateExam(params: {
  file: File;
  numQuestions: number;
  difficulty: Difficulty;
}): Promise<Exam> {
  const base = import.meta.env.VITE_API_BASE as string;

  const form = new FormData();
  form.append("file", params.file);
  form.append("numQuestions", String(params.numQuestions));
  form.append("difficulty", params.difficulty);

  const res = await fetch(`${base}/api/exam/generate`, {
    method: "POST",
    body: form
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = data as ApiError;
    throw err;
  }

  return data as Exam;
}



export async function generateDemoExam(params: {
  numQuestions: number;
  difficulty: Difficulty;
}): Promise<Exam> {
  const base = import.meta.env.VITE_API_BASE as string;

  const res = await fetch(`${base}/api/exam/generate-demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      numQuestions: params.numQuestions,
      difficulty: params.difficulty,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw data as ApiError;

  return data as Exam;
}
