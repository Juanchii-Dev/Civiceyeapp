"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Search, Trash2, MessageCircle } from "lucide-react"

interface Comment {
  id: string
  publicationId: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [filteredComments, setFilteredComments] = useState<Comment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadComments()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredComments(comments)
    } else {
      const filtered = comments.filter(
        (comment) =>
          comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comment.userName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredComments(filtered)
    }
  }, [comments, searchQuery])

  const loadComments = () => {
    const savedComments = JSON.parse(localStorage.getItem("civiceye_comments") || "[]")
    setComments(savedComments)
  }

  const deleteComment = (commentId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
      const updatedComments = comments.filter((comment) => comment.id !== commentId)
      localStorage.setItem("civiceye_comments", JSON.stringify(updatedComments))
      loadComments()
      toast({
        title: "Comentario eliminado",
        description: "El comentario ha sido eliminado exitosamente",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Comentarios</h1>
          <p className="text-gray-600">Modera todos los comentarios de la plataforma</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar comentarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredComments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex space-x-4 flex-1">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{comment.userName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{comment.userName}</span>
                      <span className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteComment(comment.id)}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredComments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron comentarios</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
