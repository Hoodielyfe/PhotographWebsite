import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { photos, categories } from '@/lib/data'

export default function HomePage() {
  const featuredPhotos = photos.filter(p => p.is_featured)
  const heroPhoto = featuredPhotos[0]

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative h-[calc(100vh-4rem)] flex items-center justify-center">
          {heroPhoto ? (
            <Image
              src={heroPhoto.image_url}
              alt={heroPhoto.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6">
              Capturing Moments,<br />Creating Memories
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Professional photography that tells your story through stunning visual narratives
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
                <Link href="/gallery">
                  View Gallery
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Work */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">Featured Work</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">A curated selection of our finest photographs</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredPhotos.slice(0, 6).map((photo) => (
                <Link
                  key={photo.id}
                  href={`/gallery`}
                  className="group relative aspect-[4/3] overflow-hidden bg-muted"
                >
                  <Image
                    src={photo.thumbnail_url || photo.image_url}
                    alt={photo.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                    <div className="p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-white font-medium">{photo.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button asChild variant="outline" size="lg">
                <Link href="/gallery">View All Photos <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">Explore Categories</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Browse through our diverse collection</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/gallery?category=${category.slug}`}
                  className="group relative aspect-[3/4] overflow-hidden bg-muted rounded-lg"
                >
                  {category.cover_image && (
                    <Image
                      src={category.cover_image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white font-serif text-xl font-semibold mb-1">{category.name}</h3>
                    {category.description && (
                      <p className="text-white/70 text-sm">{category.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">Ready to Create Something Beautiful?</h2>
            <p className="text-muted-foreground mb-8 text-lg">{"Let's work together to capture your special moments"}</p>
            <Button asChild size="lg">
              <Link href="/contact">Start a Conversation <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}