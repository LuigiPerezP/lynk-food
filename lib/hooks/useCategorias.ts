'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'

export interface CategoriaItem {
  id: string
  nombre: string
  orden: number
}

export function useCategorias(restauranteId: string) {
  const [categorias, setCategorias] = useState<CategoriaItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategorias = useCallback(async () => {
    const { data } = await supabase
      .from('categorias')
      .select('id, nombre, orden')
      .eq('restaurante_id', restauranteId)
      .order('orden', { ascending: true })
    setCategorias(data ?? [])
    setLoading(false)
  }, [restauranteId])

  useEffect(() => { fetchCategorias() }, [fetchCategorias])

  async function addCategoria(nombre: string) {
    const orden = categorias.length + 1
    const { error } = await supabase.from('categorias').insert({
      restaurante_id: restauranteId,
      nombre: nombre.trim().toLowerCase(),
      orden,
    })
    if (!error) fetchCategorias()
  }

  async function deleteCategoria(id: string) {
    await supabase.from('categorias').delete().eq('id', id)
    fetchCategorias()
  }

  return { categorias, loading, addCategoria, deleteCategoria, refetch: fetchCategorias }
}
