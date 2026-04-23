import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserInfo } from "../api/examApi";
import { PLAN_LIMITS } from "../lib/planLimits";

export default function UserBadge() {
  const { user, session, signOut } = useAuth();
  const [info, setInfo] = useState<{
    plan: string;
    usedThisMonth: number;
  } | null>(null);

  useEffect(() => {
    if (!session?.access_token) return;
    getUserInfo(session.access_token)
      .then(setInfo)
      .catch(() => {});
  }, [session]);

  if (!user) return null;

  const plan = (info?.plan ?? "free") as keyof typeof PLAN_LIMITS;
  const used = info?.usedThisMonth ?? 0;
  const limit = PLAN_LIMITS[plan]?.examsPerMonth ?? 3;
  const isUnlimited = limit === Infinity;

  const planColors: Record<string, string> = {
    free: "text-white/40",
    student: "text-violet-400",
    pro: "gradient-text",
  };
  const planLabels: Record<string, string> = {
    free: "חינם",
    student: "Student",
    pro: "Pro",
  };

  return (
    <div dir="rtl" className="glass rounded-2xl p-4 mt-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          onClick={signOut}
          className="text-xs text-white/20 hover:text-red-400 transition-colors cursor-pointer"
        >
          יציאה
        </button>
        <div className="text-right min-w-0">
          <div className="text-sm font-medium text-white/70 truncate">
            {user.email}
          </div>
          <div
            className={`text-xs font-semibold ${planColors[plan] ?? "text-white/40"}`}
          >
            חבילה {planLabels[plan] ?? plan}
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-white/30 mb-1">
          <span>{isUnlimited ? "∞ ללא הגבלה" : `${used}/${limit}`}</span>
          <span>מבחנים החודש</span>
        </div>
        {!isUnlimited && (
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (used / limit) * 100)}%`,
                background:
                  used >= limit
                    ? "linear-gradient(90deg, #ef4444, #f97316)"
                    : "linear-gradient(90deg, #7c3aed, #a855f7)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
