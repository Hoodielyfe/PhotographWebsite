import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

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

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Confirm the storage bucket exists before uploading
    const { data: bucketInfo, error: bucketInfoError } = await serviceSupabase.storage.getBucket('photos')
    if (bucketInfoError || !bucketInfo) {
      console.error('Supabase storage bucket check failed:', bucketInfoError)
      return NextResponse.json(
        {
          error:
            bucketInfoError?.message ||
            "Supabase storage bucket 'photos' was not found. Create a bucket named 'photos' in your Supabase project.",
        },
        { status: 500 },
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() ?? 'jpg'
    const filename = `photos/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`

    const { data: uploadData, error: uploadError } = await serviceSupabase.storage
      .from('photos')
      .upload(filename, file, {
        contentType: file.type,
      })

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
      .createSignedUrl(uploadData.path, 3600)

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
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : JSON.stringify(error) },
      { status: 500 }
    )
  }
}
