'use client'

import { useState } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { makeQueryClient } from '@/lib/query-client'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>

/**
 * App-wide providers wrapper
 * Includes theme, query client, auth, and toast providers
 */
export function Providers({ children, ...props }: ThemeProviderProps) {
  const [queryClient] = useState(() => makeQueryClient())

  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
      {...props}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            duration={4000}
            mobileOffset={16}
            toastOptions={{
              style: {
                borderRadius: '12px',
                fontSize: '14px',
                maxWidth: '420px',
              },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </NextThemesProvider>
  )
}
