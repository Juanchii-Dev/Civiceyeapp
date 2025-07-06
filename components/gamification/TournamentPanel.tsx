"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Users, Calendar, Gift } from "lucide-react"

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

interface TournamentPanelProps {
  tournaments: Tournament[]
  currentUserId?: string
}

export function TournamentPanel({ tournaments, currentUserId }: TournamentPanelProps) {
  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime()
    const end = new Date(endDate).getTime()
    const diff = end - now

    if (diff <= 0) return "Finalizado"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const getUserPosition = (tournament: Tournament) => {
    if (!currentUserId) return null

    const sortedParticipants = [...tournament.participants].sort((a, b) => b.score - a.score)
    const userIndex = sortedParticipants.findIndex((p) => p.userId === currentUserId)

    return userIndex >= 0 ? userIndex + 1 : null
  }

  const getTournamentProgress = (tournament: Tournament) => {
    const start = new Date(tournament.startDate).getTime()
    const end = new Date(tournament.endDate).getTime()
    const now = new Date().getTime()

    const total = end - start
    const elapsed = now - start

    return Math.min(Math.max((elapsed / total) * 100, 0), 100)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Torneos Activos</h3>
      </div>

      {tournaments
        .filter((t) => t.active)
        .map((tournament) => {
          const userPosition = getUserPosition(tournament)
          const progress = getTournamentProgress(tournament)
          const topParticipants = [...tournament.participants].sort((a, b) => b.score - a.score).slice(0, 3)

          return (
            <Card
              key={tournament.id}
              className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span>{tournament.name}</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{tournament.description}</p>
                  </div>
                  <Badge variant={tournament.active ? "default" : "secondary"}>
                    {tournament.active ? "Activo" : "Finalizado"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>{tournament.participants.length} participantes</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span>{getTimeRemaining(tournament.endDate)}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso del torneo</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {userPosition && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tu posición actual:</span>
                      <Badge variant="outline" className="bg-blue-100">
                        #{userPosition}
                      </Badge>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center">
                    <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                    Top 3 Actual
                  </h4>
                  <div className="space-y-2">
                    {topParticipants.map((participant, index) => (
                      <div
                        key={participant.userId}
                        className="flex items-center justify-between bg-white rounded-lg p-2 border"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0
                                ? "bg-yellow-500 text-white"
                                : index === 1
                                  ? "bg-gray-400 text-white"
                                  : "bg-amber-600 text-white"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{participant.userName}</span>
                        </div>
                        <span className="text-sm text-gray-600">{participant.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center">
                    <Gift className="w-4 h-4 mr-1 text-purple-500" />
                    Premios
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {tournament.prizes.map((prize) => (
                      <div key={prize.position} className="bg-white rounded-lg p-2 border text-center">
                        <div className="text-xs text-gray-600">#{prize.position}</div>
                        <div className="text-sm font-bold text-yellow-600">{prize.points} pts</div>
                        {prize.badge && (
                          <Badge variant="outline" className="text-xs mt-1">
                            +Badge
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

      {tournaments.filter((t) => t.active).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay torneos activos</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
