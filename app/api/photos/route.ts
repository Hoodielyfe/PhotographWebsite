import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    return NextResponse.json(data)
  } catch (error) {
    console.error('Photos API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, image_url, thumbnail_url, category_id, is_featured, is_published, metadata } = body

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

    const { data, error } = await supabase
      .from('photos')
      .insert({
        title,
        description: description || null,
        image_url,
        thumbnail_url: thumbnail_url || null,
        category_id: category_id || null,
        is_featured: is_featured || false,
        is_published: is_published !== false,
        display_order,
        metadata: metadata || null,
      })
      .select('*, category:categories(*)')
      .single()

    if (error) {
      console.error('Error creating photo:', error)
      return NextResponse.json({ error: 'Failed to create photo' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Photos POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
