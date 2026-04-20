import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

const BUCKET = 'menu-images'
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  // Verify admin cookie
  const token = req.cookies.get(COOKIE_NAME)?.value
  const isAdmin = await verifyToken(token, 'admin')
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Imagen demasiado grande (máx 5 MB)' }, { status: 400 })

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ error: 'Configuración de servidor incompleta' }, { status: 500 })

  const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `menu/${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error } = await adminClient.storage
    .from(BUCKET)
    .upload(path, bytes, { upsert: true, contentType: file.type })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = adminClient.storage.from(BUCKET).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
