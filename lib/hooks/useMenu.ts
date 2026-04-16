'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import type { MenuItem } from '../types'

const MAX_RETRIES = 5
const RETRY_BASE_MS = 2000

export function useMenu(restauranteId: string, soloDisponibles = true) {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const retry = useCallback(() => {
    setError(null)
    setLoading(true)
    setRetryCount((n) => n + 1)
  }, [])

  useEffect(() => {
    const ref = collection(db, 'restaurante', restauranteId, 'menu')
    const q = soloDisponibles
      ? query(ref, where('disponible', '==', true))
      : query(ref)

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (retryTimer.current) clearTimeout(retryTimer.current)
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as MenuItem[]
        setMenu(items)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setLoading(false)
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_BASE_MS * Math.pow(2, retryCount)
          setError(`Sin conexión. Reintentando en ${Math.round(delay / 1000)}s…`)
          retryTimer.current = setTimeout(() => setRetryCount((n) => n + 1), delay)
        } else {
          setError('No se pudo conectar con el servidor. Verifica tu conexión.')
        }
      }
    )

    return () => {
      unsubscribe()
      if (retryTimer.current) clearTimeout(retryTimer.current)
    }
  }, [restauranteId, soloDisponibles, retryCount])

  return { menu, loading, error, retry }
}
