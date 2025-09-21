import React from 'react';

const AnimatedCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  onClick,
  hoverEffect = true,
  ...props 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'shadow-lg hover:shadow-2xl';
      case 'bordered':
        return 'border-2 border-purple-200 hover:border-purple-400';
      case 'gradient':
        return 'bg-gradient-to-br from-white to-purple-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        animated-card
        ${getVariantClasses()}
        rounded-2xl p-6
        transition-all duration-400 ease-out
        ${hoverEffect ? 'hover:transform hover:scale-105 hover:-translate-y-2' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedCard; 