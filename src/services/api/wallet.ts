import { api } from '@/lib/api-client'

export async function getWallet(params?: Record<string, string>) {
  const res = await api.get<any>('/wallet', params)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function depositFunds(amount: number, paymentMethodId?: string) {
  const res = await api.post<any>('/wallet/deposit', { amount, paymentMethodId })
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function withdrawFunds(amount: number, payoutMethodId: string) {
  const res = await api.post<any>('/wallet/withdraw', { amount, payoutMethodId })
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getInvoices(params?: Record<string, string>) {
  const res = await api.get<any>('/invoices', params)
  if (res.error) throw new Error(res.error)
  return res.data
}

export async function getEscrows() {
  const res = await api.get<any>('/escrow')
  if (res.error) throw new Error(res.error)
  return res.data
}
