'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { backdropVariants, modalVariants } from '@/lib/animations'

export interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const dialogSizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[90vw]',
}

const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  children,
  className,
  size = 'md',
}) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop - Luxurious dark overlay */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'relative w-full rounded-2xl bg-[rgb(var(--surface-elevated))] p-6 border border-[rgb(var(--border))]',
                'shadow-[0_24px_64px_-16px_rgba(0,0,0,0.7),0_0_32px_-8px_rgb(212_175_55/0.1)]',
                dialogSizes[size],
                className
              )}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left mb-6',
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h2
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight text-[rgb(var(--foreground))]',
      className
    )}
    {...props}
  />
)
DialogTitle.displayName = 'DialogTitle'

const DialogDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ className, ...props }) => (
  <p
    className={cn('text-sm text-[rgb(var(--muted))] leading-relaxed', className)}
    {...props}
  />
)
DialogDescription.displayName = 'DialogDescription'

const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn('', className)} {...props} />
DialogContent.displayName = 'DialogContent'

const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 mt-6 pt-6 border-t border-[rgb(var(--border)/0.5)]',
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogClose: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <button
    onClick={onClose}
    className="absolute right-4 top-4 rounded-xl p-2 text-[rgb(var(--muted))] hover:bg-[rgb(var(--surface-hover))] hover:text-[rgb(var(--foreground))] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand-primary)/0.3)]"
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </button>
)
DialogClose.displayName = 'DialogClose'

export {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogClose,
}
