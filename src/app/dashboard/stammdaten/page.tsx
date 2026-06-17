'use client'

import { useEffect, useState, useCallback } from 'react'
import { getVermieter, getObjekte, getBankkonten } from '@/features/verwaltung/stammdaten/lib'
import VermieterSection from '@/features/verwaltung/stammdaten/VermieterSection'
import ObjekteSection from '@/features/verwaltung/stammdaten/ObjekteSection'
import BankdatenSection from '@/features/verwaltung/stammdaten/BankdatenSection'
import type { Vermieter, Objekt, Bankkonto } from '@/features/verwaltung/stammdaten/types'

export default function StammdatenPage() {
  const [vermieter, setVermieter] = useState<Vermieter[]>([])
  const [objekte, setObjekte] = useState<Objekt[]>([])
  const [bankkonten, setBankkonten] = useState<Bankkonto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [v, o, b] = await Promise.all([getVermieter(), getObjekte(), getBankkonten()])
      setVermieter(v)
      setObjekte(o)
      setBankkonten(b)
      setError(null)
    } catch (e) {
      setError('Fehler beim Laden der Daten.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <p className="font-body text-smoke">Lädt…</p>
  if (error) return <p className="font-body text-clay">{error}</p>

  return (
    <div className="space-y-14">
      <VermieterSection vermieter={vermieter} onRefresh={load} />
      <ObjekteSection objekte={objekte} vermieter={vermieter} bankkonten={bankkonten} onRefresh={load} />
      <BankdatenSection bankkonten={bankkonten} onRefresh={load} />
    </div>
  )
}
