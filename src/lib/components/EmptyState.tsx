import * as React from 'react';
import { Button } from './Button';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  testId?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  testId,
}: EmptyStateProps): React.ReactElement {
  return (
    <div className={styles.empty} data-testid={testId}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionLabel && onAction ? (
        <Button onClick={onAction} variant="secondary" data-testid={`${testId ?? 'empty'}-action`}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
