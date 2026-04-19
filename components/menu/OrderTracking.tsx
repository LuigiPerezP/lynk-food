'use client'

import { useTableOrders } from '@/lib/hooks/useTableOrders'
import type { Order, OrderStatus } from '@/lib/types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; emoji: string; color: string; bg: string; step: number }> = {
  nuevo:      { label: 'En espera',          emoji: '⏳', color: '#D97706', bg: '#FFFBEB', step: 1 },
  preparando: { label: 'Preparando',         emoji: '👨‍🍳', color: '#2563EB', bg: '#EFF6FF', step: 2 },
  listo:      { label: '¡Listo para entregar!', emoji: '✅', color: '#059669', bg: '#ECFDF5', step: 3 },
  entregado:  { label: 'Entregado',          emoji: '🎉', color: '#6B7280', bg: '#F9FAFB', step: 4 },
}

function ProgressBar({ estado }: { estado: OrderStatus }) {
  const step = STATUS_CONFIG[estado].step
  return (
    <div className="flex items-center gap-1 mt-3">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex-1 flex items-center gap-1">
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-blue-500' : 'bg-gray-200'}`} />
        </div>
      ))}
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const cfg = STATUS_CONFIG[order.estado]
  const hora = order.creadoEn.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-white rounded-2xl border-2 overflow-hidden shadow-sm transition-all"
      style={{ borderColor: cfg.color + '40' }}>
      {/* Status banner */}
      <div className="px-4 py-2.5 flex items-center justify-between"
        style={{ backgroundColor: cfg.bg }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{cfg.emoji}</span>
          <span className="text-sm font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
        </div>
        <span className="text-xs text-gray-400">{hora}</span>
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-1.5">
        {order.items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">{item.emoji} {item.cantidad}× {item.nombre}</span>
              <span className="text-gray-400 text-xs">${(item.precio * item.cantidad).toFixed(2)}</span>
            </div>
            {item.nota && <p className="text-xs text-blue-400 italic pl-5">↳ {item.nota}</p>}
          </div>
        ))}
        {order.notas && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mt-1">📝 {order.notas}</p>
        )}
      </div>

      <div className="px-4 pb-3">
        <ProgressBar estado={order.estado} />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-400">
            {order.estado === 'nuevo' && 'Esperando que cocina tome tu pedido…'}
            {order.estado === 'preparando' && 'Cocina está preparando tu pedido'}
            {order.estado === 'listo' && 'Llama al mesonero para recibir tu pedido'}
          </span>
          <span className="text-xs font-bold text-gray-600">
            #{order.id.slice(-4).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  )
}

interface OrderTrackingProps {
  restauranteId: string
  mesa: number
  onBack: () => void
}

export default function OrderTracking({ restauranteId, mesa, onBack }: OrderTrackingProps) {
  const { orders, loading } = useTableOrders(restauranteId, mesa)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white px-5 py-4 flex items-center justify-between shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D3BB5 60%, #1A6BFF 100%)' }}>
        <div>
          <p className="text-sm font-bold">Mis pedidos</p>
          <p className="text-xs mt-0.5" style={{ color: '#93C5FD' }}>Mesa {mesa}</p>
        </div>
        <button onClick={onBack}
          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
          ← Menú
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {loading ? (
          <div className="text-center text-gray-400 text-sm py-16">Cargando pedidos…</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-gray-500 font-medium">No tienes pedidos activos</p>
            <p className="text-gray-400 text-sm mt-1">Tus pedidos aparecerán aquí en tiempo real</p>
            <button onClick={onBack}
              className="mt-6 px-6 py-2.5 rounded-xl font-semibold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #0D3BB5, #1A6BFF)' }}>
              Ver el menú
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 text-center">
              {orders.length} {orders.length === 1 ? 'pedido activo' : 'pedidos activos'} · se actualiza automáticamente
            </p>

            {orders.map(order => <OrderCard key={order.id} order={order} />)}

            <button onClick={onBack}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm border border-gray-200 bg-white text-gray-600 active:scale-[0.98] transition-all">
              ← Volver al menú
            </button>
          </>
        )}
      </div>
    </div>
  )
}
