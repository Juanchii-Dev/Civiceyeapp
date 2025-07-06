"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BarChart3, TrendingUp, Trophy } from "lucide-react"

interface Stats {
  userStats: {
    totalUsers: number
    topUsers: Array<{
      name: string
      reputation: number
      publications: number
    }>
  }
  publicationStats: {
    totalPublications: number
    recoveryRate: number
    topLocations: Array<{
      location: string
      count: number
    }>
  }
  activityStats: {
    totalComments: number
    avgCommentsPerPublication: number
    recentActivity: number
  }
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    userStats: {
      totalUsers: 0,
      topUsers: [],
    },
    publicationStats: {
      totalPublications: 0,
      recoveryRate: 0,
      topLocations: [],
    },
    activityStats: {
      totalComments: 0,
      avgCommentsPerPublication: 0,
      recentActivity: 0,
    },
  })

  useEffect(() => {
    calculateStats()
  }, [])

  const calculateStats = () => {
    const users = JSON.parse(localStorage.getItem("civiceye_users") || "[]")
    const publications = JSON.parse(localStorage.getItem("civiceye_publications") || "[]")
    const comments = JSON.parse(localStorage.getItem("civiceye_comments") || "[]")

    // Estadísticas de usuarios
    const topUsers = users
      .map((user: any) => ({
        name: user.name,
        reputation: user.reputation,
        publications: publications.filter((p: any) => p.userId === user.id).length,
      }))
      .sort((a: any, b: any) => b.reputation - a.reputation)
      .slice(0, 5)

    // Estadísticas de publicaciones
    const recoveredCount = publications.filter((p: any) => p.status === "recovered").length
    const recoveryRate = publications.length > 0 ? (recoveredCount / publications.length) * 100 : 0

    // Top ubicaciones
    const locationCounts: { [key: string]: number } = {}
    publications.forEach((pub: any) => {
      const location = pub.location.split(",")[0].trim() // Tomar solo la primera parte
      locationCounts[location] = (locationCounts[location] || 0) + 1
    })

    const topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Estadísticas de actividad
    const avgCommentsPerPublication = publications.length > 0 ? comments.length / publications.length : 0

    // Actividad reciente (últimos 7 días)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recentActivity = [
      ...publications.filter((p: any) => new Date(p.createdAt) > weekAgo),
      ...comments.filter((c: any) => new Date(c.createdAt) > weekAgo),
    ].length

    setStats({
      userStats: {
        totalUsers: users.length,
        topUsers,
      },
      publicationStats: {
        totalPublications: publications.length,
        recoveryRate: Math.round(recoveryRate),
        topLocations,
      },
      activityStats: {
        totalComments: comments.length,
        avgCommentsPerPublication: Math.round(avgCommentsPerPublication * 10) / 10,
        recentActivity,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Estadísticas Detalladas</h1>
        <p className="text-gray-600">Análisis completo de la plataforma CivicEye</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Top Usuarios por Reputación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.userStats.topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-sm">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.publications} denuncias</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{user.reputation} pts</Badge>
                </div>
              ))}
              {stats.userStats.topUsers.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Ubicaciones con Más Denuncias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.publicationStats.topLocations.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium">{location.location}</span>
                  </div>
                  <Badge variant="outline">{location.count} denuncias</Badge>
                </div>
              ))}
              {stats.publicationStats.topLocations.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Tasa de Recuperación</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{stats.publicationStats.recoveryRate}%</div>
            <p className="text-sm text-gray-600">De {stats.publicationStats.totalPublications} denuncias totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Promedio de Comentarios</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{stats.activityStats.avgCommentsPerPublication}</div>
            <p className="text-sm text-gray-600">Por denuncia publicada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">{stats.activityStats.recentActivity}</div>
            <p className="text-sm text-gray-600">Acciones en los últimos 7 días</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Resumen General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.userStats.totalUsers}</div>
              <p className="text-sm text-gray-600">Usuarios Registrados</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.publicationStats.totalPublications}</div>
              <p className="text-sm text-gray-600">Denuncias Publicadas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.activityStats.totalComments}</div>
              <p className="text-sm text-gray-600">Comentarios Totales</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((stats.publicationStats.recoveryRate / 100) * stats.publicationStats.totalPublications)}
              </div>
              <p className="text-sm text-gray-600">Objetos Recuperados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
