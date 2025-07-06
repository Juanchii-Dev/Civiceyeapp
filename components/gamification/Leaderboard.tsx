"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Crown, Star, TrendingUp, Zap } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  name: string
  value: number
  level: number
  badges: string[]
}

interface LeaderboardProps {
  pointsLeaderboard: LeaderboardEntry[]
  levelLeaderboard: LeaderboardEntry[]
  streakLeaderboard: LeaderboardEntry[]
}

export function Leaderboard({ pointsLeaderboard, levelLeaderboard, streakLeaderboard }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<"points" | "level" | "streak">("points")

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300"
      case 2:
        return "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300"
      case 3:
        return "bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300"
      default:
        return "bg-white border-gray-200"
    }
  }

  const getCurrentLeaderboard = () => {
    switch (activeTab) {
      case "points":
        return pointsLeaderboard
      case "level":
        return levelLeaderboard
      case "streak":
        return streakLeaderboard
      default:
        return pointsLeaderboard
    }
  }

  const getValueLabel = () => {
    switch (activeTab) {
      case "points":
        return "puntos"
      case "level":
        return "nivel"
      case "streak":
        return "días"
      default:
        return "puntos"
    }
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "points":
        return <Star className="w-4 h-4" />
      case "level":
        return <TrendingUp className="w-4 h-4" />
      case "streak":
        return <Zap className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          Tabla de Líderes
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === "points" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("points")}
            className="flex items-center space-x-1"
          >
            {getTabIcon("points")}
            <span>Puntos</span>
          </Button>
          <Button
            variant={activeTab === "level" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("level")}
            className="flex items-center space-x-1"
          >
            {getTabIcon("level")}
            <span>Nivel</span>
          </Button>
          <Button
            variant={activeTab === "streak" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("streak")}
            className="flex items-center space-x-1"
          >
            {getTabIcon("streak")}
            <span>Racha</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {getCurrentLeaderboard().map((entry) => (
            <div
              key={`${entry.rank}-${entry.name}`}
              className={`p-4 rounded-lg border-2 ${getRankBg(entry.rank)} transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getRankIcon(entry.rank)}
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{entry.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{entry.name}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        Nivel {entry.level}
                      </Badge>
                      {entry.badges.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {entry.badges.length} badges
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{entry.value.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{getValueLabel()}</div>
                </div>
              </div>
            </div>
          ))}

          {getCurrentLeaderboard().length === 0 && (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay datos disponibles</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
