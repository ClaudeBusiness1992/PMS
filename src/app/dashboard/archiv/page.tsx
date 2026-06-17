'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getObjekte } from '@/features/verwaltung/stammdaten/lib'
import {
  getMietverhaeltnisseUebersicht,
  getMvsByEinheit,
} from '@/features/verwaltung/mietvertraege/lib'
import {
  getDokumente,
  addVorlage,
  uploadDokument,
  deleteDokument,
  getSignedUrl,
} from '@/features/verwaltung/dokumente/lib'
import { VORLAGEN, getVorlage } from '@/features/verwaltung/vorlagen/data'
import { formatDate } from '@/features/verwaltung/mietvertraege/staffelLogic'
import type { Objekt } from '@/features/verwaltung/stammdaten/types'
import type { UebersichtRow, MietvertragStatus } from '@/features/verwaltung/mietvertraege/types'
import type { Dokument } from '@/features/verwaltung/dokumente/types'
import type { Vorlage as VorlageType } from '@/features/verwaltung/vorlagen/data'

// ── Types ──────────────────────────────────────────────────

type DisplayStatus = 'aktiv' | 'gekuendigt' | 'leerstand'

type EinheitNode = {
  id: string
  label: string
  mieterName: string
  status: DisplayStatus
  auszugDatum?: string
}

type ObjektNode = {
  id: string
  adresse: string
  ort: string
  einheiten: EinheitNode[]
}

type MvInfo = {
  id: string
  bezeichnung: string
  status: MietvertragStatus
  mietbeginn: string
  befristung_ende: string
  mieter: { name: string; reihenfolge: number }[]
}

type MvSection = { mv: MvInfo; dokumente: Dokument[] }

type Preview =
  | { typ: 'vorlage'; vorlage: VorlageType; dok: Dokument }
  | { typ: 'url'; url: string; dok: Dokument }
  | null

// ── Helpers ────────────────────────────────────────────────

const DOT: Record<DisplayStatus, string> = {
  aktiv:      'bg-emerald-500',
  gekuendigt: 'bg-amber-400',
  leerstand:  'bg-stone-300',
}

const DISPLAY_LABEL: Record<DisplayStatus, string> = {
  aktiv:      'Aktiv',
  gekuendigt: 'Gekündigt',
  leerstand:  'Leerstehend',
}

const STATUS_LABEL: Record<MietvertragStatus, string> = {
  neu: 'Neu', aktiv: 'Aktiv', gekuendigt: 'Gekündigt', beendet: 'Beendet',
}

const STATUS_BG: Record<MietvertragStatus, string> = {
  neu:        'bg-stone-50 text-stone-500',
  aktiv:      'bg-emerald-50 text-emerald-700',
  gekuendigt: 'bg-amber-50 text-amber-800',
  beendet:    'bg-stone-100 text-stone-400',
}

const STATUS_PRIO: Record<MietvertragStatus, number> = {
  aktiv: 0, gekuendigt: 1, neu: 2, beendet: 3,
}

function buildNodes(objekte: Objekt[], mvs: UebersichtRow[]): ObjektNode[] {
  const mvByEinheit = new Map<string, UebersichtRow>()
  for (const mv of mvs) {
    if (!mv.einheit?.id) continue
    const existing = mvByEinheit.get(mv.einheit.id)
    if (!existing || STATUS_PRIO[mv.status] < STATUS_PRIO[existing.status]) {
      mvByEinheit.set(mv.einheit.id, mv)
    }
  }
  return objekte.map((o) => ({
    id:      o.id,
    adresse: o.adresse,
    ort:     [o.plz, o.ort].filter(Boolean).join(' '),
    einheiten: o.einheiten.map((e) => {
      const mv = mvByEinheit.get(e.id)
      const rawStatus = mv?.status
      const displayStatus: DisplayStatus =
        rawStatus === 'aktiv' ? 'aktiv'
        : rawStatus === 'gekuendigt' ? 'gekuendigt'
        : 'leerstand'
      return {
        id:         e.id,
        label:      [e.wohnungsnummer && `W${e.wohnungsnummer}`, e.bezeichnung].filter(Boolean).join(' · ') || '—',
        mieterName: displayStatus !== 'leerstand' ? (mv?.mieter[0]?.name ?? '') : '',
        status:     displayStatus,
        auszugDatum: displayStatus === 'gekuendigt' && mv?.befristung_ende ? mv.befristung_ende : undefined,
      }
    }),
  }))
}

// ── Left Panel ─────────────────────────────────────────────

function LeftPanel({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: ObjektNode[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const [search, setSearch] = useState('')

  const q = search.toLowerCase().trim()
  const filtered = nodes
    .map((o) => ({
      ...o,
      einheiten: q
        ? o.einheiten.filter(
            (e) =>
              e.label.toLowerCase().includes(q) ||
              e.mieterName.toLowerCase().includes(q) ||
              o.adresse.toLowerCase().includes(q)
          )
        : o.einheiten,
    }))
    .filter((o) => o.einheiten.length > 0)

  return (
    <div className="w-56 shrink-0 h-full border-r border-stone-200 bg-white flex flex-col overflow-hidden">

      <div className="px-3 py-2.5 border-b border-stone-200 shrink-0">
        <input
          type="text"
          placeholder="Suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm font-body bg-stone-50 border border-stone-200 px-3 py-1.5 focus:outline-none focus:border-ink placeholder-stone-300"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((o, i) => (
          <div key={o.id} className={i > 0 ? 'border-t border-stone-200 mt-1' : ''}>

            {/* Objekt-Label — nur Überschrift, nicht klickbar */}
            <div className="px-4 pt-3 pb-1.5">
              <p className="font-label text-xs uppercase tracking-widest text-stone-500 truncate">{o.adresse}</p>
              {o.ort && <p className="font-label text-xs text-stone-400 truncate">{o.ort}</p>}
            </div>

            {/* Einheiten */}
            {o.einheiten.map((e) => (
              <button
                key={e.id}
                onClick={() => onSelect(e.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-l-2 text-left transition-colors ${
                  selectedId === e.id
                    ? 'border-l-clay bg-clay/10'
                    : 'border-l-transparent hover:bg-stone-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${DOT[e.status]}`} />
                <div className="min-w-0">
                  <p className="font-body text-base text-stone-900 truncate">{e.label}</p>
                  <p className={`font-body text-sm truncate ${e.mieterName ? 'text-stone-600' : 'text-stone-400'}`}>
                    {e.mieterName || DISPLAY_LABEL[e.status]}
                  </p>
                  {e.auszugDatum && (
                    <p className="font-label text-[11px] uppercase tracking-widest text-amber-600 mt-0.5">
                      Auszug {formatDate(e.auszugDatum)}
                    </p>
                  )}
                </div>
              </button>
            ))}

            <div className="pb-1" />
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="px-4 py-5 font-body text-sm text-smoke italic">Keine Treffer.</p>
        )}
      </div>
    </div>
  )
}

// ── Add-Dok-Form ───────────────────────────────────────────

function AddDocForm({
  mvId,
  onAdd,
  onClose,
}: {
  mvId: string
  onAdd: (dok: Dokument) => void
  onClose: () => void
}) {
  const [tab, setTab]     = useState<'vorlage' | 'upload'>('vorlage')
  const [file, setFile]   = useState<File | null>(null)
  const [titel, setTitel] = useState('')
  const [busy, setBusy]   = useState(false)

  const handleVorlage = async (v: VorlageType) => {
    setBusy(true)
    try { onAdd(await addVorlage(mvId, v.id, v.label)) } finally { setBusy(false); onClose() }
  }

  const handleUpload = async () => {
    if (!file) return
    setBusy(true)
    try { onAdd(await uploadDokument(mvId, file, titel || file.name)) }
    finally { setBusy(false); onClose() }
  }

  return (
    <div className="mx-3 mb-3 border border-stone-200 bg-white">
      <div className="flex border-b border-stone-200">
        {(['vorlage', 'upload'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 font-label text-xs uppercase tracking-widest border-b-2 transition-colors ${
              tab === t ? 'border-clay text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >{t === 'vorlage' ? 'Vorlage' : 'Datei'}</button>
        ))}
      </div>

      <div className="p-2.5 space-y-1.5">
        {tab === 'vorlage' && VORLAGEN.map((v) => (
          <button key={v.id} onClick={() => handleVorlage(v)} disabled={busy}
            className="w-full text-left px-2.5 py-2 border border-stone-200 bg-stone-50 hover:border-ink hover:bg-white font-body text-sm text-ink transition-colors disabled:opacity-40"
          >📄 {v.label}</button>
        ))}

        {tab === 'upload' && (
          <>
            <input type="text" placeholder="Bezeichnung (optional)" value={titel}
              onChange={(e) => setTitel(e.target.value)}
              className="w-full border border-stone-200 px-2.5 py-1.5 text-sm font-body bg-stone-50 focus:outline-none focus:border-ink"
            />
            <input type="file" accept=".pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-xs font-body text-smoke file:mr-2 file:py-1 file:px-2 file:border file:border-stone-200 file:bg-stone-50 file:text-smoke file:font-label file:text-[10px] file:uppercase file:tracking-widest"
            />
            <button onClick={handleUpload} disabled={!file || busy}
              className="w-full py-1.5 bg-ink text-bone font-label text-[10px] uppercase tracking-widest hover:opacity-80 disabled:opacity-40 transition-opacity"
            >{busy ? 'Lädt …' : 'Hochladen'}</button>
          </>
        )}

        <button onClick={onClose}
          className="w-full pt-1 font-label text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors"
        >Abbrechen</button>
      </div>
    </div>
  )
}

// ── Middle Panel ───────────────────────────────────────────

function MiddlePanel({
  einheitLabel,
  sections,
  loading,
  selectedDokId,
  onSelectDok,
  onAddDok,
  onDeleteDok,
}: {
  einheitLabel: string
  sections: MvSection[]
  loading: boolean
  selectedDokId: string | null
  onSelectDok: (dok: Dokument) => void
  onAddDok: (mvId: string, dok: Dokument) => void
  onDeleteDok: (dok: Dokument) => void
}) {
  const [addingMvId, setAddingMvId] = useState<string | null>(null)

  return (
    <div className="w-80 shrink-0 h-full border-r border-stone-200 bg-stone-50 flex flex-col overflow-hidden">

      <div className="px-4 py-3 bg-white border-b border-stone-200 shrink-0">
        <p className="font-label text-xs uppercase tracking-widest text-stone-500">Einheit</p>
        <p className="font-body text-base text-stone-900 mt-0.5 truncate">{einheitLabel}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && <p className="px-4 py-5 font-body text-sm text-stone-500 italic">Lädt …</p>}

        {!loading && sections.length === 0 && (
          <p className="px-4 py-5 font-body text-sm text-stone-500 italic">Noch kein Mietverhältnis für diese Einheit.</p>
        )}

        {!loading && sections.map(({ mv, dokumente }) => {
          const mieterLabel = mv.mieter.map((m) => m.name).filter(Boolean).join(', ') || mv.bezeichnung || '—'
          const start = mv.mietbeginn ? formatDate(mv.mietbeginn) : ''
          const end   = mv.befristung_ende ? formatDate(mv.befristung_ende) : ''
          const zeitraum = [start, end].filter(Boolean).join(' → ')

          return (
            <div key={mv.id} className="border-b border-stone-200 last:border-b-0">

              <div className="px-4 py-3 bg-white border-b border-stone-100 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-body text-base text-stone-900 truncate">{mieterLabel}</p>
                  {zeitraum && (
                    <p className="font-body text-sm text-stone-500 mt-0.5">{zeitraum}</p>
                  )}
                  {mv.status === 'gekuendigt' && mv.befristung_ende && (
                    <p className="font-label text-xs uppercase tracking-widest text-amber-700 mt-1">
                      Auszug: {formatDate(mv.befristung_ende)}
                    </p>
                  )}
                </div>
                <span className={`shrink-0 font-label text-xs uppercase tracking-widest px-1.5 py-0.5 ${STATUS_BG[mv.status]}`}>
                  {STATUS_LABEL[mv.status]}
                </span>
              </div>

              {dokumente.length === 0 && addingMvId !== mv.id && (
                <p className="px-4 py-2 font-body text-sm text-stone-400 italic">Keine Dokumente</p>
              )}

              {dokumente.map((dok) => (
                <button
                  key={dok.id}
                  onClick={() => onSelectDok(dok)}
                  className={`group w-full flex items-center gap-2.5 px-4 py-3 border-b border-stone-100 text-left transition-colors ${
                    selectedDokId === dok.id ? 'bg-clay/10' : 'hover:bg-white'
                  }`}
                >
                  <span className="text-base shrink-0">{dok.typ === 'vorlage' ? '📄' : '📎'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-base text-stone-900 truncate">{dok.titel}</p>
                    <p className="font-body text-xs text-stone-500">
                      {new Date(dok.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); onDeleteDok(dok) }}
                    className="opacity-0 group-hover:opacity-100 text-clay hover:text-ink text-sm transition-opacity shrink-0 cursor-pointer"
                  >✕</span>
                </button>
              ))}

              {addingMvId === mv.id ? (
                <AddDocForm
                  mvId={mv.id}
                  onAdd={(dok) => { onAddDok(mv.id, dok); setAddingMvId(null) }}
                  onClose={() => setAddingMvId(null)}
                />
              ) : (
                <button
                  onClick={() => setAddingMvId(mv.id)}
                  className="w-full px-4 py-2.5 text-left font-label text-xs uppercase tracking-widest text-clay hover:text-ink hover:bg-white transition-colors"
                >+ Dokument</button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Right Panel ────────────────────────────────────────────

function RightPanel({ preview, loading }: { preview: Preview; loading: boolean }) {
  if (loading) return (
    <div className="flex-1 h-full flex items-center justify-center bg-bone">
      <p className="font-body text-stone-300 italic text-sm">Lädt …</p>
    </div>
  )

  if (!preview) return (
    <div className="flex-1 h-full flex items-center justify-center bg-bone">
      <p className="font-body text-stone-300 italic text-sm">Dokument auswählen</p>
    </div>
  )

  if (preview.typ === 'url') return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-stone-100">
      <div className="px-4 py-3 bg-white border-b border-stone-200 shrink-0">
        <p className="font-body text-base text-stone-900 truncate">{preview.dok.titel}</p>
        <p className="font-label text-xs text-stone-500">Datei</p>
      </div>
      <iframe src={preview.url} className="flex-1 w-full border-0" title={preview.dok.titel} />
    </div>
  )

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-stone-100">
      <div className="px-4 py-3 bg-white border-b border-stone-200 shrink-0">
        <p className="font-body text-base text-stone-900 truncate">{preview.dok.titel}</p>
        <p className="font-label text-xs text-stone-500">Vorlage</p>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[210mm] mx-auto bg-white px-12 py-10 shadow-sm">
          <h1 className="font-display text-2xl text-stone-900 mb-8">{preview.vorlage.label}</h1>
          {preview.vorlage.paragraphen.map((p, i) => (
            <div key={p.id} className="mb-6">
              <h2 className="font-label text-xs uppercase tracking-widest text-stone-900 mb-2">
                § {i + 1} {p.titel}
              </h2>
              <p className="font-body text-sm text-stone-700 leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Inner ──────────────────────────────────────────────────

function ArchivInner() {
  const searchParams     = useSearchParams()
  const initialEinheitId = searchParams.get('einheit_id')

  const [nodes, setNodes]         = useState<ObjektNode[]>([])
  const [treeLoading, setTreeLoading] = useState(true)

  const [selectedId, setSelectedId]           = useState<string | null>(null)
  const [einheitLabel, setEinheitLabel]       = useState('')
  const [sections, setSections]               = useState<MvSection[]>([])
  const [sectionsLoading, setSectionsLoading] = useState(false)

  const [selectedDokId, setSelectedDokId]     = useState<string | null>(null)
  const [preview, setPreview]                 = useState<Preview>(null)
  const [previewLoading, setPreviewLoading]   = useState(false)

  useEffect(() => {
    Promise.all([getObjekte(), getMietverhaeltnisseUebersicht()]).then(([objekte, mvs]) => {
      setNodes(buildNodes(objekte, mvs))
      setTreeLoading(false)
    })
  }, [])

  const handleSelectEinheit = useCallback(async (einheitId: string) => {
    setSelectedId(einheitId)
    setSelectedDokId(null)
    setPreview(null)
    setSections([])
    setSectionsLoading(true)

    const mvs  = await getMvsByEinheit(einheitId)
    const docs = await Promise.all(mvs.map((mv) => getDokumente(mv.id)))
    setSections(mvs.map((mv, i) => ({ mv, dokumente: docs[i] })))
    setSectionsLoading(false)
  }, [])

  useEffect(() => {
    if (initialEinheitId && !treeLoading) {
      handleSelectEinheit(initialEinheitId)
    }
  }, [initialEinheitId, treeLoading, handleSelectEinheit])

  useEffect(() => {
    if (!selectedId || nodes.length === 0) return
    for (const o of nodes) {
      const e = o.einheiten.find((e) => e.id === selectedId)
      if (e) { setEinheitLabel(`${o.adresse} · ${e.label}`); return }
    }
  }, [selectedId, nodes])

  const handleSelectDok = useCallback(async (dok: Dokument) => {
    setSelectedDokId(dok.id)
    setPreview(null)
    setPreviewLoading(true)

    if (dok.typ === 'vorlage') {
      const v = getVorlage(dok.vorlage_id)
      setPreview(v ? { typ: 'vorlage', vorlage: v, dok } : null)
    } else {
      const url = await getSignedUrl(dok.datei_path)
      setPreview(url ? { typ: 'url', url, dok } : null)
    }
    setPreviewLoading(false)
  }, [])

  const handleAddDok = useCallback((mvId: string, dok: Dokument) => {
    setSections((p) => p.map((s) => s.mv.id === mvId ? { ...s, dokumente: [...s.dokumente, dok] } : s))
  }, [])

  const handleDeleteDok = useCallback(async (dok: Dokument) => {
    if (!confirm(`„${dok.titel}" löschen?`)) return
    await deleteDokument(dok.id, dok.datei_path || undefined)
    setSections((p) => p.map((s) => ({ ...s, dokumente: s.dokumente.filter((d) => d.id !== dok.id) })))
    if (selectedDokId === dok.id) { setSelectedDokId(null); setPreview(null) }
  }, [selectedDokId])

  if (treeLoading) return (
    <div className="fixed left-0 right-0 bottom-0 top-[114px] flex items-center justify-center bg-bone">
      <p className="font-body text-smoke italic text-sm">Lädt …</p>
    </div>
  )

  return (
    <div className="fixed left-0 right-0 bottom-0 top-[114px] flex overflow-hidden bg-bone">

      <LeftPanel nodes={nodes} selectedId={selectedId} onSelect={handleSelectEinheit} />

      {selectedId ? (
        <>
          <MiddlePanel
            einheitLabel={einheitLabel}
            sections={sections}
            loading={sectionsLoading}
            selectedDokId={selectedDokId}
            onSelectDok={handleSelectDok}
            onAddDok={handleAddDok}
            onDeleteDok={handleDeleteDok}
          />
          <RightPanel preview={preview} loading={previewLoading} />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-body text-stone-300 italic text-sm">Einheit aus der Liste links auswählen</p>
        </div>
      )}
    </div>
  )
}

// ── Export ─────────────────────────────────────────────────

export default function ArchivPage() {
  return (
    <Suspense fallback={
      <div className="fixed left-0 right-0 bottom-0 top-[114px] flex items-center justify-center bg-bone">
        <p className="font-body text-smoke italic text-sm">Lädt …</p>
      </div>
    }>
      <ArchivInner />
    </Suspense>
  )
}
