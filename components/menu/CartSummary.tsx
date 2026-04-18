'use client'

import type { OrderItem } from '@/lib/types'
import { useTasaBCV } from '@/lib/hooks/useTasaBCV'

function formatBs(usd: number, tasa: number): string {
  return `Bs. ${(usd * tasa).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface CartSummaryProps {
  items: OrderItem[]
  total: number
  notas: string
  loading: boolean
  onSubmit: () => void
  onAdd: (menuItemId: string) => void
  onRemove: (menuItemId: string) => void
}

export default function CartSummary({ items, total, notas, loading, onSubmit, onAdd, onRemove }: CartSummaryProps) {
  const { tasa } = useTasaBCV()
  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 shadow-2xl"
      style={{ background: 'white', borderTop: '1px solid #e5e7eb' }}>
      <div className="max-w-lg mx-auto px-4 pt-3 pb-5">
        {/* Item list */}
        <div className="mb-3 max-h-32 overflow-y-auto space-y-1.5 pr-1">
          {items.map((item) => (
            <div key={item.menuItemId}>
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-gray-700 flex items-center gap-1.5 min-w-0">
                  <span>{item.emoji}</span>
                  <span className="truncate text-gray-600">{item.nombre}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => onRemove(item.menuItemId)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all active:scale-90"
                    style={{ background: '#EEF2FF', color: '#0D3BB5' }}>
                    −
                  </button>
                  <span className="text-sm font-bold text-gray-900 w-4 text-center">{item.cantidad}</span>
                  <button onClick={() => onAdd(item.menuItemId)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all active:scale-90"
                    style={{ background: '#1A6BFF' }}>
                    +
                  </button>
                  <span className="text-sm font-semibold text-gray-800 w-14 text-right">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </span>
                </div>
              </div>
              {item.nota && (
                <p className="text-xs text-gray-400 italic pl-6 mt-0.5">"{item.nota}"</p>
              )}
            </div>
          ))}
        </div>

        {/* Total row */}
        <div className="flex items-center justify-between py-2.5 border-t border-gray-100 mb-3">
          <span className="font-bold text-gray-900">Total</span>
          <div className="text-right">
            <p className="text-xl font-extrabold" style={{ color: '#0D3BB5' }}>${total.toFixed(2)}</p>
            {tasa && <p className="text-xs text-gray-400">{formatBs(total, tasa)}</p>}
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-50 active:scale-[0.98]"
          style={{
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #0D3BB5, #1A6BFF)',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(26,107,255,0.4)',
          }}
        >
          {loading ? 'Enviando pedido…' : `Enviar pedido · $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}
