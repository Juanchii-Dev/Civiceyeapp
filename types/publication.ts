export interface Reaction {
  id: string
  userId: string
  userName: string
  type: "like" | "love" | "haha" | "wow" | "sad" | "angry"
  timestamp: number
}

export interface Comment {
  id: string
  publicationId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  updatedAt?: string
  reactions: Reaction[]
  replies: Comment[]
  parentId?: string
  mentions: string[]
  images?: string[]
  isEdited: boolean
}

export interface Publication {
  id: string
  title: string
  description: string
  category: string
  location: string
  coordinates?: { lat: number; lng: number }
  date: string
  author: string
  authorId: string
  authorAvatar?: string
  reactions: Reaction[]
  comments: Comment[]
  shares: number
  views: number
  images: string[]
  videos?: string[]
  status: "pending" | "verified" | "resolved"
  priority: "low" | "medium" | "high"
  hashtags: string[]
  mentions: string[]
  privacy: "public" | "followers" | "private"
  isEdited: boolean
  createdAt: string
  updatedAt?: string
  savedBy: string[]
  followedBy: string[]
}

export interface PublicationDraft {
  title: string
  description: string
  category: string
  location: string
  images: File[]
  hashtags: string[]
  mentions: string[]
  privacy: "public" | "followers" | "private"
}
