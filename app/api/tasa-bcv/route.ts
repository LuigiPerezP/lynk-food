import { NextResponse } from 'next/server'

// ISR: Next.js cachea esta respuesta y la revalida automáticamente cada 3 días
export const revalidate = 259200 // 72 horas en segundos

export async function GET() {
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      next: { revalidate: 259200 },
    })

    if (!res.ok) throw new Error('BCV API error')

    const data = await res.json()
    // { promedio: 92.15, fechaActualizacion: "2025-01-15T...", ... }
    return NextResponse.json({
      tasa: data.promedio as number,
      fecha: data.fechaActualizacion as string,
    })
  } catch {
    // Fallback: si la API falla, retornamos null y el cliente no muestra Bs
    return NextResponse.json({ tasa: null, fecha: null }, { status: 503 })
  }
}
