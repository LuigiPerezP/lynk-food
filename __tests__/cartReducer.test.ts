import { cartReducer, cartTotal, cartTotalItems } from '@/lib/cartReducer'
import type { MenuItem, OrderItem } from '@/lib/types'

const mockItem = (overrides: Partial<MenuItem> = {}): MenuItem => ({
  id: 'item-1',
  nombre: 'Pabellón criollo',
  descripcion: 'Clásico venezolano',
  precio: 14,
  categoriaId: 'cat-1',
  categoria: 'platos',
  disponible: true,
  visible: true,
  emoji: '🍛',
  ...overrides,
})

describe('cartReducer', () => {
  it('agrega un ítem nuevo al carrito', () => {
    const result = cartReducer([], { type: 'ADD', item: mockItem() })
    expect(result).toHaveLength(1)
    expect(result[0].menuItemId).toBe('item-1')
    expect(result[0].cantidad).toBe(1)
  })

  it('incrementa cantidad si el ítem ya existe', () => {
    const item = mockItem()
    const state: OrderItem[] = [{ menuItemId: 'item-1', nombre: 'Pabellón criollo', cantidad: 1, precio: 14, emoji: '🍛' }]
    const result = cartReducer(state, { type: 'ADD', item })
    expect(result[0].cantidad).toBe(2)
    expect(result).toHaveLength(1)
  })

  it('decrementa cantidad al hacer REMOVE', () => {
    const state: OrderItem[] = [{ menuItemId: 'item-1', nombre: 'Pabellón criollo', cantidad: 2, precio: 14, emoji: '🍛' }]
    const result = cartReducer(state, { type: 'REMOVE', menuItemId: 'item-1' })
    expect(result[0].cantidad).toBe(1)
  })

  it('elimina el ítem si cantidad llega a 0', () => {
    const state: OrderItem[] = [{ menuItemId: 'item-1', nombre: 'Pabellón criollo', cantidad: 1, precio: 14, emoji: '🍛' }]
    const result = cartReducer(state, { type: 'REMOVE', menuItemId: 'item-1' })
    expect(result).toHaveLength(0)
  })

  it('limpia el carrito con CLEAR', () => {
    const state: OrderItem[] = [
      { menuItemId: 'item-1', nombre: 'Pabellón criollo', cantidad: 2, precio: 14, emoji: '🍛' },
      { menuItemId: 'item-2', nombre: 'Refresco', cantidad: 1, precio: 3, emoji: '🥤' },
    ]
    const result = cartReducer(state, { type: 'CLEAR' })
    expect(result).toHaveLength(0)
  })

  it('hydrata el carrito con HYDRATE', () => {
    const items: OrderItem[] = [
      { menuItemId: 'item-1', nombre: 'Pabellón criollo', cantidad: 2, precio: 14, emoji: '🍛' },
    ]
    const result = cartReducer([], { type: 'HYDRATE', items })
    expect(result).toEqual(items)
  })

  it('REMOVE en ítem inexistente no modifica el estado', () => {
    const state: OrderItem[] = [{ menuItemId: 'item-1', nombre: 'Pabellón criollo', cantidad: 1, precio: 14, emoji: '🍛' }]
    const result = cartReducer(state, { type: 'REMOVE', menuItemId: 'no-existe' })
    expect(result).toBe(state) // referencia igual — no cambió
  })
})

describe('cartTotal', () => {
  it('calcula el total correctamente', () => {
    const items: OrderItem[] = [
      { menuItemId: '1', nombre: 'A', cantidad: 2, precio: 14, emoji: '🍛' },
      { menuItemId: '2', nombre: 'B', cantidad: 1, precio: 3, emoji: '🥤' },
    ]
    expect(cartTotal(items)).toBe(31)
  })

  it('retorna 0 para carrito vacío', () => {
    expect(cartTotal([])).toBe(0)
  })
})

describe('cartTotalItems', () => {
  it('suma las cantidades de todos los ítems', () => {
    const items: OrderItem[] = [
      { menuItemId: '1', nombre: 'A', cantidad: 3, precio: 14, emoji: '🍛' },
      { menuItemId: '2', nombre: 'B', cantidad: 2, precio: 3, emoji: '🥤' },
    ]
    expect(cartTotalItems(items)).toBe(5)
  })
})
