'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import type { ChatMessage, Profile } from '@/lib/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export default function CustomerChatPage() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null)
  const [adminOnline, setAdminOnline] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return

    const init = async () => {
      // Fetch admin profile
      const { data: admin } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .limit(1)
        .single()
      setAdminProfile(admin)

      if (admin) {
        // Fetch admin online status
        const { data: status } = await supabase
          .from('admin_online_status')
          .select('is_online')
          .eq('id', admin.id)
          .single()
        setAdminOnline(status?.is_online ?? false)

        // Fetch messages
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('*')
          .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${admin.id}),and(sender_id.eq.${admin.id},receiver_id.eq.${profile.id})`)
          .order('created_at', { ascending: true })
        setMessages((msgs as ChatMessage[]) ?? [])

        // Mark incoming as read
        await supabase
          .from('chat_messages')
          .update({ is_read: true })
          .eq('receiver_id', profile.id)
          .eq('sender_id', admin.id)
          .eq('is_read', false)
      }

      setIsLoading(false)
    }

    init()

    // Realtime subscription
    const channel = supabase
      .channel('customer-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
      }, async (payload) => {
        const msg = payload.new as ChatMessage
        if (
          (msg.sender_id === profile.id) ||
          (adminProfile && msg.sender_id === adminProfile.id && msg.receiver_id === profile.id)
        ) {
          setMessages(prev => [...prev, msg])
          // Mark as read
          if (msg.receiver_id === profile.id) {
            await supabase.from('chat_messages').update({ is_read: true }).eq('id', msg.id)
          }
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile, adminProfile?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !profile || !adminProfile || isSending) return
    setIsSending(true)
    const text = newMessage.trim()
    setNewMessage('')

    await supabase.from('chat_messages').insert({
      sender_id: profile.id,
      receiver_id: adminProfile.id,
      message: text,
      is_read: false,
    })
    setIsSending(false)
  }

  const groupedMessages = messages.reduce<Array<{ date: string; messages: ChatMessage[] }>>((groups, msg) => {
    const date = format(new Date(msg.created_at), 'dd. MMMM yyyy', { locale: de })
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup.date === date) {
      lastGroup.messages.push(msg)
    } else {
      groups.push({ date, messages: [msg] })
    }
    return groups
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3 pb-4 border-b border-border mb-4"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${adminOnline ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
        </div>
        <div>
          <p className="font-semibold">Martin</p>
          <p className="text-xs text-muted-foreground">{adminOnline ? 'Online' : 'Offline'} · Personal Trainer</p>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <p className="text-muted-foreground text-sm">Noch keine Nachrichten.</p>
            <p className="text-xs text-muted-foreground">Schreib Martin eine erste Nachricht!</p>
          </div>
        ) : (
          groupedMessages.map(group => (
            <div key={group.date}>
              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground shrink-0">{group.date}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {group.messages.map((msg) => {
                const isOwn = msg.sender_id === profile?.id
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      isOwn
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}>
                      <p className="leading-relaxed">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-white/60' : 'text-muted-foreground'}`}>
                        {format(new Date(msg.created_at), 'HH:mm', { locale: de })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-border mt-2">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Nachricht schreiben..."
            className="flex-1"
            disabled={isSending || !adminProfile}
          />
          <Button variant="hero" size="icon" onClick={sendMessage} disabled={isSending || !newMessage.trim() || !adminProfile}>
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
