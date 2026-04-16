import { NextRequest, NextResponse } from 'next/server'
import { createToken, COOKIE_NAME, COOKIE_MAX_AGE, type Role } from '@/lib/auth'

const PASSWORDS: Record<Role, string | undefined> = {
  admin: process.env.ADMIN_PASSWORD,
  cocina: process.env.KITCHEN_PASSWORD,
}

export async function POST(req: NextRequest) {
  const { role, password } = await req.json() as { role: Role; password: string }

  const correct = PASSWORDS[role]
  if (!correct || password !== correct) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const token = await createToken(role, password)

  const res = NextResponse.json({ ok: true, role })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  return res
}
