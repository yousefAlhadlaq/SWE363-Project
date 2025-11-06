import React from 'react';

function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '' }) {
  const baseClasses = `px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${className}`;
  
  const variantClasses = {
    primary: 'bg-teal-600 text-white hover:bg-teal-500 focus:ring-teal-500', // Changed to teal for design consistency
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  );
}

export default Button;
