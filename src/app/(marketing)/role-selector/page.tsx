'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, UserCircle, ArrowRight, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { updateUser } from '@/lib/auth'
import { staggerContainer, staggerItem } from '@/lib/animations'

export default function RoleSelectorPage() {
  const router = useRouter()
  const { user, refreshUser, isLoading } = useAuth()
  const [selected, setSelected] = useState<'brand' | 'influencer' | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      // Not logged in, redirect to sign up
      router.push('/sign-up')
    } else if (!isLoading && user?.role && user?.onboardingCompleted) {
      // Already has role and completed onboarding, redirect to dashboard
      router.push(`/${user.role}/dashboard`)
    }
  }, [user, isLoading, router])

  const handleContinue = async () => {
    if (!selected || !user) return

    setLoading(true)
    try {
      await updateUser({ role: selected })
      refreshUser()
      // Redirect to onboarding flow
      router.push(`/onboarding/${selected}`)
    } catch (err) {
      console.error('Failed to update role:', err)
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    {
      id: 'brand' as const,
      icon: Building2,
      title: "I'm a Brand",
      description: 'Find influencers and launch campaigns to grow your business',
      features: ['Discover creators', 'Manage campaigns', 'Track analytics', 'Secure payments'],
    },
    {
      id: 'influencer' as const,
      icon: UserCircle,
      title: "I'm an Influencer",
      description: 'Get discovered by brands and monetize your influence',
      features: ['Get campaign invites', 'Showcase your work', 'Earn money', 'Build reputation'],
    },
  ]

  // Show loading while checking auth
  if (isLoading || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--brand-primary))]" />
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 sm:py-16 lg:py-20 px-4 sm:px-6">
      <div className="container max-w-5xl">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="text-center mb-8 sm:mb-10 lg:mb-12"
        >
          <motion.h1 variants={staggerItem} className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4">
            Welcome to <span className="gradient-text">ViralFluencer</span>
          </motion.h1>
          <motion.p variants={staggerItem} className="text-base sm:text-lg text-[rgb(var(--muted))]">
            Choose your role to get started
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                onClick={() => setSelected(role.id)}
                className={`cursor-pointer transition-all h-full ${
                  selected === role.id
                    ? 'border-2 border-[rgb(var(--brand-primary))] shadow-xl sm:scale-105'
                    : 'hover:border-[rgb(var(--brand-primary))] hover:shadow-lg'
                }`}
              >
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 sm:mb-6 ${
                        selected === role.id
                          ? 'bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]'
                          : 'bg-[rgb(var(--surface))]'
                      }`}
                    >
                      <role.icon
                        className={`h-8 w-8 sm:h-10 sm:w-10 ${
                          selected === role.id ? 'text-white' : 'text-[rgb(var(--muted))]'
                        }`}
                      />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{role.title}</h3>
                    <p className="text-sm sm:text-base text-[rgb(var(--muted))] mb-4 sm:mb-6">{role.description}</p>

                    <ul className="space-y-2 w-full text-left">
                      {role.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--brand-primary))] shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Button
            size="lg"
            variant="gradient"
            onClick={handleContinue}
            disabled={!selected || loading}
            className="w-full sm:w-auto sm:min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Continuing...
              </>
            ) : (
              <>
                Continue <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          <p className="text-xs sm:text-sm text-[rgb(var(--muted))] mt-3 sm:mt-4 px-4">
            You can change this later in your account settings
          </p>
        </motion.div>
      </div>
    </div>
  )
}
