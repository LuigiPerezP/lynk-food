export interface CuentaItem {
  menuItemId: string
  nombre: string
  cantidad: number
  precio: number
  emoji: string
  nota?: string
}

export interface MesaCuenta {
  id: string
  mesa: string
  estado: 'abierta' | 'cerrada'
  items: CuentaItem[]
  total: number
  creadoEn: string
  cerradoEn?: string
}
