import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const selectVariants = cva(
  'flex w-full appearance-none rounded-xl border text-base transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        // Default - Elegant dark
        default:
          'border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] hover:border-[rgb(var(--border-hover))] focus-visible:border-[rgb(var(--brand-primary)/0.5)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand-primary)/0.2)] focus-visible:shadow-[0_0_20px_-5px_rgb(37_99_235/0.15)]',
        // Gold - Gold accent border
        gold:
          'border-[rgb(var(--brand-primary)/0.3)] bg-[rgb(var(--surface-elevated))] hover:border-[rgb(var(--brand-primary)/0.5)] focus-visible:border-[rgb(var(--brand-primary))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand-primary)/0.3)] focus-visible:shadow-[0_0_24px_-4px_rgb(37_99_235/0.25)]',
        // Ghost - Minimal border
        ghost:
          'border-transparent bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface-hover))] focus-visible:bg-[rgb(var(--surface-elevated))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand-primary)/0.2)]',
      },
      selectSize: {
        sm: 'h-9 px-3 pr-9 text-sm',
        md: 'h-11 px-4 pr-10 text-base',
        lg: 'h-13 px-5 pr-11 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      selectSize: 'md',
    },
  }
)

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  options: SelectOption[]
  placeholder?: string
  error?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, options, placeholder, error, variant, selectSize, ...props },
    ref
  ) => {
    return (
      <div className="w-full">
        <div className="relative group">
          <select
            className={cn(
              selectVariants({ variant, selectSize }),
              error &&
                'border-[rgb(var(--error))] focus-visible:border-[rgb(var(--error))] focus-visible:ring-[rgb(var(--error)/0.2)]',
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-[rgb(var(--muted))]">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-[rgb(var(--surface-elevated))] text-[rgb(var(--foreground))]"
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted))] pointer-events-none transition-colors duration-300 group-focus-within:text-[rgb(var(--brand-primary))]" />
        </div>
        {error && (
          <p className="mt-2 text-sm text-[rgb(var(--error))] animate-in fade-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select, selectVariants }
