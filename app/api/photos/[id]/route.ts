import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function normalizePhoto(photo: any) {
  if (!photo) return photo

  return {
    ...photo,
    image_url: photo.image_url || photo.url || '',
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('photos')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    return NextResponse.json(normalizePhoto(data))
  } catch (error) {
    console.error('Photo GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, image_url, thumbnail_url, category_id, is_featured, is_published, display_order, metadata } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (image_url !== undefined) updateData.url = image_url
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url
    if (category_id !== undefined) updateData.category_id = category_id
    if (is_featured !== undefined) updateData.is_featured = is_featured
    if (is_published !== undefined) updateData.is_published = is_published
    if (display_order !== undefined) updateData.display_order = display_order
    if (metadata !== undefined && Object.keys(metadata || {}).length > 0) updateData.metadata = metadata

    const { data, error } = await supabase
      .from('photos')
      .update(updateData)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single()

    if (error) {
      console.error('Error updating photo:', error)
      return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 })
    }

    return NextResponse.json(normalizePhoto(data))
  } catch (error) {
    console.error('Photo PATCH API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting photo:', error)
      return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Photo DELETE API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
