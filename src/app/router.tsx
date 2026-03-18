import * as React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { ErrorBoundary } from '@/lib/components/ErrorBoundary';
import { Spinner } from '@/lib/components/Spinner';

const DashboardPage = React.lazy(() => import('@/features/dashboard/components/DashboardPage'));
const AuthPage = React.lazy(() => import('@/features/auth/components/AuthPage'));
const SettingsPage = React.lazy(() => import('@/features/settings/components/SettingsPage'));

function withBoundary(element: React.ReactElement): React.ReactElement {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={<Spinner />}>
        {element}
      </React.Suspense>
    </ErrorBoundary>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: withBoundary(<DashboardPage />) },
      { path: 'auth', element: withBoundary(<AuthPage />) },
      { path: 'settings', element: withBoundary(<SettingsPage />) },
    ],
  },
]);
