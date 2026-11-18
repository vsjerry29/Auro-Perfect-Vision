"use client";

import React from "react";
import { Dialog } from "./dialog";
import { Button } from "./button";
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from "lucide-react";

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  extraContent?: React.ReactNode;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  extraContent,
}: ConfirmModalProps) {
  const iconMap = {
    danger: <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />,
    info: <Info className="w-6 h-6 text-plum shrink-0" />,
  };

  const buttonVariantMap = {
    danger: "danger" as const,
    warning: "primary" as const,
    info: "primary" as const,
  };

  return (
    <Dialog open={open} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-4 pt-2">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-canvas-light border border-ink-border/70">
          {iconMap[variant]}
          <div className="text-xs text-ink leading-relaxed flex-1">
            {typeof description === "string" ? <p>{description}</p> : description}
          </div>
        </div>

        {extraContent && <div className="pt-2">{extraContent}</div>}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={onClose}
            className="text-xs font-semibold"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={buttonVariantMap[variant]}
            size="sm"
            disabled={isLoading}
            onClick={onConfirm}
            className={`text-xs font-semibold ${
              variant === "danger"
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-brand-purple hover:bg-brand-purpleHover text-white"
            }`}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
