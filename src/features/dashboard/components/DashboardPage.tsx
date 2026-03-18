import * as React from 'react';
import { Button } from '@/lib/components/Button';
import { EmptyState } from '@/lib/components/EmptyState';
import { Spinner } from '@/lib/components/Spinner';
import { useDashboardData } from '../hooks/useDashboardData';
import styles from './DashboardPage.module.css';

export default function DashboardPage(): React.ReactElement {
  const { data, isLoading, error, refetch } = useDashboardData();

  if (isLoading) {
    return (
      <section className={styles.centered} data-testid="dashboard-loading">
        <Spinner />
        <p className={styles.loadingText}>Compiling mission signals...</p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Dashboard offline"
        description="Signals could not be loaded right now."
        actionLabel="Retry"
        onAction={refetch}
        testId="dashboard-error"
      />
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Live signals</p>
          <h1 className={styles.title}>Operations dashboard</h1>
          <p className={styles.subtitle}>Realtime pulse of the autonomous fleet.</p>
        </div>
        <Button variant="secondary" onClick={refetch} data-testid="dashboard-refresh">
          Refresh
        </Button>
      </header>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard} data-testid="summary-healthy">
          <p className={styles.summaryLabel}>Healthy</p>
          <p className={styles.summaryValue}>{data.summary.healthy}</p>
        </div>
        <div className={styles.summaryCard} data-testid="summary-watch">
          <p className={styles.summaryLabel}>Watch</p>
          <p className={styles.summaryValue}>{data.summary.watch}</p>
        </div>
        <div className={styles.summaryCard} data-testid="summary-critical">
          <p className={styles.summaryLabel}>Critical</p>
          <p className={styles.summaryValue}>{data.summary.critical}</p>
        </div>
      </div>

      <div className={styles.signalGrid}>
        {data.signals.map((signal) => (
          <article
            key={signal.id}
            className={`${styles.signalCard} ${styles[signal.status]}`}
            data-testid={`signal-${signal.id}`}
          >
            <div>
              <h3 className={styles.signalTitle}>{signal.title}</h3>
              <p className={styles.signalMeta}>Owner: {signal.owner}</p>
            </div>
            <div className={styles.signalFooter}>
              <span className={styles.status}>{signal.status}</span>
              <span className={styles.timestamp}>
                Updated {new Date(signal.lastChecked).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
