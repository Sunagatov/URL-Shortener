import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false 
}) => {
  const baseStyles = 'rounded-2xl border border-white/10 bg-white/5 shadow-lg backdrop-blur-xl';
  const hoverStyles = hover ? 'hover:shadow-xl transition-all duration-300 hover:-translate-y-1' : '';
  
  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};
