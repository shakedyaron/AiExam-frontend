import { useState } from "react";
import { supabase } from "../lib/supabase";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function translateError(msg: string): string {
  if (msg.includes("Database error"))
    return "שגיאה פנימית. נסה שוב עוד כמה שניות.";
  if (
    msg.includes("already registered") ||
    msg.includes("already been registered")
  )
    return "האימייל הזה כבר רשום. נסה להתחבר.";
  if (msg.includes("Invalid login") || msg.includes("invalid_credentials"))
    return "אימייל או סיסמה שגויים.";
  if (msg.includes("Email not confirmed"))
    return "יש לאמת את כתובת האימייל דרך הקישור שנשלח אליך לפני התחברות.";
  if (msg.includes("Password should be at least"))
    return "הסיסמה חייבת להכיל לפחות 6 תווים.";
  if (msg.includes("over_email_send_rate_limit"))
    return "שלחנו יותר מדי אימיילים. נסה שוב בעוד כמה דקות.";
  return "שגיאה לא צפויה. נסה שוב.";
}

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get("type") === "signup") {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
      return "האימייל אומת בהצלחה! אפשר להתחבר עכשיו.";
    }
    return "";
  });

  const emailValid = email === "" || EMAIL_REGEX.test(email);
  const passwordValid = password === "" || password.length >= 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!EMAIL_REGEX.test(email)) {
      setError("כתובת אימייל לא תקינה.");
      return;
    }
    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים.");
      return;
    }

    setLoading(true);

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(translateError(error.message));
      else
        setSuccess(
          "שלחנו מייל אימות אם הכתובת חדשה במערכת. אם כבר יש לך חשבון — עבור להתחברות.",
        );
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(translateError(error.message));
      } else {
        if (document.activeElement instanceof HTMLElement)
          document.activeElement.blur();
        setTimeout(() => {
          window.location.href = `${window.location.origin}/home?fresh=${Date.now()}`;
        }, 150);
      }
    }

    setLoading(false);
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setSuccess("");
  }

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Orbs */}
      <div
        className="orbs-layer hidden md:block fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-40 -right-40 w-125 h-125 bg-violet-700/25 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-125 h-125 bg-purple-900/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 bg-pink-900/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Card */}
        <div className="glass rounded-3xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">
              <span className="text-white">Behan</span>
              <span className="gradient-text"> Oti</span>
            </h1>
            <p className="text-white/40 text-sm mt-2">
              {mode === "login" ? "ברוך השב 👋" : "הצטרף אלינו"}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            dir="rtl"
          >
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 tracking-wide uppercase">
                אימייל
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`glass-input w-full rounded-xl px-4 py-2.5 text-base md:text-sm ${!emailValid ? "border-red-500/50" : ""}`}
                placeholder="you@example.com"
              />
              {!emailValid && (
                <p className="text-xs text-red-400 mt-1">
                  כתובת אימייל לא תקינה
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 tracking-wide uppercase">
                סיסמה
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`glass-input w-full rounded-xl px-4 py-2.5 text-base md:text-sm ${!passwordValid ? "border-red-500/50" : ""}`}
                placeholder="לפחות 6 תווים"
              />
              {!passwordValid && (
                <p className="text-xs text-red-400 mt-1">
                  הסיסמה חייבת להכיל לפחות 6 תווים
                </p>
              )}
            </div>

            {/* Error / Success */}
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400 text-right">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-sm text-emerald-400 text-right">
                <p>{success}</p>
                {mode === "register" && (
                  <button
                    type="button"
                    onClick={switchMode}
                    className="mt-1.5 text-violet-400 font-semibold hover:text-violet-300 transition-colors underline underline-offset-2 cursor-pointer"
                  >
                    התחברות
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !emailValid || !passwordValid}
              className="btn-gradient w-full rounded-xl text-white font-bold py-3 text-sm mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  רגע...
                </span>
              ) : mode === "login" ? (
                "התחבר"
              ) : (
                "הרשם"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-white/30 mt-5 ">
            <button
              type="button"
              onClick={switchMode}
              className="text-violet-400 font-semibold hover:text-violet-300 transition-colors cursor-pointer"
            >
              {mode === "login" ? "הרשמה" : "התחברות"}
            </button>
            {mode === "login" ? " ? אין לך חשבון" : " ? כבר יש לך חשבון"}{" "}
          </p>
        </div>

        {/* Plans preview */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-center">
          <div className="glass rounded-2xl p-3">
            <div className="font-bold text-white/80 mb-1">חינם</div>
            <div className="text-white/40">3 מבחנים</div>
            <div className="text-white/40">10 שאלות</div>
          </div>
          <div
            className="glass rounded-2xl p-3 border-violet-500/30"
            style={{ borderColor: "rgba(139,92,246,0.3)" }}
          >
            <div className="font-bold text-violet-400 mb-1">Student</div>
            <div className="text-white/40">30 מבחנים</div>
            <div className="text-white/40">20 שאלות</div>
          </div>
          <div className="glass rounded-2xl p-3">
            <div className="font-bold gradient-text mb-1">Pro</div>
            <div className="text-white/40">ללא הגבלה</div>
            <div className="text-white/40">30 שאלות</div>
          </div>
        </div>
      </div>
    </div>
  );
}
