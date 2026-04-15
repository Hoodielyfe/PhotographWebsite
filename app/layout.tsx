import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: {
    default: 'Studio | Photography Portfolio',
    template: '%s | Studio Photography'
  },
  description: 'Professional photography portfolio showcasing stunning visual stories through the lens.',
  keywords: ['photography', 'portfolio', 'photographer', 'visual art', 'professional photography'],
  authors: [{ name: 'Studio Photography' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Studio Photography',
    title: 'Studio | Photography Portfolio',
    description: 'Professional photography portfolio showcasing stunning visual stories through the lens.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Studio | Photography Portfolio',
    description: 'Professional photography portfolio showcasing stunning visual stories through the lens.',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
