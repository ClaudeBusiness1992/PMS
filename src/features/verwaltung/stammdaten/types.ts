export type Vermieter = {
  id: string
  user_id: string
  name: string
  anschrift: string
  plz: string
  ort: string
  telefon: string
  email: string
  reihenfolge: number
}

export type Einheit = {
  id: string
  objekt_id: string
  bezeichnung: string
  wohnungsnummer: string
  etage: string
  lage: string
  zimmer: string
  nebenraeume: string
  wohnflaeche: string
  strom_nr: string
  gas_nr: string
  wasser_kalt_nr: string
  wasser_warm_nr: string
  heizung_nr: string
  // Ausstattung (wird automatisch in Mietvertrag übernommen)
  hat_balkon: boolean
  hat_terrasse: boolean
  hat_keller: boolean
  hat_dachboden: boolean
  hat_garage: boolean
  hat_stellplatz: boolean
  hat_gasetagenheizung: boolean
  wasser_in_nk: boolean
  kueche_typ: string
  hat_bad: boolean
  hat_wc: boolean
  // Nebenraum-Nummern
  keller_nr: string
  dachboden_nr: string
  garage_nr: string
  stellplatz_nr: string
}

export type Objekt = {
  id: string
  user_id: string
  adresse: string
  plz: string
  ort: string
  baujahr: string
  heizungsart: string
  energieklasse: string
  energie_typ: 'verbrauch' | 'bedarf' | null
  energie_verbrauch: string
  energie_traeger: string
  energie_gueltig_bis: string | null
  bankkonto_id: string | null
  vermieter_ids: string[]
  einheiten: Einheit[]
}

export type Bankkonto = {
  id: string
  user_id: string
  kontoinhaber: string
  iban: string
  bank: string
  reihenfolge: number
}
