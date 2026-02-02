import * as React from 'react'
import Image from 'next/image'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, getInitials } from '@/lib/utils'

const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[rgb(var(--surface-hover))] text-[rgb(var(--foreground))] font-medium',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
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
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, status, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false)

    const statusColors = {
      online: 'bg-[rgb(var(--success))]',
      offline: 'bg-[rgb(var(--muted))]',
      away: 'bg-[rgb(var(--warning))]',
      busy: 'bg-[rgb(var(--error))]',
    }

    const statusSizes = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
      '2xl': 'h-5 w-5',
    }

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, className }))}
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
          <span>{fallback ? getInitials(fallback) : alt ? getInitials(alt) : '??'}</span>
        )}

        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-[rgb(var(--surface-elevated))]',
              statusColors[status],
              statusSizes[size || 'md']
            )}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

const AvatarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { max?: number }
>(({ className, children, max, ...props }, ref) => {
  const childArray = React.Children.toArray(children)
  const visibleChildren = max ? childArray.slice(0, max) : childArray
  const remainingCount = max && childArray.length > max ? childArray.length - max : 0

  return (
    <div
      ref={ref}
      className={cn('flex -space-x-2', className)}
      {...props}
    >
      {visibleChildren}
      {remainingCount > 0 && (
        <div className={cn(avatarVariants({ size: 'md' }), 'border-2 border-[rgb(var(--surface-elevated))]')}>
          <span className="text-xs">+{remainingCount}</span>
        </div>
      )}
    </div>
  )
})

AvatarGroup.displayName = 'AvatarGroup'

export { Avatar, AvatarGroup, avatarVariants }
