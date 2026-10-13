"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
}

interface ToastContextType {
  showToast: (title: string, message: string, type?: "success" | "error" | "info" | "warning") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (title: string, message: string, type: "success" | "error" | "info" | "warning" = "success") => {
      const id = Date.now().toString(36) + (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : "");
      setToasts((prev) => [...prev, { id, title, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Render Container matching Stitch exact visual design */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto transform transition-all duration-300 flex items-center gap-3 px-4 py-3 rounded-xl bg-charcoal-accent text-white shadow-2xl border border-slate-700/50 animate-in slide-in-from-bottom-5"
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                toast.type === "error"
                  ? "text-status-alert"
                  : toast.type === "warning"
                  ? "text-gold-light"
                  : "text-status-verified"
              }`}
            >
              {toast.type === "error"
                ? "error"
                : toast.type === "warning"
                ? "warning"
                : "check_circle"}
            </span>
            <div className="flex flex-col">
              <span className="font-headline text-[13px] font-bold text-white leading-tight">
                {toast.title}
              </span>
              <span className="text-[12px] text-slate-300 leading-tight mt-0.5">
                {toast.message}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
