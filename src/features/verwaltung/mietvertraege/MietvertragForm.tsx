'use client'

import { Field, SectionTitle, DeleteBtn } from '../ui'
import type { FormState, MieterFormState, ActiveSections, SectionKey } from './types'
import type { Objekt } from '../stammdaten/types'

const SIDEBAR_GROUPS: { label: string; keys: { key: SectionKey; label: string }[] }[] = [
  {
    label: 'Mietart',
    keys: [
      { key: 'standard',     label: 'Standardmietvertrag' },
      { key: 'staffelmiete', label: 'Staffelmietvertrag' },
      { key: 'indexmiete',   label: 'Indexmietvertrag' },
    ],
  },
  {
    label: 'Laufzeit',
    keys: [
      { key: 'befristet', label: 'Befristeter Vertrag' },
    ],
  },
  {
    label: 'Möblierung',
    keys: [
      { key: 'vollmoebliert', label: 'Vollmöbliert' },
      { key: 'teilmoebliert', label: 'Teilmöbliert' },
      { key: 'einbaukueche',  label: 'Einbauküche' },
    ],
  },
  {
    label: 'Ausstattung',
    keys: [
      { key: 'balkon',           label: 'Balkon' },
      { key: 'terrasse',         label: 'Terrasse' },
      { key: 'gasetagenheizung', label: 'Gasetagenheizung' },
    ],
  },
  {
    label: 'Nebenräume',
    keys: [
      { key: 'keller',     label: 'Keller' },
      { key: 'dachboden',  label: 'Dachboden' },
      { key: 'garage',     label: 'Garage' },
      { key: 'stellplatz', label: 'Stellplatz' },
    ],
  },
  {
    label: 'Konditionen',
    keys: [
      { key: 'wasser',           label: 'Wasser separat' },
      { key: 'kleinreparaturen', label: 'Kleinreparaturen' },
      { key: 'sonstige',         label: 'Sonstige Vereinbarungen' },
    ],
  },
]

type Props = {
  form: FormState
  mieter: MieterFormState[]
  objekte: Objekt[]
  activeSections: ActiveSections
  onChange: (field: keyof FormState, value: FormState[keyof FormState]) => void
  onMieterChange: (i: number, field: keyof MieterFormState, value: string | File | null) => void
  onAddMieter: () => void
  onRemoveMieter: (i: number) => void
  onSectionToggle: (key: SectionKey) => void
  onSave: () => Promise<void>
  saving: boolean
  savedMsg: string | null
  lockedSections?: SectionKey[]
}

const ToggleBtn = ({
  label, active, onClick, locked,
}: { label: string; active: boolean; onClick: () => void; locked?: boolean }) => (
  <button
    type="button"
    onClick={locked ? undefined : onClick}
    className={`w-full flex items-center justify-between px-2.5 py-1.5 border font-label text-[11px] uppercase tracking-widest transition-colors ${
      locked
        ? active
          ? 'bg-ink text-bone border-ink cursor-not-allowed'
          : 'bg-white text-stone-400 border-paper cursor-not-allowed'
        : active
          ? 'bg-ink text-bone border-ink'
          : 'bg-white text-stone-500 border-paper hover:border-stone-400'
    }`}
  >
    <span>{label}</span>
    {locked && <span className="text-red-400 text-[11px] leading-none">🔒</span>}
  </button>
)

export default function MietvertragForm({
  form, mieter, objekte, activeSections,
  onChange, onMieterChange, onAddMieter, onRemoveMieter, onSectionToggle,
  onSave, saving, savedMsg, lockedSections,
}: Props) {
  const einheitOptions = objekte.flatMap((o) =>
    o.einheiten.map((e) => ({
      id: e.id,
      label: `${o.adresse} · ${e.wohnungsnummer ? `W${e.wohnungsnummer} · ` : ''}${e.bezeichnung || e.etage || 'Einheit'}`,
    }))
  )

  return (
    <div className="flex min-h-full">

      {/* ── Linke Sidebar: Vertragsabschnitte ── */}
      <div className="w-[194px] shrink-0 border-r border-paper bg-linen px-3 py-6 space-y-5 sticky top-0 self-start">
        {!form.einheit_id && (
          <p className="font-label text-sm font-bold uppercase tracking-widest text-red-600 leading-relaxed">
            ⚠ Bitte zuerst eine Einheit wählen!
          </p>
        )}
        <div className={!form.einheit_id ? 'opacity-30 pointer-events-none' : undefined}>
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1 mb-5">
              <p className="font-label text-[10px] uppercase tracking-widest text-stone-500 mb-1.5">{group.label}</p>
              {group.keys.map((t) => (
                <ToggleBtn
                  key={t.key}
                  label={t.label}
                  active={activeSections[t.key]}
                  onClick={() => onSectionToggle(t.key)}
                  locked={lockedSections?.includes(t.key)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Rechts: Formularinhalt ── */}
      <div className="flex-1 px-8 py-8 space-y-6">

        {savedMsg && (
          <p className="font-label text-sm text-emerald-700 uppercase tracking-widest">{savedMsg}</p>
        )}

        {/* Mietobjekt */}
        <div className="space-y-3">
          <SectionTitle>Mietobjekt</SectionTitle>
          <div>
            <label className="block font-label text-xs uppercase tracking-widest text-stone-600 mb-1.5">Einheit</label>
            <select
              value={form.einheit_id ?? ''}
              onChange={(e) => onChange('einheit_id', e.target.value || null)}
              className="w-full border border-paper bg-white px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-ink transition-colors"
            >
              <option value="">— bitte wählen —</option>
              {einheitOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
          <Field
            label="Interne Bezeichnung"
            value={form.bezeichnung}
            onChange={(v) => onChange('bezeichnung', v)}
            placeholder="z. B. Müller / 2. OG"
          />
        </div>

        {/* Mieter */}
        <div className="space-y-3">
          <SectionTitle>Mieter</SectionTitle>
          {mieter.map((m, i) => (
            <div key={m.id} className="bg-linen border border-paper p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label text-xs uppercase tracking-widest text-stone-600">
                  {i === 0 ? 'Hauptmieter' : `Mitmieter ${i}`}
                </span>
                {mieter.length > 1 && (
                  <DeleteBtn label="Entfernen" onClick={() => onRemoveMieter(i)} />
                )}
              </div>
              <Field label="Name *" value={m.name} onChange={(v) => onMieterChange(i, 'name', v)} placeholder="Max Mustermann" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Geburtsdatum" value={m.geburtsdatum} onChange={(v) => onMieterChange(i, 'geburtsdatum', v)} type="date" />
                <Field label="Telefon" value={m.telefon} onChange={(v) => onMieterChange(i, 'telefon', v)} placeholder="+49 471 …" />
              </div>
              <Field label="Bisherige Anschrift" value={m.anschrift_alt} onChange={(v) => onMieterChange(i, 'anschrift_alt', v)} placeholder="Musterstraße 1, 27570 Bremerhaven" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="E-Mail" value={m.email} onChange={(v) => onMieterChange(i, 'email', v)} placeholder="max@example.com" />
                <Field label="Ausweis-Nr." value={m.ausweis_nr} onChange={(v) => onMieterChange(i, 'ausweis_nr', v)} placeholder="T22000129" />
              </div>
              <Field label="BG-Nummer" value={m.bg_nummer} onChange={(v) => onMieterChange(i, 'bg_nummer', v)} placeholder="BG-Nr. vom Jobcenter" />
              <div>
                <label className="block font-label text-xs uppercase tracking-widest text-stone-600 mb-1.5">Ausweis hochladen</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => onMieterChange(i, 'ausweis_file', e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-ink font-body file:mr-3 file:py-1.5 file:px-3 file:border file:border-paper file:bg-bone file:text-smoke file:font-label file:text-[10px] file:uppercase file:tracking-widest hover:file:border-ink transition-colors"
                />
                {m.ausweis_path && !m.ausweis_file && (
                  <p className="font-label text-[10px] text-smoke mt-1">✓ Ausweis bereits hinterlegt</p>
                )}
              </div>
            </div>
          ))}
          {mieter.length < 4 && (
            <button type="button" onClick={onAddMieter} className="font-label text-sm uppercase tracking-widest text-clay hover:text-stone-900 transition-colors">
              + Weiteren Mieter
            </button>
          )}
        </div>

        {/* Mietzeit */}
        <div className="space-y-3">
          <SectionTitle>Mietzeit</SectionTitle>
          <Field label="Mietbeginn *" value={form.mietbeginn} onChange={(v) => onChange('mietbeginn', v)} type="date" />
          {activeSections.befristet && (
            <Field label="Befristung bis" value={form.befristung_ende} onChange={(v) => onChange('befristung_ende', v)} type="date" />
          )}
          {!activeSections.befristet && (
            <div>
              <label className="block font-label text-xs uppercase tracking-widest text-stone-600 mb-1.5">Vertragsbindung</label>
              <div className="flex gap-2">
                {[2, 3, 4].map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => onChange('vertragsbindung', y)}
                    className={`flex-1 py-2 border font-label text-sm uppercase tracking-widest transition-colors ${
                      form.vertragsbindung === y
                        ? 'border-ink bg-ink text-bone'
                        : 'border-paper bg-white text-ink hover:border-smoke'
                    }`}
                  >
                    {y} Jahre
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mietpreis */}
        <div className="space-y-3">
          <SectionTitle>Mietpreis</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kaltmiete netto €" value={form.grundmiete} onChange={(v) => onChange('grundmiete', v)} />
            <Field label="Nebenkosten-VZ €" value={form.nk_vz} onChange={(v) => onChange('nk_vz', v)} />
            {!activeSections.gasetagenheizung && (
              <Field label="Heizkosten-VZ €" value={form.hk_vz} onChange={(v) => onChange('hk_vz', v)} />
            )}
            {activeSections.wasser && (
              <Field label="Wasser-VZ €" value={form.wasser_vz} onChange={(v) => onChange('wasser_vz', v)} />
            )}
          </div>
        </div>

        {/* Staffelmiete (optional) */}
        {activeSections.staffelmiete && (
          <div className="space-y-3">
            <SectionTitle>Staffelmiete</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Jährliche Erhöhung €"
                value={form.staffel_erhoehung}
                onChange={(v) => onChange('staffel_erhoehung', v)}
                placeholder="z. B. 15,00"
              />
              <Field
                label="Anzahl Staffeljahre"
                value={form.staffel_jahre}
                onChange={(v) => onChange('staffel_jahre', v)}
                placeholder="z. B. 5"
              />
            </div>
            <p className="font-body text-xs text-stone-500 leading-relaxed">
              Hinweis: Jede Staffel muss die ortsübliche Vergleichsmiete beachten. Übersteigt eine
              Stufe sie um mehr als 10 % (Mietpreisbremse, §§ 556d ff. BGB), kann der Mieter
              widersprechen bzw. sonderkündigen.
            </p>
          </div>
        )}

        {/* Indexmiete (optional) */}
        {activeSections.indexmiete && (
          <div className="space-y-3">
            <SectionTitle>Indexmiete</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Bezugsmonat VPI"
                value={form.index_bezugsmonat}
                onChange={(v) => onChange('index_bezugsmonat', v)}
                type="month"
                placeholder=""
              />
              <Field
                label="Ausgangsindexstand"
                value={form.index_ausgangswert}
                onChange={(v) => onChange('index_ausgangswert', v)}
                placeholder="z. B. 119,4"
              />
            </div>
            <p className="font-body text-xs text-smoke">VPI für Deutschland · Destatis · Basis 2020 = 100</p>
          </div>
        )}

        {/* Schlüssel */}
        <div className="space-y-3">
          <SectionTitle>Schlüssel</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Wohnung" value={form.schluessel_wohnung} onChange={(v) => onChange('schluessel_wohnung', v)} />
            <Field label="Haus" value={form.schluessel_haus} onChange={(v) => onChange('schluessel_haus', v)} />
            <Field label="Briefkasten" value={form.schluessel_briefkasten} onChange={(v) => onChange('schluessel_briefkasten', v)} />
            {activeSections.keller && (
              <Field label="Keller (Anzahl)" value={form.schluessel_keller} onChange={(v) => onChange('schluessel_keller', v)} />
            )}
            {activeSections.dachboden && (
              <Field label="Dachboden (Anzahl)" value={form.schluessel_dachboden} onChange={(v) => onChange('schluessel_dachboden', v)} />
            )}
            {activeSections.garage && (
              <Field label="Garage (Anzahl)" value={form.schluessel_garage} onChange={(v) => onChange('schluessel_garage', v)} />
            )}
            {activeSections.stellplatz && (
              <Field label="Stellplatz (Anzahl)" value={form.schluessel_stellplatz} onChange={(v) => onChange('schluessel_stellplatz', v)} />
            )}
          </div>

        </div>

        {/* Konditionen */}
        <div className="space-y-3">
          <SectionTitle>Konditionen</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Zahlungstag" value={form.zahlungstag} onChange={(v) => onChange('zahlungstag', v)} placeholder="3" />
            {activeSections.kleinreparaturen && (
              <>
                <Field label="Kleinrep. Einzelfall €" value={form.kleinreparatur_einzelfall} onChange={(v) => onChange('kleinreparatur_einzelfall', v)} placeholder="100" />
                <Field label="Kleinrep. Jahresanteil %" value={form.kleinreparatur_jahresanteil} onChange={(v) => onChange('kleinreparatur_jahresanteil', v)} placeholder="8" />
              </>
            )}
          </div>
        </div>

        {/* Sonstige Vereinbarungen (optional) */}
        {activeSections.sonstige && (
          <div className="space-y-3">
            <SectionTitle>Sonstige Vereinbarungen</SectionTitle>
            <textarea
              rows={4}
              value={form.sonstige_vereinbarungen}
              onChange={(e) => onChange('sonstige_vereinbarungen', e.target.value)}
              placeholder="Individuelle Vereinbarungen, Sonderregelungen …"
              className="w-full bg-white border border-paper px-3 py-2 font-body text-sm text-ink placeholder:text-smoke focus:outline-none focus:border-ink resize-none transition-colors"
            />
          </div>
        )}

        {/* Interne Notizen */}
        <div className="space-y-3">
          <SectionTitle>Interne Notizen</SectionTitle>
          <textarea
            rows={2}
            value={form.notizen}
            onChange={(e) => onChange('notizen', e.target.value)}
            placeholder="Interne Anmerkungen (erscheinen nicht im Vertrag)"
            className="w-full bg-white border border-paper px-3 py-2 font-body text-sm text-ink placeholder:text-smoke focus:outline-none focus:border-ink resize-none transition-colors"
          />
        </div>

        {/* Speichern */}
        <div className="border-t border-paper pt-4">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className={`w-full py-3 font-label text-sm uppercase tracking-widest transition-colors disabled:opacity-40 ${
              savedMsg ? 'bg-emerald-600 text-white' : 'bg-ink text-bone hover:opacity-80'
            }`}
          >
            {saving ? 'Wird gespeichert …' : savedMsg ? `✓ ${savedMsg}` : 'Mietvertrag speichern & archivieren'}
          </button>
        </div>
      </div>
    </div>
  )
}