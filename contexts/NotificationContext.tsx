"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./AuthContext"

interface Notification {
  id: string
  userId: string
  type: "message" | "comment" | "like" | "system" | "publication"
  title: string
  message: string
  timestamp: number
  read: boolean
  actionUrl?: string
  data?: any
  priority?: "low" | "medium" | "high" | "urgent"
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  message: string
  timestamp: number
  read: boolean
}

interface Conversation {
  id: string
  participants: string[]
  participantNames: string[]
  type: "direct" | "group"
  title?: string
  lastMessage?: Message
  lastActivity: number
  unreadCount: number
}

interface NotificationPreferences {
  inApp: {
    newComment: boolean
    objectRecovered: boolean
    newDenunciaInArea: boolean
    systemUpdates: boolean
    gamificationRewards: boolean
  }
  email: {
    newComment: boolean
    objectRecovered: boolean
    weeklyDigest: boolean
    marketing: boolean
    systemUpdates: boolean
  }
  push: {
    newComment: boolean
    objectRecovered: boolean
    urgentAlerts: boolean
    dailyReminders: boolean
  }
  frequency: "immediate" | "daily" | "weekly"
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

interface NotificationContextType {
  notifications: Notification[]
  conversations: Conversation[]
  messages: Message[]
  activeConversation: Conversation | null
  preferences: NotificationPreferences
  unreadCount: number

  // Notification methods
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  deleteNotification: (notificationId: string) => void
  clearNotifications: () => void

  // Chat methods
  sendMessage: (conversationId: string, message: string) => void
  createConversation: (participants: string[], type: "direct" | "group", title?: string) => string
  setActiveConversation: (conversationId: string | null) => void
  markConversationAsRead: (conversationId: string) => void
  getConversationById: (id: string) => Conversation | undefined

  // Preferences
  updatePreferences: (newPreferences: Partial<NotificationPreferences>) => void
  requestPushPermission: () => Promise<boolean>
}

const defaultPreferences: NotificationPreferences = {
  inApp: {
    newComment: true,
    objectRecovered: true,
    newDenunciaInArea: true,
    systemUpdates: true,
    gamificationRewards: true,
  },
  email: {
    newComment: false,
    objectRecovered: true,
    weeklyDigest: true,
    marketing: false,
    systemUpdates: true,
  },
  push: {
    newComment: false,
    objectRecovered: true,
    urgentAlerts: true,
    dailyReminders: false,
  },
  frequency: "immediate",
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeConversation, setActiveConversationState] = useState<Conversation | null>(null)
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences)

  // Load data from localStorage
  useEffect(() => {
    if (user) {
      const savedNotifications = localStorage.getItem(`notifications_${user.id}`)
      const savedConversations = localStorage.getItem(`conversations_${user.id}`)
      const savedMessages = localStorage.getItem(`messages_${user.id}`)
      const savedPreferences = localStorage.getItem(`notification_preferences_${user.id}`)

      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications))
      }
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations))
      }
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages))
      }
      if (savedPreferences) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(savedPreferences) })
      }
    }
  }, [user])

  // Save to localStorage when data changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications))
    }
  }, [notifications, user])

  useEffect(() => {
    if (user) {
      localStorage.setItem(`conversations_${user.id}`, JSON.stringify(conversations))
    }
  }, [conversations, user])

  useEffect(() => {
    if (user) {
      localStorage.setItem(`messages_${user.id}`, JSON.stringify(messages))
    }
  }, [messages, user])

  useEffect(() => {
    if (user) {
      localStorage.setItem(`notification_preferences_${user.id}`, JSON.stringify(preferences))
    }
  }, [preferences, user])

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    if (!user) return

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    }

    setNotifications((prev) => [newNotification, ...prev.slice(0, 99)]) // Keep last 100 notifications
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const createConversation = (participants: string[], type: "direct" | "group", title?: string): string => {
    if (!user) return ""

    // Check if direct conversation already exists
    if (type === "direct" && participants.length === 2) {
      const existingConversation = conversations.find(
        (conv) =>
          conv.type === "direct" &&
          conv.participants.length === 2 &&
          conv.participants.includes(participants[0]) &&
          conv.participants.includes(participants[1]),
      )
      if (existingConversation) {
        return existingConversation.id
      }
    }

    const conversationId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const users = JSON.parse(localStorage.getItem("civiceye_users") || "[]")

    const participantNames = participants.map((id) => {
      const participant = users.find((u: any) => u.id === id)
      return participant ? participant.name : `Usuario ${id}`
    })

    const newConversation: Conversation = {
      id: conversationId,
      participants,
      participantNames,
      type,
      title,
      lastActivity: Date.now(),
      unreadCount: 0,
    }

    setConversations((prev) => [newConversation, ...prev])
    return conversationId
  }

  const sendMessage = (conversationId: string, message: string) => {
    if (!user || !message.trim()) return

    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      conversationId,
      senderId: user.id,
      senderName: user.name,
      message: message.trim(),
      timestamp: Date.now(),
      read: false,
    }

    setMessages((prev) => [...prev, newMessage])

    // Update conversation
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: newMessage,
              lastActivity: Date.now(),
              unreadCount: conv.participants.includes(user.id) ? conv.unreadCount : conv.unreadCount + 1,
            }
          : conv,
      ),
    )

    // Send notification to other participants
    const conversation = conversations.find((c) => c.id === conversationId)
    if (conversation) {
      conversation.participants.forEach((participantId) => {
        if (participantId !== user.id) {
          const participantNotifications = JSON.parse(localStorage.getItem(`notifications_${participantId}`) || "[]")

          const notification: Notification = {
            id: Date.now().toString() + participantId + Math.random().toString(36).substr(2, 9),
            userId: participantId,
            type: "message",
            title: "Nuevo mensaje",
            message: `${user.name}: ${message.slice(0, 50)}${message.length > 50 ? "..." : ""}`,
            timestamp: Date.now(),
            read: false,
            actionUrl: `/chat/${conversationId}`,
            priority: "medium",
          }

          participantNotifications.unshift(notification)
          localStorage.setItem(`notifications_${participantId}`, JSON.stringify(participantNotifications.slice(0, 100)))
        }
      })
    }
  }

  const setActiveConversation = (conversationId: string | null) => {
    if (conversationId) {
      const conversation = conversations.find((c) => c.id === conversationId)
      setActiveConversationState(conversation || null)
    } else {
      setActiveConversationState(null)
    }
  }

  const markConversationAsRead = (conversationId: string) => {
    setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv)))

    setMessages((prev) => prev.map((msg) => (msg.conversationId === conversationId ? { ...msg, read: true } : msg)))
  }

  const getConversationById = (id: string): Conversation | undefined => {
    return conversations.find((c) => c.id === id)
  }

  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPreferences }))
  }

  const requestPushPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission === "denied") {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const filteredMessages = activeConversation ? messages.filter((m) => m.conversationId === activeConversation.id) : []

  const value: NotificationContextType = {
    notifications,
    conversations,
    messages: filteredMessages,
    activeConversation,
    preferences,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    sendMessage,
    createConversation,
    setActiveConversation,
    markConversationAsRead,
    getConversationById,
    updatePreferences,
    requestPushPermission,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
