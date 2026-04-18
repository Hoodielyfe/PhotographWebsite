'use client'

import { useEffect, useCallback, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Photo } from '@/lib/types'
import { PublicImageFrame } from '@/components/public-image-frame'
import { SignedImage } from '@/components/signed-image'
import { cn } from '@/lib/utils'

interface LightboxProps {
  photos: Photo[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function Lightbox({ photos, currentIndex, onClose, onNavigate }: LightboxProps) {
  const [showInfo, setShowInfo] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const photo = photos[currentIndex]

  const handlePrev = useCallback(() => {
    setIsLoaded(false)
    onNavigate(currentIndex > 0 ? currentIndex - 1 : photos.length - 1)
  }, [currentIndex, photos.length, onNavigate])

  const handleNext = useCallback(() => {
    setIsLoaded(false)
    onNavigate(currentIndex < photos.length - 1 ? currentIndex + 1 : 0)
  }, [currentIndex, photos.length, onNavigate])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'i') setShowInfo(!showInfo)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handlePrev, handleNext, onClose, showInfo])

  return (
    <div className="fixed inset-0 z-50 bg-black/95 animate-fade-in-scale">
      {/* Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <span className="text-white/70 text-sm">
          {currentIndex + 1} / {photos.length}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowInfo(!showInfo)}
            className="text-white hover:bg-white/10"
            aria-label="Toggle photo info"
          >
            <Info className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      {photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12"
            aria-label="Next photo"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Image */}
      <div className="h-full w-full flex items-center justify-center p-16">
        <div className="relative max-h-full max-w-full" onContextMenu={(event) => event.preventDefault()}>
          <PublicImageFrame>
            <SignedImage
              src={photo.image_url}
              alt={photo.title}
              width={1920}
              height={1080}
              loading="eager"
              className={cn(
                'max-h-[calc(100vh-8rem)] w-auto object-contain transition-opacity duration-300',
                isLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setIsLoaded(true)}
            />
          </PublicImageFrame>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-6 animate-fade-in">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-white text-xl font-serif mb-2">{photo.title}</h2>
            {photo.description && (
              <p className="text-white/70 text-sm mb-4">{photo.description}</p>
            )}
            {photo.metadata && (
              <div className="flex flex-wrap gap-4 text-xs text-white/50">
                {photo.metadata.camera && (
                  <span>Camera: {photo.metadata.camera}</span>
                )}
                {photo.metadata.lens && (
                  <span>Lens: {photo.metadata.lens}</span>
                )}
                {photo.metadata.aperture && (
                  <span>f/{photo.metadata.aperture}</span>
                )}
                {photo.metadata.shutter_speed && (
                  <span>{photo.metadata.shutter_speed}s</span>
                )}
                {photo.metadata.iso && (
                  <span>ISO {photo.metadata.iso}</span>
                )}
                {photo.metadata.location && (
                  <span>{photo.metadata.location}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
