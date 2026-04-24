'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import LogoutButton from '@/components/shared/LogoutButton'

const MenuBuilder = dynamic(() => import('@/components/admin/MenuBuilder'), { ssr: false })
const TableManager = dynamic(() => import('@/components/admin/TableManager'), { ssr: false })
const CajaReport = dynamic(() => import('@/components/admin/CajaReport'), { ssr: false })
const DailyReport = dynamic(() => import('@/components/admin/DailyReport'), { ssr: false })
const PinManager = dynamic(() => import('@/components/admin/PinManager'), { ssr: false })
const Estadisticas = dynamic(() => import('@/components/admin/Estadisticas'), { ssr: false })

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'lynkfood'

type Tab = 'menu' | 'mesas' | 'reportes' | 'estadisticas'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'menu',        label: 'Menú',      emoji: '📋' },
  { id: 'mesas',       label: 'Mesas',     emoji: '🪑' },
  { id: 'reportes',    label: 'Reportes',  emoji: '📊' },
  { id: 'estadisticas',label: 'Stats',     emoji: '📈' },
]

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('menu')
  const [baseUrl, setBaseUrl] = useState('')
  const [reportKey, setReportKey] = useState(0)

  useEffect(() => { setBaseUrl(window.location.origin) }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white px-5 py-4 flex items-center justify-between shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D3BB5 60%, #1A6BFF 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Image src="/logo.png" alt="lynkfood" width={28} height={28} className="object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">Administración</p>
            <p className="text-xs mt-0.5" style={{ color: '#93C5FD' }}>lynk.food</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/cocina"
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
            🍳 Cocina
          </Link>
          <Link href="/mesonero"
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
            🧾 Mesonero
          </Link>
          <LogoutButton
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
            redirectTo="/admin/login"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 px-2 shadow-sm overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
            style={tab === t.id
              ? { borderColor: '#1A6BFF', color: '#0D3BB5' }
              : { borderColor: 'transparent', color: '#9CA3AF' }}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {tab === 'menu' && <MenuBuilder restauranteId={RESTAURANTE_ID} />}
        {tab === 'mesas' && (
          <div className="space-y-6">
            <TableManager baseUrl={baseUrl} />
            <PinManager />
          </div>
        )}
        {tab === 'reportes' && (
          <div className="space-y-8">
            <CajaReport onClosed={() => setReportKey(k => k + 1)} />
            <DailyReport key={reportKey} restauranteId={RESTAURANTE_ID} />
          </div>
        )}
        {tab === 'estadisticas' && <Estadisticas key={reportKey} />}
      </div>
    </div>
  )
}
