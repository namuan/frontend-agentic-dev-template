import * as React from 'react';
import styles from './Field.module.css';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  helperText?: string;
}

export function Select({ label, helperText, id, className, ...props }: SelectProps): React.ReactElement {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  const classes = [styles.control, className].filter(Boolean).join(' ');

  return (
    <div className={styles.field}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
      </label>
      <select id={fieldId} className={classes} {...props} />
      {helperText ? <span className={styles.helper}>{helperText}</span> : null}
    </div>
  );
}
