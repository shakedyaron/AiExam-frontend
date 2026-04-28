import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useUser } from "../context/UserContext";
import { PLAN_LIMITS } from "../lib/planLimits";

/* ── Types ── */
type Plan = {
  key: "free" | "student" | "pro";
  name: string;
  pricePrefix: string | null;
  price: string;
  priceSub: string | null;
  period: string;
  color: string;
  ring: string;
  bg: string;
  badgeColor: string;
  topBadge: { text: string; className: string } | null;
  highlight: boolean;
  ctaLabel: string;
  orderClass: string;
  features: string[];
};

/* ── Data ── */
const PLANS: Plan[] = [
  {
    key: "free",
    name: "חינם",
    pricePrefix: null,
    price: "₪0",
    priceSub: null,
    period: "לתמיד",
    color: "border-white/10",
    ring: "",
    bg: "rgba(255,255,255,0.03)",
    badgeColor: "bg-white/10 text-white/50 border-white/15",
    topBadge: null,
    highlight: false,
    ctaLabel: "התחל בחינם",
    orderClass: "order-3 md:order-1",
    features: [
      `${PLAN_LIMITS.free.examsPerMonth} מבחנים לחודש`,
      `עד ${PLAN_LIMITS.free.maxQuestions} שאלות למבחן`,
      "שאלות אמריקאיות בלבד",
      "היסטוריית מבחנים",
    ],
  },
  {
    key: "student",
    name: "Student",
    pricePrefix: "",
    price: "₪25",
    priceSub: null,
    period: "/ חודש",
    color: "border-violet-500/50",
    ring: "ring-2 ring-violet-500/40 shadow-2xl shadow-violet-500/20",
    bg: "#1a1025",
    badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    topBadge: {
      text: "הכי פופולרי ✦",
      className: "bg-violet-500/30 border border-violet-400/60 text-violet-100",
    },
    highlight: true,
    ctaLabel: "התחל ללמוד חכם",
    orderClass: "order-1 md:order-2",
    features: [
      `${PLAN_LIMITS.student.examsPerMonth} מבחנים לחודש`,
      `עד ${PLAN_LIMITS.student.maxQuestions} שאלות למבחן`,
      "שאלות פתוחות + אמריקאיות",
      "היסטוריית מבחנים",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    pricePrefix: null,
    price: "₪49",
    priceSub: "פחות מ־₪1.7 ליום",
    period: "/ חודש",
    color: "border-pink-500/30",
    ring: "ring-1 ring-pink-500/15",
    bg: "#1a0f18",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    topBadge: {
      text: "ללומדים רציניים",
      className: "bg-pink-500/20 border border-pink-400/40 text-pink-200",
    },
    highlight: false,
    ctaLabel: "פתח את כל היכולות",
    orderClass: "order-2 md:order-3",
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
  const isProUser = currentPlan === "pro";

  return (
    <div className="min-h-screen bg-[#080810] text-white relative overflow-x-hidden">
      {/* Background orbs */}
      <div
        className="orbs-layer hidden md:block fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-60 -right-60 w-175 h-175 bg-violet-700/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -left-60 w-150 h-150 bg-purple-900/25 rounded-full blur-[120px]" />
        <div className="absolute -bottom-60 right-1/3 w-125 h-125 bg-pink-900/15 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <div className="relative z-10 pt-20 sm:pt-24 px-4 sm:px-8 md:px-14 pb-12">
        <div dir="rtl" className="max-w-5xl mx-auto">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              בחר את המסלול שלך
            </h1>
            <p className="text-white/40 text-sm sm:text-base max-w-md mx-auto">
              {isProUser
                ? "כל היכולות שלך פתוחות — המשך ללמוד ללא הגבלה"
                : "הפוך את הסיכומים שלך למבחנים חכמים"}
            </p>
          </motion.div>

          {/* Plan cards — items-stretch (default) keeps all cards equal height */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {PLANS.map((plan, i) => (
              <PlanCard
                key={plan.key}
                plan={plan}
                index={i}
                currentPlan={currentPlan}
                isProUser={isProUser}
                isLoadingUser={isLoading}
                onUpgrade={() => {
                  alert(
                    "מערכת התשלומים בקרוב!\nצור קשר במייל לרכישה ידנית:\nbehanoti@gmail.com",
                  );
                }}
              />
            ))}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-white/40 mt-8">
            לשאלות או רכישה ידנית — צור קשר ישירות במייל:{" "}
            <span className="text-violet-400/80 font-medium">behanoti@gmail.com</span>
          </p>

          {/* Back button */}
          <div className="flex justify-center mt-5">
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
  isProUser,
  isLoadingUser,
  onUpgrade,
}: {
  plan: Plan;
  index: number;
  currentPlan: string | null;
  isProUser: boolean;
  isLoadingUser: boolean;
  onUpgrade: () => void;
}) {
  const isCurrent = currentPlan === plan.key;
  const currentRank = PLAN_RANK[currentPlan ?? "free"] ?? 0;
  const planRank = PLAN_RANK[plan.key];
  const isUpgrade = planRank > currentRank;
  const isDowngrade = planRank < currentRank;

  // Student loses its spotlight treatment when the user is already on Pro
  const scaleClass =
    plan.highlight && !isCurrent && !isProUser ? "md:scale-[1.02] md:z-10" : "";

  // Pro card gets a stronger pink ring when it is the current plan
  const currentRing = isCurrent
    ? plan.key === "pro"
      ? "ring-2 ring-pink-500/50 shadow-2xl shadow-pink-500/20"
      : "ring-2 ring-emerald-500/40"
    : "";

  // Context-aware top badge: suppress Student's "הכי פופולרי" for Pro users
  const displayBadge: Plan["topBadge"] = (() => {
    if (isCurrent) return null;
    if (isProUser && plan.key === "student")
      return { text: "לסטודנטים", className: "bg-white/8 border border-white/12 text-white/35" };
    if (isProUser && plan.key === "free") return null;
    return plan.topBadge;
  })();

  // Downgrade CTA labels for Pro users
  const activeCta = (() => {
    if (isProUser && plan.key === "student") return "שנמך ל-Student";
    if (isProUser && plan.key === "free") return "מעבר לחינם";
    return plan.ctaLabel;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.08, duration: 0.28 }}
      className={`relative rounded-3xl border p-5 sm:p-6 flex flex-col ${plan.color} ${plan.ring} ${plan.orderClass} ${scaleClass} ${currentRing}`}
      style={{ background: plan.bg }}
    >
      {/* Current plan badge */}
      {isCurrent && (
        <div className="absolute -top-3 right-5">
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
            plan.key === "pro"
              ? "bg-pink-500/20 border border-pink-400/50 text-pink-200"
              : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
          }`}>
            {plan.key === "pro" ? "כל היכולות פתוחות ✓" : "המסלול הנוכחי שלך ✓"}
          </span>
        </div>
      )}

      {/* Top badge (popular / premium / contextual) */}
      {displayBadge && (
        <div className="absolute -top-3 right-5">
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${displayBadge.className}`}>
            {displayBadge.text}
          </span>
        </div>
      )}

      {/* Plan name + price */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-baseline gap-1 mt-1">
            {plan.pricePrefix && (
              <span className="text-xs font-semibold text-violet-300/80">
                {plan.pricePrefix}
              </span>
            )}
            <span className="text-3xl font-extrabold text-white">
              {plan.price}
            </span>
            <span className="text-white/40 text-xs">{plan.period}</span>
          </div>
          {plan.priceSub && (
            <p className="text-[11px] text-pink-300/60 mt-0.5">{plan.priceSub}</p>
          )}
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${plan.badgeColor}`}
        >
          {plan.name}
        </span>
      </div>

      {/* Key metrics */}
      <div className="flex flex-col gap-2 mb-4 p-3 rounded-2xl bg-white/4 border border-white/6">
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

      {/* Feature list — flex-1 pushes CTA to bottom across equal-height cards */}
      <ul className="space-y-2 mb-5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-white/65">
            <span className="text-emerald-400 shrink-0 text-[11px]">✓</span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA button — uniform height py-3 across all states */}
      {isLoadingUser ? (
        <div className="h-11.5 rounded-xl bg-white/8 animate-pulse" />
      ) : isCurrent ? (
        <div className={`w-full rounded-xl py-3 text-center text-sm font-bold border ${
          plan.key === "pro"
            ? "border-pink-500/30 bg-pink-500/8 text-pink-300"
            : "border-emerald-500/30 bg-emerald-500/8 text-emerald-400"
        }`}>
          {plan.key === "pro" ? "המסלול שלך ✓" : "המסלול הנוכחי שלך"}
        </div>
      ) : isUpgrade ? (
        <button
          type="button"
          onClick={onUpgrade}
          className={`w-full rounded-xl py-3 text-sm font-bold cursor-pointer transition-all ${
            plan.highlight
              ? "btn-gradient text-white hover:opacity-90"
              : plan.key === "pro"
                ? "bg-linear-to-r from-pink-600/80 to-rose-500/80 text-white hover:opacity-90"
                : "border border-violet-500/40 bg-violet-500/12 text-violet-300 hover:bg-violet-500/22"
          }`}
        >
          {activeCta}
        </button>
      ) : isDowngrade ? (
        <button
          type="button"
          onClick={onUpgrade}
          className="w-full rounded-xl py-3 text-sm font-medium cursor-pointer border border-white/10 text-white/30 hover:text-white/50 hover:border-white/20 transition-all"
        >
          {activeCta}
        </button>
      ) : (
        <button
          type="button"
          onClick={onUpgrade}
          className={`w-full rounded-xl py-3 text-sm font-bold cursor-pointer transition-all ${
            plan.highlight
              ? "btn-gradient text-white hover:opacity-90"
              : "border border-violet-500/40 bg-violet-500/12 text-violet-300 hover:bg-violet-500/22"
          }`}
        >
          {activeCta}
        </button>
      )}
    </motion.div>
  );
}
