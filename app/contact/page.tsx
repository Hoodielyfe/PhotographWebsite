'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Mail, Instagram, MapPin } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
  }

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
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <p className="font-serif text-2xl mb-2">Thank you!</p>
                <p className="text-muted-foreground">I'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Project Type</label>
                  <select className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20">
                    <option>Portrait Session</option>
                    <option>Event Coverage</option>
                    <option>Landscape / Commercial</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
                    placeholder="Tell me about your project..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}