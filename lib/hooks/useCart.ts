'use client'

import { useEffect, useReducer, useState } from 'react'
import { cartReducer, cartTotal, cartTotalItems } from '../cartReducer'
import type { MenuItem, OrderItem } from '../types'

function cartKey(mesa: number) {
  return `lynk_cart_mesa_${mesa}`
}

export function useCart(mesa: number) {
  const [items, dispatch] = useReducer(cartReducer, [])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(cartKey(mesa))
      if (stored) {
        const parsed: OrderItem[] = JSON.parse(stored)
        dispatch({ type: 'HYDRATE', items: parsed })
      }
    } catch {}
    setHydrated(true)
  }, [mesa])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(cartKey(mesa), JSON.stringify(items))
  }, [items, mesa, hydrated])

  function add(item: MenuItem) { dispatch({ type: 'ADD', item }) }
  function remove(menuItemId: string) { dispatch({ type: 'REMOVE', menuItemId }) }
  function setNota(menuItemId: string, nota: string) { dispatch({ type: 'SET_NOTA', menuItemId, nota }) }
  function clear() {
    dispatch({ type: 'CLEAR' })
    localStorage.removeItem(cartKey(mesa))
  }
  function quantityOf(menuItemId: string) {
    return items.find((i) => i.menuItemId === menuItemId)?.cantidad ?? 0
  }

  return {
    items,
    total: cartTotal(items),
    totalItems: cartTotalItems(items),
    add, remove, clear, quantityOf, setNota, hydrated,
  }
}
