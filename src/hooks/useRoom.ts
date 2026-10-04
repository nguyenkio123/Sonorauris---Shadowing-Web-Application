import { useCallback, useEffect, useState } from 'react'
import { getRoom } from '../api'
import { subscribeToRoomRealtime } from '../api/realtimeRoom'
import { getRoomByCode, saveRoom } from '../api/storage'
import type { BattleRoom } from '../types/battle'

/**
 * Custom React Hook: useRoom(code)
 * Subscribes to Supabase Realtime Broadcast Channel (<50ms sync) with a ~500ms
 * polling heartbeat fallback. Room state survives page reloads (F5).
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

    // 1. Subscribe to Supabase Realtime Broadcast Channel for instant push updates & state responding
    const unsubscribe = subscribeToRoomRealtime(
      code,
      (remoteRoom) => {
        if (!isMounted) return
        setRoom(remoteRoom)
        saveRoom(remoteRoom)
        setError(null)
      },
      () => getRoomByCode(code)
    )

    // 2. Heartbeat polling as reliable fallback & state machine ticker
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
      unsubscribe()
    }
  }, [code])

  return { room, loading, error, refetch: fetchRoom }
}

