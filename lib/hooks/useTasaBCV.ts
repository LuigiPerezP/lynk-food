'use client'

import { useEffect, useState } from 'react'

interface TasaBCV {
  tasa: number | null
  fecha: string | null
  loading: boolean
}

// Singleton en memoria — todos los MenuItemCard comparten la misma tasa sin refetch
let cached: { tasa: number | null; fecha: string | null } | null = null

export function useTasaBCV(): TasaBCV {
  const [state, setState] = useState<TasaBCV>({
    tasa: cached?.tasa ?? null,
    fecha: cached?.fecha ?? null,
    loading: cached === null,
  })

  useEffect(() => {
    if (cached !== null) return

    fetch('/api/tasa-bcv')
      .then((r) => r.json())
      .then((data) => {
        cached = { tasa: data.tasa, fecha: data.fecha }
        setState({ tasa: data.tasa, fecha: data.fecha, loading: false })
      })
      .catch(() => {
        cached = { tasa: null, fecha: null }
        setState({ tasa: null, fecha: null, loading: false })
      })
  }, [])

  return state
}
