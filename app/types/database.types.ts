export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      gallery_items: {
        Row: {
          id: number
          image_url: string
          title: string
          prompt: string
          badges: Json
          created_at: string
          isActive: boolean
        }
        Insert: {
          id?: number
          image_url?: string | null
          title?: string | null
          prompt?: string | null
          badges?: Json
          created_at?: string
          isActive?: boolean
        }
        Update: {
          id?: number
          image_url?: string | null
          title?: string | null
          prompt?: string | null
          badges?: Json
          created_at?: string
          isActive?: boolean
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
