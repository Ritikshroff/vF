import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Salt rounds for bcrypt - higher = more secure but slower
const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password to verify
 * @param hashedPassword - Previously hashed password to compare against
 * @returns Promise resolving to true if passwords match, false otherwise
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid flag and array of validation errors
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a secure random token for password reset or email verification
 * @param length - Length of the token (default: 32 bytes = 64 hex characters)
 * @returns Hex-encoded random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a URL-safe random token
 * @param length - Length of the token in bytes
 * @returns Base64 URL-safe encoded token
 */
export function generateUrlSafeToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Hash a token for storage (e.g., password reset tokens)
 * Using SHA-256 for one-way hashing of tokens
 * @param token - Plain text token to hash
 * @returns SHA-256 hash of the token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Compare a plain token with its hashed version
 * @param token - Plain text token
 * @param hashedToken - Previously hashed token
 * @returns true if tokens match
 */
export function compareToken(token: string, hashedToken: string): boolean {
  const tokenHash = hashToken(token);
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(tokenHash, 'hex'),
    Buffer.from(hashedToken, 'hex')
  );
}

/**
 * Password requirements for display
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireLowercase: true,
  requireUppercase: true,
  requireNumber: true,
  requireSpecial: true,
};

/**
 * Check if a password has been pwned (appears in data breaches)
 * Uses the Have I Been Pwned API with k-anonymity
 * @param password - Password to check
 * @returns Promise resolving to true if password has been pwned
 */
export async function isPasswordPwned(password: string): Promise<boolean> {
  try {
    // Create SHA-1 hash of password
    const hash = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();

    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    // Query HIBP API with hash prefix (k-anonymity)
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          'User-Agent': 'Viralfluencer-Password-Check',
        },
      }
    );

    if (!response.ok) {
      // If API fails, allow password (fail open)
      return false;
    }

    const text = await response.text();
    const lines = text.split('\n');

    // Check if suffix appears in results
    for (const line of lines) {
      const [hashSuffix] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        return true;
      }
    }

    return false;
  } catch {
    // If API call fails, allow password
    return false;
  }
}
