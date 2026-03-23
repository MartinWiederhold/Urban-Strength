'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Save, Loader2, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [fitnessGoals, setFitnessGoals] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '')
      setPhone(profile.phone ?? '')
      setFitnessGoals(profile.fitness_goals ?? '')
    }
  }, [profile])

  const handleSave = async () => {
    if (!profile) return
    setIsSaving(true)
    setMessage(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, fitness_goals: fitnessGoals })
      .eq('id', profile.id)

    if (error) {
      setMessage({ text: 'Fehler beim Speichern. Bitte versuche es erneut.', type: 'error' })
    } else {
      await refreshProfile()
      setMessage({ text: 'Profil erfolgreich gespeichert!', type: 'success' })
    }
    setIsSaving(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !e.target.files?.[0]) return
    const file = e.target.files[0]
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'Bild darf maximal 2 MB gross sein.', type: 'error' })
      return
    }
    setIsUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${profile.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
      await refreshProfile()
      setMessage({ text: 'Profilbild aktualisiert!', type: 'success' })
    } else {
      setMessage({ text: 'Fehler beim Hochladen des Bildes.', type: 'error' })
    }
    setIsUploading(false)
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mein Profil</h1>
        <p className="text-muted-foreground mt-1">Verwalte deine persönlichen Daten.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card border border-border rounded-2xl p-6 max-w-xl space-y-6"
      >
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
              {isUploading ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Camera className="w-3 h-3 text-white" />}
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
            </label>
          </div>
          <div>
            <p className="font-semibold">{profile?.full_name ?? '–'}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Name</Label>
            <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Dein vollständiger Name" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">E-Mail (nicht änderbar)</Label>
            <Input id="email" value={profile?.email ?? ''} disabled className="mt-1 opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+41 79 123 45 67" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="goals">Ziele & Wünsche</Label>
            <Textarea id="goals" value={fitnessGoals} onChange={e => setFitnessGoals(e.target.value)} placeholder="Was möchtest du erreichen?" className="mt-1" />
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
            {message.text}
          </div>
        )}

        <Button variant="hero" onClick={handleSave} disabled={isSaving} className="w-full" size="lg">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Speichern
        </Button>
      </motion.div>
    </div>
  )
}
