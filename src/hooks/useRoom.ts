import { useCallback, useEffect, useState } from 'react'
import { getRoom } from '../api'
import type { BattleRoom } from '../types/battle'

/**
 * Custom React Hook: useRoom(code)
 * Polls getRoom(code) every ~500ms to simulate real-time WebSocket state synchronization.
 * Room state survives page reloads (F5) because it is computed from persistent timestamps.
 */
export function useRoom(code: string | undefined): {
  room: BattleRoom | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
} {
  const [room, setRoom] = useState<BattleRoom | null>(null)
  const [loading, setLoading] = useState(Boolean(code))
  const [error, setError] = useState<string | null>(null)

  const fetchRoom = useCallback(async () => {
    if (!code) {
      setRoom(null)
      setLoading(false)
      return
    }
    try {
      const data = await getRoom(code)
      if (!data) {
        setError(`Room "${code}" does not exist.`)
      } else {
        setRoom(data)
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch room state')
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    if (!code) {
      return
    }

    let isMounted = true

    const poll = async () => {
      try {
        const data = await getRoom(code)
        if (!isMounted) return
        if (!data) {
          setError(`Room "${code}" does not exist.`)
        } else {
          setRoom(data)
          setError(null)
        }
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to fetch room state')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void poll()
    const interval = setInterval(() => {
      void poll()
    }, 500)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [code])

  return { room, loading, error, refetch: fetchRoom }
}
