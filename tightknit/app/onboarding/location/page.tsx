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

const RADIUS_MIN_MI = 1
const RADIUS_MAX_MI = 10

const MIN_R = 48
const MAX_R = 110

function calcCircleRadius(miles: number): number {
  const m = Math.min(RADIUS_MAX_MI, Math.max(RADIUS_MIN_MI, miles))
  return MIN_R + ((m - RADIUS_MIN_MI) / (RADIUS_MAX_MI - RADIUS_MIN_MI)) * (MAX_R - MIN_R)
}

/** Labels for any slider value in the 1–10 mi range */
function distanceLabelForMiles(miles: number): string {
  if (miles < 3) return 'your neighborhood'
  if (miles < 5.5) return 'your community'
  if (miles < 8) return 'your extended area'
  return 'your wider area'
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
  const [radius, setRadius] = useState<number>(5)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('denied')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lng: longitude })
        const name = await reverseGeocode(latitude, longitude)
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
  const distanceLabel = distanceLabelForMiles(radius)

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
                  min={RADIUS_MIN_MI}
                  max={RADIUS_MAX_MI}
                  step={0.25}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className={sliderInput}
                />
                <div className={sliderMinMax}>
                  <span>1 mi</span>
                  <span>10 mi</span>
                </div>
              </div>
            </div>
          </>
        )}

        {status === 'granted' && (
          <button className={nextButton} onClick={() => router.push(`/onboarding/superpowers?lat=${coords!.lat}&lng=${coords!.lng}&radius=${radius}`)}>Next</button>
        )}
      </div>
    </main>
  )
}
