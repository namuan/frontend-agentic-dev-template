import * as React from 'react';
import { Button } from '@/lib/components/Button';
import { EmptyState } from '@/lib/components/EmptyState';
import { Input } from '@/lib/components/Input';
import { Spinner } from '@/lib/components/Spinner';
import { useAuth } from '../hooks/useAuth';
import styles from './AuthPage.module.css';

export default function AuthPage(): React.ReactElement {
  const { session, isLoading, error, login, isLoggingIn, loginError, logout, isLoggingOut, refetch } = useAuth();
  const [email, setEmail] = React.useState('');
  const [accessCode, setAccessCode] = React.useState('');
  const [formError, setFormError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);
    try {
      await login({ email, accessCode });
    } catch {
      setFormError('Access denied. Check your credentials and try again.');
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch {
      // No-op for demo flows.
    }
  };

  if (isLoading) {
    return (
      <section className={styles.centered} data-testid="auth-loading">
        <Spinner />
        <p className={styles.loadingText}>Synchronising access keys...</p>
      </section>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Access channel unavailable"
        description="The access service is temporarily offline."
        actionLabel="Retry"
        onAction={refetch}
        testId="auth-error"
      />
    );
  }

  if (session) {
    return (
      <section className={styles.sessionCard} data-testid="auth-session">
        <div>
          <p className={styles.eyebrow}>Active session</p>
          <h2 className={styles.title}>Welcome back, {session.user.name}</h2>
          <p className={styles.meta}>Role: {session.user.role}</p>
          <p className={styles.meta}>Email: {session.user.email}</p>
        </div>
        <Button
          variant="secondary"
          onClick={handleLogout}
          disabled={isLoggingOut}
          data-testid="sign-out"
        >
          {isLoggingOut ? 'Signing out...' : 'Sign out'}
        </Button>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Secure intake</p>
        <h1 className={styles.title}>Access the control room</h1>
        <p className={styles.subtitle}>
          Verify your credentials to unlock live signals and operations dashboards.
        </p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="operator@northstar.ai"
          data-testid="auth-email"
          required
        />
        <Input
          label="Access code"
          type="password"
          value={accessCode}
          onChange={(event) => setAccessCode(event.target.value)}
          placeholder="Six digit code"
          data-testid="auth-code"
          required
        />
        {formError || loginError ? (
          <p className={styles.error} role="alert">
            {formError ?? 'Access could not be verified. Try again.'}
          </p>
        ) : null}
        <Button type="submit" disabled={isLoggingIn} data-testid="sign-in">
          {isLoggingIn ? 'Verifying...' : 'Enter control room'}
        </Button>
      </form>
    </section>
  );
}
