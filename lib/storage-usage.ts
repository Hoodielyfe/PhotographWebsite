import { createServiceClient } from '@/lib/supabase/service'

const STORAGE_BUCKET_ID = 'photos'
const STORAGE_LIST_PAGE_SIZE = 1000

type StorageObjectRow = {
  id?: string | null
  name?: string
  metadata?: {
    size?: number
  } | null
}

export interface StorageUsageStats {
  totalFiles: number
  usedBytes: number
  usedLabel: string
  usedOutOfLabel: string | null
  limitBytes: number | null
  limitLabel: string | null
  remainingBytes: number | null
  remainingLabel: string | null
  usagePercent: number | null
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const units = ['KB', 'MB', 'GB', 'TB']
  let size = bytes / 1024
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  const precision = size >= 100 ? 0 : size >= 10 ? 1 : 2
  return `${size.toFixed(precision)} ${units[unitIndex]}`
}

function getConfiguredStorageLimitBytes() {
  const rawValue = process.env.STORAGE_PLAN_LIMIT_GB

  if (!rawValue) {
    return null
  }

  const gigabytes = Number(rawValue)
  if (!Number.isFinite(gigabytes) || gigabytes <= 0) {
    return null
  }

  return Math.round(gigabytes * 1024 * 1024 * 1024)
}

async function listStorageObjects(path = ''): Promise<StorageObjectRow[]> {
  const supabase = createServiceClient()
  const collected: StorageObjectRow[] = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET_ID).list(path, {
      limit: STORAGE_LIST_PAGE_SIZE,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })

    if (error) {
      throw error
    }

    const page = (data || []) as StorageObjectRow[]

    for (const entry of page) {
      if (entry.id) {
        collected.push(entry)
        continue
      }

      if (entry.name) {
        const nestedPath = path ? `${path}/${entry.name}` : entry.name
        collected.push(...(await listStorageObjects(nestedPath)))
      }
    }

    if (page.length < STORAGE_LIST_PAGE_SIZE) {
      break
    }

    offset += STORAGE_LIST_PAGE_SIZE
  }

  return collected
}

export async function getStorageUsageStats(): Promise<StorageUsageStats> {
  let objects: StorageObjectRow[] = []

  try {
    objects = await listStorageObjects()
  } catch (error) {
    console.error('Error fetching storage usage:', error)
  }

  const usedBytes = objects.reduce((total, object) => {
    const size = object.metadata?.size
    return total + (typeof size === 'number' && Number.isFinite(size) ? size : 0)
  }, 0)

  const limitBytes = getConfiguredStorageLimitBytes()
  const remainingBytes = limitBytes !== null ? Math.max(limitBytes - usedBytes, 0) : null
  const usagePercent =
    limitBytes && limitBytes > 0
      ? Math.min((usedBytes / limitBytes) * 100, 100)
      : null

  return {
    totalFiles: objects.length,
    usedBytes,
    usedLabel: formatBytes(usedBytes),
    usedOutOfLabel: limitBytes !== null ? `${formatBytes(usedBytes)} used out of ${formatBytes(limitBytes)}` : null,
    limitBytes,
    limitLabel: limitBytes !== null ? formatBytes(limitBytes) : null,
    remainingBytes,
    remainingLabel: remainingBytes !== null ? formatBytes(remainingBytes) : null,
    usagePercent,
  }
}