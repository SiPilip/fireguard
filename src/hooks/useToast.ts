"use client";

import { useState, useCallback } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastState {
  show: boolean;
  type: ToastType;
  message: string;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: "info",
    message: "",
  });

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ show: true, type, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const success = useCallback((message: string) => showToast("success", message), [showToast]);
  const error = useCallback((message: string) => showToast("error", message), [showToast]);
  const warning = useCallback((message: string) => showToast("warning", message), [showToast]);
  const info = useCallback((message: string) => showToast("info", message), [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };
}
