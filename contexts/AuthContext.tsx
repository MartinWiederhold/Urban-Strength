'use client'

import { createContext, useContext, useCallback, useEffect, useMemo, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAdmin: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  /** Nur Session-Auflösung (getSession) – nicht blockierend auf profiles-Fetch */
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, avatar_url, role, customer_status, notes, customer_tags, fitness_goals, health_notes, created_at, updated_at')
      .eq('id', userId)
      .single()
    setProfile(data)
  }, [supabase])

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  useEffect(() => {
    const getSession = async () => {
      let nextSession: Session | null = null
      try {
        const { data } = await supabase.auth.getSession()
        nextSession = data.session
        setSession(nextSession)
        setUser(nextSession?.user ?? null)
      } finally {
        setIsLoading(false)
      }
      if (nextSession?.user) {
        void fetchProfile(nextSession.user.id)
      } else {
        setProfile(null)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession)
        setUser(nextSession?.user ?? null)
        setIsLoading(false)
        if (nextSession?.user) {
          void fetchProfile(nextSession.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isLoading,
      isAdmin: profile?.role === 'admin',
      refreshProfile,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
