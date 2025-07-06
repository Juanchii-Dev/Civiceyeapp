"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"

interface AnalyticsData {
  // Métricas generales
  totalUsers: number
  totalPublications: number
  totalComments: number
  recoveryRate: number

  // Métricas temporales
  dailyStats: Array<{
    date: string
    publications: number
    comments: number
    recoveries: number
    newUsers: number
  }>

  // Análisis geográfico
  locationStats: Array<{
    location: string
    count: number
    recoveryRate: number
    avgResponseTime: number
  }>

  // Análisis por categorías
  categoryStats: Array<{
    category: string
    count: number
    recoveryRate: number
    avgValue: number
  }>

  // Análisis de usuarios
  userEngagement: Array<{
    userId: string
    userName: string
    publications: number
    comments: number
    recoveries: number
    lastActivity: string
    engagementScore: number
  }>

  // Tendencias y predicciones
  trends: {
    publicationTrend: number
    recoveryTrend: number
    userGrowthTrend: number
    seasonalPatterns: Array<{
      month: string
      incidents: number
      recoveries: number
    }>
  }

  // Análisis de efectividad
  effectiveness: {
    avgRecoveryTime: number
    mostEffectiveHours: Array<{ hour: number; recoveryRate: number }>
    communityImpact: number
    platformHealth: number
  }
}

interface AnalyticsContextType {
  analyticsData: AnalyticsData | null
  isLoading: boolean
  refreshAnalytics: () => void
  generateReport: (type: string, filters?: any) => any
  exportData: (format: "csv" | "json" | "pdf", data: any) => void
  getPredictions: (type: string) => any
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      refreshAnalytics()
    }
  }, [user])

  const refreshAnalytics = async () => {
    setIsLoading(true)

    try {
      const users = JSON.parse(localStorage.getItem("civiceye_users") || "[]")
      const publications = JSON.parse(localStorage.getItem("civiceye_publications") || "[]")
      const comments = JSON.parse(localStorage.getItem("civiceye_comments") || "[]")

      // Calcular métricas generales
      const totalUsers = users.length
      const totalPublications = publications.length
      const totalComments = comments.length
      const recoveredPublications = publications.filter((p: any) => p.status === "recovered")
      const recoveryRate = totalPublications > 0 ? (recoveredPublications.length / totalPublications) * 100 : 0

      // Generar estadísticas diarias (últimos 30 días)
      const dailyStats = generateDailyStats(publications, comments, users)

      // Análisis geográfico
      const locationStats = generateLocationStats(publications)

      // Análisis por categorías
      const categoryStats = generateCategoryStats(publications)

      // Análisis de engagement de usuarios
      const userEngagement = generateUserEngagement(users, publications, comments)

      // Tendencias y predicciones
      const trends = generateTrends(publications, users)

      // Análisis de efectividad
      const effectiveness = generateEffectivenessMetrics(publications, comments)

      const analytics: AnalyticsData = {
        totalUsers,
        totalPublications,
        totalComments,
        recoveryRate,
        dailyStats,
        locationStats,
        categoryStats,
        userEngagement,
        trends,
        effectiveness,
      }

      setAnalyticsData(analytics)
    } catch (error) {
      console.error("Error generating analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateDailyStats = (publications: any[], comments: any[], users: any[]) => {
    const stats = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayPublications = publications.filter((p) => new Date(p.createdAt).toISOString().split("T")[0] === dateStr)

      const dayComments = comments.filter((c) => new Date(c.createdAt).toISOString().split("T")[0] === dateStr)

      const dayUsers = users.filter((u) => new Date(u.createdAt).toISOString().split("T")[0] === dateStr)

      const dayRecoveries = dayPublications.filter((p) => p.status === "recovered")

      stats.push({
        date: dateStr,
        publications: dayPublications.length,
        comments: dayComments.length,
        recoveries: dayRecoveries.length,
        newUsers: dayUsers.length,
      })
    }

    return stats
  }

  const generateLocationStats = (publications: any[]) => {
    const locationMap = new Map()

    publications.forEach((pub) => {
      const location = pub.location.split(",")[0].trim()
      if (!locationMap.has(location)) {
        locationMap.set(location, {
          location,
          publications: [],
          recoveries: 0,
        })
      }

      const locationData = locationMap.get(location)
      locationData.publications.push(pub)
      if (pub.status === "recovered") {
        locationData.recoveries++
      }
    })

    return Array.from(locationMap.values())
      .map((data) => ({
        location: data.location,
        count: data.publications.length,
        recoveryRate: data.publications.length > 0 ? (data.recoveries / data.publications.length) * 100 : 0,
        avgResponseTime: calculateAvgResponseTime(data.publications),
      }))
      .sort((a, b) => b.count - a.count)
  }

  const generateCategoryStats = (publications: any[]) => {
    const categories = [
      { name: "Electrónicos", keywords: ["celular", "laptop", "tablet", "auriculares", "cámara"] },
      { name: "Vehículos", keywords: ["bicicleta", "moto", "auto", "carro", "vehiculo"] },
      { name: "Documentos", keywords: ["dni", "pasaporte", "carnet", "documento", "cedula"] },
      { name: "Joyas", keywords: ["anillo", "collar", "pulsera", "reloj", "joya"] },
      { name: "Ropa", keywords: ["chaqueta", "zapatos", "bolso", "cartera", "ropa"] },
      { name: "Otros", keywords: [] },
    ]

    const categoryStats = categories
      .map((category) => {
        let categoryPubs = []

        if (category.name === "Otros") {
          categoryPubs = publications.filter((pub) => {
            const title = pub.title.toLowerCase()
            const description = pub.description.toLowerCase()

            return !categories
              .slice(0, -1)
              .some((cat) => cat.keywords.some((keyword) => title.includes(keyword) || description.includes(keyword)))
          })
        } else {
          categoryPubs = publications.filter((pub) => {
            const title = pub.title.toLowerCase()
            const description = pub.description.toLowerCase()

            return category.keywords.some((keyword) => title.includes(keyword) || description.includes(keyword))
          })
        }

        const recoveries = categoryPubs.filter((p) => p.status === "recovered")

        return {
          category: category.name,
          count: categoryPubs.length,
          recoveryRate: categoryPubs.length > 0 ? (recoveries.length / categoryPubs.length) * 100 : 0,
          avgValue: estimateAverageValue(category.name),
        }
      })
      .filter((stat) => stat.count > 0)

    return categoryStats
  }

  const generateUserEngagement = (users: any[], publications: any[], comments: any[]) => {
    return users
      .map((user) => {
        const userPubs = publications.filter((p) => p.userId === user.id)
        const userComments = comments.filter((c) => c.userId === user.id)
        const userRecoveries = userPubs.filter((p) => p.status === "recovered")

        const engagementScore = calculateEngagementScore(userPubs.length, userComments.length, userRecoveries.length)

        return {
          userId: user.id,
          userName: user.name,
          publications: userPubs.length,
          comments: userComments.length,
          recoveries: userRecoveries.length,
          lastActivity: user.lastActivity || user.createdAt,
          engagementScore,
        }
      })
      .sort((a, b) => b.engagementScore - a.engagementScore)
  }

  const generateTrends = (publications: any[], users: any[]) => {
    const last30Days = publications.filter((p) => {
      const pubDate = new Date(p.createdAt)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return pubDate >= thirtyDaysAgo
    })

    const previous30Days = publications.filter((p) => {
      const pubDate = new Date(p.createdAt)
      const sixtyDaysAgo = new Date()
      const thirtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return pubDate >= sixtyDaysAgo && pubDate < thirtyDaysAgo
    })

    const publicationTrend =
      previous30Days.length > 0 ? ((last30Days.length - previous30Days.length) / previous30Days.length) * 100 : 0

    const recoveryTrend = calculateRecoveryTrend(last30Days, previous30Days)
    const userGrowthTrend = calculateUserGrowthTrend(users)

    const seasonalPatterns = generateSeasonalPatterns(publications)

    return {
      publicationTrend,
      recoveryTrend,
      userGrowthTrend,
      seasonalPatterns,
    }
  }

  const generateEffectivenessMetrics = (publications: any[], comments: any[]) => {
    const recoveredPubs = publications.filter((p) => p.status === "recovered")

    const avgRecoveryTime =
      recoveredPubs.length > 0
        ? recoveredPubs.reduce((acc, pub) => {
            const created = new Date(pub.createdAt)
            const recovered = new Date() // Simplificado
            return acc + (recovered.getTime() - created.getTime())
          }, 0) /
          recoveredPubs.length /
          (1000 * 60 * 60 * 24) // días
        : 0

    const mostEffectiveHours = generateHourlyEffectiveness(publications)
    const communityImpact = calculateCommunityImpact(publications, comments)
    const platformHealth = calculatePlatformHealth(publications, comments, recoveredPubs)

    return {
      avgRecoveryTime,
      mostEffectiveHours,
      communityImpact,
      platformHealth,
    }
  }

  // Funciones auxiliares
  const calculateAvgResponseTime = (publications: any[]) => {
    // Simplificado - en una implementación real calcularía el tiempo real
    return Math.random() * 48 + 12 // 12-60 horas
  }

  const estimateAverageValue = (category: string) => {
    const values = {
      Electrónicos: 500,
      Vehículos: 800,
      Documentos: 50,
      Joyas: 300,
      Ropa: 100,
      Otros: 150,
    }
    return values[category as keyof typeof values] || 100
  }

  const calculateEngagementScore = (pubs: number, comments: number, recoveries: number) => {
    return pubs * 10 + comments * 2 + recoveries * 50
  }

  const calculateRecoveryTrend = (current: any[], previous: any[]) => {
    const currentRecoveries = current.filter((p) => p.status === "recovered").length
    const previousRecoveries = previous.filter((p) => p.status === "recovered").length

    return previousRecoveries > 0 ? ((currentRecoveries - previousRecoveries) / previousRecoveries) * 100 : 0
  }

  const calculateUserGrowthTrend = (users: any[]) => {
    const last30Days = users.filter((u) => {
      const userDate = new Date(u.createdAt)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return userDate >= thirtyDaysAgo
    }).length

    const previous30Days = users.filter((u) => {
      const userDate = new Date(u.createdAt)
      const sixtyDaysAgo = new Date()
      const thirtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return userDate >= sixtyDaysAgo && userDate < thirtyDaysAgo
    }).length

    return previous30Days > 0 ? ((last30Days - previous30Days) / previous30Days) * 100 : 0
  }

  const generateSeasonalPatterns = (publications: any[]) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]

    return months.map((month, index) => {
      const monthPubs = publications.filter((p) => {
        const pubDate = new Date(p.createdAt)
        return pubDate.getMonth() === index
      })

      const monthRecoveries = monthPubs.filter((p) => p.status === "recovered")

      return {
        month,
        incidents: monthPubs.length,
        recoveries: monthRecoveries.length,
      }
    })
  }

  const generateHourlyEffectiveness = (publications: any[]) => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      total: 0,
      recovered: 0,
      recoveryRate: 0,
    }))

    publications.forEach((pub) => {
      const hour = new Date(pub.createdAt).getHours()
      hours[hour].total++
      if (pub.status === "recovered") {
        hours[hour].recovered++
      }
    })

    return hours
      .map((h) => ({
        hour: h.hour,
        recoveryRate: h.total > 0 ? (h.recovered / h.total) * 100 : 0,
      }))
      .sort((a, b) => b.recoveryRate - a.recoveryRate)
      .slice(0, 6)
  }

  const calculateCommunityImpact = (publications: any[], comments: any[]) => {
    const totalInteractions = publications.length + comments.length
    const recoveries = publications.filter((p) => p.status === "recovered").length

    return totalInteractions > 0 ? (recoveries / totalInteractions) * 100 : 0
  }

  const calculatePlatformHealth = (publications: any[], comments: any[], recoveries: any[]) => {
    const factors = [
      publications.length > 0 ? 25 : 0, // Actividad de publicaciones
      comments.length > 0 ? 25 : 0, // Actividad de comentarios
      recoveries.length > 0 ? 30 : 0, // Éxito en recuperaciones
      comments.length / Math.max(publications.length, 1) > 1 ? 20 : 10, // Engagement
    ]

    return factors.reduce((acc, factor) => acc + factor, 0)
  }

  const generateReport = (type: string, filters?: any) => {
    if (!analyticsData) return null

    switch (type) {
      case "summary":
        return generateSummaryReport(analyticsData, filters)
      case "detailed":
        return generateDetailedReport(analyticsData, filters)
      case "geographic":
        return generateGeographicReport(analyticsData, filters)
      case "user_engagement":
        return generateUserEngagementReport(analyticsData, filters)
      default:
        return analyticsData
    }
  }

  const generateSummaryReport = (data: AnalyticsData, filters?: any) => {
    return {
      title: "Reporte Resumen - CivicEye",
      period: filters?.period || "Últimos 30 días",
      metrics: {
        totalUsers: data.totalUsers,
        totalPublications: data.totalPublications,
        totalComments: data.totalComments,
        recoveryRate: data.recoveryRate,
        avgRecoveryTime: data.effectiveness.avgRecoveryTime,
        platformHealth: data.effectiveness.platformHealth,
      },
      trends: data.trends,
      topLocations: data.locationStats.slice(0, 5),
      topCategories: data.categoryStats.slice(0, 5),
    }
  }

  const generateDetailedReport = (data: AnalyticsData, filters?: any) => {
    return {
      title: "Reporte Detallado - CivicEye",
      period: filters?.period || "Últimos 30 días",
      executiveSummary: {
        totalMetrics: {
          users: data.totalUsers,
          publications: data.totalPublications,
          comments: data.totalComments,
          recoveryRate: data.recoveryRate,
        },
        trends: data.trends,
        effectiveness: data.effectiveness,
      },
      detailedAnalysis: {
        dailyStats: data.dailyStats,
        locationStats: data.locationStats,
        categoryStats: data.categoryStats,
        userEngagement: data.userEngagement.slice(0, 20),
      },
      recommendations: generateRecommendations(data),
    }
  }

  const generateGeographicReport = (data: AnalyticsData, filters?: any) => {
    return {
      title: "Análisis Geográfico - CivicEye",
      period: filters?.period || "Últimos 30 días",
      locationAnalysis: data.locationStats,
      heatmapData: data.locationStats.map((loc) => ({
        location: loc.location,
        intensity: loc.count,
        risk: 100 - loc.recoveryRate,
      })),
      recommendations: generateGeographicRecommendations(data.locationStats),
    }
  }

  const generateUserEngagementReport = (data: AnalyticsData, filters?: any) => {
    return {
      title: "Análisis de Engagement - CivicEye",
      period: filters?.period || "Últimos 30 días",
      engagementMetrics: {
        totalActiveUsers: data.userEngagement.filter((u) => u.engagementScore > 0).length,
        avgEngagementScore:
          data.userEngagement.reduce((acc, u) => acc + u.engagementScore, 0) / data.userEngagement.length,
        topContributors: data.userEngagement.slice(0, 10),
      },
      segmentation: {
        highEngagement: data.userEngagement.filter((u) => u.engagementScore > 100).length,
        mediumEngagement: data.userEngagement.filter((u) => u.engagementScore > 20 && u.engagementScore <= 100).length,
        lowEngagement: data.userEngagement.filter((u) => u.engagementScore <= 20).length,
      },
    }
  }

  const generateRecommendations = (data: AnalyticsData) => {
    const recommendations = []

    if (data.recoveryRate < 30) {
      recommendations.push({
        priority: "Alta",
        category: "Efectividad",
        title: "Mejorar tasa de recuperación",
        description:
          "La tasa de recuperación está por debajo del 30%. Se recomienda implementar alertas más efectivas y mejorar la colaboración comunitaria.",
      })
    }

    if (data.trends.userGrowthTrend < 0) {
      recommendations.push({
        priority: "Media",
        category: "Crecimiento",
        title: "Impulsar crecimiento de usuarios",
        description:
          "El crecimiento de usuarios está en declive. Considerar campañas de marketing y programas de referidos.",
      })
    }

    if (data.effectiveness.platformHealth < 70) {
      recommendations.push({
        priority: "Alta",
        category: "Plataforma",
        title: "Mejorar salud de la plataforma",
        description: "La salud general de la plataforma necesita atención. Revisar engagement y funcionalidades.",
      })
    }

    return recommendations
  }

  const generateGeographicRecommendations = (locationStats: any[]) => {
    const recommendations = []

    const highCrimeAreas = locationStats.filter((loc) => loc.count > 10 && loc.recoveryRate < 20)
    if (highCrimeAreas.length > 0) {
      recommendations.push({
        type: "Seguridad",
        title: "Zonas de alto riesgo identificadas",
        areas: highCrimeAreas.map((area) => area.location),
        suggestion: "Implementar alertas especiales y colaboración con autoridades locales",
      })
    }

    return recommendations
  }

  const exportData = (format: "csv" | "json" | "pdf", data: any) => {
    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `civiceye_report_${timestamp}`

    switch (format) {
      case "csv":
        exportToCSV(data, filename)
        break
      case "json":
        exportToJSON(data, filename)
        break
      case "pdf":
        exportToPDF(data, filename)
        break
    }
  }

  const exportToCSV = (data: any, filename: string) => {
    // Implementación simplificada
    const csvContent = convertToCSV(data)
    downloadFile(csvContent, `${filename}.csv`, "text/csv")
  }

  const exportToJSON = (data: any, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2)
    downloadFile(jsonContent, `${filename}.json`, "application/json")
  }

  const exportToPDF = (data: any, filename: string) => {
    // En una implementación real, usarías una librería como jsPDF
    console.log("PDF export would be implemented here")
  }

  const convertToCSV = (data: any) => {
    // Implementación simplificada para convertir datos a CSV
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {})
      const csvRows = [headers.join(","), ...data.map((row) => headers.map((header) => row[header]).join(","))]
      return csvRows.join("\n")
    }
    return JSON.stringify(data)
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getPredictions = (type: string) => {
    if (!analyticsData) return null

    switch (type) {
      case "recovery_rate":
        return predictRecoveryRate(analyticsData)
      case "user_growth":
        return predictUserGrowth(analyticsData)
      case "crime_hotspots":
        return predictCrimeHotspots(analyticsData)
      default:
        return null
    }
  }

  const predictRecoveryRate = (data: AnalyticsData) => {
    // Predicción simple basada en tendencias
    const currentRate = data.recoveryRate
    const trend = data.trends.recoveryTrend

    return {
      current: currentRate,
      predicted30Days: Math.max(0, Math.min(100, currentRate + trend * 0.3)),
      predicted90Days: Math.max(0, Math.min(100, currentRate + trend * 0.9)),
      confidence: Math.abs(trend) < 10 ? "Alta" : "Media",
    }
  }

  const predictUserGrowth = (data: AnalyticsData) => {
    const currentUsers = data.totalUsers
    const growthRate = data.trends.userGrowthTrend / 100

    return {
      current: currentUsers,
      predicted30Days: Math.round(currentUsers * (1 + growthRate * 0.3)),
      predicted90Days: Math.round(currentUsers * (1 + growthRate * 0.9)),
      growthRate: data.trends.userGrowthTrend,
    }
  }

  const predictCrimeHotspots = (data: AnalyticsData) => {
    return data.locationStats
      .filter((loc) => loc.count > 5)
      .map((loc) => ({
        location: loc.location,
        currentRisk: 100 - loc.recoveryRate,
        predictedRisk: Math.min(100, (100 - loc.recoveryRate) * 1.1),
        trend: loc.count > 10 ? "Aumentando" : "Estable",
      }))
      .sort((a, b) => b.predictedRisk - a.predictedRisk)
      .slice(0, 10)
  }

  return (
    <AnalyticsContext.Provider
      value={{
        analyticsData,
        isLoading,
        refreshAnalytics,
        generateReport,
        exportData,
        getPredictions,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}
