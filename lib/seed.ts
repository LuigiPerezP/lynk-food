import { collection, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from './firebase'
import type { MenuItem } from './types'

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'lynkfood'

const menuItems: Omit<MenuItem, 'id'>[] = [
  // Entradas
  {
    nombre: 'Ensalada César',
    descripcion: 'Lechuga romana, crutones, parmesano y aderezo César clásico',
    precio: 8,
    categoria: 'entradas',
    disponible: true,
    emoji: '🥗',
  },
  {
    nombre: 'Tequeños de queso',
    descripcion: 'Palitos de masa de pan rellenos de queso blanco venezolano',
    precio: 6,
    categoria: 'entradas',
    disponible: true,
    emoji: '🧀',
  },
  {
    nombre: 'Sopa del día',
    descripcion: 'Consulta al mesonero la sopa del día preparada en casa',
    precio: 5,
    categoria: 'entradas',
    disponible: true,
    emoji: '🍲',
  },

  // Platos
  {
    nombre: 'Pabellón criollo',
    descripcion: 'Carne mechada, caraotas negras, tajadas de plátano y arroz blanco',
    precio: 14,
    categoria: 'platos',
    disponible: true,
    emoji: '🍛',
  },
  {
    nombre: 'Pollo a la plancha',
    descripcion: 'Pechuga de pollo a la plancha con ensalada y papas al vapor',
    precio: 12,
    categoria: 'platos',
    disponible: true,
    emoji: '🍗',
  },
  {
    nombre: 'Pasta al pesto',
    descripcion: 'Espagueti con pesto de albahaca fresca y piñones tostados',
    precio: 10,
    categoria: 'platos',
    disponible: true,
    emoji: '🍝',
  },
  {
    nombre: 'Filete de mero',
    descripcion: 'Mero fresco a la plancha con arroz caribeño y ensalada',
    precio: 16,
    categoria: 'platos',
    disponible: true,
    emoji: '🐟',
  },

  // Bebidas
  {
    nombre: 'Refresco',
    descripcion: 'Cola, naranja, lima o agua mineral',
    precio: 3,
    categoria: 'bebidas',
    disponible: true,
    emoji: '🥤',
  },
  {
    nombre: 'Jugo natural',
    descripcion: 'Parchita, naranja, guanábana o mango — del día',
    precio: 4,
    categoria: 'bebidas',
    disponible: true,
    emoji: '🍹',
  },
  {
    nombre: 'Café negro',
    descripcion: 'Espresso venezolano de tueste oscuro',
    precio: 2,
    categoria: 'bebidas',
    disponible: true,
    emoji: '☕',
  },

  // Postres
  {
    nombre: 'Quesillo',
    descripcion: 'Flan de queso venezolano con caramelo artesanal',
    precio: 5,
    categoria: 'postres',
    disponible: true,
    emoji: '🍮',
  },
  {
    nombre: 'Brownie con helado',
    descripcion: 'Brownie de chocolate caliente con bola de helado de vainilla',
    precio: 7,
    categoria: 'postres',
    disponible: true,
    emoji: '🍨',
  },
]

export async function seedMenu() {
  const menuRef = collection(db, 'restaurante', RESTAURANTE_ID, 'menu')

  const promises = menuItems.map((item) => {
    const docRef = doc(menuRef)
    return setDoc(docRef, {
      ...item,
      creadoEn: Timestamp.now(),
    })
  })

  await Promise.all(promises)
  console.log(`✅ ${menuItems.length} platos cargados en restaurante "${RESTAURANTE_ID}"`)
}

export async function seedAuth() {
  const authRef = doc(db, 'config', 'auth')
  const snap = await getDoc(authRef)

  if (snap.exists()) {
    console.log('ℹ️ config/auth ya existe, no se sobreescribe')
    return
  }

  await setDoc(authRef, { admin: 'Admin2026', cocina: 'Cocina2026' })
  console.log('✅ Contraseñas iniciales guardadas en config/auth')
}
