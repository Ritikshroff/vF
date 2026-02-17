'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Star,
  Mail,
  Tag,
  TrendingUp,
  MessageCircle,
  UserPlus,
  CheckCircle2,
  BarChart3,
  List,
  Grid3X3,
  Activity,
  FileText,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { getCRMContacts, getCRMDashboard } from '@/services/api/crm'

export default function CRMDashboardPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  useEffect(() => {
    loadCRM()
  }, [statusFilter])

  const loadCRM = async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (statusFilter !== 'all') params.status = statusFilter.toUpperCase()

      const [contactsRes, dashboardRes] = await Promise.allSettled([
        getCRMContacts(params),
        getCRMDashboard(),
      ])

      if (contactsRes.status === 'fulfilled') {
        const data = contactsRes.value
        setContacts(Array.isArray(data) ? data : data?.data ?? [])
      }
      if (dashboardRes.status === 'fulfilled' && dashboardRes.value) {
        setActivities(dashboardRes.value.recentActivities ?? [])
      }
    } catch (err) {
      console.error('Failed to load CRM:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredContacts = contacts.filter(c => {
    if (!searchQuery) return true
    const name = c.influencer?.fullName || ''
    const categories = c.influencer?.categories || []
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categories.some((cat: string) => cat.toLowerCase().includes(searchQuery.toLowerCase()))
  })

  const stats = {
    total: contacts.length,
    active: contacts.filter(c => c.status === 'ACTIVE').length,
    potential: contacts.filter(c => c.status === 'POTENTIAL').length,
    avgRating: contacts.length > 0
      ? (contacts.reduce((sum, c) => sum + (c.influencer?.rating || 0), 0) / contacts.length).toFixed(1)
      : '0',
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'success'
      case 'POTENTIAL': return 'info'
      case 'PAST': return 'warning'
      case 'BLACKLISTED': return 'error'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--muted))]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-surface">
      <div className="container py-4 md:py-8">
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-4 sm:mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold gradient-text">Influencer CRM</h1>
                <p className="text-xs sm:text-sm text-[rgb(var(--muted))]">Manage your influencer relationships and pipeline</p>
              </div>
              <Button variant="gradient">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {[
              { label: 'Total Contacts', value: stats.total, icon: Users, color: 'text-[rgb(var(--brand-primary))]' },
              { label: 'Active Partners', value: stats.active, icon: CheckCircle2, color: 'text-[rgb(var(--success))]' },
              { label: 'In Pipeline', value: stats.potential, icon: TrendingUp, color: 'text-[rgb(var(--info))]' },
              { label: 'Avg Rating', value: `${stats.avgRating}/5`, icon: BarChart3, color: 'text-[rgb(var(--warning))]' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-[rgb(var(--surface))]">
                        <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                      </div>
                      <div>
                        <div className="text-lg sm:text-xl font-bold">{stat.value}</div>
                        <div className="text-[10px] sm:text-xs text-[rgb(var(--muted))]">{stat.label}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
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
              {filteredContacts.length === 0 ? (
                <div className="text-center py-12 text-[rgb(var(--muted))]">No contacts found.</div>
              ) : viewMode === 'list' ? (
                <motion.div variants={staggerItem} className="space-y-2 sm:space-y-3">
                  {filteredContacts.map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:border-[rgb(var(--brand-primary))]/30 transition-all cursor-pointer">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center gap-4">
                            <Avatar size="lg" src={contact.influencer?.avatar} fallback={getInitials(contact.influencer?.fullName || 'C')} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold truncate">{contact.influencer?.fullName || 'Contact'}</span>
                                <Badge variant={getStatusColor(contact.status) as any} className="text-[10px]">
                                  {(contact.status || 'unknown').toLowerCase()}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-[rgb(var(--muted))]">
                                {contact.influencer?.categories?.slice(0, 2).map((cat: string) => (
                                  <span key={cat}>{cat}</span>
                                ))}
                                {contact.influencer?.rating > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-[rgb(var(--brand-primary))]" />
                                    {contact.influencer.rating}/5
                                  </span>
                                )}
                              </div>
                              {contact.customLabels?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {contact.customLabels.map((tag: string) => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[rgb(var(--brand-primary))]/10 text-[rgb(var(--brand-primary))]">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="hidden md:flex flex-col items-end gap-1 text-sm text-[rgb(var(--muted))]">
                              <div>{contact._count?.notes || 0} notes</div>
                              <div>{contact._count?.activities || 0} activities</div>
                              <div className="text-xs">{formatRelativeTime(contact.updatedAt)}</div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {filteredContacts.map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:border-[rgb(var(--brand-primary))]/30 transition-all cursor-pointer">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar size="lg" src={contact.influencer?.avatar} fallback={getInitials(contact.influencer?.fullName || 'C')} />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold">{contact.influencer?.fullName || 'Contact'}</span>
                              </div>
                              <Badge variant={getStatusColor(contact.status) as any} className="text-[10px]">{(contact.status || 'unknown').toLowerCase()}</Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center mb-3">
                            <div className="p-2 rounded-lg bg-[rgb(var(--surface))]">
                              <div className="font-bold text-sm">{contact.influencer?.rating || '-'}</div>
                              <div className="text-[10px] text-[rgb(var(--muted))]">Rating</div>
                            </div>
                            <div className="p-2 rounded-lg bg-[rgb(var(--surface))]">
                              <div className="font-bold text-sm">{contact._count?.notes || 0}</div>
                              <div className="text-[10px] text-[rgb(var(--muted))]">Notes</div>
                            </div>
                            <div className="p-2 rounded-lg bg-[rgb(var(--surface))]">
                              <div className="font-bold text-sm">{contact._count?.activities || 0}</div>
                              <div className="text-[10px] text-[rgb(var(--muted))]">Activities</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(contact.influencer?.categories || []).map((cat: string) => (
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
            <div className="space-y-4 sm:space-y-6">
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
                    {activities.length === 0 ? (
                      <p className="text-sm text-[rgb(var(--muted))]">No recent activity.</p>
                    ) : (
                      activities.slice(0, 5).map((activity: any) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                            activity.type === 'STATUS_CHANGE' ? 'bg-[rgb(var(--success))]' :
                            activity.type === 'NOTE_ADDED' ? 'bg-[rgb(var(--info))]' :
                            'bg-[rgb(var(--muted))]'
                          }`} />
                          <div>
                            <p className="text-sm">{activity.description || activity.type?.replace(/_/g, ' ')}</p>
                            <span className="text-xs text-[rgb(var(--muted))]">{formatRelativeTime(activity.createdAt)}</span>
                          </div>
                        </div>
                      ))
                    )}
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
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
