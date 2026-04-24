import { useEffect, useRef } from 'react'
import { recordUniqueView } from '../services/poemService'

const VIEW_THRESHOLD_MS = 5000
const POLLING_INTERVAL_MS = 1000

function generateDeviceId() {
  try {
    const existing = localStorage.getItem('device_id')
    if (existing) return existing

    const newId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
    localStorage.setItem('device_id', newId)
    return newId
  } catch (error) {
    // Fallback if localStorage is disabled (e.g. strict incognito)
    // Generate an ephemeral ID for this session
    return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
  }
}

export function useViewTracker(poemId) {
  const activeTimeRef = useRef(0)
  const timerRef = useRef(null)
  const hasTrackedRef = useRef(false)

  useEffect(() => {
    if (!poemId) return

    const deviceId = generateDeviceId()

    try {
      const viewedPoems = JSON.parse(localStorage.getItem('viewed_poems') || '[]')
      if (viewedPoems.includes(poemId)) {
        hasTrackedRef.current = true
        return // Already viewed
      }
    } catch (e) {
      // Ignore parse error
    }

    const checkVisibilityAndTrack = () => {
      if (hasTrackedRef.current) return

      if (document.visibilityState === 'visible') {
        activeTimeRef.current += POLLING_INTERVAL_MS

        if (activeTimeRef.current >= VIEW_THRESHOLD_MS) {
          hasTrackedRef.current = true
          clearInterval(timerRef.current)

          recordUniqueView(poemId, deviceId).then((result) => {
            if (!result.error || result.error.code === '23505') {
              try {
                const viewed = JSON.parse(localStorage.getItem('viewed_poems') || '[]')
                if (!viewed.includes(poemId)) {
                  viewed.push(poemId)
                  localStorage.setItem('viewed_poems', JSON.stringify(viewed))
                }
              } catch (e) {
                // Ignore storage error
              }
            } else {
              console.error('View tracking failed:', result.error.message || result.error)
              // Reset tracked flag so it can retry later if it was a network error
              hasTrackedRef.current = false
              
              // Restart the timer to retry if we haven't successfully recorded
              timerRef.current = setInterval(checkVisibilityAndTrack, POLLING_INTERVAL_MS)
            }
          })
        }
      }
    }

    timerRef.current = setInterval(checkVisibilityAndTrack, POLLING_INTERVAL_MS)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [poemId])
}
