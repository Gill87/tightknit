'use client'
import { useEffect } from 'react'
import { queryClient } from '@/lib/queryClient'
import { getSupabase } from '@/lib/supabase/client'

export default function AuthStateListener() {
  useEffect(() => {
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        queryClient.clear()
      }
    })
    return () => subscription.unsubscribe()
  }, [])
  return null
}
