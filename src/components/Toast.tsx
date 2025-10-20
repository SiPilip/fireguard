"use client";

import { useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    bg: "bg-green-50",
    border: "border-green-500",
    text: "text-green-800",
    icon: FaCheckCircle,
    iconColor: "text-green-500",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-500",
    text: "text-red-800",
    icon: FaTimesCircle,
    iconColor: "text-red-500",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-500",
    text: "text-yellow-800",
    icon: FaExclamationCircle,
    iconColor: "text-yellow-500",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-500",
    text: "text-blue-800",
    icon: FaInfoCircle,
    iconColor: "text-blue-500",
  },
};

export default function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] min-w-[320px] max-w-md ${config.bg} ${config.border} border-l-4 rounded-lg shadow-lg p-4 animate-slide-in-right`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`${config.iconColor} flex-shrink-0 mt-0.5`} size={20} />
        <div className="flex-1">
          <p className={`${config.text} font-medium text-sm leading-relaxed`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`${config.text} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <FaTimesCircle size={18} />
        </button>
      </div>
    </div>
  );
}
