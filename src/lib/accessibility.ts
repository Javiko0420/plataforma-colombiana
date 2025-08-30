/**
 * Accessibility utilities and helpers
 * Implements WCAG 2.1 AA guidelines for inclusive design
 */

// Screen reader utilities
export const ScreenReader = {
  /**
   * Announce content to screen readers
   * @param message - Message to announce
   * @param priority - Announcement priority (polite or assertive)
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.setAttribute('class', 'sr-only')
    announcer.textContent = message
    
    document.body.appendChild(announcer)
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  },

  /**
   * Create screen reader only text
   * @param text - Text for screen readers only
   */
  onlyText(text: string): string {
    return `<span class="sr-only">${text}</span>`
  }
}

// Keyboard navigation utilities
export const KeyboardNavigation = {
  /**
   * Handle keyboard navigation for lists
   * @param event - Keyboard event
   * @param items - Array of focusable elements
   * @param currentIndex - Current focused index
   * @param onSelect - Callback when item is selected
   */
  handleListNavigation(
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onSelect?: (index: number) => void
  ): number {
    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        newIndex = (currentIndex + 1) % items.length
        break
      case 'ArrowUp':
        event.preventDefault()
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = items.length - 1
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        onSelect?.(currentIndex)
        return currentIndex
    }

    if (newIndex !== currentIndex && items[newIndex]) {
      items[newIndex].focus()
    }

    return newIndex
  },

  /**
   * Trap focus within a container
   * @param container - Container element
   * @param firstElement - First focusable element
   * @param lastElement - Last focusable element
   */
  trapFocus(
    container: HTMLElement,
    firstElement?: HTMLElement,
    lastElement?: HTMLElement
  ) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const first = firstElement || focusableElements[0]
    const last = lastElement || focusableElements[focusableElements.length - 1]

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }
}

// Color contrast utilities
export const ColorContrast = {
  /**
   * Calculate color contrast ratio
   * @param color1 - First color (hex)
   * @param color2 - Second color (hex)
   * @returns Contrast ratio
   */
  calculateRatio(color1: string, color2: string): number {
    const getLuminance = (hex: string): number => {
      const rgb = parseInt(hex.slice(1), 16)
      const r = (rgb >> 16) & 0xff
      const g = (rgb >> 8) & 0xff
      const b = (rgb >> 0) & 0xff

      const sRGB = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })

      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
    }

    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  },

  /**
   * Check if color combination meets WCAG AA standards
   * @param foreground - Foreground color
   * @param background - Background color
   * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
   */
  meetsWCAG(foreground: string, background: string, isLargeText = false): boolean {
    const ratio = this.calculateRatio(foreground, background)
    return isLargeText ? ratio >= 3 : ratio >= 4.5
  }
}

// Focus management utilities
export const FocusManagement = {
  /**
   * Get all focusable elements within a container
   * @param container - Container element
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(container.querySelectorAll(selector))
  },

  /**
   * Set focus to first focusable element
   * @param container - Container element
   */
  focusFirst(container: HTMLElement): boolean {
    const focusable = this.getFocusableElements(container)
    if (focusable.length > 0) {
      focusable[0].focus()
      return true
    }
    return false
  },

  /**
   * Restore focus to previously focused element
   * @param element - Element to focus
   */
  restoreFocus(element: HTMLElement | null): void {
    if (element && typeof element.focus === 'function') {
      element.focus()
    }
  }
}

// ARIA utilities
export const AriaUtils = {
  /**
   * Generate unique ID for ARIA relationships
   * @param prefix - ID prefix
   */
  generateId(prefix = 'aria'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * Create ARIA live region for announcements
   * @param container - Container to append live region
   * @param priority - Live region priority
   */
  createLiveRegion(
    container: HTMLElement = document.body,
    priority: 'polite' | 'assertive' = 'polite'
  ): HTMLElement {
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    container.appendChild(liveRegion)
    return liveRegion
  },

  /**
   * Set ARIA expanded state
   * @param element - Element to update
   * @param expanded - Expanded state
   */
  setExpanded(element: HTMLElement, expanded: boolean): void {
    element.setAttribute('aria-expanded', expanded.toString())
  },

  /**
   * Set ARIA selected state
   * @param element - Element to update
   * @param selected - Selected state
   */
  setSelected(element: HTMLElement, selected: boolean): void {
    element.setAttribute('aria-selected', selected.toString())
  }
}

// Reduced motion utilities
export const MotionPreferences = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  /**
   * Apply animation only if user doesn't prefer reduced motion
   * @param element - Element to animate
   * @param animation - Animation to apply
   */
  respectMotionPreference(element: HTMLElement, animation: () => void): void {
    if (!this.prefersReducedMotion()) {
      animation()
    }
  }
}

// Text utilities for accessibility
export const AccessibleText = {
  /**
   * Truncate text with accessible ellipsis
   * @param text - Text to truncate
   * @param maxLength - Maximum length
   */
  truncateAccessibly(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    
    const truncated = text.slice(0, maxLength - 3)
    return `${truncated}...`
  },

  /**
   * Format number for screen readers
   * @param number - Number to format
   * @param locale - Locale for formatting
   */
  formatNumberForScreenReader(number: number, locale = 'es-CO'): string {
    return new Intl.NumberFormat(locale).format(number)
  },

  /**
   * Create accessible date string
   * @param date - Date to format
   * @param locale - Locale for formatting
   */
  formatDateForScreenReader(date: Date, locale = 'es-CO'): string {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }
}

// Form accessibility utilities
export const FormAccessibility = {
  /**
   * Associate label with form control
   * @param labelId - Label element ID
   * @param controlId - Form control ID
   */
  associateLabel(labelId: string, controlId: string): void {
    const label = document.getElementById(labelId)
    const control = document.getElementById(controlId)
    
    if (label && control) {
      label.setAttribute('for', controlId)
      control.setAttribute('aria-labelledby', labelId)
    }
  },

  /**
   * Set form control error state
   * @param controlId - Form control ID
   * @param errorId - Error message ID
   * @param hasError - Whether control has error
   */
  setErrorState(controlId: string, errorId: string, hasError: boolean): void {
    const control = document.getElementById(controlId)
    
    if (control) {
      control.setAttribute('aria-invalid', hasError.toString())
      
      if (hasError) {
        control.setAttribute('aria-describedby', errorId)
      } else {
        control.removeAttribute('aria-describedby')
      }
    }
  },

  /**
   * Announce form validation results
   * @param errors - Array of error messages
   * @param fieldCount - Total number of fields
   */
  announceValidationResults(errors: string[], fieldCount: number): void {
    const message = errors.length > 0
      ? `Formulario contiene ${errors.length} errores de ${fieldCount} campos. ${errors.join('. ')}`
      : `Formulario válido. Todos los ${fieldCount} campos son correctos.`
    
    ScreenReader.announce(message, 'assertive')
  }
}

export default {
  ScreenReader,
  KeyboardNavigation,
  ColorContrast,
  FocusManagement,
  AriaUtils,
  MotionPreferences,
  AccessibleText,
  FormAccessibility
}
