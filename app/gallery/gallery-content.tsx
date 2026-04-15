'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PhotoGrid } from '@/components/photo-grid'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Photo, Category } from '@/lib/types'
import { cn } from '@/lib/utils'
import { LayoutGrid, Columns } from 'lucide-react'

interface GalleryContentProps {
  categories: Category[]
}

export function GalleryContent({ categories }: GalleryContentProps) {
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get('category')
  
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categorySlug)
  const [viewMode, setViewMode] = useState<'masonry' | 'grid'>('masonry')

  useEffect(() => {
    async function fetchPhotos() {
      setIsLoading(true)
      const supabase = createClient()
      
      let query = supabase
        .from('photos')
        .select('*, category:categories(*)')
        .eq('is_published', true)
        .order('display_order')

      if (selectedCategory) {
        const category = categories.find(c => c.slug === selectedCategory)
        if (category) {
          query = query.eq('category_id', category.id)
        }
      }

      const { data } = await query
      setPhotos(
        (data || []).map((photo: any) => ({
          ...photo,
          image_url: photo.image_url || photo.url || '',
        })),
      )
      setIsLoading(false)
    }

    fetchPhotos()
  }, [selectedCategory, categories])

  const handleCategoryChange = (slug: string | null) => {
    setSelectedCategory(slug)
    const url = new URL(window.location.href)
    if (slug) {
      url.searchParams.set('category', slug)
    } else {
      url.searchParams.delete('category')
    }
    window.history.pushState({}, '', url)
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1 border rounded-md p-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', viewMode === 'masonry' && 'bg-muted')}
            onClick={() => setViewMode('masonry')}
            aria-label="Masonry view"
          >
            <Columns className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', viewMode === 'grid' && 'bg-muted')}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Photo Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <PhotoGrid photos={photos} variant={viewMode} />
      )}
    </div>
  )
}
