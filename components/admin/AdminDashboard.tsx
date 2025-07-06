"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, MessageCircle, CheckCircle, TrendingUp, AlertTriangle } from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalPublications: number
  activePublications: number
  recoveredObjects: number
  totalComments: number
  recentActivity: any[]
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPublications: 0,
    activePublications: 0,
    recoveredObjects: 0,
    totalComments: 0,
    recentActivity: [],
  })

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("civiceye_users") || "[]")
    const publications = JSON.parse(localStorage.getItem("civiceye_publications") || "[]")
    const comments = JSON.parse(localStorage.getItem("civiceye_comments") || "[]")

    const activePublications = publications.filter((p: any) => p.status === "active")
    const recoveredObjects = publications.filter((p: any) => p.status === "recovered")

    // Actividad reciente (últimas 10 acciones)
    const recentActivity = [
      ...publications.slice(-5).map((p: any) => ({
        type: "publication",
        title: `Nueva denuncia: ${p.title}`,
        user: p.userName,
        date: p.createdAt,
      })),
      ...comments.slice(-5).map((c: any) => ({
        type: "comment",
        title: "Nuevo comentario",
        user: c.userName,
        date: c.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)

    setStats({
      totalUsers: users.length,
      totalPublications: publications.length,
      activePublications: activePublications.length,
      recoveredObjects: recoveredObjects.length,
      totalComments: comments.length,
      recentActivity,
    })
  }, [])

  const statCards = [
    {
      title: "Total Usuarios",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Denuncias",
      value: stats.totalPublications,
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Denuncias Activas",
      value: stats.activePublications,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Objetos Recuperados",
      value: stats.recoveredObjects,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Comentarios",
      value: stats.totalComments,
      icon: MessageCircle,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600">Resumen general de la plataforma CivicEye</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-500">por {activity.user}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={activity.type === "publication" ? "default" : "secondary"}>
                      {activity.type === "publication" ? "Denuncia" : "Comentario"}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {stats.recentActivity.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasa de Recuperación</span>
                <span className="font-semibold">
                  {stats.totalPublications > 0
                    ? Math.round((stats.recoveredObjects / stats.totalPublications) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Promedio Comentarios/Denuncia</span>
                <span className="font-semibold">
                  {stats.totalPublications > 0
                    ? Math.round((stats.totalComments / stats.totalPublications) * 10) / 10
                    : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Usuarios Activos</span>
                <span className="font-semibold">{stats.totalUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
