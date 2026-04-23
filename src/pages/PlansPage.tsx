import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useUser } from "../context/UserContext";
import { PLAN_LIMITS } from "../lib/planLimits";

/* ── Data ── */
const PLANS = [
  {
    key: "free" as const,
    name: "חינם",
    price: "₪0",
    period: "לתמיד",
    color: "border-white/10",
    bg: "rgba(255,255,255,0.03)",
    badgeColor: "bg-white/10 text-white/50 border-white/15",
    features: [
      `${PLAN_LIMITS.free.examsPerMonth} מבחנים לחודש`,
      `עד ${PLAN_LIMITS.free.maxQuestions} שאלות למבחן`,
      "שאלות אמריקאיות בלבד",
      "היסטוריית מבחנים",
    ],
  },
  {
    key: "student" as const,
    name: "Student",
    price: "₪29",
    period: "/ חודש",
    color: "border-violet-500/40",
    bg: "#1a1025",
    badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    features: [
      `${PLAN_LIMITS.student.examsPerMonth} מבחנים לחודש`,
      `עד ${PLAN_LIMITS.student.maxQuestions} שאלות למבחן`,
      "שאלות פתוחות + אמריקאיות",
      "היסטוריית מבחנים",
    ],
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: "₪59",
    period: "/ חודש",
    color: "border-pink-500/40",
    bg: "#1a0f18",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    highlight: true,
    features: [
      "מבחנים ללא הגבלה",
      `עד ${PLAN_LIMITS.pro.maxQuestions} שאלות למבחן`,
      "שאלות פתוחות + אמריקאיות",
      "עדיפות עיבוד",
      "תמיכה מועדפת",
    ],
  },
];

const PLAN_RANK: Record<string, number> = { free: 0, student: 1, pro: 2 };

export default function PlansPage() {
  const navigate = useNavigate();
  const { info, isLoading } = useUser();
  const currentPlan = info?.plan ?? null;

  return (
    <div className="min-h-screen bg-[#080810] text-white relative overflow-x-hidden">
      {/* Background orbs */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-60 -right-60 w-175 h-175 bg-violet-700/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -left-60 w-150 h-150 bg-purple-900/25 rounded-full blur-[120px]" />
        <div className="absolute -bottom-60 right-1/3 w-125 h-125 bg-pink-900/15 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="relative z-10 pt-20 sm:pt-24 px-4 sm:px-8 md:px-14 pb-16">
        <div dir="rtl" className="max-w-5xl mx-auto">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              בחר את המסלול שלך
            </h1>
            {/* <p className="text-white/45 text-sm sm:text-base max-w-md mx-auto">
              הפוך את הסיכומים שלך למבחנים חכמים — ותרגל עד שתהיה מוכן
            </p> */}
          </motion.div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan, i) => (
              <PlanCard
                key={plan.key}
                plan={plan}
                index={i}
                currentPlan={currentPlan}
                isLoadingUser={isLoading}
                onUpgrade={() => {
                  alert("מערכת התשלומים בקרוב! צור קשר בוואטסאפ לרכישה ידנית.");
                }}
              />
            ))}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-white/20 mt-10">
            לשאלות או רכישה ידנית — צור קשר ישירות
          </p>

          {/* Back button */}
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-white/30 text-sm hover:text-white/60 transition-colors cursor-pointer"
            >
              ← חזור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Plan card ── */
function PlanCard({
  plan,
  index,
  currentPlan,
  isLoadingUser,
  onUpgrade,
}: {
  plan: (typeof PLANS)[number];
  index: number;
  currentPlan: string | null;
  isLoadingUser: boolean;
  onUpgrade: () => void;
}) {
  const isCurrent = currentPlan === plan.key;
  const currentRank = PLAN_RANK[currentPlan ?? "free"] ?? 0;
  const planRank = PLAN_RANK[plan.key];
  const isUpgrade = planRank > currentRank;
  const isDowngrade = planRank < currentRank;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.08, duration: 0.28 }}
      className={`relative rounded-3xl border p-6 flex flex-col ${plan.color} ${
        plan.highlight ? "ring-1 ring-pink-500/20" : ""
      } ${isCurrent ? "ring-2 ring-emerald-500/40" : ""}`}
      style={{ background: plan.bg }}
    >
      {/* Current plan badge */}
      {isCurrent && (
        <div className="absolute -top-3 right-5">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            המסלול הנוכחי שלך ✓
          </span>
        </div>
      )}

      {/* Popular badge */}
      {plan.highlight && !isCurrent && (
        <div className="absolute -top-3 right-5">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300">
            הכי פופולרי ✦
          </span>
        </div>
      )}

      {/* Plan name + price */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-3xl font-extrabold text-white">
              {plan.price}
            </span>
            <span className="text-white/40 text-xs">{plan.period}</span>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${plan.badgeColor}`}
        >
          {plan.name}
        </span>
      </div>

      {/* Key metrics */}
      <div className="flex flex-col gap-2 mb-5 p-3 rounded-2xl bg-white/4 border border-white/6">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/70 font-medium">
            {plan.key === "pro" ? "∞" : PLAN_LIMITS[plan.key].examsPerMonth}
          </span>
          <span className="text-white/35">מבחנים / חודש</span>
        </div>
        <div className="h-px bg-white/6" />
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/70 font-medium">
            {PLAN_LIMITS[plan.key].maxQuestions}
          </span>
          <span className="text-white/35">שאלות מקסימום</span>
        </div>
      </div>

      {/* Feature list */}
      <ul className="space-y-2 mb-6 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-white/65">
            <span className="text-emerald-400 shrink-0 text-[11px]">✓</span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA button */}
      {isLoadingUser ? (
        <div className="h-10 rounded-xl bg-white/8 animate-pulse" />
      ) : isCurrent ? (
        <div className="w-full rounded-xl py-2.5 text-center text-sm font-bold border border-emerald-500/30 bg-emerald-500/8 text-emerald-400">
          המסלול הנוכחי שלך
        </div>
      ) : isUpgrade ? (
        <button
          type="button"
          onClick={onUpgrade}
          className={`w-full rounded-xl py-2.5 text-sm font-bold cursor-pointer transition-all
            ${
              plan.highlight
                ? "btn-gradient text-white hover:opacity-90"
                : "border border-violet-500/40 bg-violet-500/12 text-violet-300 hover:bg-violet-500/22"
            }`}
        >
          שדרג ל{plan.name}
        </button>
      ) : isDowngrade ? (
        <div className="w-full rounded-xl py-2.5 text-center text-xs text-white/25 border border-white/6">
          מסלול נמוך יותר
        </div>
      ) : (
        <button
          type="button"
          onClick={onUpgrade}
          className="w-full rounded-xl py-2.5 text-sm font-bold cursor-pointer border border-violet-500/40 bg-violet-500/12 text-violet-300 hover:bg-violet-500/22 transition-all"
        >
          בחר {plan.name}
        </button>
      )}
    </motion.div>
  );
}
