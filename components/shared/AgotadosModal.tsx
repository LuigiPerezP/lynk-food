'use client'

import { useEffect, useState } from 'react'

interface Item { id: string; nombre: string; emoji: string; disponible: boolean }

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'lynkfood'

export default function AgotadosModal({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/menu_items?restaurante_id=eq.${RESTAURANTE_ID}&visible=eq.true&select=id,nombre,emoji,disponible&order=nombre.asc`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    })
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function toggle(item: Item) {
    setToggling(item.id)
    const res = await fetch(`/api/menu-items/${item.id}/disponibilidad`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponible: !item.disponible }),
    })
    if (res.ok) {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, disponible: !i.disponible } : i))
    }
    setToggling(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#fff', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-bold text-gray-900">Marcar agotados</p>
            <p className="text-xs text-gray-400 mt-0.5">✓ = disponible · ✕ = agotado</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center">×</button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-8">Cargando…</p>
          ) : items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50">
              <span className="text-xl shrink-0">{item.emoji}</span>
              <span className={`flex-1 text-sm font-medium ${!item.disponible ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {item.nombre}
              </span>
              {!item.disponible && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                  Agotado
                </span>
              )}
              <button
                onClick={() => toggle(item)}
                disabled={toggling === item.id}
                className={`w-10 h-6 rounded-full transition-colors shrink-0 relative disabled:opacity-50 ${item.disponible ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${item.disponible ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
