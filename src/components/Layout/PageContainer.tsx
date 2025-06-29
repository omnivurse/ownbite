import React, { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

/**
 * Standard page container with consistent padding and optional title
 */
const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  title,
  className = ''
}) => {
  return (
    <main className={`flex-1 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {title && (
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900">{title}</h1>
          </div>
        )}
        {children}
      </div>
    </main>
  );
};

export default PageContainer;