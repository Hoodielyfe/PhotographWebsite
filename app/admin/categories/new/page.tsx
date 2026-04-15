import { CategoryForm } from '../category-form'

export default function NewCategoryPage() {
  return (
    <div className="space-y-6 pt-16 lg:pt-0 max-w-2xl">
      <div>
        <h1 className="text-3xl font-serif font-semibold">New Category</h1>
        <p className="text-muted-foreground mt-1">Create a new photo category</p>
      </div>

      <CategoryForm />
    </div>
  )
}
