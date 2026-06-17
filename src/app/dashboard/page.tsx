'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  getMietverhaeltnisseUebersicht,
  updateMvStatus,
  toggleRueckstaende,
} from '@/features/verwaltung/mietvertraege/lib'
import { getObjekte, getVermieter } from '@/features/verwaltung/stammdaten/lib'
import { calcGesamtmiete, formatEur, formatDate } from '@/features/verwaltung/mietvertraege/staffelLogic'
import type { UebersichtRow, MietvertragStatus } from '@/features/verwaltung/mietvertraege/types'
import type { Objekt, Vermieter } from '@/features/verwaltung/stammdaten/types'

type DisplayRow = {
  einheitId: string
  objektAdresse: string
  objektOrt: string
  vermieterName: string
  einheitLabel: string
  mv: UebersichtRow | null
}

const STATUS_PRIO: Record<MietvertragStatus, number> = {
  aktiv: 0, gekuendigt: 1, neu: 2, beendet: 3,
}

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

function buildRows(
  objekte: Objekt[],
  vermieterList: Vermieter[],
  mvs: UebersichtRow[],
): DisplayRow[] {
  const vermieterMap = Object.fromEntries(vermieterList.map((v) => [v.id, v.name]))
  const mvByEinheit = new Map<string, UebersichtRow>()
  for (const mv of mvs) {
    if (!mv.einheit?.id) continue
    const existing = mvByEinheit.get(mv.einheit.id)
    if (!existing || STATUS_PRIO[mv.status] < STATUS_PRIO[existing.status]) {
      mvByEinheit.set(mv.einheit.id, mv)
    }
  }

  const rows: DisplayRow[] = []
  for (const o of objekte) {
    const vermieterName = o.vermieter_ids
      .map((id) => vermieterMap[id] ?? '')
      .filter(Boolean)
      .join(', ') || ''

    for (const e of o.einheiten) {
      const einheitLabel =
        [e.wohnungsnummer && `W${e.wohnungsnummer}`, e.bezeichnung]
          .filter(Boolean)
          .join(' · ') || '—'

      rows.push({
        einheitId:      e.id,
        objektAdresse:  o.adresse || '—',
        objektOrt:      [o.plz, o.ort].filter(Boolean).join(' '),
        vermieterName,
        einheitLabel,
        mv: mvByEinheit.get(e.id) ?? null,
      })
    }
  }
  return rows
}

export default function UebersichtPage() {
  const router = useRouter()
  const [rows, setRows]   = useState<DisplayRow[]>([])
  const [mvs, setMvs]     = useState<UebersichtRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [objekte, vermieter, mietverhaeltnisse] = await Promise.all([
      getObjekte(),
      getVermieter(),
      getMietverhaeltnisseUebersicht(),
    ])
    setMvs(mietverhaeltnisse)
    setRows(buildRows(objekte, vermieter, mietverhaeltnisse))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (mvId: string, status: MietvertragStatus) => {
    setMvs((prev) => prev.map((m) => m.id === mvId ? { ...m, status } : m))
    setRows((prev) => prev.map((r) =>
      r.mv?.id === mvId ? { ...r, mv: { ...r.mv!, status } } : r
    ))
    await updateMvStatus(mvId, status)
  }

  const handleToggle = async (mvId: string, current: boolean) => {
    const next = !current
    setMvs((prev) => prev.map((m) => m.id === mvId ? { ...m, hat_rueckstaende: next } : m))
    setRows((prev) => prev.map((r) =>
      r.mv?.id === mvId ? { ...r, mv: { ...r.mv!, hat_rueckstaende: next } } : r
    ))
    await toggleRueckstaende(mvId, next)
  }

  if (loading) return <p className="font-body text-smoke italic text-sm">Lädt…</p>

  if (rows.length === 0) return (
    <div>
      <p className="font-display text-3xl text-ink mb-2">Übersicht</p>
      <p className="font-body text-smoke italic text-sm">Noch keine Objekte oder Einheiten angelegt.</p>
    </div>
  )

  return (
    <div className="-mx-6 -my-10">

      {/* Toolbar */}
      <div className="px-6 py-4 bg-white border-b border-stone-200">
        <p className="font-display text-2xl text-ink">Übersicht</p>
      </div>

      {/* Tabelle */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1060px] border-collapse table-fixed text-sm">
          <colgroup>
            <col style={{ width: '160px' }} /> {/* Objekt */}
            <col style={{ width: '90px'  }} /> {/* Einheit */}
            <col style={{ width: '130px' }} /> {/* Mieter */}
            <col style={{ width: '80px'  }} /> {/* Eingezogen */}
            <col style={{ width: '80px'  }} /> {/* Auszug */}
            <col style={{ width: '80px'  }} /> {/* Kaltmiete */}
            <col style={{ width: '72px'  }} /> {/* NK */}
            <col style={{ width: '72px'  }} /> {/* Heizung */}
            <col style={{ width: '88px'  }} /> {/* Gesamt */}
            <col style={{ width: '52px'  }} /> {/* Rückst. */}
            <col style={{ width: '110px' }} /> {/* Status */}
            <col style={{ width: '44px'  }} /> {/* → */}
          </colgroup>
          <thead>
            <tr>
              {['Objekt', 'Einheit', 'Mieter', 'Eingezogen', 'Auszug', 'Kaltmiete', 'NK', 'Heizung', 'Gesamt', 'Rückst.', 'Status', ''].map((h) => (
                <th key={h} className="bg-ink text-bone font-label text-xs uppercase tracking-widest px-3 py-2.5 text-left border border-stone-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const mv = row.mv
              const gesamt = mv
                ? calcGesamtmiete(mv.grundmiete, mv.nk_vz, mv.hk_vz, mv.wasser_vz, mv.wasser_in_nk)
                : 0
              const kaltmiete = mv ? (parseFloat(mv.grundmiete.replace(',', '.')) || 0) : 0
              const nk        = mv ? (parseFloat(mv.nk_vz.replace(',', '.')) || 0) : 0
              const hk        = mv ? (parseFloat(mv.hk_vz.replace(',', '.')) || 0) : 0

              return (
                <tr key={row.einheitId} className="bg-white hover:bg-stone-50 transition-colors">

                  {/* Objekt */}
                  <td className="border border-stone-200 px-3 py-2.5">
                    <p className="font-body text-ink truncate">{row.objektAdresse}</p>
                    <p className="font-label text-[10px] text-smoke truncate">
                      {[row.objektOrt, row.vermieterName].filter(Boolean).join(' · ')}
                    </p>
                  </td>

                  {/* Einheit */}
                  <td className="border border-stone-200 px-3 py-2.5">
                    <p className="font-body text-ink truncate">{row.einheitLabel}</p>
                  </td>

                  {/* Mieter */}
                  <td className="border border-stone-200 px-3 py-2.5">
                    {mv ? (
                      <>
                        <p className="font-body text-ink truncate">{mv.mieter[0]?.name ?? '—'}</p>
                        {mv.mieter.length > 1 && (
                          <p className="font-label text-[10px] text-smoke">+{mv.mieter.length - 1} weitere</p>
                        )}
                      </>
                    ) : (
                      <p className="font-body text-stone-300 text-[13px]">—</p>
                    )}
                  </td>

                  {/* Eingezogen */}
                  <td className="border border-stone-200 px-3 py-2.5">
                    <p className="font-body text-ink text-[13px]">
                      {mv?.mietbeginn ? formatDate(mv.mietbeginn) : '—'}
                    </p>
                  </td>

                  {/* Auszug */}
                  <td className="border border-stone-200 px-3 py-2.5">
                    {mv?.status === 'gekuendigt' && mv.befristung_ende ? (
                      <p className="font-body text-amber-700 text-[13px] font-medium">
                        {formatDate(mv.befristung_ende)}
                      </p>
                    ) : (
                      <p className="font-body text-stone-300 text-[13px]">—</p>
                    )}
                  </td>

                  {/* Kaltmiete */}
                  <td className="border border-stone-200 px-3 py-2.5 text-right">
                    <p className="font-body text-ink text-[13px]">
                      {kaltmiete > 0 ? formatEur(kaltmiete) : '—'}
                    </p>
                  </td>

                  {/* NK */}
                  <td className="border border-stone-200 px-3 py-2.5 text-right">
                    <p className="font-body text-ink text-[13px]">
                      {nk > 0 ? formatEur(nk) : '—'}
                    </p>
                  </td>

                  {/* Heizung */}
                  <td className="border border-stone-200 px-3 py-2.5 text-right">
                    <p className="font-body text-ink text-[13px]">
                      {hk > 0 ? formatEur(hk) : '—'}
                    </p>
                  </td>

                  {/* Gesamt */}
                  <td className="border border-stone-200 px-3 py-2.5 text-right">
                    <p className="font-body text-ink font-semibold text-[13px]">
                      {gesamt > 0 ? formatEur(gesamt) : '—'}
                    </p>
                  </td>

                  {/* Rückstände */}
                  <td
                    className={`border border-stone-200 px-3 py-2.5 text-center ${mv?.hat_rueckstaende ? 'bg-red-50' : ''}`}
                    onClick={mv ? (e) => { e.stopPropagation(); handleToggle(mv.id, mv.hat_rueckstaende) } : undefined}
                  >
                    {mv ? (
                      <span
                        title={mv.hat_rueckstaende ? 'Rückstände — klicken zum Aufheben' : 'Kein Rückstand — klicken zum Markieren'}
                        className={`text-[14px] cursor-pointer select-none ${mv.hat_rueckstaende ? 'text-red-600' : 'text-emerald-600'}`}
                      >{mv.hat_rueckstaende ? '⚠' : '✓'}</span>
                    ) : (
                      <span className="text-stone-200 text-[13px]">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td
                    className={`border border-stone-200 px-3 py-2.5 ${mv ? STATUS_BG[mv.status] : 'bg-stone-50'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {mv ? (
                      <select
                        value={mv.status}
                        onChange={(e) => handleStatusChange(mv.id, e.target.value as MietvertragStatus)}
                        className={`w-full font-label text-xs uppercase tracking-widest focus:outline-none cursor-pointer bg-transparent ${STATUS_BG[mv.status]}`}
                      >
                        {(['neu', 'aktiv', 'gekuendigt', 'beendet'] as MietvertragStatus[]).map((s) => (
                          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-label text-xs uppercase tracking-widest text-stone-400">Leerstand</span>
                    )}
                  </td>

                  {/* → */}
                  <td className="border border-stone-200 px-3 py-2.5 text-center">
                    <button
                      onClick={() => router.push(`/dashboard/archiv?einheit_id=${row.einheitId}`)}
                      className="font-label text-sm text-clay hover:text-ink transition-colors"
                    >→</button>
                  </td>

                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
