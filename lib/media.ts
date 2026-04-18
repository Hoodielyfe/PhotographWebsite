import { createServiceClient } from '@/lib/supabase/service'
import type { Category, Photo } from '@/lib/types'
import { isRemoteUrl } from '@/lib/utils'
import {
  backfillPhotoDeliveryForPhotos,
  getPhotoDelivery,
  getPublicObjectUrl,
} from '@/lib/photo-delivery'

const STORAGE_BUCKET = 'photos'

export const SIGNED_URL_TTL_SECONDS = 60 * 60
export const SIGNED_URL_CACHE_SECONDS = 5 * 60

export function normalizePhoto(photo: any): Photo {
  const imageUrl = photo.image_url || photo.url || ''
  const delivery = getPhotoDelivery(photo.raw_metadata)

  return {
    ...photo,
    image_url: imageUrl,
    public_image_url: delivery
      ? getPublicObjectUrl(delivery.public_bucket, delivery.public_image_path) || undefined
      : undefined,
    public_thumbnail_url: delivery
      ? getPublicObjectUrl(delivery.public_bucket, delivery.public_thumbnail_path) || undefined
      : undefined,
  }
}

export function normalizeCategory(category: any): Category {
  return {
    ...category,
    cover_image: category.cover_image || category.cover_image_url || '',
  }
}

export function isStoragePath(src?: string | null): src is string {
  return typeof src === 'string' && src.length > 0 && !isRemoteUrl(src)
}

export function sanitizeStoragePath(path: string | null) {
  if (typeof path !== 'string') {
    return null
  }

  const normalizedPath = path.trim()

  if (
    !normalizedPath ||
    normalizedPath.startsWith('/') ||
    normalizedPath.includes('..') ||
    normalizedPath.includes('\\') ||
    normalizedPath.includes('\0') ||
    normalizedPath.includes('://') ||
    !normalizedPath.startsWith('photos/')
  ) {
    return null
  }

  return normalizedPath
}

async function createSignedUrlMap(paths: Array<string | undefined>) {
  const uniquePaths = [...new Set(paths.filter(isStoragePath))]

  if (uniquePaths.length === 0) {
    return new Map<string, string>()
  }

  const supabase = createServiceClient()
  const entries = await Promise.all(
    uniquePaths.map(async (path) => {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)

      if (error || !data?.signedUrl) {
        console.error('Failed to resolve signed URL for media path:', path, error)
        return [path, path] as const
      }

      return [path, data.signedUrl] as const
    }),
  )

  return new Map(entries)
}

export async function resolvePhotoMediaUrls(photos: Photo[]) {
  const normalizedPhotos = photos.map(normalizePhoto)
  const backfilledPhotos = await backfillPhotoDeliveryForPhotos(normalizedPhotos)

  const signedUrlMap = await createSignedUrlMap(
    backfilledPhotos.flatMap((photo) => {
      const imagePath = !photo.public_image_url && isStoragePath(photo.image_url) ? photo.image_url : undefined
      const thumbnailPath = !photo.public_thumbnail_url
        ? photo.thumbnail_url && isStoragePath(photo.thumbnail_url)
          ? photo.thumbnail_url
          : !photo.thumbnail_url && imagePath
            ? photo.image_url
            : undefined
        : undefined

      return [imagePath, thumbnailPath]
    }),
  )

  return backfilledPhotos.map((photo) => ({
    ...photo,
    image_url: photo.public_image_url || signedUrlMap.get(photo.image_url) || photo.image_url,
    thumbnail_url: photo.public_thumbnail_url
      || (photo.thumbnail_url ? signedUrlMap.get(photo.thumbnail_url) || photo.thumbnail_url : undefined)
      || photo.public_image_url
      || signedUrlMap.get(photo.image_url)
      || photo.image_url,
  }))
}

export async function resolveCategoryMediaUrls(categories: Category[]) {
  const signedUrlMap = await createSignedUrlMap(categories.map((category) => category.cover_image))

  return categories.map((category) => ({
    ...category,
    cover_image: category.cover_image
      ? signedUrlMap.get(category.cover_image) || category.cover_image
      : category.cover_image,
  }))
}