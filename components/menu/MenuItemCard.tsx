'use client'

import type { MenuItem } from '@/lib/types'
import { useTasaBCV } from '@/lib/hooks/useTasaBCV'

interface MenuItemCardProps {
  item: MenuItem
  quantity: number
  onAdd: () => void
  onRemove: () => void
}

function formatBs(usd: number, tasa: number): string {
  const bs = usd * tasa
  return `Bs. ${bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function MenuItemCard({ item, quantity, onAdd, onRemove }: MenuItemCardProps) {
  const { tasa } = useTasaBCV()

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex items-stretch transition-shadow hover:shadow-md">
      {/* Emoji panel */}
      <div className="w-20 shrink-0 flex items-center justify-center text-3xl"
        style={{ background: 'linear-gradient(135deg, #EEF2FF, #DBEAFE)' }}>
        {item.emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-3.5 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-snug">{item.nombre}</p>
          {item.descripcion && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.descripcion}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: '#EEF2FF', color: '#0D3BB5' }}>
              ${item.precio.toFixed(2)}
            </span>
            {tasa && (
              <span className="text-xs text-gray-400 font-medium">
                {formatBs(item.precio, tasa)}
              </span>
            )}
          </div>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-2 shrink-0">
          {quantity > 0 ? (
            <>
              <button
                onClick={onRemove}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all active:scale-90"
                style={{ background: '#EEF2FF', color: '#0D3BB5' }}
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-bold text-gray-900">{quantity}</span>
              <button
                onClick={onAdd}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold text-white transition-all active:scale-90 shadow-md"
                style={{ background: 'linear-gradient(135deg, #1A6BFF, #2563EB)', boxShadow: '0 2px 8px rgba(26,107,255,0.35)' }}
              >
                +
              </button>
            </>
          ) : (
            <button
              onClick={onAdd}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold text-white transition-all active:scale-90 shadow-md"
              style={{ background: 'linear-gradient(135deg, #1A6BFF, #2563EB)', boxShadow: '0 2px 8px rgba(26,107,255,0.35)' }}
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
