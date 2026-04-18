export interface PhotoMetadata {
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

export interface Photo {
  id: string
  title: string
  description?: string
  image_url: string
  thumbnail_url?: string
  public_image_url?: string
  public_thumbnail_url?: string
  is_featured?: boolean
  is_published?: boolean
  display_order?: number
  category?: Category
  category_id?: string
  width?: number | null
  height?: number | null
  taken_at?: string | null
  location?: string | null
  camera_info?: string | null
  raw_metadata?: Record<string, unknown> | null
  metadata?: PhotoMetadata | null
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  cover_image?: string
  display_order?: number
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string | null
  subject?: string | null
  message: string
  is_read?: boolean
  is_contacted?: boolean
  contacted_at?: string | null
  created_at: string
}