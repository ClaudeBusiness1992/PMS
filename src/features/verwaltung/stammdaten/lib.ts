import { createClient } from '@/lib/supabase'
import type { Vermieter, Objekt, Einheit, Bankkonto } from './types'

// ── Vermieter ──────────────────────────────────────────────

export async function getVermieter(): Promise<Vermieter[]> {
  const sb = createClient()
  const { data, error } = await sb.from('vermieter').select('*').order('reihenfolge')
  if (error) throw error
  return data ?? []
}

export async function upsertVermieter(v: Omit<Vermieter, 'user_id'>): Promise<void> {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const { error } = await sb.from('vermieter').upsert({ ...v, user_id: user!.id })
  if (error) throw error
}

export async function deleteVermieter(id: string): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from('vermieter').delete().eq('id', id)
  if (error) throw error
}

// ── Objekte ────────────────────────────────────────────────

export async function getObjekte(): Promise<Objekt[]> {
  const sb = createClient()
  const { data, error } = await sb
    .from('objekte')
    .select('*, einheiten(*)')
    .order('created_at')
  if (error) throw error
  return (data ?? []).map((o) => ({ ...o, einheiten: o.einheiten ?? [] }))
}

export async function upsertObjekt(o: Omit<Objekt, 'user_id' | 'einheiten'>): Promise<Objekt> {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const { data, error } = await sb
    .from('objekte')
    .upsert({ ...o, energie_gueltig_bis: o.energie_gueltig_bis || null, user_id: user!.id })
    .select()
    .single()
  if (error) throw error
  return { ...data, einheiten: [] }
}

export async function deleteObjekt(id: string): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from('objekte').delete().eq('id', id)
  if (error) throw error
}

// ── Einheiten ──────────────────────────────────────────────

export async function upsertEinheit(e: Omit<Einheit, 'id'> & { id?: string }): Promise<Einheit> {
  const sb = createClient()
  const { data, error } = await sb.from('einheiten').upsert(e).select().single()
  if (error) throw error
  return data
}

export async function deleteEinheit(id: string): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from('einheiten').delete().eq('id', id)
  if (error) throw error
}

// ── Bankkonten ─────────────────────────────────────────────

export async function getBankkonten(): Promise<Bankkonto[]> {
  const sb = createClient()
  const { data, error } = await sb.from('bankkonten').select('*').order('reihenfolge')
  if (error) throw error
  return data ?? []
}

export async function upsertBankkonto(b: Omit<Bankkonto, 'user_id'>): Promise<void> {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  const { error } = await sb.from('bankkonten').upsert({ ...b, user_id: user!.id })
  if (error) throw error
}

export async function deleteBankkonto(id: string): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from('bankkonten').delete().eq('id', id)
  if (error) throw error
}
