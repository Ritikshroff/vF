import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Security headers
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    // CSP directives — relaxed in dev for hot-reload, strict in prod
    const csp = [
      "default-src 'self'",
      `script-src 'self' ${isDev ? "'unsafe-eval' 'unsafe-inline'" : "'unsafe-inline'"} https://js.stripe.com https://challenges.cloudflare.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src 'self' ${isDev ? 'ws://localhost:* http://localhost:*' : ''} https://api.stripe.com https://*.supabase.co https://*.upstash.io https://*.posthog.com https://*.sentry.io`,
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      ...(isDev ? [] : ["upgrade-insecure-requests"]),
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          ...(isDev ? [] : [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          }]),
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ];
  },

  // Standalone output for Docker
  output: 'standalone',

  // Compression
  compress: true,

  // Powered-by header removal
  poweredByHeader: false,

  // React strict mode
  reactStrictMode: true,
};

export default nextConfig;
