import React from 'react';
import Button from './Button';

/**
 * EmptyState Component
 *
 * Displays a helpful empty state message when there's no data to show.
 * Encourages user action with clear messaging and optional CTA button.
 *
 * @param {Object} props
 * @param {string} props.icon - Lucide icon component (optional)
 * @param {string} props.title - Main heading text
 * @param {string} props.subtitle - Supporting text below title
 * @param {string} props.actionLabel - CTA button text (optional)
 * @param {Function} props.onAction - Click handler for CTA button (optional)
 * @param {string} props.variant - Style variant: 'default' | 'compact' | 'inline'
 */
const EmptyState = ({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  variant = 'default',
  className = '',
}) => {
  if (variant === 'inline') {
    // Minimal inline empty state (for smaller sections)
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-sm text-gray-400">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="mt-3 text-xs text-teal-400 hover:text-teal-300 underline transition"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    // Compact empty state (for cards)
    return (
      <div className={`text-center py-8 px-4 ${className}`}>
        {Icon && (
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/50 flex items-center justify-center mb-3">
            <Icon className="w-6 h-6 text-gray-500" />
          </div>
        )}
        <p className="text-sm font-medium text-gray-300">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            variant="secondary"
            className="mt-4"
            size="sm"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  // Default: Full empty state (for larger sections)
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {Icon && (
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {subtitle && (
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          {subtitle}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mt-6"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
