'use client'

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react'
import { cn } from '@/lib/utils'

interface AccessibleInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  showLabel?: boolean
}

/**
 * Accessible input component following WCAG 2.1 AA guidelines
 * Features:
 * - Proper labeling and descriptions
 * - Error state management
 * - High contrast focus indicators
 * - Screen reader support
 * - Keyboard navigation
 */
export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    showLabel = true,
    className,
    id,
    ...props
  }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    
    const hasError = !!error
    const hasHelper = !!helperText

    const inputClasses = [
      // Base styles
      'block w-full rounded-md border px-3 py-2 text-base',
      'placeholder-gray-500 dark:placeholder-gray-400',
      'transition-colors duration-200',
      // Focus styles with high contrast
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'focus:ring-blue-600 dark:focus:ring-blue-400',
      // High contrast mode support
      'contrast-more:border-2',
      // Minimum touch target
      'min-h-[44px]',
      // Icon spacing
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      // Error state
      hasError
        ? [
            'border-red-500 text-red-900 placeholder-red-300',
            'focus:border-red-500 focus:ring-red-500',
            'dark:border-red-400 dark:text-red-100',
            'contrast-more:border-red-700'
          ]
        : [
            'border-gray-300 text-gray-900',
            'dark:border-gray-600 dark:text-gray-100 dark:bg-gray-800',
            'contrast-more:border-gray-600'
          ]
    ]

    // Build aria-describedby attribute
    const describedBy = [
      hasError && errorId,
      hasHelper && helperId
    ].filter(Boolean).join(' ') || undefined

    return (
      <div className="w-full">
        {/* Label */}
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
            'contrast-more:text-black dark:contrast-more:text-white',
            !showLabel && 'sr-only'
          )}
        >
          {label}
          {props.required && (
            <span className="text-red-500 ml-1" aria-label="campo requerido">
              *
            </span>
          )}
        </label>

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">
                {leftIcon}
              </span>
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            aria-required={props.required}
            className={cn(inputClasses, className)}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">
                {rightIcon}
              </span>
            </div>
          )}
        </div>

        {/* Helper text */}
        {hasHelper && !hasError && (
          <p
            id={helperId}
            className="mt-1 text-sm text-gray-600 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}

        {/* Error message */}
        {hasError && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
            aria-live="polite"
          >
            <span className="sr-only">Error: </span>
            {error}
          </p>
        )}
      </div>
    )
  }
)

AccessibleInput.displayName = 'AccessibleInput'
