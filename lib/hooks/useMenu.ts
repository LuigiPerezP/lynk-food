'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { MenuItem } from '../types'

export function useMenu(restauranteId: string, soloDisponibles = true) {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenu = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('menu_items')
        .select('*')
        .eq('restaurante_id', restauranteId)

      if (soloDisponibles) query = query.eq('disponible', true)

      const { data, error: err } = await query
      if (err) throw err

      setMenu((data ?? []).map((row) => ({
        id: row.id,
        nombre: row.nombre,
        descripcion: row.descripcion ?? '',
        precio: Number(row.precio),
        categoriaId: row.categoria_id as string,
        disponible: row.disponible,
        emoji: row.emoji ?? '🍽️',
        imagen: row.imagen ?? undefined,
      })))
    } catch (err) {
      setError(`No se pudo cargar el menú: ${err instanceof Error ? err.message : err}`)
    } finally {
      setLoading(false)
    }
  }, [restauranteId, soloDisponibles])

  useEffect(() => { fetchMenu() }, [fetchMenu])

  return { menu, loading, error, retry: fetchMenu }
}
