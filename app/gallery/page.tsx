import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { GalleryContent } from './gallery-content'
import {
  normalizeCategory,
  normalizePhoto,
  resolveCategoryMediaUrls,
  resolvePhotoMediaUrls,
} from '@/lib/media'
import { createClient } from '@/lib/supabase/server'
import type { Category, Photo } from '@/lib/types'

export const metadata = { title: 'Gallery' }

async function getGalleryData(): Promise<{ categories: Category[]; photos: Photo[] }> {
  const supabase = await createClient()
  const [categoriesResult, photosResult] = await Promise.all([
    supabase.from('categories').select('*').order('display_order'),
    supabase
      .from('photos')
      .select('*, category:categories(*)')
      .eq('is_published', true)
      .order('display_order'),
  ])

  const [categories, photos] = await Promise.all([
    resolveCategoryMediaUrls((categoriesResult.data || []).map(normalizeCategory)),
    resolvePhotoMediaUrls((photosResult.data || []).map(normalizePhoto)),
  ])

  return { categories, photos }
}

export default async function GalleryPage() {
  const { categories, photos } = await getGalleryData()

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-24 pb-16 px-2 sm:px-3 lg:px-4 xl:px-5 2xl:px-6">
        <div className="mx-auto w-full">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">Gallery</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every frame tells a story
            </p>
          </div>
          <GalleryContent categories={categories} photos={photos} />
        </div>
      </main>
      <Footer />
    </>
  )
}