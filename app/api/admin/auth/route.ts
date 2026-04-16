import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const correct = process.env.ADMIN_PASSWORD

  if (!correct) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD no configurado' }, { status: 500 })
  }

  if (password !== correct) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
