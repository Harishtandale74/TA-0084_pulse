import clsx from 'clsx';

function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div
      className={clsx('animate-spin', sizeClasses[size], className)}
      role="status"
      aria-label="Loading"
    >
      <svg
        className="w-full h-full text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75 text-blue-500"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-300">{message}</p>
    </div>
  );
}

export { LoadingSpinner, LoadingOverlay };
export default LoadingSpinner;
