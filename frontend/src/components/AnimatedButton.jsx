import React from 'react';

const AnimatedButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  ...props 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600';
      case 'outline':
        return 'bg-transparent border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white';
      case 'ghost':
        return 'bg-transparent text-purple-500 hover:bg-purple-50';
      default:
        return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-4 py-2 text-sm';
      case 'large':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        animated-button
        ${getVariantClasses()}
        ${getSizeClasses()}
        text-white font-semibold rounded-full
        transition-all duration-300 ease-in-out
        transform hover:scale-105 active:scale-95
        focus:outline-none focus:ring-4 focus:ring-purple-300
        disabled:opacity-50 disabled:cursor-not-allowed
        relative overflow-hidden
        ${className}
      `}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-full">
          <div className="loading-spinner w-5 h-5"></div>
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
        {children}
      </span>
    </button>
  );
};

export default AnimatedButton; 