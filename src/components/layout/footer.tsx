import Link from 'next/link'
import { Instagram, Twitter, Linkedin, Facebook, Youtube } from 'lucide-react'
import { APP_NAME, FOOTER_LINKS, SOCIAL_LINKS } from '@/lib/constants'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialIcons = {
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
    facebook: Facebook,
    youtube: Youtube,
  }

  return (
    <footer className="border-t border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[rgb(var(--brand-primary))] to-[rgb(var(--brand-secondary))]" />
              <span className="text-lg font-bold gradient-text">{APP_NAME}</span>
            </Link>
            <p className="text-sm text-[rgb(var(--muted))] mb-6">
              The premier platform connecting brands with top creators for authentic influencer marketing campaigns.
            </p>
            <div className="flex space-x-3">
              {Object.entries(socialIcons).map(([platform, Icon]) => (
                <a
                  key={platform}
                  href={SOCIAL_LINKS[platform as keyof typeof SOCIAL_LINKS]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-[rgb(var(--muted))] hover:text-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--surface-hover))] transition-colors"
                  aria-label={`Follow us on ${platform}`}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-[rgb(var(--foreground))] mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--brand-primary))] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[rgb(var(--border))] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[rgb(var(--muted))]">
            © {currentYear} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-[rgb(var(--muted))]">
            <Link href="/privacy" className="hover:text-[rgb(var(--brand-primary))] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[rgb(var(--brand-primary))] transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-[rgb(var(--brand-primary))] transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
