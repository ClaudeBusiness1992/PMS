'use client'

import { useState } from 'react'
import { upsertObjekt, deleteObjekt, upsertEinheit, deleteEinheit } from './lib'
import type { Objekt, Einheit, Vermieter, Bankkonto } from './types'
import { Field, SelectField, SaveBtn, DeleteBtn, SectionTitle } from '../ui'

type Props = {
  objekte: Objekt[]
  vermieter: Vermieter[]
  bankkonten: Bankkonto[]
  onRefresh: () => Promise<void>
}

// ── Einheit ────────────────────────────────────────────────

function EinheitCard({
  einheit,
  objektId,
  onRefresh,
}: {
  einheit: Einheit
  objektId: string
  onRefresh: () => Promise<void>
}) {
  const [form, setForm] = useState<Einheit>(einheit)
  const [open, setOpen] = useState(!einheit.bezeichnung)

  const set = (k: keyof Einheit) => (val: string) => setForm((f) => ({ ...f, [k]: val }))
  const toggle = (k: keyof Einheit) => () => setForm((f) => ({ ...f, [k]: !(f[k] as boolean) }))

  const save = async () => {
    await upsertEinheit({ ...form, objekt_id: objektId })
    await onRefresh()
  }

  const remove = async () => {
    if (!confirm(`Einheit „${einheit.bezeichnung || 'unbenannt'}" löschen?`)) return
    await deleteEinheit(einheit.id)
    await onRefresh()
  }

  const label = [einheit.bezeichnung, einheit.zimmer && `${einheit.zimmer} Zi.`, einheit.wohnflaeche && `${einheit.wohnflaeche} m²`]
    .filter(Boolean)
    .join(' · ') || 'Neue Einheit'

  return (
    <div className="border border-paper bg-bone">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-label text-sm uppercase tracking-widest text-stone-900">{label}</span>
        <span className="font-label text-sm text-stone-500">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-paper">
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Field label="Bezeichnung" value={form.bezeichnung} onChange={set('bezeichnung')} placeholder="z. B. Wohnung OG links" />
            <Field label="Wohnungsnummer" value={form.wohnungsnummer} onChange={set('wohnungsnummer')} placeholder="z. B. 3 oder W03" />
          </div>
          <div>
            <p className="font-label text-xs uppercase tracking-widest text-stone-600 mb-2">Position</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Etage" value={form.etage} onChange={set('etage')} placeholder="3. OG" />
              <Field label="Lage" value={form.lage} onChange={set('lage')} placeholder="rechts" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Zimmer" value={form.zimmer} onChange={set('zimmer')} placeholder="3" />
            <Field label="Wohnfläche m²" value={form.wohnflaeche} onChange={set('wohnflaeche')} placeholder="78" />
          </div>
          <div>
            <p className="font-label text-xs uppercase tracking-widest text-stone-600 mb-2">Küche & Sanitär</p>
            <div className="mb-3">
              <p className="font-label text-xs uppercase tracking-widest text-stone-600 mb-1.5">Küche</p>
              <div className="flex gap-2">
                {(['keine', 'Küche', 'Wohnküche'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, kueche_typ: opt }))}
                    className={`flex-1 py-1.5 border font-label text-xs uppercase tracking-widest transition-colors ${
                      form.kueche_typ === opt
                        ? 'border-ink bg-ink text-bone'
                        : 'border-paper bg-white text-stone-500 hover:border-stone-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {([
                { key: 'hat_bad', label: 'Bad (Dusche/Wanne)' },
                { key: 'hat_wc',  label: 'Separates WC' },
              ] as { key: keyof Einheit; label: string }[]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form[key]}
                    onChange={toggle(key)}
                    className="accent-clay"
                  />
                  <span className="font-body text-sm text-stone-900">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="font-label text-xs uppercase tracking-widest text-stone-600 mb-2">Nebenräume & Ausstattung</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3">
              {([
                { key: 'hat_balkon',           label: 'Balkon' },
                { key: 'hat_terrasse',          label: 'Terrasse' },
                { key: 'hat_keller',            label: 'Keller' },
                { key: 'hat_dachboden',         label: 'Dachboden' },
                { key: 'hat_garage',            label: 'Garage' },
                { key: 'hat_stellplatz',        label: 'Stellplatz' },
                { key: 'hat_gasetagenheizung',  label: 'Gasetagenheizung' },
              ] as { key: keyof Einheit; label: string }[]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form[key]}
                    onChange={toggle(key)}
                    className="accent-clay"
                  />
                  <span className="font-body text-sm text-stone-900">{label}</span>
                </label>
              ))}
            </div>
            {(form.hat_keller || form.hat_dachboden || form.hat_garage || form.hat_stellplatz) && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-paper">
                {form.hat_keller && (
                  <Field label="Keller Nr." value={form.keller_nr} onChange={set('keller_nr')} placeholder="z. B. 3b" />
                )}
                {form.hat_dachboden && (
                  <Field label="Dachboden Nr." value={form.dachboden_nr} onChange={set('dachboden_nr')} placeholder="z. B. 2" />
                )}
                {form.hat_garage && (
                  <Field label="Garage Nr." value={form.garage_nr} onChange={set('garage_nr')} placeholder="z. B. 7" />
                )}
                {form.hat_stellplatz && (
                  <Field label="Stellplatz Nr." value={form.stellplatz_nr} onChange={set('stellplatz_nr')} placeholder="z. B. 12" />
                )}
              </div>
            )}
          </div>
          <div>
            <p className="font-label text-xs uppercase tracking-widest text-stone-600 mb-2">Nebenkosten</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!form.wasser_in_nk}
                onChange={toggle('wasser_in_nk')}
                className="accent-clay"
              />
              <span className="font-body text-sm text-stone-900">Wasser in Nebenkosten enthalten</span>
            </label>
          </div>

          <div>
            <p className="font-label text-xs uppercase tracking-widest text-stone-600 mb-2">Zählernummern</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Strom" value={form.strom_nr} onChange={set('strom_nr')} placeholder="1234567890" />
              <Field label="Gas" value={form.gas_nr} onChange={set('gas_nr')} placeholder="—" />
              <Field label="Wasser kalt" value={form.wasser_kalt_nr} onChange={set('wasser_kalt_nr')} placeholder="—" />
              <Field label="Wasser warm" value={form.wasser_warm_nr} onChange={set('wasser_warm_nr')} placeholder="—" />
              <Field label="Heizung" value={form.heizung_nr} onChange={set('heizung_nr')} placeholder="—" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-paper">
            <SaveBtn onClick={save} />
            <DeleteBtn label="Einheit löschen" onClick={remove} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Objekt ─────────────────────────────────────────────────

function ObjektCard({
  objekt,
  vermieter,
  bankkonten,
  onRefresh,
}: {
  objekt: Objekt
  vermieter: Vermieter[]
  bankkonten: Bankkonto[]
  onRefresh: () => Promise<void>
}) {
  const { einheiten: _e, ...initialObjekt } = objekt
  const [form, setForm] = useState<Omit<Objekt, 'einheiten'>>(initialObjekt)
  const [saveErr, setSaveErr] = useState<string | null>(null)
  const [open, setOpen] = useState(!objekt.adresse)
  const [addingEinheit, setAddingEinheit] = useState(false)

  const set = (k: keyof Objekt) => (val: string) =>
    setForm((f) => ({ ...f, [k]: val }))

  const toggleVermieter = (vid: string) =>
    setForm((f) => ({
      ...f,
      vermieter_ids: f.vermieter_ids.includes(vid)
        ? f.vermieter_ids.filter((id) => id !== vid)
        : [...f.vermieter_ids, vid],
    }))

  const save = async () => {
    setSaveErr(null)
    try {
      await upsertObjekt(form)
      await onRefresh()
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : 'Fehler beim Speichern.')
      throw e
    }
  }

  const remove = async () => {
    if (!confirm(`Objekt „${objekt.adresse || 'unbenannt'}" und alle Einheiten löschen?`)) return
    await deleteObjekt(objekt.id)
    await onRefresh()
  }

  const addEinheit = async () => {
    setAddingEinheit(true)
    try {
      await upsertEinheit({
        id: crypto.randomUUID(),
        objekt_id: objekt.id,
        bezeichnung: '',
        wohnungsnummer: '',
        etage: '',
        lage: '',
        zimmer: '',
        nebenraeume: '',
        wohnflaeche: '',
        strom_nr: '',
        gas_nr: '',
        wasser_kalt_nr: '',
        wasser_warm_nr: '',
        heizung_nr: '',
        hat_balkon: false,
        hat_terrasse: false,
        hat_keller: false,
        hat_dachboden: false,
        hat_garage: false,
        hat_stellplatz: false,
        hat_gasetagenheizung: false,
        wasser_in_nk: true,
        kueche_typ: 'Küche',
        hat_bad: true,
        hat_wc: false,
        keller_nr: '',
        dachboden_nr: '',
        garage_nr: '',
        stellplatz_nr: '',
      })
      await onRefresh()
    } finally {
      setAddingEinheit(false)
    }
  }

  const headerLabel = [objekt.adresse, [objekt.plz, objekt.ort].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ') || 'Neues Objekt'

  return (
    <div className="border border-paper bg-linen">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-display text-lg text-ink">{headerLabel}</span>
        <span className="font-label text-sm text-stone-500">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-6 space-y-6 border-t border-paper">

          {/* Basisdaten */}
          <div className="space-y-3 pt-5">
            <Field label="Adresse" value={form.adresse} onChange={set('adresse')} placeholder="Musterstraße 12" />
            <div className="grid grid-cols-4 gap-3">
              <Field label="PLZ" value={form.plz} onChange={set('plz')} placeholder="27570" />
              <div className="col-span-2">
                <Field label="Ort" value={form.ort} onChange={set('ort')} placeholder="Bremerhaven" />
              </div>
              <Field label="Baujahr" value={form.baujahr} onChange={set('baujahr')} placeholder="1965" />
              <Field label="Heizungsart" value={form.heizungsart} onChange={set('heizungsart')} placeholder="Gas-Zentralheizung" />
            </div>
          </div>

          {/* Energieausweis */}
          <div>
            <p className="font-label text-xs uppercase tracking-widest text-stone-600 mb-3">Energieausweis</p>
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Typ" value={form.energie_typ ?? ''} onChange={set('energie_typ')}>
                <option value="">—</option>
                <option value="verbrauch">Verbrauchsausweis</option>
                <option value="bedarf">Bedarfsausweis</option>
              </SelectField>
              <Field label="Energieklasse" value={form.energieklasse} onChange={set('energieklasse')} placeholder="C" />
              <Field label="Kennwert kWh/(m²·a)" value={form.energie_verbrauch} onChange={set('energie_verbrauch')} placeholder="120" />
              <Field label="Energieträger" value={form.energie_traeger} onChange={set('energie_traeger')} placeholder="Gas" />
              <Field label="Gültig bis" value={form.energie_gueltig_bis ?? ''} onChange={set('energie_gueltig_bis')} type="date" />
            </div>
          </div>

          {/* Vermieter-Zuordnung */}
          {vermieter.length > 0 && (
            <div>
              <p className="font-label text-xs uppercase tracking-widest text-stone-600 mb-3">Eigentümer</p>
              <div className="flex flex-wrap gap-4">
                {vermieter.map((v) => (
                  <label key={v.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.vermieter_ids.includes(v.id)}
                      onChange={() => toggleVermieter(v.id)}
                      className="accent-clay"
                    />
                    <span className="font-body text-sm text-ink">{v.name || '(unbenannt)'}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Bankkonto-Zuordnung */}
          {bankkonten.length > 0 && (
            <div>
              <p className="font-label text-xs uppercase tracking-widest text-stone-600 mb-3">Zahlungskonto für Mieten</p>
              <SelectField
                label="Bankkonto"
                value={form.bankkonto_id ?? ''}
                onChange={(val) => setForm((f) => ({ ...f, bankkonto_id: val || null }))}
              >
                <option value="">— kein Konto zugewiesen —</option>
                {bankkonten.map((b) => (
                  <option key={b.id} value={b.id}>
                    {[b.kontoinhaber, b.bank, b.iban].filter(Boolean).join(' · ')}
                  </option>
                ))}
              </SelectField>
            </div>
          )}

          {saveErr && (
            <p className="font-body text-sm text-clay">{saveErr}</p>
          )}

          <div className="flex items-center justify-between border-t border-paper pt-3">
            <SaveBtn onClick={save} />
            <DeleteBtn label="Objekt löschen" onClick={remove} />
          </div>

          {/* Einheiten */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <p className="font-label text-xs uppercase tracking-widest text-stone-600">
                Einheiten ({objekt.einheiten.length})
              </p>
              <button
                onClick={addEinheit}
                disabled={addingEinheit}
                className="font-label text-sm uppercase tracking-widest text-clay hover:text-stone-900 transition-colors disabled:opacity-40"
              >
                + Einheit
              </button>
            </div>
            {objekt.einheiten.length === 0 ? (
              <p className="font-body text-sm text-smoke italic">Noch keine Einheiten angelegt.</p>
            ) : (
              <div className="space-y-2">
                {objekt.einheiten.map((e) => (
                  <EinheitCard key={e.id} einheit={e} objektId={objekt.id} onRefresh={onRefresh} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Section ────────────────────────────────────────────────

export default function ObjekteSection({ objekte, vermieter, bankkonten, onRefresh }: Props) {
  const [adding, setAdding] = useState(false)

  const add = async () => {
    setAdding(true)
    try {
      await upsertObjekt({
        id: crypto.randomUUID(),
        adresse: '',
        plz: '',
        ort: '',
        baujahr: '',
        heizungsart: '',
        energieklasse: '',
        energie_typ: null,
        energie_verbrauch: '',
        energie_traeger: '',
        energie_gueltig_bis: null,
        bankkonto_id: null,
        vermieter_ids: vermieter.map((v) => v.id),
      })
      await onRefresh()
    } finally {
      setAdding(false)
    }
  }

  return (
    <section>
      <div className="flex items-baseline justify-between mb-5">
        <SectionTitle>Objekte & Einheiten</SectionTitle>
        <button
          onClick={add}
          disabled={adding}
          className="font-label text-sm uppercase tracking-widest text-clay hover:text-stone-900 transition-colors disabled:opacity-40"
        >
          + Objekt hinzufügen
        </button>
      </div>

      {objekte.length === 0 ? (
        <p className="font-body text-stone-500 italic text-sm">Noch kein Objekt angelegt.</p>
      ) : (
        <div className="space-y-3">
          {objekte.map((o) => (
            <ObjektCard key={o.id} objekt={o} vermieter={vermieter} bankkonten={bankkonten} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </section>
  )
}
