import type { BadgeProps } from '#ui/types'

export type BadgeColor = BadgeProps['color']

export interface Badge {
  label: string
  color: BadgeColor
}

export interface GalleryFormState {
  id?: number
  title: string | null
  image_url: string | null
  upload_image: File | null
  prompt: string | null
  badges: Badge[]
  isActive: boolean
}

declare global {
  interface GalleryItem {
    id: number
    image_url: string
    title: string
    prompt: string
    badges: Badge[]
    created_at: string
    isActive: boolean
  }
}
