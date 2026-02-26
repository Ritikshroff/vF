import * as React from 'react'
import Image from 'next/image'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, getInitials } from '@/lib/utils'

const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium transition-all duration-300',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
        '3xl': 'h-24 w-24 text-3xl',
      },
      variant: {
        // Default - Elegant dark
        default:
          'bg-[rgb(var(--surface-hover))] text-[rgb(var(--foreground))]',
        // Gold - Luxurious gold ring
        gold:
          'bg-[rgb(var(--surface-hover))] text-[rgb(var(--foreground))] ring-2 ring-[rgb(var(--brand-primary)/0.5)] ring-offset-2 ring-offset-[rgb(var(--background))]',
        // Gold Gradient - Premium gold gradient ring
        'gold-gradient':
          'bg-[rgb(var(--surface-hover))] text-[rgb(var(--foreground))] ring-2 ring-offset-2 ring-offset-[rgb(var(--background))] [--tw-ring-color:rgb(var(--brand-primary))]',
        // Bordered - Subtle border
        bordered:
          'bg-[rgb(var(--surface-hover))] text-[rgb(var(--foreground))] border-2 border-[rgb(var(--border))]',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  status?: 'online' | 'offline' | 'away' | 'busy'
  verified?: boolean
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    { className, size, variant, src, alt, fallback, status, verified, ...props },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false)

    const statusColors = {
      online: 'bg-[rgb(var(--success))]',
      offline: 'bg-[rgb(var(--muted))]',
      away: 'bg-[rgb(var(--warning))]',
      busy: 'bg-[rgb(var(--error))]',
    }

    const statusSizes = {
      xs: 'h-1.5 w-1.5 border',
      sm: 'h-2 w-2 border',
      md: 'h-2.5 w-2.5 border-2',
      lg: 'h-3 w-3 border-2',
      xl: 'h-4 w-4 border-2',
      '2xl': 'h-5 w-5 border-2',
      '3xl': 'h-6 w-6 border-2',
    }

    const verifiedSizes = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-7 w-7',
      '2xl': 'h-8 w-8',
      '3xl': 'h-9 w-9',
    }

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, variant, className }))}
        {...props}
      >
        {src && !imageError ? (
          <Image
            src={src}
            alt={alt || 'Avatar'}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-[rgb(var(--muted))]">
            {fallback ? getInitials(fallback) : alt ? getInitials(alt) : '??'}
          </span>
        )}

        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-[rgb(var(--surface-elevated))]',
              statusColors[status],
              statusSizes[size || 'md']
            )}
          />
        )}

        {verified && (
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-[rgb(var(--brand-primary))] text-white',
              verifiedSizes[size || 'md']
            )}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[60%] w-[60%]"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

const AvatarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { max?: number; size?: VariantProps<typeof avatarVariants>['size'] }
>(({ className, children, max, size = 'md', ...props }, ref) => {
  const childArray = React.Children.toArray(children)
  const visibleChildren = max ? childArray.slice(0, max) : childArray
  const remainingCount =
    max && childArray.length > max ? childArray.length - max : 0

  return (
    <div ref={ref} className={cn('flex -space-x-3', className)} {...props}>
      {visibleChildren}
      {remainingCount > 0 && (
        <div
          className={cn(
            avatarVariants({ size, variant: 'bordered' }),
            'bg-[rgb(var(--surface-elevated))] text-[rgb(var(--muted))] z-10'
          )}
        >
          <span className="text-xs font-medium">+{remainingCount}</span>
        </div>
      )}
    </div>
  )
})

AvatarGroup.displayName = 'AvatarGroup'

export { Avatar, AvatarGroup, avatarVariants }
