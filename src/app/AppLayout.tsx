import * as React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './AppLayout.module.css';

const navItems = [
  { to: '/', label: 'Dashboard', testId: 'nav-dashboard' },
  { to: '/auth', label: 'Access', testId: 'nav-auth' },
  { to: '/settings', label: 'Settings', testId: 'nav-settings' },
];

export function AppLayout(): React.ReactElement {
  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo}>Northstar</span>
          <span className={styles.pulse}>Control</span>
        </div>
        <nav className={styles.nav} aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [styles.navLink, isActive ? styles.active : ''].filter(Boolean).join(' ')
              }
              data-testid={item.testId}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <p className={styles.footerTitle}>Operational mode</p>
          <p className={styles.footerValue}>Aurora-7</p>
        </div>
      </aside>
      <main className={styles.main}>
        <div className={styles.surface}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
