
export default function FeatureChips() {
  const items = [
    "שאלות אמריקאיות + פתוחות",
    "בדיקה והסברים",
    "מותאם לקושי ולכמות",
  ];

  return (
    <div className="mt-10 space-y-3">
      {items.map((t) => (
        <div
          key={t}
          className="flex items-center justify-between rounded-full bg-white/70 px-5 py-3 shadow-sm"
          dir="rtl"
        >
          <span className="text-neutral-800 font-medium">{t}</span>
          <span className="text-purple-700 font-bold">✓</span>
        </div>
      ))}
    </div>
  );
}
