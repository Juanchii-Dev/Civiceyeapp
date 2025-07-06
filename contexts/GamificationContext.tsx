"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: "participation" | "achievement" | "social" | "special"
  rarity: "common" | "rare" | "epic" | "legendary"
  condition: (user: any, stats: any) => boolean
  points: number
}

interface Mission {
  id: string
  title: string
  description: string
  type: "daily" | "weekly" | "monthly"
  target: number
  current: number
  reward: {
    points: number
    experience: number
    badge?: string
  }
  expiresAt: string
  completed: boolean
}

interface Tournament {
  id: string
  name: string
  description: string
  type: "individual" | "neighborhood"
  startDate: string
  endDate: string
  participants: Array<{
    userId: string
    userName: string
    score: number
    neighborhood?: string
  }>
  prizes: Array<{
    position: number
    points: number
    badge?: string
  }>
  active: boolean
}

interface GamificationContextType {
  badges: Badge[]
  missions: Mission[]
  tournaments: Tournament[]
  userStats: any
  checkAndAwardBadges: () => void
  completeMission: (missionId: string) => void
  updateUserStats: (action: string, data?: any) => void
  getLeaderboard: (type: "points" | "level" | "streak") => any[]
  getUserLevel: (experience: number) => { level: number; nextLevelXP: number; progress: number }
  generateDailyMissions: () => void
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

// Definición de badges
const BADGES: Badge[] = [
  // Participación
  {
    id: "first_post",
    name: "Primera Denuncia",
    description: "Publicaste tu primera denuncia",
    icon: "🎯",
    category: "participation",
    rarity: "common",
    condition: (user) => user.totalDenuncias >= 1,
    points: 10,
  },
  {
    id: "active_reporter",
    name: "Reportero Activo",
    description: "Publicaste 10 denuncias",
    icon: "📰",
    category: "participation",
    rarity: "rare",
    condition: (user) => user.totalDenuncias >= 10,
    points: 50,
  },
  {
    id: "super_reporter",
    name: "Super Reportero",
    description: "Publicaste 50 denuncias",
    icon: "🏆",
    category: "participation",
    rarity: "epic",
    condition: (user) => user.totalDenuncias >= 50,
    points: 200,
  },

  // Logros
  {
    id: "first_recovery",
    name: "Primera Recuperación",
    description: "Recuperaste tu primer objeto",
    icon: "✅",
    category: "achievement",
    rarity: "rare",
    condition: (user) => user.objetosRecuperados >= 1,
    points: 100,
  },
  {
    id: "recovery_master",
    name: "Maestro de Recuperación",
    description: "Recuperaste 10 objetos",
    icon: "🎖️",
    category: "achievement",
    rarity: "legendary",
    condition: (user) => user.objetosRecuperados >= 10,
    points: 500,
  },

  // Social
  {
    id: "helpful_citizen",
    name: "Ciudadano Colaborador",
    description: "Hiciste 25 comentarios útiles",
    icon: "💬",
    category: "social",
    rarity: "rare",
    condition: (user) => user.totalComentarios >= 25,
    points: 75,
  },
  {
    id: "community_leader",
    name: "Líder Comunitario",
    description: "Alcanzaste nivel 10",
    icon: "👑",
    category: "social",
    rarity: "epic",
    condition: (user) => user.level >= 10,
    points: 300,
  },

  // Especiales
  {
    id: "streak_warrior",
    name: "Guerrero de Racha",
    description: "Mantuviste una racha de 30 días",
    icon: "🔥",
    category: "special",
    rarity: "legendary",
    condition: (user) => user.streak >= 30,
    points: 1000,
  },
  {
    id: "early_adopter",
    name: "Adoptador Temprano",
    description: "Uno de los primeros 100 usuarios",
    icon: "🌟",
    category: "special",
    rarity: "legendary",
    condition: (user, stats) => stats.userRank <= 100,
    points: 500,
  },
]

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [badges] = useState<Badge[]>(BADGES)
  const [missions, setMissions] = useState<Mission[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [userStats, setUserStats] = useState<any>({})

  useEffect(() => {
    if (user) {
      loadUserStats()
      generateDailyMissions()
      loadTournaments()
    }
  }, [user])

  const loadUserStats = () => {
    const users = JSON.parse(localStorage.getItem("civiceye_users") || "[]")
    const publications = JSON.parse(localStorage.getItem("civiceye_publications") || "[]")
    const comments = JSON.parse(localStorage.getItem("civiceye_comments") || "[]")

    const userPublications = publications.filter((p: any) => p.userId === user?.id)
    const userComments = comments.filter((c: any) => c.userId === user?.id)
    const recoveredObjects = userPublications.filter((p: any) => p.status === "recovered")

    const stats = {
      totalUsers: users.length,
      userRank: users.findIndex((u: any) => u.id === user?.id) + 1,
      totalDenuncias: userPublications.length,
      totalComentarios: userComments.length,
      objetosRecuperados: recoveredObjects.length,
    }

    setUserStats(stats)
  }

  const getUserLevel = (experience: number) => {
    const level = Math.floor(experience / 100) + 1
    const nextLevelXP = level * 100
    const progress = ((experience % 100) / 100) * 100

    return { level, nextLevelXP, progress }
  }

  const updateUserStats = (action: string, data?: any) => {
    if (!user) return

    const users = JSON.parse(localStorage.getItem("civiceye_users") || "[]")
    const userIndex = users.findIndex((u: any) => u.id === user.id)

    if (userIndex === -1) return

    let pointsEarned = 0
    let experienceEarned = 0

    switch (action) {
      case "publish_report":
        users[userIndex].totalDenuncias += 1
        pointsEarned = 20
        experienceEarned = 15
        break
      case "add_comment":
        users[userIndex].totalComentarios += 1
        pointsEarned = 5
        experienceEarned = 3
        break
      case "recover_object":
        users[userIndex].objetosRecuperados += 1
        pointsEarned = 100
        experienceEarned = 50
        break
      case "daily_login":
        pointsEarned = 10
        experienceEarned = 5
        updateStreak()
        break
    }

    users[userIndex].points = (users[userIndex].points || 0) + pointsEarned
    users[userIndex].experience = (users[userIndex].experience || 0) + experienceEarned
    users[userIndex].lastActivity = new Date().toISOString()

    const levelInfo = getUserLevel(users[userIndex].experience)
    const oldLevel = users[userIndex].level || 1
    users[userIndex].level = levelInfo.level

    localStorage.setItem("civiceye_users", JSON.stringify(users))

    // Notificar si subió de nivel
    if (levelInfo.level > oldLevel) {
      toast({
        title: "¡Subiste de nivel!",
        description: `Ahora eres nivel ${levelInfo.level}`,
      })
    }

    // Notificar puntos ganados
    if (pointsEarned > 0) {
      toast({
        title: `+${pointsEarned} puntos`,
        description: `+${experienceEarned} XP`,
      })
    }

    checkAndAwardBadges()
    loadUserStats()
  }

  const updateStreak = () => {
    const users = JSON.parse(localStorage.getItem("civiceye_users") || "[]")
    const userIndex = users.findIndex((u: any) => u.id === user?.id)

    if (userIndex === -1) return

    const lastActivity = new Date(users[userIndex].lastActivity || new Date())
    const today = new Date()
    const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      users[userIndex].streak = (users[userIndex].streak || 0) + 1
    } else if (diffDays > 1) {
      users[userIndex].streak = 1
    }

    localStorage.setItem("civiceye_users", JSON.stringify(users))
  }

  const checkAndAwardBadges = () => {
    if (!user) return

    const users = JSON.parse(localStorage.getItem("civiceye_users") || "[]")
    const userIndex = users.findIndex((u: any) => u.id === user.id)

    if (userIndex === -1) return

    const currentUser = users[userIndex]
    const currentBadges = currentUser.badges || []

    badges.forEach((badge) => {
      if (!currentBadges.includes(badge.id) && badge.condition(currentUser, userStats)) {
        currentBadges.push(badge.id)
        currentUser.points = (currentUser.points || 0) + badge.points

        toast({
          title: "¡Nuevo logro desbloqueado!",
          description: `${badge.icon} ${badge.name}: ${badge.description}`,
        })
      }
    })

    users[userIndex].badges = currentBadges
    localStorage.setItem("civiceye_users", JSON.stringify(users))
  }

  const generateDailyMissions = () => {
    const today = new Date().toDateString()
    const savedMissions = JSON.parse(localStorage.getItem(`civiceye_missions_${user?.id}_${today}`) || "[]")

    if (savedMissions.length > 0) {
      setMissions(savedMissions)
      return
    }

    const dailyMissions: Mission[] = [
      {
        id: "daily_comment",
        title: "Ciudadano Activo",
        description: "Comenta en 3 denuncias diferentes",
        type: "daily",
        target: 3,
        current: 0,
        reward: { points: 30, experience: 20 },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
      },
      {
        id: "daily_view",
        title: "Vigilante Atento",
        description: "Revisa 10 denuncias",
        type: "daily",
        target: 10,
        current: 0,
        reward: { points: 20, experience: 15 },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
      },
      {
        id: "daily_share",
        title: "Difusor Comunitario",
        description: "Ayuda a difundir 1 denuncia",
        type: "daily",
        target: 1,
        current: 0,
        reward: { points: 25, experience: 10, badge: "helpful_citizen" },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
      },
    ]

    setMissions(dailyMissions)
    localStorage.setItem(`civiceye_missions_${user?.id}_${today}`, JSON.stringify(dailyMissions))
  }

  const completeMission = (missionId: string) => {
    const updatedMissions = missions.map((mission) => {
      if (mission.id === missionId && !mission.completed) {
        const newMission = { ...mission, completed: true }

        // Otorgar recompensas
        updateUserStats("complete_mission", mission.reward)

        toast({
          title: "¡Misión completada!",
          description: `${mission.title} - +${mission.reward.points} puntos`,
        })

        return newMission
      }
      return mission
    })

    setMissions(updatedMissions)
    const today = new Date().toDateString()
    localStorage.setItem(`civiceye_missions_${user?.id}_${today}`, JSON.stringify(updatedMissions))
  }

  const getLeaderboard = (type: "points" | "level" | "streak") => {
    const users = JSON.parse(localStorage.getItem("civiceye_users") || "[]")

    return users
      .filter((u: any) => !u.isAdmin)
      .sort((a: any, b: any) => (b[type] || 0) - (a[type] || 0))
      .slice(0, 10)
      .map((u: any, index: number) => ({
        rank: index + 1,
        name: u.name,
        value: u[type] || 0,
        level: u.level || 1,
        badges: u.badges || [],
      }))
  }

  const loadTournaments = () => {
    // Crear torneo mensual si no existe
    const currentMonth = new Date().getMonth()
    const tournamentId = `monthly_${currentMonth}`

    const savedTournaments = JSON.parse(localStorage.getItem("civiceye_tournaments") || "[]")
    let monthlyTournament = savedTournaments.find((t: any) => t.id === tournamentId)

    if (!monthlyTournament) {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      const endOfMonth = new Date()
      endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0)

      monthlyTournament = {
        id: tournamentId,
        name: "Torneo Mensual de Colaboración",
        description: "Compite con otros usuarios para ser el más colaborativo del mes",
        type: "individual",
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
        participants: [],
        prizes: [
          { position: 1, points: 1000, badge: "monthly_champion" },
          { position: 2, points: 500, badge: "monthly_runner_up" },
          { position: 3, points: 250, badge: "monthly_third" },
        ],
        active: true,
      }

      savedTournaments.push(monthlyTournament)
      localStorage.setItem("civiceye_tournaments", JSON.stringify(savedTournaments))
    }

    setTournaments(savedTournaments)
  }

  return (
    <GamificationContext.Provider
      value={{
        badges,
        missions,
        tournaments,
        userStats,
        checkAndAwardBadges,
        completeMission,
        updateUserStats,
        getLeaderboard,
        getUserLevel,
        generateDailyMissions,
      }}
    >
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamification() {
  const context = useContext(GamificationContext)
  if (context === undefined) {
    throw new Error("useGamification must be used within a GamificationProvider")
  }
  return context
}
