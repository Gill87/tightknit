import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase } from '@/lib/supabase/client'
import type { MyPostRow } from '@/lib/queries/listings'

export function useCreateListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (listing: {
      posted_by: string
      posted_by_name: string | null
      description: string
      duration_minutes: number
      needed_by: string
      lat: number
      lng: number
      status: string
    }) => {
      const { error } = await getSupabase().from('listings').insert(listing)
      if (error) throw error
    },
    onSuccess: (_, listing) => {
      queryClient.invalidateQueries({ queryKey: ['listings', 'feed'] })
      queryClient.invalidateQueries({ queryKey: ['listings', 'mine', listing.posted_by] })
    },
  })
}

export function useUpdateListing(userId: string | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { data, error } = await getSupabase()
        .from('listings')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as MyPostRow
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(
        ['listings', 'mine', userId],
        (old: MyPostRow[] | undefined) => old?.map(r => r.id === updated.id ? updated : r) ?? []
      )
      queryClient.invalidateQueries({ queryKey: ['listing', updated.id] })
    },
  })
}

export function useDeleteListing(userId: string | null | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase().from('listings').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: (id) => {
      queryClient.setQueryData(
        ['listings', 'mine', userId],
        (old: MyPostRow[] | undefined) => old?.filter(r => r.id !== id) ?? []
      )
      queryClient.invalidateQueries({ queryKey: ['listings', 'feed'] })
    },
  })
}
