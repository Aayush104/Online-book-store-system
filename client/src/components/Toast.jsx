// Toast.jsx - Compatible with Vite's Fast Refresh

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Create a context for toast management
const ToastContext = createContext(null);

// Add keyframes style to the document once
if (typeof document !== "undefined") {
  // Check if the style already exists to avoid duplicates
  if (!document.getElementById("toast-keyframes")) {
    const styleElement = document.createElement("style");
    styleElement.id = "toast-keyframes";
    styleElement.textContent = `
      @keyframes shrink {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }
    `;
    document.head.appendChild(styleElement);
  }
}

// Individual Toast component (separate file ideally)
function ToastItem({
  message,
  type = "info",
  duration = 3000,
  position = "top-right",
  onClose,
  show = true,
  autoClose = true,
  title = null,
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let showTimeout;
    let hideTimeout;
    let closeTimeout;

    if (show) {
      // Small delay to trigger animation
      showTimeout = setTimeout(() => setIsVisible(true), 10);

      // Auto close after duration
      if (autoClose && duration > 0) {
        hideTimeout = setTimeout(() => {
          setIsVisible(false);
        }, duration);

        // Separate timeout for the callback to avoid dependencies issue
        closeTimeout = setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, duration + 300); // Wait for exit animation after duration
      }
    } else {
      setIsVisible(false);
    }

    // Cleanup function to avoid memory leaks
    return () => {
      if (showTimeout) clearTimeout(showTimeout);
      if (hideTimeout) clearTimeout(hideTimeout);
      if (closeTimeout) clearTimeout(closeTimeout);
    };
  }, [show, duration, autoClose, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    // Use a timeout to ensure the animation plays before calling onClose
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 300);
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
                ${styles.text} hover:bg-opacity-20
                focus:outline-none focus:ring-2 focus:ring-offset-2
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
              className={`h-full ${styles.progressBar}`}
              style={{
                width: "100%",
                animation: `shrink ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Toast Container component
function ToastContainer({ children, position = "top-right" }) {
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
      {React.Children.map(children, (child) => (
        <div className="pointer-events-auto">{child}</div>
      ))}
    </div>
  );
}

// Keep track of shown toasts across renders
const shownToasts = new Set();

// Provider component
function ToastProvider({ children, defaultPosition = "top-right" }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((options) => {
    const id = Date.now();
    const newToast = { id, ...options };

    // Create a unique key for this toast based on type and message
    const toastKey = `${options.type || "info"}-${options.message}`;

    // Only add the toast if it hasn't been shown before
    if (!shownToasts.has(toastKey)) {
      shownToasts.add(toastKey);
      setToasts((prevToasts) => [...prevToasts, newToast]);
      return id;
    }

    return null;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Create a stable context value
  const contextValue = React.useMemo(
    () => ({
      addToast,
      removeToast,
      clearToasts,
    }),
    [addToast, removeToast, clearToasts]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer position={defaultPosition}>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

// Hook for toast management - defined as a named function
function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  // Return a memoized object with stable functions
  return React.useMemo(
    () => ({
      showToast: (options) => context.addToast(options),
      removeToast: context.removeToast,
      clearToasts: context.clearToasts,
    }),
    [context]
  );
}

export { ToastProvider, useToast };
