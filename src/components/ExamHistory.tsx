import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getExamHistory, type HistoryItem } from "../api/examApi";

const difficultyLabel: Record<string, string> = { easy: "קל", medium: "בינוני", hard: "קשה" };

export default function ExamHistory() {
  const { session } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!session?.access_token) return;
    setLoading(true);
    getExamHistory(session.access_token)
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <div dir="rtl" className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-xs font-medium text-white/30 hover:text-white/60 transition-colors cursor-pointer py-2"
      >
        <span className="text-white/20">{open ? "▲" : "▼"}</span>
        <span>היסטוריית מבחנים</span>
      </button>

      {open && (
        <div className="mt-2 space-y-2 max-h-56 overflow-y-auto custom-scroll">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 rounded-full border-2 border-violet-500/40 border-t-violet-500 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-xs text-white/20 text-center py-4">אין מבחנים עדיין</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="glass rounded-xl px-3 py-2.5">
                <div className="font-medium text-white/70 text-xs truncate">{item.title}</div>
                <div className="flex items-center justify-between mt-1 text-xs text-white/30">
                  <span>{new Date(item.created_at).toLocaleDateString("he-IL")}</span>
                  <div className="flex gap-2 items-center">
                    <span>{difficultyLabel[item.difficulty] ?? item.difficulty}</span>
                    {item.score && (
                      <span className="text-emerald-400 font-semibold">
                        {item.score.correct}/{item.score.total}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
