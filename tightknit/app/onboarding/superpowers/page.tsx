'use client'

import { useState } from 'react'
import * as s from './formStyles'

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

export default function SuperpowersPage() {
  const [value, setValue] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

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

  const hasValue = value.trim().length > 0

  return (
    <main className={s.page}>
      <div className={s.inner}>
        <div className={s.progressBar}>
          <div className={s.progressSegment} />
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
          disabled={!hasValue}
          className={`${s.ctaBase} ${hasValue ? s.ctaActive : s.ctaIdle}`}
        >
          Let's go.
        </button>
      </div>
    </main>
  )
}
