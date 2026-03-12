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
          id: string
          image_url: string
          title: string
          prompt: string
          badges: Json
          created_at: string
          isActive: boolean
        }
        Insert: {
          id?: string
          image_url?: string | null
          title?: string | null
          prompt?: string | null
          badges?: Json
          created_at?: string
          isActive?: boolean
        }
        Update: {
          id?: string
          image_url?: string | null
          title?: string | null
          prompt?: string | null
          badges?: Json
          created_at?: string
          isActive?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          userId: string
          roleId: string
        }
        Insert: {
          id?: string
          userId: string
          roleId: string
        }
        Update: {
          id?: string
          userId?: string
          roleId?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          id: string
          created_at: string
        }
        Insert: {
          id: string
          created_at?: string
        }
        Update: {
          id?: string
          created_at?: string
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
