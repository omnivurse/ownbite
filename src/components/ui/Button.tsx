import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  // Button variants
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white border border-transparent',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white border border-transparent',
    outline: 'bg-transparent hover:bg-neutral-100 text-primary-500 border border-primary-500',
    ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-600 border border-transparent',
  };

  // Button sizes
  const sizes = {
    sm: 'py-1 px-2 text-xs sm:py-1 sm:px-3 sm:text-sm',
    md: 'py-1.5 px-3 text-sm sm:py-2 sm:px-4 sm:text-base',
    lg: 'py-2 px-4 text-base sm:py-3 sm:px-5 sm:text-lg',
  };

  // Disabled state
  const disabledStyles = disabled || isLoading
    ? 'opacity-60 cursor-not-allowed'
    : 'cursor-pointer';

  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${disabledStyles}
        inline-flex items-center justify-center rounded-md font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-current" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {!isLoading && leftIcon && (
        <span className="mr-1.5 sm:mr-2 flex-shrink-0">{leftIcon}</span>
      )}
      
      <span className="whitespace-nowrap">{children}</span>
      
      {!isLoading && rightIcon && (
        <span className="ml-1.5 sm:ml-2 flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;