"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useNotifications } from "@/contexts/NotificationContext"
import { useToast } from "@/hooks/use-toast"
import { Bell, Mail, Smartphone, Clock } from "lucide-react"

export function NotificationPreferences() {
  const { preferences, updatePreferences, requestPushPermission } = useNotifications()
  const { toast } = useToast()

  const handlePreferenceChange = (category: string, type: string, value: boolean) => {
    updatePreferences({
      ...preferences,
      [category]: {
        ...preferences[category as keyof typeof preferences],
        [type]: value,
      },
    })
  }

  const handleFrequencyChange = (frequency: "immediate" | "daily" | "weekly") => {
    updatePreferences({ ...preferences, frequency })
  }

  const handleQuietHoursChange = (field: string, value: string | boolean) => {
    updatePreferences({
      ...preferences,
      quietHours: {
        ...preferences.quietHours,
        [field]: value,
      },
    })
  }

  const handleEnablePushNotifications = async () => {
    const granted = await requestPushPermission()
    if (granted) {
      toast({
        title: "Push notifications habilitadas",
        description: "Ahora recibirás notificaciones push en este navegador",
      })
    } else {
      toast({
        title: "Permisos denegados",
        description: "No se pudieron habilitar las notificaciones push",
        variant: "destructive",
      })
    }
  }

  const savePreferences = () => {
    toast({
      title: "Preferencias guardadas",
      description: "Tus preferencias de notificación han sido actualizadas",
    })
  }

  return (
    <div className="space-y-6">
      {/* Notificaciones In-App */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notificaciones en la App</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="inapp-comments">Nuevos comentarios</Label>
              <p className="text-sm text-gray-500">Cuando alguien comenta en tus denuncias</p>
            </div>
            <Switch
              id="inapp-comments"
              checked={preferences.inApp.newComment}
              onCheckedChange={(checked) => handlePreferenceChange("inApp", "newComment", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="inapp-recovery">Objetos recuperados</Label>
              <p className="text-sm text-gray-500">Cuando tu objeto es marcado como recuperado</p>
            </div>
            <Switch
              id="inapp-recovery"
              checked={preferences.inApp.objectRecovered}
              onCheckedChange={(checked) => handlePreferenceChange("inApp", "objectRecovered", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="inapp-area">Denuncias en tu área</Label>
              <p className="text-sm text-gray-500">Nuevas denuncias cerca de tu ubicación</p>
            </div>
            <Switch
              id="inapp-area"
              checked={preferences.inApp.newDenunciaInArea}
              onCheckedChange={(checked) => handlePreferenceChange("inApp", "newDenunciaInArea", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="inapp-system">Actualizaciones del sistema</Label>
              <p className="text-sm text-gray-500">Mantenimiento y nuevas funcionalidades</p>
            </div>
            <Switch
              id="inapp-system"
              checked={preferences.inApp.systemUpdates}
              onCheckedChange={(checked) => handlePreferenceChange("inApp", "systemUpdates", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="inapp-gamification">Recompensas de gamificación</Label>
              <p className="text-sm text-gray-500">Logros, niveles y recompensas</p>
            </div>
            <Switch
              id="inapp-gamification"
              checked={preferences.inApp.gamificationRewards}
              onCheckedChange={(checked) => handlePreferenceChange("inApp", "gamificationRewards", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones por Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Notificaciones por Email</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-comments">Nuevos comentarios</Label>
              <p className="text-sm text-gray-500">Recibir emails por comentarios</p>
            </div>
            <Switch
              id="email-comments"
              checked={preferences.email.newComment}
              onCheckedChange={(checked) => handlePreferenceChange("email", "newComment", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-recovery">Objetos recuperados</Label>
              <p className="text-sm text-gray-500">Confirmación por email de recuperaciones</p>
            </div>
            <Switch
              id="email-recovery"
              checked={preferences.email.objectRecovered}
              onCheckedChange={(checked) => handlePreferenceChange("email", "objectRecovered", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-digest">Resumen semanal</Label>
              <p className="text-sm text-gray-500">Resumen de actividad en tu área</p>
            </div>
            <Switch
              id="email-digest"
              checked={preferences.email.weeklyDigest}
              onCheckedChange={(checked) => handlePreferenceChange("email", "weeklyDigest", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-marketing">Marketing</Label>
              <p className="text-sm text-gray-500">Ofertas y promociones</p>
            </div>
            <Switch
              id="email-marketing"
              checked={preferences.email.marketing}
              onCheckedChange={(checked) => handlePreferenceChange("email", "marketing", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-system">Actualizaciones del sistema</Label>
              <p className="text-sm text-gray-500">Cambios importantes en la plataforma</p>
            </div>
            <Switch
              id="email-system"
              checked={preferences.email.systemUpdates}
              onCheckedChange={(checked) => handlePreferenceChange("email", "systemUpdates", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Notificaciones Push</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              Las notificaciones push te permiten recibir alertas instantáneas incluso cuando no estás en la aplicación.
            </p>
            <Button onClick={handleEnablePushNotifications} size="sm">
              Habilitar Push Notifications
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-comments">Nuevos comentarios</Label>
              <p className="text-sm text-gray-500">Push notifications por comentarios</p>
            </div>
            <Switch
              id="push-comments"
              checked={preferences.push.newComment}
              onCheckedChange={(checked) => handlePreferenceChange("push", "newComment", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-recovery">Objetos recuperados</Label>
              <p className="text-sm text-gray-500">Alertas instantáneas de recuperaciones</p>
            </div>
            <Switch
              id="push-recovery"
              checked={preferences.push.objectRecovered}
              onCheckedChange={(checked) => handlePreferenceChange("push", "objectRecovered", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-urgent">Alertas urgentes</Label>
              <p className="text-sm text-gray-500">Notificaciones de alta prioridad</p>
            </div>
            <Switch
              id="push-urgent"
              checked={preferences.push.urgentAlerts}
              onCheckedChange={(checked) => handlePreferenceChange("push", "urgentAlerts", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-reminders">Recordatorios diarios</Label>
              <p className="text-sm text-gray-500">Recordatorios para revisar la app</p>
            </div>
            <Switch
              id="push-reminders"
              checked={preferences.push.dailyReminders}
              onCheckedChange={(checked) => handlePreferenceChange("push", "dailyReminders", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuración General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Configuración General</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="frequency">Frecuencia de notificaciones</Label>
            <Select value={preferences.frequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Inmediata</SelectItem>
                <SelectItem value="daily">Resumen diario</SelectItem>
                <SelectItem value="weekly">Resumen semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet-hours">Horario silencioso</Label>
              <Switch
                id="quiet-hours"
                checked={preferences.quietHours.enabled}
                onCheckedChange={(checked) => handleQuietHoursChange("enabled", checked)}
              />
            </div>

            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quiet-start">Hora de inicio</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) => handleQuietHoursChange("start", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="quiet-end">Hora de fin</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) => handleQuietHoursChange("end", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={savePreferences}>Guardar Preferencias</Button>
      </div>
    </div>
  )
}
