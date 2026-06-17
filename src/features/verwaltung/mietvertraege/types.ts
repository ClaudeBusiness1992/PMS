export type MietvertragStatus = 'neu' | 'aktiv' | 'gekuendigt' | 'beendet'

export type SectionKey =
  // Mietart (genau eine aktiv)
  | 'standard' | 'staffelmiete' | 'indexmiete'
  // Laufzeit
  | 'befristet'
  // Möblierung
  | 'vollmoebliert' | 'teilmoebliert' | 'einbaukueche'
  // Ausstattung
  | 'balkon' | 'terrasse' | 'gasetagenheizung'
  // Nebenräume
  | 'keller' | 'dachboden' | 'garage' | 'stellplatz'
  // Konditionen
  | 'wasser' | 'kleinreparaturen' | 'sonstige'

export type ActiveSections = Record<SectionKey, boolean>
export const defaultSections = (): ActiveSections => ({
  // Mietart
  standard:          true,
  staffelmiete:      false,
  indexmiete:        false,
  // Laufzeit
  befristet:         false,
  // Möblierung
  vollmoebliert:     false,
  teilmoebliert:     false,
  einbaukueche:      false,
  // Ausstattung
  balkon:            false,
  terrasse:          false,
  gasetagenheizung:  false,
  // Nebenräume
  keller:            false,
  dachboden:         false,
  garage:            false,
  stellplatz:        false,
  // Konditionen
  wasser:            false,
  kleinreparaturen:  true,
  sonstige:          false,
})

export type Mieter = {
  id: string
  mietverhaeltnis_id: string
  reihenfolge: number
  name: string
  geburtsdatum: string
  anschrift_alt: string
  telefon: string
  email: string
  ausweis_nr: string
  bg_nummer: string
  ausweis_path: string
}

export type UebersichtRow = {
  id: string
  status: MietvertragStatus
  bezeichnung: string
  vertragsbindung: number
  zahlungstag: string
  mietbeginn: string
  befristung_ende: string
  grundmiete: string
  nk_vz: string
  hk_vz: string
  wasser_vz: string
  wasser_in_nk: boolean
  hat_rueckstaende: boolean
  mieter: Pick<Mieter, 'id' | 'name' | 'reihenfolge'>[]
  einheit: {
    id: string
    bezeichnung: string
    wohnungsnummer: string
    objekt: { id: string; adresse: string; ort: string } | null
  } | null
}

export type Mietvertrag = {
  id: string
  user_id: string
  einheit_id: string | null
  status: MietvertragStatus
  hat_rueckstaende: boolean
  bezeichnung: string
  notizen: string
  // Mietzeit
  mietbeginn: string
  befristung_ende: string
  vertragsbindung: number
  // Mietpreis
  grundmiete: string
  nk_vz: string
  wasser_vz: string
  wasser_in_nk: boolean
  hk_vz: string
  // Mietart / Möblierung (Vertrags-Eigenschaften, persistent)
  ist_indexmiete: boolean
  ist_vollmoebliert: boolean
  ist_teilmoebliert: boolean
  hat_einbaukueche: boolean
  // Staffelmiete / Indexmiete
  staffel_erhoehung: string
  staffel_jahre: string
  // Schlüssel
  schluessel_wohnung: string
  schluessel_haus: string
  schluessel_briefkasten: string
  schluessel_keller: string
  schluessel_dachboden: string
  schluessel_garage: string
  schluessel_stellplatz: string
  // Konditionen
  sonstige_vereinbarungen: string
  zahlungstag: string
  kleinreparatur_einzelfall: string
  kleinreparatur_jahresanteil: string
  // Indexmiete
  index_bezugsmonat: string
  index_ausgangswert: string
  // nested
  mieter: Mieter[]
}

export type MieterFormState = Omit<Mieter, 'mietverhaeltnis_id'> & {
  ausweis_file: File | null
}

export type FormState = Omit<Mietvertrag, 'id' | 'user_id' | 'status' | 'hat_rueckstaende' | 'mieter'>

export const defaultFormState = (): FormState => ({
  einheit_id: null,
  bezeichnung: '',
  notizen: '',
  mietbeginn: '',
  befristung_ende: '',
  vertragsbindung: 2,
  grundmiete: '',
  nk_vz: '',
  wasser_vz: '0',
  wasser_in_nk: true,
  hk_vz: '',
  ist_indexmiete: false,
  ist_vollmoebliert: false,
  ist_teilmoebliert: false,
  hat_einbaukueche: false,
  staffel_erhoehung: '',
  staffel_jahre: '5',
  schluessel_wohnung: '2',
  schluessel_haus: '2',
  schluessel_briefkasten: '1',
  schluessel_keller: '0',
  schluessel_dachboden: '0',
  schluessel_garage: '0',
  schluessel_stellplatz: '0',
  sonstige_vereinbarungen: '',
  zahlungstag: '3',
  kleinreparatur_einzelfall: '100',
  kleinreparatur_jahresanteil: '8',
  index_bezugsmonat: '',
  index_ausgangswert: '',
})

export const defaultMieter = (): MieterFormState => ({
  id: crypto.randomUUID(),
  reihenfolge: 1,
  name: '',
  geburtsdatum: '',
  anschrift_alt: '',
  telefon: '',
  email: '',
  ausweis_nr: '',
  bg_nummer: '',
  ausweis_path: '',
  ausweis_file: null,
})
