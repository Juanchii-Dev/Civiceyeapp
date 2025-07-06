"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
  reputation: number
  isAdmin: boolean
  createdAt: string
  // Nuevos campos de gamificación
  level: number
  experience: number
  points: number
  badges: string[]
  streak: number
  lastActivity: string
  completedMissions: string[]
  totalDenuncias: number
  totalComentarios: number
  objetosRecuperados: number
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("civiceye_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("civiceye_users") || "[]")
    const foundUser = users.find((u: any) => u.email === email && u.password === password)

    if (foundUser) {
      const userWithoutPassword = { ...foundUser }
      delete userWithoutPassword.password
      setUser(userWithoutPassword)
      localStorage.setItem("civiceye_user", JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("civiceye_users") || "[]")

    if (users.find((u: any) => u.email === email)) {
      return false
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      reputation: 0,
      isAdmin: email === "juanchilopezpachao7@gmail.com" || email === "admin@civiceye.com",
      createdAt: new Date().toISOString(),
      // Inicializar gamificación
      level: 1,
      experience: 0,
      points: 0,
      badges: [],
      streak: 0,
      lastActivity: new Date().toISOString(),
      completedMissions: [],
      totalDenuncias: 0,
      totalComentarios: 0,
      objetosRecuperados: 0,
    }

    users.push(newUser)
    localStorage.setItem("civiceye_users", JSON.stringify(users))

    const userWithoutPassword = { ...newUser }
    delete userWithoutPassword.password
    setUser(userWithoutPassword)
    localStorage.setItem("civiceye_user", JSON.stringify(userWithoutPassword))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("civiceye_user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
