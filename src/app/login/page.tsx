'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const passwordTooShort = password.length > 0 && password.length < 6
  const passwordsMatch = passwordConfirm === '' || password === passwordConfirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!email || !password) { setErrorMsg('Bitte E-Mail und Passwort eingeben.'); return }
    if (!emailRegex.test(email)) { setErrorMsg('Bitte eine gültige E-Mail-Adresse eingeben.'); return }
    if (mode === 'register') {
      if (password.length < 6) { setErrorMsg('Das Passwort muss mindestens 6 Zeichen lang sein.'); return }
      if (password !== passwordConfirm) { setErrorMsg('Die Passwörter stimmen nicht überein.'); return }
    }

    setLoading(true)
    const { error } = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password)
    setLoading(false)

    if (error) {
      setErrorMsg(error)
    } else if (mode === 'register') {
      setSuccessMsg('Konto erstellt. Bitte bestätige deine E-Mail-Adresse.')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bone px-4">
      <div className="w-full max-w-sm">

        {/* Logo / Titel */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-ink">Glow Giver</h1>
          <p className="font-label text-sm tracking-widest text-smoke uppercase mt-1">Verwaltung</p>
        </div>

        {/* Card */}
        <div className="bg-linen border border-paper rounded-2xl p-8 shadow-sm">
          <h2 className="font-display text-2xl text-ink mb-6 text-center">
            {mode === 'login' ? 'Anmelden' : 'Registrieren'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="E-Mail-Adresse"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrorMsg(null) }}
              className="w-full px-4 py-3 rounded-lg border border-paper bg-bone text-ink placeholder-smoke-light font-body text-base focus:outline-none focus:border-ember transition-colors"
              autoComplete="email"
            />

            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrorMsg(null) }}
              className="w-full px-4 py-3 rounded-lg border border-paper bg-bone text-ink placeholder-smoke-light font-body text-base focus:outline-none focus:border-ember transition-colors"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {passwordTooShort && (
              <p className="text-clay text-sm -mt-2">Mindestens 6 Zeichen.</p>
            )}

            {mode === 'register' && (
              <>
                <input
                  type="password"
                  placeholder="Passwort bestätigen"
                  value={passwordConfirm}
                  onChange={e => { setPasswordConfirm(e.target.value); setErrorMsg(null) }}
                  className={`w-full px-4 py-3 rounded-lg border bg-bone text-ink placeholder-smoke-light font-body text-base focus:outline-none focus:border-ember transition-colors ${!passwordsMatch ? 'border-clay' : 'border-paper'}`}
                  autoComplete="new-password"
                />
                {!passwordsMatch && (
                  <p className="text-clay text-sm -mt-2">Passwörter stimmen nicht überein.</p>
                )}
              </>
            )}

            {errorMsg && (
              <div className="bg-clay/10 border border-clay/30 rounded-lg px-4 py-3 text-clay text-sm">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-moss/10 border border-moss/30 rounded-lg px-4 py-3 text-moss text-sm">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-ink text-bone font-label text-sm tracking-wide uppercase hover:bg-ink-mid transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? '...' : mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
            </button>
          </form>

          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrorMsg(null); setSuccessMsg(null); setPassword(''); setPasswordConfirm('') }}
            className="w-full mt-4 text-sm text-smoke hover:text-ink transition-colors font-label"
          >
            {mode === 'login' ? 'Noch kein Konto? Registrieren' : 'Bereits registriert? Anmelden'}
          </button>
        </div>
      </div>
    </div>
  )
}
