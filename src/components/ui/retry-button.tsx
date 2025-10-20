'use client';

/**
 * Retry Button Component
 * Client component for reload functionality
 */

interface RetryButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function RetryButton({ children, className }: RetryButtonProps) {
  return (
    <button
      onClick={() => window.location.reload()}
      className={className}
    >
      {children}
    </button>
  );
}

