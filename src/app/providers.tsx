'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'

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
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            style: {
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </AuthProvider>
    </NextThemesProvider>
  )
}
