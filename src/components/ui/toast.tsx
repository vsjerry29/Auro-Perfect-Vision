"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => showToast({ type: "success", title, message }),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) =>
      showToast({ type: "error", title: title || "Operation Failed", message, duration: 6000 }),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) => showToast({ type: "info", title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, info, removeToast }}>
      {children}
      {/* Toast Render View */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 transform translate-y-0 ${
              t.type === "success"
                ? "bg-white/95 border-emerald-200 text-emerald-950 shadow-emerald-900/5"
                : t.type === "error"
                ? "bg-white/95 border-red-200 text-red-950 shadow-red-900/5"
                : "bg-white/95 border-blue-200 text-blue-950 shadow-blue-900/5"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {t.type === "error" && <AlertCircle className="w-4 h-4 text-red-600" />}
              {t.type === "info" && <Info className="w-4 h-4 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              {t.title && <p className="text-xs font-semibold">{t.title}</p>}
              <p className="text-xs text-ink/80 leading-relaxed break-words">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-ink-muted hover:text-ink transition-colors p-0.5 -mr-1 -mt-1"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return safe fallback so components can call toast methods even without provider
    return {
      toasts: [],
      showToast: (t: any) => console.log("[Toast]", t),
      success: (msg: string) => console.log("[Toast Success]", msg),
      error: (msg: string) => console.error("[Toast Error]", msg),
      info: (msg: string) => console.log("[Toast Info]", msg),
      removeToast: () => {},
    };
  }
  return context;
}
