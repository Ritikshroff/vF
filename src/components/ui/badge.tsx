import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-300',
  {
    variants: {
      variant: {
        // Default - Subtle elegant
        default:
          'bg-[rgb(var(--surface-hover))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))]',
        // Primary Gold - Luxurious gold accent
        primary:
          'bg-[rgb(var(--brand-primary)/0.15)] text-[rgb(var(--brand-primary))] border border-[rgb(var(--brand-primary)/0.3)]',
        // Gold Solid - Solid gold for emphasis
        'gold-solid':
          'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-[rgb(10,10,12)] font-semibold shadow-[0_2px_8px_-2px_rgb(212_175_55/0.4)]',
        // Secondary - Copper tones
        secondary:
          'bg-[rgb(var(--brand-secondary)/0.15)] text-[rgb(var(--brand-secondary))] border border-[rgb(var(--brand-secondary)/0.3)]',
        // Copper - Warm accent
        copper:
          'bg-[rgb(var(--brand-accent)/0.15)] text-[rgb(var(--brand-accent))] border border-[rgb(var(--brand-accent)/0.3)]',
        // Success - Elegant green
        success:
          'bg-[rgb(var(--success)/0.15)] text-[rgb(var(--success))] border border-[rgb(var(--success)/0.3)]',
        // Warning - Warm amber
        warning:
          'bg-[rgb(var(--warning)/0.15)] text-[rgb(var(--warning))] border border-[rgb(var(--warning)/0.3)]',
        // Error - Refined red
        error:
          'bg-[rgb(var(--error)/0.15)] text-[rgb(var(--error))] border border-[rgb(var(--error)/0.3)]',
        // Info - Soft blue
        info:
          'bg-[rgb(var(--info)/0.15)] text-[rgb(var(--info))] border border-[rgb(var(--info)/0.3)]',
        // Outline - Minimal border only
        outline:
          'bg-transparent text-[rgb(var(--foreground))] border border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary)/0.5)]',
        // Glass - Frosted effect
        glass:
          'bg-[rgb(var(--surface-elevated)/0.6)] backdrop-blur-md text-[rgb(var(--foreground))] border border-[rgb(var(--border)/0.5)]',
      },
      size: {
        xs: 'text-xs px-2 py-0.5',
        sm: 'text-xs px-2.5 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  pulse?: boolean
}

function Badge({
  className,
  variant,
  size,
  dot,
  pulse,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full bg-current',
            pulse && 'animate-pulse'
          )}
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
