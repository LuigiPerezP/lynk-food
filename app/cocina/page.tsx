'use client'

import { useEffect, useRef, useState } from 'react'
import { useOrders } from '@/lib/hooks/useOrders'
import { useUpdateOrderStatus } from '@/lib/hooks/useUpdateOrderStatus'
import { playNewOrderAlert } from '@/lib/sound'
import type { Order, OrderStatus } from '@/lib/types'

import KitchenHeader from '@/components/kitchen/KitchenHeader'
import StatsBar from '@/components/kitchen/StatsBar'
import KanbanColumn from '@/components/kitchen/KanbanColumn'
import OrderCard from '@/components/kitchen/OrderCard'
import NotificationBanner from '@/components/kitchen/NotificationBanner'

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'la-terraza'

export default function CocinaPage() {
  const { orders, loading } = useOrders(RESTAURANTE_ID)
  const { updateStatus, loading: loadingId } = useUpdateOrderStatus(RESTAURANTE_ID)

  const [isBoard, setIsBoard] = useState(true)
  const [entregadosHoy, setEntregadosHoy] = useState(0)
  const [notifKey, setNotifKey] = useState('')

  const prevIdsRef = useRef<Set<string>>(new Set())

  // Detecta pedidos nuevos y dispara alerta
  useEffect(() => {
    if (loading) return
    const currentIds = new Set(orders.map((o) => o.id))
    const newOrders = orders.filter(
      (o) => o.estado === 'nuevo' && !prevIdsRef.current.has(o.id)
    )
    if (newOrders.length > 0 && prevIdsRef.current.size > 0) {
      playNewOrderAlert()
      setNotifKey(Date.now().toString())
    }
    prevIdsRef.current = currentIds
  }, [orders, loading])

  async function handleAction(orderId: string, next: OrderStatus | 'entregado') {
    await updateStatus(orderId, next as OrderStatus)
    if (next === 'entregado') setEntregadosHoy((n) => n + 1)
  }

  const nuevos = orders.filter((o) => o.estado === 'nuevo')
  const preparando = orders.filter((o) => o.estado === 'preparando')
  const listos = orders.filter((o) => o.estado === 'listo')

  const allActive: Order[] = [...nuevos, ...preparando, ...listos].sort(
    (a, b) => (a.creadoEn?.getTime() ?? 0) - (b.creadoEn?.getTime() ?? 0)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400 text-sm">
        Conectando con cocina…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <KitchenHeader isBoard={isBoard} onToggleView={() => setIsBoard((v) => !v)} />
      <StatsBar
        nuevos={nuevos.length}
        preparando={preparando.length}
        listos={listos.length}
        entregadosHoy={entregadosHoy}
      />

      <NotificationBanner count={nuevos.length} triggerKey={notifKey} />

      {isBoard ? (
        // Vista tablero kanban
        <div className="flex-1 overflow-x-auto p-5">
          <div className="flex gap-5 h-full min-h-0" style={{ minWidth: 'max-content' }}>
            <KanbanColumn
              title="Nuevos"
              emoji="🔴"
              color="#F59E0B"
              orders={nuevos}
              onAction={handleAction}
              loadingId={loadingId}
            />
            <KanbanColumn
              title="Preparando"
              emoji="🟡"
              color="#3B82F6"
              orders={preparando}
              onAction={handleAction}
              loadingId={loadingId}
            />
            <KanbanColumn
              title="Listo para entregar"
              emoji="🟢"
              color="#10B981"
              orders={listos}
              onAction={handleAction}
              loadingId={loadingId}
            />
          </div>
        </div>
      ) : (
        // Vista lista compacta
        <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
          <div className="space-y-3">
            {allActive.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-16">
                Sin pedidos activos 🎉
              </div>
            )}
            {allActive.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAction={handleAction}
                loadingId={loadingId}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
