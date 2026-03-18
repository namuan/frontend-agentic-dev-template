import * as React from 'react';
import styles from './Field.module.css';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
}

export function Textarea({
  label,
  helperText,
  id,
  className,
  ...props
}: TextareaProps): React.ReactElement {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  const classes = [styles.control, className].filter(Boolean).join(' ');

  return (
    <div className={styles.field}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
      </label>
      <textarea id={fieldId} className={classes} {...props} />
      {helperText ? <span className={styles.helper}>{helperText}</span> : null}
    </div>
  );
}
