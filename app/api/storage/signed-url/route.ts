import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get('path')

    if (!path) {
      return NextResponse.json({ error: 'Missing path query parameter' }, { status: 400 })
    }

    if (!path.startsWith('photos/')) {
      return NextResponse.json(
        { error: 'Invalid path. Only uploads from the photos bucket are allowed.' },
        { status: 400 },
      )
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase.storage
      .from('photos')
      .createSignedUrl(path, 3600)

    if (error || !data?.signedUrl) {
      console.error('Signed URL generation error:', error)
      return NextResponse.json(
        { error: error?.message || 'Failed to generate signed URL' },
        { status: 500 },
      )
    }

    return NextResponse.json({ url: data.signedUrl })
  } catch (error) {
    console.error('Signed URL route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
