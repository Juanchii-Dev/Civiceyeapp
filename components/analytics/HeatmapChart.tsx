"use client"

import { Card, CardContent } from "@/components/ui/card"

interface HeatmapData {
  location: string
  intensity: number
  risk: number
}

interface HeatmapChartProps {
  data: HeatmapData[]
  title?: string
}

export function HeatmapChart({ data, title = "Mapa de Calor - Incidentes por Zona" }: HeatmapChartProps) {
  const maxIntensity = Math.max(...data.map((d) => d.intensity))

  const getIntensityColor = (intensity: number) => {
    const normalizedIntensity = intensity / maxIntensity
    const red = Math.round(255 * normalizedIntensity)
    const green = Math.round(255 * (1 - normalizedIntensity))
    return `rgb(${red}, ${green}, 0)`
  }

  const getRiskLevel = (risk: number) => {
    if (risk >= 80) return { level: "Muy Alto", color: "bg-red-600" }
    if (risk >= 60) return { level: "Alto", color: "bg-red-400" }
    if (risk >= 40) return { level: "Medio", color: "bg-yellow-400" }
    if (risk >= 20) return { level: "Bajo", color: "bg-green-400" }
    return { level: "Muy Bajo", color: "bg-green-600" }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, index) => {
          const riskInfo = getRiskLevel(item.risk)

          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium truncate">{item.location}</h4>
                  <div className={`w-3 h-3 rounded-full ${riskInfo.color}`} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Incidentes:</span>
                    <span className="font-medium">{item.intensity}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nivel de Riesgo:</span>
                    <span className="font-medium">{riskInfo.level}</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(item.intensity / maxIntensity) * 100}%`,
                        backgroundColor: getIntensityColor(item.intensity),
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center space-x-4 text-sm">
        <span className="text-gray-600">Intensidad:</span>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-400 rounded" />
          <span>Baja</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-400 rounded" />
          <span>Media</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-400 rounded" />
          <span>Alta</span>
        </div>
      </div>
    </div>
  )
}
