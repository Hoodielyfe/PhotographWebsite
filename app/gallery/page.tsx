import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { PhotoGrid } from '@/components/photo-grid'
import { photos, categories } from '@/lib/data'

export const metadata = { title: 'Gallery' }

export default function GalleryPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const filtered = searchParams.category
    ? photos.filter(p => p.category?.slug === searchParams.category && p.is_published)
    : photos.filter(p => p.is_published)

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">Gallery</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every frame tells a story
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <a
              href="/gallery"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !searchParams.category
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </a>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/gallery?category=${cat.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  searchParams.category === cat.slug
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.name}
              </a>
            ))}
          </div>

          <PhotoGrid photos={filtered} variant="masonry" />
        </div>
      </main>
      <Footer />
    </>
  )
}