export type Difficulty = "easy" | "medium" | "hard";

export type MCQQuestion = {
  id: string;
  type: "mcq";
  question: string;
  choices: { key: "A" | "B" | "C" | "D"; text: string }[];
  correctKey: "A" | "B" | "C" | "D";
  explanation: string;
};

export type OpenQuestion = {
  id: string;
  type: "open";
  question: string;
  keyPoints: string[];
  modelAnswer: string;
};

export type Question = MCQQuestion | OpenQuestion;

export type Exam = {
  examId: string | null;
  title: string;
  difficulty: Difficulty;
  questions: Question[];
};

export type HistoryItem = {
  id: string;
  title: string;
  difficulty: Difficulty;
  score: { correct: number; total: number; mcqAnswers?: Record<string, string> } | null;
  created_at: string;
};

export type ExamDetail = {
  id: string;
  title: string;
  difficulty: Difficulty;
  score: { correct: number; total: number; mcqAnswers?: Record<string, string> } | null;
  questions: Question[];
  created_at: string;
};

type ApiError =
  | { error: "NotEnoughContent"; details?: any }
  | { error: "ValidationError"; details?: any }
  | { error: "PlanLimitExceeded"; details?: any }
  | { error: "NoMistakes"; details?: any }
  | { error: string; details?: any };

const base = import.meta.env.VITE_API_BASE as string;

export async function generateExam(params: {
  files: File[];
  numQuestions: number;
  difficulty: Difficulty;
  includeOpen: boolean;
  token: string;
}): Promise<Exam> {
  const form = new FormData();
  for (const file of params.files) form.append("files", file);
  form.append("numQuestions", String(params.numQuestions));
  form.append("difficulty", params.difficulty);
  form.append("includeOpen", String(params.includeOpen));

  const res = await fetch(`${base}/api/exam/generate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${params.token}` },
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data as ApiError;
  return data as Exam;
}

export async function generateDemoExam(params: {
  numQuestions: number;
  difficulty: Difficulty;
  includeOpen: boolean;
}): Promise<Exam> {
  const res = await fetch(`${base}/api/exam/generate-demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data as ApiError;
  return { ...data, examId: null } as Exam;
}

export async function saveScore(
  examId: string,
  score: { correct: number; total: number },
  mcqAnswers: Record<string, string>,
  token: string
): Promise<void> {
  await fetch(`${base}/api/exam/exams/${examId}/score`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ score, mcqAnswers }),
  });
}

export async function getExamHistory(token: string): Promise<HistoryItem[]> {
  const res = await fetch(`${base}/api/exam/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getExamDetail(examId: string, token: string): Promise<ExamDetail | null> {
  const res = await fetch(`${base}/api/exam/exams/${examId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function generateFromMistakes(params: {
  examId: string;
  numQuestions: number;
  token: string;
}): Promise<Exam & { fallback?: boolean }> {
  const res = await fetch(`${base}/api/exam/exams/${params.examId}/generate-from-mistakes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${params.token}` },
    body: JSON.stringify({ numQuestions: params.numQuestions }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data as ApiError;
  return data as Exam & { fallback?: boolean };
}

export async function getUserInfo(token: string): Promise<{ plan: string; usedThisMonth: number }> {
  const res = await fetch(`${base}/api/exam/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { plan: "free", usedThisMonth: 0 };
  return res.json();
}

export async function evaluateAnswer(params: {
  question: string;
  keyPoints: string[];
  modelAnswer: string;
  userAnswer: string;
  token: string;
}): Promise<{ score: number; feedback: string }> {
  const res = await fetch(`${base}/api/exam/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${params.token}` },
    body: JSON.stringify({
      question: params.question,
      keyPoints: params.keyPoints,
      modelAnswer: params.modelAnswer,
      userAnswer: params.userAnswer,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}
