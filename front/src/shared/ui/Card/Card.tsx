import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md' }) => {
  const cardClasses = [styles.card, styles[`p-${padding}`], className].join(' ');

  return <div className={cardClasses}>{children}</div>;
};
