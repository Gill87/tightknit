'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  page,
  pageInner,
  progressBar,
  progressSegmentActive,
  progressSegmentInactive,
  heading,
  subtitle,
  mapCard,
  mapSvg,
  locationPillWrapper,
  locationPill,
  locationDot,
  locationPending,
  reachCard,
  reachLabel,
  distancePill,
  sliderWrapper,
  sliderInput,
  sliderMinMax,
  deniedWrapper,
  deniedText,
  grantButton,
  nextButton,
} from './formStyles'

type LocationStatus = 'pending' | 'granted' | 'denied'

const DISTANCE_LABELS: Record<number, string> = {
  0.25: 'your block',
  0.5: 'your neighborhood',
  0.75: 'nearby streets',
  1: 'your community',
  1.25: 'your area',
  1.5: 'your extended area',
  1.75: 'your broader neighborhood',
  2: 'your part of town',
}

const MIN_R = 48
const MAX_R = 110

function calcCircleRadius(miles: number): number {
  return MIN_R + ((miles - 0.25) / (2 - 0.25)) * (MAX_R - MIN_R)
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    { headers: { 'Accept-Language': 'en' } }
  )
  const data = await res.json()
  const addr = data.address ?? {}
  const street = addr.road ?? addr.pedestrian ?? ''
  const area = addr.neighbourhood ?? addr.suburb ?? addr.quarter ?? addr.city_district ?? addr.city ?? addr.town ?? ''
  if (street && area) return `${street}, ${area}`
  return area || street || data.display_name?.split(',')[0] || 'your location'
}

export default function LocationPage() {
  const router = useRouter()
  const [status, setStatus] = useState<LocationStatus>('pending')
  const [cityName, setCityName] = useState<string>('')
  const [radius, setRadius] = useState<number>(0.5)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('denied')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const name = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
        setCityName(name)
        setStatus('granted')
      },
      () => setStatus('denied'),
      { timeout: 10000 }
    )
  }, [])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  const circleR = calcCircleRadius(radius)
  const distanceLabel = DISTANCE_LABELS[radius] ?? 'your neighborhood'

  return (
    <main className={page}>
      <div className={pageInner}>
        {/* Progress */}
        <div className={progressBar}>
          <div className={progressSegmentActive} />
          <div className={progressSegmentInactive} />
        </div>

        <h1 className={heading}>Where are your neighbors?</h1>
        <p className={subtitle}>We&apos;ll only show you people and requests nearby.</p>

        {status === 'denied' ? (
          <div className={deniedWrapper}>
            <p className={deniedText}>
              Tightknit needs your location to connect you with your community nearby.
            </p>
            <button className={grantButton} onClick={requestLocation}>
              Give Location Access
            </button>
          </div>
        ) : (
          <>
            {/* Map card */}
            <div
              className={mapCard}
              style={{
                background: 'var(--color-surface)',
                backgroundImage:
                  'linear-gradient(var(--tk-border) 1px, transparent 1px), linear-gradient(90deg, var(--tk-border) 1px, transparent 1px)',
                backgroundSize: '36px 36px',
              }}
            >
              <svg className={mapSvg} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
                {/* Radius ring */}
                <circle
                  cx="200"
                  cy="120"
                  r={circleR}
                  fill="rgba(193,121,69,0.15)"
                  stroke="rgba(193,121,69,0.35)"
                  strokeWidth="1.5"
                  style={{ transition: 'r 0.2s ease' }}
                />
                {/* Pin outer circle */}
                <circle cx="200" cy="120" r="20" fill="rgba(193,121,69,0.25)" />
                {/* Pin dot */}
                <circle cx="200" cy="120" r="13" fill="var(--color-primary)" />
                {/* Pin white center */}
                <circle cx="200" cy="120" r="5" fill="white" />
              </svg>

              {/* Location pill */}
              <div className={locationPillWrapper}>
                <div className={locationPill}>
                  <span className={locationDot} />
                  {status === 'pending' ? (
                    <span className={locationPending}>Finding your location…</span>
                  ) : (
                    <span>{cityName}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Reach card */}
            <div className={reachCard}>
              <p className={reachLabel}>How far do you want to reach?</p>
              <div className={distancePill}>
                {radius} mi — {distanceLabel}
              </div>
              <div className={sliderWrapper}>
                <input
                  type="range"
                  min={0.25}
                  max={2}
                  step={0.25}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className={sliderInput}
                />
                <div className={sliderMinMax}>
                  <span>0.25 mi</span>
                  <span>2 mi</span>
                </div>
              </div>
            </div>
          </>
        )}

        {status === 'granted' && (
          <button className={nextButton} onClick={() => router.push('/onboarding/superpowers')}>Next</button>
        )}
      </div>
    </main>
  )
}
