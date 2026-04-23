type Props = {
  file: File;
  onClear: () => void;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export default function FilePreview({ file, onClear }: Props) {
  const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";

  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 flex items-center justify-center text-xs font-bold">
          {ext}
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-white/80 truncate max-w-45">{file.name}</div>
          <div className="text-xs text-white/30">{formatBytes(file.size)}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="text-white/20 hover:text-red-400 transition-colors text-lg leading-none cursor-pointer"
      >
        ×
      </button>
    </div>
  );
}
