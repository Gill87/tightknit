import { useQuery } from '@tanstack/react-query'
import { getSupabase } from '@/lib/supabase/client'

export type ProfileData = {
  full_name: string | null
  username: string | null
  lat: number | null
  lng: number | null
  radius_miles: unknown
  hour_balance: unknown
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'user'] as const,
    queryFn: async () => {
      const { data: { user } } = await getSupabase().auth.getUser()
      return user
    },
    staleTime: 5 * 60_000,
  })
}

export function useProfile(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['profile', userId] as const,
    queryFn: async () => {
      const { data } = await getSupabase()
        .from('profiles')
        .select('full_name, username, lat, lng, radius_miles, hour_balance')
        .eq('id', userId!)
        .maybeSingle()
      return data as ProfileData | null
    },
    enabled: !!userId,
    staleTime: 10 * 60_000,
  })
}

export function useHourBalance(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['profile', userId, 'balance'] as const,
    queryFn: async () => {
      const { data } = await getSupabase()
        .from('profiles')
        .select('hour_balance')
        .eq('id', userId!)
        .maybeSingle()
      return data?.hour_balance ?? null
    },
    enabled: !!userId,
    staleTime: 30_000,
  })
}
