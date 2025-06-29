import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div 
      className={`
        bg-white rounded-lg shadow-md overflow-hidden
        ${hoverable ? 'transition-all duration-200 hover:shadow-lg' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;

export const CardHeader: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`px-3 py-4 sm:px-4 sm:py-5 md:px-6 border-b border-neutral-200 ${className}`}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`px-3 py-4 sm:px-4 sm:py-5 md:px-6 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`px-3 py-3 sm:px-4 sm:py-4 md:px-6 border-t border-neutral-200 ${className}`}>
      {children}
    </div>
  );
};