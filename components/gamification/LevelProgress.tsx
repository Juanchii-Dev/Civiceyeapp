"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp } from "lucide-react"

interface LevelProgressProps {
  level: number
  experience: number
  nextLevelXP: number
  progress: number
  points: number
}

export function LevelProgress({ level, experience, nextLevelXP, progress, points }: LevelProgressProps) {
  const getLevelTitle = (level: number) => {
    if (level >= 50) return { title: "Leyenda", color: "bg-purple-500" }
    if (level >= 30) return { title: "Maestro", color: "bg-red-500" }
    if (level >= 20) return { title: "Experto", color: "bg-blue-500" }
    if (level >= 10) return { title: "Avanzado", color: "bg-green-500" }
    if (level >= 5) return { title: "Intermedio", color: "bg-yellow-500" }
    return { title: "Principiante", color: "bg-gray-500" }
  }

  const levelInfo = getLevelTitle(level)

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-full ${levelInfo.color} flex items-center justify-center text-white font-bold text-lg`}
            >
              {level}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Nivel {level}</h3>
              <Badge className={`${levelInfo.color} text-white`}>{levelInfo.title}</Badge>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-1 text-yellow-600 mb-1">
              <Star className="w-4 h-4" />
              <span className="font-semibold">{points.toLocaleString()} puntos</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">{experience} XP</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso al siguiente nivel</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-xs text-gray-600">
            <span>{experience % 100} XP</span>
            <span>{nextLevelXP} XP</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-lg font-bold text-blue-600">{level}</div>
            <div className="text-xs text-gray-600">Nivel Actual</div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-lg font-bold text-green-600">{Math.round(progress)}%</div>
            <div className="text-xs text-gray-600">Progreso</div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-lg font-bold text-purple-600">{100 - (experience % 100)}</div>
            <div className="text-xs text-gray-600">XP Restante</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
