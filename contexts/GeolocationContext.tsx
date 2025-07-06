"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "./AuthContext"

export interface Coordinates {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  altitudeAccuracy?: number
  heading?: number
  speed?: number
  timestamp?: number
}

export interface Location {
  coordinates: Coordinates
  address: string
  city?: string
  country?: string
  postalCode?: string
}

export interface GeofenceAlert {
  id: string
  name: string
  coordinates: Coordinates
  radius: number
  active: boolean
  createdAt: string
  lastTriggered?: string
}

export interface LocationSettings {
  enableHighAccuracy: boolean
  autoDetectLocation: boolean
  enableBackground: boolean
  alertRadius: number
  maxAge: number
  timeout: number
  enableGeofencing: boolean
  enableLocationHistory: boolean
  shareLocation: boolean
}

export interface Publication {
  id: string
  title: string
  description: string
  type: "lost" | "found" | "theft" | "vandalism" | "other"
  location: Location
  images: string[]
  userId: string
  userName: string
  createdAt: string
  status: "active" | "resolved" | "closed"
}

interface GeolocationContextType {
  currentLocation: Location | null
  isLocationEnabled: boolean
  isLoading: boolean
  error: string | null
  locationHistory: Location[]
  geofenceAlerts: GeofenceAlert[]
  locationSettings: LocationSettings
  nearbyPublications: Publication[]
  watchId: number | null

  // Location methods
  getCurrentLocation: () => Promise<Location | null>
  watchLocation: () => void
  stopWatchingLocation: () => void
  clearLocationHistory: () => void

  // Geofencing methods
  createGeofenceAlert: (name: string, coordinates: Coordinates, radius: number) => void
  removeGeofenceAlert: (id: string) => void
  toggleGeofenceAlert: (id: string) => void

  // Settings methods
  updateLocationSettings: (settings: Partial<LocationSettings>) => void

  // Search methods
  searchNearbyPublications: (radius: number) => Promise<Publication[]>
  calculateDistance: (coord1: Coordinates, coord2: Coordinates) => number
  geocodeAddress: (address: string) => Promise<Coordinates | null>
  reverseGeocode: (coordinates: Coordinates) => Promise<string>
}

const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined)

const defaultSettings: LocationSettings = {
  enableHighAccuracy: true,
  autoDetectLocation: true,
  enableBackground: false,
  alertRadius: 1000,
  maxAge: 300000, // 5 minutes
  timeout: 10000, // 10 seconds
  enableGeofencing: true,
  enableLocationHistory: true,
  shareLocation: true,
}

// Mock publications data for demonstration
const mockPublications: Publication[] = [
  {
    id: "1",
    title: "Bicicleta robada",
    description: "Bicicleta de montaña azul, marca Trek",
    type: "theft",
    location: {
      coordinates: { latitude: -34.6037, longitude: -58.3816 },
      address: "Av. Corrientes 1000, Buenos Aires",
    },
    images: ["/placeholder.svg?height=200&width=200"],
    userId: "user1",
    userName: "Juan Pérez",
    createdAt: "2024-01-15T10:30:00Z",
    status: "active",
  },
  {
    id: "2",
    title: "Celular encontrado",
    description: "iPhone 13 encontrado en el parque",
    type: "found",
    location: {
      coordinates: { latitude: -34.6118, longitude: -58.396 },
      address: "Parque Centenario, Buenos Aires",
    },
    images: ["/placeholder.svg?height=200&width=200"],
    userId: "user2",
    userName: "María García",
    createdAt: "2024-01-14T15:45:00Z",
    status: "active",
  },
  {
    id: "3",
    title: "Vandalismo en plaza",
    description: "Grafitis en monumentos históricos",
    type: "vandalism",
    location: {
      coordinates: { latitude: -34.6083, longitude: -58.3712 },
      address: "Plaza de Mayo, Buenos Aires",
    },
    images: ["/placeholder.svg?height=200&width=200"],
    userId: "user3",
    userName: "Carlos López",
    createdAt: "2024-01-13T09:20:00Z",
    status: "active",
  },
]

export function GeolocationProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [isLocationEnabled, setIsLocationEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationHistory, setLocationHistory] = useState<Location[]>([])
  const [geofenceAlerts, setGeofenceAlerts] = useState<GeofenceAlert[]>([])
  const [locationSettings, setLocationSettings] = useState<LocationSettings>(defaultSettings)
  const [nearbyPublications, setNearbyPublications] = useState<Publication[]>([])
  const [watchId, setWatchId] = useState<number | null>(null)

  // Check if geolocation is supported
  useEffect(() => {
    setIsLocationEnabled("geolocation" in navigator)

    // Load saved data from localStorage
    if (user) {
      const savedSettings = localStorage.getItem(`locationSettings_${user.id}`)
      if (savedSettings) {
        setLocationSettings(JSON.parse(savedSettings))
      }

      const savedAlerts = localStorage.getItem(`geofenceAlerts_${user.id}`)
      if (savedAlerts) {
        setGeofenceAlerts(JSON.parse(savedAlerts))
      }

      const savedHistory = localStorage.getItem(`locationHistory_${user.id}`)
      if (savedHistory) {
        setLocationHistory(JSON.parse(savedHistory))
      }
    }
  }, [user])

  // Auto-detect location on load
  useEffect(() => {
    if (isLocationEnabled && locationSettings.autoDetectLocation) {
      getCurrentLocation()
    }
  }, [isLocationEnabled, locationSettings.autoDetectLocation])

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((coord1: Coordinates, coord2: Coordinates): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180
    const φ2 = (coord2.latitude * Math.PI) / 180
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }, [])

  // Reverse geocoding using Nominatim API
  const reverseGeocode = useCallback(async (coordinates: Coordinates): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&zoom=18&addressdetails=1`,
      )
      const data = await response.json()
      return data.display_name || `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`
    } catch (error) {
      console.error("Reverse geocoding error:", error)
      return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`
    }
  }, [])

  // Geocoding using Nominatim API
  const geocodeAddress = useCallback(async (address: string): Promise<Coordinates | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      )
      const data = await response.json()
      if (data.length > 0) {
        return {
          latitude: Number.parseFloat(data[0].lat),
          longitude: Number.parseFloat(data[0].lon),
        }
      }
      return null
    } catch (error) {
      console.error("Geocoding error:", error)
      return null
    }
  }, [])

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<Location | null> => {
    if (!isLocationEnabled) {
      setError("Geolocalización no soportada")
      return null
    }

    setIsLoading(true)
    setError(null)

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coordinates: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
          }

          const address = await reverseGeocode(coordinates)
          const location: Location = { coordinates, address }

          setCurrentLocation(location)

          // Add to history if enabled
          if (locationSettings.enableLocationHistory && user) {
            setLocationHistory((prev) => {
              const newHistory = [location, ...prev.slice(0, 49)] // Keep last 50 locations
              localStorage.setItem(`locationHistory_${user.id}`, JSON.stringify(newHistory))
              return newHistory
            })
          }

          // Check geofence alerts
          checkGeofenceAlerts(coordinates)

          setIsLoading(false)
          resolve(location)
        },
        (error) => {
          let errorMessage = "Error desconocido"
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Permisos de ubicación denegados"
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Ubicación no disponible"
              break
            case error.TIMEOUT:
              errorMessage = "Tiempo de espera agotado"
              break
          }
          setError(errorMessage)
          setIsLoading(false)
          resolve(null)
        },
        {
          enableHighAccuracy: locationSettings.enableHighAccuracy,
          timeout: locationSettings.timeout,
          maximumAge: locationSettings.maxAge,
        },
      )
    })
  }, [isLocationEnabled, locationSettings, reverseGeocode, user])

  // Watch location changes
  const watchLocation = useCallback(() => {
    if (!isLocationEnabled || watchId !== null) return

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const coordinates: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp,
        }

        const address = await reverseGeocode(coordinates)
        const location: Location = { coordinates, address }

        setCurrentLocation(location)
        checkGeofenceAlerts(coordinates)
      },
      (error) => {
        console.error("Watch position error:", error)
      },
      {
        enableHighAccuracy: locationSettings.enableHighAccuracy,
        timeout: locationSettings.timeout,
        maximumAge: locationSettings.maxAge,
      },
    )

    setWatchId(id)
    toast({
      title: "Seguimiento activado",
      description: "Tu ubicación se actualizará automáticamente",
    })
  }, [isLocationEnabled, watchId, locationSettings, reverseGeocode, toast])

  // Stop watching location
  const stopWatchingLocation = useCallback(() => {
    if (watchId !== null) {
      try {
        navigator.geolocation.clearWatch(watchId)
        setWatchId(null)
        toast({
          title: "Seguimiento desactivado",
          description: "El seguimiento de ubicación se ha detenido",
        })
      } catch (error) {
        console.warn("Error stopping location watch:", error)
        setWatchId(null)
      }
    }
  }, [watchId, toast])

  // Check geofence alerts
  const checkGeofenceAlerts = useCallback(
    (coordinates: Coordinates) => {
      if (!locationSettings.enableGeofencing) return

      geofenceAlerts.forEach((alert) => {
        if (!alert.active) return

        const distance = calculateDistance(coordinates, alert.coordinates)
        if (distance <= alert.radius) {
          // Trigger alert
          toast({
            title: "¡Alerta geográfica!",
            description: `Estás cerca de: ${alert.name}`,
            duration: 5000,
          })

          // Update last triggered
          setGeofenceAlerts((prev) =>
            prev.map((a) => (a.id === alert.id ? { ...a, lastTriggered: new Date().toISOString() } : a)),
          )
        }
      })
    },
    [geofenceAlerts, locationSettings.enableGeofencing, calculateDistance, toast],
  )

  // Create geofence alert
  const createGeofenceAlert = useCallback(
    (name: string, coordinates: Coordinates, radius: number) => {
      if (!user) return

      const newAlert: GeofenceAlert = {
        id: Date.now().toString(),
        name,
        coordinates,
        radius,
        active: true,
        createdAt: new Date().toISOString(),
      }

      setGeofenceAlerts((prev) => {
        const updated = [...prev, newAlert]
        localStorage.setItem(`geofenceAlerts_${user.id}`, JSON.stringify(updated))
        return updated
      })

      toast({
        title: "Alerta creada",
        description: `Se creó la alerta "${name}" con radio de ${radius}m`,
      })
    },
    [user, toast],
  )

  // Remove geofence alert
  const removeGeofenceAlert = useCallback(
    (id: string) => {
      if (!user) return

      setGeofenceAlerts((prev) => {
        const updated = prev.filter((alert) => alert.id !== id)
        localStorage.setItem(`geofenceAlerts_${user.id}`, JSON.stringify(updated))
        return updated
      })
    },
    [user],
  )

  // Toggle geofence alert
  const toggleGeofenceAlert = useCallback(
    (id: string) => {
      if (!user) return

      setGeofenceAlerts((prev) => {
        const updated = prev.map((alert) => (alert.id === id ? { ...alert, active: !alert.active } : alert))
        localStorage.setItem(`geofenceAlerts_${user.id}`, JSON.stringify(updated))
        return updated
      })
    },
    [user],
  )

  // Update location settings
  const updateLocationSettings = useCallback(
    (newSettings: Partial<LocationSettings>) => {
      setLocationSettings((prev) => {
        const updated = { ...prev, ...newSettings }
        if (user) {
          localStorage.setItem(`locationSettings_${user.id}`, JSON.stringify(updated))
        }
        return updated
      })
    },
    [user],
  )

  // Clear location history
  const clearLocationHistory = useCallback(() => {
    if (!user) return

    setLocationHistory([])
    localStorage.removeItem(`locationHistory_${user.id}`)
    toast({
      title: "Historial borrado",
      description: "Se ha eliminado el historial de ubicaciones",
    })
  }, [user, toast])

  // Search nearby publications
  const searchNearbyPublications = useCallback(
    async (radius: number): Promise<Publication[]> => {
      if (!currentLocation) return []

      const nearby = mockPublications
        .filter((pub) => {
          const distance = calculateDistance(currentLocation.coordinates, pub.location.coordinates)
          return distance <= radius
        })
        .map((pub) => ({
          ...pub,
          distance: calculateDistance(currentLocation.coordinates, pub.location.coordinates),
        }))
        .sort((a, b) => a.distance - b.distance)

      setNearbyPublications(nearby)
      return nearby
    },
    [currentLocation, calculateDistance],
  )

  const value: GeolocationContextType = {
    currentLocation,
    isLocationEnabled,
    isLoading,
    error,
    locationHistory,
    geofenceAlerts,
    locationSettings,
    nearbyPublications,
    watchId,
    getCurrentLocation,
    watchLocation,
    stopWatchingLocation,
    clearLocationHistory,
    createGeofenceAlert,
    removeGeofenceAlert,
    toggleGeofenceAlert,
    updateLocationSettings,
    searchNearbyPublications,
    calculateDistance,
    geocodeAddress,
    reverseGeocode,
  }

  return <GeolocationContext.Provider value={value}>{children}</GeolocationContext.Provider>
}

export function useGeolocation() {
  const context = useContext(GeolocationContext)
  if (context === undefined) {
    throw new Error("useGeolocation must be used within a GeolocationProvider")
  }
  return context
}
