import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
  {
    variants: {
      variant: {
        // Default - Subtle elegance
        default:
          'bg-[rgb(var(--surface-elevated))] border border-[rgb(var(--border))] backdrop-blur-sm',
        // Bordered - Classic with gold hint
        bordered:
          'bg-[rgb(var(--surface-elevated))] border-2 border-[rgb(var(--border))] hover:border-[rgb(var(--brand-primary)/0.3)]',
        // Elevated - Luxury shadow
        elevated:
          'bg-[rgb(var(--surface-elevated))] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] border border-[rgb(var(--border)/0.5)]',
        // Flat - Minimal
        flat: 'bg-[rgb(var(--surface))]',
        // Glass - Frosted luxury
        glass:
          'glass border border-[rgb(var(--border))] backdrop-blur-xl',
        // Glass Gold - Premium frosted with gold tint
        'glass-gold':
          'glass-gold backdrop-blur-xl',
        // Gold Bordered - Elegant gold accent
        'gold-bordered':
          'bg-[rgb(var(--surface-elevated))] border border-[rgb(var(--brand-primary)/0.3)] shadow-[0_0_20px_-5px_rgb(37_99_235/0.1)]',
        // Gold Glow - Premium with subtle gold glow
        'gold-glow':
          'bg-[rgb(var(--surface-elevated))] border border-[rgb(var(--brand-primary)/0.2)] shadow-[0_0_40px_-10px_rgb(37_99_235/0.15)]',
        // Gradient Border - Animated gradient border effect
        'gradient-border':
          'bg-[rgb(var(--surface-elevated))] border border-transparent bg-clip-padding [background:linear-gradient(rgb(var(--surface-elevated)),rgb(var(--surface-elevated)))_padding-box,linear-gradient(135deg,rgb(var(--brand-primary)/0.5),rgb(var(--brand-accent)/0.5),rgb(var(--brand-secondary)/0.5))_border-box]',
        // Dark - Deep luxurious dark
        dark:
          'bg-[rgb(var(--surface))] border border-[rgb(var(--border)/0.5)]',
      },
      padding: {
        none: '',
        xs: 'p-3',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      hoverable: {
        true: 'hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] hover:-translate-y-1 hover:border-[rgb(var(--brand-primary)/0.3)] cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hoverable: false,
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hoverable, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, hoverable, className }))}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-2', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight text-[rgb(var(--foreground))]',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-[rgb(var(--muted))] leading-relaxed', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4 border-t border-[rgb(var(--border)/0.5)]', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Additional premium card components

const CardBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgb(var(--brand-primary)/0.15)] text-[rgb(var(--brand-primary))] border border-[rgb(var(--brand-primary)/0.3)]',
      className
    )}
    {...props}
  />
))
CardBadge.displayName = 'CardBadge'

const CardImage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { aspectRatio?: 'video' | 'square' | 'portrait' }
>(({ className, aspectRatio = 'video', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'overflow-hidden rounded-xl -mx-6 -mt-6 mb-6',
      {
        'aspect-video': aspectRatio === 'video',
        'aspect-square': aspectRatio === 'square',
        'aspect-[3/4]': aspectRatio === 'portrait',
      },
      className
    )}
    {...props}
  />
))
CardImage.displayName = 'CardImage'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardBadge,
  CardImage,
  cardVariants,
}
