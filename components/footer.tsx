import Link from 'next/link'
import { Camera, Instagram, Lock, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 font-serif text-xl font-semibold transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Studio home"
          >
            <Camera className="h-6 w-6" />
            <span>Studio</span>
          </Link>

          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/gallery" className="text-muted-foreground hover:text-foreground transition-colors">
              Gallery
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="mailto:hello@studio.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
            <Link
              href="/auth/login"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Admin login"
            >
              <Lock className="h-5 w-5" />
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            {currentYear} Studio Photography. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
