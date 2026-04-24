export type OrderStatus = 'nuevo' | 'preparando' | 'listo' | 'entregado'

export interface MenuItem {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoriaId: string   // UUID FK → categorias.id
  categoria?: string    // nombre cargado via join, solo para display
  disponible: boolean   // hay stock hoy (se puede ordenar)
  visible: boolean      // aparece en el menú del cliente
  emoji: string
  imagen?: string
  orden?: number
}

export interface OrderItem {
  menuItemId: string
  nombre: string
  cantidad: number
  precio: number
  emoji: string
  nota?: string
}

export interface Order {
  id: string
  mesa: number
  items: OrderItem[]
  notas: string
  estado: OrderStatus
  clientId?: string | null
  creadoEn: Date
  actualizadoEn: Date
}

export interface Restaurante {
  id: string
  nombre: string
  logo?: string
  activo: boolean
}
