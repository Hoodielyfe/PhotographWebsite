import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizePhoto } from '@/lib/media'
import { ensurePhotoDeliveryForPhoto } from '@/lib/photo-delivery'
import { requireAdminUser } from '@/lib/server-auth'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('photos')
      .select('*, category:categories(*)')
      .order('display_order')

    if (error) {
      console.error('Error fetching photos:', error)
      return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
    }

    return NextResponse.json((data || []).map(normalizePhoto))
  } catch (error) {
    console.error('Photos API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    const body = await request.json()
    const {
      title,
      description,
      image_url,
      thumbnail_url,
      category_id,
      is_featured,
      is_published,
      metadata,
      raw_metadata,
      width,
      height,
      taken_at,
      location,
      camera_info,
    } = body

    if (!title || !image_url) {
      return NextResponse.json(
        { error: 'Title and image URL are required' },
        { status: 400 }
      )
    }

    // Get the next display order
    const { data: lastPhoto } = await supabase
      .from('photos')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const display_order = (lastPhoto?.display_order || 0) + 1

    const payload: Record<string, unknown> = {
      title,
      description: description || null,
      url: image_url,
      thumbnail_url: thumbnail_url || null,
      category_id: category_id || null,
      is_featured: is_featured || false,
      is_published: is_published !== false,
      display_order,
      width: width || null,
      height: height || null,
      taken_at: taken_at || null,
      location: location || null,
      camera_info: camera_info || null,
      metadata: metadata && Object.keys(metadata).length > 0 ? metadata : null,
      raw_metadata:
        raw_metadata && Object.keys(raw_metadata).length > 0 ? raw_metadata : null,
    }

    const { data, error } = await supabase
      .from('photos')
      .insert(payload)
      .select('*, category:categories(*)')
      .single()

    if (error) {
      console.error('Photos POST payload:', payload)
      console.error('Error creating photo:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create photo' },
        { status: 500 }
      )
    }

    let responsePhoto = normalizePhoto(data)

    try {
      responsePhoto = normalizePhoto(await ensurePhotoDeliveryForPhoto(responsePhoto))
    } catch (deliveryError) {
      console.error('Error syncing public delivery after photo creation:', deliveryError)
    }

    return NextResponse.json(responsePhoto)
  } catch (error) {
    console.error('Photos POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
