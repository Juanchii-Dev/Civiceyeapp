"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/contexts/AuthContext"
import { ReactionButton } from "./ReactionButton"
import { MessageCircle, Reply, Edit, Trash2, ImageIcon, MoreHorizontal } from "lucide-react"
import type { Comment } from "@/types/publication"

interface CommentSystemProps {
  publicationId: string
  comments: Comment[]
  onAddComment: (content: string, parentId?: string, mentions?: string[], images?: string[]) => void
  onEditComment: (commentId: string, content: string) => void
  onDeleteComment: (commentId: string) => void
  onReactToComment: (commentId: string, reactionType: string) => void
}

export function CommentSystem({
  publicationId,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onReactToComment,
}: CommentSystemProps) {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const topLevelComments = comments.filter((comment) => !comment.parentId)

  const getCommentReplies = (commentId: string): Comment[] => {
    return comments.filter((comment) => comment.parentId === commentId)
  }

  const handleSubmitComment = (parentId?: string) => {
    if (!user || !newComment.trim()) return

    // Detectar menciones (@usuario)
    const mentions = newComment.match(/@(\w+)/g)?.map((mention) => mention.slice(1)) || []

    // Detectar hashtags (#tag)
    const hashtags = newComment.match(/#(\w+)/g)?.map((tag) => tag.slice(1)) || []

    onAddComment(newComment.trim(), parentId, mentions)
    setNewComment("")
    setReplyingTo(null)
  }

  const handleEditComment = (commentId: string) => {
    if (!editContent.trim()) return

    onEditComment(commentId, editContent.trim())
    setEditingComment(null)
    setEditContent("")
  }

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? "ml-8 border-l-2 border-gray-200 pl-4" : ""}`}>
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.userAvatar || "/placeholder.svg"} />
              <AvatarFallback>{comment.userName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-sm">{comment.userName}</span>
                <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                {comment.isEdited && <span className="text-xs text-gray-400">(editado)</span>}
              </div>

              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                      Guardar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingComment(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 mb-2">{comment.content}</p>

                  {comment.images && comment.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {comment.images.map((image, index) => (
                        <img
                          key={index}
                          src={image || "/placeholder.svg"}
                          alt={`Imagen ${index + 1}`}
                          className="rounded-lg max-h-32 object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <ReactionButton
                        reactions={comment.reactions}
                        targetId={comment.id}
                        targetType="comment"
                        authorId={comment.userId}
                        onReact={(reactionType) => onReactToComment(comment.id, reactionType)}
                      />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(comment.id)}
                        className="flex items-center space-x-1"
                      >
                        <Reply className="w-4 h-4" />
                        <span>Responder</span>
                      </Button>
                    </div>

                    {user && comment.userId === user.id && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40">
                          <div className="space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => startEdit(comment)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-red-600"
                              onClick={() => onDeleteComment(comment.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {replyingTo === comment.id && (
            <div className="mt-4 ml-11">
              <div className="flex space-x-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`Responder a ${comment.userName}...`}
                  className="min-h-[60px]"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <Button size="sm" onClick={() => handleSubmitComment(comment.id)}>
                  Responder
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mostrar respuestas */}
      {getCommentReplies(comment.id).map((reply) => (
        <CommentItem key={reply.id} comment={reply} isReply={true} />
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <MessageCircle className="w-5 h-5" />
        <h3 className="font-semibold">Comentarios ({comments.length})</h3>
      </div>

      {user && (
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario... Usa @ para mencionar usuarios y # para hashtags"
                  className="min-h-[80px] mb-2"
                />
                <div className="flex justify-between items-center">
                  <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Imagen
                  </Button>
                  <Button onClick={() => handleSubmitComment()} disabled={!newComment.trim()}>
                    Comentar
                  </Button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {topLevelComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay comentarios aún</p>
            <p className="text-sm">¡Sé el primero en comentar!</p>
          </div>
        )}
      </div>
    </div>
  )
}
