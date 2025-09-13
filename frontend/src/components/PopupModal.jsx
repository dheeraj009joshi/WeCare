import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const PopupModal = ({ 
  isOpen, 
  onClose, 
  type = 'info', // 'success', 'error', 'info'
  title = '', 
  message = '', 
  showCloseButton = true,
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseDelay);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, onClose, autoClose, autoCloseDelay]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-200';
      case 'error':
        return 'border-red-200';
      case 'info':
      default:
        return 'border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
      <div 
        className={`bg-white rounded-lg p-6 w-full max-w-md mx-4 border-2 ${getBorderColor()} shadow-xl transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {getIcon()}
          <h3 className={`text-lg font-semibold ${getTitleColor()}`}>
            {title || (type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Information')}
          </h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Message */}
        <p className="text-gray-700 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              type === 'success' 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : type === 'error'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupModal; 