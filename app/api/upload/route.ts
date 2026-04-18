import { type NextRequest, NextResponse } from 'next/server'
import { SIGNED_URL_TTL_SECONDS } from '@/lib/media'
import { extractPhotoMetadata } from '@/lib/photo-metadata'
import { createServiceClient } from '@/lib/supabase/service'
import { requireAdminUser } from '@/lib/server-auth'

type DetectedImageType = {
  extension: 'jpg' | 'png' | 'webp' | 'gif'
  mime: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
}

function detectImageType(bytes: Uint8Array): DetectedImageType | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: 'jpg', mime: 'image/jpeg' }
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { extension: 'png', mime: 'image/png' }
  }

  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return { extension: 'gif', mime: 'image/gif' }
  }

  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { extension: 'webp', mime: 'image/webp' }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    const formData = await request.formData()
    const fileEntry = formData.get('file')

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const file = fileEntry

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileHeaderBytes = new Uint8Array(fileBuffer.subarray(0, 16))
    const detectedFileType = detectImageType(fileHeaderBytes)

    if (!detectedFileType) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 },
      )
    }

    if (file.type && file.type !== detectedFileType.mime) {
      return NextResponse.json(
        { error: 'File type does not match the uploaded image contents.' },
        { status: 400 },
      )
    }

    const metadataPromise = extractPhotoMetadata(fileBuffer, {
      fileName: file.name,
      mimeType: detectedFileType.mime,
      fileSize: file.size,
    })

    // Generate unique filename
    const filename = `photos/${crypto.randomUUID()}.${detectedFileType.extension}`

    const uploadPromise = serviceSupabase.storage
      .from('photos')
      .upload(filename, fileBuffer, {
        cacheControl: '31536000',
        contentType: detectedFileType.mime,
        upsert: false,
      })

    const [{ data: uploadData, error: uploadError }, extractedMetadata] = await Promise.all([
      uploadPromise,
      metadataPromise,
    ])

    if (uploadError || !uploadData) {
      console.error('Supabase storage upload failed:', uploadError)
      return NextResponse.json(
        {
          error:
            uploadError?.message ||
            'Failed to upload file to Supabase storage. Make sure the photos bucket exists.',
        },
        { status: 500 }
      )
    }

    const { data: signedUrlData, error: signedUrlError } = await serviceSupabase.storage
      .from('photos')
      .createSignedUrl(uploadData.path, SIGNED_URL_TTL_SECONDS)

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('Supabase signed URL generation failed:', signedUrlError)
      return NextResponse.json(
        {
          error:
            signedUrlError?.message ||
            'Upload succeeded, but a signed preview URL could not be generated.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: signedUrlData.signedUrl,
      path: uploadData.path,
      extractedMetadata,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : JSON.stringify(error) },
      { status: 500 }
    )
  }
}
