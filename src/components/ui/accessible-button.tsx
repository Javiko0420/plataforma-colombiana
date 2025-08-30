'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

/**
 * Accessible button component following WCAG 2.1 AA guidelines
 * Features:
 * - Proper focus management
 * - Loading states with screen reader support
 * - High contrast colors
 * - Keyboard navigation
 * - ARIA attributes
 */
export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText = 'Cargando...',
    leftIcon,
    rightIcon,
    disabled,
    className,
    children,
    ...props
  }, ref) => {
    const baseClasses = [
      // Base styles
      'inline-flex items-center justify-center rounded-md font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      // High contrast focus ring
      'focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400',
      // Ensure minimum touch target size (44x44px)
      'min-h-[44px] min-w-[44px]'
    ]

    const variantClasses = {
      primary: [
        'bg-blue-600 text-white hover:bg-blue-700',
        'dark:bg-blue-600 dark:hover:bg-blue-700',
        // High contrast for accessibility
        'contrast-more:bg-blue-800 contrast-more:text-white'
      ],
      secondary: [
        'bg-gray-100 text-gray-900 hover:bg-gray-200',
        'dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
        'contrast-more:bg-gray-200 contrast-more:text-black'
      ],
      outline: [
        'border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50',
        'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
        'contrast-more:border-black contrast-more:text-black'
      ],
      ghost: [
        'bg-transparent text-gray-700 hover:bg-gray-100',
        'dark:text-gray-300 dark:hover:bg-gray-800',
        'contrast-more:text-black contrast-more:hover:bg-gray-200'
      ],
      danger: [
        'bg-red-600 text-white hover:bg-red-700',
        'dark:bg-red-600 dark:hover:bg-red-700',
        'contrast-more:bg-red-800 contrast-more:text-white'
      ]
    }

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    }

    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-describedby={loading ? `${props.id}-loading` : undefined}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <>
            {/* Loading spinner */}
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {/* Screen reader text for loading state */}
            <span className="sr-only" id={`${props.id}-loading`}>
              {loadingText}
            </span>
          </>
        )}
        
        {!loading && leftIcon && (
          <span className="mr-2" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        <span>{loading ? loadingText : children}</span>
        
        {!loading && rightIcon && (
          <span className="ml-2" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'
