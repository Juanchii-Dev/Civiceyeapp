"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { useRouter } from "next/navigation"
import {
  MapPin,
  Calendar,
  Share2,
  Bookmark,
  BookmarkCheck,
  Eye,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Heart,
  ThumbsUp,
  Laugh,
  Frown,
  Angry,
  AngryIcon as Surprised,
} from "lucide-react"

interface Reaction {
  id: string
  userId: string
  userName: string
  type: "like" | "love" | "haha" | "wow" | "sad" | "angry"
  timestamp: number
}

interface Comment {
  id: string
  publicationId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  reactions: Reaction[]
  replies: Comment[]
  parentId?: string
}

interface Publication {
  id: string
  title: string
  description: string
  category: string
  location: string
  date: string
  author: string
  authorId: string
  authorAvatar?: string
  reactions: Reaction[]
  comments: Comment[]
  shares: number
  views: number
  images: string[]
  status: "pending" | "verified" | "resolved"
  priority: "low" | "medium" | "high"
  savedBy: string[]
  followedBy: string[]
}

interface PublicationCardProps {
  publication: Publication
  onUpdate?: (updatedPublication: Publication) => void
  onDelete?: (publicationId: string) => void
}

const reactionEmojis = {
  like: { emoji: "👍", label: "Me gusta", color: "text-blue-500", icon: ThumbsUp },
  love: { emoji: "❤️", label: "Me encanta", color: "text-red-500", icon: Heart },
  haha: { emoji: "😂", label: "Me divierte", color: "text-yellow-500", icon: Laugh },
  wow: { emoji: "😮", label: "Me asombra", color: "text-orange-500", icon: Surprised },
  sad: { emoji: "😢", label: "Me entristece", color: "text-blue-400", icon: Frown },
  angry: { emoji: "😡", label: "Me enoja", color: "text-red-600", icon: Angry },
}

export function PublicationCard({ publication, onUpdate, onDelete }: PublicationCardProps) {
  const { user } = useAuth()
  const { addNotification, createConversation } = useNotifications()
  const router = useRouter()
  const [showComments, setShowComments] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const isAuthor = user?.id === publication.authorId
  const isSaved = user ? publication.savedBy.includes(user.id) : false
  const userReaction = publication.reactions.find((r) => r.userId === user?.id)

  const reactionCounts = publication.reactions.reduce(
    (acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const totalReactions = publication.reactions.length
  const topReactions = Object.entries(reactionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  const handleReaction = (reactionType: string) => {
    if (!user || !onUpdate) return

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
    setShowReactions(false)

    // Notificar al autor si no es el mismo usuario
    if (publication.authorId !== user.id) {
      addNotification({
        userId: publication.authorId,
        type: "like",
        title: "Nueva reacción",
        message: `${user.name} reaccionó ${reactionEmojis[reactionType as keyof typeof reactionEmojis].label.toLowerCase()} a tu publicación`,
        read: false,
        priority: "low",
      })
    }
  }

  const handleAddComment = () => {
    if (!user || !newComment.trim() || !onUpdate) return

    const comment: Comment = {
      id: Date.now().toString(),
      publicationId: publication.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
      reactions: [],
      replies: [],
    }

    const updatedComments = [...publication.comments, comment]
    onUpdate({ ...publication, comments: updatedComments })
    setNewComment("")

    // Notificar al autor
    if (!isAuthor) {
      addNotification({
        userId: publication.authorId,
        type: "comment",
        title: "Nuevo comentario",
        message: `${user.name} comentó en tu publicación: ${newComment.slice(0, 50)}...`,
        read: false,
        actionUrl: `/publicacion/${publication.id}`,
        priority: "medium",
      })
    }
  }

  const handleReply = (commentId: string) => {
    if (!user || !replyContent.trim() || !onUpdate) return

    const reply: Comment = {
      id: Date.now().toString(),
      publicationId: publication.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: replyContent.trim(),
      createdAt: new Date().toISOString(),
      reactions: [],
      replies: [],
      parentId: commentId,
    }

    const updatedComments = [...publication.comments, reply]
    onUpdate({ ...publication, comments: updatedComments })
    setReplyContent("")
    setReplyingTo(null)

    // Encontrar el comentario original para notificar al autor
    const originalComment = publication.comments.find((c) => c.id === commentId)
    if (originalComment && originalComment.userId !== user.id) {
      addNotification({
        userId: originalComment.userId,
        type: "comment",
        title: "Nueva respuesta",
        message: `${user.name} respondió a tu comentario: ${replyContent.slice(0, 50)}...`,
        read: false,
        actionUrl: `/publicacion/${publication.id}`,
        priority: "medium",
      })
    }
  }

  const handleCommentReaction = (commentId: string, reactionType: string) => {
    if (!user || !onUpdate) return

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

  const handleSave = () => {
    if (!user || !onUpdate) return

    const newSavedBy = isSaved ? publication.savedBy.filter((id) => id !== user.id) : [...publication.savedBy, user.id]
    onUpdate({ ...publication, savedBy: newSavedBy })
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
      navigator.clipboard.writeText(`${window.location.origin}/publicacion/${publication.id}`)
      if (user) {
        addNotification({
          userId: user.id,
          type: "system",
          title: "Enlace copiado",
          message: "El enlace de la publicación se copió al portapapeles",
          read: false,
          priority: "low",
        })
      }
    }

    if (onUpdate) {
      onUpdate({ ...publication, shares: publication.shares + 1 })
    }
  }

  const handleChat = () => {
    if (!user || isAuthor) return

    const conversationId = createConversation([user.id, publication.authorId], "direct")
    router.push(`/chat/${conversationId}`)
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

  const topLevelComments = publication.comments.filter((comment) => !comment.parentId)
  const getCommentReplies = (commentId: string) =>
    publication.comments.filter((comment) => comment.parentId === commentId)

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
              <p className="font-semibold">{publication.author}</p>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(publication.date).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(publication.status)}>{publication.status}</Badge>
            <Badge className={getPriorityColor(publication.priority)}>{publication.priority}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-xl mb-2">{publication.title}</h3>
            <p className="text-gray-700 leading-relaxed">{publication.description}</p>
          </div>

          {publication.images.length > 0 && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={publication.images[0] || "/placeholder.svg"}
                alt="Imagen de la publicación"
                className="w-full h-64 object-cover"
              />
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
            {/* Botón de reacciones */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReactions(!showReactions)}
                className={`flex items-center space-x-1 ${userReaction ? reactionEmojis[userReaction.type].color : ""}`}
              >
                {userReaction ? (
                  <>
                    <span>{reactionEmojis[userReaction.type].emoji}</span>
                    <span>{reactionEmojis[userReaction.type].label}</span>
                  </>
                ) : (
                  <>
                    <ThumbsUp className="h-4 w-4" />
                    <span>Me gusta</span>
                  </>
                )}
              </Button>

              {showReactions && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 flex space-x-1 z-10">
                  {Object.entries(reactionEmojis).map(([type, { emoji, label }]) => (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      className="text-2xl hover:scale-125 transition-transform p-1"
                      onClick={() => handleReaction(type)}
                      title={label}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              )}

              {totalReactions > 0 && (
                <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                  <div className="flex -space-x-1">
                    {topReactions.map(([type]) => (
                      <span key={type} className="text-xs">
                        {reactionEmojis[type as keyof typeof reactionEmojis].emoji}
                      </span>
                    ))}
                  </div>
                  <span>{totalReactions}</span>
                </div>
              )}
            </div>

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

            <Button variant="ghost" size="sm" onClick={handleSave} className="flex items-center space-x-1">
              {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
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
              <span>Chat</span>
            </Button>
          )}
        </div>

        {showComments && (
          <div className="w-full pt-4 border-t space-y-4">
            {/* Formulario para nuevo comentario */}
            {user && (
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="min-h-[60px] mb-2"
                  />
                  <Button onClick={handleAddComment} disabled={!newComment.trim()} size="sm">
                    Comentar
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de comentarios */}
            <div className="space-y-4">
              {topLevelComments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  <div className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.userAvatar || "/placeholder.svg"} />
                      <AvatarFallback>{comment.userName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{comment.userName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>

                      <div className="flex items-center space-x-4 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommentReaction(comment.id, "like")}
                          className="text-xs"
                        >
                          👍 {comment.reactions.filter((r) => r.type === "like").length || ""}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-xs"
                        >
                          Responder
                        </Button>
                      </div>

                      {replyingTo === comment.id && user && (
                        <div className="mt-3 ml-4">
                          <div className="flex space-x-2">
                            <Textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder={`Responder a ${comment.userName}...`}
                              className="min-h-[50px]"
                            />
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <Button size="sm" onClick={() => handleReply(comment.id)} disabled={!replyContent.trim()}>
                              Responder
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mostrar respuestas */}
                  {getCommentReplies(comment.id).map((reply) => (
                    <div key={reply.id} className="ml-12">
                      <div className="flex space-x-3">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={reply.userAvatar || "/placeholder.svg"} />
                          <AvatarFallback>{reply.userName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-xs">{reply.userName}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{reply.content}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCommentReaction(reply.id, "like")}
                            className="text-xs mt-1"
                          >
                            👍 {reply.reactions.filter((r) => r.type === "like").length || ""}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {publication.comments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay comentarios aún</p>
                  <p className="text-sm">¡Sé el primero en comentar!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
