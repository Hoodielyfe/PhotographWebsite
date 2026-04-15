import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { CategoriesTable } from './categories-table'
import type { Category } from '@/lib/types'

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')
  return data || []
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your photos into collections</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Link>
        </Button>
      </div>

      <CategoriesTable categories={categories} />
    </div>
  )
}
