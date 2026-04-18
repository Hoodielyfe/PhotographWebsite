import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function slugifyCategoryName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function normalizeCategory(category: any) {
  if (!category) return category

  return {
    ...category,
    cover_image: category.cover_image || category.cover_image_url || '',
  }
}

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

    return NextResponse.json((data || []).map(normalizeCategory))
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
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    const coverImage = typeof body.cover_image === 'string' ? body.cover_image.trim() : ''

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Generate slug from name
    const slug = slugifyCategoryName(name)

    if (!slug) {
      return NextResponse.json({ error: 'Name must contain letters or numbers' }, { status: 400 })
    }

    // Check if slug exists
    const { data: existing, error: existingError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existingError) {
      console.error('Error checking existing category:', existingError)
      return NextResponse.json({ error: 'Failed to validate category name' }, { status: 500 })
    }

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
        cover_image_url: coverImage || null,
        display_order,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 })
    }

    return NextResponse.json(normalizeCategory(data))
  } catch (error) {
    console.error('Categories POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
