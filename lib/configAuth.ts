import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

interface AuthConfig {
  admin: string
  cocina: string
}

// Caché en memoria con TTL de 5 minutos
let cache: { data: AuthConfig; expiresAt: number } | null = null
const TTL_MS = 5 * 60 * 1000

export async function getAuthConfig(): Promise<AuthConfig | null> {
  if (cache && Date.now() < cache.expiresAt) return cache.data

  const ref = doc(db, 'config', 'auth')
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    const defaults: AuthConfig = { admin: 'Admin2026', cocina: 'Cocina2026' }
    await setDoc(ref, defaults)
    cache = { data: defaults, expiresAt: Date.now() + TTL_MS }
    return defaults
  }

  const data = snap.data() as AuthConfig
  cache = { data, expiresAt: Date.now() + TTL_MS }
  return data
}

export async function setAuthConfig(config: Partial<AuthConfig>): Promise<void> {
  await setDoc(doc(db, 'config', 'auth'), config, { merge: true })
  cache = null // invalida caché
}
