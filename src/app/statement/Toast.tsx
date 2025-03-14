// Toast.tsx
import { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

const TOAST_CONFIGS = {
  success: {
    icon: FaCheckCircle,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    iconColor: 'text-green-400',
    borderColor: 'border-green-200'
  },
  error: {
    icon: FaExclamationCircle,
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    iconColor: 'text-red-400',
    borderColor: 'border-red-200'
  },
  warning: {
    icon: FaExclamationTriangle,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-400',
    borderColor: 'border-yellow-200'
  }
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const config = TOAST_CONFIGS[type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-center p-4 mb-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
         role="alert">
      <Icon className={`w-5 h-5 mr-2 ${config.iconColor}`} />
      <span className={`text-sm font-medium ${config.textColor}`}>{message}</span>
      <button
        type="button"
        className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 ${config.textColor} hover:bg-opacity-20 hover:bg-gray-500`}
        onClick={onClose}
        aria-label="Close"
      >
        <IoMdClose className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;