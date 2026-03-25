'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Users } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile, ChatMessage } from '@/lib/types'

type CustomerWithChat = Profile & { lastMessage?: ChatMessage; unreadCount: number }

export default function AdminChatListPage() {
  const [customers, setCustomers] = useState<CustomerWithChat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()

      // 3 queries total instead of 2N+1
      const [profilesRes, adminRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, customer_status, created_at, role').eq('role', 'customer').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id').eq('role', 'admin').single(),
      ])

      const profiles = profilesRes.data as Profile[] | null
      const adminId  = adminRes.data?.id ?? ''

      if (!profiles?.length) { setIsLoading(false); return }

      // Fetch all relevant messages in one round-trip
      // Limit to recent messages for the list overview — full thread loaded per-chat
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('id, sender_id, receiver_id, message, is_read, created_at')
        .or(`sender_id.eq.${adminId},receiver_id.eq.${adminId}`)
        .order('created_at', { ascending: false })
        .limit(500)

      const allMessages = (messages ?? []) as ChatMessage[]

      // Aggregate per customer in JS — O(M) not O(N)
      const enriched: CustomerWithChat[] = profiles.map(p => {
        const thread = allMessages.filter(
          m => (m.sender_id === p.id && m.receiver_id === adminId)
            || (m.sender_id === adminId && m.receiver_id === p.id)
        )
        const unreadCount = thread.filter(m => m.sender_id === p.id && !m.is_read).length
        return { ...p, lastMessage: thread[0], unreadCount }
      })

      // Sort: conversations with activity first
      enriched.sort((a, b) => {
        const aTime = a.lastMessage?.created_at ?? ''
        const bTime = b.lastMessage?.created_at ?? ''
        return bTime.localeCompare(aTime)
      })

      setCustomers(enriched)
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
