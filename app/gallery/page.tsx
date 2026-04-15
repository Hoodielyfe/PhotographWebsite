import { Suspense } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { GalleryContent } from './gallery-content'
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/types'

export const metadata = {
  title: 'Gallery',
  description: 'Browse our complete photography collection across all categories.',
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')
  return data || []
}

export default async function GalleryPage() {
  const categories = await getCategories()

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">Gallery</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our complete collection of photography work
            </p>
          </div>
          <Suspense fallback={<GalleryLoading />}>
            <GalleryContent categories={categories} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}

function GalleryLoading() {
  return (
    <div className="space-y-8">
      <div className="flex justify-center gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  )
}
