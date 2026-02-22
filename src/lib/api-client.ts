/**
 * API Client utility for frontend-to-backend communication
 * Auth is handled via httpOnly cookies — no tokens in JS memory
 */

const API_BASE = '/api'

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string
  private isRefreshing = false

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      // Auto-refresh on 401 (skip for auth routes and retries)
      if (response.status === 401 && !isRetry && !endpoint.startsWith('/auth/')) {
        const refreshed = await this.tryRefresh()
        if (refreshed) {
          return this.request<T>(endpoint, options, true)
        }
        return { error: 'Session expired' }
      }

      const data = await response.json()

      if (!response.ok) {
        // Extract user-friendly message from Zod validation details if available
        let errorMessage = data.error || `Request failed with status ${response.status}`
        if (data.details && Array.isArray(data.details) && data.details.length > 0) {
          errorMessage = data.details.map((d: { path?: string; message?: string }) => {
            const field = d.path?.split('.').pop()
            const label = field ? field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1') : ''
            return label ? `${label}: ${d.message}` : d.message
          }).join('. ')
        }
        return { error: errorMessage }
      }

      return { data }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Network error' }
    }
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.isRefreshing) return false
    this.isRefreshing = true
    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      return res.ok
    } catch {
      return false
    } finally {
      this.isRefreshing = false
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const searchParams = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<T>(`${endpoint}${searchParams}`)
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const api = new ApiClient()
export type { ApiResponse }
