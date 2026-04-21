import { getAuthConfig } from './configAuth'

export type Role = 'admin' | 'cocina'

export const COOKIE_NAME = 'lynk_auth'
export const COOKIE_MAX_AGE = 60 * 60 * 12 // 12 horas

export const COCINA_COOKIE_NAME = 'lynk_cocina'
export const COCINA_COOKIE_MAX_AGE = 60 * 60 * 12

async function hmac(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function createToken(role: Role, password: string): Promise<string> {
  const signature = await hmac(role, password)
  return `${role}.${signature}`
}

export async function createCocinaToken(pin: string): Promise<string> {
  const signature = await hmac('cocina', pin)
  return `cocina.${signature}`
}

export async function verifyCocinaToken(token: string | undefined, pin: string): Promise<boolean> {
  if (!token) return false
  const expected = await createCocinaToken(pin)
  return expected === token
}

export async function verifyToken(token: string | undefined, role: Role): Promise<boolean> {
  if (!token) return false
  const [tokenRole] = token.split('.')
  if (tokenRole !== role) return false

  const config = await getAuthConfig()
  if (!config) return false

  const password = role === 'admin' ? config.admin : config.cocina
  if (!password) return false

  const expected = await createToken(role, password)
  return expected === token
}
