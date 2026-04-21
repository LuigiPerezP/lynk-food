'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { MesaCuenta } from '@/lib/cuentas'

function formatPrice(n: number) {
  return n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function CuentaDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [cuenta, setCuenta] = useState<MesaCuenta | null>(null)
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/mesonero/cuentas')
    if (res.ok) {
      const data = await res.json() as MesaCuenta[]
      const found = data.find((c) => c.id === id) ?? null
      setCuenta(found)
    }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleCerrar() {
    setClosing(true)
    const res = await fetch(`/api/mesonero/cuentas/${id}/cerrar`, { method: 'POST' })
    if (res.ok) {
      router.push('/mesonero')
    } else {
      setClosing(false)
      setShowConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #064E3B 0%, #065F46 40%, #0F766E 100%)' }}>
        <p className="text-emerald-200 text-sm">Cargando…</p>
      </div>
    )
  }

  if (!cuenta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'linear-gradient(160deg, #064E3B 0%, #065F46 40%, #0F766E 100%)' }}>
        <p className="text-emerald-200">Cuenta no encontrada</p>
        <button onClick={() => router.push('/mesonero')} className="text-sm text-white underline">
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #064E3B 0%, #065F46 40%, #0F766E 100%)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={() => router.push('/mesonero')}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <span className="text-white text-sm">←</span>
        </button>
        <div>
          <p className="text-white font-bold text-base leading-none">Mesa {cuenta.mesa}</p>
          <p className="text-xs mt-0.5" style={{ color: '#6EE7B7' }}>Cuenta abierta</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Items */}
        <div className="rounded-2xl overflow-hidden mb-4"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
          {cuenta.items.map((item, i) => (
            <div
              key={item.menuItemId}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < cuenta.items.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.emoji}</span>
                <div>
                  <p className="text-white text-sm font-medium">{item.nombre}</p>
                  {item.nota && <p className="text-emerald-300/60 text-xs">{item.nota}</p>}
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-white text-sm font-semibold">${formatPrice(item.precio * item.cantidad)}</p>
                <p className="text-emerald-300/60 text-xs">x{item.cantidad} · ${formatPrice(item.precio)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="rounded-2xl px-4 py-4 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <p className="text-white font-bold text-base">Total</p>
          <p className="text-white font-bold text-2xl">${formatPrice(cuenta.total)}</p>
        </div>
      </div>

      {/* Footer action */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4"
        style={{ background: 'linear-gradient(to top, rgba(6,78,59,1) 60%, transparent)' }}>
        <div className="max-w-lg mx-auto">
          {showConfirm ? (
            <div className="space-y-2">
              <p className="text-center text-emerald-200 text-sm mb-3">¿Confirmar cierre de cuenta?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCerrar}
                  disabled={closing}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white' }}
                >
                  {closing ? 'Cerrando…' : 'Confirmar'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-3.5 rounded-xl font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', boxShadow: '0 4px 20px rgba(5,150,105,0.4)' }}
            >
              Cerrar cuenta
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
