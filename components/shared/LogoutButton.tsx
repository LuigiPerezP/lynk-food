'use client'

import { useRouter } from 'next/navigation'
import type React from 'react'

export default function LogoutButton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className={className} style={style}>
      Cerrar sesión
    </button>
  )
}
