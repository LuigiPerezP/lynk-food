'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const defaultRole = (params.get('role') ?? 'cocina') as 'admin' | 'cocina'
  const from = params.get('from') ?? (defaultRole === 'admin' ? '/admin' : '/cocina')

  const [role, setRole] = useState<'admin' | 'cocina'>(defaultRole)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, password }),
    })

    if (res.ok) {
      router.push(from)
      router.refresh()
    } else {
      setError('Contraseña incorrecta')
      setLoading(false)
    }
  }

  const ROLES = [
    { id: 'cocina' as const, label: 'Cocina', emoji: '🍳', desc: 'Panel de pedidos' },
    { id: 'admin' as const, label: 'Admin', emoji: '⚙️', desc: 'Gestión del restaurante' },
  ]

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🍴</div>
          <h1 className="text-xl font-bold text-gray-900">lynk.food</h1>
          <p className="text-sm text-gray-500 mt-1">Panel de acceso</p>
        </div>

        {/* Role selector */}
        <div className="flex gap-2 mb-6">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => { setRole(r.id); setError('') }}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                role === r.id
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span>{r.label}</span>
              <span className="text-xs font-normal text-gray-400">{r.desc}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Contraseña — {role === 'admin' ? 'Administrador' : 'Cocina'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: '#1D9E75' }}
          >
            {loading ? 'Verificando…' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          Sesión activa por 12 horas
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
