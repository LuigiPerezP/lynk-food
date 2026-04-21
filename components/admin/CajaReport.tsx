'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTasaBCV } from '@/lib/hooks/useTasaBCV'
import type { MesaCuenta, CuentaItem } from '@/lib/cuentas'

function formatUSD(n: number) {
  return n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatBs(n: number) {
  return n.toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function CajaReport() {
  const [cuentas, setCuentas] = useState<MesaCuenta[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)
  const [closing, setClosing] = useState(false)
  const { tasa } = useTasaBCV()

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/mesonero/cuentas?all=1')
    if (res.ok) setCuentas(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCerrarCaja() {
    setClosing(true)
    const res = await fetch('/api/admin/cerrar-caja', { method: 'POST' })
    if (res.ok) {
      setCuentas([])
      setConfirm(false)
    }
    setClosing(false)
  }

  const totalUSD = cuentas.reduce((s, c) => s + c.total, 0)
  const cuentasCerradas = cuentas.filter((c) => c.estado === 'cerrada').length
  const cuentasAbiertas = cuentas.filter((c) => c.estado === 'abierta').length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Caja del turno</h2>
        <button onClick={load} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">↻ Actualizar</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-gray-900">{cuentasAbiertas}</p>
          <p className="text-xs text-gray-500 mt-0.5">Abiertas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-gray-900">{cuentasCerradas}</p>
          <p className="text-xs text-gray-500 mt-0.5">Cerradas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xl font-black" style={{ color: '#1A6BFF' }}>${formatUSD(totalUSD)}</p>
          {tasa && <p className="text-xs text-gray-400 mt-0.5">Bs {formatBs(totalUSD * tasa)}</p>}
          <p className="text-xs text-gray-500 mt-0.5">Total</p>
        </div>
      </div>

      {/* Cerrar Caja */}
      <div>
        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            disabled={cuentas.length === 0}
            className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 transition-all disabled:opacity-30"
            style={{ borderColor: '#EF4444', color: '#EF4444' }}
          >
            Cerrar Caja
          </button>
        ) : (
          <div className="rounded-xl border-2 border-red-200 p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-800 text-center">¿Confirmar cierre de caja?</p>
            <p className="text-xs text-gray-500 text-center">
              Se borrarán las {cuentas.length} cuentas del turno. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleCerrarCaja}
                disabled={closing}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: '#EF4444' }}
              >
                {closing ? 'Cerrando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de cuentas */}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-6">Cargando cuentas…</p>
      ) : cuentas.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No hay cuentas en este turno</p>
      ) : (
        <div className="space-y-2">
          {cuentas.map((cuenta) => (
            <div key={cuenta.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => setExpanded(expanded === cuenta.id ? null : cuenta.id)}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">Mesa {cuenta.mesa}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        cuenta.estado === 'abierta'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {cuenta.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {cuenta.items.length} {cuenta.items.length === 1 ? 'ítem' : 'ítems'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">${formatUSD(cuenta.total)}</p>
                  {tasa && <p className="text-xs text-gray-400">Bs {formatBs(cuenta.total * tasa)}</p>}
                  <p className="text-xs text-gray-300 mt-0.5">{expanded === cuenta.id ? '▲' : '▼'}</p>
                </div>
              </button>

              {expanded === cuenta.id && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {(cuenta.items as CuentaItem[]).map((item) => (
                    <div key={item.menuItemId} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.emoji}</span>
                        <div>
                          <p className="text-sm text-gray-800">{item.nombre}</p>
                          {item.nota && <p className="text-xs text-gray-400">{item.nota}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">${formatUSD(item.precio * item.cantidad)}</p>
                        {tasa && <p className="text-xs text-gray-400">Bs {formatBs(item.precio * item.cantidad * tasa)}</p>}
                        <p className="text-xs text-gray-400">x{item.cantidad} · ${formatUSD(item.precio)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
