"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { PublicationCard } from "@/components/PublicationCard"
import { SearchBar } from "@/components/SearchBar"
import { Button } from "@/components/ui/button"

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

export default function HomePage() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([])
  const [filter, setFilter] = useState<"all" | "active" | "recovered">("all")

  useEffect(() => {
    const savedPublications = JSON.parse(localStorage.getItem("civiceye_publications") || "[]")
    setPublications(savedPublications)
    setFilteredPublications(savedPublications)
  }, [])

  useEffect(() => {
    let filtered = publications
    if (filter === "active") {
      filtered = publications.filter((p) => p.status === "active")
    } else if (filter === "recovered") {
      filtered = publications.filter((p) => p.status === "recovered")
    }
    setFilteredPublications(filtered)
  }, [publications, filter])

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredPublications(publications)
      return
    }

    const filtered = publications.filter(
      (pub) =>
        pub.title.toLowerCase().includes(query.toLowerCase()) ||
        pub.description.toLowerCase().includes(query.toLowerCase()) ||
        pub.location.toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredPublications(filtered)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Red Ciudadana CivicEye</h1>
          <p className="text-xl text-gray-600 mb-8">
            Ayudamos a recuperar objetos robados a través de la colaboración ciudadana
          </p>

          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            Todas las denuncias
          </Button>
          <Button variant={filter === "active" ? "default" : "outline"} onClick={() => setFilter("active")}>
            Activas
          </Button>
          <Button variant={filter === "recovered" ? "default" : "outline"} onClick={() => setFilter("recovered")}>
            Recuperadas
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPublications.map((publication) => (
            <PublicationCard key={publication.id} publication={publication} />
          ))}
        </div>

        {filteredPublications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron denuncias</p>
          </div>
        )}
      </div>
    </div>
  )
}
