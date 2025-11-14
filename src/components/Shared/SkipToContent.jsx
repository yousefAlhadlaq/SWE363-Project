import React from 'react';

/**
 * Skip to Main Content link for keyboard navigation
 * This helps screen reader users and keyboard-only users skip navigation
 */
function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-teal-500 focus:text-white focus:rounded-xl focus:font-semibold focus:shadow-2xl focus:ring-4 focus:ring-teal-400/50 transition-all"
    >
      Skip to main content
    </a>
  );
}

export default SkipToContent;
