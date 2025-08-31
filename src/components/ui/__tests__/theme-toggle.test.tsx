import { describe, it, expect } from 'vitest'
import { getNextTheme } from '../theme-toggle'

describe('ThemeToggle helpers', () => {
  it('getNextTheme returns the opposite theme', () => {
    expect(getNextTheme('light')).toBe('dark')
    expect(getNextTheme('dark')).toBe('light')
    expect(getNextTheme(undefined)).toBe('light')
  })
})


