'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Send, Loader2, ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import type { ChatMessage, Profile } from '@/lib/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export default function AdminChatPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const { profile: adminProfile } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [customer, setCustomer] = useState<Profile | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!adminProfile) return
    const init = async () => {
      const { data: cust } = await supabase.from('profiles').select('id, full_name, email, phone, avatar_url, role, notes, customer_status, customer_tags, fitness_goals, health_notes, created_at, updated_at').eq('id', customerId).single()
      setCustomer(cust)

      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('id, sender_id, receiver_id, message, is_read, created_at')
        .or(`and(sender_id.eq.${customerId},receiver_id.eq.${adminProfile.id}),and(sender_id.eq.${adminProfile.id},receiver_id.eq.${customerId})`)
        .order('created_at', { ascending: true })
      setMessages((msgs as ChatMessage[]) ?? [])

      // Mark as read
      await supabase.from('chat_messages').update({ is_read: true })
        .eq('sender_id', customerId).eq('receiver_id', adminProfile.id).eq('is_read', false)

      // Update admin online status
      await supabase.from('admin_online_status').upsert({ id: adminProfile.id, is_online: true, last_seen: new Date().toISOString() })

      setIsLoading(false)
    }
    init()

    // Heartbeat
    const heartbeat = setInterval(async () => {
      await supabase.from('admin_online_status').upsert({ id: adminProfile.id, is_online: true, last_seen: new Date().toISOString() })
    }, 30000)

    // Offline on unload
    const handleUnload = () => {
      supabase.from('admin_online_status').upsert({ id: adminProfile.id, is_online: false })
    }
    window.addEventListener('beforeunload', handleUnload)

    // Realtime
    const channel = supabase.channel(`admin-chat-${customerId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, async (payload) => {
        const msg = payload.new as ChatMessage
        if (
          (msg.sender_id === customerId && msg.receiver_id === adminProfile.id) ||
          (msg.sender_id === adminProfile.id && msg.receiver_id === customerId)
        ) {
          setMessages(prev => [...prev, msg])
          if (msg.receiver_id === adminProfile.id) {
            await supabase.from('chat_messages').update({ is_read: true }).eq('id', msg.id)
          }
        }
      })
      .subscribe()

    return () => {
      clearInterval(heartbeat)
      window.removeEventListener('beforeunload', handleUnload)
      supabase.removeChannel(channel)
    }
  }, [adminProfile, customerId])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !adminProfile || isSending) return
    setIsSending(true)
    const text = newMessage.trim()
    setNewMessage('')
    await supabase.from('chat_messages').insert({
      sender_id: adminProfile.id,
      receiver_id: customerId,
      message: text,
      is_read: false,
    })
    setIsSending(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      <Link href="/admin/chat" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </Link>

      <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold">{customer?.full_name ?? customer?.email ?? 'Kunde'}</p>
          <p className="text-xs text-muted-foreground">{customer?.email}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-sm">Noch keine Nachrichten mit diesem Kunden.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isAdmin = msg.sender_id === adminProfile?.id
            return (
              <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isAdmin ? 'bg-primary text-white rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}`}>
                  <p className="leading-relaxed">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isAdmin ? 'text-white/60' : 'text-muted-foreground'}`}>
                    {format(new Date(msg.created_at), 'HH:mm', { locale: de })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 border-t border-border mt-2">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Nachricht an Kunden..."
            className="flex-1"
            disabled={isSending}
          />
          <Button variant="hero" size="icon" onClick={sendMessage} disabled={isSending || !newMessage.trim()}>
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
