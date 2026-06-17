'use client'

import { useState } from 'react'

type FieldProps = {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}

export function Field({ label, value, onChange, placeholder, type = 'text' }: FieldProps) {
  return (
    <div>
      <label className="block font-label text-xs uppercase tracking-widest text-stone-600 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-paper bg-white px-3 py-2 font-body text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-ink transition-colors"
      />
    </div>
  )
}

type SelectFieldProps = {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}

export function SelectField({ label, value, onChange, children }: SelectFieldProps) {
  return (
    <div>
      <label className="block font-label text-xs uppercase tracking-widest text-stone-600 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-paper bg-white px-3 py-2 font-body text-sm text-stone-900 focus:outline-none focus:border-ink transition-colors"
      >
        {children}
      </select>
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-base text-stone-900 border-b border-paper pb-2 mb-1">{children}</h2>
  )
}

export function SaveBtn({ onClick, label = 'Speichern' }: { onClick: () => void | Promise<void>; label?: string }) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle')

  const handle = async () => {
    setState('saving')
    try {
      await onClick()
      setState('saved')
      setTimeout(() => setState('idle'), 2500)
    } catch {
      // Fehler wird vom aufrufenden Formular angezeigt; Button kehrt zurück.
      setState('idle')
    }
  }

  return (
    <button
      onClick={handle}
      disabled={state === 'saving'}
      className={`font-label text-sm uppercase tracking-widest px-5 py-2.5 transition-colors disabled:opacity-40 ${
        state === 'saved'
          ? 'bg-emerald-600 text-white'
          : 'bg-ink text-linen hover:opacity-80'
      }`}
    >
      {state === 'saving' ? 'Speichert…' : state === 'saved' ? '✓ Gespeichert' : label}
    </button>
  )
}

export function DeleteBtn({ label = 'Löschen', onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="font-label text-sm uppercase tracking-widest text-clay hover:text-stone-900 transition-colors"
    >
      {label}
    </button>
  )
}
