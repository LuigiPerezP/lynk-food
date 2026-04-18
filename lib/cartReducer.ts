import type { MenuItem, OrderItem } from './types'

export type CartAction =
  | { type: 'ADD'; item: MenuItem }
  | { type: 'REMOVE'; menuItemId: string }
  | { type: 'SET_NOTA'; menuItemId: string; nota: string }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: OrderItem[] }

export function cartReducer(state: OrderItem[], action: CartAction): OrderItem[] {
  switch (action.type) {
    case 'HYDRATE':
      return action.items
    case 'ADD': {
      const existing = state.find((i) => i.menuItemId === action.item.id)
      if (existing) {
        return state.map((i) =>
          i.menuItemId === action.item.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      }
      return [
        ...state,
        {
          menuItemId: action.item.id,
          nombre: action.item.nombre,
          cantidad: 1,
          precio: action.item.precio,
          emoji: action.item.emoji,
        },
      ]
    }
    case 'SET_NOTA':
      return state.map((i) =>
        i.menuItemId === action.menuItemId ? { ...i, nota: action.nota } : i
      )
    case 'REMOVE': {
      const existing = state.find((i) => i.menuItemId === action.menuItemId)
      if (!existing) return state
      if (existing.cantidad === 1) return state.filter((i) => i.menuItemId !== action.menuItemId)
      return state.map((i) =>
        i.menuItemId === action.menuItemId ? { ...i, cantidad: i.cantidad - 1 } : i
      )
    }
    case 'CLEAR':
      return []
  }
}

export function cartTotal(items: OrderItem[]): number {
  return items.reduce((sum, i) => sum + i.precio * i.cantidad, 0)
}

export function cartTotalItems(items: OrderItem[]): number {
  return items.reduce((sum, i) => sum + i.cantidad, 0)
}
