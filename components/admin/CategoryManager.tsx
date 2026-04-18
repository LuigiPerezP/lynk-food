'use client'

import { useState } from 'react'
import type { CategoriaItem } from '@/lib/hooks/useCategorias'

interface CategoryManagerProps {
  secciones: CategoriaItem[]
  getSubcats: (id: string) => CategoriaItem[]
  onAdd: (nombre: string, parentId?: string | null) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function CategoryManager({ secciones, getSubcats, onAdd, onDelete }: CategoryManagerProps) {
  const [newSeccion, setNewSeccion] = useState('')
  const [newSubcat, setNewSubcat] = useState<{ parentId: string; value: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  async function handleAddSeccion(e: React.FormEvent) {
    e.preventDefault()
    if (!newSeccion.trim()) return
    setSaving(true)
    await onAdd(newSeccion, null)
    setNewSeccion('')
    setSaving(false)
  }

  async function handleAddSubcat(parentId: string) {
    if (!newSubcat?.value.trim()) return
    setSaving(true)
    await onAdd(newSubcat.value, parentId)
    setNewSubcat(null)
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Categorías del menú</h2>
      </div>

      {/* Add section */}
      <form onSubmit={handleAddSeccion} className="flex gap-2">
        <input
          value={newSeccion}
          onChange={(e) => setNewSeccion(e.target.value)}
          placeholder="Nueva sección (ej: platos, bebidas)"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button type="submit" disabled={saving || !newSeccion.trim()}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
          style={{ backgroundColor: '#1A6BFF' }}>
          {saving ? '…' : '+ Sección'}
        </button>
      </form>

      {/* Sections list */}
      <div className="space-y-3">
        {secciones.length === 0 && (
          <p className="text-sm text-gray-400 py-2">Sin secciones todavía</p>
        )}
        {secciones.map((seccion) => {
          const subcats = getSubcats(seccion.id)
          return (
            <div key={seccion.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Section header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-800 capitalize">{seccion.nombre}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNewSubcat(newSubcat?.parentId === seccion.id ? null : { parentId: seccion.id, value: '' })}
                    className="text-xs px-2 py-1 rounded-lg text-blue-600 hover:bg-blue-50 font-medium transition-colors">
                    + Subcategoría
                  </button>
                  {confirmDelete === seccion.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => { onDelete(seccion.id); setConfirmDelete(null) }}
                        className="text-xs text-red-600 font-semibold hover:underline">Eliminar</button>
                      <button onClick={() => setConfirmDelete(null)}
                        className="text-xs text-gray-500 hover:underline">Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(seccion.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors text-sm">🗑️</button>
                  )}
                </div>
              </div>

              {/* Add subcat input */}
              {newSubcat?.parentId === seccion.id && (
                <div className="px-4 py-2 border-b border-gray-100 flex gap-2">
                  <input
                    autoFocus
                    value={newSubcat.value}
                    onChange={(e) => setNewSubcat({ ...newSubcat, value: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubcat(seccion.id)}
                    placeholder="Nombre de subcategoría (ej: pastas)"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button onClick={() => handleAddSubcat(seccion.id)} disabled={saving || !newSubcat.value.trim()}
                    className="px-3 py-1.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: '#1A6BFF' }}>
                    Agregar
                  </button>
                  <button onClick={() => setNewSubcat(null)}
                    className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">
                    ✕
                  </button>
                </div>
              )}

              {/* Subcats */}
              {subcats.length === 0 && !newSubcat && (
                <p className="text-xs text-gray-400 px-4 py-2">Sin subcategorías — los platos van directo a esta sección</p>
              )}
              {subcats.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between px-6 py-2.5 border-b last:border-0 border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 text-xs">└</span>
                    <span className="text-sm text-gray-700 capitalize">{sub.nombre}</span>
                  </div>
                  {confirmDelete === sub.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => { onDelete(sub.id); setConfirmDelete(null) }}
                        className="text-xs text-red-600 font-semibold hover:underline">Eliminar</button>
                      <button onClick={() => setConfirmDelete(null)}
                        className="text-xs text-gray-500 hover:underline">Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(sub.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors text-sm">🗑️</button>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
