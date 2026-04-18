'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useMenu } from '@/lib/hooks/useMenu'
import { useAdminMenu } from '@/lib/hooks/useAdminMenu'
import { useCategorias } from '@/lib/hooks/useCategorias'
import { useTasaBCV } from '@/lib/hooks/useTasaBCV'
import MenuItemForm from './MenuItemForm'
import type { MenuItem } from '@/lib/types'

function formatBs(usd: number, tasa: number): string {
  return `Bs. ${(usd * tasa).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}


interface MenuManagerProps {
  restauranteId: string
}

export default function MenuManager({ restauranteId }: MenuManagerProps) {
  const { menu, retry: reloadMenu } = useMenu(restauranteId, false)
  const { addItem, updateItem, toggleDisponible, deleteItem, saving, saveError } = useAdminMenu(restauranteId)
  const { categorias } = useCategorias(restauranteId)
  const { tasa } = useTasaBCV()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [editingPrice, setEditingPrice] = useState<{ id: string; value: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const catNames = categorias.map((c) => c.nombre)
  const byCategory = catNames.reduce<Record<string, MenuItem[]>>(
    (acc, cat) => ({ ...acc, [cat]: menu.filter((i) => i.categoria === cat) }),
    {}
  )

  async function handleAdd(data: Omit<MenuItem, 'id'>) {
    await addItem(data)
    setShowForm(false)
    reloadMenu()
  }

  async function handleEdit(data: Omit<MenuItem, 'id'>) {
    if (!editing) return
    await updateItem(editing.id, data)
    setEditing(null)
    reloadMenu()
  }

  async function handlePriceSave(id: string) {
    if (!editingPrice) return
    const precio = parseFloat(editingPrice.value)
    if (!isNaN(precio) && precio > 0) await updateItem(id, { precio })
    setEditingPrice(null)
  }

  return (
    <div className="space-y-6">
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {saveError}
        </div>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Menú del restaurante</h2>
        <button onClick={() => { setShowForm(true); setEditing(null) }}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg"
          style={{ backgroundColor: '#1A6BFF' }}>
          + Agregar plato
        </button>
      </div>

      {(showForm && !editing) && (
        <MenuItemForm onSave={handleAdd} onCancel={() => setShowForm(false)} saving={saving} categorias={catNames} />
      )}

      {Object.entries(byCategory).map(([cat, items]) => (
        <div key={cat}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {cat.charAt(0).toUpperCase() + cat.slice(1)} ({items.length})
          </h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id}>
                {editing?.id === item.id ? (
                  <MenuItemForm initial={editing} onSave={handleEdit}
                    onCancel={() => setEditing(null)} saving={saving} categorias={catNames} />
                ) : (
                  <div className={`flex items-center gap-3 p-3 bg-white rounded-xl border transition-opacity ${
                    !item.disponible ? 'opacity-50' : ''
                  }`}>
                    {item.imagen ? (
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                        <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />
                      </div>
                    ) : (
                      <span className="text-2xl">{item.emoji}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{item.nombre}</p>
                      <p className="text-xs text-gray-400 truncate">{item.descripcion}</p>
                    </div>

                    {/* Precio editable inline */}
                    {editingPrice?.id === item.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">$</span>
                        <input
                          autoFocus
                          type="number" min="0" step="0.5"
                          value={editingPrice.value}
                          onChange={(e) => setEditingPrice({ id: item.id, value: e.target.value })}
                          onBlur={() => handlePriceSave(item.id)}
                          onKeyDown={(e) => e.key === 'Enter' && handlePriceSave(item.id)}
                          className="w-16 border border-blue-400 rounded px-1 py-0.5 text-sm text-center focus:outline-none"
                        />
                      </div>
                    ) : (
                      <button onClick={() => setEditingPrice({ id: item.id, value: String(item.precio) })}
                        className="text-right hover:text-blue-600 transition-colors"
                        title="Click para editar precio">
                        <p className="text-sm font-bold text-gray-700">${item.precio.toFixed(2)}</p>
                        {tasa && (
                          <p className="text-xs text-gray-400">{formatBs(item.precio, tasa)}</p>
                        )}
                      </button>
                    )}

                    {/* Toggle disponible */}
                    <button onClick={() => toggleDisponible(item.id, !item.disponible)}
                      className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                        item.disponible
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}>
                      {item.disponible ? 'Activo' : 'Oculto'}
                    </button>

                    <button onClick={() => setEditing(item)}
                      className="text-gray-400 hover:text-gray-700 text-sm transition-colors" title="Editar">
                      ✏️
                    </button>

                    {confirmDelete === item.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => { deleteItem(item.id); setConfirmDelete(null) }}
                          className="text-xs text-red-600 font-semibold hover:underline">Sí</button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="text-xs text-gray-500 hover:underline">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(item.id)}
                        className="text-gray-300 hover:text-red-400 text-sm transition-colors" title="Eliminar">
                        🗑️
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-gray-400 py-2 pl-1">Sin platos en esta categoría</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
