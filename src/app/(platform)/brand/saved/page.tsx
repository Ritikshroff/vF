'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Search,
  Filter,
  Users,
  TrendingUp,
  Star,
  Eye,
  MessageCircle,
  X,
  Folder,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { useCRMContacts } from '@/hooks/queries/use-crm'
import { useDeleteContact } from '@/hooks/mutations/use-crm-mutations'
import { formatCompactNumber } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface CRMContact {
  id: string
  influencerId: string
  status: string
  customLabels: string[]
  internalNotes: string
  influencer: {
    id: string
    fullName: string
    avatar: string | null
    categories: string[]
    rating: number | string | null
  }
  _count: {
    notes: number
    activities: number
  }
}

export default function SavedInfluencersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | string>('all')

  const { data: contactsRaw, isLoading: loading } = useCRMContacts()
  const deleteContactMutation = useDeleteContact()

  const contacts: CRMContact[] = contactsRaw?.data ?? []

  const handleUnsave = (contactId: string) => {
    deleteContactMutation.mutate(contactId)
  }

  const filteredContacts = contacts.filter((contact) => {
    const name = contact.influencer.fullName ?? ''
    const categories = contact.influencer.categories ?? []

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categories.some((cat: string) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      )

    const matchesFilter =
      filter === 'all' || categories.includes(filter)

    return matchesSearch && matchesFilter
  })

  // Get unique categories from all contacts
  const categories: string[] = Array.from(
    new Set(
      contacts.flatMap((c) => c.influencer.categories ?? [])
    )
  ).slice(0, 6)

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[rgb(var(--surface))] rounded w-1/3" />
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-[rgb(var(--surface))] rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))]">
      <div className="container py-4 md:py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-5xl font-bold mb-2 gradient-text">
                  Saved Influencers
                </h1>
                <p className="text-sm lg:text-base xl:text-lg text-[rgb(var(--muted))]">
                  {contacts.length} influencer{contacts.length !== 1 ? 's' : ''} saved
                </p>
              </div>
              <Button variant="outline" size="lg" className="w-full md:w-auto">
                <Folder className="h-5 w-5 mr-2" />
                Create Collection
              </Button>
            </div>
          </motion.div>

          {/* Search & Filters */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-[rgb(var(--muted))]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved influencers..."
                  className="pl-10 md:pl-12 h-12 md:h-14"
                />
              </div>
            </div>

            {/* Category Filters - Mobile Scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-medium whitespace-nowrap transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg'
                    : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-medium whitespace-nowrap transition-all ${
                    filter === category
                      ? 'bg-gradient-to-r from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))] text-white shadow-lg'
                      : 'bg-[rgb(var(--surface))] text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Influencers Grid */}
          {filteredContacts.length === 0 ? (
            <Card className="text-center py-12 md:py-16">
              <CardContent>
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[rgb(var(--surface))] mb-4">
                  <Heart className="h-8 w-8 md:h-10 md:w-10 text-[rgb(var(--muted))]" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  No saved influencers
                </h3>
                <p className="text-sm md:text-base text-[rgb(var(--muted))] mb-6">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'Start saving influencers to build your list'}
                </p>
                <Link href="/brand/discover">
                  <Button variant="gradient">Discover Influencers</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {filteredContacts.map((contact) => {
                const influencer = contact.influencer
                const rating = influencer.rating != null ? Number(influencer.rating) : null
                const activitiesCount = contact._count?.activities ?? 0
                const contactCategories = influencer.categories ?? []

                return (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="border-2 hover:border-[rgb(var(--brand-primary))]/40 transition-all h-full">
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        {/* Header with Unsave Button */}
                        <div className="flex items-start justify-between mb-4">
                          <Avatar
                            className="h-16 w-16 md:h-20 md:w-20"
                            src={influencer.avatar ?? undefined}
                            alt={influencer.fullName}
                            fallback={influencer.fullName}
                          />
                          <button
                            onClick={() => handleUnsave(contact.id)}
                            className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                            title="Remove from saved"
                          >
                            <Heart className="h-5 w-5 fill-current" />
                          </button>
                        </div>

                        {/* Name & Rating */}
                        <div className="mb-3">
                          <h3 className="text-lg font-bold mb-1 line-clamp-1">
                            {influencer.fullName}
                          </h3>
                          <div className="flex items-center gap-2">
                            {rating != null && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span className="text-sm font-medium">
                                  {rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                            <span className="text-xs text-[rgb(var(--muted))]">
                              ({activitiesCount} activit{activitiesCount === 1 ? 'y' : 'ies'})
                            </span>
                          </div>
                        </div>

                        {/* Status & Labels */}
                        <div className="mb-3">
                          {contact.status && (
                            <Badge variant="outline" className="text-xs mr-2">
                              {contact.status}
                            </Badge>
                          )}
                          {(contact.customLabels ?? []).slice(0, 2).map((label) => (
                            <Badge key={label} variant="outline" className="text-xs mr-1 mb-1">
                              {label}
                            </Badge>
                          ))}
                        </div>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {contactCategories.slice(0, 2).map((category: string) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {contactCategories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{contactCategories.length - 2}
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link href={`/brand/discover/${influencer.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button variant="gradient" size="sm" className="flex-1">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
