'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const TABS = [
  { label: 'Übersicht',             href: '/dashboard' },
  { label: 'Stammdaten',            href: '/dashboard/stammdaten' },
  { label: 'Mietvertrag erstellen', href: '/dashboard/mietvertraege' },
  { label: 'Dokumente',             href: '/dashboard/anlagen' },
  { label: 'Archiv',                href: '/dashboard/archiv' },
  { label: 'Rechtliches',          href: '/dashboard/rechtliches' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-bone">
      <header className="border-b border-paper bg-linen px-6 py-4 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Glow Giver · Verwaltung</h1>
        <div className="flex items-center gap-4">
          <span className="font-label text-sm text-stone-500">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="font-label text-sm text-clay hover:text-stone-900 transition-colors uppercase tracking-wide"
          >
            Abmelden
          </button>
        </div>
      </header>

      <nav className="bg-linen border-b border-paper px-6 flex gap-1">
        {TABS.map((tab) => {
          const active =
            tab.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`font-label text-base px-4 py-3 border-b-[3px] transition-colors ${
                active
                  ? 'border-clay text-ink font-medium bg-bone'
                  : 'border-transparent text-stone-500 hover:text-ink hover:bg-bone/60'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  )
}
