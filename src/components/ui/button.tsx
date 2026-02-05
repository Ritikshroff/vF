import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--background))] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap tracking-wide',
  {
    variants: {
      variant: {
        // Primary Gold - Main CTA
        primary:
          'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-[rgb(10,10,12)] hover:shadow-[0_8px_32px_-6px_rgb(212_175_55/0.4)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-[rgb(var(--brand-primary))]',
        // Secondary - Subtle Gold
        secondary:
          'bg-[rgb(var(--brand-primary)/0.15)] text-[rgb(var(--brand-primary))] border border-[rgb(var(--brand-primary)/0.3)] hover:bg-[rgb(var(--brand-primary)/0.25)] hover:border-[rgb(var(--brand-primary)/0.5)] focus-visible:ring-[rgb(var(--brand-primary))]',
        // Outline - Elegant Border
        outline:
          'border-[1.5px] border-[rgb(var(--border))] bg-transparent hover:border-[rgb(var(--brand-primary)/0.5)] hover:bg-[rgb(var(--brand-primary)/0.05)] hover:text-[rgb(var(--brand-primary))] focus-visible:ring-[rgb(var(--brand-primary))]',
        // Ghost - Minimal
        ghost:
          'bg-transparent hover:bg-[rgb(var(--surface-hover))] focus-visible:ring-[rgb(var(--brand-primary))]',
        // Gradient - Premium Feel
        gradient:
          'bg-gradient-to-r from-[rgb(var(--brand-highlight))] via-[rgb(var(--brand-primary))] to-[rgb(var(--brand-accent))] text-[rgb(10,10,12)] hover:shadow-[0_8px_32px_-6px_rgb(212_175_55/0.5)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-[rgb(var(--brand-primary))]',
        // Danger - Refined Red
        danger:
          'bg-[rgb(var(--error))] text-white hover:bg-[rgb(var(--error)/0.9)] hover:shadow-[0_4px_20px_-4px_rgb(235_87_87/0.4)] focus-visible:ring-[rgb(var(--error))]',
        // Success - Elegant Green
        success:
          'bg-[rgb(var(--success))] text-[rgb(10,10,12)] hover:bg-[rgb(var(--success)/0.9)] hover:shadow-[0_4px_20px_-4px_rgb(80_200_120/0.4)] focus-visible:ring-[rgb(var(--success))]',
        // Glass - Frosted Luxury
        glass:
          'glass-gold hover:shadow-[0_4px_20px_-4px_rgb(212_175_55/0.25)] hover:border-[rgb(var(--brand-primary)/0.3)] focus-visible:ring-[rgb(var(--brand-primary))]',
        // Link - Text Only
        link:
          'text-[rgb(var(--brand-primary))] underline-offset-4 hover:underline bg-transparent p-0 h-auto',
      },
      size: {
        xs: 'h-8 px-3 text-xs',
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !loading && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
