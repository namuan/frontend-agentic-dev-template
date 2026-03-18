import * as React from 'react';
import { Button } from './Button';
import { useToast } from '../hooks/useToast';
import styles from './Toast.module.css';

export function ToastViewport(): React.ReactElement | null {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={styles.viewport} aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.tone]}`}>
          <div>
            <p className={styles.title}>{toast.title}</p>
            {toast.description ? (
              <p className={styles.description}>{toast.description}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            className={styles.dismiss}
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            data-testid={`dismiss-toast-${toast.id}`}
          >
            Dismiss
          </Button>
        </div>
      ))}
    </div>
  );
}
