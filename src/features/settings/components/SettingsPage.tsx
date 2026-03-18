import * as React from 'react';
import { Button } from '@/lib/components/Button';
import { EmptyState } from '@/lib/components/EmptyState';
import { Select } from '@/lib/components/Select';
import { Spinner } from '@/lib/components/Spinner';
import type { Preferences } from '@/lib/types/settingsSchema';
import { useSettings } from '../hooks/useSettings';
import styles from './SettingsPage.module.css';

export default function SettingsPage(): React.ReactElement {
  const { data, isLoading, error, save, isSaving, saveError, refetch } = useSettings();
  const [preferences, setPreferences] = React.useState<Preferences | null>(null);

  React.useEffect(() => {
    if (data) {
      setPreferences(data.preferences);
    }
  }, [data]);

  if (isLoading) {
    return (
      <section className={styles.centered} data-testid="settings-loading">
        <Spinner />
        <p className={styles.loadingText}>Syncing command preferences...</p>
      </section>
    );
  }

  if (error || !data || !preferences) {
    return (
      <EmptyState
        title="Settings unavailable"
        description="We couldn't load your preferences right now."
        actionLabel="Retry"
        onAction={refetch}
        testId="settings-error"
      />
    );
  }

  const updatePreference = (partial: Partial<Preferences>): void => {
    setPreferences((current) => (current ? { ...current, ...partial } : current));
  };

  const handleSave = async (): Promise<void> => {
    try {
      await save(preferences);
    } catch {
      // Error state is surfaced via saveError.
    }
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Command profile</p>
          <h1 className={styles.title}>Pilot settings</h1>
          <p className={styles.subtitle}>Tune the signal feed and notification cadence.</p>
        </div>
        <Button variant="secondary" onClick={refetch} data-testid="settings-refresh">
          Refresh
        </Button>
      </header>

      <div className={styles.profileCard}>
        <div>
          <p className={styles.profileLabel}>Operator</p>
          <p className={styles.profileValue}>{data.user.name}</p>
          <p className={styles.profileMeta}>{data.user.email}</p>
        </div>
        <span className={styles.badge}>{data.user.role}</span>
      </div>

      <form className={styles.form}>
        <Select
          label="Theme"
          value={preferences.theme}
          onChange={(event) => updatePreference({ theme: event.target.value === 'dawn' ? 'dawn' : 'midnight' })}
          data-testid="settings-theme"
        >
          <option value="midnight">Midnight</option>
          <option value="dawn">Dawn</option>
        </Select>
        <Select
          label="Notifications"
          value={preferences.notifications ? 'on' : 'off'}
          onChange={(event) => updatePreference({ notifications: event.target.value === 'on' })}
          data-testid="settings-notifications"
        >
          <option value="on">Enabled</option>
          <option value="off">Muted</option>
        </Select>
        <Select
          label="Weekly digest"
          value={preferences.weeklyDigest ? 'on' : 'off'}
          onChange={(event) => updatePreference({ weeklyDigest: event.target.value === 'on' })}
          data-testid="settings-digest"
        >
          <option value="on">Enabled</option>
          <option value="off">Disabled</option>
        </Select>

        {saveError ? (
          <p className={styles.error} role="alert">
            Could not save settings. Try again.
          </p>
        ) : null}

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={() => setPreferences(data.preferences)} data-testid="settings-reset">
            Reset
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving} data-testid="settings-save">
            {isSaving ? 'Saving...' : 'Save settings'}
          </Button>
        </div>
      </form>
    </section>
  );
}
