import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase } from '@/lib/supabase/client'

export function useUpdateRadius(userId: string | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (radiusMiles: number) => {
      if (!userId) throw new Error('Not authenticated')
      const radius_miles = Math.round(Math.min(10, Math.max(1, radiusMiles)) * 1000) / 1000
      const { error } = await getSupabase()
        .from('profiles')
        .update({ radius_miles })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    },
  })
}

export function useGiftHours(userId: string | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ recipientId, giftHours }: { recipientId: string; giftHours: number }) => {
      const { data, error } = await getSupabase().rpc('gift_hours', {
        recipient_id: recipientId,
        gift_hours: giftHours,
      })
      if (error) throw error
      return data
    },
    onSuccess: (newBalance) => {
      queryClient.setQueryData(['profile', userId, 'balance'] as const, newBalance)
      queryClient.setQueryData(['profile', userId] as const, (old: unknown) => {
        if (!old || typeof old !== 'object') return old
        return { ...(old as object), hour_balance: newBalance }
      })
    },
  })
}

export function useAcknowledgeCompletion(userId: string | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (roomId: string) => {
      const { data, error } = await getSupabase().rpc('acknowledge_listing_completion', {
        p_room_id: roomId,
      })
      if (error) throw error
      return data as {
        finalized?: boolean
        completed_at?: string | null
        completion_ack_user_ids?: string[]
        status?: string
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId, 'balance'] })
      queryClient.invalidateQueries({ queryKey: ['listings', 'history', userId] })
    },
  })
}
