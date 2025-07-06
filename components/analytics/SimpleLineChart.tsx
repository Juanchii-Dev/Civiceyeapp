"use client"

interface SimpleLineChartProps {
  data: Array<{
    name: string
    value: number
  }>
  height?: number
  color?: string
}

export function SimpleLineChart({ data, height = 200, color = "#3b82f6" }: SimpleLineChartProps) {
  if (data.length === 0) return <div>No hay datos disponibles</div>

  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))
  const range = maxValue - minValue || 1

  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((item.value - minValue) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="w-full" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - ((item.value - minValue) / range) * 100
          return <circle key={index} cx={x} cy={y} r="3" fill={color} vectorEffect="non-scaling-stroke" />
        })}
      </svg>
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        {data.map((item, index) => (
          <span key={index}>{item.name}</span>
        ))}
      </div>
    </div>
  )
}
