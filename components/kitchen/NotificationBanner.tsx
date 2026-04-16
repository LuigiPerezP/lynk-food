'use client'

import { useEffect, useState } from 'react'

interface NotificationBannerProps {
  count: number
  triggerKey: string
}

export default function NotificationBanner({ count, triggerKey }: NotificationBannerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!triggerKey) return
    setVisible(true)
    const id = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(id)
  }, [triggerKey])

  if (!visible || count === 0) return null

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className="flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold"
        style={{ backgroundColor: '#F59E0B' }}>
        <span className="text-lg">🔔</span>
        <span>
          {count === 1 ? 'Nuevo pedido recibido' : `${count} pedidos nuevos`}
        </span>
      </div>
    </div>
  )
}
