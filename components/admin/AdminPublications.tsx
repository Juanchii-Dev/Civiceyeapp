"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Search, Trash2, CheckCircle, Eye, MapPin, Calendar } from "lucide-react"

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

export function AdminPublications() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "recovered">("all")
  const { toast } = useToast()

  useEffect(() => {
    loadPublications()
  }, [])

  useEffect(() => {
    let filtered = publications

    if (statusFilter !== "all") {
      filtered = filtered.filter((pub) => pub.status === statusFilter)
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (pub) =>
          pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pub.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pub.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pub.userName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredPublications(filtered)
  }, [publications, searchQuery, statusFilter])

  const loadPublications = () => {
    const savedPublications = JSON.parse(localStorage.getItem("civiceye_publications") || "[]")
    setPublications(savedPublications)
  }

  const deletePublication = (publicationId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta publicación?")) {
      const updatedPublications = publications.filter((pub) => pub.id !== publicationId)
      localStorage.setItem("civiceye_publications", JSON.stringify(updatedPublications))

      // También eliminar comentarios relacionados
      const comments = JSON.parse(localStorage.getItem("civiceye_comments") || "[]")
      const updatedComments = comments.filter((comment: any) => comment.publicationId !== publicationId)
      localStorage.setItem("civiceye_comments", JSON.stringify(updatedComments))

      loadPublications()
      toast({
        title: "Publicación eliminada",
        description: "La publicación y sus comentarios han sido eliminados",
      })
    }
  }

  const toggleStatus = (publicationId: string) => {
    const updatedPublications = publications.map((pub) =>
      pub.id === publicationId ? { ...pub, status: pub.status === "active" ? "recovered" : "active" } : pub,
    )
    localStorage.setItem("civiceye_publications", JSON.stringify(updatedPublications))
    loadPublications()
    toast({
      title: "Estado actualizado",
      description: "El estado de la publicación ha sido cambiado",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Publicaciones</h1>
          <p className="text-gray-600">Administra todas las denuncias de la plataforma</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar publicaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <Button variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")}>
            Todas
          </Button>
          <Button variant={statusFilter === "active" ? "default" : "outline"} onClick={() => setStatusFilter("active")}>
            Activas
          </Button>
          <Button
            variant={statusFilter === "recovered" ? "default" : "outline"}
            onClick={() => setStatusFilter("recovered")}
          >
            Recuperadas
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPublications.map((publication) => (
          <Card key={publication.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                {publication.image && (
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={publication.image || "/placeholder.svg"}
                      alt={publication.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg truncate">{publication.title}</h3>
                      <Badge variant={publication.status === "recovered" ? "default" : "destructive"}>
                        {publication.status === "recovered" ? "Recuperado" : "Activo"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => toggleStatus(publication.id)}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {publication.status === "active" ? "Marcar Recuperado" : "Marcar Activo"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deletePublication(publication.id)}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">{publication.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="truncate">{publication.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(publication.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{publication.views || 0} vistas</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        Publicado por: <span className="font-medium">{publication.userName}</span>
                      </span>
                      <span className="text-gray-500">{new Date(publication.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPublications.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No se encontraron publicaciones</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
