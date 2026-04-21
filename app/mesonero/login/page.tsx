'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

export default function MesoneroLoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pin.trim()) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/mesonero/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    if (res.ok) {
      router.push('/mesonero')
      router.refresh()
    } else {
      const json = await res.json()
      setError(json.error ?? 'PIN incorrecto')
      setPin('')
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #059669 100%)' }}>
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Image src="/logo.png" alt="lynkfood" width={44} height={44} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">Panel Mesonero</h1>
          <p className="text-emerald-200 text-sm mt-1">Ingresa tu PIN de acceso</p>
        </div>

        <div className="rounded-3xl p-6 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError('') }}
              placeholder="• • • •"
              className="w-full text-center text-3xl font-bold tracking-[0.5em] rounded-xl px-4 py-4 focus:outline-none transition-all placeholder-white/20"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: `1.5px solid ${error ? 'rgba(252,165,165,0.6)' : 'rgba(255,255,255,0.2)'}`,
                color: 'white',
                caretColor: '#6EE7B7',
                WebkitTextSecurity: 'disc',
              } as React.CSSProperties}
            />

            {error && (
              <p className="text-xs text-red-300 text-center bg-red-500/10 border border-red-400/20 rounded-lg py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !pin}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', boxShadow: '0 4px 20px rgba(5,150,105,0.4)' }}
            >
              {loading ? 'Verificando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
