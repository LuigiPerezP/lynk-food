export type Categoria = string

export type OrderStatus = 'nuevo' | 'preparando' | 'listo' | 'entregado'

export interface MenuItem {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: Categoria
  disponible: boolean
  emoji: string
}

export interface OrderItem {
  menuItemId: string
  nombre: string
  cantidad: number
  precio: number
  emoji: string
}

export interface Order {
  id: string
  mesa: number
  items: OrderItem[]
  notas: string
  estado: OrderStatus
  creadoEn: Date
  actualizadoEn: Date
}

export interface Restaurante {
  id: string
  nombre: string
  logo?: string
  activo: boolean
}
