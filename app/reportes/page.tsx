"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useAnalytics } from "@/contexts/AnalyticsContext"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Calendar, Filter, TrendingUp, AlertCircle, CheckCircle, Users, MapPin } from "lucide-react"

export default function ReportesPage() {
  const { user } = useAuth()
  const { analyticsData, generateReport, exportData } = useAnalytics()
  const [selectedReportType, setSelectedReportType] = useState("summary")
  const [selectedPeriod, setSelectedPeriod] = useState("30days")
  const [selectedFormat, setSelectedFormat] = useState("json")

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p>Acceso denegado. Solo administradores pueden generar reportes.</p>
        </div>
      </div>
    )
  }

  const reportTypes = [
    { value: "summary", label: "Reporte Resumen", description: "Métricas principales y tendencias" },
    { value: "detailed", label: "Reporte Detallado", description: "Análisis completo con recomendaciones" },
    { value: "geographic", label: "Análisis Geográfico", description: "Distribución por ubicaciones" },
    { value: "user_engagement", label: "Engagement de Usuarios", description: "Participación y actividad" },
    { value: "effectiveness", label: "Efectividad", description: "Métricas de recuperación y éxito" },
    { value: "trends", label: "Análisis de Tendencias", description: "Patrones temporales y predicciones" },
  ]

  const periods = [
    { value: "7days", label: "Últimos 7 días" },
    { value: "30days", label: "Últimos 30 días" },
    { value: "90days", label: "Últimos 3 meses" },
    { value: "1year", label: "Último año" },
    { value: "all", label: "Todo el período" },
  ]

  const formats = [
    { value: "json", label: "JSON", description: "Formato estructurado para análisis" },
    { value: "csv", label: "CSV", description: "Para Excel y hojas de cálculo" },
    { value: "pdf", label: "PDF", description: "Documento imprimible" },
  ]

  const handleGenerateReport = () => {
    const filters = {
      period: selectedPeriod,
      format: selectedFormat,
    }

    const report = generateReport(selectedReportType, filters)
    exportData(selectedFormat as "csv" | "json" | "pdf", report)
  }

  const getReportPreview = () => {
    if (!analyticsData) return null

    const filters = { period: selectedPeriod }
    return generateReport(selectedReportType, filters)
  }

  const reportPreview = getReportPreview()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generador de Reportes</h1>
          <p className="text-gray-600">Crea reportes personalizados con análisis detallados</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Panel de configuración */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Configuración del Reporte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Reporte</label>
                  <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Período de Tiempo</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Formato de Exportación</label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          <div>
                            <div className="font-medium">{format.label}</div>
                            <div className="text-xs text-gray-500">{format.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleGenerateReport} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generar y Descargar Reporte
                </Button>
              </CardContent>
            </Card>

            {/* Reportes rápidos */}
            <Card>
              <CardHeader>
                <CardTitle>Reportes Rápidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => {
                    setSelectedReportType("summary")
                    setSelectedPeriod("30days")
                    handleGenerateReport()
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Resumen Mensual
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => {
                    setSelectedReportType("geographic")
                    setSelectedPeriod("90days")
                    handleGenerateReport()
                  }}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Análisis Geográfico
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => {
                    setSelectedReportType("user_engagement")
                    setSelectedPeriod("30days")
                    handleGenerateReport()
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Engagement Usuarios
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Vista previa del reporte */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Vista Previa del Reporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reportPreview ? (
                  <div className="space-y-6">
                    {/* Encabezado del reporte */}
                    <div className="border-b pb-4">
                      <h2 className="text-xl font-bold text-gray-900">{reportPreview.title}</h2>
                      <p className="text-gray-600">{reportPreview.period}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Generado el {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Contenido específico por tipo de reporte */}
                    {selectedReportType === "summary" && reportPreview.metrics && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{reportPreview.metrics.totalUsers}</div>
                          <div className="text-sm text-gray-600">Total Usuarios</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {reportPreview.metrics.totalPublications}
                          </div>
                          <div className="text-sm text-gray-600">Total Denuncias</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {reportPreview.metrics.recoveryRate.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Tasa Recuperación</div>
                        </div>
                      </div>
                    )}

                    {selectedReportType === "detailed" && reportPreview.recommendations && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Recomendaciones</h3>
                        {reportPreview.recommendations.map((rec: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                          >
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant={rec.priority === "Alta" ? "destructive" : "secondary"}>
                                  {rec.priority}
                                </Badge>
                                <span className="text-sm font-medium">{rec.category}</span>
                              </div>
                              <h4 className="font-semibold">{rec.title}</h4>
                              <p className="text-sm text-gray-600">{rec.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedReportType === "geographic" && reportPreview.locationAnalysis && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Análisis por Ubicación</h3>
                        <div className="space-y-2">
                          {reportPreview.locationAnalysis.slice(0, 10).map((location: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-medium">{location.location}</span>
                                <span className="text-sm text-gray-600 ml-2">{location.count} incidentes</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-green-600">
                                  {location.recoveryRate.toFixed(1)}% recuperación
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedReportType === "user_engagement" && reportPreview.engagementMetrics && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Métricas de Engagement</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {reportPreview.engagementMetrics.totalActiveUsers}
                            </div>
                            <div className="text-sm text-gray-600">Usuarios Activos</div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {reportPreview.engagementMetrics.avgEngagementScore.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-600">Score Promedio</div>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {reportPreview.segmentation?.highEngagement || 0}
                            </div>
                            <div className="text-sm text-gray-600">Alto Engagement</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tendencias */}
                    {reportPreview.trends && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Tendencias</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <TrendingUp className="w-8 h-8 text-blue-600" />
                            <div>
                              <div className="text-lg font-bold">
                                {reportPreview.trends.publicationTrend > 0 ? "+" : ""}
                                {reportPreview.trends.publicationTrend.toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-600">Publicaciones</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div>
                              <div className="text-lg font-bold">
                                {reportPreview.trends.recoveryTrend > 0 ? "+" : ""}
                                {reportPreview.trends.recoveryTrend.toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-600">Recuperaciones</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <Users className="w-8 h-8 text-purple-600" />
                            <div>
                              <div className="text-lg font-bold">
                                {reportPreview.trends.userGrowthTrend > 0 ? "+" : ""}
                                {reportPreview.trends.userGrowthTrend.toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-600">Usuarios</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Selecciona un tipo de reporte para ver la vista previa</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
