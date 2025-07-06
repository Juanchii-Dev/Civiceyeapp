"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Plus, Search, MoreVertical, X } from "lucide-react"
import { useNotifications } from "@/contexts/NotificationContext"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

interface ChatInterfaceProps {
  initialConversationId?: string
}

export function ChatInterface({ initialConversationId }: ChatInterfaceProps = {}) {
  const { user } = useAuth()
  const {
    conversations,
    activeConversation,
    messages,
    sendMessage,
    setActiveConversation,
    markConversationAsRead,
    createConversation,
  } = useNotifications()

  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialConversationId) {
      setActiveConversation(initialConversationId)
      markConversationAsRead(initialConversationId)
    }
  }, [initialConversationId, setActiveConversation, markConversationAsRead])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Cargar usuarios disponibles
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("civiceye_users") || "[]")
    const otherUsers = users.filter((u: any) => u.id !== user?.id)
    setAvailableUsers(otherUsers)
  }, [user])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation) return

    sendMessage(activeConversation.id, newMessage.trim())
    setNewMessage("")
  }

  const handleConversationSelect = (conversation: any) => {
    setActiveConversation(conversation.id)
    markConversationAsRead(conversation.id)
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.participantNames.some((name) => name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const startNewChat = () => {
    if (!selectedUser || !user) return

    const conversationId = createConversation([user.id, selectedUser.id], "direct")
    setActiveConversation(conversationId)
    setShowNewChatModal(false)
    setSelectedUser(null)
  }

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Sidebar - Lista de conversaciones */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Conversaciones</h2>
            <Button size="sm" onClick={() => setShowNewChatModal(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? "No se encontraron conversaciones" : "No tienes conversaciones aún"}
              <div className="mt-2">
                <Button size="sm" onClick={() => setShowNewChatModal(true)}>
                  Crear primera conversación
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors hover:bg-white",
                    activeConversation?.id === conversation.id && "bg-white shadow-sm",
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {conversation.participantNames
                          .filter((name) => name !== user?.name)[0]
                          ?.charAt(0)
                          .toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {conversation.title ||
                            conversation.participantNames.filter((name) => name !== user?.name).join(", ")}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {conversation.lastMessage.senderName === user?.name ? "Tú: " : ""}
                          {conversation.lastMessage.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conversation.lastActivity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Header del chat */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {activeConversation.participantNames
                        .filter((name) => name !== user?.name)[0]
                        ?.charAt(0)
                        .toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {activeConversation.title ||
                        activeConversation.participantNames.filter((name) => name !== user?.name).join(", ")}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {activeConversation.type === "direct" ? "Conversación directa" : "Grupo"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mensajes */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex", message.senderId === user?.id ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                        message.senderId === user?.id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900",
                      )}
                    >
                      {message.senderId !== user?.id && (
                        <p className="text-xs font-medium mb-1 opacity-70">{message.senderName}</p>
                      )}
                      <p className="text-sm">{message.message}</p>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          message.senderId === user?.id ? "text-blue-100" : "text-gray-500",
                        )}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de mensaje */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
              <p className="text-gray-500 mb-4">Elige una conversación de la lista para comenzar a chatear</p>
              <Button onClick={() => setShowNewChatModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva conversación
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para nueva conversación */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 max-h-[80vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Nueva Conversación</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowNewChatModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Selecciona un usuario para iniciar una conversación:</p>

                <ScrollArea className="max-h-60">
                  <div className="space-y-2">
                    {availableUsers.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No hay otros usuarios disponibles</p>
                    ) : (
                      availableUsers.map((availableUser) => (
                        <div
                          key={availableUser.id}
                          onClick={() => setSelectedUser(availableUser)}
                          className={cn(
                            "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-100",
                            selectedUser?.id === availableUser.id && "bg-blue-50 border border-blue-200",
                          )}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{availableUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{availableUser.name}</p>
                            <p className="text-xs text-gray-500">{availableUser.email}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <div className="flex space-x-2">
                  <Button onClick={startNewChat} className="flex-1" disabled={!selectedUser}>
                    Crear Chat
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewChatModal(false)
                      setSelectedUser(null)
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// También exportar como default para el componente individual
export default function IndividualChatInterface({ conversationId }: { conversationId: string }) {
  const { user } = useAuth()
  const { messages, sendMessage, setActiveConversation, activeConversation } = useNotifications()
  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setActiveConversation(conversationId)
    return () => setActiveConversation(null)
  }, [conversationId, setActiveConversation])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!activeConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Conversación no encontrada</p>
      </div>
    )
  }

  const onSend = () => {
    if (!text.trim()) return
    sendMessage(conversationId, text.trim())
    setText("")
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="font-semibold border-b px-4 py-3 bg-gray-50">
        <h2 className="text-lg">
          {activeConversation.title ??
            (activeConversation.participantNames.filter((name) => name !== user?.name).join(", ") || "Chat")}
        </h2>
        <p className="text-sm text-gray-500">
          {activeConversation.type === "direct" ? "Conversación directa" : "Grupo"}
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.senderId === user?.id ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                  m.senderId === user?.id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                }`}
              >
                {m.senderId !== user?.id && <p className="text-xs font-medium mb-1 opacity-70">{m.senderName}</p>}
                <p>{m.message}</p>
                <p className={`text-xs mt-1 ${m.senderId === user?.id ? "text-blue-100" : "text-gray-500"}`}>
                  {new Date(m.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSend()
        }}
        className="flex gap-2 border-t p-3 bg-gray-50"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="flex-1"
        />
        <Button type="submit" disabled={!text.trim()}>
          Enviar
        </Button>
      </form>
    </div>
  )
}
