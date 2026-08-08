import { useEffect } from 'react';

/**
 * Toast Item Component
 * Renders an individual toast notification with type icon, message, accessible dismiss button,
 * and automatic timer dismissal.
 */
function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const duration = toast.duration || (toast.type === 'error' ? 5000 : toast.type === 'warning' ? 4000 : 3000);
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`toast-item toast-${toast.type || 'info'} animate-toast-slide`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{toast.message}</span>
      <button
        type="button"
        className="toast-close-btn"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * Toast Container Component - Phase 6C
 * Renders global vertical stack of notifications fixed at top-right/bottom-right of viewport.
 */
export default function ToastContainer({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
