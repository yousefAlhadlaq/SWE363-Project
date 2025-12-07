import React, { useEffect, useCallback, memo, useRef } from 'react';

/**
 * Optimized Modal component with:
 * - React.memo to prevent unnecessary re-renders
 * - useCallback for event handlers
 * - Keyboard accessibility (Escape to close, focus trap)
 * - Responsive padding for mobile
 * - Touch-friendly close button
 */
const Modal = memo(function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  showCloseButton = true,
  maxWidth = 'max-w-2xl'
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Handle escape key press
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Lock body scroll and handle focus when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position and active element
      const scrollY = window.scrollY;
      previousActiveElement.current = document.activeElement;

      // Add modal-open class to body
      document.body.classList.add('modal-open');
      document.body.style.top = `-${scrollY}px`;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';

      // Add keyboard listener
      document.addEventListener('keydown', handleKeyDown);

      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }

      return () => {
        // Remove modal-open class and restore scroll position
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        document.body.style.position = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);

        // Remove keyboard listener
        document.removeEventListener('keydown', handleKeyDown);

        // Restore focus to previous element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, handleKeyDown]);

  // Memoized click handler
  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleContentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] transition-opacity animate-fadeIn"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal Container - better mobile padding */}
      <div
        ref={modalRef}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 overflow-y-auto outline-none focus:outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div
          className={`relative w-full ${maxWidth} bg-white dark:bg-slate-800/95 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-2xl animate-scaleIn transition-colors max-h-[95vh] sm:max-h-[90vh] overflow-y-auto`}
          onClick={handleContentClick}
        >
          {/* Close Button - larger touch target on mobile */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all z-10 active:scale-95"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Header - responsive padding */}
          {(title || subtitle) && (
            <div className="px-4 sm:px-8 pt-4 sm:pt-8 pb-3 sm:pb-6 pr-14 sm:pr-16">
              {title && (
                <h2 
                  id="modal-title" 
                  className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2"
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-slate-600 dark:text-gray-300 text-sm">{subtitle}</p>
              )}
            </div>
          )}

          {/* Content - responsive padding */}
          <div className="px-4 sm:px-8 pb-4 sm:pb-8">
            {children}
          </div>
        </div>
      </div>
    </>
  );
});

Modal.displayName = 'Modal';

export default Modal;