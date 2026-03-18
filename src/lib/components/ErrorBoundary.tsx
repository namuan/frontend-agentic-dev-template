import * as React from 'react';
import { EmptyState } from './EmptyState';
import { logger } from '../utils/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  message?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    logger.error('UI error boundary triggered', { error });
  }

  render(): React.ReactElement {
    if (this.state.hasError) {
      return (
        <EmptyState
          title="Something went off-script"
          description={
            this.props.message ?? 'Try refreshing the page or return to the dashboard.'
          }
          actionLabel="Reload"
          onAction={() => window.location.reload()}
          testId="error-boundary"
        />
      );
    }

    return <>{this.props.children}</>;
  }
}
