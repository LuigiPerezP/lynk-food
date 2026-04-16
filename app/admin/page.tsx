'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import LogoutButton from '@/components/shared/LogoutButton'

const MenuManager = dynamic(() => import('@/components/admin/MenuManager'), { ssr: false })
const TableManager = dynamic(() => import('@/components/admin/TableManager'), { ssr: false })
const DailyReport = dynamic(() => import('@/components/admin/DailyReport'), { ssr: false })

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'la-terraza'

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
      <div className="bg-gray-900 text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚙️</span>
          <div>
            <p className="text-sm font-bold leading-none">Administración</p>
            <p className="text-xs text-gray-400 mt-0.5">lynk.food</p>
          </div>
        </div>
        <LogoutButton className="text-xs text-gray-400 hover:text-white transition-colors" />
      </div>

      <div className="flex border-b border-gray-200 bg-white px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-green-500 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
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
