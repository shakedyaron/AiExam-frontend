export const PLAN_LIMITS = {
  free:    { examsPerMonth: 3,        maxQuestions: 10, allowOpenQuestions: false },
  student: { examsPerMonth: 30,       maxQuestions: 30, allowOpenQuestions: true  },
  pro:     { examsPerMonth: Infinity, maxQuestions: 45, allowOpenQuestions: true  },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;
