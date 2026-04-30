import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  const baseStyles =
    'rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] ' +
    'shadow-[var(--surface-shadow)] backdrop-blur-xl';
  const hoverStyles = hover
    ? 'transition duration-300 hover:-translate-y-1 hover:border-[color:var(--accent-border)] hover:shadow-[0_22px_50px_rgba(4,10,24,0.46)]'
    : '';

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};
