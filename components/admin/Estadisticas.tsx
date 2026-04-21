'use client'

import { useEffect, useState } from 'react'
import { useTasaBCV } from '@/lib/hooks/useTasaBCV'

type Period = 'hoy' | 'semana' | 'mes'

interface Stats {
  totalPedidos: number
  totalUSD: number
  topItems: { nombre: string; emoji: string; cantidad: number; total: number }[]
}

const PERIODS: { id: Period; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: '7 días' },
  { id: 'mes', label: 'Este mes' },
]

function formatUSD(n: number) {
  return n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatBs(n: number) {
  return n.toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function Estadisticas() {
  const [period, setPeriod] = useState<Period>('hoy')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const { tasa } = useTasaBCV()

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/estadisticas?period=${period}`)
      .then(async (r) => {
        const data = await r.json()
        if (r.ok) setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period])

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-800">Estadísticas</h2>

      {/* Period selector */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
            style={period === p.id
              ? { background: 'white', color: '#0D3BB5', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }
              : { color: '#6B7280' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-10">Cargando estadísticas…</p>
      ) : !stats ? (
        <p className="text-sm text-gray-400 text-center py-10">Error al cargar datos</p>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-3xl font-black text-gray-900">{stats.totalPedidos}</p>
              <p className="text-xs text-gray-500 mt-1">Pedidos</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xl font-black" style={{ color: '#1A6BFF' }}>${formatUSD(stats.totalUSD)}</p>
              {tasa && <p className="text-xs text-gray-400 mt-0.5">Bs {formatBs(stats.totalUSD * tasa)}</p>}
              <p className="text-xs text-gray-500 mt-1">Facturado</p>
            </div>
          </div>

          {/* Top productos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Productos más vendidos</h3>
            {stats.topItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-xl border border-gray-200">
                Sin datos en este período
              </p>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {stats.topItems.map((item, i) => {
                  const maxCantidad = stats.topItems[0].cantidad
                  const pct = Math.round((item.cantidad / maxCantidad) * 100)
                  return (
                    <div key={item.nombre} className="px-4 py-3">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-gray-400 text-xs font-bold w-4 shrink-0">{i + 1}</span>
                        <span className="text-xl shrink-0">{item.emoji}</span>
                        <span className="flex-1 text-sm text-gray-800 font-medium">{item.nombre}</span>
                        <span className="text-sm font-bold text-gray-700 shrink-0">{item.cantidad}×</span>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold" style={{ color: '#1A6BFF' }}>${formatUSD(item.total)}</p>
                          {tasa && <p className="text-xs text-gray-400">Bs {formatBs(item.total * tasa)}</p>}
                        </div>
                      </div>
                      <div className="ml-7 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0D3BB5, #1A6BFF)' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
