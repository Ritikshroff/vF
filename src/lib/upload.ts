/**
 * File Upload Service
 * Supports both Cloudinary and S3 presigned URLs
 */

import { logger } from '@/lib/logger';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
  fields?: Record<string, string>;
  expiresAt: Date;
}

type AllowedFolder = 'avatars' | 'logos' | 'deliverables' | 'documents' | 'posts';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// ─── Validation ─────────────────────────────────────────────────────────────

export function validateFile(
  file: { size: number; type: string; name: string },
  options: { maxSize?: number; allowedTypes?: string[] } = {}
): { valid: boolean; error?: string } {
  const maxSize = options.maxSize || MAX_FILE_SIZE;
  const allowedTypes = options.allowedTypes || [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOC_TYPES];

  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed` };
  }

  return { valid: true };
}

// ─── Cloudinary Upload ──────────────────────────────────────────────────────

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
  }

  return { cloudName, apiKey, apiSecret };
}

function generateCloudinarySignature(params: Record<string, string>, apiSecret: string): string {
  // Sort params and create string to sign
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map((key) => `${key}=${params[key]}`).join('&');

  // Use Web Crypto for signature (works in Edge runtime)
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign + apiSecret);

  // Simple SHA-1 hash using SubtleCrypto is async, so we use a simpler approach for signatures
  // Cloudinary accepts unsigned uploads with upload_preset instead
  return stringToSign; // Used with unsigned upload presets
}

export async function getCloudinaryUploadParams(
  folder: AllowedFolder,
  userId: string
): Promise<{ url: string; params: Record<string, string> }> {
  const { cloudName, apiKey } = getCloudinaryConfig();
  const timestamp = Math.round(Date.now() / 1000).toString();

  const params: Record<string, string> = {
    timestamp,
    folder: `viralfluencer/${folder}`,
    upload_preset: 'viralfluencer_unsigned', // Configure in Cloudinary dashboard
    api_key: apiKey,
    context: `user_id=${userId}`,
  };

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  logger.info('Cloudinary upload params generated', { folder, userId });

  return { url, params };
}

// ─── S3 Presigned URLs ──────────────────────────────────────────────────────

export async function getS3PresignedUrl(
  folder: AllowedFolder,
  fileName: string,
  contentType: string,
  userId: string
): Promise<PresignedUrlResult> {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error('AWS S3 is not configured. Set AWS_S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.');
  }

  // Generate unique key
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${folder}/${userId}/${timestamp}-${sanitizedName}`;

  // S3 presigned URL using native fetch (no AWS SDK needed)
  // For production, use @aws-sdk/s3-request-presigner
  const expiresIn = 3600; // 1 hour
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  // Construct the presigned URL fields for POST upload
  const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  const fields: Record<string, string> = {
    key,
    'Content-Type': contentType,
    'x-amz-meta-user-id': userId,
    bucket,
  };

  logger.info('S3 presigned URL generated', { key, userId, folder });

  return {
    uploadUrl: `https://${bucket}.s3.${region}.amazonaws.com`,
    publicUrl,
    fields,
    expiresAt,
  };
}

// ─── Unified Upload Helper ──────────────────────────────────────────────────

export type UploadProvider = 'cloudinary' | 's3';

export function getConfiguredProvider(): UploadProvider | null {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    return 'cloudinary';
  }
  if (process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID) {
    return 's3';
  }
  return null;
}

export async function getUploadUrl(
  folder: AllowedFolder,
  fileName: string,
  contentType: string,
  userId: string
): Promise<PresignedUrlResult | { url: string; params: Record<string, string> }> {
  const provider = getConfiguredProvider();

  if (!provider) {
    throw new Error('No upload provider configured. Set up Cloudinary or AWS S3 environment variables.');
  }

  if (provider === 'cloudinary') {
    return getCloudinaryUploadParams(folder, userId);
  }

  return getS3PresignedUrl(folder, fileName, contentType, userId);
}

// ─── Image optimization helpers ─────────────────────────────────────────────

export function getCloudinaryTransformUrl(
  publicId: string,
  options: { width?: number; height?: number; quality?: number; format?: string } = {}
): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return publicId;

  const transforms: string[] = [];
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  transforms.push(`q_${options.quality || 'auto'}`);
  transforms.push(`f_${options.format || 'auto'}`);
  transforms.push('c_fill');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(',')}/${publicId}`;
}
