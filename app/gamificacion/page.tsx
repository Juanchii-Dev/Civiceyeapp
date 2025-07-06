"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useGamification } from "@/contexts/GamificationContext"
import { Navbar } from "@/components/Navbar"
import { BadgeDisplay } from "@/components/gamification/BadgeDisplay"
import { MissionPanel } from "@/components/gamification/MissionPanel"
import { Leaderboard } from "@/components/gamification/Leaderboard"
import { LevelProgress } from "@/components/gamification/LevelProgress"
import { TournamentPanel } from "@/components/gamification/TournamentPanel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Star, Target, Users, Award } from "lucide-react"

export default function GamificationPage() {
  const { user } = useAuth()
  const { badges, missions, tournaments, completeMission, getLeaderboard, getUserLevel } = useGamification()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p>Debes iniciar sesión para ver la gamificación</p>
        </div>
      </div>
    )
  }

  const levelInfo = getUserLevel(user.experience || 0)
  const pointsLeaderboard = getLeaderboard("points")
  const levelLeaderboard = getLeaderboard("level")
  const streakLeaderboard = getLeaderboard("streak")

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Centro de Gamificación</h1>
          <p className="text-gray-600">Completa misiones, gana badges y compite con otros usuarios</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <LevelProgress
              level={levelInfo.level}
              experience={user.experience || 0}
              nextLevelXP={levelInfo.nextLevelXP}
              progress={levelInfo.progress}
              points={user.points || 0}
            />

            <Tabs defaultValue="missions" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="missions" className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>Misiones</span>
                </TabsTrigger>
                <TabsTrigger value="badges" className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>Badges</span>
                </TabsTrigger>
                <TabsTrigger value="tournaments" className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4" />
                  <span>Torneos</span>
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Rankings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="missions" className="space-y-6">
                <MissionPanel missions={missions} onComplete={completeMission} />
              </TabsContent>

              <TabsContent value="badges" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2 text-purple-500" />
                      Colección de Badges ({user.badges?.length || 0}/{badges.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BadgeDisplay badges={badges} userBadges={user.badges || []} size="lg" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tournaments" className="space-y-6">
                <TournamentPanel tournaments={tournaments} currentUserId={user.id} />
              </TabsContent>

              <TabsContent value="leaderboard" className="space-y-6">
                <Leaderboard
                  pointsLeaderboard={pointsLeaderboard}
                  levelLeaderboard={levelLeaderboard}
                  streakLeaderboard={streakLeaderboard}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Estadísticas Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-blue-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">{user.points || 0}</div>
                    <div className="text-xs text-gray-600">Puntos Totales</div>
                  </div>
                  <div className="text-center bg-green-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">{user.level || 1}</div>
                    <div className="text-xs text-gray-600">Nivel Actual</div>
                  </div>
                  <div className="text-center bg-purple-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-600">{user.badges?.length || 0}</div>
                    <div className="text-xs text-gray-600">Badges</div>
                  </div>
                  <div className="text-center bg-orange-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-orange-600">{user.streak || 0}</div>
                    <div className="text-xs text-gray-600">Racha (días)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Próximos Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {badges
                    .filter((badge) => !user.badges?.includes(badge.id))
                    .slice(0, 3)
                    .map((badge) => (
                      <div key={badge.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <span className="text-lg">{badge.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{badge.name}</p>
                          <p className="text-xs text-gray-500 truncate">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
