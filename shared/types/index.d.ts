import type { BadgeProps } from '#ui/types'

type BadgeColor = BadgeProps['color']

declare global {
  interface GalleryItem {
    id: string
    image_url: string
    title: string
    prompt: string
    badges: { label: string; color: BadgeColor }[]
    created_at: string
    isActive: boolean
  }
}

export {}
