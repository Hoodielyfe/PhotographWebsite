import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { PhotosTable } from './photos-table'
import type { Photo, Category } from '@/lib/types'

function normalizePhoto(photo: any): Photo {
  return {
    ...photo,
    image_url: photo.image_url || photo.url || '',
  }
}

async function getPhotos(): Promise<Photo[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('photos')
    .select('*, category:categories(*)')
    .order('display_order')
  return (data || []).map(normalizePhoto)
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')
  return data || []
}

export default async function PhotosPage() {
  const [photos, categories] = await Promise.all([
    getPhotos(),
    getCategories()
  ])

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold">Photos</h1>
          <p className="text-muted-foreground mt-1">Manage your photo gallery</p>
        </div>
        <Button asChild>
          <Link href="/admin/photos/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Photo
          </Link>
        </Button>
      </div>

      <PhotosTable photos={photos} categories={categories} />
    </div>
  )
}
