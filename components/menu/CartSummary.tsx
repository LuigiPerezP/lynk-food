import type { OrderItem } from '@/lib/types'

interface CartSummaryProps {
  items: OrderItem[]
  total: number
  notas: string
  loading: boolean
  onSubmit: () => void
}

export default function CartSummary({ items, total, notas, loading, onSubmit }: CartSummaryProps) {
  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 shadow-2xl"
      style={{ background: 'white', borderTop: '1px solid #e5e7eb' }}>
      <div className="max-w-lg mx-auto px-4 pt-3 pb-5">
        {/* Item list */}
        <div className="mb-3 max-h-32 overflow-y-auto space-y-1.5 pr-1">
          {items.map((item) => (
            <div key={item.menuItemId} className="flex justify-between items-center">
              <span className="text-sm text-gray-700 flex items-center gap-1.5">
                <span>{item.emoji}</span>
                <span className="font-medium">{item.cantidad}×</span>
                <span className="text-gray-600">{item.nombre}</span>
              </span>
              <span className="text-sm font-semibold text-gray-800">
                ${(item.precio * item.cantidad).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Total row */}
        <div className="flex items-center justify-between py-2.5 border-t border-gray-100 mb-3">
          <span className="font-bold text-gray-900">Total</span>
          <span className="text-xl font-extrabold" style={{ color: '#0F6B4F' }}>
            ${total.toFixed(2)}
          </span>
        </div>

        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-50 active:scale-[0.98]"
          style={{
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #0F6B4F, #1D9E75)',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(29,158,117,0.4)',
          }}
        >
          {loading ? 'Enviando pedido…' : `Enviar pedido · $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}
