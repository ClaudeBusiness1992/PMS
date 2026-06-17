import { createClient } from '@/lib/supabase'
import type { Mietvertrag, Mieter, FormState, MieterFormState, UebersichtRow, MietvertragStatus } from './types'

export async function getMietverhaeltnisseUebersicht(): Promise<UebersichtRow[]> {
  const sb = createClient()
  const { data, error } = await sb
    .from('mietverhaeltnisse')
    .select(`
      id, status, bezeichnung, mietbeginn, befristung_ende, vertragsbindung, zahlungstag, grundmiete, nk_vz, hk_vz, wasser_vz, wasser_in_nk, hat_rueckstaende,
      mieter(id, name, reihenfolge),
      einheit:einheiten(id, bezeichnung, wohnungsnummer, objekt:objekte(id, adresse, ort))
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => ({
    ...row,
    mieter: (row.mieter ?? []).sort((a: Pick<Mieter, 'reihenfolge'>, b: Pick<Mieter, 'reihenfolge'>) => a.reihenfolge - b.reihenfolge),
  })) as unknown as UebersichtRow[]
}

export async function getMietvertragById(id: string): Promise<Mietvertrag | null> {
  const sb = createClient()
  const { data, error } = await sb
    .from('mietverhaeltnisse')
    .select('*, mieter(*)')
    .eq('id', id)
    .single()
  if (error) return null
  return {
    ...data,
    mieter: (data.mieter ?? []).sort((a: Mieter, b: Mieter) => a.reihenfolge - b.reihenfolge),
  }
}

export async function updateMvStatus(id: string, status: MietvertragStatus): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from('mietverhaeltnisse').update({ status }).eq('id', id)
  if (error) throw error
}

export async function toggleRueckstaende(id: string, value: boolean): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from('mietverhaeltnisse').update({ hat_rueckstaende: value }).eq('id', id)
  if (error) throw error
}

export async function getMietvertraege(): Promise<Mietvertrag[]> {
  const sb = createClient()
  const { data, error } = await sb
    .from('mietverhaeltnisse')
    .select('*, mieter(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => ({
    ...row,
    mieter: (row.mieter ?? []).sort((a: Mieter, b: Mieter) => a.reihenfolge - b.reihenfolge),
  }))
}

export async function saveMietvertrag(
  id: string,
  fields: FormState,
  mieter: MieterFormState[]
): Promise<void> {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()

  // Upsert main record
  const { error } = await sb.from('mietverhaeltnisse').upsert({
    id,
    user_id: user!.id,
    status: 'aktiv',
    ...fields,
  })
  if (error) throw error

  // Delete old mieter for this contract
  await sb.from('mieter').delete().eq('mietverhaeltnis_id', id)

  // Insert mieter
  for (const m of mieter) {
    const { ausweis_file, ...rest } = m
    let ausweis_path = rest.ausweis_path

    if (ausweis_file) {
      const ext = ausweis_file.name.split('.').pop()
      const uploadPath = `${user!.id}/${id}/${m.id}.${ext}`
      const { error: uploadErr } = await sb.storage
        .from('ausweise')
        .upload(uploadPath, ausweis_file, { upsert: true, contentType: ausweis_file.type })
      if (!uploadErr) ausweis_path = uploadPath
    }

    const { error: em } = await sb.from('mieter').insert({
      ...rest,
      ausweis_path,
      mietverhaeltnis_id: id,
    })
    if (em) throw em
  }
}

export async function getMvsByEinheit(einheitId: string): Promise<{
  id: string
  bezeichnung: string
  status: MietvertragStatus
  mietbeginn: string
  befristung_ende: string
  mieter: { name: string; reihenfolge: number }[]
}[]> {
  const sb = createClient()
  const { data, error } = await sb
    .from('mietverhaeltnisse')
    .select('id, bezeichnung, status, mietbeginn, befristung_ende, mieter(name, reihenfolge)')
    .eq('einheit_id', einheitId)
    .order('mietbeginn', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    ...row,
    mieter: [...(row.mieter ?? [])].sort(
      (a: { reihenfolge: number }, b: { reihenfolge: number }) => a.reihenfolge - b.reihenfolge
    ),
  }))
}

export async function deleteMietvertrag(id: string): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from('mietverhaeltnisse').delete().eq('id', id)
  if (error) throw error
}

export async function getAusweisUrl(path: string): Promise<string | null> {
  if (!path) return null
  const sb = createClient()
  const { data } = await sb.storage.from('ausweise').createSignedUrl(path, 3600)
  return data?.signedUrl ?? null
}
