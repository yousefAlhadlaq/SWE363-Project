import React from 'react';

/**
 * A reusable loading spinner component
 * @param {string} size - 'sm', 'md', 'lg' for different sizes
 * @param {string} message - Optional message to display below the spinner
 */
function LoadingSpinner({ size = 'md', message = '' }) {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4',
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={`${sizeClasses[size]} border-teal-500/30 border-t-teal-500 rounded-full animate-spin`}
                style={{ borderStyle: 'solid' }}
            />
            {message && (
                <p className={`${textSizes[size]} text-gray-400 animate-pulse`}>
                    {message}
                </p>
            )}
        </div>
    );
}

/**
 * Full page loading spinner with semi-transparent overlay
 */
export function PageLoadingSpinner({ message = 'Loading...' }) {
    return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    {/* Outer ring */}
                    <div className="w-16 h-16 border-4 border-teal-500/20 rounded-full"></div>
                    {/* Spinning ring */}
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-teal-500 rounded-full animate-spin"></div>
                    {/* Inner glow */}
                    <div className="absolute inset-2 w-12 h-12 bg-teal-500/10 rounded-full animate-pulse"></div>
                </div>
                <p className="text-gray-400 text-sm animate-pulse">{message}</p>
            </div>
        </div>
    );
}

export default LoadingSpinner;
