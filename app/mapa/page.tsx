"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { InteractiveMap } from "@/components/maps/InteractiveMap"
import { useAuth } from "@/contexts/AuthContext"
import { useGeolocation } from "@/contexts/GeolocationContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Navigation, AlertTriangle, Clock, TrendingUp } from "lucide-react"

export default function MapaPage() {
  const { user } = useAuth()
  const { currentLocation, nearbyPublications, geofenceAlerts, locationHistory, searchNearbyPublications, isLoading } =
    useGeolocation()

  const [activeTab, setActiveTab] = useState("mapa")

  // Auto-search nearby publications when location changes
  useEffect(() => {
    if (currentLocation) {
      searchNearbyPublications(2000) // 2km radius
    }
  }, [currentLocation, searchNearbyPublications])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso Requerido</h2>
              <p className="text-gray-600">Debes iniciar sesión para acceder al mapa interactivo.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mapa Interactivo</h1>
          <p className="text-gray-600">
            Explora denuncias cercanas, crea alertas geográficas y encuentra objetos perdidos en tu área
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mapa">Mapa</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
            <TabsTrigger value="alertas">Alertas</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="mapa" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Publicaciones Cercanas</p>
                      <p className="text-2xl font-bold">{nearbyPublications.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Alertas Activas</p>
                      <p className="text-2xl font-bold">{geofenceAlerts.filter((a) => a.active).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Precisión GPS</p>
                      <p className="text-2xl font-bold">
                        {currentLocation?.coordinates.accuracy
                          ? `±${Math.round(currentLocation.coordinates.accuracy)}m`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Ubicaciones Guardadas</p>
                      <p className="text-2xl font-bold">{locationHistory.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Map */}
            <div className="bg-white rounded-lg shadow-sm">
              <InteractiveMap height="600px" showControls={true} showSearch={true} enableGeofencing={true} />
            </div>
          </TabsContent>

          <TabsContent value="estadisticas" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Publicaciones por Tipo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["theft", "found", "vandalism", "other"].map((type) => {
                      const count = nearbyPublications.filter((p) => p.type === type).length
                      const percentage = nearbyPublications.length > 0 ? (count / nearbyPublications.length) * 100 : 0

                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={type === "theft" ? "destructive" : type === "found" ? "default" : "secondary"}
                            >
                              {type.toUpperCase()}
                            </Badge>
                            <span className="text-sm">{count} publicaciones</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distancias Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {nearbyPublications.length > 0 ? (
                      <>
                        <div className="flex justify-between">
                          <span>Más cercana:</span>
                          <span className="font-medium">
                            {Math.min(...nearbyPublications.map((p) => p.distance || 0)).toFixed(0)}m
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Más lejana:</span>
                          <span className="font-medium">
                            {(Math.max(...nearbyPublications.map((p) => p.distance || 0)) / 1000).toFixed(2)}km
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Promedio:</span>
                          <span className="font-medium">
                            {(
                              nearbyPublications.reduce((sum, p) => sum + (p.distance || 0), 0) /
                              nearbyPublications.length /
                              1000
                            ).toFixed(2)}
                            km
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 text-center">No hay datos disponibles</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alertas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertas Geográficas ({geofenceAlerts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {geofenceAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {geofenceAlerts.map((alert) => (
                      <div key={alert.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{alert.name}</h3>
                            <p className="text-sm text-gray-600">Radio: {alert.radius}m</p>
                            <p className="text-xs text-gray-500">
                              Coordenadas: {alert.coordinates.latitude.toFixed(6)},{" "}
                              {alert.coordinates.longitude.toFixed(6)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Creada: {new Date(alert.createdAt).toLocaleDateString()}
                            </p>
                            {alert.lastTriggered && (
                              <p className="text-xs text-blue-600">
                                Última activación: {new Date(alert.lastTriggered).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <Badge variant={alert.active ? "default" : "secondary"}>
                            {alert.active ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No tienes alertas geográficas</p>
                    <p className="text-sm text-gray-400 mt-2">Ve al mapa para crear alertas y recibir notificaciones</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Ubicaciones ({locationHistory.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {locationHistory.length > 0 ? (
                  <div className="space-y-3">
                    {locationHistory.slice(0, 10).map((location, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <p className="font-medium text-sm">{location.address}</p>
                        <p className="text-xs text-gray-500">
                          {location.coordinates.latitude.toFixed(6)}, {location.coordinates.longitude.toFixed(6)}
                        </p>
                        {location.coordinates.timestamp && (
                          <p className="text-xs text-gray-400">
                            {new Date(location.coordinates.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                    {locationHistory.length > 10 && (
                      <p className="text-sm text-gray-500 text-center">
                        Y {locationHistory.length - 10} ubicaciones más...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No hay historial de ubicaciones</p>
                    <p className="text-sm text-gray-400 mt-2">
                      El historial se guardará automáticamente cuando uses la geolocalización
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
