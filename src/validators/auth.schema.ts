import { z } from 'zod';
import { UserRole } from '@prisma/client';

/**
 * Password validation with strength requirements
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character'
  );

/**
 * Email validation
 */
const emailSchema = z
  .string()
  .email('Invalid email address')
  .transform((email) => email.toLowerCase().trim());

/**
 * User registration schema
 */
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    // role: z.nativeEnum(UserRole).optional(), // Can be set during onboarding
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password schema
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Email verification schema
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(), // Can come from cookie
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

/**
 * Brand onboarding schema
 */
export const brandOnboardingSchema = z.object({
  companyName: z.string().min(2, 'Company name is required').max(100),
  industry: z.string().min(1, 'Industry is required'),
  website: z.string().url('Invalid website URL').optional().nullable(),
  description: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  companySize: z
    .enum([
      'STARTUP_1_10',
      'SMALL_11_50',
      'MEDIUM_51_200',
      'LARGE_201_500',
      'ENTERPRISE_501_1000',
      'ENTERPRISE_1000_PLUS',
    ])
    .optional(),
  goals: z.array(z.string()).optional(),
});

export type BrandOnboardingInput = z.infer<typeof brandOnboardingSchema>;

/**
 * Influencer onboarding schema
 */
export const influencerOnboardingSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  fullName: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  contentTypes: z.array(z.string()).optional(),
  location: z.string().max(100).optional(),
  platforms: z
    .array(
      z.object({
        platform: z.enum([
          'INSTAGRAM',
          'TIKTOK',
          'YOUTUBE',
          'TWITTER',
          'FACEBOOK',
          'LINKEDIN',
        ]),
        handle: z.string().min(1),
        followers: z.number().int().nonnegative().optional(),
      })
    )
    .min(1, 'Connect at least one platform'),
});

export type InfluencerOnboardingInput = z.infer<typeof influencerOnboardingSchema>;
