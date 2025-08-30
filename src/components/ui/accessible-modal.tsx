'use client'

import { Fragment, ReactNode, useEffect, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { FocusManagement, ScreenReader } from '@/lib/accessibility'

interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
}

/**
 * Accessible modal component following WCAG 2.1 AA guidelines
 * Features:
 * - Focus trapping and management
 * - Keyboard navigation (Escape to close)
 * - Screen reader announcements
 * - Proper ARIA attributes
 * - Backdrop click handling
 * - Return focus to trigger element
 */
export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true
}: AccessibleModalProps) {
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Store previous focus when modal opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Announce modal opening to screen readers
      ScreenReader.announce(`Modal abierto: ${title}`, 'assertive')
    } else if (previousFocusRef.current) {
      // Restore focus when modal closes
      FocusManagement.restoreFocus(previousFocusRef.current)
      
      // Announce modal closing
      ScreenReader.announce('Modal cerrado', 'polite')
    }
  }, [isOpen, title])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      // Close modal on Escape key
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={closeOnOverlayClick ? onClose : () => {}}
        initialFocus={modalRef}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />
        </Transition.Child>

        {/* Modal container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                ref={modalRef}
                className={`
                  w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl
                  bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl
                  transition-all border border-gray-200 dark:border-gray-700
                  focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                  dark:focus:ring-blue-400
                `}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                aria-describedby={description ? "modal-description" : undefined}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h2"
                    id="modal-title"
                    className="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
                  >
                    {title}
                  </Dialog.Title>
                  
                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="
                        rounded-md p-2 text-gray-400 hover:text-gray-500
                        focus:outline-none focus:ring-2 focus:ring-blue-600
                        dark:text-gray-500 dark:hover:text-gray-400
                        dark:focus:ring-blue-400 min-h-[44px] min-w-[44px]
                        flex items-center justify-center
                      "
                      aria-label="Cerrar modal"
                    >
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Description */}
                {description && (
                  <Dialog.Description
                    id="modal-description"
                    className="text-sm text-gray-600 dark:text-gray-400 mb-4"
                  >
                    {description}
                  </Dialog.Description>
                )}

                {/* Content */}
                <div className="modal-content">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

// Hook for managing modal state with accessibility
export function useAccessibleModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const openModal = () => {
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    openModal,
    closeModal
  }
}

import { useState } from 'react'
