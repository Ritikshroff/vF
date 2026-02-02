'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'
import { AuthProvider } from '@/contexts/auth-context'

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>

/**
 * App-wide providers wrapper
 * Includes theme provider for dark mode support and auth provider
 */
export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
      {...props}
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </NextThemesProvider>
  )
}
