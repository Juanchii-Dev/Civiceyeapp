"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useGeolocation } from "@/contexts/GeolocationContext"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Settings, AlertTriangle, Navigation, Trash2 } from "lucide-react"

export function LocationSettings() {
  const { toast } = useToast()
  const {
    currentLocation,
    isLocationEnabled,
    isLoading,
    error,
    getCurrentLocation,
    watchLocation,
    stopWatchingLocation,
    geofenceAlerts,
    removeGeofenceAlert,
    locationSettings,
    updateLocationSettings,
  } = useGeolocation()

  const [tempSettings, setTempSettings] = useState(locationSettings)

  const handleSaveSettings = () => {
    updateLocationSettings(tempSettings)
    toast({
      title: "Configuración guardada",
      description: "La configuración de ubicación se ha actualizado",
    })
  }

  const handleGetLocation = async () => {
    const location = await getCurrentLocation()
    if (location) {
      toast({
        title: "Ubicación obtenida",
        description: "Tu ubicación actual se ha actualizado",
      })
    }
  }

  const handleRemoveAlert = (alertId: string) => {
    removeGeofenceAlert(alertId)
    toast({
      title: "Alerta eliminada",
      description: "La alerta geográfica ha sido eliminada",
    })
  }

  return (
    <div className="space-y-6">
      {/* Estado actual de ubicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Estado de Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Geolocalización soportada:</span>
            <Badge variant={isLocationEnabled ? "default" : "destructive"}>{isLocationEnabled ? "Sí" : "No"}</Badge>
          </div>

          {currentLocation ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Ubicación actual:</p>
              <p className="text-sm text-gray-600">{currentLocation.address}</p>
              <p className="text-xs text-gray-500">
                Coordenadas: {currentLocation.coordinates.latitude.toFixed(6)},{" "}
                {currentLocation.coordinates.longitude.toFixed(6)}
              </p>
              {currentLocation.coordinates.accuracy && (
                <p className="text-xs text-gray-500">
                  Precisión: ±{Math.round(currentLocation.coordinates.accuracy)} metros
                </p>
              )}
              {currentLocation.coordinates.timestamp && (
                <p className="text-xs text-gray-500">
                  Última actualización: {new Date(currentLocation.coordinates.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay ubicación disponible</p>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button onClick={handleGetLocation} disabled={isLoading || !isLocationEnabled}>
              <Navigation className="w-4 h-4 mr-2" />
              {isLoading ? "Obteniendo..." : "Obtener Ubicación"}
            </Button>
            <Button variant="outline" onClick={watchLocation}>
              Seguir Ubicación
            </Button>
            <Button variant="outline" onClick={stopWatchingLocation}>
              Detener Seguimiento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de ubicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configuración de Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="highAccuracy">Alta precisión</Label>
              <p className="text-sm text-gray-500">Usar GPS para mayor precisión (consume más batería)</p>
            </div>
            <Switch
              id="highAccuracy"
              checked={tempSettings.enableHighAccuracy}
              onCheckedChange={(checked) => setTempSettings({ ...tempSettings, enableHighAccuracy: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoDetect">Detección automática</Label>
              <p className="text-sm text-gray-500">Obtener ubicación automáticamente al abrir la app</p>
            </div>
            <Switch
              id="autoDetect"
              checked={tempSettings.autoDetectLocation}
              onCheckedChange={(checked) => setTempSettings({ ...tempSettings, autoDetectLocation: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="background">Ubicación en segundo plano</Label>
              <p className="text-sm text-gray-500">Mantener ubicación activa en segundo plano</p>
            </div>
            <Switch
              id="background"
              checked={tempSettings.enableBackground}
              onCheckedChange={(checked) => setTempSettings({ ...tempSettings, enableBackground: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alertRadius">Radio de alerta por defecto (metros)</Label>
            <Input
              id="alertRadius"
              type="number"
              value={tempSettings.alertRadius}
              onChange={(e) => setTempSettings({ ...tempSettings, alertRadius: Number(e.target.value) })}
              min="100"
              max="10000"
              step="100"
            />
            <p className="text-sm text-gray-500">Radio por defecto para nuevas alertas geográficas (100m - 10km)</p>
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            Guardar Configuración
          </Button>
        </CardContent>
      </Card>

      {/* Alertas geográficas activas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Alertas Geográficas Activas ({geofenceAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {geofenceAlerts.length > 0 ? (
            <div className="space-y-3">
              {geofenceAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{alert.name}</h4>
                    <p className="text-sm text-gray-600">
                      Radio: {alert.radius}m | Creada: {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {alert.coordinates.latitude.toFixed(6)}, {alert.coordinates.longitude.toFixed(6)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={alert.active ? "default" : "secondary"}>
                      {alert.active ? "Activa" : "Inactiva"}
                    </Badge>
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveAlert(alert.id)}>
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
              <p className="text-sm text-gray-400 mt-2">
                Ve al mapa para crear alertas y recibir notificaciones cuando estés cerca de zonas específicas
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
