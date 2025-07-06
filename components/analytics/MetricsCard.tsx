"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  format?: "number" | "percentage" | "currency" | "time"
  color?: "blue" | "green" | "red" | "yellow" | "purple"
}

export function MetricsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  format = "number",
  color = "blue",
}: MetricsCardProps) {
  const formatValue = (val: string | number) => {
    const numVal = typeof val === "string" ? Number.parseFloat(val) : val

    switch (format) {
      case "percentage":
        return `${numVal.toFixed(1)}%`
      case "currency":
        return `$${numVal.toLocaleString()}`
      case "time":
        return `${numVal.toFixed(1)} días`
      default:
        return numVal.toLocaleString()
    }
  }

  const getTrendIcon = () => {
    if (!change) return <Minus className="w-4 h-4" />
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const getTrendColor = () => {
    if (!change) return "secondary"
    return change > 0 ? "default" : "destructive"
  }

  const getColorClasses = () => {
    const colors = {
      blue: "bg-blue-50 border-blue-200",
      green: "bg-green-50 border-green-200",
      red: "bg-red-50 border-red-200",
      yellow: "bg-yellow-50 border-yellow-200",
      purple: "bg-purple-50 border-purple-200",
    }
    return colors[color]
  }

  const getIconColor = () => {
    const colors = {
      blue: "text-blue-600",
      green: "text-green-600",
      red: "text-red-600",
      yellow: "text-yellow-600",
      purple: "text-purple-600",
    }
    return colors[color]
  }

  return (
    <Card className={`${getColorClasses()} hover:shadow-md transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {icon && <div className={getIconColor()}>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-2">{formatValue(value)}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <Badge variant={getTrendColor()} className="text-xs">
              {change > 0 ? "+" : ""}
              {change.toFixed(1)}%
            </Badge>
            {changeLabel && <span className="text-xs text-gray-500">{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
