import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PhotoForm } from '../photo-form'
import type { Photo, Category } from '@/lib/types'
import { normalizePhoto, resolvePhotoMediaUrls } from '@/lib/media'

async function getPhoto(id: string): Promise<Photo | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('photos')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single()

  if (!data) {
    return null
  }

  const [resolvedPhoto] = await resolvePhotoMediaUrls([normalizePhoto(data)])
  return resolvedPhoto || null
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
  const supabase = await createClient()
  const [rawPhotoResult, categories] = await Promise.all([
    supabase
      .from('photos')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single(),
    getCategories()
  ])

  const rawPhoto = rawPhotoResult.data
  const photo = rawPhoto ? await getPhoto(id) : null

  if (!photo) {
    notFound()
  }

  const initialImagePath = rawPhoto?.url || rawPhoto?.image_url || null

  return (
    <div className="space-y-6 pt-16 lg:pt-0 max-w-2xl">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Edit Photo</h1>
        <p className="text-muted-foreground mt-1">Update photo details</p>
      </div>

      <PhotoForm photo={photo} categories={categories} initialImagePath={initialImagePath} />
    </div>
  )
}
