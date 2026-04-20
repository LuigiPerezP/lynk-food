'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'

export interface CategoriaItem {
  id: string
  nombre: string
  orden: number
  parent_id: string | null
}

export function useCategorias(restauranteId: string) {
  const [categorias, setCategorias] = useState<CategoriaItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategorias = useCallback(async () => {
    const { data } = await supabase
      .from('categorias')
      .select('id, nombre, orden, parent_id')
      .eq('restaurante_id', restauranteId)
      .order('orden', { ascending: true })
    setCategorias(data ?? [])
    setLoading(false)
  }, [restauranteId])

  useEffect(() => { fetchCategorias() }, [fetchCategorias])

  const secciones = categorias.filter(c => !c.parent_id)

  function getSubcats(seccionId: string): CategoriaItem[] {
    return categorias.filter(c => c.parent_id === seccionId)
  }

  // Leaf categories: subcats, or sections with no subcats (for item assignment)
  const leafCats = categorias.filter(c =>
    c.parent_id !== null || !categorias.some(s => s.parent_id === c.id)
  )

  async function addCategoria(nombre: string, parentId?: string | null) {
    const siblings = categorias.filter(c => c.parent_id === (parentId ?? null))
    const orden = siblings.length + 1
    const { error } = await supabase.from('categorias').insert({
      restaurante_id: restauranteId,
      nombre: nombre.trim().toLowerCase(),
      orden,
      parent_id: parentId ?? null,
    })
    if (!error) fetchCategorias()
  }

  async function deleteCategoria(id: string) {
    await supabase.from('categorias').delete().eq('parent_id', id)
    await supabase.from('categorias').delete().eq('id', id)
    fetchCategorias()
  }

  async function renameCategoria(id: string, nombre: string): Promise<string | null> {
    const trimmed = nombre.trim().toLowerCase()
    const prev = categorias.find(c => c.id === id)?.nombre ?? ''
    // Optimistic update
    setCategorias(cs => cs.map(c => c.id === id ? { ...c, nombre: trimmed } : c))
    const { error } = await supabase.from('categorias').update({ nombre: trimmed }).eq('id', id)
    if (error) {
      setCategorias(cs => cs.map(c => c.id === id ? { ...c, nombre: prev } : c))
      return error.message
    }
    return null
  }

  return { categorias, secciones, leafCats, getSubcats, loading, addCategoria, deleteCategoria, renameCategoria, refetch: fetchCategorias }
}
