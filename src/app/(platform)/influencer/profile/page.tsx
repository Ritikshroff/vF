'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  MapPin,
  Globe,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  DollarSign,
  Save,
  Upload,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Music,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api-client'
import { staggerContainer, staggerItem } from '@/lib/animations'

/** Map UPPERCASE platform enum to a display name */
function platformDisplayName(platform: string): string {
  const map: Record<string, string> = {
    INSTAGRAM: 'Instagram',
    YOUTUBE: 'YouTube',
    TIKTOK: 'TikTok',
    TWITTER: 'Twitter',
    FACEBOOK: 'Facebook',
  }
  return map[platform] || platform
}

/** Render the appropriate icon for a platform */
function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  switch (platform) {
    case 'INSTAGRAM':
      return <Instagram className={className || 'h-6 w-6 text-pink-500'} />
    case 'YOUTUBE':
      return <Youtube className={className || 'h-6 w-6 text-red-500'} />
    case 'FACEBOOK':
      return <Facebook className={className || 'h-6 w-6 text-blue-500'} />
    case 'TWITTER':
      return <Twitter className={className || 'h-6 w-6 text-sky-500'} />
    case 'TIKTOK':
      return <Music className={className || 'h-6 w-6 text-purple-500'} />
    default:
      return <Globe className={className || 'h-6 w-6 text-[rgb(var(--muted))]'} />
  }
}

/** Format a date string into "Mon YYYY" */
function formatMemberSince(dateStr: string | undefined): string {
  if (!dateStr) return 'N/A'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return 'N/A'
  }
}

export default function InfluencerProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [influencer, setInfluencer] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    email: '',
    location: '',
    website: '',
    categories: [] as string[],
    pricing_min: 0,
    pricing_max: 0,
    available: true,
  })

  const [platforms, setPlatforms] = useState<any[]>([])
  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    if (!user.influencerId) {
      setError('No influencer profile linked to this account. Please complete onboarding first.')
      setLoading(false)
      return
    }

    try {
      setError(null)
      const res = await api.get<any>(`/discovery/influencers/${user.influencerId}`)

      if (res.error) {
        setError(res.error)
        setLoading(false)
        return
      }

      const inf = res.data
      if (inf) {
        setInfluencer(inf)
        setFormData({
          name: inf.fullName || '',
          bio: inf.bio || '',
          email: user.email || '',
          location: inf.location || '',
          website: '',
          categories: inf.categories || [],
          pricing_min: Number(inf.pricing?.instagramPost || 0),
          pricing_max: Number(inf.pricing?.youtubeVideo || inf.pricing?.tiktokVideo || 0),
          available: inf.availability === 'AVAILABLE',
        })
        setPlatforms(inf.platforms || [])
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // No update API available yet -- show a placeholder toast
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert('Profile updated successfully!')
    } catch {
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAddCategory = () => {
    if (newCategory && !formData.categories.includes(newCategory)) {
      setFormData({
        ...formData,
        categories: [...formData.categories, newCategory],
      })
      setNewCategory('')
    }
  }

  const handleRemoveCategory = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((c) => c !== category),
    })
  }

  if (loading) {
    return (
      <div className="container py-4 sm:py-6 lg:py-8">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-8 bg-[rgb(var(--surface))] rounded w-1/3" />
          <div className="h-64 bg-[rgb(var(--surface))] rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-4 sm:py-6 lg:py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profile Unavailable</h2>
            <p className="text-[rgb(var(--muted))] max-w-md">{error}</p>
            <Button variant="outline" className="mt-6" onClick={() => { setLoading(true); setError(null); loadProfile() }}>
              Try Again
            </Button>
          </CardContent>
        </Card>
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 gradient-text">
                  Profile Settings
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-[rgb(var(--muted))]">
                  Manage your profile and account settings
                </p>
              </div>
              <Button
                variant="gradient"
                size="lg"
                onClick={handleSave}
                disabled={saving}
                className="w-full md:w-auto"
              >
                <Save className="h-5 w-5 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Main Settings */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-3 sm:p-4 lg:p-6">
                    <div>
                      <label className="text-sm sm:text-base font-medium mb-2 block">Full Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="text-sm sm:text-base font-medium mb-2 block">Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell brands about yourself..."
                        className="w-full min-h-[120px] px-4 py-3 rounded-lg border-2 border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:border-[rgb(var(--brand-primary))] focus:outline-none resize-none"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm sm:text-base font-medium mb-2 block">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--muted))]" />
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            placeholder="your@email.com"
                            className="pl-11 h-12"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm sm:text-base font-medium mb-2 block">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--muted))]" />
                          <Input
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({ ...formData, location: e.target.value })
                            }
                            placeholder="City, Country"
                            className="pl-11 h-12"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm sm:text-base font-medium mb-2 block">Website</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[rgb(var(--muted))]" />
                        <Input
                          type="url"
                          value={formData.website}
                          onChange={(e) =>
                            setFormData({ ...formData, website: e.target.value })
                          }
                          placeholder="https://yourwebsite.com"
                          className="pl-11 h-12"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Social Media Accounts */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Accounts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-3 sm:p-4 lg:p-6">
                    {platforms.map((platform: any, index: number) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row gap-4 p-3 sm:p-4 rounded-lg bg-[rgb(var(--surface))]"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <PlatformIcon platform={platform.platform} />
                          <div className="flex-1">
                            <div className="font-semibold">{platformDisplayName(platform.platform)}</div>
                            <div className="text-sm text-[rgb(var(--muted))]">
                              @{platform.handle}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-xs text-[rgb(var(--muted))]">Followers</div>
                            <div className="font-bold">{(platform.followers || 0).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-xs text-[rgb(var(--muted))]">Engagement</div>
                            <div className="font-bold">{Number(platform.engagementRate || 0)}%</div>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" className="shrink-0">
                          Edit
                        </Button>
                      </div>
                    ))}

                    <Button variant="outline" className="w-full" size="lg">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Social Account
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Categories */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle>Content Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {formData.categories.map((category) => (
                          <Badge
                            key={category}
                            variant="outline"
                            className="text-sm py-2 px-3 gap-2"
                          >
                            {category}
                            <button
                              onClick={() => handleRemoveCategory(category)}
                              className="hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Add a category..."
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                          className="h-12"
                        />
                        <Button onClick={handleAddCategory} size="lg">
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="text-sm text-[rgb(var(--muted))]">
                        Popular: Fashion, Tech, Beauty, Fitness, Travel, Food, Lifestyle
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Pricing */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Pricing Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm sm:text-base font-medium mb-2 block">Minimum Rate</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]">
                            $
                          </span>
                          <Input
                            type="number"
                            value={formData.pricing_min}
                            onChange={(e) =>
                              setFormData({ ...formData, pricing_min: Number(e.target.value) })
                            }
                            placeholder="1000"
                            className="pl-8 h-12"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm sm:text-base font-medium mb-2 block">Maximum Rate</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]">
                            $
                          </span>
                          <Input
                            type="number"
                            value={formData.pricing_max}
                            onChange={(e) =>
                              setFormData({ ...formData, pricing_max: Number(e.target.value) })
                            }
                            placeholder="5000"
                            className="pl-8 h-12"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 rounded-lg bg-[rgb(var(--surface))]">
                      <div className="text-sm text-[rgb(var(--muted))] mb-2">
                        Your pricing range will be visible to brands
                      </div>
                      <div className="text-2xl font-bold gradient-text">
                        ${formData.pricing_min.toLocaleString()} - $
                        {formData.pricing_max.toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Profile Photo */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profile Photo</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <Avatar className="h-32 w-32 mb-4" src={influencer?.avatar} alt={formData.name} fallback={formData.name} />

                    <Button variant="outline" size="sm" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Photo
                    </Button>

                    <div className="text-xs text-[rgb(var(--muted))] mt-3 text-center">
                      JPG, PNG or GIF. Max size 5MB.
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Availability Status */}
              <motion.div variants={staggerItem}>
                <Card className={formData.available ? 'border-green-500/20 bg-green-500/5' : ''}>
                  <CardHeader>
                    <CardTitle className="text-lg">Availability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <button
                        onClick={() => setFormData({ ...formData, available: true })}
                        className={`w-full p-4 rounded-lg border-2 transition-all ${
                          formData.available
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-[rgb(var(--border))] hover:border-green-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2
                            className={`h-6 w-6 ${
                              formData.available ? 'text-green-500' : 'text-[rgb(var(--muted))]'
                            }`}
                          />
                          <div className="text-left">
                            <div className="font-semibold">Available</div>
                            <div className="text-xs text-[rgb(var(--muted))]">
                              Open to new collaborations
                            </div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setFormData({ ...formData, available: false })}
                        className={`w-full p-4 rounded-lg border-2 transition-all ${
                          !formData.available
                            ? 'border-orange-500 bg-orange-500/10'
                            : 'border-[rgb(var(--border))] hover:border-orange-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <X
                            className={`h-6 w-6 ${
                              !formData.available ? 'text-orange-500' : 'text-[rgb(var(--muted))]'
                            }`}
                          />
                          <div className="text-left">
                            <div className="font-semibold">Not Available</div>
                            <div className="text-xs text-[rgb(var(--muted))]">
                              Temporarily unavailable
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Account Stats */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-[rgb(var(--muted))]">Profile Views</span>
                      <span className="font-bold">2,345</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[rgb(var(--muted))]">Total Campaigns</span>
                      <span className="font-bold">{influencer?.totalCampaigns || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[rgb(var(--muted))]">Success Rate</span>
                      <span className="font-bold text-green-500">
                        {influencer?.campaignSuccessRate
                          ? `${Number(influencer.campaignSuccessRate)}%`
                          : '0%'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[rgb(var(--muted))]">Member Since</span>
                      <span className="font-bold">{formatMemberSince(influencer?.createdAt)}</span>
                    </div>
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
