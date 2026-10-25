"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Toast = { message: string; action?: { label: string; onClick: () => void } };
type ShowToast = (message: string, action?: Toast["action"]) => void;

const ToastContext = createContext<ShowToast | null>(null);

// A toast with an action stays long enough to reach for; a newer toast always
// replaces the older one.
const PLAIN_MS = 2200;
const ACTION_MS = 8000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), toast.action ? ACTION_MS : PLAIN_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast: ShowToast = (message, action) => setToast({ message, action });

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div
          className="fixed right-6 bottom-6 z-60 flex items-center gap-4 rounded-[10px] border border-line bg-white px-4 py-3 text-[13px] text-neutral-800 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.6)] max-[680px]:right-[18px] max-[680px]:bottom-[18px] max-[680px]:left-[18px] max-[680px]:justify-center dark:border-night-line dark:bg-night-card dark:text-night-ink"
          role="status"
        >
          <span>{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              className="focus-ring -my-1 rounded-md px-2 py-1 text-[13px] font-semibold text-blue-600 hover:underline dark:text-blue-300"
              onClick={() => {
                toast.action?.onClick();
                setToast(null);
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error("useToast must be used within ToastProvider");
  return showToast;
}
