import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const BUCKET = 'product-images'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No se recibieron archivos' }, { status: 400 })
    }

    if (files.length > 5) {
      return NextResponse.json({ error: 'Máximo 5 imágenes por vez' }, { status: 400 })
    }

    // Validate each file
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Tipo de archivo no permitido: ${file.name}. Solo PNG, JPG y WebP.` },
          { status: 400 }
        )
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `${file.name} excede los 5MB permitidos` },
          { status: 400 }
        )
      }
    }

    const supabase = createAdminClient()

    // Ensure the bucket exists (auto-create on first use)
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some((b) => b.name === BUCKET)
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_SIZE,
        allowedMimeTypes: ALLOWED_TYPES,
      })
      if (createError && !createError.message.includes('already exists')) {
        console.error('Bucket creation error:', createError)
        return NextResponse.json(
          { error: `Error al crear el bucket de imágenes: ${createError.message}` },
          { status: 500 }
        )
      }
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const filePath = `products/${fileName}`

      const buffer = await file.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json(
          { error: `Error al subir ${file.name}: ${uploadError.message}` },
          { status: 500 }
        )
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath)

      uploadedUrls.push(publicUrlData.publicUrl)
    }

    return NextResponse.json({ urls: uploadedUrls }, { status: 200 })
  } catch (error) {
    console.error('Unexpected upload error:', error)
    return NextResponse.json({ error: 'Error interno al procesar la imagen' }, { status: 500 })
  }
}
