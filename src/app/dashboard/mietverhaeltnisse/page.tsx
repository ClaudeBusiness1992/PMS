'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  getMietverhaeltnisseUebersicht,
  updateMvStatus,
  toggleRueckstaende,
} from '@/features/verwaltung/mietvertraege/lib'
import { getObjekte } from '@/features/verwaltung/stammdaten/lib'
import {
  getDokumente,
  addVorlage,
  uploadDokument,
  deleteDokument,
} from '@/features/verwaltung/dokumente/lib'
import { VORLAGEN } from '@/features/verwaltung/vorlagen/data'
import { calcGesamtmiete, formatEur, formatDate } from '@/features/verwaltung/mietvertraege/staffelLogic'
import type { UebersichtRow, MietvertragStatus } from '@/features/verwaltung/mietvertraege/types'
import type { Objekt } from '@/features/verwaltung/stammdaten/types'
import type { Dokument } from '@/features/verwaltung/dokumente/types'

const STATUS_LABEL: Record<MietvertragStatus, string> = {
  neu:        'Neu',
  aktiv:      'Aktiv',
  gekuendigt: 'Gekündigt',
  beendet:    'Beendet',
}

const STATUS_BG: Record<MietvertragStatus, string> = {
  neu:        'bg-stone-50 text-stone-500',
  aktiv:      'bg-emerald-50 text-emerald-800',
  gekuendigt: 'bg-amber-50 text-amber-800',
  beendet:    'bg-stone-100 text-stone-400',
}

// ── Dokumente-Panel ────────────────────────────────────────

type AddTab = 'vorlage' | 'upload'

function DokumentePanel({
  mv,
  dokumente,
  onAddVorlage,
  onUpload,
  onDelete,
  uploading,
  onClose,
  onOeffnen,
}: {
  mv: UebersichtRow
  dokumente: Dokument[]
  onAddVorlage: (id: string, titel: string) => Promise<void>
  onUpload: (file: File, titel: string) => Promise<void>
  onDelete: (dok: Dokument) => Promise<void>
  uploading: boolean
  onClose: () => void
  onOeffnen: (id: string) => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [addTab, setAddTab] = useState<AddTab>('vorlage')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitel, setUploadTitel] = useState('')

  const handleAddVorlage = async (id: string, label: string) => {
    await onAddVorlage(id, label)
    setShowAdd(false)
  }

  const handleUpload = async () => {
    if (!uploadFile) return
    await onUpload(uploadFile, uploadTitel)
    setUploadFile(null)
    setUploadTitel('')
    setShowAdd(false)
  }

  return (
    <div className="w-72 shrink-0 h-full border-l border-stone-200 bg-stone-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-stone-200 shrink-0 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-label text-[10px] uppercase tracking-widest text-smoke">Dokumente</p>
          <p className="font-body text-sm text-ink truncate mt-0.5">
            {mv.mieter[0]?.name || mv.bezeichnung || '—'}
          </p>
        </div>
        <button onClick={onClose} className="text-smoke hover:text-ink text-lg leading-none shrink-0 mt-0.5">×</button>
      </div>

      {/* Buttons */}
      <div className="px-4 py-2.5 bg-white border-b border-stone-200 shrink-0 flex gap-2">
        <button
          onClick={() => onOeffnen(mv.id)}
          className="flex-1 py-1.5 border border-ink text-ink font-label text-[10px] uppercase tracking-widest hover:bg-ink hover:text-bone transition-colors"
        >
          Vertrag →
        </button>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {dokumente.length === 0 && (
          <p className="px-4 py-5 font-body text-sm text-smoke italic">Keine Dokumente.</p>
        )}
        {dokumente.map((dok) => (
          <div key={dok.id} className="group flex items-start gap-3 px-4 py-3 border-b border-stone-100 hover:bg-white transition-colors">
            <span className="text-base shrink-0 mt-0.5">{dok.typ === 'vorlage' ? '📄' : '📎'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm text-ink truncate">{dok.titel}</p>
              <p className="font-label text-[9px] text-smoke">
                {dok.typ === 'vorlage' ? 'Vorlage' : 'Datei'} · {new Date(dok.created_at).toLocaleDateString('de-DE')}
              </p>
            </div>
            <button
              onClick={() => onDelete(dok)}
              className="opacity-0 group-hover:opacity-100 text-clay hover:text-ink font-label text-[11px] transition-opacity shrink-0"
            >✕</button>
          </div>
        ))}
      </div>

      {/* Hinzufügen */}
      <div className="border-t border-stone-200 bg-white shrink-0">
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full px-4 py-3 text-left font-label text-[11px] uppercase tracking-widest text-clay hover:text-ink hover:bg-stone-50 transition-colors"
          >+ Dokument hinzufügen</button>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex border-b border-stone-200">
              {(['vorlage', 'upload'] as AddTab[]).map((t) => (
                <button key={t} onClick={() => setAddTab(t)}
                  className={`flex-1 py-1.5 font-label text-[10px] uppercase tracking-widest border-b-2 transition-colors ${addTab === t ? 'border-clay text-ink' : 'border-transparent text-smoke hover:text-ink'}`}
                >{t === 'vorlage' ? 'Vorlage' : 'Datei'}</button>
              ))}
            </div>
            {addTab === 'vorlage' && (
              <div className="space-y-1.5">
                {VORLAGEN.map((v) => (
                  <button key={v.id} onClick={() => handleAddVorlage(v.id, v.label)} disabled={uploading}
                    className="w-full text-left px-3 py-2 border border-stone-200 bg-stone-50 hover:border-ink hover:bg-white font-body text-sm text-ink transition-colors disabled:opacity-40"
                  >📄 {v.label}</button>
                ))}
              </div>
            )}
            {addTab === 'upload' && (
              <div className="space-y-2">
                <input type="text" placeholder="Bezeichnung" value={uploadTitel}
                  onChange={(e) => setUploadTitel(e.target.value)}
                  className="w-full border border-stone-200 px-3 py-1.5 font-body text-sm focus:outline-none focus:border-ink bg-white"
                />
                <input type="file" accept=".pdf,image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm font-body text-smoke file:mr-2 file:py-1 file:px-2 file:border file:border-stone-200 file:bg-stone-50 file:text-smoke file:font-label file:text-[10px] file:uppercase file:tracking-widest"
                />
                <button onClick={handleUpload} disabled={!uploadFile || uploading}
                  className="w-full py-1.5 bg-ink text-bone font-label text-[10px] uppercase tracking-widest hover:opacity-80 disabled:opacity-40 transition-opacity"
                >{uploading ? 'Lädt …' : 'Hochladen'}</button>
              </div>
            )}
            <button onClick={() => setShowAdd(false)}
              className="w-full font-label text-[10px] uppercase tracking-widest text-smoke hover:text-ink transition-colors"
            >Abbrechen</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Hauptseite ─────────────────────────────────────────────

export default function MietverhaeltnissePage() {
  const router = useRouter()
  const [rows, setRows]     = useState<UebersichtRow[]>([])
  const [objekte, setObjekte] = useState<Objekt[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dokumente, setDokumente]   = useState<Dokument[]>([])
  const [uploading, setUploading]   = useState(false)

  const load = useCallback(async () => {
    const [r, o] = await Promise.all([getMietverhaeltnisseUebersicht(), getObjekte()])
    setRows(r)
    setObjekte(o)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSelect = useCallback(async (id: string) => {
    if (selectedId === id) { setSelectedId(null); setDokumente([]); return }
    setSelectedId(id)
    const docs = await getDokumente(id)
    setDokumente(docs)
  }, [selectedId])

  const handleStatusChange = async (id: string, status: MietvertragStatus) => {
    setRows((p) => p.map((r) => r.id === id ? { ...r, status } : r))
    await updateMvStatus(id, status)
  }

  const handleToggle = async (id: string, current: boolean) => {
    const next = !current
    setRows((p) => p.map((r) => r.id === id ? { ...r, hat_rueckstaende: next } : r))
    await toggleRueckstaende(id, next)
  }

  const handleAddVorlage = async (vorlagenId: string, titel: string) => {
    if (!selectedId) return
    setUploading(true)
    try { const dok = await addVorlage(selectedId, vorlagenId, titel); setDokumente((p) => [...p, dok]) }
    finally { setUploading(false) }
  }

  const handleUpload = async (file: File, titel: string) => {
    if (!selectedId) return
    setUploading(true)
    try { const dok = await uploadDokument(selectedId, file, titel); setDokumente((p) => [...p, dok]) }
    finally { setUploading(false) }
  }

  const handleDeleteDok = async (dok: Dokument) => {
    if (!confirm(`„${dok.titel}" löschen?`)) return
    await deleteDokument(dok.id, dok.datei_path || undefined)
    setDokumente((p) => p.filter((d) => d.id !== dok.id))
  }

  // Leerstehende Einheiten
  const belegteIds = new Set(
    rows.filter((r) => r.status !== 'beendet').map((r) => r.einheit?.id).filter((id): id is string => !!id)
  )
  const leerstehend = objekte.flatMap((o) =>
    o.einheiten.filter((e) => !belegteIds.has(e.id)).map((e) => ({
      ...e, objAdresse: o.adresse, objOrt: o.ort,
    }))
  )

  const selectedMv = rows.find((r) => r.id === selectedId) ?? null

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="font-body text-smoke italic text-sm">Lade …</p>
    </div>
  )

  return (
    <div className="fixed left-0 right-0 bottom-0 top-[98px] flex overflow-hidden bg-bone">

      {/* ── Tabellen-Bereich ─────────────────────────────── */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-stone-200 shrink-0">
          <p className="font-display text-xl text-ink">Mietverhältnisse</p>
          <button
            onClick={() => router.push('/dashboard/mietvertraege')}
            className="px-4 py-2 bg-ink text-bone font-label text-[11px] uppercase tracking-widest hover:opacity-80 transition-opacity"
          >+ Neues Mietverhältnis</button>
        </div>

        {/* Tabelle — scrollbar nur vertikal, nie horizontal */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-6 py-5 space-y-8">

            {rows.length > 0 && (
              <table className="w-full border-collapse table-fixed text-sm">
                <colgroup>
                  <col style={{ width: '22%' }} />  {/* Objekt */}
                  <col style={{ width: '10%' }} />  {/* Einheit */}
                  <col style={{ width: '18%' }} />  {/* Mieter */}
                  <col style={{ width: '10%' }} />  {/* Eingezogen */}
                  <col style={{ width: '11%' }} />  {/* Miete */}
                  <col style={{ width: '7%'  }} />  {/* Rückst. */}
                  <col style={{ width: '14%' }} />  {/* Status */}
                  <col style={{ width: '8%'  }} />  {/* Öffnen */}
                </colgroup>
                <thead>
                  <tr>
                    {['Objekt', 'Einheit', 'Mieter', 'Eingezogen', 'Miete/Mo.', 'Rückst.', 'Status', ''].map((h) => (
                      <th key={h} className="bg-ink text-bone font-label text-[10px] uppercase tracking-widest px-3 py-2.5 text-left border border-stone-700">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const gesamt = calcGesamtmiete(row.grundmiete, row.nk_vz, row.hk_vz, row.wasser_vz, row.wasser_in_nk)
                    const isSelected = selectedId === row.id

                    return (
                      <tr
                        key={row.id}
                        onClick={() => handleSelect(row.id)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-clay/10' : 'bg-white hover:bg-stone-50'}`}
                      >
                        <td className={`border border-stone-200 px-3 py-2.5 ${isSelected ? 'border-clay/40' : ''}`}>
                          <p className="font-body text-ink truncate">{row.einheit?.objekt?.adresse ?? '—'}</p>
                          <p className="font-label text-[10px] text-smoke truncate">{row.einheit?.objekt?.ort ?? ''}</p>
                        </td>

                        <td className={`border border-stone-200 px-3 py-2.5 ${isSelected ? 'border-clay/40' : ''}`}>
                          <p className="font-body text-ink truncate">
                            {[row.einheit?.wohnungsnummer ? `W${row.einheit.wohnungsnummer}` : '', row.einheit?.bezeichnung ?? ''].filter(Boolean).join(' · ') || '—'}
                          </p>
                        </td>

                        <td className={`border border-stone-200 px-3 py-2.5 ${isSelected ? 'border-clay/40' : ''}`}>
                          <p className="font-body text-ink truncate">{row.mieter[0]?.name ?? '—'}</p>
                          {row.mieter.length > 1 && (
                            <p className="font-label text-[10px] text-smoke truncate">+{row.mieter.length - 1} weitere</p>
                          )}
                        </td>

                        <td className={`border border-stone-200 px-3 py-2.5 ${isSelected ? 'border-clay/40' : ''}`}>
                          <p className="font-body text-ink text-[13px]">{row.mietbeginn ? formatDate(row.mietbeginn) : '—'}</p>
                        </td>

                        <td className={`border border-stone-200 px-3 py-2.5 text-right ${isSelected ? 'border-clay/40' : ''}`}>
                          <p className="font-body text-ink font-medium text-[13px]">{gesamt > 0 ? formatEur(gesamt) : '—'}</p>
                        </td>

                        <td
                          className={`border border-stone-200 px-3 py-2.5 text-center ${isSelected ? 'border-clay/40' : ''} ${row.hat_rueckstaende ? 'bg-red-50' : ''}`}
                          onClick={(e) => { e.stopPropagation(); handleToggle(row.id, row.hat_rueckstaende) }}
                        >
                          <span
                            title={row.hat_rueckstaende ? 'Rückstände — klicken zum Aufheben' : 'Kein Rückstand — klicken zum Markieren'}
                            className={`text-[14px] cursor-pointer select-none ${row.hat_rueckstaende ? 'text-red-600' : 'text-emerald-600'}`}
                          >{row.hat_rueckstaende ? '⚠' : '✓'}</span>
                        </td>

                        <td
                          className={`border border-stone-200 px-3 py-2.5 ${STATUS_BG[row.status]} ${isSelected ? 'border-clay/40' : ''}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={row.status}
                            onChange={(e) => handleStatusChange(row.id, e.target.value as MietvertragStatus)}
                            className={`w-full font-label text-[10px] uppercase tracking-widest focus:outline-none cursor-pointer bg-transparent ${STATUS_BG[row.status]}`}
                          >
                            {(['neu', 'aktiv', 'gekuendigt', 'beendet'] as MietvertragStatus[]).map((s) => (
                              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                            ))}
                          </select>
                        </td>

                        <td
                          className={`border border-stone-200 px-3 py-2.5 text-center ${isSelected ? 'border-clay/40 bg-clay/5' : ''}`}
                          onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/mietvertraege?id=${row.id}`) }}
                        >
                          <span className="font-label text-[13px] text-clay hover:text-ink transition-colors cursor-pointer">→</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}

            {rows.length === 0 && leerstehend.length === 0 && (
              <p className="font-body text-smoke italic text-sm">Noch keine Mietverhältnisse vorhanden.</p>
            )}

            {/* Leerstehende Einheiten */}
            {leerstehend.length > 0 && (
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-smoke mb-3 pb-2 border-b border-stone-200">
                  Leerstehende Einheiten ({leerstehend.length})
                </p>
                <table className="w-full border-collapse table-fixed text-sm">
                  <colgroup>
                    <col style={{ width: '40%' }} />
                    <col style={{ width: '30%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '10%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      {['Objekt', 'Einheit', 'Status', ''].map((h) => (
                        <th key={h} className="bg-stone-400 text-white font-label text-[10px] uppercase tracking-widest px-3 py-2 text-left border border-stone-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leerstehend.map((e) => (
                      <tr key={e.id} className="bg-white hover:bg-stone-50">
                        <td className="border border-stone-200 px-3 py-2.5">
                          <p className="font-body text-ink truncate">{e.objAdresse}</p>
                          <p className="font-label text-[10px] text-smoke truncate">{e.objOrt}</p>
                        </td>
                        <td className="border border-stone-200 px-3 py-2.5">
                          <p className="font-body text-ink truncate">
                            {[e.wohnungsnummer ? `W${e.wohnungsnummer}` : '', e.bezeichnung].filter(Boolean).join(' · ') || '—'}
                          </p>
                        </td>
                        <td className="border border-stone-200 px-3 py-2.5 bg-stone-50">
                          <span className="font-label text-[10px] uppercase tracking-widest text-stone-400">Leerstehend</span>
                        </td>
                        <td className="border border-stone-200 px-3 py-2.5 text-center">
                          <button
                            onClick={() => router.push(`/dashboard/mietvertraege?einheit_id=${e.id}`)}
                            className="font-label text-[11px] text-clay hover:text-ink transition-colors"
                          >→</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Dokumente-Panel (rechts, nur wenn ausgewählt) ─── */}
      {selectedMv && (
        <DokumentePanel
          mv={selectedMv}
          dokumente={dokumente}
          onAddVorlage={handleAddVorlage}
          onUpload={handleUpload}
          onDelete={handleDeleteDok}
          uploading={uploading}
          onClose={() => { setSelectedId(null); setDokumente([]) }}
          onOeffnen={(id) => router.push(`/dashboard/mietvertraege?id=${id}`)}
        />
      )}

    </div>
  )
}
