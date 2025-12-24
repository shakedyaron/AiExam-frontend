import React from "react";

type Props = {
  file: File;
  onClear: () => void;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export default function FilePreview({ file, onClear }: Props) {
  const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";

  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
          {ext}
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold text-neutral-800">
            {file.name}
          </div>
          <div className="text-xs text-neutral-500">
            {formatBytes(file.size)}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="text-sm font-semibold text-neutral-600 hover:text-neutral-900"
      >
        הסר
      </button>
    </div>
  );
}
