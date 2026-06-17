'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { saveMietvertrag, getMietvertragById } from '@/features/verwaltung/mietvertraege/lib'
import { getVermieter, getObjekte, getBankkonten } from '@/features/verwaltung/stammdaten/lib'
import type { Vermieter, Objekt, Bankkonto } from '@/features/verwaltung/stammdaten/types'
import { defaultFormState, defaultMieter, defaultSections } from '@/features/verwaltung/mietvertraege/types'
import type { FormState, MieterFormState, ActiveSections, SectionKey } from '@/features/verwaltung/mietvertraege/types'
import MietvertragForm from '@/features/verwaltung/mietvertraege/MietvertragForm'
import VertragPreview from '@/features/verwaltung/mietvertraege/VertragPreview'

const EINHEIT_LOCKED_KEYS: SectionKey[] = [
  'balkon', 'terrasse', 'keller', 'dachboden', 'garage', 'stellplatz', 'gasetagenheizung', 'wasser',
]

function MietvertragErstellenInner() {
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const preEinheitId = searchParams.get('einheit_id')

  const [vermieter, setVermieter] = useState<Vermieter[]>([])
  const [objekte, setObjekte] = useState<Objekt[]>([])
  const [bankkonten, setBankkonten] = useState<Bankkonto[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>(() => ({
    ...defaultFormState(),
    einheit_id: preEinheitId ?? null,
  }))
  const [mieter, setMieter] = useState<MieterFormState[]>([defaultMieter()])
  const [mvId, setMvId] = useState(() => editId ?? crypto.randomUUID())
  const [activeSections, setActiveSections] = useState<ActiveSections>(defaultSections())

  const load = useCallback(async () => {
    try {
      const [v, o, bk] = await Promise.all([getVermieter(), getObjekte(), getBankkonten()])
      setVermieter(v)
      setObjekte(o)
      setBankkonten(bk)

      if (editId) {
        const mv = await getMietvertragById(editId)
        if (mv) {
          const { id, user_id, status, hat_rueckstaende, mieter: loadedMieter, ...formFields } = mv
          setForm(formFields)
          setMieter(loadedMieter.map((m) => ({ ...m, ausweis_file: null })))
          setMvId(id)
          setActiveSections({
            standard:          !formFields.staffel_erhoehung && !formFields.ist_indexmiete,
            staffelmiete:      !!formFields.staffel_erhoehung,
            indexmiete:        !!formFields.ist_indexmiete,
            befristet:         !!formFields.befristung_ende,
            vollmoebliert:     !!formFields.ist_vollmoebliert,
            teilmoebliert:     !!formFields.ist_teilmoebliert,
            einbaukueche:      !!formFields.hat_einbaukueche,
            // Einheit-getriebene Sections werden vom Auto-useEffect aus der Einheit gesetzt;
            // Nebenräume zusätzlich aus den gespeicherten Schlüsselzahlen rekonstruiert (Fallback).
            balkon:            false,
            terrasse:          false,
            gasetagenheizung:  false,
            keller:            +formFields.schluessel_keller > 0,
            dachboden:         +formFields.schluessel_dachboden > 0,
            garage:            +formFields.schluessel_garage > 0,
            stellplatz:        +formFields.schluessel_stellplatz > 0,
            wasser:            !formFields.wasser_in_nk,
            kleinreparaturen:  true,
            sonstige:          !!formFields.sonstige_vereinbarungen,
          })
        }
      }
    } finally {
      setLoading(false)
    }
  }, [editId])

  useEffect(() => { load() }, [load])

  // Auto-set Ausstattung & Nebenräume aus der gewählten Einheit
  useEffect(() => {
    if (!form.einheit_id || objekte.length === 0) return
    const einheit = objekte.flatMap((o) => o.einheiten).find((e) => e.id === form.einheit_id)
    if (!einheit) return
    setActiveSections((prev) => ({
      ...prev,
      balkon:           einheit.hat_balkon,
      terrasse:         einheit.hat_terrasse,
      keller:           einheit.hat_keller,
      dachboden:        einheit.hat_dachboden,
      garage:           einheit.hat_garage,
      stellplatz:       einheit.hat_stellplatz,
      gasetagenheizung: einheit.hat_gasetagenheizung,
      wasser:           !einheit.wasser_in_nk,
    }))
    setForm((prev) => ({ ...prev, wasser_in_nk: einheit.wasser_in_nk }))
  }, [form.einheit_id, objekte])

  const onChange = (field: keyof FormState, value: FormState[keyof FormState]) =>
    setForm((f) => ({ ...f, [field]: value }))

  const onMieterChange = (i: number, field: keyof MieterFormState, value: string | File | null) =>
    setMieter((prev) => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))

  const onAddMieter = () =>
    setMieter((prev) => [...prev, { ...defaultMieter(), reihenfolge: prev.length + 1 }])

  const onRemoveMieter = (i: number) =>
    setMieter((prev) => prev.filter((_, idx) => idx !== i).map((m, idx) => ({ ...m, reihenfolge: idx + 1 })))

  const MIETART_KEYS: SectionKey[] = ['standard', 'staffelmiete', 'indexmiete']

  const onSectionToggle = (key: SectionKey) => {
    setActiveSections((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      // Mietart: genau eine aktiv (radio)
      if (MIETART_KEYS.includes(key) && next[key]) {
        MIETART_KEYS.forEach((k) => { if (k !== key) next[k] = false })
      }
      // Vollmöbliert und Teilmöbliert schließen sich aus
      if (key === 'vollmoebliert' && next.vollmoebliert) next.teilmoebliert = false
      if (key === 'teilmoebliert' && next.teilmoebliert) next.vollmoebliert = false
      return next
    })
    // wasser_in_nk wird nicht mehr separat gepflegt; activeSections.wasser ist die einzige
    // Quelle und wird beim Speichern (onSave) nach form.wasser_in_nk gespiegelt.
  }

  const onSave = async () => {
    if (!form.mietbeginn) { alert('Bitte Mietbeginn angeben.'); return }
    if (!mieter[0]?.name) { alert('Bitte mindestens einen Mieter (Name) angeben.'); return }
    setSaving(true)
    try {
      // activeSections sind UI-State; die nicht Einheit-getriebenen Vertrags-Eigenschaften
      // (Mietart, Möblierung, Einbauküche) müssen für die Persistenz in die Form-Felder gespiegelt werden.
      const fieldsToSave: FormState = {
        ...form,
        wasser_in_nk:      !activeSections.wasser,
        staffel_erhoehung: activeSections.staffelmiete ? form.staffel_erhoehung : '',
        ist_indexmiete:    activeSections.indexmiete,
        ist_vollmoebliert: activeSections.vollmoebliert,
        ist_teilmoebliert: activeSections.teilmoebliert,
        hat_einbaukueche:  activeSections.einbaukueche,
      }
      await saveMietvertrag(mvId, fieldsToSave, mieter)
      setSavedMsg(editId ? 'Änderungen gespeichert.' : 'Mietvertrag wurde gespeichert und archiviert.')
      if (!editId) {
        setForm(defaultFormState())
        setMieter([defaultMieter()])
        setMvId(crypto.randomUUID())
      }
      setTimeout(() => setSavedMsg(null), 4000)
    } catch (e) {
      console.error(e)
      alert('Fehler beim Speichern.')
    } finally {
      setSaving(false)
    }
  }

  const lockedSections: SectionKey[] = form.einheit_id ? EINHEIT_LOCKED_KEYS : []

  if (loading) return <p className="font-body text-smoke italic text-sm p-8">Lade …</p>

  return (
    // fixed nimmt die gesamte Viewport-Breite ein, unabhängig von max-w-5xl
    <div className="fixed left-0 right-0 bottom-0 top-[114px] flex overflow-hidden">

      {/* ── Linke Hälfte: Eingabemaske ─────────────────────── */}
      <div className="w-1/2 h-full overflow-y-auto border-r border-paper bg-bone">
        <MietvertragForm
          form={form}
          mieter={mieter}
          objekte={objekte}
          activeSections={activeSections}
          onChange={onChange}
          onMieterChange={onMieterChange}
          onAddMieter={onAddMieter}
          onRemoveMieter={onRemoveMieter}
          onSectionToggle={onSectionToggle}
          onSave={onSave}
          saving={saving}
          savedMsg={savedMsg}
          lockedSections={lockedSections}
        />
      </div>

      {/* ── Rechte Hälfte: DIN A4 Vorschau ─────────────────── */}
      <div className="w-1/2 h-full overflow-y-auto overflow-x-auto bg-[#CCCCCC]">
        <VertragPreview
          form={form}
          mieter={mieter}
          vermieter={vermieter}
          objekte={objekte}
          bankkonten={bankkonten}
          activeSections={activeSections}
        />
      </div>

    </div>
  )
}

export default function MietvertragErstellenPage() {
  return (
    <Suspense fallback={<p className="font-body text-smoke italic text-sm p-8">Lade …</p>}>
      <MietvertragErstellenInner />
    </Suspense>
  )
}
