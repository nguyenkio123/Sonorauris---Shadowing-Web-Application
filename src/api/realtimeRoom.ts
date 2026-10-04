import { supabase } from '../lib/supabase'
import type { BattleRoom } from '../types/battle'

type RoomListener = (room: BattleRoom) => void

const activeChannels = new Map<string, ReturnType<NonNullable<typeof supabase>['channel']>>()

/**
 * Checks whether Supabase Realtime is active.
 */
export function isRealtimeAvailable(): boolean {
  return Boolean(supabase)
}

/**
 * Subscribes to a Supabase Realtime Broadcast Channel for a specific room.
 * Allows 2 players on separate computers to sync room state in real-time.
 */
export function subscribeToRoomRealtime(
  roomCode: string,
  onUpdate: RoomListener,
  getLatestRoom?: () => BattleRoom | null
): () => void {
  if (!supabase) {
    return () => {}
  }

  const normalizedCode = roomCode.toUpperCase()
  const channelName = `battle_room_${normalizedCode}`

  // Clean up any existing channel for this code
  if (activeChannels.has(channelName)) {
    const existing = activeChannels.get(channelName)
    existing?.unsubscribe()
    activeChannels.delete(channelName)
  }

  const channel = supabase.channel(channelName, {
    config: {
      broadcast: { self: false },
    },
  })

  channel
    .on('broadcast', { event: 'room_state' }, (payload) => {
      if (payload.payload && typeof payload.payload === 'object') {
        onUpdate(payload.payload as BattleRoom)
      }
    })
    .on('broadcast', { event: 'request_state' }, () => {
      if (getLatestRoom) {
        const latest = getLatestRoom()
        if (latest) {
          void channel.send({
            type: 'broadcast',
            event: 'room_state',
            payload: latest,
          })
        }
      }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.info(`[Realtime] Connected to room channel: ${channelName}`)
      }
    })

  activeChannels.set(channelName, channel)

  return () => {
    channel.unsubscribe()
    activeChannels.delete(channelName)
  }
}

/**
 * Persists room state to Supabase database table `public.rooms` if permissions are active.
 */
export async function saveRoomToSupabase(room: BattleRoom): Promise<void> {
  if (!supabase) return
  try {
    await supabase.from('rooms').upsert({
      id: room.id,
      code: room.code.toUpperCase(),
      clip_id: room.clipId,
      status: room.status,
      room_data: room,
    })
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Fetches room state from Supabase database table `public.rooms`.
 */
export async function fetchRoomFromSupabase(code: string): Promise<BattleRoom | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('room_data')
      .eq('code', code.toUpperCase())
      .maybeSingle()
    if (!error && data && data.room_data) {
      return data.room_data as BattleRoom
    }
  } catch {
    // Non-blocking fallback
  }
  return null
}

/**
 * Requests room state from peer over Supabase Realtime broadcast channel.
 * Enables 2 players on separate computers or separate browsers to discover rooms.
 */
export async function requestRemoteRoomState(
  roomCode: string,
  timeoutMs = 3000
): Promise<BattleRoom | null> {
  if (!supabase) return null

  // 1. Try DB first (instant if table accessible)
  const fromDb = await fetchRoomFromSupabase(roomCode)
  if (fromDb) return fromDb

  const normalizedCode = roomCode.toUpperCase()
  const channelName = `battle_room_${normalizedCode}`

  let channel = activeChannels.get(channelName)
  let shouldCleanup = false

  if (!channel) {
    channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    })
    activeChannels.set(channelName, channel)
    shouldCleanup = true
  }

  return new Promise((resolve) => {
    let resolved = false
    let retryInterval: ReturnType<typeof setInterval> | null = null

    const cleanup = () => {
      if (retryInterval) clearInterval(retryInterval)
      if (shouldCleanup) {
        channel?.unsubscribe()
        activeChannels.delete(channelName)
      }
    }

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true
        cleanup()
        resolve(null)
      }
    }, timeoutMs)

    channel?.on('broadcast', { event: 'room_state' }, (payload) => {
      if (!resolved && payload && payload.payload) {
        resolved = true
        clearTimeout(timer)
        cleanup()
        resolve(payload.payload as BattleRoom)
      }
    })

    const doSend = () => {
      channel?.send({
        type: 'broadcast',
        event: 'request_state',
        payload: { roomCode: normalizedCode },
      }).catch(() => {})
    }

    channel?.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        doSend()
        retryInterval = setInterval(() => {
          if (!resolved) {
            doSend()
          } else if (retryInterval) {
            clearInterval(retryInterval)
          }
        }, 500)
      }
    })

    doSend()
  })
}

/**
 * Broadcasts an updated room state to all connected peers in the room.
 */
export async function broadcastRoomRealtime(room: BattleRoom): Promise<void> {
  if (!supabase) return

  const channelName = `battle_room_${room.code.toUpperCase()}`
  let channel = activeChannels.get(channelName)

  if (!channel) {
    channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    })
    channel.subscribe()
    activeChannels.set(channelName, channel)
  }

  try {
    await channel.send({
      type: 'broadcast',
      event: 'room_state',
      payload: room,
    })
  } catch (err) {
    console.warn(`[Realtime] Failed to broadcast room state for ${room.code}:`, err)
  }
}
