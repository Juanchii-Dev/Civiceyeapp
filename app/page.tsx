"use client"

import { useState, useEffect } from "react"
import { SearchBar } from "@/components/SearchBar"
import { PublicationCard } from "@/components/PublicationCard"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, Clock, MapPin } from "lucide-react"
import Link from "next/link"

// Datos de ejemplo mejorados
const samplePublications = [
  {
    id: "1",
    title: "Bache peligroso en Av. Principal",
    description:
      "Hay un bache muy grande en la Av. Principal que está causando accidentes. Necesita reparación urgente.",
    category: "Infraestructura",
    location: "Av. Principal 123, Centro",
    date: "2024-01-15",
    author: "María González",
    authorId: "user1",
    authorAvatar: "/placeholder.svg",
    reactions: [
      { id: "r1", userId: "user2", userName: "Juan Pérez", type: "like" as const, timestamp: Date.now() },
      { id: "r2", userId: "user3", userName: "Ana López", type: "angry" as const, timestamp: Date.now() },
    ],
    comments: [
      {
        id: "c1",
        publicationId: "1",
        userId: "user2",
        userName: "Juan Pérez",
        userAvatar: "/placeholder.svg",
        content: "Yo también he visto este bache, es muy peligroso especialmente de noche.",
        createdAt: "2024-01-15T10:30:00Z",
        reactions: [
          { id: "cr1", userId: "user1", userName: "María González", type: "like" as const, timestamp: Date.now() },
        ],
        replies: [],
        isEdited: false,
      },
    ],
    shares: 5,
    views: 120,
    images: ["/placeholder.svg?height=300&width=400"],
    status: "pending" as const,
    priority: "high" as const,
    savedBy: [],
    followedBy: ["user2"],
  },
  {
    id: "2",
    title: "Falta de iluminación en parque",
    description: "El parque San Martín no tiene suficiente iluminación nocturna, lo que genera inseguridad.",
    category: "Seguridad",
    location: "Parque San Martín",
    date: "2024-01-14",
    author: "Carlos Ruiz",
    authorId: "user3",
    authorAvatar: "/placeholder.svg",
    reactions: [{ id: "r3", userId: "user1", userName: "María González", type: "sad" as const, timestamp: Date.now() }],
    comments: [],
    shares: 3,
    views: 85,
    images: ["/placeholder.svg?height=300&width=400"],
    status: "verified" as const,
    priority: "medium" as const,
    savedBy: ["user1"],
    followedBy: [],
  },
  {
    id: "3",
    title: "Basura acumulada en esquina",
    description: "Se está acumulando basura en la esquina de las calles 9 de Julio y San Martín.",
    category: "Limpieza",
    location: "9 de Julio y San Martín",
    date: "2024-01-13",
    author: "Ana López",
    authorId: "user4",
    authorAvatar: "/placeholder.svg",
    reactions: [
      { id: "r4", userId: "user1", userName: "María González", type: "angry" as const, timestamp: Date.now() },
      { id: "r5", userId: "user2", userName: "Juan Pérez", type: "sad" as const, timestamp: Date.now() },
    ],
    comments: [
      {
        id: "c2",
        publicationId: "3",
        userId: "user1",
        userName: "María González",
        userAvatar: "/placeholder.svg",
        content: "Es un problema recurrente en esa zona, deberían poner más contenedores.",
        createdAt: "2024-01-13T15:20:00Z",
        reactions: [],
        replies: [
          {
            id: "c3",
            publicationId: "3",
            userId: "user4",
            userName: "Ana López",
            userAvatar: "/placeholder.svg",
            content: "Exacto, ya he reportado esto varias veces.",
            createdAt: "2024-01-13T16:00:00Z",
            reactions: [],
            replies: [],
            parentId: "c2",
            isEdited: false,
          },
        ],
        isEdited: false,
      },
    ],
    shares: 8,
    views: 200,
    images: ["/placeholder.svg?height=300&width=400"],
    status: "resolved" as const,
    priority: "low" as const,
    savedBy: [],
    followedBy: ["user1", "user2"],
  },
]

export default function HomePage() {
  const { user } = useAuth()
  const [publications, setPublications] = useState(samplePublications)
  const [filteredPublications, setFilteredPublications] = useState(samplePublications)
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "nearby">("recent")

  useEffect(() => {
    // Aplicar ordenamiento
    const sorted = [...filteredPublications]
    switch (sortBy) {
      case "recent":
        sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case "popular":
        sorted.sort((a, b) => b.reactions.length + b.comments.length - (a.reactions.length + a.comments.length))
        break
      case "nearby":
        // Por ahora ordenar por nombre de ubicación
        sorted.sort((a, b) => a.location.localeCompare(b.location))
        break
    }
    setFilteredPublications(sorted)
  }, [sortBy])

  const handleUpdatePublication = (updatedPublication: any) => {
    const updatedPublications = publications.map((pub) => (pub.id === updatedPublication.id ? updatedPublication : pub))
    setPublications(updatedPublications)
    setFilteredPublications(updatedPublications)
  }

  const handleDeletePublication = (publicationId: string) => {
    const updatedPublications = publications.filter((pub) => pub.id !== publicationId)
    setPublications(updatedPublications)
    setFilteredPublications(updatedPublications)
  }

  const handleSearch = (searchTerm: string, filters: any) => {
    let filtered = publications

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (pub) =>
          pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pub.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pub.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Aplicar filtros
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((pub) => pub.category === filters.category)
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((pub) => pub.status === filters.status)
    }

    if (filters.priority && filters.priority !== "all") {
      filtered = filtered.filter((pub) => pub.priority === filters.priority)
    }

    setFilteredPublications(filtered)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CivicEye</h1>
          <p className="text-gray-600">Reporta y sigue el progreso de los problemas en tu comunidad</p>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Botones de acción y filtros */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={sortBy === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("recent")}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Recientes
            </Button>
            <Button
              variant={sortBy === "popular" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("popular")}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Populares
            </Button>
            <Button
              variant={sortBy === "nearby" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("nearby")}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Cercanos
            </Button>
          </div>

          {user && (
            <Link href="/publicar">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Publicación
              </Button>
            </Link>
          )}
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{publications.length}</div>
            <div className="text-sm text-gray-600">Total Reportes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {publications.filter((p) => p.status === "resolved").length}
            </div>
            <div className="text-sm text-gray-600">Resueltos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {publications.filter((p) => p.status === "pending").length}
            </div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {publications.reduce((acc, p) => acc + p.reactions.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Reacciones</div>
          </div>
        </div>

        {/* Lista de publicaciones */}
        <div className="space-y-6">
          {filteredPublications.length > 0 ? (
            filteredPublications.map((publication) => (
              <PublicationCard
                key={publication.id}
                publication={publication}
                onUpdate={handleUpdatePublication}
                onDelete={handleDeletePublication}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron publicaciones</h3>
                <p>Intenta ajustar tus filtros de búsqueda o crea una nueva publicación.</p>
              </div>
              {user && (
                <Link href="/publicar">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Publicación
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
