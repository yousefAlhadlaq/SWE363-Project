import React from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

function InputField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  maxLength,
  className = '',
  ...rest
}) {
  const inputId = `input-${name}`;
  const errorId = `error-${name}`;

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-400 mb-1"
        >
          {label} {required && <span className="text-red-500" aria-label="required">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-700/50 text-white
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-600'}
            ${showPasswordToggle ? 'pr-10' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${className}
          `}
          {...rest}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 rounded p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-500 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export default InputField;
