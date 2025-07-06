"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"
import { useGamification } from "@/contexts/GamificationContext"

export default function PublicarPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { updateUserStats } = useGamification()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para publicar",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const publications = JSON.parse(localStorage.getItem("civiceye_publications") || "[]")

      const newPublication = {
        id: Date.now().toString(),
        title,
        description,
        location,
        date,
        image: image || "",
        userId: user.id,
        userName: user.name,
        status: "active" as const,
        createdAt: new Date().toISOString(),
        views: 0,
      }

      publications.push(newPublication)
      localStorage.setItem("civiceye_publications", JSON.stringify(publications))
      updateUserStats("publish_report")

      toast({
        title: "Denuncia publicada",
        description: "Tu denuncia ha sido publicada exitosamente",
      })

      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo publicar la denuncia",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Publicar Denuncia</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Título de la denuncia</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Ej: Robo de bicicleta roja en el centro"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción detallada</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Describe el objeto robado, circunstancias del robo, características distintivas..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="location">Ubicación del robo</Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="Ej: Av. Corrientes 1234, CABA"
                />
              </div>

              <div>
                <Label htmlFor="date">Fecha del robo</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>

              <div>
                <Label>Imagen del objeto (opcional)</Label>
                <div className="mt-2">
                  {image ? (
                    <div className="relative">
                      <img
                        src={image || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">Haz clic para subir una imagen</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Publicando..." : "Publicar Denuncia"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
