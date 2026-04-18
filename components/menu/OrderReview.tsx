import type { OrderItem } from '@/lib/types'
import { useTasaBCV } from '@/lib/hooks/useTasaBCV'

interface OrderReviewProps {
  mesa: number
  items: OrderItem[]
  total: number
  notas: string
  onNotasChange: (v: string) => void
  loading: boolean
  onConfirm: () => void
  onBack: () => void
}

function formatBs(usd: number, tasa: number) {
  return `Bs. ${(usd * tasa).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function OrderReview({ mesa, items, total, notas, onNotasChange, loading, onConfirm, onBack }: OrderReviewProps) {
  const { tasa } = useTasaBCV()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10"
      style={{ background: 'linear-gradient(160deg, #EEF2FF 0%, #DBEAFE 100%)' }}>

      {/* Icon */}
      <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl mb-5"
        style={{ background: 'linear-gradient(135deg, #0D3BB5, #1A6BFF)', boxShadow: '0 8px 30px rgba(26,107,255,0.4)' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      </div>

      <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Resumen del pedido</h2>
      <p className="text-gray-500 text-sm mb-6">Mesa {mesa} · Revisa antes de confirmar</p>

      {/* Items card */}
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-lg mb-4">
        <div className="px-5 py-3" style={{ background: 'linear-gradient(135deg, #0A1628, #0D3BB5)' }}>
          <p className="text-blue-300 text-xs font-semibold tracking-widest uppercase">Tu pedido</p>
        </div>
        <div className="bg-white px-5 py-4 space-y-3">
          {items.map((item) => (
            <div key={item.menuItemId}>
              <div className="flex justify-between items-start text-sm">
                <span className="text-gray-700 flex items-center gap-1.5">
                  <span>{item.emoji}</span>
                  <span className="font-medium">{item.cantidad}× {item.nombre}</span>
                </span>
                <span className="font-bold text-gray-900 shrink-0 ml-2">
                  ${(item.precio * item.cantidad).toFixed(2)}
                </span>
              </div>
              {item.nota && (
                <p className="text-xs text-blue-500 italic pl-5 mt-0.5">↳ {item.nota}</p>
              )}
            </div>
          ))}

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium mb-1.5">📝 Comentario general</p>
            <textarea
              value={notas}
              onChange={(e) => onNotasChange(e.target.value)}
              placeholder="Alguna indicación para el pedido completo…"
              rows={2}
              className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-400"
            />
          </div>

          <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
            <span className="font-bold text-gray-900">Total</span>
            <div className="text-right">
              <p className="text-lg font-extrabold" style={{ color: '#0D3BB5' }}>${total.toFixed(2)}</p>
              {tasa && <p className="text-xs text-gray-400">{formatBs(total, tasa)}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <button
        onClick={onConfirm}
        disabled={loading}
        className="w-full max-w-sm py-4 rounded-2xl font-bold text-white text-sm mb-3 transition-all active:scale-[0.98] disabled:opacity-50"
        style={{
          background: loading ? '#9ca3af' : 'linear-gradient(135deg, #0D3BB5, #1A6BFF)',
          boxShadow: loading ? 'none' : '0 4px 20px rgba(26,107,255,0.4)',
        }}
      >
        {loading ? 'Enviando pedido…' : `Confirmar pedido · $${total.toFixed(2)}`}
      </button>

      <button
        onClick={onBack}
        className="w-full max-w-sm py-3 rounded-2xl font-semibold text-sm text-gray-600 bg-white border border-gray-200 active:scale-[0.98] transition-all"
      >
        ← Volver al menú
      </button>
    </div>
  )
}
