'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-bone">
      <header className="border-b border-paper bg-linen px-6 py-4 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Glow Giver · Verwaltung</h1>
        <div className="flex items-center gap-4">
          <span className="font-label text-sm text-smoke">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="font-label text-sm text-clay hover:text-ink transition-colors uppercase tracking-wide"
          >
            Abmelden
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <p className="font-display text-3xl text-ink">Willkommen</p>
        <p className="font-body text-smoke mt-2">Die Verwaltungsmodule werden hier erscheinen.</p>
      </main>
    </div>
  )
}
