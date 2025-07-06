"use client"

import { useState } from "react"
import { Heart, MessageCircle, Share2, MapPin, Calendar, User, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { useRouter } from "next/navigation"

interface Publication {
  id: string
  title: string
  description: string
  category: string
  location: string
  date: string
  author: string
  authorId: string
  likes: number
  comments: number
  image?: string
  status: "pending" | "verified" | "resolved"
  priority: "low" | "medium" | "high"
}

interface PublicationCardProps {
  publication: Publication
  onLike?: (id: string) => void
  onComment?: (id: string) => void
}

export function PublicationCard({ publication, onLike, onComment }: PublicationCardProps) {
  const { user } = useAuth()
  const { createConversation, addNotification } = useNotifications()
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(publication.likes)

  const handleLike = () => {
    if (!user) return

    setIsLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))

    if (onLike) {
      onLike(publication.id)
    }

    // Notificar al autor si no es el mismo usuario
    if (publication.authorId !== user.id && !isLiked) {
      addNotification({
        userId: publication.authorId,
        type: "like",
        title: "Nueva reacción",
        message: `A ${user.name} le gustó tu publicación: ${publication.title}`,
        read: false,
        actionUrl: `/publicacion/${publication.id}`,
      })
    }
  }

  const handleComment = () => {
    if (onComment) {
      onComment(publication.id)
    }
    router.push(`/publicacion/${publication.id}#comments`)
  }

  const handleChat = () => {
    if (!user || publication.authorId === user.id) return

    // Crear conversación con el autor
    const conversationId = createConversation([user.id, publication.authorId], "direct")
    router.push(`/chat/${conversationId}`)

    // Notificar al autor
    addNotification({
      userId: publication.authorId,
      type: "message",
      title: "Nueva conversación",
      message: `${user.name} quiere chatear contigo sobre: ${publication.title}`,
      read: false,
      actionUrl: `/chat/${conversationId}`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "verified":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "verified":
        return "Verificado"
      case "resolved":
        return "Resuelto"
      default:
        return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta"
      case "medium":
        return "Media"
      case "low":
        return "Baja"
      default:
        return priority
    }
  }

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{publication.author}</p>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(publication.date).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Badge className={getStatusColor(publication.status)}>{getStatusText(publication.status)}</Badge>
            <Badge className={getPriorityColor(publication.priority)}>{getPriorityText(publication.priority)}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-2">{publication.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{publication.description}</p>
          </div>

          {publication.image && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={publication.image || "/placeholder.svg"}
                alt={publication.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {publication.location}
            </div>
            <Badge variant="outline">{publication.category}</Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-1 ${isLiked ? "text-red-500" : ""}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={handleComment} className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{publication.comments}</span>
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <Share2 className="h-4 w-4" />
              <span>Compartir</span>
            </Button>
          </div>

          {user && publication.authorId !== user.id && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleChat}
              className="flex items-center space-x-1 bg-transparent"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
