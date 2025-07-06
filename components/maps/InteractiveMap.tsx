"use client"

import { useEffect, useRef, useState } from "react"
import { useGeolocation } from "@/contexts/GeolocationContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Navigation, Search, Plus, Target, List, MapIcon } from "lucide-react"

// Leaflet imports (dynamic to avoid SSR issues)
let L: any = null
if (typeof window !== "undefined") {
  L = require("leaflet")
  require("leaflet/dist/leaflet.css")

  // Fix for default markers
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  })
}

interface InteractiveMapProps {
  height?: string
  showControls?: boolean
  showSearch?: boolean
  enableGeofencing?: boolean
}

export function InteractiveMap({
  height = "500px",
  showControls = true,
  showSearch = true,
  enableGeofencing = true,
}: InteractiveMapProps) {
  const { toast } = useToast()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isMapView, setIsMapView] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchRadius, setSearchRadius] = useState(1000)
  const [isCreatingAlert, setIsCreatingAlert] = useState(false)
  const [alertName, setAlertName] = useState("")
  const [alertRadius, setAlertRadius] = useState(500)

  const {
    currentLocation,
    isLocationEnabled,
    isLoading,
    getCurrentLocation,
    nearbyPublications,
    searchNearbyPublications,
    geofenceAlerts,
    createGeofenceAlert,
    geocodeAddress,
    calculateDistance,
  } = useGeolocation()

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !L || mapInstanceRef.current) return

    // Create map
    const map = L.map(mapRef.current).setView([-34.6037, -58.3816], 13)

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    mapInstanceRef.current = map

    // Add click handler for creating geofence alerts
    if (enableGeofencing) {
      map.on("click", (e: any) => {
        if (isCreatingAlert) {
          const { lat, lng } = e.latlng
          if (alertName.trim()) {
            createGeofenceAlert(alertName, { latitude: lat, longitude: lng }, alertRadius)
            setIsCreatingAlert(false)
            setAlertName("")
            updateMapMarkers()
          } else {
            toast({
              title: "Error",
              description: "Ingresa un nombre para la alerta",
              variant: "destructive",
            })
          }
        }
      })
    }

    return () => {
      try {
        if (mapInstanceRef.current) {
          // Limpiar marcadores primero
          markersRef.current.forEach((marker) => {
            try {
              if (mapInstanceRef.current.hasLayer(marker)) {
                mapInstanceRef.current.removeLayer(marker)
              }
            } catch (e) {
              console.warn("Error cleaning marker:", e)
            }
          })
          markersRef.current = []

          // Remover el mapa
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }
      } catch (error) {
        console.warn("Error cleaning up map:", error)
      }
    }
  }, [enableGeofencing, isCreatingAlert, alertName, alertRadius, createGeofenceAlert, toast])

  // Update map markers
  const updateMapMarkers = () => {
    if (!mapInstanceRef.current || !L) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      try {
        if (mapInstanceRef.current && marker && mapInstanceRef.current.hasLayer(marker)) {
          mapInstanceRef.current.removeLayer(marker)
        }
      } catch (error) {
        console.warn("Error removing marker:", error)
      }
    })
    markersRef.current = []

    // Add current location marker
    if (currentLocation) {
      const currentMarker = L.marker([currentLocation.coordinates.latitude, currentLocation.coordinates.longitude], {
        icon: L.divIcon({
          className: "current-location-marker",
          html: `<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      }).addTo(mapInstanceRef.current)

      currentMarker.bindPopup(`
        <div>
          <strong>Tu ubicación actual</strong><br>
          ${currentLocation.address}<br>
          <small>Precisión: ±${currentLocation.coordinates.accuracy?.toFixed(0) || "N/A"}m</small>
        </div>
      `)

      markersRef.current.push(currentMarker)
    }

    // Add publication markers
    nearbyPublications.forEach((pub) => {
      const color =
        pub.type === "theft"
          ? "#ef4444"
          : pub.type === "found"
            ? "#22c55e"
            : pub.type === "vandalism"
              ? "#f97316"
              : "#6b7280"

      const marker = L.marker([pub.location.coordinates.latitude, pub.location.coordinates.longitude], {
        icon: L.divIcon({
          className: "publication-marker",
          html: `<div style="background: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      }).addTo(mapInstanceRef.current)

      const distance = currentLocation ? calculateDistance(currentLocation.coordinates, pub.location.coordinates) : 0

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <strong>${pub.title}</strong><br>
          <span style="color: ${color}; font-weight: 500;">${pub.type.toUpperCase()}</span><br>
          <p style="margin: 8px 0; font-size: 14px;">${pub.description}</p>
          <small style="color: #666;">
            Por: ${pub.userName}<br>
            ${new Date(pub.createdAt).toLocaleDateString()}<br>
            ${distance > 0 ? `Distancia: ${(distance / 1000).toFixed(2)} km` : ""}
          </small>
        </div>
      `)

      markersRef.current.push(marker)
    })

    // Add geofence alert markers
    geofenceAlerts.forEach((alert) => {
      const alertMarker = L.marker([alert.coordinates.latitude, alert.coordinates.longitude], {
        icon: L.divIcon({
          className: "alert-marker",
          html: `<div style="background: ${alert.active ? "#8b5cf6" : "#9ca3af"}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        }),
      }).addTo(mapInstanceRef.current)

      // Add radius circle
      const circle = L.circle([alert.coordinates.latitude, alert.coordinates.longitude], {
        color: alert.active ? "#8b5cf6" : "#9ca3af",
        fillColor: alert.active ? "#8b5cf6" : "#9ca3af",
        fillOpacity: 0.1,
        radius: alert.radius,
      }).addTo(mapInstanceRef.current)

      alertMarker.bindPopup(`
        <div>
          <strong>${alert.name}</strong><br>
          <span style="color: ${alert.active ? "#8b5cf6" : "#9ca3af"};">
            ${alert.active ? "Activa" : "Inactiva"}
          </span><br>
          Radio: ${alert.radius}m<br>
          <small>Creada: ${new Date(alert.createdAt).toLocaleDateString()}</small>
        </div>
      `)

      markersRef.current.push(alertMarker, circle)
    })

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current)
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }

  // Update markers when data changes
  useEffect(() => {
    updateMapMarkers()
  }, [currentLocation, nearbyPublications, geofenceAlerts])

  // Handle search
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const coordinates = await geocodeAddress(searchQuery)
      if (coordinates && mapInstanceRef.current) {
        mapInstanceRef.current.setView([coordinates.latitude, coordinates.longitude], 15)

        // Add temporary search marker
        const searchMarker = L.marker([coordinates.latitude, coordinates.longitude], {
          icon: L.divIcon({
            className: "search-marker",
            html: `<div style="background: #f59e0b; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          }),
        }).addTo(mapInstanceRef.current)

        searchMarker.bindPopup(`<strong>Resultado de búsqueda:</strong><br>${searchQuery}`).openPopup()

        setTimeout(() => {
          mapInstanceRef.current.removeLayer(searchMarker)
        }, 5000)
      } else {
        toast({
          title: "No encontrado",
          description: "No se pudo encontrar la dirección especificada",
          variant: "destructive",
        })
      }
    } else {
      // Search nearby publications
      await searchNearbyPublications(searchRadius)
      toast({
        title: "Búsqueda completada",
        description: `Se encontraron ${nearbyPublications.length} publicaciones cercanas`,
      })
    }
  }

  // Center map on current location
  const centerOnCurrentLocation = async () => {
    const location = await getCurrentLocation()
    if (location && mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.coordinates.latitude, location.coordinates.longitude], 15)
    }
  }

  if (!isLocationEnabled) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Geolocalización no disponible</h3>
          <p className="text-gray-600">Tu navegador no soporta geolocalización o los permisos están deshabilitados.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      {showControls && (
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant={isMapView ? "default" : "outline"} size="sm" onClick={() => setIsMapView(true)}>
              <MapIcon className="w-4 h-4 mr-2" />
              Mapa
            </Button>
            <Button variant={!isMapView ? "default" : "outline"} size="sm" onClick={() => setIsMapView(false)}>
              <List className="w-4 h-4 mr-2" />
              Lista
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={centerOnCurrentLocation} disabled={isLoading}>
              <Target className="w-4 h-4 mr-2" />
              {isLoading ? "Ubicando..." : "Mi ubicación"}
            </Button>

            {enableGeofencing && (
              <Button
                variant={isCreatingAlert ? "destructive" : "outline"}
                size="sm"
                onClick={() => setIsCreatingAlert(!isCreatingAlert)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isCreatingAlert ? "Cancelar alerta" : "Crear alerta"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      {showSearch && (
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar dirección o lugar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Radio (m)"
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="w-24"
              min="100"
              max="10000"
              step="100"
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
      )}

      {/* Alert creation form */}
      {isCreatingAlert && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Alerta Geográfica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Nombre de la alerta"
                value={alertName}
                onChange={(e) => setAlertName(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Radio en metros"
                value={alertRadius}
                onChange={(e) => setAlertRadius(Number(e.target.value))}
                min="50"
                max="5000"
                step="50"
              />
            </div>
            <p className="text-sm text-gray-600">Haz clic en el mapa para colocar la alerta</p>
          </CardContent>
        </Card>
      )}

      {/* Map or List View */}
      {isMapView ? (
        <div ref={mapRef} style={{ height, width: "100%" }} className="rounded-lg border shadow-sm" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Publicaciones Cercanas ({nearbyPublications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {nearbyPublications.length > 0 ? (
              <div className="space-y-4">
                {nearbyPublications.map((pub) => {
                  const distance = currentLocation
                    ? calculateDistance(currentLocation.coordinates, pub.location.coordinates)
                    : 0

                  return (
                    <div key={pub.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{pub.title}</h3>
                          <Badge
                            variant={
                              pub.type === "theft" ? "destructive" : pub.type === "found" ? "default" : "secondary"
                            }
                            className="mb-2"
                          >
                            {pub.type.toUpperCase()}
                          </Badge>
                          <p className="text-sm text-gray-600 mb-2">{pub.description}</p>
                          <p className="text-xs text-gray-500">
                            Por: {pub.userName} • {new Date(pub.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">{pub.location.address}</p>
                          {distance > 0 && (
                            <p className="text-xs text-blue-600 font-medium">
                              Distancia: {(distance / 1000).toFixed(2)} km
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No hay publicaciones cercanas</p>
                <p className="text-sm text-gray-400 mt-2">Ajusta el radio de búsqueda o cambia tu ubicación</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current location info */}
      {currentLocation && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Ubicación actual:</p>
                <p className="text-xs text-gray-600">{currentLocation.address}</p>
              </div>
              {currentLocation.coordinates.accuracy && (
                <Badge variant="outline" className="text-xs">
                  ±{Math.round(currentLocation.coordinates.accuracy)}m
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
