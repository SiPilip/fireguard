"use client";

import { useState, useCallback } from "react";

type ModalType = "success" | "error" | "warning" | "info" | "confirm";

interface ModalState {
  show: boolean;
  type: ModalType;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function useModal() {
  const [modal, setModal] = useState<ModalState>({
    show: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const hideModal = useCallback(() => {
    setModal((prev) => ({ ...prev, show: false }));
  }, []);

  const showModal = useCallback(
    (
      type: ModalType,
      title: string,
      message: string,
      onConfirm: () => void,
      options?: {
        onCancel?: () => void;
        confirmText?: string;
        cancelText?: string;
      }
    ) => {
      setModal({
        show: true,
        type,
        title,
        message,
        onConfirm: () => {
          onConfirm();
          setModal((prev) => ({ ...prev, show: false }));
        },
        onCancel: options?.onCancel
          ? () => {
              options.onCancel?.();
              setModal((prev) => ({ ...prev, show: false }));
            }
          : undefined,
        confirmText: options?.confirmText,
        cancelText: options?.cancelText,
      });
    },
    []
  );

  const success = useCallback(
    (title: string, message: string, onConfirm: () => void = () => {}) =>
      showModal("success", title, message, onConfirm),
    [showModal]
  );

  const error = useCallback(
    (title: string, message: string, onConfirm: () => void = () => {}) =>
      showModal("error", title, message, onConfirm),
    [showModal]
  );

  const warning = useCallback(
    (title: string, message: string, onConfirm: () => void = () => {}) =>
      showModal("warning", title, message, onConfirm),
    [showModal]
  );

  const info = useCallback(
    (title: string, message: string, onConfirm: () => void = () => {}) =>
      showModal("info", title, message, onConfirm),
    [showModal]
  );

  const confirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void,
      confirmText?: string,
      cancelText?: string
    ) =>
      showModal("confirm", title, message, onConfirm, {
        onCancel,
        confirmText,
        cancelText,
      }),
    [showModal]
  );

  return {
    modal,
    showModal,
    hideModal,
    success,
    error,
    warning,
    info,
    confirm,
  };
}
