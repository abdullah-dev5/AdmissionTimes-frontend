/**
 * Shared realtime subscription for the signed-in user's notifications.
 *
 * Layouts mount/unmount on every navigation (and twice in React StrictMode).
 * Creating and removing a Supabase channel each time raced the socket
 * teardown, so the socket was closed before it connected and no events ever
 * arrived. Instead, one channel per user lives for the whole session; layouts
 * only attach/detach listeners. The channel is closed on sign-out.
 *
 * @module services/realtime
 */

import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase, isRealtimeEnabled } from './supabase'

type Listener = () => void
type StatusListener = (live: boolean) => void

interface UserChannel {
  channel: RealtimeChannel
  listeners: Set<Listener>
  statusListeners: Set<StatusListener>
  live: boolean
}

const channels = new Map<string, UserChannel>()

const ensureChannel = (userId: string): UserChannel => {
  const existing = channels.get(userId)
  if (existing) return existing

  const entry: UserChannel = { channel: supabase.channel(`notifications-${userId}`), listeners: new Set(), statusListeners: new Set(), live: false }
  entry.channel
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` },
      () => entry.listeners.forEach((listener) => listener())
    )
    .subscribe((status) => {
      entry.live = status === 'SUBSCRIBED'
      entry.statusListeners.forEach((listener) => listener(entry.live))
    })

  channels.set(userId, entry)
  return entry
}

/**
 * Run `onNotification` whenever a notification for `userId` is inserted.
 * `onStatus` reports whether realtime is live (callers poll when it is not).
 * Returns an unsubscribe function that detaches the listeners only.
 */
export function subscribeToNotifications(userId: string, onNotification: Listener, onStatus?: StatusListener): () => void {
  if (!isRealtimeEnabled) {
    onStatus?.(false)
    return () => undefined
  }

  const entry = ensureChannel(userId)
  entry.listeners.add(onNotification)
  if (onStatus) {
    entry.statusListeners.add(onStatus)
    onStatus(entry.live)
  }

  return () => {
    entry.listeners.delete(onNotification)
    if (onStatus) entry.statusListeners.delete(onStatus)
  }
}

/** Close every realtime channel (call on sign-out / session end). */
export function closeRealtime(): void {
  channels.forEach(({ channel }) => {
    void supabase.removeChannel(channel)
  })
  channels.clear()
}
