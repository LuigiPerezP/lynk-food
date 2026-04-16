import { NextResponse } from 'next/server'
import { seedMenu } from '@/lib/seed'

// Solo disponible en desarrollo — cargar el menú de ejemplo en Firestore
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No disponible en producción' }, { status: 403 })
  }

  try {
    await seedMenu()
    return NextResponse.json({ ok: true, mensaje: 'Menú cargado exitosamente' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
