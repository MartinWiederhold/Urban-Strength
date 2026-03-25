'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Users } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface ChatEntry {
  customer_id:     string
  full_name:       string | null
  email:           string
  customer_status: string
  last_message:    string | null
  last_message_at: string | null
  unread_count:    number
}

export default function AdminChatListPage() {
  const [entries, setEntries]     = useState<ChatEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const t0      = performance.now()
      const supabase = createClient()

      // Single LATERAL-JOIN RPC — replaces 3 queries + JS aggregation
      const { data, error } = await supabase.rpc('get_chat_overview')

      if (error) {
        console.error('[Admin Chat] RPC error:', error)
        setLoadError(`Fehler: ${error.message}`)
        setIsLoading(false)
        return
      }

      setEntries((data ?? []) as ChatEntry[])
      console.debug(`[Admin Chat] loaded in ${Math.round(performance.now() - t0)}ms`)
      setIsLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <div className="animate-slide-up mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Chat</h1>
        <p className="text-muted-foreground mt-1">Nachrichten mit Kunden.</p>
      </div>

      {loadError && (
        <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          ⚠ {loadError}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden max-w-xl">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />)}</div>
        ) : entries.length === 0 ? (
          <div className="p-10 text-center">
            <MessageCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Noch keine Nachrichten.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map(entry => (
              <Link key={entry.customer_id} href={`/admin/chat/${entry.customer_id}`}>
                <div className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors">
                  <div className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    {entry.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {entry.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{entry.full_name ?? entry.email}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.last_message ?? 'Noch keine Nachrichten'}
                    </p>
                  </div>
                  {entry.unread_count > 0 && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
