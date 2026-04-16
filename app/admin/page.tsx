'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import LogoutButton from '@/components/shared/LogoutButton'

const MenuManager = dynamic(() => import('@/components/admin/MenuManager'), { ssr: false })
const TableManager = dynamic(() => import('@/components/admin/TableManager'), { ssr: false })
const DailyReport = dynamic(() => import('@/components/admin/DailyReport'), { ssr: false })

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'lynkfood'

type Tab = 'menu' | 'mesas' | 'reportes'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'menu', label: 'Menú', emoji: '📋' },
  { id: 'mesas', label: 'Mesas', emoji: '🪑' },
  { id: 'reportes', label: 'Reportes', emoji: '📊' },
]

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('menu')
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    setBaseUrl(window.location.origin)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white px-5 py-4 flex items-center justify-between shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0a2e1f 0%, #0F6B4F 60%, #1D9E75 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span className="text-base">⚙️</span>
          </div>
          <div>
            <p className="text-sm font-bold leading-none">Administración</p>
            <p className="text-xs mt-0.5" style={{ color: '#6EE7B7' }}>lynk.food</p>
          </div>
        </div>
        <LogoutButton className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }} />
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 px-4 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors"
            style={tab === t.id ? {
              borderColor: '#1D9E75',
              color: '#0F6B4F',
            } : {
              borderColor: 'transparent',
              color: '#9CA3AF',
            }}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {tab === 'menu' && <MenuManager restauranteId={RESTAURANTE_ID} />}
        {tab === 'mesas' && <TableManager baseUrl={baseUrl} />}
        {tab === 'reportes' && <DailyReport restauranteId={RESTAURANTE_ID} />}
      </div>
    </div>
  )
}
