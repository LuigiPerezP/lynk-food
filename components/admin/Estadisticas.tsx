'use client'

import { useEffect, useState } from 'react'
import { useTasaBCV } from '@/lib/hooks/useTasaBCV'

type Period = 'hoy' | 'semana' | 'mes'

interface DiaResumen { fecha: string; total: number; pedidos: number }

interface Stats {
  type: 'caja' | 'semana' | 'mes'
  totalPedidos: number
  totalUSD: number
  topItems?: { nombre: string; emoji: string; cantidad: number; total: number }[]
  dias?: DiaResumen[]
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
function fmtFecha(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function Estadisticas() {
  const [period, setPeriod] = useState<Period>('hoy')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const { tasa } = useTasaBCV()

  useEffect(() => {
    setLoading(true)
    setStats(null)
    fetch(`/api/admin/estadisticas?period=${period}`)
      .then(async (r) => {
        const data = await r.json()
        if (r.ok) setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period])

  const maxDia = stats?.dias ? Math.max(...stats.dias.map((d) => d.total), 1) : 1

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
              <p className="text-xs text-gray-500 mt-1">{period === 'hoy' ? 'Cuentas' : 'Pedidos'}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xl font-black" style={{ color: '#1A6BFF' }}>${formatUSD(stats.totalUSD)}</p>
              {tasa && <p className="text-xs text-gray-400 mt-0.5">Bs {formatBs(stats.totalUSD * tasa)}</p>}
              <p className="text-xs text-gray-500 mt-1">Facturado</p>
            </div>
          </div>

          {/* Vista diaria (semana y mes) */}
          {stats.dias && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Facturación por día</h3>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {stats.dias.map((dia) => (
                  <div key={dia.fecha} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-sm font-semibold text-gray-800">{fmtFecha(dia.fecha)}</span>
                        <span className="text-xs text-gray-400 ml-2">{dia.pedidos} pedidos</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: '#1A6BFF' }}>${formatUSD(dia.total)}</p>
                        {tasa && <p className="text-xs text-gray-400">Bs {formatBs(dia.total * tasa)}</p>}
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.round((dia.total / maxDia) * 100)}%`,
                          background: dia.total > 0 ? 'linear-gradient(90deg, #0D3BB5, #1A6BFF)' : 'transparent',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top 10 productos — todos los períodos */}
          {stats.topItems && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                {period === 'hoy' ? 'Lo más pedido en el turno' : 'Top 10 productos'}
              </h3>
              {stats.topItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-xl border border-gray-200">Sin datos</p>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                  {stats.topItems.map((item, i) => {
                    const pct = Math.round((item.cantidad / stats.topItems![0].cantidad) * 100)
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
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0D3BB5, #1A6BFF)' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
