import { NextResponse } from 'next/server'
import { seedMenu, seedAuth } from '@/lib/seed'

// Solo disponible en desarrollo — cargar el menú de ejemplo en Firestore
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No disponible en producción' }, { status: 403 })
  }

  try {
    await Promise.all([seedMenu(), seedAuth()])
    return NextResponse.json({ ok: true, mensaje: 'Menú y auth cargados exitosamente' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
