// src/contexts/ToastContext.jsx
import { createContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();

    setToasts([{ id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((msg) => addToast('success', msg), [addToast]);
  const error = useCallback((msg) => addToast('error', msg), [addToast]);
  const info = useCallback((msg) => addToast('info', msg), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, removeToast, success, error, info }}>
      {children}

      <div className="fixed right-4 top-4 z-[99999] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const estilos = {
    success: {
      box: 'border-green-200 bg-green-50 text-green-800',
      icon: 'text-green-600',
      Icon: CheckCircle2,
    },
    error: {
      box: 'border-red-200 bg-red-50 text-red-800',
      icon: 'text-red-600',
      Icon: AlertTriangle,
    },
    info: {
      box: 'border-blue-200 bg-blue-50 text-blue-800',
      icon: 'text-blue-600',
      Icon: Info,
    },
  };

  const estilo = estilos[toast.type] || estilos.info;
  const Icone = estilo.Icon;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl ${estilo.box}`}
    >
      <Icone className={`mt-0.5 h-5 w-5 flex-shrink-0 ${estilo.icon}`} />

      <p className="flex-1 text-sm font-semibold leading-relaxed">
        {toast.message}
      </p>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1 text-gray-400 transition hover:bg-white/60 hover:text-gray-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}