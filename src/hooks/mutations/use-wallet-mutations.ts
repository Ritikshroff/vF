import { useMutation, useQueryClient } from '@tanstack/react-query'
import { depositFunds, withdrawFunds } from '@/services/api/wallet'
import { toast } from 'sonner'
import { walletKeys } from '../queries/use-wallet'

export function useDepositFunds() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ amount, paymentMethodId }: { amount: number; paymentMethodId?: string }) =>
      depositFunds(amount, paymentMethodId),
    onSuccess: () => {
      toast.success('Deposit successful')
      queryClient.invalidateQueries({ queryKey: walletKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Deposit failed')
    },
  })
}

export function useWithdrawFunds() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ amount, payoutMethodId }: { amount: number; payoutMethodId: string }) =>
      withdrawFunds(amount, payoutMethodId),
    onSuccess: () => {
      toast.success('Withdrawal initiated')
      queryClient.invalidateQueries({ queryKey: walletKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Withdrawal failed')
    },
  })
}
