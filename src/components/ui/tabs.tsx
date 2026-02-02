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
}

export interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  className?: string
  variant?: 'default' | 'pills' | 'underline'
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
    pills: 'bg-[rgb(var(--surface))] p-1 rounded-lg',
    underline: 'border-b-2 border-[rgb(var(--border))]',
  }

  const tabButtonVariants = {
    default: {
      base: 'px-4 py-2.5 text-sm font-medium transition-all',
      active: 'text-[rgb(var(--brand-primary))] border-b-2 border-[rgb(var(--brand-primary))] -mb-px',
      inactive: 'text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] border-b-2 border-transparent -mb-px',
    },
    pills: {
      base: 'px-4 py-2 text-sm font-medium rounded-md transition-all',
      active: 'bg-[rgb(var(--surface-elevated))] text-[rgb(var(--brand-primary))] shadow-sm',
      inactive: 'text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-hover))]',
    },
    underline: {
      base: 'px-4 py-2.5 text-sm font-medium transition-all relative',
      active: 'text-[rgb(var(--brand-primary))]',
      inactive: 'text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]',
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

            {/* Animated underline for underline variant */}
            {variant === 'underline' && activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(var(--brand-primary))]"
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
