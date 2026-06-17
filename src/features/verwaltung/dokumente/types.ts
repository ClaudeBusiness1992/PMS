export type DokumentTyp = 'upload' | 'vorlage'

export type Dokument = {
  id: string
  user_id: string
  mietverhaeltnis_id: string | null
  typ: DokumentTyp
  titel: string
  datei_path: string
  vorlage_id: string
  created_at: string
}
