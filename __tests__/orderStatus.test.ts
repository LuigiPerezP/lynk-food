import type { OrderStatus } from '@/lib/types'

// Mapa de transiciones válidas de estado
const TRANSITIONS: Record<OrderStatus, OrderStatus | 'entregado' | null> = {
  nuevo: 'preparando',
  preparando: 'listo',
  listo: 'entregado',
  entregado: null,
}

function nextStatus(current: OrderStatus): OrderStatus | 'entregado' | null {
  return TRANSITIONS[current]
}

function isValidTransition(from: OrderStatus, to: OrderStatus | 'entregado'): boolean {
  return TRANSITIONS[from] === to
}

describe('transiciones de estado del pedido', () => {
  it('nuevo → preparando es válido', () => {
    expect(isValidTransition('nuevo', 'preparando')).toBe(true)
  })

  it('preparando → listo es válido', () => {
    expect(isValidTransition('preparando', 'listo')).toBe(true)
  })

  it('listo → entregado es válido', () => {
    expect(isValidTransition('listo', 'entregado')).toBe(true)
  })

  it('nuevo → listo NO es válido (saltar un estado)', () => {
    expect(isValidTransition('nuevo', 'listo')).toBe(false)
  })

  it('entregado no tiene siguiente estado', () => {
    expect(nextStatus('entregado')).toBeNull()
  })

  it('el flujo completo pasa por todos los estados', () => {
    const flujo: (OrderStatus | 'entregado')[] = []
    let current: OrderStatus = 'nuevo'

    while (true) {
      const next = nextStatus(current)
      if (!next) break
      flujo.push(next)
      if (next === 'entregado') break
      current = next as OrderStatus
    }

    expect(flujo).toEqual(['preparando', 'listo', 'entregado'])
  })
})

describe('estados válidos del sistema', () => {
  const VALID_STATUSES: OrderStatus[] = ['nuevo', 'preparando', 'listo', 'entregado']

  it('todos los estados tienen una entrada en el mapa de transiciones', () => {
    VALID_STATUSES.forEach((status) => {
      expect(status in TRANSITIONS).toBe(true)
    })
  })

  it('nuevo es el único estado sin predecesor', () => {
    const withPredecessor = Object.values(TRANSITIONS).filter(Boolean)
    expect(withPredecessor).not.toContain('nuevo')
  })
})
