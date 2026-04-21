'use client'

import { useRouter } from 'next/navigation'
import type React from 'react'

interface LogoutButtonProps {
  className?: string
  style?: React.CSSProperties
  endpoint?: string
  redirectTo?: string
  label?: string
}

export default function LogoutButton({
  className,
  style,
  endpoint = '/api/auth/logout',
  redirectTo = '/login',
  label = 'Cerrar sesión',
}: LogoutButtonProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch(endpoint, { method: 'POST' })
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className={className} style={style}>
      {label}
    </button>
  )
}
