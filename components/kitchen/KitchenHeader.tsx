'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import LogoutButton from '@/components/shared/LogoutButton'

interface KitchenHeaderProps {
  isBoard: boolean
  onToggleView: () => void
}

export default function KitchenHeader({ isBoard, onToggleView }: KitchenHeaderProps) {
  const [time, setTime] = useState('')

  useEffect(() => {
    function tick() {
      setTime(new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center justify-between px-5 py-3.5 text-white shadow-lg"
      style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D3BB5 60%, #1A6BFF 100%)' }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <Image src="/logo.png" alt="lynkfood" width={28} height={28} className="object-contain" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none">Panel de Cocina</p>
          <p className="text-xs mt-0.5" style={{ color: '#93C5FD' }}>lynkfood</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-mono text-sm tabular-nums" style={{ color: '#93C5FD' }}>{time}</span>
        <button
          onClick={onToggleView}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {isBoard ? (
            <><span>☰</span><span>Lista</span></>
          ) : (
            <><span>⊞</span><span>Tablero</span></>
          )}
        </button>
        <LogoutButton
          endpoint="/api/cocina/logout"
          redirectTo="/cocina/login"
          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}
        />
      </div>
    </div>
  )
}
