"use client"

import type React from "react"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

interface SearchBarProps {
  onSearch: (query: string, filters?: SearchFilters) => void
  placeholder?: string
  showFilters?: boolean
}

interface SearchFilters {
  category?: string[]
  status?: string[]
  dateRange?: string
  location?: string
}

export function SearchBar({ onSearch, placeholder = "Buscar denuncias...", showFilters = true }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({
    category: [],
    status: [],
    dateRange: "",
    location: "",
  })
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const categories = [
    { id: "electronics", label: "Electrónicos" },
    { id: "vehicles", label: "Vehículos" },
    { id: "documents", label: "Documentos" },
    { id: "jewelry", label: "Joyas" },
    { id: "clothing", label: "Ropa" },
    { id: "other", label: "Otros" },
  ]

  const statuses = [
    { id: "active", label: "Activas" },
    { id: "recovered", label: "Recuperadas" },
    { id: "closed", label: "Cerradas" },
  ]

  const dateRanges = [
    { id: "today", label: "Hoy" },
    { id: "week", label: "Esta semana" },
    { id: "month", label: "Este mes" },
    { id: "year", label: "Este año" },
  ]

  const handleSearch = () => {
    onSearch(query, filters)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const toggleFilter = (type: keyof SearchFilters, value: string) => {
    if (type === "category" || type === "status") {
      const currentValues = filters[type] || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value]

      setFilters({ ...filters, [type]: newValues })
    } else {
      setFilters({ ...filters, [type]: value })
    }
  }

  const clearFilters = () => {
    setFilters({
      category: [],
      status: [],
      dateRange: "",
      location: "",
    })
    onSearch(query, {})
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category && filters.category.length > 0) count += filters.category.length
    if (filters.status && filters.status.length > 0) count += filters.status.length
    if (filters.dateRange) count += 1
    if (filters.location) count += 1
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-4"
          />
        </div>

        <Button onClick={handleSearch} className="px-6">
          Buscar
        </Button>

        {showFilters && (
          <DropdownMenu open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel className="flex items-center justify-between">
                Filtros de búsqueda
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Limpiar
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuLabel>Categoría</DropdownMenuLabel>
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category.id}
                  checked={filters.category?.includes(category.id)}
                  onCheckedChange={() => toggleFilter("category", category.id)}
                >
                  {category.label}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Estado</DropdownMenuLabel>
              {statuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status.id}
                  checked={filters.status?.includes(status.id)}
                  onCheckedChange={() => toggleFilter("status", status.id)}
                >
                  {status.label}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Fecha</DropdownMenuLabel>
              {dateRanges.map((range) => (
                <DropdownMenuItem
                  key={range.id}
                  onClick={() => toggleFilter("dateRange", range.id)}
                  className={filters.dateRange === range.id ? "bg-accent" : ""}
                >
                  {range.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.category?.map((cat) => {
            const category = categories.find((c) => c.id === cat)
            return (
              <Badge key={cat} variant="secondary" className="cursor-pointer">
                {category?.label}
                <X className="h-3 w-3 ml-1" onClick={() => toggleFilter("category", cat)} />
              </Badge>
            )
          })}

          {filters.status?.map((stat) => {
            const status = statuses.find((s) => s.id === stat)
            return (
              <Badge key={stat} variant="secondary" className="cursor-pointer">
                {status?.label}
                <X className="h-3 w-3 ml-1" onClick={() => toggleFilter("status", stat)} />
              </Badge>
            )
          })}

          {filters.dateRange && (
            <Badge variant="secondary" className="cursor-pointer">
              {dateRanges.find((d) => d.id === filters.dateRange)?.label}
              <X className="h-3 w-3 ml-1" onClick={() => toggleFilter("dateRange", "")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
