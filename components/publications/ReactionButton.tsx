"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"
import type { Reaction } from "@/types/publication"

interface ReactionButtonProps {
  reactions: Reaction[]
  targetId: string
  targetType: "publication" | "comment"
  authorId: string
  onReact: (reactionType: string) => void
}

const reactionEmojis = {
  like: { emoji: "👍", label: "Me gusta", color: "text-blue-500" },
  love: { emoji: "❤️", label: "Me encanta", color: "text-red-500" },
  haha: { emoji: "😂", label: "Me divierte", color: "text-yellow-500" },
  wow: { emoji: "😮", label: "Me asombra", color: "text-orange-500" },
  sad: { emoji: "😢", label: "Me entristece", color: "text-blue-400" },
  angry: { emoji: "😡", label: "Me enoja", color: "text-red-600" },
}

export function ReactionButton({ reactions, targetId, targetType, authorId, onReact }: ReactionButtonProps) {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const userReaction = reactions.find((r) => r.userId === user?.id)
  const reactionCounts = reactions.reduce(
    (acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const totalReactions = reactions.length
  const topReactions = Object.entries(reactionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  const handleReaction = (reactionType: string) => {
    if (!user) return

    onReact(reactionType)
    setIsOpen(false)

    // Notificar al autor si no es el mismo usuario
    if (authorId !== user.id) {
      addNotification({
        userId: authorId,
        type: "like",
        title: "Nueva reacción",
        message: `${user.name} reaccionó ${reactionEmojis[reactionType as keyof typeof reactionEmojis].label.toLowerCase()} a tu ${targetType === "publication" ? "publicación" : "comentario"}`,
        read: false,
        priority: "low",
      })
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center space-x-1 ${
              userReaction ? reactionEmojis[userReaction.type as keyof typeof reactionEmojis].color : ""
            }`}
          >
            {userReaction ? (
              <>
                <span>{reactionEmojis[userReaction.type as keyof typeof reactionEmojis].emoji}</span>
                <span>{reactionEmojis[userReaction.type as keyof typeof reactionEmojis].label}</span>
              </>
            ) : (
              <>
                <span>👍</span>
                <span>Me gusta</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex space-x-1">
            {Object.entries(reactionEmojis).map(([type, { emoji, label }]) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                className="text-2xl hover:scale-125 transition-transform"
                onClick={() => handleReaction(type)}
                title={label}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {totalReactions > 0 && (
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <div className="flex -space-x-1">
            {topReactions.map(([type]) => (
              <span key={type} className="text-xs">
                {reactionEmojis[type as keyof typeof reactionEmojis].emoji}
              </span>
            ))}
          </div>
          <span>{totalReactions}</span>
        </div>
      )}
    </div>
  )
}
