'use client'

import { useState } from 'react'

export default function PinManager() {
  const [pin, setPin] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!pin || pin.length < 4) return
    setStatus('saving')
    setErrorMsg('')
    const res = await fetch('/api/admin/mesonero-pin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    if (res.ok) {
      setStatus('ok')
      setPin('')
      setTimeout(() => setStatus('idle'), 2500)
    } else {
      const json = await res.json()
      setErrorMsg(json.error ?? 'Error al guardar')
      setStatus('error')
    }
  }

  return (
    <div className="rounded-2xl p-5 bg-white border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-800 mb-1">PIN de Mesonero</h3>
      <p className="text-xs text-gray-400 mb-4">Cambiar el PIN de acceso del panel mesonero</p>

      <form onSubmit={handleSave} className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={8}
          value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setStatus('idle') }}
          placeholder="Nuevo PIN (4-8 dígitos)"
          className="flex-1 text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 transition-colors"
          style={{ WebkitTextSecurity: 'disc' } as React.CSSProperties}
        />
        <button
          type="submit"
          disabled={status === 'saving' || pin.length < 4}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #0D3BB5, #1A6BFF)' }}
        >
          {status === 'saving' ? 'Guardando…' : status === 'ok' ? '✓ Guardado' : 'Guardar'}
        </button>
      </form>

      {status === 'error' && (
        <p className="text-xs text-red-500 mt-2">{errorMsg}</p>
      )}
    </div>
  )
}
