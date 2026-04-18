'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { MenuItem } from '@/lib/types'

interface MenuItemFormProps {
  initial?: Partial<MenuItem>
  onSave: (data: Omit<MenuItem, 'id'>) => Promise<void>
  onCancel: () => void
  saving: boolean
  categorias: string[]
}

const EMPTY: Omit<MenuItem, 'id'> = {
  nombre: '', descripcion: '', precio: 0,
  categoria: 'platos', disponible: true, emoji: '🍽️',
}

export default function MenuItemForm({ initial, onSave, onCancel, saving, categorias }: MenuItemFormProps) {
  const [form, setForm] = useState<Omit<MenuItem, 'id'>>({ ...EMPTY, ...initial })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    const ext = file.name.split('.').pop()
    const path = `menu/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('menu-images').upload(path, file, { upsert: true })
    if (error) {
      setUploadError(error.message)
    } else {
      const { data } = supabase.storage.from('menu-images').getPublicUrl(path)
      set('imagen', data.publicUrl)
    }
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || form.precio <= 0) return
    await onSave(form)
  }

  const field = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400'

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex gap-3">
        <div className="w-20">
          <label className="text-xs text-gray-500 font-medium">Emoji</label>
          <input value={form.emoji} onChange={(e) => set('emoji', e.target.value)}
            className={field} maxLength={4} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 font-medium">Nombre *</label>
          <input value={form.nombre} onChange={(e) => set('nombre', e.target.value)}
            className={field} placeholder="Ej: Pabellón criollo" required />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 font-medium">Descripción</label>
        <textarea value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)}
          className={`${field} resize-none`} rows={2} placeholder="Describe el plato…" />
      </div>

      {/* Imagen */}
      {uploadError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          Error al subir: {uploadError}
        </div>
      )}

      <div>
        <label className="text-xs text-gray-500 font-medium">Imagen del plato</label>
        <div className="mt-1 flex items-center gap-3">
          {form.imagen ? (
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0">
              <Image src={form.imagen} alt="preview" fill className="object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-2xl shrink-0">
              🖼️
            </div>
          )}
          <div className="flex flex-col gap-1">
            <button type="button" onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors">
              {uploading ? 'Subiendo…' : form.imagen ? 'Cambiar imagen' : 'Subir imagen'}
            </button>
            {form.imagen && (
              <button type="button" onClick={() => set('imagen', undefined)}
                className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700 transition-colors">
                Quitar imagen
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500 font-medium">Precio ($) *</label>
          <input type="number" min="0" step="0.5" value={form.precio}
            onChange={(e) => set('precio', parseFloat(e.target.value) || 0)}
            className={field} required />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 font-medium">Categoría</label>
          <select value={form.categoria} onChange={(e) => set('categoria', e.target.value)}
            className={field}>
            {categorias.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={saving || uploading}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-colors"
          style={{ backgroundColor: '#1A6BFF' }}>
          {saving ? 'Guardando…' : initial?.nombre ? 'Guardar cambios' : 'Agregar plato'}
        </button>
      </div>
    </form>
  )
}
