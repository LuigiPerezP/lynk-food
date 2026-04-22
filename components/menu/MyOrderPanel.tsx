'use client'

import { useState } from 'react'
import type { Order, OrderStatus } from '@/lib/types'
import { useTasaBCV } from '@/lib/hooks/useTasaBCV'

type Tab = 'mios' | 'mesa'

const STATUS: Record<OrderStatus, { label: string; color: string; bg: string; pulse?: boolean }> = {
  nuevo:      { label: 'En espera',  color: '#6B7280', bg: '#F3F4F6' },
  preparando: { label: 'Preparando', color: '#D97706', bg: '#FEF3C7', pulse: true },
  listo:      { label: '¡Listo!',    color: '#059669', bg: '#ECFDF5' },
  entregado:  { label: 'Entregado',  color: '#9CA3AF', bg: '#F9FAFB' },
}

function relativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return 'ahora mismo'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  return `hace ${Math.floor(diff / 3600)}h`
}

function formatBs(usd: number, tasa: number): string {
  return `Bs. ${(usd * tasa).toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function OrderCard({ order, isOtro }: { order: Order; isOtro: boolean }) {
  const cfg = STATUS[order.estado]
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
      <div className="flex items-center justify-between px-3 py-2" style={{ background: cfg.bg }}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${cfg.pulse ? 'animate-pulse' : ''}`} style={{ color: cfg.color }}>
            ● {cfg.label}
          </span>
          {isOtro && (
            <span className="text-xs text-gray-400 bg-white/70 px-1.5 py-0.5 rounded-full">Otra persona</span>
          )}
        </div>
        <span className="text-xs text-gray-400">{relativeTime(order.creadoEn)}</span>
      </div>
      <div className="px-3 py-2.5 space-y-1">
        {order.items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">{item.emoji} {item.cantidad}× {item.nombre}</span>
              <span className="text-xs text-gray-400">${(item.precio * item.cantidad).toFixed(2)}</span>
            </div>
            {item.nota && <p className="text-xs text-blue-400 italic pl-4">↳ {item.nota}</p>}
          </div>
        ))}
        {order.notas && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mt-1">📝 {order.notas}</p>
        )}
      </div>
    </div>
  )
}

interface MyOrderPanelProps {
  mesa: number
  clientId: string
  pedidosMios: Order[]
  pedidosMesa: Order[]
  totalMio: number
  totalMesa: number
  onClose: () => void
}

export default function MyOrderPanel({
  mesa, clientId, pedidosMios, pedidosMesa, totalMio, totalMesa, onClose,
}: MyOrderPanelProps) {
  const [tab, setTab] = useState<Tab>(pedidosMios.length > 0 ? 'mios' : 'mesa')
  const { tasa } = useTasaBCV()

  const pedidos = tab === 'mios' ? pedidosMios : pedidosMesa
  const total = tab === 'mios' ? totalMio : totalMesa
  const hasActive = pedidos.some(p => p.estado === 'nuevo' || p.estado === 'preparando' || p.estado === 'listo')
  const allEntregados = pedidos.length > 0 && pedidos.every(p => p.estado === 'entregado')

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <div>
            <p className="font-bold text-gray-900">Mi pedido</p>
            <p className="text-xs text-gray-400">Mesa {mesa}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pb-3 shrink-0">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {([['mios', 'Mis pedidos', pedidosMios.length], ['mesa', 'Toda la mesa', pedidosMesa.length]] as const).map(([t, label, count]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                {label}
                {count > 0 && <span className="ml-1 text-xs text-gray-400">({count})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
          {pedidos.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">🍽️</p>
              <p className="text-sm text-gray-400">
                {tab === 'mios' ? 'Aún no has pedido nada' : 'No hay pedidos en esta mesa'}
              </p>
            </div>
          ) : (
            pedidos.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                isOtro={tab === 'mesa' && order.clientId !== clientId}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {pedidos.length > 0 && (
          <div className="shrink-0 border-t border-gray-100 px-5 py-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">
                {tab === 'mios' ? 'Tu consumo' : 'Total de la mesa'}
              </span>
              <div className="text-right">
                <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
                {tasa && (
                  <span className="text-xs text-gray-400 ml-1.5">{formatBs(total, tasa)}</span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">
              {hasActive
                ? 'El mesonero llevará tu pedido cuando esté listo'
                : allEntregados
                  ? 'Cuando termines, pide la cuenta al mesonero'
                  : ''}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
