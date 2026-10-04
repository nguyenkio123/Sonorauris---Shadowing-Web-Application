import { supabase } from '../lib/supabase'
import type { Clip } from '../types/clip'
import type { UserRole } from '../types/auth'
import type { Attempt } from '../types/attempt'

export function isSupabaseReady(): boolean {
  return Boolean(supabase)
}

/**
 * Maps PostgreSQL snake_case row to TypeScript Clip object
 */
export function mapDbClipToClip(row: Record<string, unknown>): Clip {
  const youtubeVideoId = String(row.youtube_video_id || row.youtubeVideoId || '')
  return {
    id: String(row.id),
    youtubeVideoId,
    title: String(row.title || ''),
    sourceUrl: String(row.source_url || row.sourceUrl || `https://www.youtube.com/watch?v=${youtubeVideoId}`),
    channelName: String(row.channel_name || row.channelName || 'YouTube'),
    thumbnailUrl: String(row.thumbnail_url || row.thumbnailUrl || `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`),
    startTimeSec: Number(row.start_time_sec ?? row.startTimeSec ?? 0),
    endTimeSec: Number(row.end_time_sec ?? row.endTimeSec ?? 10),
    durationSec: Number(row.duration_sec ?? row.durationSec ?? 10),
    referenceText: String(row.reference_text || row.referenceText || ''),
    topic: (row.topic as Clip['topic']) || 'Daily Life',
    difficulty: (row.difficulty as Clip['difficulty']) || 'Beginner',
    locale: 'en-US',
  }
}

/**
 * Maps Clip object to PostgreSQL snake_case payload
 */
export function mapClipToDbRow(clip: Partial<Clip>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (clip.id !== undefined) row.id = clip.id
  if (clip.youtubeVideoId !== undefined) row.youtube_video_id = clip.youtubeVideoId
  if (clip.title !== undefined) row.title = clip.title
  if (clip.sourceUrl !== undefined) row.source_url = clip.sourceUrl
  if (clip.channelName !== undefined) row.channel_name = clip.channelName
  if (clip.thumbnailUrl !== undefined) row.thumbnail_url = clip.thumbnailUrl
  if (clip.startTimeSec !== undefined) row.start_time_sec = clip.startTimeSec
  if (clip.endTimeSec !== undefined) row.end_time_sec = clip.endTimeSec
  if (clip.durationSec !== undefined) row.duration_sec = clip.durationSec
  if (clip.referenceText !== undefined) row.reference_text = clip.referenceText
  if (clip.topic !== undefined) row.topic = clip.topic
  if (clip.difficulty !== undefined) row.difficulty = clip.difficulty
  if (clip.locale !== undefined) row.locale = clip.locale
  return row
}

// ============================================================================
// 1. CLIPS SYNC
// ============================================================================

export async function fetchRemoteClips(): Promise<Clip[] | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .order('created_at', { ascending: true })

    if (error || !data || data.length === 0) return null
    return data.map((r) => mapDbClipToClip(r as Record<string, unknown>))
  } catch (err) {
    console.warn('[SupabaseSync] fetchRemoteClips error:', err)
    return null
  }
}

export async function upsertRemoteClip(clip: Clip): Promise<void> {
  if (!supabase) return
  try {
    const row = mapClipToDbRow(clip)
    const { error } = await supabase.from('clips').upsert(row)
    if (error) {
      console.warn('[SupabaseSync] upsertRemoteClip failed:', error.message)
    }
  } catch (err) {
    console.warn('[SupabaseSync] upsertRemoteClip error:', err)
  }
}

export async function deleteRemoteClip(id: string): Promise<void> {
  if (!supabase) return
  try {
    const { error } = await supabase.from('clips').delete().eq('id', id)
    if (error) {
      console.warn('[SupabaseSync] deleteRemoteClip failed:', error.message)
    }
  } catch (err) {
    console.warn('[SupabaseSync] deleteRemoteClip error:', err)
  }
}

// ============================================================================
// 2. USERS SYNC
// ============================================================================

export interface RemoteDbUser {
  id: string
  email: string
  display_name: string
  avatar_url: string
  role: UserRole
  streak: number
  created_at: string
}

export async function fetchRemoteUsers(): Promise<RemoteDbUser[] | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, display_name, avatar_url, role, streak, created_at')
      .order('created_at', { ascending: true })

    if (error || !data) return null
    return data as RemoteDbUser[]
  } catch (err) {
    console.warn('[SupabaseSync] fetchRemoteUsers error:', err)
    return null
  }
}

export async function upsertRemoteUser(user: {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  role?: UserRole
  streak?: number
}): Promise<void> {
  if (!supabase) return
  try {
    const payload: Record<string, unknown> = {
      id: user.id,
      email: user.email,
    }
    if (user.displayName !== undefined) payload.display_name = user.displayName
    if (user.avatarUrl !== undefined) payload.avatar_url = user.avatarUrl
    if (user.role !== undefined) payload.role = user.role
    if (user.streak !== undefined) payload.streak = user.streak

    const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' })
    if (error) {
      console.warn('[SupabaseSync] upsertRemoteUser failed:', error.message)
    }
  } catch (err) {
    console.warn('[SupabaseSync] upsertRemoteUser error:', err)
  }
}

export async function deleteRemoteUser(id: string): Promise<void> {
  if (!supabase) return
  try {
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) {
      console.warn('[SupabaseSync] deleteRemoteUser failed:', error.message)
    }
  } catch (err) {
    console.warn('[SupabaseSync] deleteRemoteUser error:', err)
  }
}

// ============================================================================
// 3. REWARD TRANSACTIONS SYNC (IMMUTABLE LEDGER)
// ============================================================================

export async function recordRemoteRewardTransactions(
  items: Array<{
    userId: string
    type: 'XP' | 'COINS'
    amount: number
    referenceType: string
    referenceId: string
  }>
): Promise<void> {
  if (!supabase || items.length === 0) return
  try {
    const rows = items.map((item) => ({
      user_id: item.userId,
      type: item.type,
      amount: item.amount,
      reference_type: item.referenceType,
      reference_id: item.referenceId,
    }))

    const { error } = await supabase
      .from('reward_transactions')
      .upsert(rows, { onConflict: 'user_id,reference_type,reference_id,type', ignoreDuplicates: true })

    if (error) {
      console.warn('[SupabaseSync] recordRemoteRewardTransactions failed:', error.message)
    }
  } catch (err) {
    console.warn('[SupabaseSync] recordRemoteRewardTransactions error:', err)
  }
}

// ============================================================================
// 4. USER ITEMS SYNC (COSMETICS)
// ============================================================================

export async function grantRemoteUserItem(userId: string, itemId: string): Promise<void> {
  if (!supabase) return
  try {
    const { error } = await supabase
      .from('user_items')
      .upsert({ user_id: userId, item_id: itemId }, { onConflict: 'user_id,item_id' })
    if (error) {
      console.warn('[SupabaseSync] grantRemoteUserItem failed:', error.message)
    }
  } catch (err) {
    console.warn('[SupabaseSync] grantRemoteUserItem error:', err)
  }
}

export async function revokeRemoteUserItem(userId: string, itemId: string): Promise<void> {
  if (!supabase) return
  try {
    const { error } = await supabase
      .from('user_items')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)
    if (error) {
      console.warn('[SupabaseSync] revokeRemoteUserItem failed:', error.message)
    }
  } catch (err) {
    console.warn('[SupabaseSync] revokeRemoteUserItem error:', err)
  }
}

// ============================================================================
// 5. ATTEMPTS SYNC
// ============================================================================

export async function recordRemoteAttempt(attempt: Attempt): Promise<void> {
  if (!supabase) return
  try {
    const { error } = await supabase.from('attempts').upsert({
      id: attempt.id,
      user_id: attempt.userId,
      clip_id: attempt.clipId,
      accuracy: attempt.result.accuracy,
      fluency: attempt.result.fluency,
      completeness: attempt.result.completeness,
      prosody: attempt.result.prosody,
      battle_score: attempt.result.battleScore,
      miscues: attempt.result.words,
      is_mock: false,
    })
    if (error) {
      console.warn('[SupabaseSync] recordRemoteAttempt failed:', error.message)
    }
  } catch (err) {
    console.warn('[SupabaseSync] recordRemoteAttempt error:', err)
  }
}
