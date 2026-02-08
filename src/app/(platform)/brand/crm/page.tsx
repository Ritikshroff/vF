'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Star,
  Mail,
  Phone,
  Calendar,
  Tag,
  TrendingUp,
  MessageCircle,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  List,
  Grid3X3,
  ArrowUpDown,
  Activity,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { formatCompactNumber, formatDate, formatRelativeTime, getInitials } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface CRMContact {
  id: string
  name: string
  username: string
  email: string
  avatar?: string
  verified: boolean
  status: 'active' | 'potential' | 'past' | 'blacklisted'
  platforms: { name: string; followers: number; engagement: number }[]
  totalFollowers: number
  avgEngagement: number
  categories: string[]
  lastActivity: string
  campaigns: number
  rating: number
  notes: number
  tags: string[]
}

const MOCK_CONTACTS: CRMContact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    username: 'sarahcreates',
    email: 'sarah@email.com',
    verified: true,
    status: 'active',
    platforms: [
      { name: 'Instagram', followers: 245000, engagement: 4.8 },
      { name: 'TikTok', followers: 180000, engagement: 6.2 },
    ],
    totalFollowers: 425000,
    avgEngagement: 5.5,
    categories: ['Fashion', 'Lifestyle'],
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    campaigns: 5,
    rating: 5,
    notes: 12,
    tags: ['VIP', 'Long-term'],
  },
  {
    id: '2',
    name: 'Alex Rivera',
    username: 'alexfitness',
    email: 'alex@email.com',
    verified: false,
    status: 'active',
    platforms: [
      { name: 'Instagram', followers: 89000, engagement: 7.1 },
      { name: 'YouTube', followers: 156000, engagement: 3.4 },
    ],
    totalFollowers: 245000,
    avgEngagement: 5.25,
    categories: ['Fitness', 'Health'],
    lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    campaigns: 3,
    rating: 4,
    notes: 8,
    tags: ['Reliable'],
  },
  {
    id: '3',
    name: 'Mia Johnson',
    username: 'miastyle',
    email: 'mia@email.com',
    verified: true,
    status: 'potential',
    platforms: [
      { name: 'Instagram', followers: 520000, engagement: 3.9 },
      { name: 'TikTok', followers: 890000, engagement: 5.8 },
    ],
    totalFollowers: 1410000,
    avgEngagement: 4.85,
    categories: ['Beauty', 'Fashion'],
    lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    campaigns: 0,
    rating: 0,
    notes: 3,
    tags: ['High-priority', 'Outreach pending'],
  },
  {
    id: '4',
    name: 'James Park',
    username: 'jamestech',
    email: 'james@email.com',
    verified: true,
    status: 'past',
    platforms: [
      { name: 'YouTube', followers: 340000, engagement: 4.2 },
      { name: 'Twitter', followers: 120000, engagement: 2.8 },
    ],
    totalFollowers: 460000,
    avgEngagement: 3.5,
    categories: ['Tech', 'Gaming'],
    lastActivity: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    campaigns: 2,
    rating: 3,
    notes: 5,
    tags: ['Re-engage'],
  },
  {
    id: '5',
    name: 'Emma Davis',
    username: 'emmafoodie',
    email: 'emma@email.com',
    verified: false,
    status: 'active',
    platforms: [
      { name: 'Instagram', followers: 67000, engagement: 8.3 },
      { name: 'TikTok', followers: 145000, engagement: 9.1 },
    ],
    totalFollowers: 212000,
    avgEngagement: 8.7,
    categories: ['Food', 'Lifestyle'],
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    campaigns: 4,
    rating: 5,
    notes: 15,
    tags: ['Top performer', 'VIP'],
  },
]

const RECENT_ACTIVITIES = [
  { id: '1', contact: 'Sarah Chen', action: 'Completed campaign deliverables', time: '2h ago', type: 'success' },
  { id: '2', contact: 'Emma Davis', action: 'Submitted content for review', time: '5h ago', type: 'info' },
  { id: '3', contact: 'Alex Rivera', action: 'Contract signed', time: '1d ago', type: 'success' },
  { id: '4', contact: 'Mia Johnson', action: 'Outreach email sent', time: '2d ago', type: 'default' },
  { id: '5', contact: 'James Park', action: 'Campaign ended', time: '1w ago', type: 'warning' },
]

export default function CRMDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const filteredContacts = MOCK_CONTACTS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: MOCK_CONTACTS.length,
    active: MOCK_CONTACTS.filter(c => c.status === 'active').length,
    potential: MOCK_CONTACTS.filter(c => c.status === 'potential').length,
    avgEngagement: (MOCK_CONTACTS.reduce((sum, c) => sum + c.avgEngagement, 0) / MOCK_CONTACTS.length).toFixed(1),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'potential': return 'info'
      case 'past': return 'warning'
      case 'blacklisted': return 'error'
      default: return 'default'
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-surface">
      <div className="container py-4 md:py-8">
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold gradient-text">Influencer CRM</h1>
                <p className="text-sm text-[rgb(var(--muted))]">Manage your influencer relationships and pipeline</p>
              </div>
              <Button variant="gradient">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Contacts', value: stats.total, icon: Users, color: 'text-[rgb(var(--brand-primary))]' },
              { label: 'Active Partners', value: stats.active, icon: CheckCircle2, color: 'text-[rgb(var(--success))]' },
              { label: 'In Pipeline', value: stats.potential, icon: TrendingUp, color: 'text-[rgb(var(--info))]' },
              { label: 'Avg Engagement', value: `${stats.avgEngagement}%`, icon: BarChart3, color: 'text-[rgb(var(--warning))]' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[rgb(var(--surface))]">
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div>
                        <div className="text-xl font-bold">{stat.value}</div>
                        <div className="text-xs text-[rgb(var(--muted))]">{stat.label}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search & Filters */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted))]" />
                        <Input
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search contacts..."
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={statusFilter}
                          onChange={e => setStatusFilter(e.target.value)}
                          className="px-3 py-2 rounded-xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] text-sm text-[rgb(var(--foreground))] outline-none"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="potential">Potential</option>
                          <option value="past">Past</option>
                        </select>
                        <div className="flex border border-[rgb(var(--border))] rounded-xl overflow-hidden">
                          <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-[rgb(var(--brand-primary))]/20 text-[rgb(var(--brand-primary))]' : 'text-[rgb(var(--muted))]'}`}
                          >
                            <List className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-[rgb(var(--brand-primary))]/20 text-[rgb(var(--brand-primary))]' : 'text-[rgb(var(--muted))]'}`}
                          >
                            <Grid3X3 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contacts List */}
              {viewMode === 'list' ? (
                <motion.div variants={staggerItem} className="space-y-3">
                  {filteredContacts.map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:border-[rgb(var(--brand-primary))]/30 transition-all cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Avatar size="lg" fallback={getInitials(contact.name)} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold truncate">{contact.name}</span>
                                {contact.verified && (
                                  <svg className="h-4 w-4 text-[rgb(var(--brand-primary))] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                                <Badge variant={getStatusColor(contact.status) as any} className="text-[10px]">
                                  {contact.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-[rgb(var(--muted))]">
                                <span>@{contact.username}</span>
                                <span>{formatCompactNumber(contact.totalFollowers)} followers</span>
                                <span>{contact.avgEngagement}% eng.</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {contact.tags.map(tag => (
                                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[rgb(var(--brand-primary))]/10 text-[rgb(var(--brand-primary))]">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="hidden md:flex flex-col items-end gap-1 text-sm text-[rgb(var(--muted))]">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-[rgb(var(--brand-primary))]" />
                                {contact.rating > 0 ? contact.rating : '-'}/5
                              </div>
                              <div>{contact.campaigns} campaigns</div>
                              <div className="text-xs">{formatRelativeTime(contact.lastActivity)}</div>
                            </div>
                            <div className="flex gap-1">
                              <button className="p-2 rounded-lg hover:bg-[rgb(var(--surface))] text-[rgb(var(--muted))] transition-colors">
                                <Mail className="h-4 w-4" />
                              </button>
                              <button className="p-2 rounded-lg hover:bg-[rgb(var(--surface))] text-[rgb(var(--muted))] transition-colors">
                                <MessageCircle className="h-4 w-4" />
                              </button>
                              <button className="p-2 rounded-lg hover:bg-[rgb(var(--surface))] text-[rgb(var(--muted))] transition-colors">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredContacts.map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:border-[rgb(var(--brand-primary))]/30 transition-all cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar size="lg" fallback={getInitials(contact.name)} />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold">{contact.name}</span>
                                {contact.verified && (
                                  <svg className="h-3.5 w-3.5 text-[rgb(var(--brand-primary))]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <Badge variant={getStatusColor(contact.status) as any} className="text-[10px]">{contact.status}</Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center mb-3">
                            <div className="p-2 rounded-lg bg-[rgb(var(--surface))]">
                              <div className="font-bold text-sm">{formatCompactNumber(contact.totalFollowers)}</div>
                              <div className="text-[10px] text-[rgb(var(--muted))]">Followers</div>
                            </div>
                            <div className="p-2 rounded-lg bg-[rgb(var(--surface))]">
                              <div className="font-bold text-sm">{contact.avgEngagement}%</div>
                              <div className="text-[10px] text-[rgb(var(--muted))]">Engagement</div>
                            </div>
                            <div className="p-2 rounded-lg bg-[rgb(var(--surface))]">
                              <div className="font-bold text-sm">{contact.campaigns}</div>
                              <div className="text-[10px] text-[rgb(var(--muted))]">Campaigns</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {contact.categories.map(cat => (
                              <Badge key={cat} variant="outline" className="text-[10px]">{cat}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-4 w-4 text-[rgb(var(--brand-primary))]" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {RECENT_ACTIVITIES.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          activity.type === 'success' ? 'bg-[rgb(var(--success))]' :
                          activity.type === 'info' ? 'bg-[rgb(var(--info))]' :
                          activity.type === 'warning' ? 'bg-[rgb(var(--warning))]' :
                          'bg-[rgb(var(--muted))]'
                        }`} />
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">{activity.contact}</span>
                            {' '}{activity.action}
                          </p>
                          <span className="text-xs text-[rgb(var(--muted))]">{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Import Contacts
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Bulk Email
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Tag className="h-4 w-4 mr-2" />
                      Manage Tags
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Lists */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">My Lists</CardTitle>
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { name: 'VIP Creators', count: 12 },
                      { name: 'Summer Campaign', count: 8 },
                      { name: 'Tech Reviewers', count: 15 },
                      { name: 'New Leads', count: 23 },
                    ].map(list => (
                      <div key={list.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-[rgb(var(--surface))] cursor-pointer transition-colors">
                        <span className="text-sm">{list.name}</span>
                        <Badge variant="outline" className="text-[10px]">{list.count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
