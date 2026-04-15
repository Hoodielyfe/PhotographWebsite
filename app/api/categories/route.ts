import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order')

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Categories API error:', error)
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
    const { name, description, cover_image } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check if slug exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 })
    }

    // Get the next display order
    const { data: lastCategory } = await supabase
      .from('categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const display_order = (lastCategory?.display_order || 0) + 1

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        description: description || null,
        cover_image: cover_image || null,
        display_order,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Categories POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
