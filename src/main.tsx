import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import '@/lib/styles/tokens.css';
import '@/lib/styles/global.css';

async function startApp(): Promise<void> {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element not found');
  }

  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

void startApp();
