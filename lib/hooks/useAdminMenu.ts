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
        categoria_id: item.categoriaId,
        disponible: item.disponible,
        visible: item.visible ?? true,
        emoji: item.emoji,
        imagen: item.imagen ?? null,
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
      const payload: Record<string, unknown> = {}
      if (updates.nombre !== undefined)      payload.nombre       = updates.nombre
      if (updates.descripcion !== undefined) payload.descripcion  = updates.descripcion
      if (updates.precio !== undefined)      payload.precio       = updates.precio
      if (updates.categoriaId !== undefined) payload.categoria_id = updates.categoriaId
      if (updates.disponible !== undefined)  payload.disponible   = updates.disponible
      if (updates.visible !== undefined)    payload.visible      = updates.visible
      if (updates.emoji !== undefined)       payload.emoji        = updates.emoji
      if ('imagen' in updates)               payload.imagen       = updates.imagen ?? null

      const { error } = await supabase.from('menu_items').update(payload).eq('id', id)
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

  async function toggleVisible(id: string, visible: boolean) {
    await supabase.from('menu_items').update({ visible }).eq('id', id)
  }

  async function deleteItem(id: string) {
    await supabase.from('menu_items').delete().eq('id', id)
  }

  return { addItem, updateItem, toggleDisponible, toggleVisible, deleteItem, saving, saveError }
}
