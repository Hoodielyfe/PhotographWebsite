'use client'

import { useSearchParams } from 'next/navigation'
import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import { PhotoGrid } from '@/components/photo-grid'
import { Button } from '@/components/ui/button'
import type { Photo, Category } from '@/lib/types'
import { cn } from '@/lib/utils'
import { LayoutGrid, Columns } from 'lucide-react'

interface GalleryContentProps {
  categories: Category[]
  photos: Photo[]
}

export function GalleryContent({ categories, photos }: GalleryContentProps) {
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get('category')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categorySlug)
  const [viewMode, setViewMode] = useState<'masonry' | 'grid'>('masonry')
  const deferredSelectedCategory = useDeferredValue(selectedCategory)

  useEffect(() => {
    setSelectedCategory(categorySlug)
  }, [categorySlug])

  const hasMatchingCategory = deferredSelectedCategory
    ? categories.some((category) => category.slug === deferredSelectedCategory)
    : false

  const visiblePhotos = hasMatchingCategory
    ? photos.filter((photo) => photo.category?.slug === deferredSelectedCategory)
    : photos

  const handleCategoryChange = (slug: string | null) => {
    startTransition(() => {
      setSelectedCategory(slug)
      const url = new URL(window.location.href)

      if (slug) {
        url.searchParams.set('category', slug)
      } else {
        url.searchParams.delete('category')
      }

      window.history.pushState({}, '', url)
    })
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
      {selectedCategory !== deferredSelectedCategory ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-4 lg:gap-5">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <PhotoGrid photos={visiblePhotos} variant={viewMode} />
      )}
    </div>
  )
}
