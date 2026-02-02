import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-[rgb(var(--surface-hover))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))]',
        primary:
          'bg-[rgb(var(--brand-primary)_/_0.1)] text-[rgb(var(--brand-primary))] border border-[rgb(var(--brand-primary)_/_0.2)]',
        secondary:
          'bg-[rgb(var(--brand-secondary)_/_0.1)] text-[rgb(var(--brand-secondary))] border border-[rgb(var(--brand-secondary)_/_0.2)]',
        success:
          'bg-[rgb(var(--success)_/_0.1)] text-[rgb(var(--success))] border border-[rgb(var(--success)_/_0.2)]',
        warning:
          'bg-[rgb(var(--warning)_/_0.1)] text-[rgb(var(--warning))] border border-[rgb(var(--warning)_/_0.2)]',
        error:
          'bg-[rgb(var(--error)_/_0.1)] text-[rgb(var(--error))] border border-[rgb(var(--error)_/_0.2)]',
        info:
          'bg-[rgb(var(--info)_/_0.1)] text-[rgb(var(--info))] border border-[rgb(var(--info)_/_0.2)]',
        outline:
          'bg-transparent text-[rgb(var(--foreground))] border border-[rgb(var(--border))]',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-base px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
