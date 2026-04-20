'use client'

import { use, useState } from 'react'
import { useMenu } from '@/lib/hooks/useMenu'
import { useCart } from '@/lib/hooks/useCart'
import { useSubmitOrder } from '@/lib/hooks/useSubmitOrder'
import { useCategorias } from '@/lib/hooks/useCategorias'

import MenuHeader from '@/components/menu/MenuHeader'
import CategoryTabs from '@/components/menu/CategoryTabs'
import MenuItemCard from '@/components/menu/MenuItemCard'
import CartSummary from '@/components/menu/CartSummary'
import OrderReview from '@/components/menu/OrderReview'
import OrderTracking from '@/components/menu/OrderTracking'
import { useTableOrders } from '@/lib/hooks/useTableOrders'
import MenuSkeleton from '@/components/menu/MenuSkeleton'
import ErrorMessage from '@/components/shared/ErrorMessage'
import EmptyState from '@/components/shared/EmptyState'

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'lynkfood'
const RESTAURANTE_NOMBRE = 'lynkfood'

export default function MesaPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = use(params)
  const mesa = parseInt(numero, 10)

  const { menu, loading: menuLoading, error: menuError, retry: retryMenu } = useMenu(RESTAURANTE_ID)
  const { secciones, getSubcats, leafCats } = useCategorias(RESTAURANTE_ID)
  const { orders: activeOrders } = useTableOrders(RESTAURANTE_ID, mesa)
  const { items, total, totalItems, add, remove, clear, quantityOf, setNota } = useCart(mesa)
  const { submit, loading: submitting, error } = useSubmitOrder()

  const [selectedSection, setSelectedSection] = useState<string | 'todos'>('todos')
  const [selectedSubcat, setSelectedSubcat] = useState<string | null>(null)
  const [notas, setNotas] = useState('')
  const [showCart, setShowCart] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [showTracking, setShowTracking] = useState(false)

  // Get all leaf cat IDs belonging to a section (for filtering)
  function getCatIdsForSection(seccionId: string): string[] {
    const subcats = getSubcats(seccionId)
    return subcats.length > 0
      ? [seccionId, ...subcats.map(s => s.id)]
      : [seccionId]
  }

  // Resolve a cat ID to its display name
  function catNombre(id: string): string {
    return [...secciones, ...secciones.flatMap(s => getSubcats(s.id))]
      .find(c => c.id === id)?.nombre ?? ''
  }

  const filtered = (() => {
    if (selectedSection === 'todos') return menu
    if (selectedSubcat) return menu.filter(i => i.categoriaId === selectedSubcat)
    return menu.filter(i => getCatIdsForSection(selectedSection).includes(i.categoriaId))
  })()

  // Groups for display: { section: nombre, subcats: [{header: nombre, items}] }
  const grupos = (() => {
    type Subgroup = { header: string; items: typeof menu }
    type Group = { section: string; subcats: Subgroup[] }

    function buildSection(seccionId: string, itemPool: typeof menu): Group | null {
      const seccion = secciones.find(s => s.id === seccionId)
      if (!seccion) return null
      const subcats = getSubcats(seccionId)
      if (subcats.length > 0) {
        const subs = subcats
          .map(sub => ({ header: sub.nombre, items: itemPool.filter(i => i.categoriaId === sub.id) }))
          .filter(g => g.items.length > 0)
        if (subs.length === 0) return null
        return { section: seccion.nombre, subcats: subs }
      }
      const its = itemPool.filter(i => i.categoriaId === seccionId)
      if (its.length === 0) return null
      return { section: seccion.nombre, subcats: [{ header: seccion.nombre, items: its }] }
    }

    if (selectedSubcat) {
      const nombre = catNombre(selectedSubcat)
      return [{ section: nombre, subcats: [{ header: nombre, items: filtered }] }]
    }

    if (selectedSection !== 'todos') {
      const g = buildSection(selectedSection, filtered)
      return g ? [g] : []
    }

    // todos
    const result: Group[] = []
    const seen = new Set<string>()
    for (const seccion of secciones) {
      const g = buildSection(seccion.id, menu)
      if (g) {
        result.push(g)
        g.subcats.forEach(s => s.items.forEach(i => seen.add(i.id)))
      }
    }
    const rest = menu.filter(i => !seen.has(i.id))
    if (rest.length > 0) result.push({ section: 'Otros', subcats: [{ header: 'Otros', items: rest }] })
    return result
  })()

  async function handleSubmit() {
    if (items.length === 0) return
    const id = await submit({ restauranteId: RESTAURANTE_ID, mesa, items, notas })
    if (id) {
      clear()
      setNotas('')
      setShowCart(false)
      setShowReview(false)
      setShowTracking(true)
    }
  }

  if (showTracking) {
    return (
      <OrderTracking
        restauranteId={RESTAURANTE_ID}
        mesa={mesa}
        onBack={() => setShowTracking(false)}
      />
    )
  }

  if (showReview) {
    return (
      <OrderReview
        mesa={mesa}
        items={items}
        total={total}
        notas={notas}
        onNotasChange={setNotas}
        onItemNota={setNota}
        loading={submitting}
        onConfirm={handleSubmit}
        onBack={() => setShowReview(false)}
      />
    )
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <MenuHeader restaurante={RESTAURANTE_NOMBRE} mesa={mesa} />

      <div className="sticky top-[61px] z-10 bg-gray-50">
        <CategoryTabs
          secciones={secciones}
          getSubcats={getSubcats}
          selectedSection={selectedSection}
          selectedSubcat={selectedSubcat}
          onSectionChange={setSelectedSection}
          onSubcatChange={setSelectedSubcat}
        />
      </div>

      {menuLoading ? (
        <MenuSkeleton />
      ) : menuError ? (
        <ErrorMessage message={menuError} onRetry={retryMenu} />
      ) : (
        <div className="max-w-lg mx-auto px-4 pt-3 pb-52 space-y-3">
          {menu.length === 0 ? (
            <EmptyState emoji="🍽️" title="El menú está vacío"
              description="El restaurante aún no ha cargado platos. Vuelve en unos minutos." />
          ) : filtered.length === 0 ? (
            <EmptyState emoji="🔍" title="Sin platos en esta categoría"
              description="Prueba con otra categoría del menú." />
          ) : (
            grupos.map(({ section, subcats }) => {
              const multiSub = subcats.length > 1 || (subcats.length === 1 && subcats[0].header !== section)
              return (
                <div key={section} className="mt-2">
                  {/* Section header */}
                  <p className="text-base font-extrabold uppercase tracking-widest mb-3 mt-5 first:mt-0"
                    style={{ color: '#0D3BB5' }}>
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </p>
                  {subcats.map(({ header, items: groupItems }) => (
                    <div key={header} className="mb-4">
                      {/* Subcategory subheader */}
                      {multiSub && (
                        <p className="text-xs font-semibold uppercase tracking-widest mb-2 pl-1 text-gray-400">
                          {header.charAt(0).toUpperCase() + header.slice(1)}
                        </p>
                      )}
                      <div className="space-y-3">
                        {groupItems.map((item) => (
                          <MenuItemCard
                            key={item.id}
                            item={item}
                            quantity={quantityOf(item.id)}
                            nota={items.find((i) => i.menuItemId === item.id)?.nota}
                            onAdd={() => add(item)}
                            onRemove={() => remove(item.id)}
                            onNota={(nota) => setNota(item.id, nota)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Botón Mis pedidos */}
      {!showCart && activeOrders.length > 0 && (
        <button onClick={() => setShowTracking(true)}
          className="fixed bottom-6 left-4 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-white text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 4px 15px rgba(5,150,105,0.4)' }}>
          <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold"
            style={{ color: '#059669' }}>
            {activeOrders.length}
          </span>
          <span>Mis pedidos</span>
        </button>
      )}

      {/* Botón Ver carrito */}
      {!showCart && totalItems > 0 && (
        <button onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-4 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-white text-sm font-semibold"
          style={{ backgroundColor: '#1A6BFF' }}>
          <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold"
            style={{ color: '#1A6BFF' }}>
            {totalItems}
          </span>
          <span>Ver pedido</span>
          <span>${total.toFixed(2)}</span>
        </button>
      )}

      {error && (
        <div className="fixed top-20 left-4 right-4 z-50 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 text-center">
          {error}
        </div>
      )}

      {showCart && (
        <CartSummary
          items={items}
          total={total}
          notas={notas}
          loading={submitting}
          onSubmit={() => setShowReview(true)}
          onAdd={(menuItemId) => { const m = menu.find((i) => i.id === menuItemId); if (m) add(m) }}
          onRemove={remove}
          onNota={setNota}
        />
      )}
    </div>
  )
}
