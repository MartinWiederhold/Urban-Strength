'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload, RealtimeChannel } from '@supabase/supabase-js'

type Table = 'bookings' | 'chat_messages' | 'profiles' | 'availability'
type Event = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseRealtimeOptions {
  table: Table
  event?: Event
  filter?: string
  onData: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
}

export function useSupabaseRealtime({ table, event = '*', filter, onData }: UseRealtimeOptions) {
  useEffect(() => {
    const supabase = createClient()
    const channelName = `realtime-${table}-${event}-${filter ?? 'all'}`

    const channel: RealtimeChannel = supabase
      .channel(channelName)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        onData
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, event, filter])
}
