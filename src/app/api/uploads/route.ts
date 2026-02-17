/**
 * File Upload API
 * POST /api/uploads - Get a presigned upload URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/api/with-middleware';
import { getUploadUrl, validateFile, getConfiguredProvider } from '@/lib/upload';
import { AuthenticatedUser } from '@/middleware/auth.middleware';

const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().min(1),
  fileSize: z.number().positive().max(10 * 1024 * 1024), // 10MB max
  folder: z.enum(['avatars', 'logos', 'deliverables', 'documents', 'posts']),
});

export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  const body = await request.json();
  const input = uploadSchema.parse(body);

  // Validate file
  const validation = validateFile({
    size: input.fileSize,
    type: input.contentType,
    name: input.fileName,
  });

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Check if upload provider is configured
  const provider = getConfiguredProvider();
  if (!provider) {
    return NextResponse.json(
      { error: 'File upload is not configured. Contact admin.' },
      { status: 503 }
    );
  }

  const result = await getUploadUrl(input.folder, input.fileName, input.contentType, user.id);

  return NextResponse.json({ provider, ...result });
});
