import { z } from 'zod';

/**
 * Environment variable validation using Zod.
 *
 * This module validates all environment variables at import time and provides
 * typed access to them throughout the application. If any required variables
 * are missing or invalid, the application will fail fast with a clear error.
 */

const envSchema = z
  .object({
    // ─── Application ──────────────────────────────────────────────
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    NEXT_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_APP_NAME: z.string().min(1).default('Viralfluencer'),

    // ─── Database (Supabase PostgreSQL) ────────────────────────────
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    DIRECT_URL: z.string().optional(),

    // ─── JWT Authentication ───────────────────────────────────────
    JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
    JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),

    // ─── Instagram Graph API (Optional) ───────────────────────────
    INSTAGRAM_APP_ID: z.string().optional(),
    INSTAGRAM_APP_SECRET: z.string().optional(),
    INSTAGRAM_REDIRECT_URI: z.string().url().optional(),

    // ─── Stripe Payments (Optional) ───────────────────────────────
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // ─── Redis / Upstash (Optional) ───────────────────────────────
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // ─── Email / Resend (Optional) ─────────────────────────────────
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM_ADDRESS: z.string().email().optional(),
    EMAIL_FROM_NAME: z.string().optional(),

    // ─── AWS S3 (Optional) ────────────────────────────────────────
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_S3_BUCKET: z.string().optional(),

    // ─── Cloudinary (Optional) ────────────────────────────────────
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    // ─── Monitoring & Analytics (Optional) ────────────────────────
    SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === 'production') {
        const accessLower = data.JWT_ACCESS_SECRET.toLowerCase();
        const refreshLower = data.JWT_REFRESH_SECRET.toLowerCase();

        const hasBadAccessSecret =
          accessLower.includes('change') || accessLower.includes('your-');
        const hasBadRefreshSecret =
          refreshLower.includes('change') || refreshLower.includes('your-');

        return !hasBadAccessSecret && !hasBadRefreshSecret;
      }
      return true;
    },
    {
      message:
        'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must not contain placeholder values ("change", "your-") in production. Generate secure secrets with: openssl rand -base64 64',
    }
  );

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      '❌ Invalid environment variables:',
      parsed.error.flatten().fieldErrors
    );
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = validateEnv();

/** Whether the application is running in production mode */
export const isProduction = env.NODE_ENV === 'production';

/** Whether the application is running in development mode */
export const isDevelopment = env.NODE_ENV === 'development';

/** Whether the application is running in test mode */
export const isTest = env.NODE_ENV === 'test';
