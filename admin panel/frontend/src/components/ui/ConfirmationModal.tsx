"use client";

import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm Action",
  confirmText,
  cancelLabel = "Cancel",
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const finalConfirmText = confirmText || confirmLabel;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-accent/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-card rounded-2xl border border-border-clean shadow-2xl max-w-md w-full p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDestructive
                ? "bg-status-alert-bg text-status-alert"
                : "bg-gold-subtle text-secondary"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isDestructive ? "delete_forever" : "warning"}
            </span>
          </div>
          <div>
            <h3 className="font-headline text-[16px] font-bold text-charcoal-accent">
              {title}
            </h3>
            <p className="text-[13px] text-outline mt-0.5">Please confirm your decision</p>
          </div>
        </div>

        <p className="text-[14px] text-on-surface-variant leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-clean">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-border-clean bg-surface-card text-on-surface font-headline text-[13px] font-semibold hover:bg-surface-subtle transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-white font-headline text-[13px] font-bold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 ${
              isDestructive
                ? "bg-status-alert hover:bg-red-700"
                : "bg-charcoal-accent hover:bg-slate-800"
            }`}
          >
            {isLoading && (
              <span className="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
            )}
            <span>{finalConfirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
