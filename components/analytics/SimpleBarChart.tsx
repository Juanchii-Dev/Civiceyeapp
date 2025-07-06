"use client"

interface SimpleBarChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  height?: number
}

export function SimpleBarChart({ data, height = 300 }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full space-x-2">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 60)
          const color = item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`

          return (
            <div key={item.name} className="flex flex-col items-center flex-1">
              <div className="text-xs font-medium mb-1 text-gray-700">{item.value}</div>
              <div
                className="w-full rounded-t-md transition-all duration-300 hover:opacity-80"
                style={{
                  height: barHeight,
                  backgroundColor: color,
                  minHeight: "4px",
                }}
              />
              <div className="text-xs text-gray-600 mt-2 text-center">{item.name}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
