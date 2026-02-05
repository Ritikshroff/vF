import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'AuthorizationError';
  }
}

/**
 * Conflict error (duplicate resource)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Too many requests', 429, 'RATE_LIMITED', { retryAfter });
    this.name = 'RateLimitError';
  }
}

/**
 * Error response structure
 */
interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
  stack?: string;
}

/**
 * Global error handler for API routes
 */
export function errorHandler(error: unknown): NextResponse<ErrorResponse> {
  // Log error for debugging (should use proper logging in production)
  console.error('API Error:', error);

  // Handle custom AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: 'Invalid data provided',
        code: 'VALIDATION_ERROR',
      },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      {
        error: 'Database connection failed',
        code: 'DATABASE_ERROR',
      },
      { status: 503 }
    );
  }

  // Handle standard Error
  if (error instanceof Error) {
    const isDevelopment = process.env.NODE_ENV === 'development';

    return NextResponse.json(
      {
        error: isDevelopment ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        ...(isDevelopment && { stack: error.stack }),
      },
      { status: 500 }
    );
  }

  // Unknown error type
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError
): NextResponse<ErrorResponse> {
  switch (error.code) {
    case 'P2002': {
      // Unique constraint violation
      const target = error.meta?.target as string[] | undefined;
      const field = target?.[0] || 'field';
      return NextResponse.json(
        {
          error: `A record with this ${field} already exists`,
          code: 'DUPLICATE_ERROR',
          details: { field },
        },
        { status: 409 }
      );
    }

    case 'P2025':
      // Record not found
      return NextResponse.json(
        {
          error: 'Record not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );

    case 'P2003':
      // Foreign key constraint violation
      return NextResponse.json(
        {
          error: 'Related record not found',
          code: 'FOREIGN_KEY_ERROR',
        },
        { status: 400 }
      );

    case 'P2014':
      // Required relation violation
      return NextResponse.json(
        {
          error: 'The operation violates a required relation',
          code: 'RELATION_ERROR',
        },
        { status: 400 }
      );

    case 'P2016':
      // Query interpretation error
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          code: 'QUERY_ERROR',
        },
        { status: 400 }
      );

    default:
      return NextResponse.json(
        {
          error: 'Database error',
          code: 'DATABASE_ERROR',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
  }
}

/**
 * Wrapper for API route handlers with error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ErrorResponse>> {
  return handler().catch((error) => errorHandler(error) as NextResponse<T | ErrorResponse>);
}

/**
 * Assert condition or throw NotFoundError
 */
export function assertFound<T>(value: T | null | undefined, resource: string = 'Resource'): T {
  if (value === null || value === undefined) {
    throw new NotFoundError(resource);
  }
  return value;
}

/**
 * Assert condition or throw ValidationError
 */
export function assertValid(condition: boolean, message: string, details?: unknown): void {
  if (!condition) {
    throw new ValidationError(message, details);
  }
}
