'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { tabContentVariants } from '@/lib/animations'

export interface Tab {
  id: string
  label: string
  content: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
  badge?: string | number
}

export interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  className?: string
  variant?: 'default' | 'pills' | 'underline' | 'gold'
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  className,
  variant = 'default',
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content

  const tabListVariants = {
    default: 'border-b border-[rgb(var(--border))]',
    pills: 'bg-[rgb(var(--surface))] p-1.5 rounded-xl',
    underline: 'border-b-2 border-[rgb(var(--border))]',
    gold: 'border-b border-[rgb(var(--brand-primary)/0.3)]',
  }

  const tabButtonVariants = {
    default: {
      base: 'px-4 py-3 text-sm font-medium transition-all duration-300',
      active:
        'text-[rgb(var(--brand-primary))] border-b-2 border-[rgb(var(--brand-primary))] -mb-px',
      inactive:
        'text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] border-b-2 border-transparent -mb-px',
    },
    pills: {
      base: 'px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300',
      active:
        'bg-[rgb(var(--surface-elevated))] text-[rgb(var(--brand-primary))] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)]',
      inactive:
        'text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-hover))]',
    },
    underline: {
      base: 'px-4 py-3 text-sm font-medium transition-all duration-300 relative',
      active: 'text-[rgb(var(--brand-primary))]',
      inactive: 'text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]',
    },
    gold: {
      base: 'px-5 py-3 text-sm font-medium transition-all duration-300',
      active:
        'text-[rgb(var(--brand-primary))] border-b-2 border-[rgb(var(--brand-primary))] -mb-px bg-[rgb(var(--brand-primary)/0.05)]',
      inactive:
        'text-[rgb(var(--muted))] hover:text-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-primary)/0.03)] border-b-2 border-transparent -mb-px',
    },
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div className={cn('flex space-x-1', tabListVariants[variant])}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              tabButtonVariants[variant].base,
              activeTab === tab.id
                ? tabButtonVariants[variant].active
                : tabButtonVariants[variant].inactive,
              tab.disabled && 'opacity-50 cursor-not-allowed',
              'flex items-center gap-2'
            )}
          >
            {tab.icon}
            {tab.label}

            {/* Badge */}
            {tab.badge !== undefined && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-xs font-medium rounded-full bg-[rgb(var(--brand-primary)/0.15)] text-[rgb(var(--brand-primary))]">
                {tab.badge}
              </span>
            )}

            {/* Animated underline for underline variant */}
            {variant === 'underline' && activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {activeTabContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export { Tabs }
