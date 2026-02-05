import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError, z } from 'zod';

/**
 * Extended request with validated data
 */
export interface ValidatedRequest<Body = unknown, Query = unknown> extends NextRequest {
  validatedBody?: Body;
  validatedQuery?: Query;
}

/**
 * Validation middleware factory for request body
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (request: NextRequest): Promise<NextResponse | T> => {
    try {
      const body = await request.json();
      const validated = schema.parse(body);
      return validated;
    } catch (error) {
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

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          {
            error: 'Invalid JSON in request body',
            code: 'INVALID_JSON',
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: 'Invalid request body',
          code: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }
  };
}

/**
 * Validation middleware factory for query parameters
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (request: NextRequest): NextResponse | T => {
    try {
      const searchParams = Object.fromEntries(request.nextUrl.searchParams);
      const validated = schema.parse(searchParams);
      return validated;
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: 'Invalid query parameters',
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

      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          code: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }
  };
}

/**
 * Validation middleware factory for route parameters
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (params: Record<string, string>): NextResponse | T => {
    try {
      const validated = schema.parse(params);
      return validated;
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: 'Invalid route parameters',
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

      return NextResponse.json(
        {
          error: 'Invalid route parameters',
          code: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }
  };
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // ID validation
  id: z.string().cuid(),

  // Email validation
  email: z.string().email('Invalid email address'),

  // Password validation
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10),
  }),

  // Sort order
  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // UUID
  uuid: z.string().uuid(),

  // Date string
  dateString: z.string().datetime(),

  // Boolean string (for query params)
  booleanString: z
    .enum(['true', 'false', '1', '0'])
    .transform((val) => val === 'true' || val === '1'),

  // Positive number string (for query params)
  positiveNumber: z.coerce.number().positive(),

  // Non-negative number string (for query params)
  nonNegativeNumber: z.coerce.number().nonnegative(),

  // Array from comma-separated string
  csvArray: z.string().transform((val) => val.split(',').filter(Boolean)),

  // Optional string that transforms empty to undefined
  optionalString: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
};

/**
 * Create a pagination schema with custom defaults
 */
export function createPaginationSchema(defaultPageSize: number = 10) {
  return z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(defaultPageSize),
  });
}

/**
 * Create a sort schema for a model
 */
export function createSortSchema<T extends readonly string[]>(allowedFields: T) {
  return z.object({
    sortBy: z.enum(allowedFields).optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  });
}

/**
 * Combine multiple schemas for a complete query validation
 */
export function createQuerySchema<
  F extends z.ZodRawShape,
  S extends readonly string[]
>(
  filterSchema: z.ZodObject<F>,
  sortFields: S,
  defaultPageSize: number = 10
) {
  return filterSchema.merge(createPaginationSchema(defaultPageSize)).merge(
    z.object({
      sortBy: z.enum(sortFields).optional(),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    })
  );
}

/**
 * Helper to safely parse request body
 */
export async function parseBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  const result = await validateBody(schema)(request);

  if (result instanceof NextResponse) {
    return { success: false, error: result };
  }

  return { success: true, data: result };
}

/**
 * Helper to safely parse query params
 */
export function parseQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; error: NextResponse } {
  const result = validateQuery(schema)(request);

  if (result instanceof NextResponse) {
    return { success: false, error: result };
  }

  return { success: true, data: result };
}

/**
 * Helper to safely parse route params
 */
export function parseParams<T>(
  params: Record<string, string>,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; error: NextResponse } {
  const result = validateParams(schema)(params);

  if (result instanceof NextResponse) {
    return { success: false, error: result };
  }

  return { success: true, data: result };
}
