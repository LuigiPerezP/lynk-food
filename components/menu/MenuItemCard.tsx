import type { MenuItem } from '@/lib/types'

interface MenuItemCardProps {
  item: MenuItem
  quantity: number
  onAdd: () => void
  onRemove: () => void
}

export default function MenuItemCard({ item, quantity, onAdd, onRemove }: MenuItemCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
      <div className="text-3xl leading-none mt-1">{item.emoji}</div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm leading-tight">{item.nombre}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.descripcion}</p>
        <p className="text-sm font-bold mt-1" style={{ color: '#1D9E75' }}>
          ${item.precio.toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-1 shrink-0">
        {quantity > 0 ? (
          <>
            <button
              onClick={onRemove}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-colors"
              style={{ borderColor: '#1D9E75', color: '#1D9E75' }}
            >
              −
            </button>
            <span className="w-5 text-center text-sm font-bold text-gray-900">{quantity}</span>
            <button
              onClick={onAdd}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold text-white transition-colors"
              style={{ backgroundColor: '#1D9E75' }}
            >
              +
            </button>
          </>
        ) : (
          <button
            onClick={onAdd}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold text-white transition-colors"
            style={{ backgroundColor: '#1D9E75' }}
          >
            +
          </button>
        )}
      </div>
    </div>
  )
}
