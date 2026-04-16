import OrderCard from './OrderCard'
import type { Order, OrderStatus } from '@/lib/types'

interface KanbanColumnProps {
  title: string
  emoji: string
  color: string
  orders: Order[]
  onAction: (orderId: string, next: OrderStatus | 'entregado') => void
  loadingId: string | null
}

export default function KanbanColumn({
  title, emoji, color, orders, onAction, loadingId,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span>{emoji}</span>
        <h2 className="font-bold text-sm text-gray-700">{title}</h2>
        <span
          className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          {orders.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {orders.length === 0 && (
          <div className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400">
            Sin pedidos
          </div>
        )}
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onAction={onAction}
            loadingId={loadingId}
          />
        ))}
      </div>
    </div>
  )
}
