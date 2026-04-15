import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Award, Camera, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

export const metadata = {
  title: 'About',
  description: 'Learn more about Studio Photography and our passion for capturing beautiful moments.',
}

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-24 pb-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-6">
                The Art of Visual Storytelling
              </h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                With over a decade of experience behind the lens, I&apos;ve dedicated my career to capturing the 
                fleeting moments that define our lives. Every photograph tells a story, and my mission is to 
                ensure those stories are told with beauty, authenticity, and emotion.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                From intimate portraits to sweeping landscapes, I approach each project with the same 
                dedication to craft and attention to detail that has become the hallmark of my work.
              </p>
              <Button asChild size="lg">
                <Link href="/contact">
                  Work With Me
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative aspect-[4/5] bg-muted rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                <Camera className="h-24 w-24 text-muted-foreground/30" />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-muted/30 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">What Drives Me</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The principles that guide every photograph I take
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-lg text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Passion</h3>
                <p className="text-muted-foreground">
                  Photography isn&apos;t just my profession—it&apos;s my calling. Every shoot is an opportunity to 
                  create something meaningful and lasting.
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Craft</h3>
                <p className="text-muted-foreground">
                  Technical excellence meets artistic vision. I continuously refine my skills to deliver 
                  the highest quality work possible.
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Excellence</h3>
                <p className="text-muted-foreground">
                  Every detail matters. From composition to post-processing, I strive for perfection 
                  in every aspect of my work.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="font-serif text-4xl sm:text-5xl font-semibold mb-2">10+</p>
                <p className="text-muted-foreground">Years Experience</p>
              </div>
              <div>
                <p className="font-serif text-4xl sm:text-5xl font-semibold mb-2">500+</p>
                <p className="text-muted-foreground">Projects Completed</p>
              </div>
              <div>
                <p className="font-serif text-4xl sm:text-5xl font-semibold mb-2">50+</p>
                <p className="text-muted-foreground">Awards Won</p>
              </div>
              <div>
                <p className="font-serif text-4xl sm:text-5xl font-semibold mb-2">100%</p>
                <p className="text-muted-foreground">Client Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* Equipment Section */}
        <section className="bg-muted/30 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">My Gear</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Professional equipment to ensure the best results
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-card p-6 rounded-lg">
                <h3 className="font-semibold mb-4">Cameras</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Sony A7R V</li>
                  <li>Sony A1</li>
                  <li>Canon EOS R5</li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg">
                <h3 className="font-semibold mb-4">Lenses</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Sony 24-70mm f/2.8 GM II</li>
                  <li>Sony 70-200mm f/2.8 GM II</li>
                  <li>Sony 85mm f/1.4 GM</li>
                  <li>Canon RF 50mm f/1.2L</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">
              Let&apos;s Create Together
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Whether you have a specific vision in mind or need creative direction, 
              I&apos;m here to help bring your ideas to life.
            </p>
            <Button asChild size="lg">
              <Link href="/contact">
                Get in Touch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
