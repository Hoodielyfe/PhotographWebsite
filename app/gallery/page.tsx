import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { GalleryContent } from './gallery-content'
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/types'

export const metadata = { title: 'Gallery' }

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
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">Gallery</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every frame tells a story
            </p>
          </div>
          <GalleryContent categories={categories} />
        </div>
      </main>
      <Footer />
    </>
  )
}