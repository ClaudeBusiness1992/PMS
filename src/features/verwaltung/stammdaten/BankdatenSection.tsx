'use client'

import { useState } from 'react'
import { upsertBankkonto, deleteBankkonto } from './lib'
import type { Bankkonto } from './types'
import { Field, SaveBtn, DeleteBtn, SectionTitle } from '../ui'

type Props = {
  bankkonten: Bankkonto[]
  onRefresh: () => Promise<void>
}

function BankCard({ b, onRefresh }: { b: Bankkonto; onRefresh: () => Promise<void> }) {
  const [form, setForm] = useState<Bankkonto>(b)
  const [err, setErr] = useState<string | null>(null)
  const [open, setOpen] = useState(!b.iban)

  const set = (k: keyof Bankkonto) => (val: string) => {
    setForm((f) => ({ ...f, [k]: val }))
    setErr(null)
  }

  const save = async () => {
    setErr(null)
    try {
      await upsertBankkonto(form)
      await onRefresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Fehler beim Speichern.')
      throw e
    }
  }

  const remove = async () => {
    if (!confirm(`Konto „${b.iban || b.bank || 'unbenannt'}" wirklich löschen?`)) return
    await deleteBankkonto(b.id)
    await onRefresh()
  }

  const label = [b.kontoinhaber, b.bank].filter(Boolean).join(' · ') || 'Neues Konto'

  return (
    <div className="border border-paper bg-linen">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-display text-lg text-ink">{label}</span>
        <span className="font-label text-sm text-stone-500">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-paper pt-5">
          <Field
            label="Kontoinhaber"
            value={form.kontoinhaber}
            onChange={set('kontoinhaber')}
            placeholder="Max Mustermann"
          />
          <Field
            label="IBAN"
            value={form.iban}
            onChange={set('iban')}
            placeholder="DE89 3704 0044 0532 0130 00"
          />
          <Field
            label="Bank"
            value={form.bank}
            onChange={set('bank')}
            placeholder="Sparkasse Bremerhaven"
          />

          {err && <p className="font-body text-sm text-clay">{err}</p>}

          <div className="flex items-center justify-between pt-1 border-t border-paper">
            <SaveBtn onClick={save} />
            <DeleteBtn onClick={remove} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function BankdatenSection({ bankkonten, onRefresh }: Props) {
  const [adding, setAdding] = useState(false)

  const add = async () => {
    setAdding(true)
    try {
      await upsertBankkonto({
        id: crypto.randomUUID(),
        kontoinhaber: '',
        iban: '',
        bank: '',
        reihenfolge: bankkonten.length + 1,
      })
      await onRefresh()
    } finally {
      setAdding(false)
    }
  }

  return (
    <section>
      <div className="flex items-baseline justify-between mb-5">
        <SectionTitle>Bankdaten</SectionTitle>
        <button
          onClick={add}
          disabled={adding}
          className="font-label text-sm uppercase tracking-widest text-clay hover:text-stone-900 transition-colors disabled:opacity-40"
        >
          + Konto hinzufügen
        </button>
      </div>

      {bankkonten.length === 0 ? (
        <p className="font-body text-stone-500 italic text-sm">Noch kein Konto hinterlegt.</p>
      ) : (
        <div className="space-y-3">
          {bankkonten.map((b) => (
            <BankCard key={b.id} b={b} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </section>
  )
}
