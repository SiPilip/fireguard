"use client";

import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";

type ModalType = "success" | "error" | "warning" | "info" | "confirm";

interface ModalProps {
  type: ModalType;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const modalConfig = {
  success: {
    icon: FaCheckCircle,
    iconColor: "text-green-500",
    iconBg: "bg-green-100",
    buttonColor: "bg-green-600 hover:bg-green-700",
  },
  error: {
    icon: FaTimesCircle,
    iconColor: "text-red-500",
    iconBg: "bg-red-100",
    buttonColor: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: FaExclamationCircle,
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-100",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700",
  },
  info: {
    icon: FaInfoCircle,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-100",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
  },
  confirm: {
    icon: FaExclamationCircle,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-100",
    buttonColor: "bg-red-600 hover:bg-red-700",
  },
};

export default function Modal({
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Batal",
}: ModalProps) {
  const config = modalConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 animate-scale-in">
        {/* Icon */}
        <div className="flex justify-center pt-8">
          <div className={`${config.iconBg} rounded-full p-4`}>
            <Icon className={config.iconColor} size={48} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-6 pt-0">
          {type === "confirm" && onCancel ? (
            <>
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-3 text-white rounded-lg font-semibold transition-colors ${config.buttonColor}`}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={onConfirm}
              className={`w-full px-4 py-3 text-white rounded-lg font-semibold transition-colors ${config.buttonColor}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
