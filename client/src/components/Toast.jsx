import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Toast = ({
  message,
  type = "info",
  duration = 3000,
  position = "top-right",
  onClose,
  show = true,
  autoClose = true,
  title = null,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // Small delay to trigger animation
      const showTimeout = setTimeout(() => setIsVisible(true), 10);

      // Auto close after duration
      let closeTimeout;
      if (autoClose && duration > 0) {
        closeTimeout = setTimeout(() => {
          setIsVisible(false);
          if (onClose) {
            setTimeout(onClose, 300); // Wait for exit animation
          }
        }, duration);
      }

      return () => {
        clearTimeout(showTimeout);
        if (closeTimeout) clearTimeout(closeTimeout);
      };
    } else {
      setIsVisible(false);
    }
  }, [show, duration, autoClose, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300); // Wait for exit animation
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-success-50",
          border: "border-success-200",
          text: "text-success-900",
          icon: <CheckCircleIcon className="h-5 w-5 text-success-500" />,
          progressBar: "bg-success-500",
        };
      case "error":
        return {
          bg: "bg-error-50",
          border: "border-error-200",
          text: "text-error-900",
          icon: <ExclamationCircleIcon className="h-5 w-5 text-error-500" />,
          progressBar: "bg-error-500",
        };
      case "warning":
        return {
          bg: "bg-warning-50",
          border: "border-warning-200",
          text: "text-warning-900",
          icon: (
            <ExclamationTriangleIcon className="h-5 w-5 text-warning-500" />
          ),
          progressBar: "bg-warning-500",
        };
      case "info":
      default:
        return {
          bg: "bg-info-50",
          border: "border-info-200",
          text: "text-info-900",
          icon: <InformationCircleIcon className="h-5 w-5 text-info-500" />,
          progressBar: "bg-info-500",
        };
    }
  };

  const getPositionStyles = () => {
    const base =
      "fixed z-50 transition-all duration-300 ease-[var(--ease-snappy)]";
    const positions = {
      "top-right": "top-4 right-4",
      "top-left": "top-4 left-4",
      "top-center": "top-4 left-1/2 -translate-x-1/2",
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    };

    return `${base} ${positions[position] || positions["top-right"]}`;
  };

  const getAnimationStyles = () => {
    if (!isVisible) {
      switch (position) {
        case "top-right":
        case "bottom-right":
          return "translate-x-full opacity-0";
        case "top-left":
        case "bottom-left":
          return "-translate-x-full opacity-0";
        case "top-center":
          return "-translate-y-full opacity-0";
        case "bottom-center":
          return "translate-y-full opacity-0";
        default:
          return "translate-x-full opacity-0";
      }
    }
    return "translate-x-0 translate-y-0 opacity-100";
  };

  const styles = getTypeStyles();

  if (!show) return null;

  return (
    <div
      className={`${getPositionStyles()} ${getAnimationStyles()}`}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`
          ${styles.bg} ${styles.border} ${styles.text}
          min-w-[320px] max-w-[420px] rounded-lg border shadow-lg overflow-hidden
          transition-all duration-300 ease-[var(--ease-fluid)]
        `}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">{styles.icon}</div>
            <div className="ml-3 flex-1">
              {title && <h3 className="text-sm font-semibold mb-1">{title}</h3>}
              <p className="text-sm">{message}</p>
            </div>
            <button
              type="button"
              className={`
                ml-4 inline-flex rounded-md p-1.5
                ${styles.text} hover:bg-[color-mix(in_oklab,_var(--color-${type}-100)_80%,_transparent)]
                focus:outline-none focus:ring-2 focus:ring-${type}-500 focus:ring-offset-2
                transition-colors duration-200
              `}
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress bar for auto-close */}
        {autoClose && duration > 0 && (
          <div className="h-1 w-full bg-transparent">
            <div
              className={`h-full ${styles.progressBar} transition-all`}
              style={{
                animation: `shrink ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      {/* Add keyframes for progress bar animation */}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

// Toast Container for multiple toasts
export const ToastContainer = ({ children, position = "top-right" }) => {
  const getContainerStyles = () => {
    const base = "fixed z-50 pointer-events-none";
    const positions = {
      "top-right": "top-4 right-4",
      "top-left": "top-4 left-4",
      "top-center": "top-4 left-1/2 -translate-x-1/2",
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    };

    return `${base} ${positions[position] || positions["top-right"]}`;
  };

  return (
    <div className={`${getContainerStyles()} flex flex-col gap-3`}>
      {children}
    </div>
  );
};

// Hook for easy toast management
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (options) => {
    const id = Date.now();
    const newToast = { id, ...options };
    setToasts((prev) => [...prev, newToast]);

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    showToast,
    removeToast,
    clearToasts,
  };
};

export default Toast;
