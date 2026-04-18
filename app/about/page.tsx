import Image from 'next/image'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { PublicImageFrame } from '@/components/public-image-frame'

export const metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
              <PublicImageFrame className="absolute inset-0 rounded-lg">
                <Image
                  src="https://images.unsplash.com/photo-1552168324-d612d77725e3?w=800&q=80"
                  alt="Photographer"
                  fill
                  loading="eager"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </PublicImageFrame>
            </div>
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-6">About Studio</h1>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  I'm a professional photographer based in Dallas, Texas, with over a decade of experience
                  capturing the world through my lens. My work spans portraits, landscapes, urban environments,
                  and live events.
                </p>
                <p>
                  My philosophy is simple: every moment has a story worth telling. Whether it's the quiet
                  intimacy of a portrait session or the raw energy of a city at night, I strive to create
                  images that resonate long after the shutter clicks.
                </p>
                <p>
                  I shoot primarily with Sony mirrorless systems and believe that great photography is
                  90% light and 10% everything else.
                </p>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="font-serif text-3xl font-semibold">10+</p>
                  <p className="text-sm text-muted-foreground mt-1">Years Experience</p>
                </div>
                <div>
                  <p className="font-serif text-3xl font-semibold">500+</p>
                  <p className="text-sm text-muted-foreground mt-1">Projects</p>
                </div>
                <div>
                  <p className="font-serif text-3xl font-semibold">4</p>
                  <p className="text-sm text-muted-foreground mt-1">Specialties</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}