'use client'

import { useState } from 'react'
import type { CategoriaItem } from '@/lib/hooks/useCategorias'

interface CategoryManagerProps {
  categorias: CategoriaItem[]
  onAdd: (nombre: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function CategoryManager({ categorias, onAdd, onDelete }: CategoryManagerProps) {
  const [nueva, setNueva] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!nueva.trim()) return
    setSaving(true)
    await onAdd(nueva)
    setNueva('')
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Categorías del menú</h2>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          placeholder="Nueva categoría (ej: combos)"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={saving || !nueva.trim()}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
          style={{ backgroundColor: '#1A6BFF' }}
        >
          {saving ? '…' : '+ Agregar'}
        </button>
      </form>

      <div className="space-y-2">
        {categorias.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100">
            <span className="text-sm font-medium text-gray-800 capitalize">{cat.nombre}</span>
            {confirmDelete === cat.id ? (
              <div className="flex gap-2">
                <button onClick={() => { onDelete(cat.id); setConfirmDelete(null) }}
                  className="text-xs text-red-600 font-semibold hover:underline">Eliminar</button>
                <button onClick={() => setConfirmDelete(null)}
                  className="text-xs text-gray-500 hover:underline">Cancelar</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(cat.id)}
                className="text-gray-300 hover:text-red-400 transition-colors">🗑️</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
