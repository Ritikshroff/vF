'use client'

import { useTheme as useNextTheme } from 'next-themes'

/**
 * Hook to access and manage theme
 * Re-exports next-themes useTheme with better typing
 */
export function useTheme() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme()

  return {
    theme: theme as 'light' | 'dark' | 'system' | undefined,
    setTheme: (theme: 'light' | 'dark' | 'system') => setTheme(theme),
    systemTheme: systemTheme as 'light' | 'dark' | undefined,
    resolvedTheme: resolvedTheme as 'light' | 'dark' | undefined,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    toggleTheme: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
  }
}
