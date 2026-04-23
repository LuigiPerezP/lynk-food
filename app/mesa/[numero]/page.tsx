'use client'

import { use, useEffect, useState } from 'react'
import { useMenu } from '@/lib/hooks/useMenu'
import { useCart } from '@/lib/hooks/useCart'
import { useSubmitOrder } from '@/lib/hooks/useSubmitOrder'
import { useCategorias } from '@/lib/hooks/useCategorias'
import { useSessionOrders } from '@/lib/hooks/useSessionOrders'
import { getClientId, clearClientId } from '@/lib/clientId'

import MenuHeader from '@/components/menu/MenuHeader'
import CategoryTabs from '@/components/menu/CategoryTabs'
import MenuItemCard from '@/components/menu/MenuItemCard'
import CartSummary from '@/components/menu/CartSummary'
import OrderReview from '@/components/menu/OrderReview'
import MyOrderPanel from '@/components/menu/MyOrderPanel'
import MenuSkeleton from '@/components/menu/MenuSkeleton'
import ErrorMessage from '@/components/shared/ErrorMessage'
import EmptyState from '@/components/shared/EmptyState'

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'lynkfood'
const RESTAURANTE_NOMBRE = 'lynkfood'

export default function MesaPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = use(params)
  const mesa = parseInt(numero, 10)

  const [clientId, setClientId] = useState('')
  const [showMyOrder, setShowMyOrder] = useState(false)
  const [cuentaCerradaVista, setCuentaCerradaVista] = useState(false)

  useEffect(() => {
    setClientId(getClientId(mesa))
  }, [mesa])

  const { menu, loading: menuLoading, error: menuError, retry: retryMenu } = useMenu(RESTAURANTE_ID)
  const { secciones, getSubcats, leafCats } = useCategorias(RESTAURANTE_ID)
  const { items, total, totalItems, add, remove, clear, quantityOf, setNota } = useCart(mesa)
  const { submit, loading: submitting, error } = useSubmitOrder()

  const {
    pedidosMios,
    pedidosMesa,
    totalMio,
    totalMesa,
    cuentaRecienCerrada,
    setCuentaRecienCerrada,
    reload: reloadSession,
  } = useSessionOrders(RESTAURANTE_ID, mesa, clientId)

  const [selectedSection, setSelectedSection] = useState<string | 'todos'>('todos')
  const [selectedSubcat, setSelectedSubcat] = useState<string | null>(null)
  const [notas, setNotas] = useState('')
  const [showCart, setShowCart] = useState(false)
  const [showReview, setShowReview] = useState(false)

  // Auto-close goodbye screen after 10s
  useEffect(() => {
    if (!cuentaRecienCerrada || cuentaCerradaVista) return
    const t = setTimeout(() => handleCerrarGoodbye(), 10_000)
    return () => clearTimeout(t)
  }, [cuentaRecienCerrada, cuentaCerradaVista])

  function handleCerrarGoodbye() {
    clearClientId(mesa)
    setClientId(getClientId(mesa)) // genera nuevo ID
    setCuentaRecienCerrada(false)
    setCuentaCerradaVista(true)
    setShowMyOrder(false)
  }

  function getCatIdsForSection(seccionId: string): string[] {
    const subcats = getSubcats(seccionId)
    return subcats.length > 0
      ? [seccionId, ...subcats.map(s => s.id)]
      : [seccionId]
  }

  function catNombre(id: string): string {
    return [...secciones, ...secciones.flatMap(s => getSubcats(s.id))]
      .find(c => c.id === id)?.nombre ?? ''
  }

  const filtered = (() => {
    if (selectedSection === 'todos') return menu
    if (selectedSubcat) return menu.filter(i => i.categoriaId === selectedSubcat)
    return menu.filter(i => getCatIdsForSection(selectedSection).includes(i.categoriaId))
  })()

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
    if (items.length === 0 || !clientId) return
    const id = await submit({ restauranteId: RESTAURANTE_ID, mesa, items, notas, clientId })
    if (id) {
      clear()
      setNotas('')
      setShowCart(false)
      setShowReview(false)
      await reloadSession()
      setShowMyOrder(true)
    }
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

  // Badge: total items ordered in this session
  const sessionItemsBadge = pedidosMesa.reduce((s, p) => s + p.items.reduce((si, i) => si + i.cantidad, 0), 0)
  const hasActivePedido = pedidosMesa.some(p => p.estado === 'preparando' || p.estado === 'listo')

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
                  <p className="text-base font-extrabold uppercase tracking-widest mb-3 mt-5 first:mt-0"
                    style={{ color: '#0D3BB5' }}>
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </p>
                  {subcats.map(({ header, items: groupItems }) => (
                    <div key={header} className="mb-4">
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

      {/* Botón flotante "Mi pedido" */}
      {!showCart && pedidosMesa.length > 0 && (
        <button
          onClick={() => setShowMyOrder(true)}
          className="fixed bottom-6 left-4 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-white text-sm font-semibold"
          style={{
            background: 'linear-gradient(135deg, #059669, #10B981)',
            boxShadow: '0 4px 15px rgba(5,150,105,0.4)',
          }}
        >
          <span className="relative">
            <span className="text-base">🧾</span>
            {hasActivePedido && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            )}
          </span>
          <span>Mi pedido</span>
          <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold"
            style={{ color: '#059669' }}>
            {sessionItemsBadge}
          </span>
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

      {showMyOrder && (
        <MyOrderPanel
          mesa={mesa}
          clientId={clientId}
          pedidosMios={pedidosMios}
          pedidosMesa={pedidosMesa}
          totalMio={totalMio}
          totalMesa={totalMesa}
          onClose={() => setShowMyOrder(false)}
        />
      )}

      {/* Pantalla de cierre de cuenta */}
      {cuentaRecienCerrada && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">¡Gracias por tu visita!</h2>
            <p className="text-gray-500 text-sm mb-6">Esperamos verte pronto</p>
            {totalMesa > 0 && (
              <p className="text-sm text-gray-400 mb-6">
                Total de la mesa: <span className="font-semibold text-gray-700">${totalMesa.toFixed(2)}</span>
              </p>
            )}
            <button
              onClick={handleCerrarGoodbye}
              className="w-full py-3 rounded-2xl font-semibold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
