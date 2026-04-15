import { Mail, MapPin, Phone } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ContactForm } from './contact-form'

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with Studio Photography for your next project.',
}

export default function ContactPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">Get in Touch</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have a project in mind? I&apos;d love to hear from you. Send me a message and let&apos;s create something beautiful together.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="font-serif text-2xl font-semibold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">Email</p>
                      <a href="mailto:hello@studio.com" className="text-muted-foreground hover:text-foreground transition-colors">
                        hello@studio.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">Phone</p>
                      <a href="tel:+1234567890" className="text-muted-foreground hover:text-foreground transition-colors">
                        +1 (234) 567-890
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">Location</p>
                      <p className="text-muted-foreground">
                        New York City, NY<br />
                        Available for travel worldwide
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Response Time</h3>
                <p className="text-muted-foreground text-sm">
                  I typically respond within 24-48 hours. For urgent inquiries, please call directly.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
                <h2 className="font-serif text-2xl font-semibold mb-6">Send a Message</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
