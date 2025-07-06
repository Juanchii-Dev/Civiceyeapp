"use client"

import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { useAuth } from "@/contexts/AuthContext"
import { useGeolocation } from "@/contexts/GeolocationContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Navigation, AlertTriangle, Save, RefreshCw, Trash2 } from "lucide-react"

export default function ConfiguracionUbicacionPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const {
    currentLocation,
    locationSettings,
    updateLocationSettings,
    geofenceAlerts,
    removeGeofenceAlert,
    toggleGeofenceAlert,
    clearLocationHistory,
    getCurrentLocation,
    watchLocation,
    stopWatchingLocation,
    watchId,
  } = useGeolocation()

  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSettingChange = (key: keyof typeof locationSettings, value: any) => {
    updateLocationSettings({ [key]: value })
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Settings are already saved in updateLocationSettings
      await new Promise((resolve) => setTimeout(resolve, 500))
      setHasChanges(false)
      toast({
        title: "Configuración guardada",
        description: "Los ajustes de ubicación se han guardado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearHistory = () => {
    clearLocationHistory()
    toast({
      title: "Historial borrado",
      description: "Se ha eliminado el historial de ubicaciones",
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso Requerido</h2>
              <p className="text-gray-600">Debes iniciar sesión para acceder a la configuración de ubicación.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración de Ubicación</h1>
            <p className="text-gray-600">Gestiona tus preferencias de geolocalización y privacidad</p>
          </div>

          <div className="flex items-center space-x-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Cambios sin guardar
              </Badge>
            )}
            <Button onClick={handleSave} disabled={isLoading || !hasChanges}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Current Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Navigation className="w-5 h-5 mr-2" />
                Ubicación Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentLocation ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{currentLocation.address}</p>
                      <p className="text-sm text-gray-500">
                        {currentLocation.coordinates.latitude.toFixed(6)},{" "}
                        {currentLocation.coordinates.longitude.toFixed(6)}
                      </p>
                      {currentLocation.coordinates.accuracy && (
                        <p className="text-xs text-gray-400">
                          Precisión: ±{Math.round(currentLocation.coordinates.accuracy)}m
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={getCurrentLocation}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualizar
                      </Button>
                      {watchId ? (
                        <Button variant="outline" size="sm" onClick={stopWatchingLocation}>
                          Detener seguimiento
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={watchLocation}>
                          Iniciar seguimiento
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <MapPin className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Ubicación no disponible</p>
                  <Button variant="outline" size="sm" onClick={getCurrentLocation} className="mt-2 bg-transparent">
                    Obtener ubicación
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Geolocalización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="alertRadius">Radio de alerta (metros)</Label>
                  <Input
                    id="alertRadius"
                    type="number"
                    value={locationSettings.alertRadius}
                    onChange={(e) => handleSettingChange("alertRadius", Number(e.target.value))}
                    min="100"
                    max="10000"
                    step="100"
                  />
                  <p className="text-sm text-gray-500">Radio por defecto para búsquedas y alertas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">Tiempo límite (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={locationSettings.timeout}
                    onChange={(e) => handleSettingChange("timeout", Number(e.target.value))}
                    min="5000"
                    max="30000"
                    step="1000"
                  />
                  <p className="text-sm text-gray-500">Tiempo máximo para obtener ubicación</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableHighAccuracy">Alta precisión</Label>
                    <p className="text-sm text-gray-500">Usar GPS para mayor precisión (consume más batería)</p>
                  </div>
                  <Switch
                    id="enableHighAccuracy"
                    checked={locationSettings.enableHighAccuracy}
                    onCheckedChange={(checked) => handleSettingChange("enableHighAccuracy", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoDetectLocation">Detección automática</Label>
                    <p className="text-sm text-gray-500">Obtener ubicación automáticamente al cargar la app</p>
                  </div>
                  <Switch
                    id="autoDetectLocation"
                    checked={locationSettings.autoDetectLocation}
                    onCheckedChange={(checked) => handleSettingChange("autoDetectLocation", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableGeofencing">Alertas geográficas</Label>
                    <p className="text-sm text-gray-500">Recibir notificaciones al entrar en zonas específicas</p>
                  </div>
                  <Switch
                    id="enableGeofencing"
                    checked={locationSettings.enableGeofencing}
                    onCheckedChange={(checked) => handleSettingChange("enableGeofencing", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableLocationHistory">Historial de ubicaciones</Label>
                    <p className="text-sm text-gray-500">Guardar historial de ubicaciones visitadas</p>
                  </div>
                  <Switch
                    id="enableLocationHistory"
                    checked={locationSettings.enableLocationHistory}
                    onCheckedChange={(checked) => handleSettingChange("enableLocationHistory", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="shareLocation">Compartir ubicación</Label>
                    <p className="text-sm text-gray-500">Permitir que otros usuarios vean tu ubicación</p>
                  </div>
                  <Switch
                    id="shareLocation"
                    checked={locationSettings.shareLocation}
                    onCheckedChange={(checked) => handleSettingChange("shareLocation", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Geofence Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Alertas Geográficas ({geofenceAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {geofenceAlerts.length > 0 ? (
                <div className="space-y-3">
                  {geofenceAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{alert.name}</h3>
                          <Badge variant={alert.active ? "default" : "secondary"}>
                            {alert.active ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">Radio: {alert.radius}m</p>
                        <p className="text-xs text-gray-400">
                          Creada: {new Date(alert.createdAt).toLocaleDateString()}
                        </p>
                        {alert.lastTriggered && (
                          <p className="text-xs text-blue-600">
                            Última activación: {new Date(alert.lastTriggered).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={alert.active} onCheckedChange={() => toggleGeofenceAlert(alert.id)} />
                        <Button variant="destructive" size="sm" onClick={() => removeGeofenceAlert(alert.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No tienes alertas geográficas configuradas</p>
                  <p className="text-sm text-gray-400 mt-2">Ve al mapa para crear alertas personalizadas</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Historial de ubicaciones</h3>
                    <p className="text-sm text-gray-500">Eliminar todas las ubicaciones guardadas</p>
                  </div>
                  <Button variant="destructive" onClick={handleClearHistory}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Borrar historial
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
