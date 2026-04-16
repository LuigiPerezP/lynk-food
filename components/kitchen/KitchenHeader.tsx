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
    <div className="flex items-center justify-between px-5 py-3 bg-gray-900 text-white">
      <div className="flex items-center gap-3">
        <span className="text-xl">🍳</span>
        <div>
          <p className="text-sm font-bold leading-none">Panel de Cocina</p>
          <p className="text-xs text-gray-400 mt-0.5">La Terraza</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-mono text-sm tabular-nums text-green-400">{time}</span>
        <button
          onClick={onToggleView}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          {isBoard ? (
            <><span>☰</span><span>Lista</span></>
          ) : (
            <><span>⊞</span><span>Tablero</span></>
          )}
        </button>
        <LogoutButton className="text-xs text-gray-500 hover:text-white transition-colors" />
      </div>
    </div>
  )
}
