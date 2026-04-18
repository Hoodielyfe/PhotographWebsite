'use client'

import { useState } from 'react'
import type { Photo } from '@/lib/types'
import { Lightbox } from '@/components/lightbox'
import { SignedImage } from '@/components/signed-image'
import { PublicImageFrame } from '@/components/public-image-frame'
import { cn } from '@/lib/utils'

interface PhotoGridProps {
  photos: Photo[]
  variant?: 'masonry' | 'grid'
}

export function PhotoGrid({ photos, variant = 'masonry' }: PhotoGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const eagerImageCount = 4

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">No photos available yet.</p>
      </div>
    )
  }

  return (
    <>
      {variant === 'masonry' ? (
        <div className="masonry-grid w-full">
          {photos.map((photo, index) => (
            <PhotoItem
              key={photo.id}
              photo={photo}
              onClick={() => setSelectedIndex(index)}
              variant="masonry"
              loading={index < eagerImageCount ? 'eager' : 'lazy'}
            />
          ))}
        </div>
      ) : (
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-4 lg:gap-5">
          {photos.map((photo, index) => (
            <PhotoItem
              key={photo.id}
              photo={photo}
              onClick={() => setSelectedIndex(index)}
              variant="grid"
              loading={index < eagerImageCount ? 'eager' : 'lazy'}
            />
          ))}
        </div>
      )}

      {selectedIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={setSelectedIndex}
        />
      )}
    </>
  )
}

interface PhotoItemProps {
  photo: Photo
  onClick: () => void
  variant: 'masonry' | 'grid'
  loading: 'eager' | 'lazy'
}

function PhotoItem({ photo, onClick, variant, loading }: PhotoItemProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <button
      onClick={onClick}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
      className={cn(
        'group relative overflow-hidden bg-muted cursor-pointer w-full text-left',
        variant === 'masonry' ? 'masonry-item' : 'aspect-[4/3]'
      )}
      aria-label={`View ${photo.title}`}
    >
      <PublicImageFrame className="h-full w-full">
        <SignedImage
          src={photo.thumbnail_url || photo.image_url}
          alt={photo.title}
          width={800}
          height={600}
          loading={loading}
          className={cn(
            'w-full h-auto object-cover transition-all duration-500',
            'group-hover:scale-105',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setIsLoaded(true)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </PublicImageFrame>
      
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
        <div className="p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
          <h3 className="text-white font-medium text-sm truncate">{photo.title}</h3>
          {photo.category && (
            <p className="text-white/70 text-xs mt-1">{photo.category.name}</p>
          )}
        </div>
      </div>

      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </button>
  )
}
