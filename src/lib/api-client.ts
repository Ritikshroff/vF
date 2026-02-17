/**
 * API Client utility for frontend-to-backend communication
 */
import { getAccessToken } from '@/lib/auth'

const API_BASE = '/api'

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
  }

  private getAuthHeaders(): Record<string, string> {
    const token = getAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        credentials: 'include', // send cookies (access_token, refresh_token)
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || `Request failed with status ${response.status}` }
      }

      return { data }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Network error' }
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
