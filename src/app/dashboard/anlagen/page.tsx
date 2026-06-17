'use client'

import { useState } from 'react'
import { VORLAGEN } from '@/features/verwaltung/vorlagen/data'

function VorlagenView({ id }: { id: string }) {
  const vorlage = VORLAGEN.find((v) => v.id === id)
  if (!vorlage) return null

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-1">
        <p className="font-display text-2xl text-ink">{vorlage.label}</p>
        <p className="font-body text-sm text-stone-600">
          Allgemeine Vorlage — kann Mietverträgen im Archiv beigefügt werden.
        </p>
      </div>
      <div className="space-y-6">
        {vorlage.paragraphen.map((p, i) => (
          <div key={p.id} className="space-y-1">
            <p className="font-label text-xs uppercase tracking-widest text-stone-600">
              § {i + 1} · {p.titel}
            </p>
            <p className="font-body text-base text-stone-900 leading-relaxed">{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnlagenPage() {
  const [active, setActive] = useState(VORLAGEN[0]?.id ?? '')

  return (
    <div className="space-y-8">
      <p className="font-display text-3xl text-ink">Dokumente</p>
      <p className="font-body text-sm text-stone-600 max-w-xl">
        Allgemeine Vorlagen, die Mietverträgen im Archiv beigefügt werden können.
      </p>

      <div className="flex gap-1 border-b border-paper">
        {VORLAGEN.map((v) => (
          <button
            key={v.id}
            onClick={() => setActive(v.id)}
            className={`font-label text-sm px-4 py-2.5 border-b-2 transition-colors ${
              active === v.id
                ? 'border-clay text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div>
        <VorlagenView id={active} />
      </div>
    </div>
  )
}
