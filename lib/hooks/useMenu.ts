'use client'

import { useCallback, useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import type { MenuItem } from '../types'

export function useMenu(restauranteId: string, soloDisponibles = true) {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenu = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const ref = collection(db, 'restaurante', restauranteId, 'menu')
      const q = soloDisponibles
        ? query(ref, where('disponible', '==', true))
        : query(ref)
      const snapshot = await getDocs(q)
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as MenuItem[]
      setMenu(items)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(`No se pudo cargar el menú: ${msg}`)
      console.error('[useMenu] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [restauranteId, soloDisponibles])

  useEffect(() => {
    fetchMenu()
  }, [fetchMenu])

  return { menu, loading, error, retry: fetchMenu }
}
