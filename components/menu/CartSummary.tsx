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
    <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-white border-t border-gray-200 shadow-xl">
      <div className="max-w-lg mx-auto">
        <div className="mb-3 max-h-36 overflow-y-auto space-y-1">
          {items.map((item) => (
            <div key={item.menuItemId} className="flex justify-between text-sm text-gray-700">
              <span>
                {item.emoji} {item.cantidad}× {item.nombre}
              </span>
              <span className="font-medium">${(item.precio * item.cantidad).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-3 pt-2 border-t border-gray-100">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-lg font-bold" style={{ color: '#1D9E75' }}>
            ${total.toFixed(2)}
          </span>
        </div>

        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#1D9E75' }}
        >
          {loading ? 'Enviando pedido…' : 'Enviar pedido'}
        </button>
      </div>
    </div>
  )
}
