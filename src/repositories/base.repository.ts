import { prisma, PrismaClient } from '@/lib/db/prisma';

// Pagination parameters
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Paginated result structure
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Sort parameters
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

// Default pagination values
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

/**
 * Base repository class with common CRUD operations
 * Extend this class for specific model repositories
 */
export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient;
  protected abstract modelName: string;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Get the Prisma model delegate
   * This should be overridden in child classes for proper typing
   */
  protected get model(): unknown {
    return (this.prisma as unknown as Record<string, unknown>)[this.modelName];
  }

  /**
   * Find a single record by ID
   */
  async findById(id: string): Promise<T | null> {
    const model = this.model as { findUnique: (args: { where: { id: string } }) => Promise<T | null> };
    return model.findUnique({
      where: { id },
    });
  }

  /**
   * Find a single record by unique field
   */
  async findByUnique(where: Record<string, unknown>): Promise<T | null> {
    const model = this.model as { findUnique: (args: { where: Record<string, unknown> }) => Promise<T | null> };
    return model.findUnique({
      where,
    });
  }

  /**
   * Find the first record matching criteria
   */
  async findFirst(where: Record<string, unknown>): Promise<T | null> {
    const model = this.model as { findFirst: (args: { where: Record<string, unknown> }) => Promise<T | null> };
    return model.findFirst({
      where,
    });
  }

  /**
   * Find many records with pagination
   */
  async findMany(
    where: Record<string, unknown> = {},
    pagination: PaginationParams = { page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE },
    include?: Record<string, unknown>,
    orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[]
  ): Promise<PaginatedResult<T>> {
    const { page, pageSize } = this.normalizePagination(pagination);
    const skip = (page - 1) * pageSize;

    const model = this.model as {
      findMany: (args: {
        where: Record<string, unknown>;
        skip: number;
        take: number;
        include?: Record<string, unknown>;
        orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
      }) => Promise<T[]>;
      count: (args: { where: Record<string, unknown> }) => Promise<number>;
    };

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        skip,
        take: pageSize,
        include,
        orderBy,
      }),
      model.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Find all records without pagination
   */
  async findAll(
    where: Record<string, unknown> = {},
    include?: Record<string, unknown>,
    orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[]
  ): Promise<T[]> {
    const model = this.model as {
      findMany: (args: {
        where: Record<string, unknown>;
        include?: Record<string, unknown>;
        orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
      }) => Promise<T[]>;
    };

    return model.findMany({
      where,
      include,
      orderBy,
    });
  }

  /**
   * Create a new record
   */
  async create(data: CreateInput, include?: Record<string, unknown>): Promise<T> {
    const model = this.model as {
      create: (args: { data: CreateInput; include?: Record<string, unknown> }) => Promise<T>;
    };

    return model.create({
      data,
      include,
    });
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: UpdateInput, include?: Record<string, unknown>): Promise<T> {
    const model = this.model as {
      update: (args: {
        where: { id: string };
        data: UpdateInput;
        include?: Record<string, unknown>;
      }) => Promise<T>;
    };

    return model.update({
      where: { id },
      data,
      include,
    });
  }

  /**
   * Update many records
   */
  async updateMany(where: Record<string, unknown>, data: UpdateInput): Promise<{ count: number }> {
    const model = this.model as {
      updateMany: (args: { where: Record<string, unknown>; data: UpdateInput }) => Promise<{ count: number }>;
    };

    return model.updateMany({
      where,
      data,
    });
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<T> {
    const model = this.model as {
      delete: (args: { where: { id: string } }) => Promise<T>;
    };

    return model.delete({
      where: { id },
    });
  }

  /**
   * Delete many records
   */
  async deleteMany(where: Record<string, unknown>): Promise<{ count: number }> {
    const model = this.model as {
      deleteMany: (args: { where: Record<string, unknown> }) => Promise<{ count: number }>;
    };

    return model.deleteMany({
      where,
    });
  }

  /**
   * Count records matching criteria
   */
  async count(where: Record<string, unknown> = {}): Promise<number> {
    const model = this.model as {
      count: (args: { where: Record<string, unknown> }) => Promise<number>;
    };

    return model.count({ where });
  }

  /**
   * Check if a record exists
   */
  async exists(where: Record<string, unknown>): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  /**
   * Upsert (create or update) a record
   */
  async upsert(
    where: Record<string, unknown>,
    create: CreateInput,
    update: UpdateInput
  ): Promise<T> {
    const model = this.model as {
      upsert: (args: {
        where: Record<string, unknown>;
        create: CreateInput;
        update: UpdateInput;
      }) => Promise<T>;
    };

    return model.upsert({
      where,
      create,
      update,
    });
  }

  /**
   * Normalize pagination parameters
   */
  protected normalizePagination(pagination: PaginationParams): PaginationParams {
    let { page, pageSize } = pagination;

    // Ensure page is at least 1
    page = Math.max(1, page || DEFAULT_PAGE);

    // Ensure pageSize is within bounds
    pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSize || DEFAULT_PAGE_SIZE));

    return { page, pageSize };
  }

  /**
   * Build orderBy clause from sort params
   */
  protected buildOrderBy(
    sort?: SortParams | SortParams[]
  ): Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[] | undefined {
    if (!sort) return undefined;

    if (Array.isArray(sort)) {
      return sort.map((s) => ({ [s.field]: s.order }));
    }

    return { [sort.field]: sort.order };
  }
}

/**
 * Helper function to create pagination params from query string
 */
export function parsePaginationParams(
  page?: string | number | null,
  pageSize?: string | number | null
): PaginationParams {
  return {
    page: typeof page === 'string' ? parseInt(page, 10) || DEFAULT_PAGE : page || DEFAULT_PAGE,
    pageSize:
      typeof pageSize === 'string'
        ? parseInt(pageSize, 10) || DEFAULT_PAGE_SIZE
        : pageSize || DEFAULT_PAGE_SIZE,
  };
}
