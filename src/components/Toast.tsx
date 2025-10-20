"use client";

import { useEffect, useState } from "react";
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
    bg: "bg-green-900",
    border: "border-green-500",
    text: "text-green-100",
    icon: FaCheckCircle,
    iconColor: "text-green-400",
  },
  error: {
    bg: "bg-red-900",
    border: "border-red-500",
    text: "text-red-100",
    icon: FaTimesCircle,
    iconColor: "text-red-400",
  },
  warning: {
    bg: "bg-yellow-900",
    border: "border-yellow-500",
    text: "text-yellow-100",
    icon: FaExclamationCircle,
    iconColor: "text-yellow-400",
  },
  info: {
    bg: "bg-blue-900",
    border: "border-blue-500",
    text: "text-blue-100",
    icon: FaInfoCircle,
    iconColor: "text-blue-400",
  },
};

export default function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // Animate progress bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 50));
        return newProgress > 0 ? newProgress : 0;
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] min-w-[320px] max-w-md ${config.bg} ${config.border} border-l-4 rounded-lg shadow-2xl overflow-hidden animate-slide-in-right`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={`${config.iconColor} flex-shrink-0 mt-0.5`} size={24} />
          <div className="flex-1">
            <p className={`${config.text} font-semibold text-base leading-relaxed`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`${config.text} hover:bg-white hover:bg-opacity-10 rounded-full p-1 transition-all flex-shrink-0`}
            aria-label="Close notification"
          >
            <FaTimesCircle size={20} />
          </button>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="h-1 bg-black bg-opacity-20">
        <div 
          className={`h-full ${config.border.replace('border-', 'bg-')} transition-all duration-50`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
