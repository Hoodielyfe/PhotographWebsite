export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  cover_image: string | null
  display_order: number
  created_at: string
}

export interface Photo {
  id: string
  title: string
  description: string | null
  image_url: string
  thumbnail_url: string | null
  category_id: string | null
  is_featured: boolean
  is_published: boolean
  display_order: number
  metadata: {
    camera?: string
    lens?: string
    aperture?: string
    shutter_speed?: string
    iso?: string
    location?: string
    date_taken?: string
  } | null
  created_at: string
  updated_at: string
  category?: Category
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  is_read: boolean
  created_at: string
}

export interface SiteSettings {
  id: string
  key: string
  value: string
  updated_at: string
}
