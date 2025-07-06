"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useAnalytics } from "@/contexts/AnalyticsContext"
import { Navbar } from "@/components/Navbar"
import { MetricsCard } from "@/components/analytics/MetricsCard"
import { ChartContainer } from "@/components/analytics/ChartContainer"
import { SimpleBarChart } from "@/components/analytics/SimpleBarChart"
import { SimpleLineChart } from "@/components/analytics/SimpleLineChart"
import { HeatmapChart } from "@/components/analytics/HeatmapChart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  FileText,
  MessageCircle,
  TrendingUp,
  Clock,
  Target,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const { analyticsData, isLoading, refreshAnalytics, generateReport, exportData, getPredictions } = useAnalytics()

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p>Acceso denegado. Solo administradores pueden ver los análisis.</p>
        </div>
      </div>
    )
  }

  if (isLoading || !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Cargando análisis...</span>
          </div>
        </div>
      </div>
    )
  }

  const handleExportReport = (type: string) => {
    const report = generateReport(type)
    exportData("json", report)
  }

  const recoveryPrediction = getPredictions("recovery_rate")
  const userGrowthPrediction = getPredictions("user_growth")

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Centro de Análisis y Reportes</h1>
              <p className="text-gray-600">Dashboard completo con métricas, tendencias y predicciones</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={refreshAnalytics} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
              <Button onClick={() => handleExportReport("summary")} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Usuarios"
            value={analyticsData.totalUsers}
            change={analyticsData.trends.userGrowthTrend}
            changeLabel="vs mes anterior"
            icon={<Users className="w-5 h-5" />}
            color="blue"
          />
          <MetricsCard
            title="Total Denuncias"
            value={analyticsData.totalPublications}
            change={analyticsData.trends.publicationTrend}
            changeLabel="vs mes anterior"
            icon={<FileText className="w-5 h-5" />}
            color="green"
          />
          <MetricsCard
            title="Tasa de Recuperación"
            value={analyticsData.recoveryRate}
            change={analyticsData.trends.recoveryTrend}
            changeLabel="vs mes anterior"
            icon={<Target className="w-5 h-5" />}
            format="percentage"
            color="purple"
          />
          <MetricsCard
            title="Tiempo Promedio Recuperación"
            value={analyticsData.effectiveness.avgRecoveryTime}
            icon={<Clock className="w-5 h-5" />}
            format="time"
            color="yellow"
          />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
            <TabsTrigger value="geographic">Geográfico</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="predictions">Predicciones</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <ChartContainer
                title="Actividad Diaria (Últimos 30 días)"
                description="Publicaciones, comentarios y recuperaciones por día"
                onExport={() => exportData("csv", analyticsData.dailyStats)}
              >
                <SimpleLineChart
                  data={analyticsData.dailyStats.map((stat) => ({
                    name: new Date(stat.date).toLocaleDateString(),
                    value: stat.publications + stat.comments,
                  }))}
                  color="#3b82f6"
                />
              </ChartContainer>

              <ChartContainer title="Distribución por Categorías" description="Tipos de objetos más reportados">
                <SimpleBarChart
                  data={analyticsData.categoryStats.map((cat) => ({
                    name: cat.category,
                    value: cat.count,
                    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                  }))}
                />
              </ChartContainer>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Salud de la Plataforma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {analyticsData.effectiveness.platformHealth}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${analyticsData.effectiveness.platformHealth}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {analyticsData.effectiveness.platformHealth >= 80
                        ? "Excelente"
                        : analyticsData.effectiveness.platformHealth >= 60
                          ? "Buena"
                          : analyticsData.effectiveness.platformHealth >= 40
                            ? "Regular"
                            : "Necesita atención"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Impacto Comunitario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {analyticsData.effectiveness.communityImpact.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">Efectividad de la colaboración ciudadana</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-purple-600" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {(analyticsData.totalComments / Math.max(analyticsData.totalPublications, 1)).toFixed(1)}
                    </div>
                    <p className="text-sm text-gray-600">Comentarios promedio por denuncia</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <ChartContainer title="Tendencia de Publicaciones" description="Evolución mensual de denuncias">
                <SimpleLineChart
                  data={analyticsData.trends.seasonalPatterns.map((pattern) => ({
                    name: pattern.month.substring(0, 3),
                    value: pattern.incidents,
                  }))}
                  color="#ef4444"
                />
              </ChartContainer>

              <ChartContainer
                title="Tendencia de Recuperaciones"
                description="Evolución mensual de objetos recuperados"
              >
                <SimpleLineChart
                  data={analyticsData.trends.seasonalPatterns.map((pattern) => ({
                    name: pattern.month.substring(0, 3),
                    value: pattern.recoveries,
                  }))}
                  color="#22c55e"
                />
              </ChartContainer>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análisis de Tendencias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {analyticsData.trends.publicationTrend > 0 ? "+" : ""}
                      {analyticsData.trends.publicationTrend.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">Crecimiento en Publicaciones</p>
                    <Badge variant={analyticsData.trends.publicationTrend > 0 ? "default" : "destructive"}>
                      {analyticsData.trends.publicationTrend > 0 ? "Aumentando" : "Disminuyendo"}
                    </Badge>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {analyticsData.trends.recoveryTrend > 0 ? "+" : ""}
                      {analyticsData.trends.recoveryTrend.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">Mejora en Recuperaciones</p>
                    <Badge variant={analyticsData.trends.recoveryTrend > 0 ? "default" : "destructive"}>
                      {analyticsData.trends.recoveryTrend > 0 ? "Mejorando" : "Empeorando"}
                    </Badge>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {analyticsData.trends.userGrowthTrend > 0 ? "+" : ""}
                      {analyticsData.trends.userGrowthTrend.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">Crecimiento de Usuarios</p>
                    <Badge variant={analyticsData.trends.userGrowthTrend > 0 ? "default" : "destructive"}>
                      {analyticsData.trends.userGrowthTrend > 0 ? "Creciendo" : "Decreciendo"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <HeatmapChart
              data={analyticsData.locationStats.map((loc) => ({
                location: loc.location,
                intensity: loc.count,
                risk: 100 - loc.recoveryRate,
              }))}
            />

            <ChartContainer
              title="Top 10 Ubicaciones por Incidentes"
              description="Zonas con mayor cantidad de denuncias"
            >
              <SimpleBarChart
                data={analyticsData.locationStats.slice(0, 10).map((loc) => ({
                  name: loc.location,
                  value: loc.count,
                  color: loc.recoveryRate < 30 ? "#ef4444" : loc.recoveryRate < 60 ? "#f59e0b" : "#22c55e",
                }))}
              />
            </ChartContainer>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <ChartContainer
                title="Distribución por Categorías"
                description="Cantidad de denuncias por tipo de objeto"
              >
                <SimpleBarChart
                  data={analyticsData.categoryStats.map((cat) => ({
                    name: cat.category,
                    value: cat.count,
                  }))}
                />
              </ChartContainer>

              <ChartContainer
                title="Tasa de Recuperación por Categoría"
                description="Efectividad de recuperación por tipo"
              >
                <SimpleBarChart
                  data={analyticsData.categoryStats.map((cat) => ({
                    name: cat.category,
                    value: cat.recoveryRate,
                    color: cat.recoveryRate >= 50 ? "#22c55e" : "#ef4444",
                  }))}
                />
              </ChartContainer>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análisis Detallado por Categorías</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.categoryStats.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">{category.category}</h4>
                        <p className="text-sm text-gray-600">{category.count} denuncias</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{category.recoveryRate.toFixed(1)}%</div>
                        <p className="text-sm text-gray-600">recuperación</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">${category.avgValue}</div>
                        <p className="text-sm text-gray-600">valor promedio</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Usuarios Más Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.userEngagement.slice(0, 10).map((user, index) => (
                      <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{user.userName}</p>
                            <p className="text-sm text-gray-600">
                              {user.publications} denuncias, {user.comments} comentarios
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-600">{user.engagementScore}</div>
                          <p className="text-xs text-gray-600">puntos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Segmentación de Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Alta Participación</span>
                      <Badge variant="default">
                        {analyticsData.userEngagement.filter((u) => u.engagementScore > 100).length} usuarios
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium">Participación Media</span>
                      <Badge variant="secondary">
                        {
                          analyticsData.userEngagement.filter((u) => u.engagementScore > 20 && u.engagementScore <= 100)
                            .length
                        }{" "}
                        usuarios
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">Baja Participación</span>
                      <Badge variant="outline">
                        {analyticsData.userEngagement.filter((u) => u.engagementScore <= 20).length} usuarios
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {recoveryPrediction && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-green-600" />
                      Predicción de Recuperación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {recoveryPrediction.predicted30Days.toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600">Tasa predicha (30 días)</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-700">
                            {recoveryPrediction.current.toFixed(1)}%
                          </div>
                          <p className="text-xs text-gray-600">Actual</p>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-blue-700">
                            {recoveryPrediction.predicted90Days.toFixed(1)}%
                          </div>
                          <p className="text-xs text-gray-600">90 días</p>
                        </div>
                      </div>

                      <Badge variant="outline" className="w-full justify-center">
                        Confianza: {recoveryPrediction.confidence}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {userGrowthPrediction && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      Predicción de Crecimiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {userGrowthPrediction.predicted30Days}
                        </div>
                        <p className="text-sm text-gray-600">Usuarios predichos (30 días)</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-700">{userGrowthPrediction.current}</div>
                          <p className="text-xs text-gray-600">Actual</p>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-purple-700">
                            {userGrowthPrediction.predicted90Days}
                          </div>
                          <p className="text-xs text-gray-600">90 días</p>
                        </div>
                      </div>

                      <div className="text-center">
                        <Badge variant={userGrowthPrediction.growthRate > 0 ? "default" : "destructive"}>
                          {userGrowthPrediction.growthRate > 0 ? "+" : ""}
                          {userGrowthPrediction.growthRate.toFixed(1)}% crecimiento
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                  Zonas de Riesgo Predichas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getPredictions("crime_hotspots")
                    ?.slice(0, 8)
                    .map((hotspot: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                      >
                        <div>
                          <p className="font-medium">{hotspot.location}</p>
                          <p className="text-sm text-gray-600">Tendencia: {hotspot.trend}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">{hotspot.predictedRisk.toFixed(1)}%</div>
                          <p className="text-xs text-gray-600">riesgo predicho</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
