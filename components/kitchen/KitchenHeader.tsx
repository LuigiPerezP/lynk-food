'use client'

import { useEffect, useState } from 'react'
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
      style={{ background: 'linear-gradient(135deg, #0a2e1f 0%, #0F6B4F 60%, #1D9E75 100%)' }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span className="text-base">🍳</span>
        </div>
        <div>
          <p className="text-sm font-bold leading-none">Panel de Cocina</p>
          <p className="text-xs mt-0.5" style={{ color: '#6EE7B7' }}>La Terraza</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-mono text-sm tabular-nums" style={{ color: '#6EE7B7' }}>{time}</span>
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
          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}
        />
      </div>
    </div>
  )
}
