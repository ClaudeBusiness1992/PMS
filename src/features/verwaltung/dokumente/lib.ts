import { createClient } from '@/lib/supabase'
import type { Dokument } from './types'

export async function getDokumente(mietverhaeltnisId: string): Promise<Dokument[]> {
  const sb = createClient()
  const { data, error } = await sb
    .from('dokumente')
    .select('*')
    .eq('mietverhaeltnis_id', mietverhaeltnisId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addVorlage(
  mietverhaeltnisId: string,
  vorlagenId: string,
  titel: string
): Promise<Dokument> {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const { data, error } = await sb
    .from('dokumente')
    .insert({
      user_id: user!.id,
      mietverhaeltnis_id: mietverhaeltnisId,
      typ: 'vorlage',
      titel,
      vorlage_id: vorlagenId,
      datei_path: '',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadDokument(
  mietverhaeltnisId: string,
  file: File,
  titel: string
): Promise<Dokument> {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()

  const ext = file.name.split('.').pop()
  const path = `${user!.id}/${mietverhaeltnisId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadErr } = await sb.storage
    .from('dokumente')
    .upload(path, file, { upsert: false, contentType: file.type })
  if (uploadErr) throw uploadErr

  const { data, error } = await sb
    .from('dokumente')
    .insert({
      user_id: user!.id,
      mietverhaeltnis_id: mietverhaeltnisId,
      typ: 'upload',
      titel: titel || file.name,
      datei_path: path,
      vorlage_id: '',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteDokument(id: string, dateiPath?: string): Promise<void> {
  const sb = createClient()
  if (dateiPath) {
    await sb.storage.from('dokumente').remove([dateiPath])
  }
  const { error } = await sb.from('dokumente').delete().eq('id', id)
  if (error) throw error
}

export async function getSignedUrl(path: string): Promise<string | null> {
  if (!path) return null
  const sb = createClient()
  const { data } = await sb.storage.from('dokumente').createSignedUrl(path, 3600)
  return data?.signedUrl ?? null
}
