export interface Photo {
  id: string
  title: string
  description?: string
  image_url: string
  thumbnail_url?: string
  is_featured?: boolean
  is_published?: boolean
  display_order?: number
  category?: Category
  category_id?: string
  metadata?: {
    camera?: string
    lens?: string
    aperture?: string
    shutter_speed?: string
    iso?: number
    location?: string
  }
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
  subject?: string | null
  message: string
  is_read?: boolean
  created_at: string
}