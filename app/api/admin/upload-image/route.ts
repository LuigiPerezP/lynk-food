import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

const BUCKET = 'menu-images'
const MAX_BYTES = 3 * 1024 * 1024 // 3 MB (post-compresión)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const isAdmin = await verifyToken(token, 'admin')
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo no permitido. Usa JPG, PNG o WebP' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Imagen demasiado grande (máx 2 MB)' }, { status: 400 })
  }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  const path = `menu/${crypto.randomUUID()}-${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, bytes, { upsert: true, contentType: file.type })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
