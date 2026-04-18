'use client'

import { useEffect, useState } from 'react'
import { elapsedLabel, elapsedMinutes, timeLabel } from '@/lib/time'
import type { Order, OrderStatus } from '@/lib/types'

const ACTION: Record<OrderStatus, { label: string; next: OrderStatus | 'entregado'; color: string } | null> = {
  nuevo: { label: 'Iniciar preparación', next: 'preparando', color: '#3B82F6' },
  preparando: { label: 'Marcar como listo', next: 'listo', color: '#10B981' },
  listo: { label: 'Entregado ✓', next: 'entregado', color: '#6B7280' },
  entregado: null,
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  nuevo: 'Nuevo',
  preparando: 'Preparando',
  listo: 'Listo',
  entregado: 'Entregado',
}

interface OrderCardProps {
  order: Order
  onAction: (orderId: string, next: OrderStatus | 'entregado') => void
  loadingId: string | null
  compact?: boolean
}

export default function OrderCard({ order, onAction, loadingId, compact }: OrderCardProps) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  const overdue = order.creadoEn && elapsedMinutes(order.creadoEn) >= 10
  const action = ACTION[order.estado]
  const isLoading = loadingId === order.id

  return (
    <div className={`bg-white rounded-xl border-2 shadow-sm transition-all ${
      overdue ? 'border-red-400' : order.estado === 'nuevo' ? 'border-amber-300' : 'border-gray-200'
    } ${compact ? 'p-3' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xl font-black ${overdue ? 'text-red-500' : 'text-gray-800'}`}>
            Mesa {order.mesa}
          </span>
          {overdue && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">⚠ Demorado</span>}
        </div>
        <div className="text-right">
          <p className={`font-mono text-sm font-bold tabular-nums ${overdue ? 'text-red-500' : 'text-gray-500'}`}>
            {order.creadoEn ? elapsedLabel(order.creadoEn) : '--:--'}
          </p>
          <p className="text-xs text-gray-400">{order.creadoEn ? timeLabel(order.creadoEn) : ''}</p>
        </div>
      </div>

      {/* Items */}
      <ul className="space-y-1 mb-3">
        {order.items.map((item, i) => (
          <li key={i}>
            <div className="flex justify-between text-sm text-gray-700">
              <span>{item.emoji} {item.cantidad}× {item.nombre}</span>
              <span className="text-gray-400 text-xs ml-2">${(item.precio * item.cantidad).toFixed(2)}</span>
            </div>
            {item.nota && (
              <p className="text-xs text-amber-700 italic pl-5 mt-0.5">↳ {item.nota}</p>
            )}
          </li>
        ))}
      </ul>

      {/* Notas */}
      {order.notas && (
        <div className="mb-3 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          📝 {order.notas}
        </div>
      )}

      {/* Action */}
      {action && (
        <button
          onClick={() => onAction(order.id, action.next)}
          disabled={isLoading}
          className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: action.color }}
        >
          {isLoading ? 'Actualizando…' : action.label}
        </button>
      )}
    </div>
  )
}
