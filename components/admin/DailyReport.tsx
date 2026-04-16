'use client'

import { useDailyOrders } from '@/lib/hooks/useDailyOrders'
import { useTasaBCV } from '@/lib/hooks/useTasaBCV'
import { timeLabel } from '@/lib/time'
import type { Order } from '@/lib/types'

function formatBs(usd: number, tasa: number): string {
  return `Bs. ${(usd * tasa).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface DailyReportProps {
  restauranteId: string
}

function topItems(orders: Order[]) {
  const counts: Record<string, { nombre: string; emoji: string; cantidad: number; total: number }> = {}
  for (const order of orders) {
    for (const item of order.items) {
      if (!counts[item.menuItemId]) {
        counts[item.menuItemId] = { nombre: item.nombre, emoji: item.emoji, cantidad: 0, total: 0 }
      }
      counts[item.menuItemId].cantidad += item.cantidad
      counts[item.menuItemId].total += item.precio * item.cantidad
    }
  }
  return Object.values(counts).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5)
}

const STATUS_COLOR: Record<string, string> = {
  nuevo: 'bg-amber-100 text-amber-700',
  preparando: 'bg-blue-100 text-blue-700',
  listo: 'bg-blue-100 text-blue-700',
  entregado: 'bg-gray-100 text-gray-600',
}

export default function DailyReport({ restauranteId }: DailyReportProps) {
  const { orders, loading } = useDailyOrders(restauranteId)
  const { tasa } = useTasaBCV()

  if (loading) {
    return <p className="text-sm text-gray-400 text-center py-10">Cargando reporte…</p>
  }

  const totalRecaudado = orders
    .filter((o) => o.estado === 'entregado')
    .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.precio * i.cantidad, 0), 0)

  const totalPedidos = orders.length
  const entregados = orders.filter((o) => o.estado === 'entregado').length
  const top = topItems(orders)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">Reporte del día</h2>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-gray-900">{totalPedidos}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pedidos totales</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-gray-900">{entregados}</p>
          <p className="text-xs text-gray-500 mt-0.5">Entregados</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black" style={{ color: '#1A6BFF' }}>
            ${totalRecaudado.toFixed(2)}
          </p>
          {tasa && (
            <p className="text-xs text-gray-400 mt-0.5">{formatBs(totalRecaudado, tasa)}</p>
          )}
          <p className="text-xs text-gray-500 mt-0.5">Recaudado</p>
        </div>
      </div>

      {/* Top ítems */}
      {top.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Ítems más ordenados</h3>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {top.map((item, i) => (
              <div key={item.nombre} className="flex items-center gap-3 px-4 py-3">
                <span className="text-gray-400 text-sm font-bold w-4">{i + 1}</span>
                <span className="text-xl">{item.emoji}</span>
                <span className="flex-1 text-sm text-gray-800">{item.nombre}</span>
                <span className="text-sm font-semibold text-gray-700">{item.cantidad}×</span>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: '#1A6BFF' }}>${item.total.toFixed(2)}</p>
                  {tasa && <p className="text-xs text-gray-400">{formatBs(item.total, tasa)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de pedidos del día */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">
          Todos los pedidos ({totalPedidos})
        </h3>
        <div className="space-y-2">
          {orders.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Sin pedidos hoy todavía</p>
          )}
          {orders.map((order) => {
            const subtotal = order.items.reduce((s, i) => s + i.precio * i.cantidad, 0)
            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">Mesa {order.mesa}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.estado]}`}>
                      {order.estado}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.items.map((i) => `${i.cantidad}× ${i.nombre}`).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">${subtotal.toFixed(2)}</p>
                  {tasa && <p className="text-xs text-gray-400">{formatBs(subtotal, tasa)}</p>}
                  <p className="text-xs text-gray-400">
                    {order.creadoEn ? timeLabel(order.creadoEn) : ''}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
