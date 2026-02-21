import { useQuery } from '@tanstack/react-query'
import { getCollaborations, getCollaborationById } from '@/services/api/collaborations'

export const collabKeys = {
  all: ['collaborations'] as const,
  list: (params?: Record<string, string>) => [...collabKeys.all, 'list', params] as const,
  detail: (id: string) => [...collabKeys.all, id] as const,
}

export function useCollaborations(params?: Record<string, string>) {
  return useQuery({
    queryKey: collabKeys.list(params),
    queryFn: () => getCollaborations(params),
  })
}

export function useCollaborationDetail(id: string) {
  return useQuery({
    queryKey: collabKeys.detail(id),
    queryFn: () => getCollaborationById(id),
    enabled: !!id,
  })
}
