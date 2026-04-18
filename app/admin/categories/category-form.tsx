'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent } from '@/components/ui/card'
import { SignedImage } from '@/components/signed-image'
import { isRemoteUrl } from '@/lib/utils'
import type { Category } from '@/lib/types'

interface CategoryFormProps {
  category?: Category
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [name, setName] = useState(category?.name || '')
  const [description, setDescription] = useState(category?.description || '')
  const [coverImage, setCoverImage] = useState(category?.cover_image || '')
  const [coverImagePath, setCoverImagePath] = useState<string | null>(
    category?.cover_image && !isRemoteUrl(category.cover_image) ? category.cover_image : null,
  )

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }
      
      const data = await response.json()
      setCoverImage(data.url)
      setCoverImagePath(data.path || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [])

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
      const url = category ? `/api/categories/${category.id}` : '/api/categories'
      const method = category ? 'PATCH' : 'POST'
      const payloadCoverImage = coverImagePath || coverImage || null
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          cover_image: payloadCoverImage,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save category')
      }
      
      router.push('/admin/categories')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!coverImagePath || isRemoteUrl(coverImage)) {
      return
    }

    let canceled = false
    const path = coverImagePath

    async function resolvePreview() {
      try {
        const response = await fetch(
          `/api/storage/signed-url?path=${encodeURIComponent(path)}`,
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Unable to resolve cover preview')
        }

        if (!canceled && data.url) {
          setCoverImage(data.url)
        }
      } catch (err) {
        if (!canceled) {
          setError(err instanceof Error ? err.message : 'Unable to resolve cover preview')
        }
      }
    }

    resolvePreview()

    return () => {
      canceled = true
    }
  }, [coverImagePath, coverImage])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cover Image */}
      <Card>
        <CardContent className="pt-6">
          <FieldLabel className="mb-3">Cover Image (Optional)</FieldLabel>
          {coverImage ? (
            <div className="relative">
              <div className="relative aspect-[3/2] bg-muted rounded-lg overflow-hidden">
                <SignedImage
                  src={coverImage}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setCoverImage('')
                  setCoverImagePath(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="cover-upload"
                disabled={isUploading}
              />
              <label htmlFor="cover-upload" className="cursor-pointer">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Spinner className="h-8 w-8" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload a cover image
                    </p>
                  </div>
                )}
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
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
      </FieldGroup>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting || !name}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              Saving...
            </>
          ) : category ? (
            'Update Category'
          ) : (
            'Create Category'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
