import { motion } from "framer-motion";

type Props = { onClose: () => void };

const PLANS = [
  {
    key: "student",
    name: "Student",
    price: "₪29",
    period: "/ חודש",
    color: "border-violet-500/50",
    bg: "#1a1025",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    highlight: false,
    features: [
      "30 מבחנים בחודש",
      "עד 20 שאלות",
      "שאלות פתוחות + AI",
      "היסטוריית מבחנים",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "₪59",
    period: "/ חודש",
    color: "border-pink-500/50",
    bg: "#1a0f18",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    features: [
      "מבחנים ללא הגבלה",
      "עד 30 שאלות",
      "שאלות פתוחות + AI",
      "עדיפות עיבוד",
      "תמיכה מועדפת",
    ],
    highlight: true,
  },
] as const;

export default function UpgradeModal({ onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="rounded-3xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scroll border border-white/10"
        style={{ background: "#0d0d1a" }}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">שדרג את החבילה שלך</h2>
            <p className="text-white/40 text-sm mt-1">
              קבל גישה מלאה לכל הכלים
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/30 hover:text-white/70 text-lg leading-none cursor-pointer transition-colors mt-0.5"
          >
            ✕
          </button>
        </div>

        {/* Plans */}
        <div className="flex flex-col gap-4 mb-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.22 }}
              className={`rounded-2xl border p-4 ${plan.color} ${plan.highlight ? "ring-1 ring-pink-500/30" : ""}`}
              style={{ background: plan.bg }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-white/50 text-xs">{plan.period}</span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${plan.badge}`}
                >
                  {plan.name}
                  {plan.highlight && " ✦"}
                </span>
              </div>
              <ul className="space-y-1.5 mb-4">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="text-xs text-white/70 flex items-center gap-2"
                  >
                    <span className="text-emerald-400 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all cursor-pointer
                  ${
                    plan.highlight
                      ? "btn-gradient text-white"
                      : "border border-violet-500/40 bg-violet-500/15 text-violet-300 hover:bg-violet-500/25"
                  }`}
                onClick={() => {
                  alert(
                    "מערכת התשלומים בקרוב! צור קשר ב-WhatsApp לרכישה ידנית.",
                  );
                }}
              >
                בחר {plan.name}
              </button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-white/20">
          לרכישה או שאלות — צור קשר ישירות
        </p>
      </motion.div>
    </motion.div>
  );
}
