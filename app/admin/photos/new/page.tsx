import { createClient } from '@/lib/supabase/server'
import { PhotoForm } from '../photo-form'
import type { Category } from '@/lib/types'

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')
  return data || []
}

export default async function NewPhotoPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6 pt-16 lg:pt-0 max-w-2xl">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Add Photo</h1>
        <p className="text-muted-foreground mt-1">Upload a new photo to your gallery</p>
      </div>

      <PhotoForm categories={categories} />
    </div>
  )
}
