'use client'

import { useState } from 'react'
import { supabase } from '../supabase'
import type { MenuItem } from '../types'

export function useAdminMenu(restauranteId: string) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function addItem(item: Omit<MenuItem, 'id'>) {
    setSaving(true)
    setSaveError(null)
    try {
      const { error } = await supabase.from('menu_items').insert({
        restaurante_id: restauranteId,
        nombre: item.nombre,
        descripcion: item.descripcion,
        precio: item.precio,
        categoria: item.categoria,
        disponible: item.disponible,
        emoji: item.emoji,
      })
      if (error) throw error
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setSaveError(`Error al guardar: ${msg}`)
      throw err
    } finally {
      setSaving(false)
    }
  }

  async function updateItem(id: string, updates: Partial<Omit<MenuItem, 'id'>>) {
    setSaving(true)
    setSaveError(null)
    try {
      const { error } = await supabase.from('menu_items').update(updates).eq('id', id)
      if (error) throw error
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setSaveError(`Error al actualizar: ${msg}`)
      throw err
    } finally {
      setSaving(false)
    }
  }

  async function toggleDisponible(id: string, disponible: boolean) {
    await supabase.from('menu_items').update({ disponible }).eq('id', id)
  }

  async function deleteItem(id: string) {
    await supabase.from('menu_items').delete().eq('id', id)
  }

  return { addItem, updateItem, toggleDisponible, deleteItem, saving, saveError }
}
