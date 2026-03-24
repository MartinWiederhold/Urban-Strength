'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Users } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile, ChatMessage } from '@/lib/types'

export default function AdminChatListPage() {
  const [customers, setCustomers] = useState<Array<Profile & { lastMessage?: ChatMessage; unreadCount: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false })

      if (!profiles) { setIsLoading(false); return }

      const { data: adminProfile } = await supabase.from('profiles').select('id').eq('role', 'admin').single()

      const enriched = await Promise.all(
        profiles.map(async (p: Profile) => {
          const [lastMsgRes, unreadRes] = await Promise.all([
            supabase.from('chat_messages').select('*')
              .or(`and(sender_id.eq.${p.id},receiver_id.eq.${adminProfile?.id}),and(sender_id.eq.${adminProfile?.id},receiver_id.eq.${p.id})`)
              .order('created_at', { ascending: false }).limit(1),
            supabase.from('chat_messages').select('id', { count: 'exact' })
              .eq('sender_id', p.id)
              .eq('receiver_id', adminProfile?.id ?? '')
              .eq('is_read', false),
          ])
          return { ...p, lastMessage: lastMsgRes.data?.[0] as ChatMessage | undefined, unreadCount: unreadRes.count ?? 0 }
        })
      )

      setCustomers(
        enriched
          .filter(c => c.lastMessage || c.unreadCount > 0)
          .concat(enriched.filter(c => !c.lastMessage && c.unreadCount === 0))
      )
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

      <div className="bg-card rounded-xl border border-border overflow-hidden max-w-xl">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />)}</div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center">
            <MessageCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Noch keine Nachrichten.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {customers.map(customer => (
              <Link key={customer.id} href={`/admin/chat/${customer.id}`}>
                <div className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors">
                  <div className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    {customer.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {customer.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{customer.full_name ?? customer.email}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {customer.lastMessage?.message ?? 'Noch keine Nachrichten'}
                    </p>
                  </div>
                  {customer.unreadCount > 0 && (
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
