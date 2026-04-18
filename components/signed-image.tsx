'use client'

import Image, { type ImageProps } from 'next/image'
import { useEffect, useState } from 'react'
import { cn, isRemoteUrl } from '@/lib/utils'

const signedUrlCache = new Map<string, string>()
const signedUrlPromiseCache = new Map<string, Promise<string | undefined>>()

type SignedImageProps = Omit<ImageProps, 'src'> & {
  src: string
}

export function SignedImage({ src, alt, className, ...props }: SignedImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(() =>
    isRemoteUrl(src) ? src : signedUrlCache.get(src),
  )

  useEffect(() => {
    if (isRemoteUrl(src)) {
      setResolvedSrc(src)
      return
    }

    if (signedUrlCache.has(src)) {
      setResolvedSrc(signedUrlCache.get(src))
      return
    }

    let canceled = false
    setResolvedSrc(undefined)

    async function loadSignedUrl() {
      try {
        const existingPromise = signedUrlPromiseCache.get(src)
        const signedUrlPromise =
          existingPromise ||
          fetch(`/api/storage/signed-url?path=${encodeURIComponent(src)}`, {
            cache: 'force-cache',
          })
            .then(async (response) => {
              const data = await response.json()

              if (!response.ok) {
                console.error('Failed to fetch signed URL:', data.error)
                return undefined
              }

              if (data.url) {
                signedUrlCache.set(src, data.url)
                return data.url as string
              }

              return undefined
            })
            .finally(() => {
              signedUrlPromiseCache.delete(src)
            })

        signedUrlPromiseCache.set(src, signedUrlPromise)
        const url = await signedUrlPromise

        if (!canceled && url) {
          setResolvedSrc(url)
        }
      } catch (error) {
        console.error('Signed image load error:', error)
      }
    }

    loadSignedUrl()

    return () => {
      canceled = true
    }
  }, [src])

  if (!resolvedSrc) {
    return <div className={cn('bg-muted animate-pulse', className)} />
  }

  return <Image src={resolvedSrc} alt={alt} className={className} {...props} />
}
