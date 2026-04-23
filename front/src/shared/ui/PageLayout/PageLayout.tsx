import React from 'react';
import styles from './PageLayout.module.css';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, className = '' }) => {
  return <div className={`${styles.layout} ${className}`}>{children}</div>;
};
