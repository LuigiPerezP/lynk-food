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
    { id: 'admin' as const, label: 'Admin', emoji: '⚙️', desc: 'Gestión del local' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0a2e1f 0%, #0F6B4F 50%, #1D9E75 100%)' }}>
      <div className="animate-scale-in w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-xl"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span className="text-2xl">🍴</span>
          </div>
          <h1 className="text-2xl font-bold text-white">lynk<span style={{ color: '#6EE7B7' }}>.food</span></h1>
          <p className="text-green-300 text-sm mt-1">Acceso al panel</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}>

          {/* Role selector */}
          <div className="flex gap-2 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => { setRole(r.id); setError('') }}
                className="flex-1 flex flex-col items-center gap-1 py-3.5 rounded-2xl text-sm font-medium transition-all"
                style={{
                  background: role === r.id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.08)',
                  border: role === r.id ? '2px solid transparent' : '2px solid rgba(255,255,255,0.1)',
                  color: role === r.id ? '#0F6B4F' : 'rgba(255,255,255,0.7)',
                }}
              >
                <span className="text-xl">{r.emoji}</span>
                <span className="font-semibold">{r.label}</span>
                <span className="text-xs opacity-70">{r.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Contraseña — {role === 'admin' ? 'Administrador' : 'Cocina'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all placeholder-white/30"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  caretColor: '#6EE7B7',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(110,231,183,0.6)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
              />
            </div>

            {error && (
              <p className="text-xs text-red-300 text-center bg-red-500/10 border border-red-400/20 rounded-lg py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #1D9E75, #16a34a)', color: 'white', boxShadow: '0 4px 20px rgba(29,158,117,0.4)' }}
            >
              {loading ? 'Verificando…' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Sesión activa por 12 horas
          </p>
        </div>
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
