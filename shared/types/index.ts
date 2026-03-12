import type { BadgeProps } from '#ui/types'

export type BadgeColor = BadgeProps['color']

export interface Badge {
  label: string
  color: BadgeColor
}

export interface GalleryFormState {
  id?: string
  title: string | null
  image_url: string | null
  upload_image: File | null
  prompt: string | null
  badges: Badge[]
  isActive: boolean
}
