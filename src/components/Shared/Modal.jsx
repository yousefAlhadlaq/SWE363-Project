import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children,
  showCloseButton = true,
  maxWidth = 'max-w-2xl'
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`relative w-full ${maxWidth} bg-slate-800/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-700 text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Header */}
          {(title || subtitle) && (
            <div className="px-8 pt-8 pb-6">
              {title && (
                <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
              )}
              {subtitle && (
                <p className="text-gray-300 text-sm">{subtitle}</p>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-8 pb-8">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;