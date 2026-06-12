'use client'
import { useEffect } from 'react'
import { type AuthChangeEvent, type Session } from '@supabase/supabase-js'
import { queryClient } from '@/lib/queryClient'
import { getSupabase } from '@/lib/supabase/client'

export default function AuthStateListener() {
  useEffect(() => {
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        queryClient.setQueryData(['auth', 'user'], session?.user ?? null)
      }
      if (event === 'SIGNED_OUT') {
        queryClient.clear()
      }
    })
    return () => subscription.unsubscribe()
  }, [])
  return null
}
