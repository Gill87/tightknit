import { useQuery } from '@tanstack/react-query'
import { getSupabase } from '@/lib/supabase/client'

export type RawListing = {
  id: string
  posted_by: string
  posted_by_name: string | null
  created_at: string
  description: string
  duration_minutes: number
  lat: number | null
  lng: number | null
  status: string
  claimed_by: string | null
  completed_at: string | null
  needed_by: string | null
}

export type MyPostRow = {
  id: string
  description: string | null
  duration_minutes: number | null
  needed_by: string | null
  status: string
  claimed_by: string | null
  claimed_at: string | null
  completed_at: string | null
  created_at: string
}

export type HistoryQueryData = {
  listings: {
    id: string
    description: string | null
    duration_minutes: number | null
    completed_at: string | null
    posted_by: string | null
  }[]
  nameById: Record<string, string>
}

export function useHomeFeed() {
  return useQuery({
    queryKey: ['listings', 'feed'] as const,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from('listings')
        .select('*')
        .eq('status', 'open')
        .is('claimed_by', null)
        .is('completed_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as RawListing[]
    },
    staleTime: 60_000,
  })
}

export function useMyPosts(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['listings', 'mine', userId] as const,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from('listings')
        .select('id, description, duration_minutes, needed_by, status, claimed_by, claimed_at, completed_at, created_at')
        .eq('posted_by', userId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as MyPostRow[]
    },
    enabled: !!userId,
    staleTime: 60_000,
  })
}

export function useListingDetail(id: string | null | undefined) {
  return useQuery({
    queryKey: ['listing', id] as const,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from('listings')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as RawListing & { needed_by: string | null }
    },
    enabled: !!id,
    staleTime: 2 * 60_000,
  })
}

export function useMyHistory(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['listings', 'history', userId] as const,
    queryFn: async (): Promise<HistoryQueryData> => {
      const supabase = getSupabase()
      const { data: completedListings } = await supabase
        .from('listings')
        .select('id, description, duration_minutes, completed_at, posted_by')
        .eq('completed_by', userId!)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })

      const listings = (completedListings ?? []) as HistoryQueryData['listings']
      const posterIds = [...new Set(listings.map(r => r.posted_by).filter((id): id is string => !!id))]

      let nameById: Record<string, string> = {}
      if (posterIds.length > 0) {
        const { data: posters } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', posterIds)
        if (posters) {
          nameById = Object.fromEntries(
            (posters as { id: string; full_name: string | null }[]).map(p => [
              p.id,
              p.full_name?.trim() || 'Neighbor',
            ])
          )
        }
      }

      return { listings, nameById }
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
  })
}
