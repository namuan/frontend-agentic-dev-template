import * as React from 'react';
import styles from './Spinner.module.css';

export function Spinner(): React.ReactElement {
  return <div className={styles.spinner} role="status" aria-label="Loading" />;
}
