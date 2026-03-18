import * as React from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps): React.ReactElement {
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  return <button className={classes} {...props} />;
}
