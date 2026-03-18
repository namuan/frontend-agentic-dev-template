import * as React from 'react';

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function ToastProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const timeouts = React.useRef<Record<string, number>>({});

  const dismiss = React.useCallback((id: string) => {
    const timeoutId = timeouts.current[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete timeouts.current[id];
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = React.useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = createId();
      setToasts((current) => [...current, { ...toast, id }]);
      timeouts.current[id] = window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = React.useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);

  React.useEffect(() => {
    return () => {
      Object.values(timeouts.current).forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeouts.current = {};
    };
  }, []);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
