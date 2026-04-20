'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import EmojiPicker from './EmojiPicker'
import type { CategoriaItem } from '@/lib/hooks/useCategorias'
import type { MenuItem } from '@/lib/types'

interface MenuItemFormProps {
  initial?: Partial<MenuItem>
  onSave: (data: Omit<MenuItem, 'id'>) => Promise<void>
  onCancel: () => void
  saving: boolean
  secciones: CategoriaItem[]
  getSubcats: (id: string) => CategoriaItem[]
}

const EMPTY: Omit<MenuItem, 'id'> = {
  nombre: '', descripcion: '', precio: 0,
  categoriaId: '', disponible: true, emoji: '🍽️',
}

export default function MenuItemForm({ initial, onSave, onCancel, saving, secciones, getSubcats }: MenuItemFormProps) {
  const [form, setForm] = useState<Omit<MenuItem, 'id'>>({ ...EMPTY, ...initial })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Find which section owns the current categoriaId
  const currentSection = secciones.find(s =>
    s.id === form.categoriaId || getSubcats(s.id).some(sub => sub.id === form.categoriaId)
  )
  const [selectedSeccion, setSelectedSeccion] = useState<string>(currentSection?.id ?? secciones[0]?.id ?? '')

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  // Auto-set categoriaId when secciones load and categoriaId is still empty
  useEffect(() => {
    if (form.categoriaId) return
    const firstSeccion = secciones[0]
    if (!firstSeccion) return
    const subcats = getSubcats(firstSeccion.id)
    const defaultId = subcats[0]?.id ?? firstSeccion.id
    setForm((f) => ({ ...f, categoriaId: defaultId }))
    setSelectedSeccion(firstSeccion.id)
  }, [secciones]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSeccionChange(seccionId: string) {
    setSelectedSeccion(seccionId)
    const subcats = getSubcats(seccionId)
    set('categoriaId', subcats[0]?.id ?? seccionId)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    const path = `menu/${Date.now()}.jpg`
    const { error } = await supabase.storage.from('menu-images').upload(path, file, { upsert: true, contentType: 'image/jpeg' })
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
    if (!form.nombre.trim() || form.precio <= 0 || !form.categoriaId) return
    await onSave(form)
  }

  const field = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400'
  const subcats = getSubcats(selectedSeccion)
  const seccionActual = secciones.find(s => s.id === selectedSeccion)

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex gap-3">
        <div className="w-20">
          <label className="text-xs text-gray-500 font-medium">Emoji</label>
          <EmojiPicker value={form.emoji} onChange={(e) => set('emoji', e)} />
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

      {uploadError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          Error al subir: {uploadError}
        </div>
      )}

      {/* Imagen */}
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
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors">
              {uploading ? 'Subiendo…' : form.imagen ? 'Cambiar imagen' : 'Subir imagen'}
            </button>
            <p className="text-xs text-gray-400">Solo formato JPG</p>
            {form.imagen && (
              <button type="button" onClick={() => set('imagen', undefined)}
                className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700 transition-colors">
                Quitar imagen
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/jpg" className="hidden" onChange={handleImageUpload} />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500 font-medium">Precio ($) *</label>
          <input type="number" min="0" step="0.5"
            value={form.precio === 0 ? '' : form.precio}
            onChange={(e) => set('precio', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className={`${field} placeholder-gray-300`} required />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 font-medium">Sección</label>
          <select value={selectedSeccion} onChange={(e) => handleSeccionChange(e.target.value)} className={field}>
            {secciones.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre.charAt(0).toUpperCase() + s.nombre.slice(1)}</option>
            ))}
          </select>
        </div>
        {subcats.length > 0 && (
          <div className="flex-1">
            <label className="text-xs text-gray-500 font-medium">Subcategoría</label>
            <select value={form.categoriaId} onChange={(e) => set('categoriaId', e.target.value)} className={field}>
              {subcats.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.nombre.charAt(0).toUpperCase() + sub.nombre.slice(1)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {subcats.length === 0 && seccionActual && (
        <p className="text-xs text-gray-400">
          Este plato irá directo a la sección <strong>{seccionActual.nombre}</strong>
        </p>
      )}

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
