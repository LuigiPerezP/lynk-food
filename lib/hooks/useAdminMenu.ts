'use client'

import { useState } from 'react'
import {
  collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { MenuItem } from '../types'

export function useAdminMenu(restauranteId: string) {
  const [saving, setSaving] = useState(false)

  async function addItem(item: Omit<MenuItem, 'id'>) {
    setSaving(true)
    try {
      const ref = collection(db, 'restaurante', restauranteId, 'menu')
      await addDoc(ref, { ...item, creadoEn: serverTimestamp() })
    } finally {
      setSaving(false)
    }
  }

  async function updateItem(id: string, updates: Partial<Omit<MenuItem, 'id'>>) {
    setSaving(true)
    try {
      const ref = doc(db, 'restaurante', restauranteId, 'menu', id)
      await updateDoc(ref, { ...updates, actualizadoEn: serverTimestamp() })
    } finally {
      setSaving(false)
    }
  }

  async function toggleDisponible(id: string, disponible: boolean) {
    const ref = doc(db, 'restaurante', restauranteId, 'menu', id)
    await updateDoc(ref, { disponible, actualizadoEn: serverTimestamp() })
  }

  async function deleteItem(id: string) {
    const ref = doc(db, 'restaurante', restauranteId, 'menu', id)
    await deleteDoc(ref)
  }

  return { addItem, updateItem, toggleDisponible, deleteItem, saving }
}
