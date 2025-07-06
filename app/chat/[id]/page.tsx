"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Navbar } from "@/components/Navbar"
import IndividualChatInterface from "@/components/chat/ChatInterface"

interface ChatPageProps {
  params: {
    id: string
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h1>
            <p className="text-gray-600">Debes iniciar sesión para acceder al chat</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat</h1>
          <p className="text-gray-600">Conversación individual</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm h-[600px]">
          <IndividualChatInterface conversationId={params.id} />
        </div>
      </div>
    </div>
  )
}
