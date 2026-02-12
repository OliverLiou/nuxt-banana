declare global { 
  interface Badge {
    label: string
    color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  }
  interface Post {
    id?: number
    image: string
    title: string
    timestamp: string
    badges: Badge[]
  }
}
export  {}


