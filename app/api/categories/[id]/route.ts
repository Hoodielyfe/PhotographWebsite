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
    const name = typeof body.name === 'string' ? body.name.trim() : undefined
    const description = typeof body.description === 'string' ? body.description.trim() : body.description
    const coverImage = typeof body.cover_image === 'string' ? body.cover_image.trim() : body.cover_image

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) {
      if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 })
      }

      const slug = slugifyCategoryName(name)

      if (!slug) {
        return NextResponse.json({ error: 'Name must contain letters or numbers' }, { status: 400 })
      }

      const { data: duplicate, error: duplicateError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .maybeSingle()

      if (duplicateError) {
        console.error('Error checking duplicate category:', duplicateError)
        return NextResponse.json({ error: 'Failed to validate category name' }, { status: 500 })
      }

      if (duplicate) {
        return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 })
      }

      updateData.name = name
      updateData.slug = slug
    }
    if (description !== undefined) updateData.description = description
    if (coverImage !== undefined) updateData.cover_image_url = coverImage

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 })
    }

    return NextResponse.json(normalizeCategory(data))
  } catch (error) {
    console.error('Category PATCH API error:', error)
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

    // Set photos in this category to uncategorized
    const { error: photoUpdateError } = await supabase
      .from('photos')
      .update({ category_id: null })
      .eq('category_id', id)

    if (photoUpdateError) {
      console.error('Error clearing category from photos:', photoUpdateError)
      return NextResponse.json({ error: 'Failed to remove category from existing photos' }, { status: 500 })
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Category DELETE API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
