import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3.5 py-2 text-sm text-slate-900 bg-white border ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600 focus:border-blue-600'
          } rounded-lg shadow-sm focus:outline-none focus:ring-1 transition-colors ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
