'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, isRemoteUrl } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent } from '@/components/ui/card'
import type { Photo, Category, PhotoMetadata } from '@/lib/types'

type UploadExtraction = {
  metadata?: PhotoMetadata | null
  raw_metadata?: Record<string, unknown> | null
  width?: number | null
  height?: number | null
  taken_at?: string | null
}

const VISIBLE_METADATA_KEYS = new Set([
  'camera',
  'lens',
  'aperture',
  'shutter_speed',
  'iso',
  'location',
])

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  return true
}

function mergeMetadata(current: PhotoMetadata | null | undefined, extracted: PhotoMetadata | null | undefined): PhotoMetadata {
  const nextMetadata: PhotoMetadata = { ...(current || {}) }

  for (const [key, value] of Object.entries(extracted || {})) {
    if (!hasValue(value)) {
      continue
    }

    const metadataKey = key as keyof PhotoMetadata
    const currentValue = nextMetadata[metadataKey]

    if (VISIBLE_METADATA_KEYS.has(key)) {
      if (!hasValue(currentValue)) {
        nextMetadata[metadataKey] = value as never
      }
      continue
    }

    nextMetadata[metadataKey] = value as never
  }

  return nextMetadata
}

function buildCameraInfo(metadata: PhotoMetadata | null | undefined): string | null {
  const parts = [metadata?.camera, metadata?.lens].filter(
    (value): value is string => Boolean(value && value.trim()),
  )

  return parts.length > 0 ? parts.join(' | ') : null
}

interface PhotoFormProps {
  photo?: Photo
  categories: Category[]
  initialImagePath?: string | null
}

export function PhotoForm({ photo, categories, initialImagePath = null }: PhotoFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [uploadPath, setUploadPath] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [title, setTitle] = useState(photo?.title || '')
  const [description, setDescription] = useState(photo?.description || '')
  const [imageUrl, setImageUrl] = useState(photo?.image_url || '')
  const [imagePath, setImagePath] = useState<string | null>(initialImagePath)
  const [categoryId, setCategoryId] = useState(photo?.category_id || '')
  const [isFeatured, setIsFeatured] = useState(photo?.is_featured || false)
  const [isPublished, setIsPublished] = useState(photo?.is_published !== false)
  const [metadata, setMetadata] = useState<Photo['metadata']>(photo?.metadata || {})
  const [rawMetadata, setRawMetadata] = useState<Record<string, unknown> | null>(
    photo?.raw_metadata || null,
  )
  const [width, setWidth] = useState<number | null>(photo?.width ?? null)
  const [height, setHeight] = useState<number | null>(photo?.height ?? null)
  const [takenAt, setTakenAt] = useState<string | null>(photo?.taken_at ?? null)

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true)
    setUploadStatus(`Uploading ${file.name}...`)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      if (!data?.url) {
        throw new Error(
          data.error || 'Upload succeeded but no image URL was returned.'
        )
      }

      setImageUrl(data.url)
      setUploadPath(data.path || null)

      const extractedMetadata = data?.extractedMetadata as UploadExtraction | undefined
      if (extractedMetadata?.metadata) {
        setMetadata((currentMetadata) =>
          mergeMetadata(currentMetadata || {}, extractedMetadata.metadata || {}),
        )
      }

      if (extractedMetadata?.raw_metadata) {
        setRawMetadata(extractedMetadata.raw_metadata)
      }

      if (typeof extractedMetadata?.width === 'number') {
        setWidth(extractedMetadata.width)
      }

      if (typeof extractedMetadata?.height === 'number') {
        setHeight(extractedMetadata.height)
      }

      if (extractedMetadata?.taken_at) {
        setTakenAt(extractedMetadata.taken_at)
      }

      const metadataExtracted = Boolean(
        extractedMetadata?.metadata && Object.keys(extractedMetadata.metadata).length > 0,
      )

      setUploadStatus(
        metadataExtracted ? 'Upload complete. Metadata extracted automatically.' : 'Upload complete!',
      )

      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        setTitle(nameWithoutExt.replace(/[-_]/g, ' '))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploadStatus('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [title])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleUpload(file)
    }
  }, [handleUpload])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const url = photo ? `/api/photos/${photo.id}` : '/api/photos'
      const method = photo ? 'PATCH' : 'POST'
      const payloadImageUrl = uploadPath || imagePath || imageUrl
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null,
          image_url: payloadImageUrl,
          category_id:
            categoryId && categoryId !== 'uncategorized' ? categoryId : null,
          is_featured: isFeatured,
          is_published: isPublished,
          metadata: Object.keys(metadata || {}).length > 0 ? metadata : null,
          raw_metadata: rawMetadata,
          width,
          height,
          taken_at: takenAt,
          location: metadata?.location || null,
          camera_info: buildCameraInfo(metadata),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save photo')
      }

      router.push('/admin/photos')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save photo')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!imagePath || isRemoteUrl(imageUrl)) {
      return
    }

    let canceled = false

    const path = imagePath

    async function resolvePreview() {
      try {
        const response = await fetch(
          `/api/storage/signed-url?path=${encodeURIComponent(path)}`,
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Unable to resolve image preview')
        }

        if (!canceled) {
          setImageUrl(data.url)
        }
      } catch (err) {
        if (!canceled) {
          setError(err instanceof Error ? err.message : 'Unable to resolve image preview')
        }
      }
    }

    resolvePreview()

    return () => {
      canceled = true
    }
  }, [imagePath, imageUrl])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <Card>
        <CardContent className="pt-6">
          {imageUrl ? (
            <div className="relative">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42rem"
                  className="object-contain"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setImageUrl('')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
                disabled={isUploading}
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Spinner className="h-8 w-8" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drop an image here or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, WebP, GIF up to 10MB
                    </p>
                  </div>
                )}
              </label>
              {uploadStatus ? (
                <div className="mt-3 text-left">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isUploading ? 'text-foreground' : 'text-foreground/80',
                    )}
                  >
                    {uploadStatus}
                  </p>
                  {uploadPath ? (
                    <p className="text-xs text-muted-foreground mt-1 break-all">
                      Storage path: {uploadPath}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Photo title"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="category">Category</FieldLabel>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field className="flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3">
            <div>
              <FieldLabel htmlFor="featured" className="text-base">Featured</FieldLabel>
              <FieldDescription>Show on homepage</FieldDescription>
            </div>
            <Switch
              id="featured"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
          </Field>

          <Field className="flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3">
            <div>
              <FieldLabel htmlFor="published" className="text-base">Published</FieldLabel>
              <FieldDescription>Visible in gallery</FieldDescription>
            </div>
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </Field>
        </div>
      </FieldGroup>

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Photo Metadata (Optional)</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="camera">Camera</FieldLabel>
              <Input
                id="camera"
                value={metadata?.camera || ''}
                onChange={(e) => setMetadata({ ...metadata, camera: e.target.value })}
                placeholder="e.g., Sony A7R V"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="lens">Lens</FieldLabel>
              <Input
                id="lens"
                value={metadata?.lens || ''}
                onChange={(e) => setMetadata({ ...metadata, lens: e.target.value })}
                placeholder="e.g., 24-70mm f/2.8"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="aperture">Aperture</FieldLabel>
              <Input
                id="aperture"
                value={metadata?.aperture || ''}
                onChange={(e) => setMetadata({ ...metadata, aperture: e.target.value })}
                placeholder="e.g., 2.8"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="shutter">Shutter Speed</FieldLabel>
              <Input
                id="shutter"
                value={metadata?.shutter_speed || ''}
                onChange={(e) => setMetadata({ ...metadata, shutter_speed: e.target.value })}
                placeholder="e.g., 1/250"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="iso">ISO</FieldLabel>
              <Input
                id="iso"
                type="number"
                value={metadata?.iso?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value
                  setMetadata({
                    ...metadata,
                    iso: value ? Number(value) : undefined,
                  })
                }}
                placeholder="e.g., 400"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="location">Location</FieldLabel>
              <Input
                id="location"
                value={metadata?.location || ''}
                onChange={(e) => setMetadata({ ...metadata, location: e.target.value })}
                placeholder="e.g., New York City"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting || !imageUrl || !title}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              Saving...
            </>
          ) : photo ? (
            'Update Photo'
          ) : (
            'Add Photo'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
