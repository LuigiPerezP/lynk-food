'use client'

import { useState } from 'react'
import Image from 'next/image'
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
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex items-stretch transition-shadow hover:shadow-md">
        {/* Image / Emoji panel */}
        <div
          onClick={() => item.imagen && setExpanded(true)}
          className={`w-20 shrink-0 flex items-center justify-center overflow-hidden ${item.imagen ? 'cursor-pointer' : ''}`}
          style={!item.imagen ? { background: 'linear-gradient(135deg, #EEF2FF, #DBEAFE)' } : undefined}
        >
          {item.imagen ? (
            <div className="relative w-20 h-full min-h-[72px]">
              <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />
              <div className="absolute inset-0 flex items-end justify-end p-1">
                <span className="text-xs bg-black/40 text-white rounded-full px-1.5 py-0.5 leading-none">🔍</span>
              </div>
            </div>
          ) : (
            <span className="text-3xl">{item.emoji}</span>
          )}
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

      {/* Expanded image modal */}
      {expanded && item.imagen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setExpanded(false)}
        >
          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-square w-full">
              <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />
            </div>
            <div className="bg-white px-4 py-3">
              <p className="font-bold text-gray-900">{item.nombre}</p>
              {item.descripcion && <p className="text-sm text-gray-500 mt-0.5">{item.descripcion}</p>}
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-1 rounded-full text-sm font-bold"
                  style={{ background: '#EEF2FF', color: '#0D3BB5' }}>
                  ${item.precio.toFixed(2)}
                </span>
                {tasa && <span className="text-sm text-gray-400">{formatBs(item.precio, tasa)}</span>}
              </div>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
