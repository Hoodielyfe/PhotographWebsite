import exifr from 'exifr'
import { imageSize } from 'image-size'

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

type ParsedMetadata = Record<string, unknown>

const EXIF_OPTIONS = {
  tiff: true,
  exif: true,
  gps: false,
  xmp: true,
  icc: true,
  iptc: true,
  jfif: true,
  ihdr: true,
}

const REDACTED_KEYS = new Set([
  'gps',
  'gpslatitude',
  'gpslongitude',
  'gpsaltitude',
  'gpsposition',
  'latitude',
  'longitude',
  'coordinates',
])

const DETAILED_METADATA_MIME_TYPES = new Set([
  'image/jpeg',
  'image/webp',
])

export interface ExtractedPhotoMetadata {
  metadata: {
    camera?: string
    lens?: string
    aperture?: string
    shutter_speed?: string
    iso?: number
    location?: string
    focal_length?: string
    taken_at?: string
    width?: number
    height?: number
    orientation?: number
    flash?: string
    exposure_mode?: string
    metering_mode?: string
    white_balance?: string
    software?: string
    artist?: string
    copyright?: string
    keywords?: string[]
  }
  raw_metadata: Record<string, JsonValue> | null
  width: number | null
  height: number | null
  taken_at: string | null
  location: string | null
  camera_info: string | null
}

function firstDefined<T>(...values: Array<T | null | undefined>): T | undefined {
  return values.find((value) => value !== undefined && value !== null)
}

function getTag(metadata: ParsedMetadata, keys: string[]): unknown {
  for (const key of keys) {
    const value = metadata[key]
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }

  return undefined
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return undefined
}

function trimTrailingZeros(value: number): string {
  return value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
}

function formatAperture(value: unknown): string | undefined {
  const numericValue = toNumber(value)
  return numericValue ? trimTrailingZeros(numericValue) : undefined
}

function formatShutterSpeed(value: unknown): string | undefined {
  const numericValue = toNumber(value)

  if (!numericValue || numericValue <= 0) {
    return typeof value === 'string' && value.trim() ? value : undefined
  }

  if (numericValue >= 1) {
    return trimTrailingZeros(numericValue)
  }

  const denominator = Math.round(1 / numericValue)
  return denominator > 1 ? `1/${denominator}` : trimTrailingZeros(numericValue)
}

function formatFocalLength(value: unknown): string | undefined {
  const numericValue = toNumber(value)
  return numericValue ? `${trimTrailingZeros(numericValue)}mm` : undefined
}

function normalizeDate(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString()
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
  }

  return undefined
}

function formatText(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return undefined
}

function formatKeywords(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const keywords = value
      .map((entry) => formatText(entry))
      .filter((entry): entry is string => Boolean(entry))

    return keywords.length > 0 ? keywords : undefined
  }

  const singleKeyword = formatText(value)
  return singleKeyword ? [singleKeyword] : undefined
}

function formatLocation(metadata: ParsedMetadata): string | undefined {
  const locationParts = [
    getTag(metadata, ['Location', 'location', 'Sublocation', 'Sub-location']),
    getTag(metadata, ['City', 'city']),
    getTag(metadata, ['State', 'ProvinceState', 'state', 'provinceState']),
    getTag(metadata, ['Country', 'country']),
  ]
    .map((value) => formatText(value))
    .filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index)

  return locationParts.length > 0 ? locationParts.join(', ') : undefined
}

function buildCameraInfo(camera?: string, lens?: string): string | null {
  const values = [camera, lens].filter((value): value is string => Boolean(value))
  return values.length > 0 ? values.join(' | ') : null
}

function sanitizeForJson(value: unknown): JsonValue | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString()
  }

  if (typeof value === 'string' || typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }

  if (Array.isArray(value)) {
    const items = value
      .map((entry) => sanitizeForJson(entry))
      .filter((entry): entry is JsonValue => entry !== undefined)

    return items
  }

  if (typeof value === 'object') {
    const jsonObject: Record<string, JsonValue> = {}

    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (REDACTED_KEYS.has(key.toLowerCase())) {
        continue
      }

      const sanitizedEntry = sanitizeForJson(entry)
      if (sanitizedEntry !== undefined) {
        jsonObject[key] = sanitizedEntry
      }
    }

    return Object.keys(jsonObject).length > 0 ? jsonObject : undefined
  }

  return undefined
}

export async function extractPhotoMetadata(
  fileBuffer: Buffer,
  fileDetails: {
    fileName: string
    mimeType: string
    fileSize: number
  },
): Promise<ExtractedPhotoMetadata> {
  let parsedMetadata: ParsedMetadata = {}

  if (DETAILED_METADATA_MIME_TYPES.has(fileDetails.mimeType)) {
    try {
      const parsed = await exifr.parse(fileBuffer, EXIF_OPTIONS)
      if (parsed && typeof parsed === 'object') {
        parsedMetadata = parsed as ParsedMetadata
      }
    } catch (error) {
      console.warn('Photo metadata extraction skipped:', error)
    }
  }

  const dimensions = imageSize(fileBuffer)
  const width = firstDefined(dimensions.width, toNumber(getTag(parsedMetadata, ['ExifImageWidth', 'ImageWidth', 'PixelXDimension']))) ?? null
  const height = firstDefined(dimensions.height, toNumber(getTag(parsedMetadata, ['ExifImageHeight', 'ImageHeight', 'PixelYDimension']))) ?? null
  const takenAt =
    normalizeDate(
      getTag(parsedMetadata, ['DateTimeOriginal', 'CreateDate', 'DateCreated', 'ModifyDate'])
    ) ?? null

  const metadata = {
    camera: [
      formatText(getTag(parsedMetadata, ['Make', 'make'])),
      formatText(getTag(parsedMetadata, ['Model', 'model'])),
    ]
      .filter((value): value is string => Boolean(value))
      .join(' ')
      .trim() || undefined,
    lens: formatText(getTag(parsedMetadata, ['LensModel', 'Lens', 'LensInfo'])),
    aperture: formatAperture(getTag(parsedMetadata, ['FNumber', 'ApertureValue'])),
    shutter_speed: formatShutterSpeed(getTag(parsedMetadata, ['ExposureTime', 'ShutterSpeedValue'])),
    iso: toNumber(getTag(parsedMetadata, ['ISO', 'PhotographicSensitivity', 'ISOSettings'])),
    location: formatLocation(parsedMetadata),
    focal_length: formatFocalLength(getTag(parsedMetadata, ['FocalLength', 'FocalLenIn35mmFilm'])),
    taken_at: takenAt || undefined,
    width: width || undefined,
    height: height || undefined,
    orientation: toNumber(getTag(parsedMetadata, ['Orientation'])),
    flash: formatText(getTag(parsedMetadata, ['Flash'])),
    exposure_mode: formatText(getTag(parsedMetadata, ['ExposureMode'])),
    metering_mode: formatText(getTag(parsedMetadata, ['MeteringMode'])),
    white_balance: formatText(getTag(parsedMetadata, ['WhiteBalance'])),
    software: formatText(getTag(parsedMetadata, ['Software'])),
    artist: formatText(getTag(parsedMetadata, ['Artist', 'Creator'])),
    copyright: formatText(getTag(parsedMetadata, ['Copyright', 'Rights'])),
    keywords: formatKeywords(getTag(parsedMetadata, ['Keywords', 'Subject'])),
  }

  const rawMetadata = sanitizeForJson({
    ...parsedMetadata,
    upload: {
      original_filename: fileDetails.fileName,
      mime_type: fileDetails.mimeType,
      file_size: fileDetails.fileSize,
      extracted_at: new Date().toISOString(),
    },
  })

  return {
    metadata,
    raw_metadata:
      rawMetadata && !Array.isArray(rawMetadata)
        ? (rawMetadata as Record<string, JsonValue>)
        : null,
    width,
    height,
    taken_at: takenAt,
    location: metadata.location || null,
    camera_info: buildCameraInfo(metadata.camera, metadata.lens),
  }
}