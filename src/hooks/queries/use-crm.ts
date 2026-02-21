import { useQuery } from '@tanstack/react-query'
import { getCRMContacts, getCRMDashboard, getContactById } from '@/services/api/crm'

export const crmKeys = {
  all: ['crm'] as const,
  contacts: (params?: Record<string, string>) => [...crmKeys.all, 'contacts', params] as const,
  contact: (id: string) => [...crmKeys.all, 'contact', id] as const,
  dashboard: () => [...crmKeys.all, 'dashboard'] as const,
}

export function useCRMContacts(params?: Record<string, string>) {
  return useQuery({
    queryKey: crmKeys.contacts(params),
    queryFn: () => getCRMContacts(params),
  })
}

export function useCRMContact(id: string) {
  return useQuery({
    queryKey: crmKeys.contact(id),
    queryFn: () => getContactById(id),
    enabled: !!id,
  })
}

export function useCRMDashboard() {
  return useQuery({
    queryKey: crmKeys.dashboard(),
    queryFn: getCRMDashboard,
  })
}
