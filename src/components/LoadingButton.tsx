import React from "react";

type Props = {
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
};

export default function LoadingButton({
  loading,
  disabled,
  children,
  onClick,
  className = "",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-bold cursor-pointer
      disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {loading && (
        <span
          className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}
