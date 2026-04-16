import type { MenuItem } from '@/lib/types'

interface MenuItemCardProps {
  item: MenuItem
  quantity: number
  onAdd: () => void
  onRemove: () => void
}

export default function MenuItemCard({ item, quantity, onAdd, onRemove }: MenuItemCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex items-stretch transition-shadow hover:shadow-md">
      {/* Emoji panel */}
      <div className="w-20 shrink-0 flex items-center justify-center text-3xl"
        style={{ background: 'linear-gradient(135deg, #E8F7F2, #d1fae5)' }}>
        {item.emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-3.5 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-snug">{item.nombre}</p>
          {item.descripcion && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.descripcion}</p>
          )}
          <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: '#E8F7F2', color: '#0F6B4F' }}>
            ${item.precio.toFixed(2)}
          </span>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-2 shrink-0">
          {quantity > 0 ? (
            <>
              <button
                onClick={onRemove}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all active:scale-90"
                style={{ background: '#E8F7F2', color: '#0F6B4F' }}
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-bold text-gray-900">{quantity}</span>
              <button
                onClick={onAdd}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold text-white transition-all active:scale-90 shadow-md"
                style={{ background: 'linear-gradient(135deg, #1D9E75, #16a34a)', boxShadow: '0 2px 8px rgba(29,158,117,0.35)' }}
              >
                +
              </button>
            </>
          ) : (
            <button
              onClick={onAdd}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold text-white transition-all active:scale-90 shadow-md"
              style={{ background: 'linear-gradient(135deg, #1D9E75, #16a34a)', boxShadow: '0 2px 8px rgba(29,158,117,0.35)' }}
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
