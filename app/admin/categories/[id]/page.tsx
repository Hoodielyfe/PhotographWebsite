import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CategoryForm } from '../category-form'
import type { Category } from '@/lib/types'

function normalizeCategory(category: any): Category {
  return {
    ...category,
    cover_image: category.cover_image || category.cover_image_url || '',
  }
}

async function getCategory(id: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()
  return data ? normalizeCategory(data) : null
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const category = await getCategory(id)

  if (!category) {
    notFound()
  }

  return (
    <div className="space-y-6 pt-16 lg:pt-0 max-w-2xl">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Edit Category</h1>
        <p className="text-muted-foreground mt-1">Update category details</p>
      </div>

      <CategoryForm category={category} />
    </div>
  )
}
