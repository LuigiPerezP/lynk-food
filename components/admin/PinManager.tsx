'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PinManager({ restauranteId }: { restauranteId: string }) {
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!/^\d{6}$/.test(pin)) {
      setError('El PIN debe ser exactamente 6 dígitos numéricos')
      return
    }
    if (pin !== confirm) {
      setError('Los PINs no coinciden')
      return
    }

    setSaving(true)
    const { error: err } = await supabase
      .from('restaurantes')
      .update({ cocina_pin: pin })
      .eq('id', restauranteId)

    if (err) {
      setError('Error al guardar: ' + err.message)
    } else {
      setSuccess(true)
      setPin('')
      setConfirm('')
    }
    setSaving(false)
  }

  const field = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-center tracking-widest text-lg font-bold'

  return (
    <div className="max-w-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Seguridad</h2>
        <p className="text-sm text-gray-500 mt-1">Cambia el PIN de acceso al panel de cocina.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-gray-100 p-5">
        <div>
          <label className="text-xs font-medium text-gray-500">Nuevo PIN (6 dígitos)</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(null); setSuccess(false) }}
            placeholder="• • • • • •"
            className={field}
            style={{ WebkitTextSecurity: 'disc' } as React.CSSProperties}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Confirmar PIN</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value.replace(/\D/g, '')); setError(null); setSuccess(false) }}
            placeholder="• • • • • •"
            className={field}
            style={{ WebkitTextSecurity: 'disc' } as React.CSSProperties}
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            ✓ PIN actualizado correctamente. El PIN anterior ya no funciona.
          </p>
        )}

        <button
          type="submit"
          disabled={saving || pin.length !== 6 || confirm.length !== 6}
          className="w-full py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-40 transition-all"
          style={{ backgroundColor: '#1A6BFF' }}
        >
          {saving ? 'Guardando…' : 'Cambiar PIN'}
        </button>
      </form>

      <p className="text-xs text-gray-400">
        El PIN actual es válido hasta que lo cambies. Las sesiones activas de cocina se invalidan al cambiar el PIN.
      </p>
    </div>
  )
}
