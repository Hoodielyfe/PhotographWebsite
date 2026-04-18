import { createHash } from 'node:crypto'
import sharp from 'sharp'
import type { Photo } from '@/lib/types'
import { createServiceClient } from '@/lib/supabase/service'

const PRIVATE_BUCKET = 'photos'
const PUBLIC_BUCKET = 'public-photos'
const DELIVERY_METADATA_KEY = '__delivery'
const DISPLAY_MAX_WIDTH = 2560
const THUMBNAIL_MAX_WIDTH = 960
const DISPLAY_QUALITY = 88
const THUMBNAIL_QUALITY = 78
const PUBLIC_CACHE_CONTROL = '31536000'
const BACKFILL_CONCURRENCY = 2

type RawMetadata = Record<string, unknown>

export interface PhotoDeliveryMetadata {
  source_path: string
  public_bucket: string
  public_image_path: string
  public_thumbnail_path: string
  generated_at: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function isPrivateStoragePath(path: string | null | undefined) {
  return typeof path === 'string' && path.startsWith(`${PRIVATE_BUCKET}/`)
}

function encodeStoragePath(path: string) {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function buildVersionHash(sourcePath: string) {
  return createHash('sha1').update(sourcePath).digest('hex').slice(0, 12)
}

function buildDerivativePaths(photoId: string, sourcePath: string) {
  const versionHash = buildVersionHash(sourcePath)

  return {
    publicImagePath: `photos/${photoId}/${versionHash}/display.webp`,
    publicThumbnailPath: `photos/${photoId}/${versionHash}/thumbnail.webp`,
  }
}

function withPhotoDelivery(
  rawMetadata: Record<string, unknown> | null | undefined,
  delivery: PhotoDeliveryMetadata | null,
) {
  const nextMetadata: RawMetadata = isRecord(rawMetadata) ? { ...rawMetadata } : {}

  if (delivery) {
    nextMetadata[DELIVERY_METADATA_KEY] = delivery
  } else {
    delete nextMetadata[DELIVERY_METADATA_KEY]
  }

  return Object.keys(nextMetadata).length > 0 ? nextMetadata : null
}

export function getPhotoDelivery(rawMetadata: Record<string, unknown> | null | undefined) {
  if (!isRecord(rawMetadata)) {
    return null
  }

  const delivery = rawMetadata[DELIVERY_METADATA_KEY]
  if (!isRecord(delivery)) {
    return null
  }

  const sourcePath = typeof delivery.source_path === 'string' ? delivery.source_path : null
  const publicBucket = typeof delivery.public_bucket === 'string' ? delivery.public_bucket : null
  const publicImagePath =
    typeof delivery.public_image_path === 'string' ? delivery.public_image_path : null
  const publicThumbnailPath =
    typeof delivery.public_thumbnail_path === 'string'
      ? delivery.public_thumbnail_path
      : null
  const generatedAt = typeof delivery.generated_at === 'string' ? delivery.generated_at : null

  if (!sourcePath || !publicBucket || !publicImagePath || !publicThumbnailPath || !generatedAt) {
    return null
  }

  return {
    source_path: sourcePath,
    public_bucket: publicBucket,
    public_image_path: publicImagePath,
    public_thumbnail_path: publicThumbnailPath,
    generated_at: generatedAt,
  } satisfies PhotoDeliveryMetadata
}

export function getPublicObjectUrl(bucket: string, objectPath: string) {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!projectUrl) {
    return null
  }

  const baseUrl = projectUrl.replace(/\/$/, '')
  return `${baseUrl}/storage/v1/object/public/${encodeStoragePath(bucket)}/${encodeStoragePath(objectPath)}`
}

let ensurePublicBucketPromise: Promise<void> | null = null

async function ensurePublicBucket() {
  if (ensurePublicBucketPromise) {
    return ensurePublicBucketPromise
  }

  ensurePublicBucketPromise = (async () => {
    const supabase = createServiceClient()
    const { data: bucket, error: getBucketError } = await supabase.storage.getBucket(PUBLIC_BUCKET)

    if (bucket) {
      return
    }

    if (getBucketError) {
      console.warn('Public photos bucket lookup failed, attempting creation:', getBucketError)
    }

    const { error: createBucketError } = await supabase.storage.createBucket(PUBLIC_BUCKET, {
      public: true,
      fileSizeLimit: '20MB',
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    })

    if (createBucketError && !/already exists/i.test(createBucketError.message)) {
      throw createBucketError
    }
  })()

  return ensurePublicBucketPromise
}

async function uploadDerivative(path: string, buffer: Buffer) {
  const supabase = createServiceClient()
  const { error } = await supabase.storage.from(PUBLIC_BUCKET).upload(path, buffer, {
    cacheControl: PUBLIC_CACHE_CONTROL,
    contentType: 'image/webp',
    upsert: false,
  })

  if (error && !/already exists/i.test(error.message)) {
    throw error
  }
}

async function removeDeliveryAssets(delivery: PhotoDeliveryMetadata | null) {
  if (!delivery) {
    return
  }

  const supabase = createServiceClient()
  const { error } = await supabase.storage
    .from(delivery.public_bucket)
    .remove([delivery.public_image_path, delivery.public_thumbnail_path])

  if (error) {
    console.error('Failed to remove public derivative assets:', error)
  }
}

async function persistRawMetadata(photoId: string, rawMetadata: Record<string, unknown> | null) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('photos')
    .update({ raw_metadata: rawMetadata })
    .eq('id', photoId)

  if (error) {
    throw error
  }
}

async function generateDeliveryMetadata(photoId: string, sourcePath: string) {
  await ensurePublicBucket()

  const supabase = createServiceClient()
  const { data, error } = await supabase.storage.from(PRIVATE_BUCKET).download(sourcePath)

  if (error || !data) {
    throw error || new Error('Failed to download private photo for derivative generation')
  }

  const sourceBuffer = Buffer.from(await data.arrayBuffer())
  const [displayBuffer, thumbnailBuffer] = await Promise.all([
    sharp(sourceBuffer)
      .rotate()
      .resize({ width: DISPLAY_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: DISPLAY_QUALITY })
      .toBuffer(),
    sharp(sourceBuffer)
      .rotate()
      .resize({ width: THUMBNAIL_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMBNAIL_QUALITY })
      .toBuffer(),
  ])

  const { publicImagePath, publicThumbnailPath } = buildDerivativePaths(photoId, sourcePath)

  await Promise.all([
    uploadDerivative(publicImagePath, displayBuffer),
    uploadDerivative(publicThumbnailPath, thumbnailBuffer),
  ])

  return {
    source_path: sourcePath,
    public_bucket: PUBLIC_BUCKET,
    public_image_path: publicImagePath,
    public_thumbnail_path: publicThumbnailPath,
    generated_at: new Date().toISOString(),
  } satisfies PhotoDeliveryMetadata
}

export async function ensurePhotoDeliveryForPhoto(photo: Photo) {
  const currentDelivery = getPhotoDelivery(photo.raw_metadata)
  const shouldHavePublicDelivery = Boolean(photo.is_published && isPrivateStoragePath(photo.image_url))

  if (!shouldHavePublicDelivery) {
    if (!currentDelivery) {
      return photo
    }

    await removeDeliveryAssets(currentDelivery)
    const nextRawMetadata = withPhotoDelivery(photo.raw_metadata, null)
    await persistRawMetadata(photo.id, nextRawMetadata)

    return {
      ...photo,
      raw_metadata: nextRawMetadata,
    }
  }

  if (currentDelivery?.source_path === photo.image_url) {
    return photo
  }

  const nextDelivery = await generateDeliveryMetadata(photo.id, photo.image_url)

  if (currentDelivery && currentDelivery.source_path !== photo.image_url) {
    await removeDeliveryAssets(currentDelivery)
  }

  const nextRawMetadata = withPhotoDelivery(photo.raw_metadata, nextDelivery)
  await persistRawMetadata(photo.id, nextRawMetadata)

  return {
    ...photo,
    raw_metadata: nextRawMetadata,
  }
}

async function runWithConcurrency<T>(items: T[], worker: (item: T) => Promise<void>) {
  const queue = [...items]

  const runners = Array.from({ length: Math.min(BACKFILL_CONCURRENCY, items.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()

      if (!item) {
        return
      }

      await worker(item)
    }
  })

  await Promise.all(runners)
}

export async function backfillPhotoDeliveryForPhotos(photos: Photo[]) {
  const nextPhotos = [...photos]
  const indexById = new Map(nextPhotos.map((photo, index) => [photo.id, index]))
  const candidates = nextPhotos.filter(
    (photo) => photo.is_published && isPrivateStoragePath(photo.image_url) && !getPhotoDelivery(photo.raw_metadata),
  )

  if (candidates.length === 0) {
    return nextPhotos
  }

  await runWithConcurrency(candidates, async (photo) => {
    try {
      const updatedPhoto = await ensurePhotoDeliveryForPhoto(photo)
      const index = indexById.get(photo.id)

      if (index !== undefined) {
        nextPhotos[index] = updatedPhoto
      }
    } catch (error) {
      console.error('Failed to backfill public photo delivery:', photo.id, error)
    }
  })

  return nextPhotos
}

export async function backfillPublishedPhotoDelivery() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  const photos = (data || []) as Photo[]
  let processed = 0
  let generated = 0
  let failed = 0

  await runWithConcurrency(photos, async (photo) => {
    processed += 1

    try {
      const hadDelivery = Boolean(getPhotoDelivery(photo.raw_metadata))
      await ensurePhotoDeliveryForPhoto(photo)

      if (!hadDelivery) {
        generated += 1
      }
    } catch (error) {
      failed += 1
      console.error('Failed to backfill published photo delivery:', photo.id, error)
    }
  })

  return {
    processed,
    generated,
    failed,
  }
}

export async function deletePhotoAssets(photo: Photo) {
  const supabase = createServiceClient()
  const removals: Promise<unknown>[] = []
  const delivery = getPhotoDelivery(photo.raw_metadata)

  if (isPrivateStoragePath(photo.image_url)) {
    removals.push(
      supabase.storage.from(PRIVATE_BUCKET).remove([photo.image_url]).catch((error) => {
        console.error('Failed to remove original photo asset:', error)
      }),
    )
  }

  if (typeof photo.thumbnail_url === 'string' && photo.thumbnail_url.startsWith(`${PRIVATE_BUCKET}/`)) {
    removals.push(
      supabase.storage.from(PRIVATE_BUCKET).remove([photo.thumbnail_url]).catch((error) => {
        console.error('Failed to remove private thumbnail asset:', error)
      }),
    )
  }

  removals.push(removeDeliveryAssets(delivery))

  await Promise.all(removals)
}