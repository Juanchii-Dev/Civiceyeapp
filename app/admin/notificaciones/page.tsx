"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Navbar } from "@/components/Navbar"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { NotificationAdmin } from "@/components/admin/NotificationAdmin"

export default function AdminNotificacionesPage() {
  const { user } = useAuth()

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
            <p className="text-gray-600">No tienes permisos para acceder a esta página</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <AdminSidebar />

        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Notificaciones</h1>
            <p className="text-gray-600">Administra el sistema de notificaciones y comunicaciones</p>
          </div>

          <NotificationAdmin />
        </div>
      </div>
    </div>
  )
}
