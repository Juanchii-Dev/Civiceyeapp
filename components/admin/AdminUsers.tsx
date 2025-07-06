"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Search, Trash2, Shield, Trophy } from "lucide-react"

interface AdminUser {
  id: string
  email: string
  name: string
  reputation: number
  isAdmin: boolean
  createdAt: string
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
  }, [users, searchQuery])

  const loadUsers = () => {
    const savedUsers = JSON.parse(localStorage.getItem("civiceye_users") || "[]")
    const usersWithoutPasswords = savedUsers.map((user: any) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })
    setUsers(usersWithoutPasswords)
  }

  const deleteUser = (userId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      const savedUsers = JSON.parse(localStorage.getItem("civiceye_users") || "[]")
      const updatedUsers = savedUsers.filter((user: any) => user.id !== userId)
      localStorage.setItem("civiceye_users", JSON.stringify(updatedUsers))

      // También eliminar sus publicaciones y comentarios
      const publications = JSON.parse(localStorage.getItem("civiceye_publications") || "[]")
      const updatedPublications = publications.filter((pub: any) => pub.userId !== userId)
      localStorage.setItem("civiceye_publications", JSON.stringify(updatedPublications))

      const comments = JSON.parse(localStorage.getItem("civiceye_comments") || "[]")
      const updatedComments = comments.filter((comment: any) => comment.userId !== userId)
      localStorage.setItem("civiceye_comments", JSON.stringify(updatedComments))

      loadUsers()
      toast({
        title: "Usuario eliminado",
        description: "El usuario y todo su contenido han sido eliminados",
      })
    }
  }

  const resetReputation = (userId: string) => {
    if (confirm("¿Estás seguro de que quieres resetear la reputación de este usuario?")) {
      const savedUsers = JSON.parse(localStorage.getItem("civiceye_users") || "[]")
      const updatedUsers = savedUsers.map((user: any) => (user.id === userId ? { ...user, reputation: 0 } : user))
      localStorage.setItem("civiceye_users", JSON.stringify(updatedUsers))
      loadUsers()
      toast({
        title: "Reputación reseteada",
        description: "La reputación del usuario ha sido reseteada a 0",
      })
    }
  }

  const getReputationLevel = (reputation: number) => {
    if (reputation >= 100) return { level: "Experto", color: "bg-purple-500" }
    if (reputation >= 50) return { level: "Avanzado", color: "bg-blue-500" }
    if (reputation >= 20) return { level: "Intermedio", color: "bg-green-500" }
    if (reputation >= 5) return { level: "Principiante", color: "bg-yellow-500" }
    return { level: "Nuevo", color: "bg-gray-500" }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra todos los usuarios de la plataforma</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => {
          const reputationInfo = getReputationLevel(user.reputation)
          return (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="text-lg">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        {user.isAdmin && (
                          <Badge variant="destructive">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">{user.reputation} puntos</span>
                        </div>
                        <Badge className={`${reputationInfo.color} text-white text-xs`}>{reputationInfo.level}</Badge>
                        <span className="text-xs text-gray-500">
                          Registrado: {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetReputation(user.id)}
                      disabled={user.isAdmin}
                    >
                      <Trophy className="w-4 h-4 mr-1" />
                      Reset Rep.
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteUser(user.id)} disabled={user.isAdmin}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron usuarios</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
