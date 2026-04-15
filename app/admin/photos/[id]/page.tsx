import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PhotoForm } from '../photo-form'
import type { Photo, Category } from '@/lib/types'

function normalizePhoto(photo: any): Photo {
  return {
    ...photo,
    image_url: photo.image_url || photo.url || '',
  }
}

async function getPhoto(id: string): Promise<Photo | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('photos')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single()
  return data ? normalizePhoto(data) : null
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')
  return data || []
}

export default async function EditPhotoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [photo, categories] = await Promise.all([
    getPhoto(id),
    getCategories()
  ])

  if (!photo) {
    notFound()
  }

  return (
    <div className="space-y-6 pt-16 lg:pt-0 max-w-2xl">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Edit Photo</h1>
        <p className="text-muted-foreground mt-1">Update photo details</p>
      </div>

      <PhotoForm photo={photo} categories={categories} />
    </div>
  )
}
