'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Mail, Instagram, MapPin } from 'lucide-react'
import { ContactForm } from './contact-form'

export default function ContactPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">Get in Touch</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Ready to work together? I'd love to hear about your project.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 mt-0.5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium mb-1">Email</h3>
                  <a href="mailto:hello@studio.com" className="text-muted-foreground hover:text-foreground transition-colors">
                    hello@studio.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Instagram className="h-6 w-6 mt-0.5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium mb-1">Instagram</h3>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    @studiophoto
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 mt-0.5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium mb-1">Location</h3>
                  <p className="text-muted-foreground">Dallas, Texas — available worldwide</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}