'use client'

import { use, useState } from 'react'
import { useMenu } from '@/lib/hooks/useMenu'
import { useCart } from '@/lib/hooks/useCart'
import { useSubmitOrder } from '@/lib/hooks/useSubmitOrder'
import { useCategorias } from '@/lib/hooks/useCategorias'
import type { Categoria } from '@/lib/types'

import MenuHeader from '@/components/menu/MenuHeader'
import CategoryTabs from '@/components/menu/CategoryTabs'
import MenuItemCard from '@/components/menu/MenuItemCard'
import CartSummary from '@/components/menu/CartSummary'
import OrderNotes from '@/components/menu/OrderNotes'
import OrderConfirmation from '@/components/menu/OrderConfirmation'
import MenuSkeleton from '@/components/menu/MenuSkeleton'
import ErrorMessage from '@/components/shared/ErrorMessage'
import EmptyState from '@/components/shared/EmptyState'

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'lynkfood'
const RESTAURANTE_NOMBRE = 'lynkfood'

export default function MesaPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = use(params)
  const mesa = parseInt(numero, 10)

  const { menu, loading: menuLoading, error: menuError, retry: retryMenu } = useMenu(RESTAURANTE_ID)
  const { categorias } = useCategorias(RESTAURANTE_ID)
  const { items, total, totalItems, add, remove, clear, quantityOf, setNota } = useCart(mesa)
  const { submit, loading: submitting, error } = useSubmitOrder()

  const [categoria, setCategoria] = useState<Categoria | 'todos'>('todos')
  const [notas, setNotas] = useState('')
  const [showCart, setShowCart] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<{ id: string; hora: string } | null>(null)

  const catNames = categorias.map((c) => c.nombre)

  const filtered = categoria === 'todos'
    ? menu
    : menu.filter((i) => i.categoria === categoria)

  const grupos = catNames
    .map((cat) => ({ cat, items: filtered.filter((i) => i.categoria === cat) }))
    .filter((g) => g.items.length > 0)

  async function handleSubmit() {
    if (items.length === 0) return
    const id = await submit({ restauranteId: RESTAURANTE_ID, mesa, items, notas })
    if (id) {
      clear()
      setNotas('')
      setShowCart(false)
      setConfirmedOrder({
        id,
        hora: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
      })
    }
  }

  if (confirmedOrder) {
    return (
      <OrderConfirmation
        orderId={confirmedOrder.id}
        mesa={mesa}
        hora={confirmedOrder.hora}
        onBack={() => setConfirmedOrder(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuHeader restaurante={RESTAURANTE_NOMBRE} mesa={mesa} />

      <div className="sticky top-[61px] z-10 bg-gray-50">
        <CategoryTabs selected={categoria} onChange={setCategoria} categorias={catNames} />
      </div>

      {menuLoading ? (
        <MenuSkeleton />
      ) : menuError ? (
        <ErrorMessage message={menuError} onRetry={retryMenu} />
      ) : (
        <div className="max-w-lg mx-auto px-4 pt-3 pb-52 space-y-3">
          {menu.length === 0 ? (
            <EmptyState
              emoji="🍽️"
              title="El menú está vacío"
              description="El restaurante aún no ha cargado platos. Vuelve en unos minutos."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              emoji="🔍"
              title="Sin platos en esta categoría"
              description="Prueba con otra categoría del menú."
            />
          ) : (
            grupos.map(({ cat, items: groupItems }) => (
              <div key={cat}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2 mt-4 first:mt-0"
                  style={{ color: '#1A6BFF' }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </p>
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
            ))
          )}
        </div>
      )}

      {/* Carrito expandido */}
      {showCart && items.length > 0 && (
        <div className="max-w-lg mx-auto px-4 pb-2">
          <OrderNotes value={notas} onChange={setNotas} />
        </div>
      )}

      {/* Botón flotante cuando el carrito está colapsado */}
      {!showCart && totalItems > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-4 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-white text-sm font-semibold"
          style={{ backgroundColor: '#1A6BFF' }}
        >
          <span
            className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold"
            style={{ color: '#1A6BFF' }}
          >
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
          onSubmit={handleSubmit}
          onAdd={(menuItemId) => { const m = menu.find((i) => i.id === menuItemId); if (m) add(m) }}
          onRemove={remove}
          onNota={setNota}
        />
      )}
    </div>
  )
}
