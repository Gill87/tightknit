'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase/client'
import * as s from './formStyles'

const RADIUS_MIN_MI = 1
const RADIUS_MAX_MI = 10

const PRESETS = [
  'Cooking & baking',
  'Moving & lifting',
  'Tech help',
  'Dog walking',
  'Grocery runs',
  'Tutoring',
  'Plant sitting',
  'Carpentry',
]

function SuperpowersInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const lat = searchParams.get('lat') ? Number(searchParams.get('lat')) : null
  const lng = searchParams.get('lng') ? Number(searchParams.get('lng')) : null
  const radiusMiles = (() => {
    const raw = searchParams.get('radius')
    if (raw == null || raw === '') return null
    const n = Number(raw)
    if (!Number.isFinite(n)) return null
    return Math.min(RADIUS_MAX_MI, Math.max(RADIUS_MIN_MI, n))
  })()

  function handlePreset(preset: string) {
    if (selected === preset) {
      setSelected(null)
      setValue('')
    } else {
      setSelected(preset)
      setValue(preset)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value)
    if (selected && e.target.value !== selected) setSelected(null)
  }

  async function handleSubmit() {
    if (!hasValue || isLoading) return
    setIsLoading(true)

    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const meta = user.user_metadata ?? {}
    const rawName =
      typeof meta.name === 'string' ? meta.name : typeof meta.full_name === 'string' ? meta.full_name : ''
    const rawUsername =
      typeof meta.username === 'string' ? meta.username : ''
    const rawPhone = typeof meta.phone === 'string' ? meta.phone : ''

    const full_name =
      rawName.trim() ||
      rawUsername.trim() ||
      null
    const username = rawUsername.trim() || null
    const phone = rawPhone.trim() || null

    await supabase.from('profiles').insert({
      id: user.id,
      full_name,
      username,
      phone,
      email: user.email ?? '',
      superpowers: value.trim(),
      lat,
      lng,
      radius_miles: radiusMiles,
    })

    router.push('/home')
  }

  const hasValue = value.trim().length > 0

  return (
    <main className={s.page}>
      <div className={s.inner}>
        <div className={s.progressBar}>
          <div className={s.progressSegmentActive} />
          <div className={s.progressSegmentActive} />
        </div>

        <h1 className={s.heading}>What's your superpower?</h1>
        <p className={s.subtitle}>What could you help a neighbor with?</p>

        <input
          className={s.textInput}
          placeholder="e.g. I'm great at fixing things"
          value={value}
          onChange={handleInputChange}
        />

        <p className={s.hint}>Pick a few that fit, or write your own ↑</p>

        <div className={s.chipsWrap}>
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePreset(preset)}
              className={selected === preset ? s.chipActive : s.chipIdle}
            >
              {preset}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!hasValue || isLoading}
          onClick={handleSubmit}
          className={`${s.ctaBase} ${hasValue ? s.ctaActive : s.ctaIdle}`}
        >
          {isLoading ? 'Saving…' : "Let's go."}
        </button>
      </div>
    </main>
  )
}

export default function SuperpowersPage() {
  return (
    <Suspense>
      <SuperpowersInner />
    </Suspense>
  )
}
