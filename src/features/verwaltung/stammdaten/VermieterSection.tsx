'use client'

import { useState } from 'react'
import { upsertVermieter, deleteVermieter } from './lib'
import type { Vermieter } from './types'
import { Field, SaveBtn, DeleteBtn, SectionTitle } from '../ui'

type Props = {
  vermieter: Vermieter[]
  onRefresh: () => Promise<void>
}

function validate(form: Vermieter): string | null {
  if (!form.name.trim())      return 'Name ist erforderlich.'
  if (!form.anschrift.trim()) return 'Straße und Hausnummer sind erforderlich.'
  if (!form.plz.trim())       return 'PLZ ist erforderlich.'
  if (!form.ort.trim())       return 'Ort ist erforderlich.'
  if (!form.telefon.trim() && !form.email.trim())
    return 'Bitte Telefon oder E-Mail angeben.'
  return null
}

function VermieterCard({ v, onRefresh }: { v: Vermieter; onRefresh: () => Promise<void> }) {
  const [form, setForm] = useState<Vermieter>(v)
  const [err, setErr] = useState<string | null>(null)
  const [open, setOpen] = useState(!v.name)

  const set = (k: keyof Vermieter) => (val: string) => {
    setForm((f) => ({ ...f, [k]: val }))
    setErr(null)
  }

  const save = async () => {
    const problem = validate(form)
    if (problem) { setErr(problem); throw new Error(problem) }
    setErr(null)
    try {
      await upsertVermieter(form)
      await onRefresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Fehler beim Speichern.')
      throw e
    }
  }

  const remove = async () => {
    if (!confirm(`Vermieter „${v.name || 'unbenannt'}" wirklich löschen?`)) return
    await deleteVermieter(v.id)
    await onRefresh()
  }

  const label = [v.name, v.ort].filter(Boolean).join(', ') || 'Neuer Vermieter'

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
          <Field label="Name *" value={form.name} onChange={set('name')} placeholder="Max Mustermann" />
          <Field label="Straße, Hausnummer *" value={form.anschrift} onChange={set('anschrift')} placeholder="Musterstraße 1" />
          <div className="grid grid-cols-3 gap-3">
            <Field label="PLZ *" value={form.plz} onChange={set('plz')} placeholder="27570" />
            <div className="col-span-2">
              <Field label="Ort *" value={form.ort} onChange={set('ort')} placeholder="Bremerhaven" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telefon" value={form.telefon} onChange={set('telefon')} placeholder="+49 471 …" />
            <Field label="E-Mail" value={form.email} onChange={set('email')} placeholder="max@example.com" />
          </div>
          <p className="font-label text-sm text-stone-500">* Pflichtfeld · Telefon oder E-Mail muss ausgefüllt sein</p>

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

export default function VermieterSection({ vermieter, onRefresh }: Props) {
  const [adding, setAdding] = useState(false)

  const add = async () => {
    setAdding(true)
    try {
      await upsertVermieter({
        id: crypto.randomUUID(),
        name: '',
        anschrift: '',
        plz: '',
        ort: '',
        telefon: '',
        email: '',
        reihenfolge: vermieter.length + 1,
      })
      await onRefresh()
    } finally {
      setAdding(false)
    }
  }

  return (
    <section>
      <div className="flex items-baseline justify-between mb-5">
        <SectionTitle>Vermieter</SectionTitle>
        <button
          onClick={add}
          disabled={adding}
          className="font-label text-sm uppercase tracking-widest text-clay hover:text-stone-900 transition-colors disabled:opacity-40"
        >
          + Vermieter hinzufügen
        </button>
      </div>

      {vermieter.length === 0 ? (
        <p className="font-body text-stone-500 italic text-sm">Noch kein Vermieter eingetragen.</p>
      ) : (
        <div className="space-y-3">
          {vermieter.map((v) => (
            <VermieterCard key={v.id} v={v} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </section>
  )
}
