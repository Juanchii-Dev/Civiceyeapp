"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { useRouter } from "next/navigation"
import { ReactionButton } from "./ReactionButton"
import { CommentSystem } from "./CommentSystem"
import {
  MapPin,
  Calendar,
  Share2,
  Bookmark,
  BookmarkCheck,
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  UserPlus,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { Publication, Comment } from "@/types/publication"

interface EnhancedPublicationCardProps {
  publication: Publication
  onUpdate: (updatedPublication: Publication) => void
  onDelete: (publicationId: string) => void
}

export function EnhancedPublicationCard({ publication, onUpdate, onDelete }: EnhancedPublicationCardProps) {
  const { user } = useAuth()
  const { addNotification, createConversation } = useNotifications()
  const router = useRouter()
  const [showComments, setShowComments] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const isAuthor = user?.id === publication.authorId
  const isSaved = user ? publication.savedBy.includes(user.id) : false
  const isFollowing = user ? publication.followedBy.includes(user.id) : false

  const handleReaction = (reactionType: string) => {
    if (!user) return

    const existingReactionIndex = publication.reactions.findIndex((r) => r.userId === user.id)
    const newReactions = [...publication.reactions]

    if (existingReactionIndex >= 0) {
      if (publication.reactions[existingReactionIndex].type === reactionType) {
        // Quitar reacción
        newReactions.splice(existingReactionIndex, 1)
      } else {
        // Cambiar reacción
        newReactions[existingReactionIndex] = {
          ...newReactions[existingReactionIndex],
          type: reactionType as any,
          timestamp: Date.now(),
        }
      }
    } else {
      // Agregar nueva reacción
      newReactions.push({
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        type: reactionType as any,
        timestamp: Date.now(),
      })
    }

    onUpdate({ ...publication, reactions: newReactions })
  }

  const handleSave = () => {
    if (!user) return

    const newSavedBy = isSaved ? publication.savedBy.filter((id) => id !== user.id) : [...publication.savedBy, user.id]

    onUpdate({ ...publication, savedBy: newSavedBy })
  }

  const handleFollow = () => {
    if (!user) return

    const newFollowedBy = isFollowing
      ? publication.followedBy.filter((id) => id !== user.id)
      : [...publication.followedBy, user.id]

    onUpdate({ ...publication, followedBy: newFollowedBy })

    if (!isFollowing) {
      addNotification({
        userId: publication.authorId,
        type: "system",
        title: "Nuevo seguidor",
        message: `${user.name} está siguiendo tu publicación: ${publication.title}`,
        read: false,
        priority: "low",
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: publication.title,
          text: publication.description,
          url: `${window.location.origin}/publicacion/${publication.id}`,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(`${window.location.origin}/publicacion/${publication.id}`)
      addNotification({
        userId: user?.id || "",
        type: "system",
        title: "Enlace copiado",
        message: "El enlace de la publicación se copió al portapapeles",
        read: false,
        priority: "low",
      })
    }

    // Incrementar contador de compartidos
    onUpdate({ ...publication, shares: publication.shares + 1 })
  }

  const handleChat = () => {
    if (!user || isAuthor) return

    const conversationId = createConversation([user.id, publication.authorId], "direct")
    router.push(`/chat/${conversationId}`)
  }

  const handleAddComment = (content: string, parentId?: string, mentions?: string[], images?: string[]) => {
    if (!user) return

    const newComment: Comment = {
      id: Date.now().toString(),
      publicationId: publication.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content,
      createdAt: new Date().toISOString(),
      reactions: [],
      replies: [],
      parentId,
      mentions: mentions || [],
      images: images || [],
      isEdited: false,
    }

    const updatedComments = [...publication.comments, newComment]
    onUpdate({ ...publication, comments: updatedComments })

    // Notificar al autor y mencionados
    if (!isAuthor) {
      addNotification({
        userId: publication.authorId,
        type: "comment",
        title: "Nuevo comentario",
        message: `${user.name} comentó en tu publicación: ${content.slice(0, 50)}...`,
        read: false,
        actionUrl: `/publicacion/${publication.id}`,
        priority: "medium",
      })
    }

    // Notificar a usuarios mencionados
    mentions?.forEach((mentionedUser) => {
      // Aquí buscarías el ID del usuario mencionado
      addNotification({
        userId: mentionedUser, // Esto debería ser el ID real del usuario
        type: "comment",
        title: "Te mencionaron",
        message: `${user.name} te mencionó en un comentario: ${content.slice(0, 50)}...`,
        read: false,
        actionUrl: `/publicacion/${publication.id}`,
        priority: "medium",
      })
    })
  }

  const handleEditComment = (commentId: string, content: string) => {
    const updatedComments = publication.comments.map((comment) =>
      comment.id === commentId ? { ...comment, content, isEdited: true, updatedAt: new Date().toISOString() } : comment,
    )
    onUpdate({ ...publication, comments: updatedComments })
  }

  const handleDeleteComment = (commentId: string) => {
    const updatedComments = publication.comments.filter(
      (comment) => comment.id !== commentId && comment.parentId !== commentId,
    )
    onUpdate({ ...publication, comments: updatedComments })
  }

  const handleReactToComment = (commentId: string, reactionType: string) => {
    if (!user) return

    const updatedComments = publication.comments.map((comment) => {
      if (comment.id === commentId) {
        const existingReactionIndex = comment.reactions.findIndex((r) => r.userId === user.id)
        const newReactions = [...comment.reactions]

        if (existingReactionIndex >= 0) {
          if (comment.reactions[existingReactionIndex].type === reactionType) {
            newReactions.splice(existingReactionIndex, 1)
          } else {
            newReactions[existingReactionIndex] = {
              ...newReactions[existingReactionIndex],
              type: reactionType as any,
              timestamp: Date.now(),
            }
          }
        } else {
          newReactions.push({
            id: Date.now().toString(),
            userId: user.id,
            userName: user.name,
            type: reactionType as any,
            timestamp: Date.now(),
          })
        }

        return { ...comment, reactions: newReactions }
      }
      return comment
    })

    onUpdate({ ...publication, comments: updatedComments })
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

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={publication.authorAvatar || "/placeholder.svg"} />
              <AvatarFallback>{publication.author.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-semibold">{publication.author}</p>
                {!isAuthor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFollow}
                    className={`text-xs ${isFollowing ? "text-blue-600" : ""}`}
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    {isFollowing ? "Siguiendo" : "Seguir"}
                  </Button>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(publication.date).toLocaleDateString()}
                {publication.isEdited && <span className="ml-2">(editado)</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex flex-col gap-1">
              <Badge className={getStatusColor(publication.status)}>{publication.status}</Badge>
              <Badge className={getPriorityColor(publication.priority)}>{publication.priority}</Badge>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-1">
                  {isAuthor ? (
                    <>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-600"
                        onClick={() => onDelete(publication.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Flag className="w-4 h-4 mr-2" />
                        Reportar
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSave}>
                        {isSaved ? <BookmarkCheck className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
                        {isSaved ? "Guardado" : "Guardar"}
                      </Button>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-xl mb-2">{publication.title}</h3>
            <p className="text-gray-700 leading-relaxed">{publication.description}</p>
          </div>

          {/* Hashtags */}
          {publication.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {publication.hashtags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-blue-600">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Imágenes */}
          {publication.images.length > 0 && (
            <div className="relative">
              <div className="rounded-lg overflow-hidden">
                <img
                  src={publication.images[currentImageIndex] || "/placeholder.svg"}
                  alt={`Imagen ${currentImageIndex + 1}`}
                  className="w-full h-64 object-cover"
                />
              </div>

              {publication.images.length > 1 && (
                <div className="flex justify-center mt-2 space-x-1">
                  {publication.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-blue-600" : "bg-gray-300"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {publication.location}
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {publication.views} vistas
              </div>
            </div>
            <Badge variant="outline">{publication.category}</Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t space-y-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <ReactionButton
              reactions={publication.reactions}
              targetId={publication.id}
              targetType="publication"
              authorId={publication.authorId}
              onReact={handleReaction}
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{publication.comments.length}</span>
              {showComments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="sm" onClick={handleShare} className="flex items-center space-x-1">
              <Share2 className="h-4 w-4" />
              <span>{publication.shares}</span>
            </Button>
          </div>

          {user && !isAuthor && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleChat}
              className="flex items-center space-x-1 bg-transparent"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Contactar</span>
            </Button>
          )}
        </div>

        {showComments && (
          <div className="w-full pt-4 border-t">
            <CommentSystem
              publicationId={publication.id}
              comments={publication.comments}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              onReactToComment={handleReactToComment}
            />
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
