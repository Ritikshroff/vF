import { useQuery } from '@tanstack/react-query'
import { getWallet, getEscrows, getInvoices } from '@/services/api/wallet'

export const walletKeys = {
  all: ['wallet'] as const,
  balance: () => [...walletKeys.all, 'balance'] as const,
  escrows: () => [...walletKeys.all, 'escrows'] as const,
  invoices: (params?: Record<string, string>) => [...walletKeys.all, 'invoices', params] as const,
}

export function useWallet() {
  return useQuery({ queryKey: walletKeys.balance(), queryFn: () => getWallet() })
}

export function useEscrows() {
  return useQuery({ queryKey: walletKeys.escrows(), queryFn: getEscrows })
}

export function useInvoices(params?: Record<string, string>) {
  return useQuery({
    queryKey: walletKeys.invoices(params),
    queryFn: () => getInvoices(params),
  })
}
