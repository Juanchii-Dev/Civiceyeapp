"use client"

import { Navbar } from "@/components/Navbar"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle } from "lucide-react"

export default function ChatPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso Requerido</h2>
              <p className="text-gray-600">Debes iniciar sesión para acceder al chat.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mensajes</h1>
          <p className="text-gray-600">Comunícate con otros usuarios de la comunidad</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm h-[600px]">
          <ChatInterface />
        </div>
      </div>
    </div>
  )
}
