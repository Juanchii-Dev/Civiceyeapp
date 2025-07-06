"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Trophy, Star } from "lucide-react"

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

interface MissionPanelProps {
  missions: Mission[]
  onComplete: (missionId: string) => void
}

export function MissionPanel({ missions, onComplete }: MissionPanelProps) {
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime()
    const expiry = new Date(expiresAt).getTime()
    const diff = expiry - now

    if (diff <= 0) return "Expirado"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getMissionTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-green-100 text-green-800"
      case "weekly":
        return "bg-blue-100 text-blue-800"
      case "monthly":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Misiones Diarias</h3>
      </div>

      {missions.map((mission) => {
        const progress = Math.min((mission.current / mission.target) * 100, 100)
        const isCompleted = mission.completed || mission.current >= mission.target

        return (
          <Card key={mission.id} className={`${isCompleted ? "bg-green-50 border-green-200" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <CardTitle className="text-base">{mission.title}</CardTitle>
                    <Badge className={getMissionTypeColor(mission.type)}>{mission.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{mission.description}</p>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{getTimeRemaining(mission.expiresAt)}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      Progreso: {mission.current}/{mission.target}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{mission.reward.points} puntos</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4 text-blue-500" />
                      <span>{mission.reward.experience} XP</span>
                    </div>
                    {mission.reward.badge && (
                      <Badge variant="outline" className="text-xs">
                        +Badge
                      </Badge>
                    )}
                  </div>

                  {isCompleted && !mission.completed && (
                    <Button
                      size="sm"
                      onClick={() => onComplete(mission.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Reclamar
                    </Button>
                  )}

                  {mission.completed && (
                    <Badge variant="default" className="bg-green-600">
                      ✓ Completada
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {missions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay misiones disponibles</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
