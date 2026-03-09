import type { GalleryFormState } from '../types'

export function getDefaultFormState(): GalleryFormState {
  return {
    id: undefined,
    title: null,
    image_url: null,
    upload_image: null,
    prompt: null,
    badges: [],
    isActive: true,
  }
}
