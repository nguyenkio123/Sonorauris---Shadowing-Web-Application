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
  onUpdate: RoomListener
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
