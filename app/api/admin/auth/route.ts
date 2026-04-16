import { NextRequest, NextResponse } from 'next/server'
import { getAuthConfig } from '@/lib/configAuth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  const config = await getAuthConfig()
  if (!config) {
    return NextResponse.json({ error: 'Sistema no configurado' }, { status: 503 })
  }

  if (password !== config.admin) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
