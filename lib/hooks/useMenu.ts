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

      // Client view: show visible items (including agotados for display)
      // Admin view: show all items
      if (soloDisponibles) query = query.eq('visible', true)

      const { data, error: err } = await query
      if (err) throw err

      setMenu((data ?? []).map((row) => ({
        id: row.id,
        nombre: row.nombre,
        descripcion: row.descripcion ?? '',
        precio: Number(row.precio),
        categoriaId: row.categoria_id as string,
        disponible: row.disponible as boolean,
        visible: row.visible !== false,
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

  // Realtime: reflect disponible/visible changes instantly
  useEffect(() => {
    const channel = supabase
      .channel(`menu_items:${restauranteId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'menu_items',
        filter: `restaurante_id=eq.${restauranteId}`,
      }, (payload) => {
        const row = payload.new as Record<string, unknown>
        setMenu((prev) => prev.map((item) =>
          item.id === row.id
            ? { ...item, disponible: row.disponible as boolean, visible: row.visible !== false }
            : item
        ).filter((item) => !soloDisponibles || item.visible))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [restauranteId, soloDisponibles])

  return { menu, loading, error, retry: fetchMenu }
}
