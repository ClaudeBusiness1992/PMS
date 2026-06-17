'use client'

import type { FormState, MieterFormState, ActiveSections } from './types'
import type { Vermieter, Objekt, Bankkonto } from '../stammdaten/types'
import { generateStaffeln, formatEur, formatDate, calcKaution, calcGesamtmiete } from './staffelLogic'

type Props = {
  form: FormState
  mieter: MieterFormState[]
  vermieter: Vermieter[]
  objekte: Objekt[]
  bankkonten: Bankkonto[]
  activeSections: ActiveSections
}

// ── Layout ────────────────────────────────────────────────────

const A4Page = ({ children }: { children: React.ReactNode }) => (
  <div
    className="bg-white shadow-md mx-auto"
    style={{ width: '794px', minHeight: '1123px', padding: '72px 76px 60px', boxSizing: 'border-box', fontFamily: 'inherit' }}
  >
    {children}
  </div>
)

// ── Mikro-Komponenten ─────────────────────────────────────────

// Ausfüllfeld: Wert vorhanden → fett; leer → Unterstrich-Platzhalter
const B = ({ v, w = '100px' }: { v?: string | null; w?: string }) =>
  v?.trim()
    ? <strong className="font-semibold">{v.trim()}</strong>
    : <span className="inline-block border-b border-gray-400 align-baseline" style={{ minWidth: w }}>&thinsp;</span>

// Checkbox
const CB = ({ on }: { on: boolean }) => <span>{on ? '☑' : '☐'}</span>

// Fließtext-Absatz
const T = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[13px] leading-[1.6] mb-2 text-[#1A1714]">{children}</p>
)

// Nummerierer Unterabsatz: (1) Text
const SP = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <p className="text-[13px] leading-[1.6] mb-2 text-[#1A1714]">
    <span className="font-medium">({n})</span>&ensp;{children}
  </p>
)

// Paragraf-Überschrift
const PH = ({ n, title }: { n: number; title: string }) => (
  <div className="mt-6 mb-2 pb-0.5 border-b border-gray-200">
    <span className="font-semibold text-[13.5px] text-[#1A1714]">§ {n}&ensp;{title}</span>
  </div>
)

// Einrückung für Listenpunkte
const Bullet = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="list-none pl-4 space-y-0.5 mb-2">
    {items.map((item, i) => (
      <li key={i} className="text-[13px] leading-[1.6] text-[#1A1714] flex gap-1.5">
        <span className="shrink-0">–</span><span>{item}</span>
      </li>
    ))}
  </ul>
)

// Tabelle mit Border
const TRow = ({ left, right, bold }: { left: string; right: string; bold?: boolean }) => (
  <tr className={`border-b border-gray-100 ${bold ? 'bg-gray-50' : ''}`}>
    <td className={`py-1 px-2 text-[13px] ${bold ? 'font-semibold' : ''}`}>{left}</td>
    <td className={`py-1 px-2 text-[13px] text-right ${bold ? 'font-semibold' : ''}`}>{right}</td>
  </tr>
)

// ── Hauptkomponente ───────────────────────────────────────────

export default function VertragPreview({ form, mieter, vermieter, objekte, bankkonten, activeSections }: Props) {
  const staffeln = generateStaffeln(form.grundmiete, form.mietbeginn, form.staffel_erhoehung, form.staffel_jahre)
  const kaution  = calcKaution(form.grundmiete)
  const gesamt   = calcGesamtmiete(form.grundmiete, form.nk_vz, activeSections.gasetagenheizung ? '' : form.hk_vz, form.wasser_vz, !activeSections.wasser)

  // Einheit + Objekt auflösen
  let einheit = null as null | (typeof objekte[0]['einheiten'][0])
  let objekt  = null as null | (typeof objekte[0])
  for (const o of objekte) {
    const e = o.einheiten.find((e) => e.id === form.einheit_id)
    if (e) { einheit = e; objekt = o; break }
  }

  // Nur Vermieter des ausgewählten Objekts anzeigen
  const vermieterFuerObjekt = objekt
    ? vermieter.filter((v) => objekt!.vermieter_ids.includes(v.id))
    : vermieter

  // Bankkonto des Objekts
  const bankkonto = objekt?.bankkonto_id
    ? bankkonten.find((b) => b.id === objekt!.bankkonto_id) ?? null
    : bankkonten[0] ?? null

  // Vertragsbindungsende
  const bindungsende = (() => {
    if (!form.mietbeginn) return null
    const d = new Date(form.mietbeginn)
    d.setFullYear(d.getFullYear() + form.vertragsbindung)
    return formatDate(d.toISOString().split('T')[0])
  })()

  // §2(2) Raumtext
  const kueche_text = einheit?.kueche_typ && einheit.kueche_typ !== 'keine'
    ? `1 ${einheit.kueche_typ}`
    : null
  const sanitaer_text = einheit
    ? [einheit.hat_bad && '1 Badezimmer', einheit.hat_wc && '1 sep. WC'].filter(Boolean).join(', ') || null
    : null

  const formatBezugsmonat = (ym: string) => {
    if (!ym) return null
    const [y, m] = ym.split('-')
    const monate = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
    return `${monate[parseInt(m) - 1]} ${y}`
  }

  const hat_staffel     = activeSections.staffelmiete && !!form.staffel_erhoehung
  const hat_index       = activeSections.indexmiete
  const hat_sonstige    = activeSections.sonstige && !!form.sonstige_vereinbarungen.trim()
  const hat_moebliert   = activeSections.vollmoebliert
  const hat_teilmoebl   = activeSections.teilmoebliert
  const hat_gasetage    = activeSections.gasetagenheizung

  // ── SEITE 1: §1 + §2 ──────────────────────────────────────
  const seite1 = (
    <A4Page>
      {/* Kopf */}
      <div className="text-center mb-7 pb-5 border-b border-gray-300">
        <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-1">Glow Giver Verwaltung</p>
        <h1 className="font-display text-[22px] tracking-wide text-[#1A1714]">MIETVERTRAG</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          {hat_moebliert ? 'über möblierten Wohnraum' : hat_teilmoebl ? 'über teilmöblierten Wohnraum' : 'über Wohnraum'}
          {activeSections.staffelmiete ? ' · Staffelmietvertrag' : hat_index ? ' · Indexmietvertrag' : ' · Standardmietvertrag'}
          {activeSections.befristet ? ' · befristet' : ''}
        </p>
      </div>

      {/* §1 Vertragsparteien */}
      <PH n={1} title="Vertragsparteien" />
      <T>Zwischen</T>

      <div className="grid grid-cols-2 gap-6 my-3">
        {/* Vermieter */}
        <div className="border border-gray-200 p-3">
          <p className="font-label text-[9px] uppercase tracking-widest text-gray-400 mb-1.5">Vermieter</p>
          {vermieterFuerObjekt.length === 0 ? (
            <T><em className="text-gray-400">— Stammdaten hinterlegen —</em></T>
          ) : vermieterFuerObjekt.map((v, i) => (
            <div key={v.id} className={i > 0 ? 'mt-2 pt-2 border-t border-gray-100' : ''}>
              <p className="font-semibold text-[13px]">{v.name || '___________________'}</p>
              {v.anschrift && <p className="text-[13px]">{v.anschrift}</p>}
              {(v.plz || v.ort) && <p className="text-[13px]">{[v.plz, v.ort].filter(Boolean).join(' ')}</p>}
            </div>
          ))}
          <T><em className="text-gray-400 text-[11px]">– nachstehend „Vermieter" genannt –</em></T>
        </div>

        {/* Mieter */}
        <div className="border border-gray-200 p-3">
          <p className="font-label text-[9px] uppercase tracking-widest text-gray-400 mb-1.5">Mieter</p>
          {mieter.filter(m => m.name).length === 0 ? (
            <>
              <T>Name, Vorname: <B w="150px" /></T>
              <T>geb. am: <B w="80px" /></T>
              <T>bisherige Anschrift: <B w="120px" /></T>
            </>
          ) : mieter.filter(m => m.name).map((m, i) => (
            <div key={m.id} className={i > 0 ? 'mt-2 pt-2 border-t border-gray-100' : ''}>
              <p className="font-semibold text-[13px]">{m.name}</p>
              {m.geburtsdatum && <p className="text-[13px]">geb. {formatDate(m.geburtsdatum)}</p>}
              {m.anschrift_alt && <p className="text-[13px]">{m.anschrift_alt}</p>}
            </div>
          ))}
          <T><em className="text-gray-400 text-[11px]">– nachstehend „Mieter" genannt –</em></T>
        </div>
      </div>

      <T>wird folgender Mietvertrag geschlossen. Sind mehrere Personen Mieter, so haften sie für alle Verpflichtungen aus diesem Vertrag als Gesamtschuldner (siehe § 19).</T>

      {/* §2 Mieträume */}
      <PH n={2} title="Mieträume und Mietgegenstand" />

      <SP n={1}>Vermietet werden die nachstehend bezeichneten Räume in:</SP>
      <div className="pl-4 mb-2 space-y-1">
        <T>Anschrift / Lage: <B v={objekt ? [objekt.adresse, objekt.plz, objekt.ort].filter(Boolean).join(', ') : ''} w="200px" /></T>
        <T>Geschoss / Lage im Haus: <B v={einheit ? [einheit.etage, einheit.lage].filter(Boolean).join(', ') : ''} w="120px" /></T>
        <T>Wohnungs-Nr.: <B v={einheit?.wohnungsnummer} w="60px" /></T>
      </div>

      <SP n={2}>Die Wohnung besteht aus <B v={einheit?.zimmer} w="30px" /> Zimmern, <B v={kueche_text ?? ''} w="80px" />, <B v={sanitaer_text ?? ''} w="110px" /> sowie folgenden weiteren Räumen: <B v={einheit?.nebenraeume || ''} w="100px" />.</SP>

      <SP n={3}>Die Wohnfläche beträgt ca. <B v={einheit?.wohnflaeche ? `${einheit.wohnflaeche} m²` : ''} w="60px" />. Diese Angabe dient der Beschreibung; eine bestimmte Beschaffenheit oder Eignung wird damit nicht zugesichert.</SP>

      <SP n={4}>Mitvermietet sind (Zutreffendes ankreuzen):</SP>
      <div className="pl-4 grid grid-cols-2 gap-0.5 mb-2">
        <T><CB on={activeSections.keller} /> Kellerraum Nr. <B v={activeSections.keller ? (einheit?.keller_nr || '') : ''} w="40px" /></T>
        <T><CB on={activeSections.dachboden} /> Dachboden Nr. <B v={activeSections.dachboden ? (einheit?.dachboden_nr || '') : ''} w="40px" /></T>
        <T><CB on={activeSections.garage} /> Garage Nr. <B v={activeSections.garage ? (einheit?.garage_nr || '') : ''} w="40px" /></T>
        <T><CB on={activeSections.stellplatz} /> Stellplatz Nr. <B v={activeSections.stellplatz ? (einheit?.stellplatz_nr || '') : ''} w="40px" /></T>
        <T><CB on={activeSections.balkon} /> Balkon</T>
        <T><CB on={activeSections.terrasse} /> Terrasse</T>
        <T><CB on={false} /> Garten(-anteil)</T>
        <T><CB on={activeSections.einbaukueche} /> Einbauküche</T>
        <T><CB on={hat_moebliert} /> Möblierung (vollständig)</T>
        <T><CB on={hat_teilmoebl} /> Möblierung (teilweise / teilmöbliert)</T>
        <T><CB on={false} /> Gemeinschaftseinrichtungen (Waschküche, Trockenraum)</T>
        <T><CB on={false} /> Sonstiges: <B w="80px" /></T>
      </div>

      <SP n={5}>Dem Mieter werden bei Übergabe folgende Schlüssel ausgehändigt:</SP>
      <div className="pl-4 grid grid-cols-3 gap-0.5 mb-2">
        <T><B v={form.schluessel_haus} w="25px" /> Haustür</T>
        <T><B v={form.schluessel_wohnung} w="25px" /> Wohnungstür</T>
        <T><B v={form.schluessel_briefkasten} w="25px" /> Briefkasten</T>
        {activeSections.keller && <T><B v={form.schluessel_keller} w="25px" /> Keller</T>}
        {activeSections.dachboden && <T><B v={form.schluessel_dachboden} w="25px" /> Dachboden</T>}
        {activeSections.garage && <T><B v={form.schluessel_garage} w="25px" /> Garage</T>}
        {activeSections.stellplatz && <T><B v={form.schluessel_stellplatz} w="25px" /> Stellplatz</T>}
      </div>

      <SP n={6}>Zustand bei Übergabe (für die Schönheitsreparaturen nach § 9 maßgeblich):</SP>
      <div className="pl-4 mb-1">
        <T><CB on={false} /> Die Wohnung wird renoviert / frisch gestrichen übergeben.</T>
        <T><CB on={false} /> Die Wohnung wird unrenoviert übergeben. (In diesem Fall greift § 9 Abs. 6.)</T>
      </div>

      <SP n={7}>Der Zustand der Mietsache wird bei Übergabe in einem gesonderten Übergabeprotokoll (Anlage 1) festgehalten, das Zählerstände, Schlüsselanzahl und etwaige Mängel dokumentiert.</SP>

      <SP n={8}>Ein gültiger Energieausweis wurde dem Mieter spätestens bei Vertragsabschluss vorgelegt; eine Kopie ist als Anlage 3 beigefügt (§ 80 GEG).</SP>
    </A4Page>
  )

  // ── SEITE 2: §3 + §4 + §5 ─────────────────────────────────
  const seite2 = (
    <A4Page>
      {/* §3 Mietzeit */}
      <PH n={3} title="Mietzeit und Kündigung im Überblick" />

      <SP n={1}>Das Mietverhältnis beginnt am <B v={form.mietbeginn ? formatDate(form.mietbeginn) : ''} w="100px" /> (Mietbeginn).</SP>

      <SP n={2}>Die Mietdauer ist (Zutreffendes ankreuzen):</SP>
      <div className="pl-4 mb-2">
        <T><CB on={!activeSections.befristet} /> unbefristet. Das Mietverhältnis läuft auf unbestimmte Zeit und endet durch Kündigung nach den gesetzlichen Vorschriften (siehe § 17).{!activeSections.befristet && bindungsende ? <> Die ordentliche Kündigung ist beidseits frühestens zum <strong>{bindungsende}</strong> möglich ({form.vertragsbindung} Jahre Bindung ab Mietbeginn).</> : null}</T>
        <T><CB on={activeSections.befristet} /> befristet bis zum <B v={activeSections.befristet && form.befristung_ende ? formatDate(form.befristung_ende) : ''} w="100px" />. Eine Befristung ist nur bei Vorliegen eines gesetzlichen Befristungsgrundes wirksam (§ 575 BGB).</T>
      </div>

      {/* §4 Miete */}
      <PH n={4} title="Miete und Nebenkosten" />

      <SP n={1}>Die monatliche Miete setzt sich wie folgt zusammen:</SP>
      <table className="w-full border border-gray-200 mb-2 text-[13px]">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left py-1 px-2 font-semibold border-b border-gray-200">Position</th>
            <th className="text-right py-1 px-2 font-semibold border-b border-gray-200">Betrag in €</th>
          </tr>
        </thead>
        <tbody>
          <TRow left="Nettokaltmiete (Grundmiete)" right={form.grundmiete ? formatEur(form.grundmiete) : '_______________'} />
          {form.nk_vz && <TRow left="Vorauszahlung Betriebskosten (§ 5)" right={formatEur(form.nk_vz)} />}
          {!hat_gasetage && form.hk_vz && <TRow left={!activeSections.wasser ? 'Vorauszahlung Heizung/Warmwasser (§ 5)' : 'Vorauszahlung Heizung (§ 5)'} right={formatEur(form.hk_vz)} />}
          {activeSections.wasser && <TRow left="Vorauszahlung Warmwasser/Wasser" right={parseFloat(form.wasser_vz) > 0 ? formatEur(form.wasser_vz) : '_______________'} />}
          <TRow left="Gesamtmiete (monatlich)" right={gesamt > 0 ? formatEur(gesamt) : '_______________'} bold />
        </tbody>
      </table>

      {hat_gasetage && (
        <T><em>Hinweis: Die Wohnung verfügt über eine Gasetagenheizung. Der Mieter trägt die Energiekosten direkt über einen eigenen Gasvertrag; sie sind nicht Bestandteil dieser Mietzusammenstellung. Wartungskosten können als Betriebskosten umgelegt werden (siehe § 11a).</em></T>
      )}

      <SP n={2}>Möblierungszuschlag: Ein etwaiger Zuschlag für mitvermietete Möbel/Ausstattung wird gesondert ausgewiesen und ist nicht Bestandteil der Nettokaltmiete.</SP>

      <SP n={3}>Mietpreisbremse: Liegt die Wohnung in einem Gebiet mit angespanntem Wohnungsmarkt, darf die Nettokaltmiete zu Mietbeginn die ortsübliche Vergleichsmiete um höchstens 10 % übersteigen (§§ 556d ff. BGB).</SP>

      {/* §5 Betriebskosten */}
      <PH n={5} title="Betriebskosten" />

      <SP n={1}>Neben der Nettokaltmiete trägt der Mieter die Betriebskosten im Sinne des § 556 BGB i. V. m. der Betriebskostenverordnung (BetrKV). Umgelegt werden die folgenden Betriebskosten, soweit sie anfallen:</SP>
      <Bullet items={[
        'laufende öffentliche Lasten des Grundstücks (z. B. Grundsteuer)',
        'Kosten der Wasserversorgung und Entwässerung',
        'Kosten des Betriebs der zentralen Heizungs- und Warmwasseranlage',
        'Kosten des Betriebs des Aufzugs',
        'Kosten der Straßenreinigung und Müllbeseitigung',
        'Kosten der Gebäudereinigung und Ungezieferbekämpfung',
        'Kosten der Gartenpflege',
        'Kosten der Beleuchtung (Allgemeinstrom)',
        'Kosten der Schornsteinreinigung',
        'Kosten der Sach- und Haftpflichtversicherung des Gebäudes',
        'Kosten für Hauswart/Hausmeister',
        'Kosten für Gemeinschaftsantenne bzw. Breitbandanschluss (im gesetzlichen Rahmen)',
        'sonstige Betriebskosten – nur, soweit nachstehend konkret benannt: ___________________',
      ]} />

      <SP n={2}>Abrechnung oder Pauschale:</SP>
      <div className="pl-4 mb-1">
        <T><CB on={true} /> Die Betriebskosten werden als monatliche Vorauszahlung erhoben und jährlich abgerechnet.</T>
        <T><CB on={false} /> Die Betriebskosten werden als Pauschale erhoben.</T>
      </div>

      <SP n={3}>Verteilerschlüssel: Die Betriebskosten werden nach <CB on={true} /> Wohnfläche &ensp;<CB on={false} /> Personenzahl &ensp;<CB on={false} /> Verbrauch/Erfassung umgelegt.</SP>

      {!hat_gasetage && <SP n={4}>Heiz- und Warmwasserkosten werden nach der Heizkostenverordnung (HeizkostenV) abgerechnet, d. h. überwiegend verbrauchsabhängig (mindestens 50 %, regelmäßig 70 %).</SP>}
      {hat_gasetage && <SP n={4}>Heizung und Warmwasser: Die Wohnung verfügt über eine Gasetagenheizung. Eine Abrechnung nach der HeizkostenV erfolgt nicht (§ 11a). Der Mieter trägt die Energiekosten direkt über einen eigenen Gasvertrag.</SP>}

      <SP n={5}>Abrechnungsfrist: Über die Vorauszahlungen wird jährlich abgerechnet. Die Abrechnung ist dem Mieter spätestens zwölf Monate nach Ende des Abrechnungszeitraums mitzuteilen (§ 556 Abs. 3 BGB).</SP>
    </A4Page>
  )

  // ── SEITE 3: §6 + §7 + §8 + §9 ───────────────────────────
  const seite3 = (
    <A4Page>
      {/* §6 Mietanpassung */}
      <PH n={6} title="Mietanpassung" />

      <T>Es gilt – falls nichts angekreuzt ist – die gesetzliche Regelung nach Variante a). Bitte nur eine Variante wählen:</T>

      <div className="pl-2 mt-1.5 space-y-2">
        <div>
          <T><CB on={activeSections.standard} /> a) Vergleichsmiete / Standardmietvertrag (§§ 558 ff. BGB). Die Nettokaltmiete darf innerhalb von 3 Jahren um höchstens 20 % erhöht werden (Kappungsgrenze).</T>
        </div>
        <div>
          <T><CB on={hat_staffel} /> b) Staffelmiete (§ 557a BGB). Die Nettokaltmiete erhöht sich zu den folgenden Zeitpunkten:</T>
          {hat_staffel && staffeln.length > 0 ? (
            <table className="w-full border border-gray-200 mt-1 mb-1 text-[13px] ml-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-1 px-2 font-semibold border-b border-gray-200">ab Datum</th>
                  <th className="text-right py-1 px-2 font-semibold border-b border-gray-200">neue Nettokaltmiete €</th>
                </tr>
              </thead>
              <tbody>
                {staffeln.map((s, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-1 px-2">{s.label}</td>
                    <td className="py-1 px-2 text-right font-semibold">{formatEur(s.betrag)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : hat_staffel ? (
            <p className="pl-4 text-[13px] text-gray-400 italic">Mietbeginn und Grundmiete eingeben um Staffeln zu berechnen.</p>
          ) : null}
        </div>
        <div>
          <T><CB on={hat_index} /> c) Indexmiete (§ 557b BGB). Die Nettokaltmiete ist an den Verbraucherpreisindex für Deutschland (Destatis, Basis 2020=100) gekoppelt.{hat_index && (form.index_ausgangswert || form.index_bezugsmonat) ? <> Ausgangsindexstand: <strong>{form.index_ausgangswert || '___'}</strong> (Bezugsmonat: <strong>{formatBezugsmonat(form.index_bezugsmonat) ?? '___'}</strong>). Anpassungen sind frühestens nach 12 Monaten und aktiver Geltendmachung in Textform wirksam (§ 557b Abs. 2 BGB).</> : null}</T>
        </div>
      </div>

      {/* §7 Zahlung */}
      <PH n={7} title="Zahlung der Miete" />

      <SP n={1}>Die Gesamtmiete ist monatlich im Voraus, spätestens bis zum <B v={form.zahlungstag ? `${form.zahlungstag}.` : ''} w="30px" /> Werktag eines Monats, kostenfrei auf folgendes Konto des Vermieters zu zahlen:</SP>
      <div className="pl-4 mb-1.5">
        <T>Kontoinhaber: <B v={bankkonto?.kontoinhaber} w="150px" /></T>
        <T>IBAN: <B v={bankkonto?.iban} w="180px" /></T>
        <T>Bank / BIC: <B v={bankkonto?.bank} w="150px" /></T>
      </div>

      <SP n={2}>Für die Rechtzeitigkeit der Zahlung kommt es nicht auf den Eingang beim Vermieter an, sondern darauf, dass der Mieter bei einem Zahlungsdienstleister rechtzeitig den Überweisungsauftrag erteilt und sein Konto ausreichend gedeckt ist.</SP>

      {/* §8 Kaution */}
      <PH n={8} title="Mietsicherheit (Kaution)" />

      <SP n={1}>Der Mieter leistet eine Sicherheit in Höhe von <B v={kaution.total > 0 ? formatEur(kaution.total) : ''} w="100px" /> (höchstens drei Nettokaltmieten, § 551 BGB).</SP>

      <SP n={2}>Der Mieter ist berechtigt, die Kaution in drei gleichen monatlichen Teilbeträgen zu zahlen. Die erste Rate{kaution.rate > 0 ? <> (<strong>{formatEur(kaution.rate)}</strong>)</> : null} ist zu Beginn des Mietverhältnisses fällig, die weiteren mit den beiden folgenden Mietzahlungen.</SP>

      <SP n={3}>Der Vermieter legt die Kaution getrennt von seinem Vermögen insolvenzfest und verzinslich an. Die Zinsen stehen dem Mieter zu und erhöhen die Sicherheit.</SP>

      <SP n={4}>Nach Beendigung des Mietverhältnisses und Rückgabe der Wohnung rechnet der Vermieter über die Kaution ab und zahlt sie nebst Zinsen innerhalb einer angemessenen Prüfungsfrist zurück, soweit ihm keine fälligen Ansprüche aus dem Mietverhältnis zustehen. Wegen noch nicht abgerechneter Betriebskosten kann ein angemessener Teilbetrag vorübergehend einbehalten werden.</SP>

      {/* §9 Schönheitsreparaturen */}
      <PH n={9} title="Schönheitsreparaturen" />

      <SP n={1}>Schönheitsreparaturen umfassen das Tapezieren, Anstreichen oder Kalken der Wände und Decken, das Streichen der Fußböden, der Heizkörper einschließlich Heizrohre, der Innentüren sowie der Fenster und Außentüren von innen.</SP>

      <SP n={2}>Wird die Wohnung renoviert übergeben (§ 2 Abs. 6), so übernimmt der Mieter die Schönheitsreparaturen während der Mietzeit auf eigene Kosten, soweit sie durch seinen Gebrauch erforderlich werden.</SP>

      <SP n={3}>Maßgeblich ist der tatsächliche Renovierungsbedarf. Die Arbeiten sind im Allgemeinen – bei normaler Nutzung und soweit erforderlich – in folgenden Zeitabständen zu erwarten: in Küche, Bad und Dusche etwa alle 3 Jahre, in Wohn- und Schlafräumen, Fluren und Toiletten etwa alle 5 Jahre, in Nebenräumen etwa alle 7 Jahre. Diese Zeiträume sind unverbindliche Richtwerte.</SP>

      <SP n={4}>Der Mieter darf die Arbeiten in mittlerer Art und Güte selbst ausführen; die Beauftragung einer Fachfirma kann nicht verlangt werden. Während der Mietzeit ist der Mieter in der Farbwahl frei.</SP>

      <SP n={5}>Bei Rückgabe schuldet der Mieter keine Endrenovierung allein wegen des Auszugs. Fällige Schönheitsreparaturen sind auszuführen; wird gestrichen, ist in hellen, neutralen und allgemein üblichen Farbtönen zu dekorieren.</SP>

      <SP n={6}>Unrenovierte Übergabe: Wird die Wohnung unrenoviert oder mit Gebrauchsspuren übergeben, ist die Übertragung der Schönheitsreparaturen auf den Mieter ohne angemessenen Ausgleich unwirksam. In diesem Fall trägt der Vermieter die Schönheitsreparaturen, sofern die Parteien nicht ausdrücklich einen angemessenen Ausgleich vereinbaren: <B w="200px" />.</SP>
    </A4Page>
  )

  // ── SEITE 4: §10–§17 ──────────────────────────────────────
  const seite4 = (
    <A4Page>
      {/* §10 Kleinreparaturen */}
      <PH n={10} title="Kleinreparaturen (Bagatellschäden)" />

      {activeSections.kleinreparaturen ? (<>
        <SP n={1}>Der Mieter trägt die Kosten – nicht die Durchführung – kleiner Instandsetzungen an Teilen der Mietsache, die seinem häufigen und unmittelbaren Zugriff unterliegen. Dazu gehören insbesondere die Installationsgegenstände für Elektrizität, Wasser und Gas, die Heiz- und Kocheinrichtungen, Fenster- und Türverschlüsse sowie die Verschlussvorrichtungen von Fensterläden/Rollläden.</SP>

        <SP n={2}>Die Kostentragung ist doppelt begrenzt: a) je Einzelfall auf höchstens <B v={`${form.kleinreparatur_einzelfall} €`} w="60px" />, und b) je Kalenderjahr auf höchstens <B v={`${form.kleinreparatur_jahresanteil} %`} w="40px" /> der Jahres-Nettokaltmiete.</SP>

        <SP n={3}>Übersteigen die Kosten einer einzelnen Reparatur den Betrag nach Abs. 2 a), trägt der Vermieter die gesamten Kosten dieser Reparatur; eine anteilige Beteiligung des Mieters findet nicht statt.</SP>
      </>) : (
        <T>Eine Beteiligung des Mieters an Kleinreparaturen wird nicht vereinbart. Für alle Instandsetzungen gilt ausschließlich die gesetzliche Regelung (§§ 535, 538 BGB); der Vermieter trägt die Instandhaltungskosten in vollem Umfang.</T>
      )}

      {/* §11 Obhut */}
      <PH n={11} title="Obhut, Instandhaltung und Anzeigepflichten" />

      <SP n={1}>Der Mieter hat die Mieträume pfleglich zu behandeln und ausreichend zu lüften und zu heizen, um Schäden – insbesondere Feuchtigkeit und Schimmel – zu vermeiden.</SP>

      <SP n={2}>Mängel und Schäden an der Mietsache hat der Mieter dem Vermieter unverzüglich anzuzeigen (§ 536c BGB). Unterbleibt die Anzeige, haftet der Mieter für daraus entstehende weitere Schäden.</SP>

      <SP n={3}>Die laufende Instandhaltung und Instandsetzung der Mietsache obliegt – vorbehaltlich §§ 9 und 10 – dem Vermieter (§ 535 BGB).</SP>

      {/* §11a Gasetagenheizung — nur wenn Toggle aktiv */}
      {hat_gasetage && (<>
        <div className="mt-6 mb-2 pb-0.5 border-b border-gray-200">
          <span className="font-semibold text-[13.5px] text-[#1A1714]">§ 11a&ensp;Gasetagenheizung</span>
        </div>

        <SP n={1}>Die Wohnung ist mit einer Gasetagenheizung (Einzelwohnungs-Therme) ausgestattet, die ausschließlich diese Wohnung versorgt. Da es sich nicht um eine zentrale Heizungs- oder Warmwasserversorgungsanlage im Sinne von § 1 Nr. 1 HeizkostenV handelt, findet die Heizkostenverordnung keine Anwendung. Eine gesonderte Heizkostenabrechnung durch den Vermieter erfolgt nicht.</SP>

        <SP n={2}>Energiekosten: Der Mieter schließt einen eigenen Gasliefervertrag mit dem Energieversorger ab und trägt die Energiekosten für Heizung und Warmwasser unmittelbar selbst. Diese Kosten sind nicht Bestandteil der Miete oder der Betriebskostenabrechnung.</SP>

        <SP n={3}>Wartung: Der Vermieter beauftragt auf eigene Initiative einen Fachbetrieb mit der regelmäßigen Wartung der Anlage (Kontrolle, Reinigung, Einstellung, Austausch kleiner Verschleißteile). Die hierdurch entstehenden Wartungskosten werden als Betriebskosten auf den Mieter umgelegt (BGH VIII ZR 119/12). Eine Verpflichtung des Mieters, die Wartung selbst zu beauftragen oder einen Wartungsvertrag abzuschließen, besteht nicht; eine entsprechende Formularklausel wäre unwirksam.</SP>

        <SP n={4}>Reparaturen: Kosten für Instandsetzungsmaßnahmen, die aufgrund eines Defekts anfallen (z. B. Tausch einer Pumpe, Platine oder des Wärmetauschers), trägt der Vermieter. Hiervon ausgenommen sind lediglich Kleinreparaturen im Rahmen des § 10, sofern die dortige Klausel wirksam vereinbart ist.</SP>

        <SP n={5}>Pflichten des Mieters: Der Mieter hat die Heizungsanlage ordnungsgemäß in Betrieb zu halten, die Wohnung ausreichend zu heizen und zu lüften (Obhutspflicht), Störungen, Defekte oder ungewöhnliche Betriebsgeräusche unverzüglich anzuzeigen (§ 536c BGB) sowie Handwerkern und dem Schornsteinfeger für Wartungs-, Reparatur- und Abgasmessarbeiten Zutritt zu gewähren. Eigenmächtige Eingriffe in die Gasinstallation sind untersagt; diese dürfen ausschließlich von zugelassenen Fachbetrieben vorgenommen werden.</SP>

        <SP n={6}>Sonderfall – vom Mieter eingebaute Therme: Wurde die Gasetagenheizung vom Mieter selbst eingebaut oder auf eigene Kosten angeschafft, obliegen dem Mieter Instandhaltung und Reparatur dieser Anlage. In diesem Fall ist die Anlage im Übergabeprotokoll (Anlage 1) gesondert zu vermerken, und die Parteien treffen eine schriftliche Individualvereinbarung über Eigentum, Kostentragung und Verbleib der Anlage bei Mietende.</SP>
      </>)}

      {/* §12 Bauliche Veränderungen */}
      <PH n={12} title="Bauliche Veränderungen durch den Mieter" />

      <SP n={1}>Bauliche Veränderungen der Mietsache (z. B. Um- und Einbauten, Durchbrüche) bedürfen der vorherigen Zustimmung des Vermieters in Textform. Bei Auszug kann der Vermieter die Wiederherstellung des ursprünglichen Zustands verlangen, soweit nichts anderes vereinbart ist.</SP>

      <SP n={2}>Unberührt bleiben gesetzliche Ansprüche des Mieters auf Zustimmung zu Maßnahmen der Barrierereduzierung, der Lademöglichkeit für Elektrofahrzeuge sowie des Einbruchsschutzes (§ 554 BGB).</SP>

      {/* §13 Untervermietung */}
      <PH n={13} title="Gebrauchsüberlassung an Dritte / Untervermietung" />

      <T>Die Überlassung der Mietsache oder eines Teils an Dritte (Untervermietung) bedarf der Erlaubnis des Vermieters. Hat der Mieter ein berechtigtes Interesse, das nach Vertragsschluss entstanden ist, so kann er die Erlaubnis zur Untervermietung eines Teils der Wohnung verlangen (§ 553 BGB), sofern nicht in der Person des Dritten ein wichtiger Grund entgegensteht oder die Wohnung überbelegt würde.</T>

      {/* §14 Tierhaltung */}
      <PH n={14} title="Tierhaltung" />

      <SP n={1}>Die Haltung von Kleintieren in üblichem Umfang (z. B. Zierfische, Ziervögel, Hamster) ist ohne besondere Erlaubnis gestattet, solange hiervon keine Belästigung oder Beschädigung ausgeht.</SP>

      <SP n={2}>Die Haltung von Hunden und Katzen bedarf der Erlaubnis des Vermieters. Über die Erlaubnis entscheidet der Vermieter nach Abwägung der Interessen im Einzelfall; sie darf nicht ohne sachlichen Grund verweigert werden.</SP>

      {/* §15 Benutzung */}
      <PH n={15} title="Benutzung der Mieträume und Hausordnung" />

      <SP n={1}>Die Räume dürfen nur zu Wohnzwecken genutzt werden. Eine teilgewerbliche oder berufliche Nutzung, die nach außen in Erscheinung tritt oder Publikumsverkehr auslöst, bedarf der Zustimmung des Vermieters.</SP>

      <SP n={2}>Der Mieter nimmt auf die übrigen Hausbewohner Rücksicht und beachtet die üblichen Ruhezeiten. Eine etwaige Hausordnung (Anlage 2) ist Bestandteil dieses Vertrages, soweit sie keine über die gesetzlichen Pflichten hinausgehenden Belastungen begründet.</SP>

      {/* §16 Betreten */}
      <PH n={16} title="Betreten der Mietsache durch den Vermieter" />

      <T>Der Vermieter oder ein Beauftragter darf die Wohnung bei berechtigtem Anlass (z. B. Ablesung, Wartung, erforderliche Besichtigung, beabsichtigter Verkauf oder Neuvermietung) nach rechtzeitiger Ankündigung – in der Regel mindestens 24 bis 48 Stunden vorher – zu angemessenen Zeiten betreten. Ein anlassloses Betretungsrecht oder ein Anspruch auf Hinterlegung eines Schlüssels besteht nicht. Bei Gefahr im Verzug ist der Zutritt jederzeit zulässig.</T>

      {/* §17 Beendigung */}
      <PH n={17} title="Beendigung des Mietverhältnisses" />

      <SP n={1}>Jede Kündigung bedarf der Schriftform (§ 568 BGB). Die elektronische Form ist ausgeschlossen.</SP>

      <SP n={2}>Ordentliche Kündigung des Mieters: Der Mieter kann mit einer Frist von drei Monaten kündigen; die Kündigung muss spätestens am dritten Werktag eines Kalendermonats zum Ablauf des übernächsten Monats zugehen.</SP>

      <SP n={3}>Ordentliche Kündigung des Vermieters: Der Vermieter kann nur kündigen, wenn er ein berechtigtes Interesse hat (§ 573 BGB, z. B. Eigenbedarf). Die Kündigungsfrist verlängert sich mit der Mietdauer: nach 5 Jahren auf 6 Monate, nach 8 Jahren auf 9 Monate; bis dahin beträgt sie 3 Monate.</SP>

      <SP n={4}>Außerordentliche fristlose Kündigung: Das Recht zur fristlosen Kündigung aus wichtigem Grund (insbesondere bei erheblichem Zahlungsverzug) bleibt für beide Seiten unberührt (§§ 543, 569 BGB).</SP>
    </A4Page>
  )

  // ── SEITE 5: §18–§22 + Unterschriften + Anlagen ───────────
  const seite5 = (
    <A4Page>
      {/* §18 Rückgabe */}
      <PH n={18} title="Rückgabe der Mietsache" />

      <SP n={1}>Bei Beendigung des Mietverhältnisses gibt der Mieter die Wohnung vollständig geräumt und besenrein mit sämtlichen Schlüsseln (auch selbst beschafften) zurück. Der Zustand wird in einem Rückgabeprotokoll mit Zählerständen festgehalten.</SP>

      <SP n={2}>Vom Mieter vorgenommene Einrichtungen kann er wegnehmen; er hat die Mietsache in den vertragsgemäßen Zustand zurückzuversetzen, soweit § 12 dies vorsieht.</SP>

      {/* §19 Mehrheit von Mietern */}
      <PH n={19} title="Mehrheit von Mietern" />

      <SP n={1}>Mehrere Mieter haften für alle Verpflichtungen aus diesem Vertrag als Gesamtschuldner.</SP>

      <SP n={2}>Die Mieter bevollmächtigen sich gegenseitig zur Entgegennahme von Erklärungen des Vermieters (Empfangsvollmacht). Eine Kündigung des Mietverhältnisses muss jedoch von allen bzw. gegenüber allen Mietern erklärt werden, um wirksam zu sein.</SP>

      {/* §20 Wohnungsgeberbestätigung */}
      <PH n={20} title="Wohnungsgeberbestätigung" />

      <T>Der Vermieter stellt dem Mieter die zur Anmeldung bei der Meldebehörde erforderliche Wohnungsgeberbestätigung nach § 19 Bundesmeldegesetz (BMG) aus.</T>

      {/* §21 Sonstige Vereinbarungen */}
      <PH n={21} title="Sonstige Vereinbarungen" />

      <T>Folgende ergänzende Vereinbarungen werden getroffen (z. B. Renovierungsausgleich, Stellplatz, Gartenpflege, Rauchwarnmelder-Wartung):</T>
      {hat_sonstige ? (
        <div className="pl-2 mt-1 mb-2">
          <p className="text-[13px] leading-[1.6] whitespace-pre-wrap text-[#1A1714]">{form.sonstige_vereinbarungen}</p>
        </div>
      ) : (
        <div className="pl-2 mt-1 mb-2 space-y-2">
          <div className="border-b border-gray-300 h-5" />
          <div className="border-b border-gray-300 h-5" />
          <div className="border-b border-gray-300 h-5" />
        </div>
      )}

      {/* §22 Schlussbestimmungen */}
      <PH n={22} title="Schlussbestimmungen" />

      <SP n={1}>Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform. Mündliche Nebenabreden bestehen nicht.</SP>

      <SP n={2}>Sollte eine Bestimmung dieses Vertrages unwirksam sein oder werden, so bleibt der Vertrag im Übrigen wirksam. An die Stelle der unwirksamen Bestimmung tritt die gesetzliche Regelung.</SP>

      <SP n={3}>Für Streitigkeiten aus diesem Wohnraummietverhältnis ist das Gericht zuständig, in dessen Bezirk die Wohnung liegt (§ 29a ZPO).</SP>

      {/* Unterschriften */}
      <div className="mt-8 pt-5 border-t border-gray-300">
        <T>Ort, Datum: <B v={objekt ? [objekt.plz, objekt.ort].filter(Boolean).join(' ') : ''} w="200px" /></T>

        <div className="grid grid-cols-2 gap-8 mt-6">
          {/* Vermieter Unterschrift(en) */}
          <div className="space-y-4">
            {vermieter.length > 0 ? vermieter.map((v) => (
              <div key={v.id}>
                <div className="border-b border-gray-400 h-10 mb-1" />
                <p className="text-[11px] text-gray-500">{v.name || 'Vermieter'}</p>
              </div>
            )) : (
              <div>
                <div className="border-b border-gray-400 h-10 mb-1" />
                <p className="text-[11px] text-gray-500">Vermieter</p>
              </div>
            )}
          </div>

          {/* Mieter Unterschrift(en) */}
          <div className="space-y-4">
            {mieter.filter(m => m.name).length > 0 ? mieter.filter(m => m.name).map((m) => (
              <div key={m.id}>
                <div className="border-b border-gray-400 h-10 mb-1" />
                <p className="text-[11px] text-gray-500">{m.name}</p>
              </div>
            )) : (
              <>
                <div>
                  <div className="border-b border-gray-400 h-10 mb-1" />
                  <p className="text-[11px] text-gray-500">Mieter / Mieterin</p>
                </div>
                <div>
                  <div className="border-b border-gray-400 h-10 mb-1" />
                  <p className="text-[11px] text-gray-500">ggf. weitere/r Mieter/in</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Anlagen */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="font-semibold text-[13px] mb-1.5">Anlagen</p>
        <Bullet items={[
          'Anlage 1: Übergabe-/Rückgabeprotokoll',
          'Anlage 2: Hausordnung',
          'Anlage 3: Energieausweis (Kopie)',
          'Anlage 4: Aufstellung der umlagefähigen Betriebskosten',
        ]} />
      </div>
    </A4Page>
  )

  return (
    <div className="py-8 px-6 space-y-4" style={{ minWidth: '858px' }}>
      {seite1}
      {seite2}
      {seite3}
      {seite4}
      {seite5}
    </div>
  )
}
