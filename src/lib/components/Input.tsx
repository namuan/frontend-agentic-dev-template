import * as React from 'react';
import styles from './Field.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
}

export function Input({ label, helperText, id, className, ...props }: InputProps): React.ReactElement {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  const classes = [styles.control, className].filter(Boolean).join(' ');

  return (
    <div className={styles.field}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
      </label>
      <input id={fieldId} className={classes} {...props} />
      {helperText ? <span className={styles.helper}>{helperText}</span> : null}
    </div>
  );
}
