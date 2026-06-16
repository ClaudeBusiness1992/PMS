'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { createClient } from './supabase'

function toGerman(msg: string): string {
  if (process.env.NODE_ENV === 'development') console.error('[Auth error]', msg)
  if (msg.includes('Invalid login credentials'))    return 'E-Mail oder Passwort ist falsch.'
  if (msg.includes('Email not confirmed'))           return 'Bitte bestätige zuerst deine E-Mail-Adresse.'
  if (msg.includes('User already registered'))       return 'Diese E-Mail-Adresse ist bereits registriert.'
  if (msg.includes('Password should be at least'))  return 'Das Passwort muss mindestens 6 Zeichen lang sein.'
  if (msg.includes('Unable to validate email'))      return 'Bitte gib eine gültige E-Mail-Adresse ein.'
  if (msg.includes('Email rate limit exceeded'))     return 'Zu viele Versuche. Bitte warte kurz.'
  if (msg.includes('over_email_send_rate_limit'))    return 'Zu viele Versuche. Bitte warte kurz.'
  if (msg.includes('signup_disabled'))               return 'Registrierung ist deaktiviert.'
  if (msg.includes('Database error'))                return 'Datenbankfehler. Bitte versuche es erneut.'
  if (msg.includes('unexpected_failure'))            return 'Serverfehler. Bitte versuche es erneut.'
  // Im Dev-Modus echten Fehlertext zeigen
  if (process.env.NODE_ENV === 'development') return `Fehler: ${msg}`
  return 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.'
}

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useRef(createClient()).current

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (process.env.NODE_ENV === 'development') {
      console.log('[signUp] data:', JSON.stringify(data))
      console.error('[signUp] error:', JSON.stringify(error), 'status:', (error as any)?.status, 'code:', (error as any)?.code)
    }
    return { error: error ? toGerman(error.message) : null }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (process.env.NODE_ENV === 'development') {
      console.log('[signIn] data:', JSON.stringify(data))
      console.error('[signIn] error:', JSON.stringify(error), 'status:', (error as any)?.status, 'code:', (error as any)?.code)
    }
    return { error: error ? toGerman(error.message) : null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
