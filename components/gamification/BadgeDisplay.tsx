"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BadgeItem {
  id: string
  name: string
  description: string
  icon: string
  category: "participation" | "achievement" | "social" | "special"
  rarity: "common" | "rare" | "epic" | "legendary"
  points: number
}

interface BadgeDisplayProps {
  badges: BadgeItem[]
  userBadges: string[]
  size?: "sm" | "md" | "lg"
}

export function BadgeDisplay({ badges, userBadges, size = "md" }: BadgeDisplayProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-12 h-12 text-lg"
      case "md":
        return "w-16 h-16 text-2xl"
      case "lg":
        return "w-20 h-20 text-3xl"
      default:
        return "w-16 h-16 text-2xl"
    }
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {badges.map((badge) => {
          const isUnlocked = userBadges.includes(badge.id)
          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <Card
                  className={`${isUnlocked ? "ring-2 ring-blue-500" : "opacity-50"} cursor-pointer hover:scale-105 transition-transform`}
                >
                  <CardContent className="p-2">
                    <div
                      className={`${getSizeClasses()} rounded-full ${getRarityColor(badge.rarity)} border-2 flex items-center justify-center mx-auto mb-2`}
                    >
                      <span>{badge.icon}</span>
                    </div>
                    <div className="text-center">
                      <Badge variant={isUnlocked ? "default" : "secondary"} className="text-xs">
                        {badge.rarity}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                  <p className="text-xs text-blue-600">+{badge.points} puntos</p>
                  {!isUnlocked && <p className="text-xs text-red-500">🔒 Bloqueado</p>}
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
