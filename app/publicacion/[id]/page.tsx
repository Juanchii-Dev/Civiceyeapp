"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Calendar, Eye, MessageCircle, CheckCircle, Trash2 } from "lucide-react"
import { useGamification } from "@/contexts/GamificationContext"

interface Publication {
  id: string
  title: string
  description: string
  location: string
  date: string
  image: string
  userId: string
  userName: string
  status: "active" | "recovered"
  createdAt: string
  views: number
}

interface Comment {
  id: string
  publicationId: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export default function PublicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [publication, setPublication] = useState<Publication | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { updateUserStats } = useGamification()

  useEffect(() => {
    const publicationId = params.id as string
    const publications = JSON.parse(localStorage.getItem("civiceye_publications") || "[]")
    const foundPublication = publications.find((p: Publication) => p.id === publicationId)

    if (foundPublication) {
      // Incrementar vistas
      foundPublication.views = (foundPublication.views || 0) + 1
      const updatedPublications = publications.map((p: Publication) => (p.id === publicationId ? foundPublication : p))
      localStorage.setItem("civiceye_publications", JSON.stringify(updatedPublications))
      setPublication(foundPublication)
    }

    // Cargar comentarios
    const allComments = JSON.parse(localStorage.getItem("civiceye_comments") || "[]")
    const publicationComments = allComments.filter((c: Comment) => c.publicationId === publicationId)
    setComments(publicationComments)
  }, [params.id])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para comentar",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) return

    setIsLoading(true)

    try {
      const allComments = JSON.parse(localStorage.getItem("civiceye_comments") || "[]")

      const comment: Comment = {
        id: Date.now().toString(),
        publicationId: params.id as string,
        userId: user.id,
        userName: user.name,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
      }

      allComments.push(comment)
      localStorage.setItem("civiceye_comments", JSON.stringify(allComments))
      setComments([...comments, comment])
      setNewComment("")
      updateUserStats("add_comment")

      // Aumentar reputación del usuario que comenta
      const users = JSON.parse(localStorage.getItem("civiceye_users") || "[]")
      const updatedUsers = users.map((u: any) => (u.id === user.id ? { ...u, reputation: u.reputation + 1 } : u))
      localStorage.setItem("civiceye_users", JSON.stringify(updatedUsers))

      toast({
        title: "Comentario agregado",
        description: "Tu comentario ha sido publicado",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el comentario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRecovered = () => {
    if (!publication || !user || publication.userId !== user.id) return

    const publications = JSON.parse(localStorage.getItem("civiceye_publications") || "[]")
    const updatedPublications = publications.map((p: Publication) =>
      p.id === publication.id ? { ...p, status: "recovered" } : p,
    )
    localStorage.setItem("civiceye_publications", JSON.stringify(updatedPublications))
    setPublication({ ...publication, status: "recovered" })
    updateUserStats("recover_object")

    toast({
      title: "Objeto marcado como recuperado",
      description: "¡Felicitaciones por recuperar tu objeto!",
    })
  }

  const handleDeletePublication = () => {
    if (!publication || !user || publication.userId !== user.id) return

    const publications = JSON.parse(localStorage.getItem("civiceye_publications") || "[]")
    const updatedPublications = publications.filter((p: Publication) => p.id !== publication.id)
    localStorage.setItem("civiceye_publications", JSON.stringify(updatedPublications))

    toast({
      title: "Publicación eliminada",
      description: "Tu publicación ha sido eliminada",
    })

    router.push("/")
  }

  if (!publication) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p>Publicación no encontrada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant={publication.status === "recovered" ? "default" : "destructive"}>
                    {publication.status === "recovered" ? "Recuperado" : "Activo"}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{publication.views} vistas</span>
                  </div>
                </div>
                <CardTitle className="text-2xl mb-4">{publication.title}</CardTitle>
              </div>

              {user && publication.userId === user.id && (
                <div className="flex space-x-2">
                  {publication.status === "active" && (
                    <Button onClick={handleMarkAsRecovered} size="sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Marcar como recuperado
                    </Button>
                  )}
                  <Button onClick={handleDeletePublication} variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {publication.image && (
              <div className="mb-6">
                <img
                  src={publication.image || "/placeholder.svg"}
                  alt={publication.title}
                  className="w-full max-h-96 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-gray-700 mb-4">{publication.description}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Detalles</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{publication.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{new Date(publication.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Publicado por</h3>
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{publication.userName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{publication.userName}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Comentarios ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user && (
              <form onSubmit={handleAddComment} className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  rows={3}
                  className="mb-2"
                />
                <Button type="submit" disabled={isLoading || !newComment.trim()}>
                  {isLoading ? "Enviando..." : "Comentar"}
                </Button>
              </form>
            )}

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">{comment.userName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{comment.userName}</span>
                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay comentarios aún. ¡Sé el primero en comentar!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
