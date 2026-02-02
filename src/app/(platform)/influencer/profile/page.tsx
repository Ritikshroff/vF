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
  DollarSign,
  Save,
  Upload,
  Plus,
  X,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { getInfluencerByUserId, getAllInfluencers } from '@/mock-data/influencers'
import { staggerContainer, staggerItem } from '@/lib/animations'

export default function InfluencerProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [influencer, setInfluencer] = useState<any>(null)

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
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      let inf = getInfluencerByUserId(user.id)

      // Fallback: use first influencer for demo
      if (!inf) {
        console.warn(`No influencer found for user ID: ${user.id}, using fallback influencer`)
        inf = getAllInfluencers()[0]
      }

      if (inf) {
        setInfluencer(inf)
        setFormData({
          name: inf.name,
          bio: inf.bio,
          email: inf.email,
          location: inf.location,
          website: inf.website || '',
          categories: inf.categories,
          pricing_min: inf.pricing.min,
          pricing_max: inf.pricing.max,
          available: inf.availability === 'available',
        })
        setPlatforms(inf.platforms)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert('Profile updated successfully!')
    } catch (error) {
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
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[rgb(var(--surface))] rounded w-1/3" />
          <div className="h-64 bg-[rgb(var(--surface))] rounded" />
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
          <motion.div variants={staggerItem} className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold mb-2 gradient-text">
                  Profile Settings
                </h1>
                <p className="text-sm md:text-lg text-[rgb(var(--muted))]">
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

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Main Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Full Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell brands about yourself..."
                        className="w-full min-h-[120px] px-4 py-3 rounded-lg border-2 border-[rgb(var(--border))] bg-[rgb(var(--background))] focus:border-[rgb(var(--brand-primary))] focus:outline-none resize-none"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email</label>
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
                        <label className="text-sm font-medium mb-2 block">Location</label>
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
                      <label className="text-sm font-medium mb-2 block">Website</label>
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
                  <CardContent className="space-y-4">
                    {platforms.map((platform, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row gap-4 p-4 rounded-lg bg-[rgb(var(--surface))]"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {platform.name === 'Instagram' && (
                            <Instagram className="h-6 w-6 text-pink-500" />
                          )}
                          {platform.name === 'YouTube' && (
                            <Youtube className="h-6 w-6 text-red-500" />
                          )}
                          {platform.name === 'Facebook' && (
                            <Facebook className="h-6 w-6 text-blue-500" />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold">{platform.name}</div>
                            <div className="text-sm text-[rgb(var(--muted))]">
                              @{platform.username}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-xs text-[rgb(var(--muted))]">Followers</div>
                            <div className="font-bold">{platform.followers.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-xs text-[rgb(var(--muted))]">Engagement</div>
                            <div className="font-bold">{platform.engagement_rate}%</div>
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
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Minimum Rate</label>
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
                        <label className="text-sm font-medium mb-2 block">Maximum Rate</label>
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
            <div className="space-y-6">
              {/* Profile Photo */}
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profile Photo</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <Avatar className="h-32 w-32 mb-4">
                      <img src={influencer?.avatar} alt={formData.name} />
                    </Avatar>

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
                      <span className="font-bold">{influencer?.campaigns_completed || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[rgb(var(--muted))]">Success Rate</span>
                      <span className="font-bold text-green-500">98%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[rgb(var(--muted))]">Member Since</span>
                      <span className="font-bold">Jan 2025</span>
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
