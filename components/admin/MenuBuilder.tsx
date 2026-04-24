'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '@/lib/supabase'
import { useCategorias, type CategoriaItem } from '@/lib/hooks/useCategorias'
import { useMenu } from '@/lib/hooks/useMenu'
import { useAdminMenu } from '@/lib/hooks/useAdminMenu'
import MenuItemForm from './MenuItemForm'
import type { MenuItem } from '@/lib/types'

// ── Types ──────────────────────────────────────────────────────────────────
interface ItemNode extends MenuItem { orden: number }
interface SubcatNode extends CategoriaItem { items: ItemNode[] }
interface SectionNode extends CategoriaItem { subcats: SubcatNode[]; directItems: ItemNode[] }
type DragListeners = ReturnType<typeof useSortable>['listeners']
type DragAttributes = ReturnType<typeof useSortable>['attributes']

// ── Sortable wrapper (render prop for drag handle) ─────────────────────────
function Sortable({ id, children }: {
  id: string
  children: (h: { listeners: DragListeners; attributes: DragAttributes }) => React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.25 : 1 }}
    >
      {children({ listeners, attributes })}
    </div>
  )
}

function DragHandle({ listeners, attributes }: { listeners: DragListeners; attributes: DragAttributes }) {
  return (
    <span
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing select-none touch-none text-gray-300 hover:text-gray-400 px-0.5 text-base leading-none"
      title="Arrastrar para reordenar"
    >
      ⠿
    </span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function MenuBuilder({ restauranteId }: { restauranteId: string }) {
  const { categorias, secciones, getSubcats, addCategoria, deleteCategoria, renameCategoria, refetch: refetchCats } = useCategorias(restauranteId)
  const { menu, retry: reloadMenu } = useMenu(restauranteId, false)
  const { addItem, updateItem, toggleDisponible, deleteItem, saving, saveError } = useAdminMenu(restauranteId)

  const [sections, setSections] = useState<SectionNode[]>([])
  const [editingCat, setEditingCat] = useState<{ id: string; value: string } | null>(null)
  const [editingPrice, setEditingPrice] = useState<{ id: string; value: string } | null>(null)
  const [newSeccionInput, setNewSeccionInput] = useState(false)
  const [newSeccionValue, setNewSeccionValue] = useState('')
  const [newSubcatFor, setNewSubcatFor] = useState<{ seccionId: string; value: string } | null>(null)
  const [addItemFor, setAddItemFor] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null)
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<string | null>(null)
  const [deletedItemIds, setDeletedItemIds] = useState<Set<string>>(new Set())
  const [orderError, setOrderError] = useState<string | null>(null)

  // Build tree from hook data
  useEffect(() => {
    const tree: SectionNode[] = [...secciones]
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map(sec => ({
        ...sec,
        subcats: categorias
          .filter(c => c.parent_id === sec.id)
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
          .map(sub => ({
            ...sub,
            items: menu
              .filter(i => i.categoriaId === sub.id && !deletedItemIds.has(i.id))
              .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
              .map(i => ({ ...i, orden: i.orden ?? 0 })),
          })),
        directItems: menu
          .filter(i => i.categoriaId === sec.id && !deletedItemIds.has(i.id))
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
          .map(i => ({ ...i, orden: i.orden ?? 0 })),
      }))
    setSections(tree)
  }, [secciones, categorias, menu, deletedItemIds])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // ── Order persistence ──────────────────────────────────────────────────
  async function saveCatOrder(updates: { id: string; orden: number }[]) {
    const results = await Promise.allSettled(
      updates.map(({ id, orden }) => supabase.from('categorias').update({ orden }).eq('id', id))
    )
    if (results.some(r => r.status === 'rejected')) {
      setOrderError('Error al guardar orden — recargando')
      refetchCats()
    }
  }

  async function saveItemOrder(updates: { id: string; orden: number }[]) {
    const results = await Promise.allSettled(
      updates.map(({ id, orden }) => supabase.from('menu_items').update({ orden }).eq('id', id))
    )
    if (results.some(r => r.status === 'rejected')) {
      setOrderError('Error al guardar orden — recargando')
      reloadMenu()
    }
  }

  // ── DnD handlers ───────────────────────────────────────────────────────
  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSections(prev => {
      const oi = prev.findIndex(s => s.id === active.id)
      const ni = prev.findIndex(s => s.id === over.id)
      const reordered = arrayMove(prev, oi, ni)
      saveCatOrder(reordered.map((s, i) => ({ id: s.id, orden: i + 1 })))
      return reordered
    })
  }

  function handleSubcatDragEnd(seccionId: string, event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSections(prev => prev.map(sec => {
      if (sec.id !== seccionId) return sec
      const oi = sec.subcats.findIndex(s => s.id === active.id)
      const ni = sec.subcats.findIndex(s => s.id === over.id)
      const reordered = arrayMove(sec.subcats, oi, ni)
      saveCatOrder(reordered.map((s, i) => ({ id: s.id, orden: i + 1 })))
      return { ...sec, subcats: reordered }
    }))
  }

  function handleDirectItemDragEnd(seccionId: string, event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSections(prev => prev.map(sec => {
      if (sec.id !== seccionId) return sec
      const oi = sec.directItems.findIndex(i => i.id === active.id)
      const ni = sec.directItems.findIndex(i => i.id === over.id)
      const reordered = arrayMove(sec.directItems, oi, ni)
      saveItemOrder(reordered.map((item, i) => ({ id: item.id, orden: i + 1 })))
      return { ...sec, directItems: reordered }
    }))
  }

  function handleSubItemDragEnd(subcatId: string, event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSections(prev => prev.map(sec => ({
      ...sec,
      subcats: sec.subcats.map(sub => {
        if (sub.id !== subcatId) return sub
        const oi = sub.items.findIndex(i => i.id === active.id)
        const ni = sub.items.findIndex(i => i.id === over.id)
        const reordered = arrayMove(sub.items, oi, ni)
        saveItemOrder(reordered.map((item, i) => ({ id: item.id, orden: i + 1 })))
        return { ...sub, items: reordered }
      }),
    })))
  }

  // ── CRUD actions ───────────────────────────────────────────────────────
  async function handleCatRename() {
    if (!editingCat?.value.trim()) return
    await renameCategoria(editingCat.id, editingCat.value)
    setEditingCat(null)
  }

  async function handlePriceSave(itemId: string) {
    if (!editingPrice) return
    const precio = parseFloat(editingPrice.value)
    if (!isNaN(precio) && precio > 0) {
      await updateItem(itemId, { precio })
      reloadMenu()
    }
    setEditingPrice(null)
  }

  async function handleAddSection() {
    if (!newSeccionValue.trim()) return
    await addCategoria(newSeccionValue.trim(), null)
    setNewSeccionValue('')
    setNewSeccionInput(false)
  }

  async function handleAddSubcat(seccionId: string) {
    if (!newSubcatFor?.value.trim()) return
    await addCategoria(newSubcatFor.value.trim(), seccionId)
    setNewSubcatFor(null)
  }

  async function handleAddItemSave(data: Omit<MenuItem, 'id'>) {
    if (!addItemFor) return
    const maxOrden = menu
      .filter(i => i.categoriaId === addItemFor)
      .reduce((m, i) => Math.max(m, i.orden ?? 0), 0)
    await supabase.from('menu_items').insert({
      restaurante_id: restauranteId,
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: data.precio,
      categoria_id: data.categoriaId,
      disponible: data.disponible,
      visible: data.visible ?? true,
      emoji: data.emoji,
      imagen: data.imagen ?? null,
      orden: maxOrden + 1,
    })
    setAddItemFor(null)
    reloadMenu()
  }

  async function handleEditItemSave(data: Omit<MenuItem, 'id'>) {
    if (!editingItem) return
    await updateItem(editingItem.id, data)
    setEditingItem(null)
    reloadMenu()
  }

  async function handleDeleteItem(id: string) {
    setDeletedItemIds(prev => new Set(prev).add(id))
    setConfirmDeleteItem(null)
    await deleteItem(id)
  }

  async function handleDeleteCat(id: string) {
    setConfirmDeleteCat(null)
    await deleteCategoria(id)
  }

  function optimisticToggle(itemId: string, current: boolean) {
    toggleDisponible(itemId, !current)
    setSections(prev => prev.map(sec => ({
      ...sec,
      directItems: sec.directItems.map(i => i.id === itemId ? { ...i, disponible: !current } : i),
      subcats: sec.subcats.map(sub => ({
        ...sub,
        items: sub.items.map(i => i.id === itemId ? { ...i, disponible: !current } : i),
      })),
    })))
  }

  // ── Inline render helpers (not components — no hooks) ──────────────────
  function renderCatName(cat: CategoriaItem, bold?: boolean) {
    if (editingCat?.id === cat.id) {
      return (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={editingCat.value}
            onChange={e => setEditingCat({ id: cat.id, value: e.target.value })}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCatRename()
              if (e.key === 'Escape') setEditingCat(null)
            }}
            onBlur={handleCatRename}
            className="border border-blue-400 rounded px-2 py-0.5 text-sm focus:outline-none w-36"
          />
          <button onClick={() => setEditingCat(null)} className="text-gray-400 text-sm">✕</button>
        </div>
      )
    }
    return (
      <button
        onClick={() => setEditingCat({ id: cat.id, value: cat.nombre })}
        title="Click para renombrar"
        className={`text-sm capitalize text-left hover:text-blue-600 transition-colors ${bold ? 'font-bold text-gray-800' : 'text-gray-700'}`}
      >
        {cat.nombre}
      </button>
    )
  }

  function renderItemRow(item: ItemNode, listeners: DragListeners, attributes: DragAttributes, indent: string) {
    const isEditingPrice = editingPrice?.id === item.id
    return (
      <div className={`flex items-center gap-2 py-2 pr-3 border-b border-gray-50 last:border-0 bg-white ${indent}`}>
        <DragHandle listeners={listeners} attributes={attributes} />

        <div className="w-6 h-6 shrink-0 flex items-center justify-center rounded overflow-hidden bg-gray-50">
          {item.imagen
            ? <div className="relative w-6 h-6"><Image src={item.imagen} alt={item.nombre} fill className="object-cover" /></div>
            : <span className="text-xs">{item.emoji}</span>}
        </div>

        <p className="flex-1 text-sm text-gray-700 truncate min-w-0">{item.nombre}</p>

        {isEditingPrice ? (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-gray-400">$</span>
            <input
              autoFocus
              type="number"
              min="0"
              step="0.5"
              value={editingPrice.value}
              onChange={e => setEditingPrice({ id: item.id, value: e.target.value })}
              onBlur={() => handlePriceSave(item.id)}
              onKeyDown={e => {
                if (e.key === 'Enter') handlePriceSave(item.id)
                if (e.key === 'Escape') setEditingPrice(null)
              }}
              className="w-16 border border-blue-400 rounded px-1 py-0.5 text-sm text-center focus:outline-none"
            />
          </div>
        ) : (
          <button
            onClick={() => setEditingPrice({ id: item.id, value: String(item.precio) })}
            title="Click para editar precio"
            className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors shrink-0"
          >
            ${item.precio.toFixed(2)}
          </button>
        )}

        <button
          onClick={() => optimisticToggle(item.id, item.disponible)}
          className={`text-xs px-2 py-0.5 rounded-full font-semibold border transition-colors shrink-0 ${
            item.disponible
              ? 'border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500'
              : 'border-red-400 text-red-500 bg-red-50'
          }`}
        >
          {item.disponible ? 'Ocultar' : 'Mostrar'}
        </button>

        <button onClick={() => setEditingItem(item)} className="text-gray-300 hover:text-gray-600 text-sm shrink-0" title="Editar">✏️</button>

        {confirmDeleteItem === item.id ? (
          <div className="flex gap-1 shrink-0">
            <button onClick={() => handleDeleteItem(item.id)} className="text-xs text-red-600 font-semibold hover:underline">Sí</button>
            <button onClick={() => setConfirmDeleteItem(null)} className="text-xs text-gray-500 hover:underline">No</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDeleteItem(item.id)} className="text-gray-300 hover:text-red-400 text-sm shrink-0">🗑️</button>
        )}
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {(saveError || orderError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          <span>{saveError ?? orderError}</span>
          {orderError && <button onClick={() => setOrderError(null)} className="underline text-xs">OK</button>}
        </div>
      )}

      {/* Section-level DnD */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map(section => (
            <Sortable key={section.id} id={section.id}>
              {({ listeners: secL, attributes: secA }) => (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

                  {/* Section header */}
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-100">
                    <DragHandle listeners={secL} attributes={secA} />
                    <span className="text-gray-400 text-xs shrink-0">📁</span>
                    {renderCatName(section, true)}
                    <div className="ml-auto flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setNewSubcatFor(newSubcatFor?.seccionId === section.id ? null : { seccionId: section.id, value: '' })}
                        className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                      >+ subcat</button>
                      <button
                        onClick={() => setAddItemFor(section.id)}
                        className="text-xs px-2 py-1 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium"
                      >+ plato</button>
                      {confirmDeleteCat === section.id ? (
                        <div className="flex gap-1 ml-1">
                          <button onClick={() => handleDeleteCat(section.id)} className="text-xs text-red-600 font-semibold hover:underline">Eliminar</button>
                          <button onClick={() => setConfirmDeleteCat(null)} className="text-xs text-gray-500 hover:underline">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteCat(section.id)} className="text-gray-300 hover:text-red-400 text-sm">🗑️</button>
                      )}
                    </div>
                  </div>

                  {/* New subcat input */}
                  {newSubcatFor?.seccionId === section.id && (
                    <div className="flex gap-2 px-4 py-2 border-b border-gray-50 bg-blue-50/30">
                      <input
                        autoFocus
                        value={newSubcatFor.value}
                        onChange={e => setNewSubcatFor({ ...newSubcatFor, value: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddSubcat(section.id)
                          if (e.key === 'Escape') setNewSubcatFor(null)
                        }}
                        placeholder="Nombre de subcategoría"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button onClick={() => handleAddSubcat(section.id)} disabled={!newSubcatFor.value.trim()} className="px-3 py-1.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: '#1A6BFF' }}>Agregar</button>
                      <button onClick={() => setNewSubcatFor(null)} className="px-2 text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                  )}

                  {/* Subcat-level DnD */}
                  {section.subcats.length > 0 && (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => handleSubcatDragEnd(section.id, e)}>
                      <SortableContext items={section.subcats.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        {section.subcats.map(sub => (
                          <Sortable key={sub.id} id={sub.id}>
                            {({ listeners: subL, attributes: subA }) => (
                              <div className="border-b border-gray-50">

                                {/* Subcat header */}
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50/50">
                                  <DragHandle listeners={subL} attributes={subA} />
                                  <span className="text-gray-300 text-xs shrink-0">└</span>
                                  {renderCatName(sub)}
                                  <div className="ml-auto flex items-center gap-1 shrink-0">
                                    <button onClick={() => setAddItemFor(sub.id)} className="text-xs px-2 py-0.5 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium">+ plato</button>
                                    {confirmDeleteCat === sub.id ? (
                                      <div className="flex gap-1">
                                        <button onClick={() => handleDeleteCat(sub.id)} className="text-xs text-red-600 font-semibold hover:underline">Eliminar</button>
                                        <button onClick={() => setConfirmDeleteCat(null)} className="text-xs text-gray-500 hover:underline">No</button>
                                      </div>
                                    ) : (
                                      <button onClick={() => setConfirmDeleteCat(sub.id)} className="text-gray-300 hover:text-red-400 text-sm">🗑️</button>
                                    )}
                                  </div>
                                </div>

                                {/* Item-level DnD inside subcat */}
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => handleSubItemDragEnd(sub.id, e)}>
                                  <SortableContext items={sub.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                    {sub.items.map(item => (
                                      <Sortable key={item.id} id={item.id}>
                                        {({ listeners: iL, attributes: iA }) => renderItemRow(item, iL, iA, 'pl-14')}
                                      </Sortable>
                                    ))}
                                  </SortableContext>
                                </DndContext>

                                {sub.items.length === 0 && (
                                  <p className="text-xs text-gray-400 pl-14 py-2">Sin platos</p>
                                )}
                              </div>
                            )}
                          </Sortable>
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}

                  {/* Direct items DnD (section with no subcats, or items assigned directly) */}
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => handleDirectItemDragEnd(section.id, e)}>
                    <SortableContext items={section.directItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                      {section.directItems.map(item => (
                        <Sortable key={item.id} id={item.id}>
                          {({ listeners: iL, attributes: iA }) => renderItemRow(item, iL, iA, 'pl-8')}
                        </Sortable>
                      ))}
                    </SortableContext>
                  </DndContext>

                  {section.subcats.length === 0 && section.directItems.length === 0 && (
                    <p className="text-xs text-gray-400 px-4 py-2.5">Sin platos — usa &quot;+ plato&quot; o &quot;+ subcat&quot;</p>
                  )}
                </div>
              )}
            </Sortable>
          ))}
        </SortableContext>
      </DndContext>

      {/* New section input */}
      {newSeccionInput ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={newSeccionValue}
            onChange={e => setNewSeccionValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddSection()
              if (e.key === 'Escape') { setNewSeccionInput(false); setNewSeccionValue('') }
            }}
            placeholder="Nombre de la sección (ej: platos, bebidas)"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button onClick={handleAddSection} disabled={!newSeccionValue.trim()} className="px-4 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50" style={{ backgroundColor: '#1A6BFF' }}>Crear</button>
          <button onClick={() => { setNewSeccionInput(false); setNewSeccionValue('') }} className="px-3 text-gray-400 hover:text-gray-600">✕</button>
        </div>
      ) : (
        <button
          onClick={() => setNewSeccionInput(true)}
          className="w-full py-2.5 text-sm font-semibold text-gray-500 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300 hover:text-gray-700 transition-colors"
        >
          + Nueva sección
        </button>
      )}

      {/* Add item modal */}
      {addItemFor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4">
            <h3 className="font-bold text-gray-900 mb-4">Agregar plato</h3>
            <MenuItemForm
              initial={{ categoriaId: addItemFor, visible: true, disponible: true }}
              onSave={handleAddItemSave}
              onCancel={() => setAddItemFor(null)}
              saving={saving}
              secciones={secciones}
              getSubcats={getSubcats}
            />
          </div>
        </div>
      )}

      {/* Edit item modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4">
            <h3 className="font-bold text-gray-900 mb-4">Editar plato</h3>
            <MenuItemForm
              initial={editingItem}
              onSave={handleEditItemSave}
              onCancel={() => setEditingItem(null)}
              saving={saving}
              secciones={secciones}
              getSubcats={getSubcats}
            />
          </div>
        </div>
      )}
    </div>
  )
}
