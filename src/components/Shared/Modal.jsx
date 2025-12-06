import React, { useEffect } from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  showCloseButton = true,
  maxWidth = 'max-w-2xl'
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Add modal-open class to body
      document.body.classList.add('modal-open');
      document.body.style.top = `-${scrollY}px`;

      return () => {
        // Remove modal-open class and restore scroll position
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Now with z-[9999] to sit above navbar (z-50) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container - z-[10000] to sit above backdrop */}
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`relative w-full ${maxWidth} bg-white dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-2xl animate-scaleIn transition-colors`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all z-10"
              aria-label="Close modal"
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
              )}
              {subtitle && (
                <p className="text-slate-600 dark:text-gray-300 text-sm">{subtitle}</p>
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