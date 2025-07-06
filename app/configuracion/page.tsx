"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Settings,
  User,
  Shield,
  Palette,
  Database,
  Moon,
  Sun,
  Monitor,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
} from "lucide-react"

interface AppSettings {
  theme: "light" | "dark" | "system"
  language: string
  timezone: string
  autoSave: boolean
  enableAnimations: boolean
  compactMode: boolean
  showBadges: boolean
  enableSounds: boolean
  dataRetention: number
  autoBackup: boolean
  enableAnalytics: boolean
  shareUsageData: boolean
}

interface PrivacySettings {
  profileVisibility: "public" | "friends" | "private"
  showLocation: boolean
  showActivity: boolean
  allowMessages: boolean
  allowNotifications: boolean
  dataCollection: boolean
  marketingEmails: boolean
  securityAlerts: boolean
}

export default function ConfiguracionPage() {
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // App Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: "system",
    language: "es",
    timezone: "America/Argentina/Buenos_Aires",
    autoSave: true,
    enableAnimations: true,
    compactMode: false,
    showBadges: true,
    enableSounds: true,
    dataRetention: 90,
    autoBackup: false,
    enableAnalytics: true,
    shareUsageData: false,
  })

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: "public",
    showLocation: true,
    showActivity: true,
    allowMessages: true,
    allowNotifications: true,
    dataCollection: false,
    marketingEmails: false,
    securityAlerts: true,
  })

  // Profile Settings State
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "",
    phone: "",
    website: "",
    location: "",
  })

  // Load settings from localStorage
  useEffect(() => {
    const savedAppSettings = localStorage.getItem("appSettings")
    if (savedAppSettings) {
      setAppSettings(JSON.parse(savedAppSettings))
    }

    const savedPrivacySettings = localStorage.getItem("privacySettings")
    if (savedPrivacySettings) {
      setPrivacySettings(JSON.parse(savedPrivacySettings))
    }

    const savedProfileData = localStorage.getItem("profileData")
    if (savedProfileData) {
      setProfileData(JSON.parse(savedProfileData))
    }
  }, [])

  // Apply theme changes in real-time
  useEffect(() => {
    const root = document.documentElement
    if (appSettings.theme === "dark") {
      root.classList.add("dark")
    } else if (appSettings.theme === "light") {
      root.classList.remove("dark")
    } else {
      // System theme
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      if (mediaQuery.matches) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }, [appSettings.theme])

  // Save settings to localStorage and sync
  const saveSettings = async () => {
    setIsLoading(true)
    try {
      // Save to localStorage
      localStorage.setItem("appSettings", JSON.stringify(appSettings))
      localStorage.setItem("privacySettings", JSON.stringify(privacySettings))
      localStorage.setItem("profileData", JSON.stringify(profileData))

      // Simulate API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setHasChanges(false)
      toast({
        title: "Configuración guardada",
        description: "Todos los cambios se han guardado correctamente",
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

  // Reset settings to defaults
  const resetSettings = () => {
    setAppSettings({
      theme: "system",
      language: "es",
      timezone: "America/Argentina/Buenos_Aires",
      autoSave: true,
      enableAnimations: true,
      compactMode: false,
      showBadges: true,
      enableSounds: true,
      dataRetention: 90,
      autoBackup: false,
      enableAnalytics: true,
      shareUsageData: false,
    })
    setHasChanges(true)
    toast({
      title: "Configuración restablecida",
      description: "Se han restaurado los valores por defecto",
    })
  }

  // Export settings
  const exportSettings = () => {
    const allSettings = {
      appSettings,
      privacySettings,
      profileData,
      exportDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(allSettings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `civiceye-settings-${new Date().toISOString().split("T")[0]}.json`
    link.click()

    URL.revokeObjectURL(url)
    toast({
      title: "Configuración exportada",
      description: "El archivo se ha descargado correctamente",
    })
  }

  // Import settings
  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        if (imported.appSettings) setAppSettings(imported.appSettings)
        if (imported.privacySettings) setPrivacySettings(imported.privacySettings)
        if (imported.profileData) setProfileData(imported.profileData)

        setHasChanges(true)
        toast({
          title: "Configuración importada",
          description: "Los ajustes se han cargado correctamente",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "El archivo no es válido",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  // Clear all data
  const clearAllData = () => {
    if (confirm("¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.")) {
      localStorage.clear()
      toast({
        title: "Datos eliminados",
        description: "Todos los datos locales han sido eliminados",
        variant: "destructive",
      })
      // Reload page to reset state
      window.location.reload()
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso Requerido</h2>
              <p className="text-gray-600">Debes iniciar sesión para acceder a la configuración.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
            <p className="text-gray-600">Personaliza tu experiencia en CivicEye</p>
          </div>

          <div className="flex items-center space-x-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Cambios sin guardar
              </Badge>
            )}
            <Button onClick={saveSettings} disabled={isLoading || !hasChanges}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="privacidad">Privacidad</TabsTrigger>
            <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
            <TabsTrigger value="datos">Datos</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configuración General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select
                      value={appSettings.language}
                      onValueChange={(value) => {
                        setAppSettings((prev) => ({ ...prev, language: value }))
                        setHasChanges(true)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Zona Horaria</Label>
                    <Select
                      value={appSettings.timezone}
                      onValueChange={(value) => {
                        setAppSettings((prev) => ({ ...prev, timezone: value }))
                        setHasChanges(true)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires</SelectItem>
                        <SelectItem value="America/Mexico_City">Ciudad de México</SelectItem>
                        <SelectItem value="America/Bogota">Bogotá</SelectItem>
                        <SelectItem value="America/Lima">Lima</SelectItem>
                        <SelectItem value="America/Santiago">Santiago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoSave">Guardado automático</Label>
                      <p className="text-sm text-gray-500">Guardar cambios automáticamente</p>
                    </div>
                    <Switch
                      id="autoSave"
                      checked={appSettings.autoSave}
                      onCheckedChange={(checked) => {
                        setAppSettings((prev) => ({ ...prev, autoSave: checked }))
                        setHasChanges(true)
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableAnimations">Animaciones</Label>
                      <p className="text-sm text-gray-500">Habilitar animaciones y transiciones</p>
                    </div>
                    <Switch
                      id="enableAnimations"
                      checked={appSettings.enableAnimations}
                      onCheckedChange={(checked) => {
                        setAppSettings((prev) => ({ ...prev, enableAnimations: checked }))
                        setHasChanges(true)
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableSounds">Sonidos</Label>
                      <p className="text-sm text-gray-500">Reproducir sonidos de notificación</p>
                    </div>
                    <Switch
                      id="enableSounds"
                      checked={appSettings.enableSounds}
                      onCheckedChange={(checked) => {
                        setAppSettings((prev) => ({ ...prev, enableSounds: checked }))
                        setHasChanges(true)
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compactMode">Modo compacto</Label>
                      <p className="text-sm text-gray-500">Interfaz más densa con menos espaciado</p>
                    </div>
                    <Switch
                      id="compactMode"
                      checked={appSettings.compactMode}
                      onCheckedChange={(checked) => {
                        setAppSettings((prev) => ({ ...prev, compactMode: checked }))
                        setHasChanges(true)
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Settings */}
          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Información del Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => {
                        setProfileData((prev) => ({ ...prev, name: e.target.value }))
                        setHasChanges(true)
                      }}
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => {
                        setProfileData((prev) => ({ ...prev, email: e.target.value }))
                        setHasChanges(true)
                      }}
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => {
                        setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                        setHasChanges(true)
                      }}
                      placeholder="+54 11 1234-5678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio web</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => {
                        setProfileData((prev) => ({ ...prev, website: e.target.value }))
                        setHasChanges(true)
                      }}
                      placeholder="https://tu-sitio.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => {
                      setProfileData((prev) => ({ ...prev, location: e.target.value }))
                      setHasChanges(true)
                    }}
                    placeholder="Ciudad, País"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => {
                      setProfileData((prev) => ({ ...prev, bio: e.target.value }))
                      setHasChanges(true)
                    }}
                    placeholder="Cuéntanos sobre ti..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacidad" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Configuración de Privacidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="profileVisibility">Visibilidad del perfil</Label>
                  <Select
                    value={privacySettings.profileVisibility}
                    onValueChange={(value: "public" | "friends" | "private") => {
                      setPrivacySettings((prev) => ({ ...prev, profileVisibility: value }))
                      setHasChanges(true)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="friends">Solo amigos</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showLocation">Mostrar ubicación</Label>
                      <p className="text-sm text-gray-500">Permitir que otros vean tu ubicación</p>
                    </div>
                    <Switch
                      id="showLocation"
                      checked={privacySettings.showLocation}
                      onCheckedChange={(checked) => {
                        setPrivacySettings((prev) => ({ ...prev, showLocation: checked }))
                        setHasChanges(true)
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showActivity">Mostrar actividad</Label>
                      <p className="text-sm text-gray-500">Mostrar tu actividad reciente</p>
                    </div>
                    <Switch
                      id="showActivity"
                      checked={privacySettings.showActivity}
                      onCheckedChange={(checked) => {
                        setPrivacySettings((prev) => ({ ...prev, showActivity: checked }))
                        setHasChanges(true)
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowMessages">Permitir mensajes</Label>
                      <p className="text-sm text-gray-500">Recibir mensajes de otros usuarios</p>
                    </div>
                    <Switch
                      id="allowMessages"
                      checked={privacySettings.allowMessages}
                      onCheckedChange={(checked) => {
                        setPrivacySettings((prev) => ({ ...prev, allowMessages: checked }))
                        setHasChanges(true)
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dataCollection">Recopilación de datos</Label>
                      <p className="text-sm text-gray-500">Permitir recopilación de datos para mejorar el servicio</p>
                    </div>
                    <Switch
                      id="dataCollection"
                      checked={privacySettings.dataCollection}
                      onCheckedChange={(checked) => {
                        setPrivacySettings((prev) => ({ ...prev, dataCollection: checked }))
                        setHasChanges(true)
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketingEmails">Emails de marketing</Label>
                      <p className="text-sm text-gray-500">Recibir emails promocionales</p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={privacySettings.marketingEmails}
                      onCheckedChange={(checked) => {
                        setPrivacySettings((prev) => ({ ...prev, marketingEmails: checked }))
                        setHasChanges(true)
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="securityAlerts">Alertas de seguridad</Label>
                      <p className="text-sm text-gray-500">Recibir notificaciones de seguridad importantes</p>
                    </div>
                    <Switch
                      id="securityAlerts"
                      checked={privacySettings.securityAlerts}
                      onCheckedChange={(checked) => {
                        setPrivacySettings((prev) => ({ ...prev, securityAlerts: checked }))
                        setHasChanges(true)
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="apariencia" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Apariencia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: "light", label: "Claro", icon: Sun },
                      { value: "dark", label: "Oscuro", icon: Moon },
                      { value: "system", label: "Sistema", icon: Monitor },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setAppSettings((prev) => ({ ...prev, theme: value as any }))
                          setHasChanges(true)
                        }}
                        className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                          appSettings.theme === value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showBadges">Mostrar insignias</Label>
                    <p className="text-sm text-gray-500">Mostrar badges y etiquetas en la interfaz</p>
                  </div>
                  <Switch
                    id="showBadges"
                    checked={appSettings.showBadges}
                    onCheckedChange={(checked) => {
                      setAppSettings((prev) => ({ ...prev, showBadges: checked }))
                      setHasChanges(true)
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="datos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Gestión de Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Retención de datos (días)</Label>
                  <Input
                    id="dataRetention"
                    type="number"
                    value={appSettings.dataRetention}
                    onChange={(e) => {
                      setAppSettings((prev) => ({ ...prev, dataRetention: Number(e.target.value) }))
                      setHasChanges(true)
                    }}
                    min="7"
                    max="365"
                  />
                  <p className="text-sm text-gray-500">
                    Los datos se eliminarán automáticamente después de este período
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoBackup">Respaldo automático</Label>
                    <p className="text-sm text-gray-500">Crear respaldos automáticos de tus datos</p>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={appSettings.autoBackup}
                    onCheckedChange={(checked) => {
                      setAppSettings((prev) => ({ ...prev, autoBackup: checked }))
                      setHasChanges(true)
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableAnalytics">Analytics</Label>
                    <p className="text-sm text-gray-500">Habilitar análisis de uso para mejorar la app</p>
                  </div>
                  <Switch
                    id="enableAnalytics"
                    checked={appSettings.enableAnalytics}
                    onCheckedChange={(checked) => {
                      setAppSettings((prev) => ({ ...prev, enableAnalytics: checked }))
                      setHasChanges(true)
                    }}
                  />
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold">Acciones de Datos</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" onClick={exportSettings}>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Configuración
                    </Button>

                    <div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importSettings}
                        className="hidden"
                        id="import-settings"
                      />
                      <Button variant="outline" asChild>
                        <label htmlFor="import-settings" className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Importar Configuración
                        </label>
                      </Button>
                    </div>

                    <Button variant="outline" onClick={resetSettings}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restablecer Valores
                    </Button>

                    <Button variant="destructive" onClick={clearAllData}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar Todos los Datos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
