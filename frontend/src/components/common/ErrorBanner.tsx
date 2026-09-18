import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-500 hover:text-red-700 text-xs font-semibold">
          Dismiss
        </button>
      )}
    </div>
  );
};
