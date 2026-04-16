'use client'

interface CartButtonProps {
  totalItems: number
  total: number
  onClick: () => void
}

export default function CartButton({ totalItems, total, onClick }: CartButtonProps) {
  if (totalItems === 0) return null

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-4 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-white text-sm font-semibold transition-transform active:scale-95"
      style={{ backgroundColor: '#1A6BFF' }}
    >
      <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold"
        style={{ color: '#1A6BFF' }}>
        {totalItems}
      </span>
      <span>Ver pedido</span>
      <span>${total.toFixed(2)}</span>
    </button>
  )
}
