'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { MesaCuenta } from '@/lib/cuentas'
import { useTasaBCV } from '@/lib/hooks/useTasaBCV'
import AgotadosModal from '@/components/shared/AgotadosModal'

function formatUSD(n: number) {
  return n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatBs(n: number) {
  return n.toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function MesoneroPage() {
  const router = useRouter()
  const [cuentas, setCuentas] = useState<MesaCuenta[]>([])
  const { tasa } = useTasaBCV()
  const [loading, setLoading] = useState(true)
  const [showAgotados, setShowAgotados] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/mesonero/cuentas')
    if (res.ok) {
      const data = await res.json() as MesaCuenta[]
      setCuentas(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleLogout() {
    await fetch('/api/mesonero/logout', { method: 'POST' })
    router.push('/mesonero/login')
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #064E3B 0%, #065F46 40%, #0F766E 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Image src="/logo.png" alt="lynkfood" width={28} height={28} className="object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Panel Mesonero</p>
            <p className="text-xs mt-0.5" style={{ color: '#6EE7B7' }}>Cuentas abiertas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAgotados(true)}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            🚫 Agotados
          </button>
          <button
            onClick={load}
            className="p-2 rounded-xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <span className="text-white text-sm">↻</span>
          </button>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-emerald-200 text-sm">Cargando cuentas…</p>
          </div>
        ) : cuentas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-emerald-200 font-medium">No hay cuentas abiertas</p>
            <p className="text-emerald-300/60 text-sm mt-1">Las mesas activas aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cuentas.map((cuenta) => (
              <button
                key={cuenta.id}
                onClick={() => router.push(`/mesonero/cuenta/${cuenta.id}`)}
                className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-lg">Mesa {cuenta.mesa}</p>
                    <p className="text-emerald-200 text-sm mt-0.5">
                      {cuenta.items.length} {cuenta.items.length === 1 ? 'ítem' : 'ítems'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-xl">${formatUSD(cuenta.total)}</p>
                    {tasa && (
                      <p className="text-emerald-300 text-xs mt-0.5">Bs {formatBs(cuenta.total * tasa)}</p>
                    )}
                    <p className="text-emerald-300/40 text-xs mt-0.5">Ver cuenta →</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showAgotados && <AgotadosModal onClose={() => setShowAgotados(false)} />}
    </div>
  )
}
