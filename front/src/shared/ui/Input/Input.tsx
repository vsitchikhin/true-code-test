import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const containerClasses = [styles.container, fullWidth ? styles.fullWidth : '', className].join(
    ' ',
  );

  const inputClasses = [styles.input, error ? styles.inputError : ''].join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <input id={id} className={inputClasses} {...props} />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
