import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { PLAN_LIMITS } from "../lib/planLimits";

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const page = pathname.startsWith("/history")
    ? "history"
    : pathname.startsWith("/plans")
      ? "plans"
      : "home";
  const { user, signOut } = useAuth();
  const { info } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const infoLoaded = info !== null;
  const plan = (info?.plan ?? "free") as keyof typeof PLAN_LIMITS;
  const used = info?.usedThisMonth ?? 0;
  const limit = PLAN_LIMITS[plan]?.examsPerMonth ?? 3;
  const isUnlimited = limit === Infinity;
  const planLabel: Record<string, string> = {
    free: "חינם",
    student: "Student",
    pro: "Pro",
  };
  const planColor: Record<string, string> = {
    free: "text-white/40",
    student: "text-violet-400",
    pro: "gradient-text",
  };
  const initial = user?.email?.charAt(0).toUpperCase() ?? "?";

  function openUpgrade() {
    setMenuOpen(false);
    navigate("/plans");
  }

  return (
    <>
      <nav
        dir="rtl"
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 sm:px-8 border-b border-white/6"
        style={{ background: "rgba(8,8,16,0.97)" }}
      >
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="font-bold text-xl select-none cursor-pointer hover:opacity-80 transition-opacity shrink-0"
        >
          <span className="text-white">Behan</span>
          <span className="gradient-text"> Oti</span>
        </button>

        {/* Center nav pills */}
        <div className="flex-1 flex justify-center">
          <div
            className="hidden sm:flex items-center gap-1 p-1 rounded-2xl border border-white/8"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <NavPill onClick={() => navigate("/home")} active={page === "home"}>
              <span className="text-[13px]">⌂</span>
              <span>מסך בית</span>
            </NavPill>
            <NavPill onClick={() => navigate("/history")} active={page === "history"}>
              <span className="text-[13px]">◫</span>
              <span>היסטוריה</span>
            </NavPill>
            <NavPill onClick={() => navigate("/plans")} active={page === "plans"}>
              <span className="text-[13px]">✦</span>
              <span>מנויים</span>
            </NavPill>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Upgrade */}
          {infoLoaded && plan !== "pro" && (
            <button
              type="button"
              onClick={openUpgrade}
              className="btn-gradient rounded-xl px-3.5 py-1.5 text-xs font-bold text-white hidden sm:flex items-center gap-1.5 cursor-pointer"
            >
              ✦ שדרג
            </button>
          )}

          {/* Avatar */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="h-9 w-9 rounded-full border border-violet-500/40 bg-violet-500/15 text-violet-300 text-sm font-bold flex items-center justify-center cursor-pointer hover:bg-violet-500/25 transition-all"
            >
              {initial}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  {/* Mobile */}
                  <motion.div
                    key="mob"
                    dir="rtl"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="sm:hidden fixed top-14 left-0 right-0 border-b border-white/8 p-4 z-40"
                    style={{ background: "#0d0d1a" }}
                  >
                    <MenuContent
                      {...{
                        user,
                        plan,
                        infoLoaded,
                        planLabel,
                        planColor,
                        used,
                        limit,
                        isUnlimited,
                        page,
                      }}
                      onUpgrade={openUpgrade}
                      onOpenHistory={() => { setMenuOpen(false); navigate("/history"); }}
                      onGoHome={() => { setMenuOpen(false); navigate("/home"); }}
                      onLogout={() => { signOut(); setMenuOpen(false); }}
                      onClose={() => setMenuOpen(false)}
                    />
                  </motion.div>

                  {/* Desktop */}
                  <motion.div
                    key="desk"
                    dir="rtl"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    className="hidden sm:block absolute left-0 top-full mt-2 w-64 rounded-2xl border border-white/10 p-4 shadow-2xl z-40"
                    style={{ background: "#0d0d1a" }}
                  >
                    <MenuContent
                      {...{
                        user,
                        plan,
                        infoLoaded,
                        planLabel,
                        planColor,
                        used,
                        limit,
                        isUnlimited,
                        page,
                      }}
                      onUpgrade={openUpgrade}
                      onOpenHistory={() => { setMenuOpen(false); navigate("/history"); }}
                      onGoHome={() => { setMenuOpen(false); navigate("/home"); }}
                      onLogout={() => { signOut(); setMenuOpen(false); }}
                      onClose={() => setMenuOpen(false)}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

    </>
  );
}

/* ── Segmented control pill ── */
function NavPill({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer
        ${active ? "text-white" : "text-white/35 hover:text-white/65"}`}
    >
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 rounded-xl border border-violet-500/30"
          style={{
            background:
              "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(168,85,247,0.12))",
          }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {children}
      </span>
    </button>
  );
}

/* ── Dropdown content ── */
function MenuContent({
  user,
  plan,
  infoLoaded,
  planLabel,
  planColor,
  used,
  limit,
  isUnlimited,
  page,
  onUpgrade,
  onOpenHistory,
  onGoHome,
  onLogout,
  onClose,
}: {
  user: { email?: string } | null;
  plan: string;
  infoLoaded: boolean;
  planLabel: Record<string, string>;
  planColor: Record<string, string>;
  used: number;
  limit: number;
  isUnlimited: boolean;
  page: "home" | "history" | "plans";
  onUpgrade: () => void;
  onOpenHistory: () => void;
  onGoHome: () => void;
  onLogout: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex items-start justify-between mb-3 pb-3 border-b border-white/8">
        <div className="min-w-0">
          <div className="text-sm font-medium text-white/80 truncate">
            {user?.email}
          </div>
          {infoLoaded ? (
            <div className={`text-xs font-semibold mt-0.5 ${planColor[plan]}`}>
              חבילה {planLabel[plan] ?? plan}
            </div>
          ) : (
            <div className="mt-1 h-3 w-16 rounded-full bg-white/10 animate-pulse" />
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/25 hover:text-white/60 transition-colors cursor-pointer text-base leading-none shrink-0 mr-1 mt-0.5"
        >
          ✕
        </button>
      </div>

      <div className="mb-3 pb-3 border-b border-white/8">
        {infoLoaded ? (
          <>
            <div className="flex justify-between text-xs text-white/40 mb-1.5">
              <span>{isUnlimited ? "∞" : `${used}/${limit}`}</span>
              <span>מבחנים החודש</span>
            </div>
            {!isUnlimited && (
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (used / limit) * 100)}%`,
                    background:
                      used >= limit
                        ? "linear-gradient(90deg,#ef4444,#f97316)"
                        : "linear-gradient(90deg,#7c3aed,#a855f7)",
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="space-y-1.5">
            <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse ml-auto" />
            <div className="h-1.5 rounded-full bg-white/10 animate-pulse" />
          </div>
        )}
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden mb-3 pb-3 border-b border-white/8 grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={onGoHome}
          className={`rounded-xl py-2 text-xs font-medium transition-all cursor-pointer border
            ${page === "home" ? "border-violet-500/40 bg-violet-500/15 text-violet-300" : "border-white/8 bg-white/3 text-white/50 hover:text-white/80"}`}
        >
          ⌂ מסך בית
        </button>
        <button
          type="button"
          onClick={onOpenHistory}
          className={`rounded-xl py-2 text-xs font-medium transition-all cursor-pointer border
            ${page === "history" ? "border-violet-500/40 bg-violet-500/15 text-violet-300" : "border-white/8 bg-white/3 text-white/50 hover:text-white/80"}`}
        >
          ◫ היסטוריה
        </button>
        <button
          type="button"
          onClick={onUpgrade}
          className={`rounded-xl py-2 text-xs font-medium transition-all cursor-pointer border
            ${page === "plans" ? "border-violet-500/40 bg-violet-500/15 text-violet-300" : "border-white/8 bg-white/3 text-white/50 hover:text-white/80"}`}
        >
          ✦ מנויים
        </button>
      </div>

      {infoLoaded && plan !== "pro" && (
        <>
          <button
            type="button"
            onClick={onUpgrade}
            className="sm:hidden btn-gradient w-full rounded-xl py-2 text-xs font-bold text-white mb-3 cursor-pointer flex items-center justify-center gap-1.5"
          >
            ✦ שדרג לPro
          </button>
          <div className="mb-3 pb-3 border-b border-white/8 grid grid-cols-3 gap-1.5 text-center text-xs">
            {(["free", "student", "pro"] as const).map((p) => (
              <div
                key={p}
                className={`rounded-xl p-2 border ${p === plan ? "border-violet-500/40 bg-violet-500/10" : "border-white/5 bg-white/3"}`}
              >
                <div className={`font-bold ${planColor[p]}`}>
                  {planLabel[p]}
                </div>
                <div className="text-white/30 text-[10px] mt-0.5">
                  {PLAN_LIMITS[p].examsPerMonth === Infinity
                    ? "∞"
                    : PLAN_LIMITS[p].examsPerMonth}{" "}
                  מבחנים
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onLogout}
        className="w-full text-right text-sm text-red-400/60 hover:text-red-400 transition-colors cursor-pointer py-1"
      >
        התנתק ←
      </button>
    </>
  );
}
