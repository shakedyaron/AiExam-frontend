import type { Exam } from "../api/examApi";

export const mockExam: Exam = {
  title: "מבחן דמו — ידע כללי",
  difficulty: "medium",
  questions: [
    {
      id: "q1",
      type: "mcq",
      question: "מהי היבשת הגדולה ביותר בעולם?",
      choices: [
        { key: "A", text: "אפריקה" },
        { key: "B", text: "אירופה" },
        { key: "C", text: "אסיה" },
        { key: "D", text: "אוסטרליה" },
      ],
      correctKey: "C",
      explanation: "אסיה היא היבשת הגדולה ביותר מבחינת שטח ואוכלוסייה.",
    },
    {
      id: "q2",
      type: "mcq",
      question: "כמה ימים יש בשנה רגילה?",
      choices: [
        { key: "A", text: "360" },
        { key: "B", text: "365" },
        { key: "C", text: "366" },
        { key: "D", text: "364" },
      ],
      correctKey: "B",
      explanation: "בשנה רגילה יש 365 ימים (ובשנה מעוברת 366).",
    },
    {
      id: "q3",
      type: "mcq",
      question: "מהו האוקיינוס הגדול ביותר בעולם?",
      choices: [
        { key: "A", text: "האוקיינוס האטלנטי" },
        { key: "B", text: "האוקיינוס ההודי" },
        { key: "C", text: "האוקיינוס הארקטי" },
        { key: "D", text: "האוקיינוס השקט" },
      ],
      correctKey: "D",
      explanation: "האוקיינוס השקט הוא הגדול ביותר בעולם.",
    },
    {
      id: "q4",
      type: "mcq",
      question: "איזו עיר היא בירת צרפת?",
      choices: [
        { key: "A", text: "ליון" },
        { key: "B", text: "פריז" },
        { key: "C", text: "מרסיי" },
        { key: "D", text: "ניס" },
      ],
      correctKey: "B",
      explanation: "פריז היא בירת צרפת.",
    },
  ],
};
