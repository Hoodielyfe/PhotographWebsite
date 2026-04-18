import { NextRequest, NextResponse } from 'next/server'
import { SIGNED_URL_CACHE_SECONDS, SIGNED_URL_TTL_SECONDS, sanitizeStoragePath } from '@/lib/media'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { userHasAdminRole } from '@/lib/auth'

async function canAccessPath(request: NextRequest, path: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (userHasAdminRole(user)) {
    return true
  }

  const [photoByUrl, photoByThumbnail, categoryByCoverImage] = await Promise.all([
    supabase
      .from('photos')
      .select('id')
      .eq('is_published', true)
      .eq('url', path)
      .maybeSingle(),
    supabase
      .from('photos')
      .select('id')
      .eq('is_published', true)
      .eq('thumbnail_url', path)
      .maybeSingle(),
    supabase
      .from('categories')
      .select('id')
      .eq('cover_image_url', path)
      .maybeSingle(),
  ])

  return Boolean(
    photoByUrl.data || photoByThumbnail.data || categoryByCoverImage.data,
  )
}

export async function GET(request: NextRequest) {
  try {
    const path = sanitizeStoragePath(request.nextUrl.searchParams.get('path'))

    if (!path) {
      return NextResponse.json({ error: 'Missing path query parameter' }, { status: 400 })
    }

    const accessAllowed = await canAccessPath(request, path)
    if (!accessAllowed) {
      return NextResponse.json(
        { error: 'You do not have access to this asset.' },
        { status: 403 },
      )
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase.storage
      .from('photos')
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)

    if (error || !data?.signedUrl) {
      console.error('Signed URL generation error:', error)
      return NextResponse.json(
        { error: error?.message || 'Failed to generate signed URL' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { url: data.signedUrl },
      {
        headers: {
          'Cache-Control': `private, max-age=${SIGNED_URL_CACHE_SECONDS}, stale-while-revalidate=${SIGNED_URL_CACHE_SECONDS * 2}`,
        },
      },
    )
  } catch (error) {
    console.error('Signed URL route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
