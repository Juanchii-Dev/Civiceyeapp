"use client"

import { useState } from "react"
import { useNotifications } from "@/contexts/NotificationContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Send,
  Users,
  Mail,
  Bell,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

export function NotificationAdmin() {
  const {
    broadcastNotification,
    sendEmail,
    emailTemplates,
    createEmailTemplate,
    updateEmailTemplate,
    notificationLogs,
    getNotificationStats,
    getSystemHealth,
  } = useNotifications()

  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    type: "system" as const,
    priority: "medium" as const,
  })

  const [emailForm, setEmailForm] = useState({
    recipients: "",
    templateId: "",
    variables: {} as Record<string, string>,
  })

  const [templateForm, setTemplateForm] = useState({
    name: "",
    type: "transactional" as const,
    subject: "",
    htmlContent: "",
    textContent: "",
    variables: "",
  })

  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)

  const stats = getNotificationStats()
  const systemHealth = getSystemHealth()

  const handleBroadcast = () => {
    if (!broadcastForm.title || !broadcastForm.message) return

    broadcastNotification({
      type: broadcastForm.type,
      title: broadcastForm.title,
      message: broadcastForm.message,
      priority: broadcastForm.priority,
      read: false,
    })

    setBroadcastForm({
      title: "",
      message: "",
      type: "system",
      priority: "medium",
    })
  }

  const handleSendEmail = async () => {
    if (!emailForm.recipients || !emailForm.templateId) return

    const recipients = emailForm.recipients.split(",").map((email) => email.trim())

    for (const recipient of recipients) {
      await sendEmail(recipient, emailForm.templateId, emailForm.variables)
    }

    setEmailForm({
      recipients: "",
      templateId: "",
      variables: {},
    })
  }

  const handleCreateTemplate = () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.htmlContent) return

    createEmailTemplate({
      name: templateForm.name,
      type: templateForm.type,
      subject: templateForm.subject,
      htmlContent: templateForm.htmlContent,
      textContent: templateForm.textContent,
      variables: templateForm.variables
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      active: true,
    })

    setTemplateForm({
      name: "",
      type: "transactional",
      subject: "",
      htmlContent: "",
      textContent: "",
      variables: "",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "read":
        return <Eye className="w-4 h-4 text-purple-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Usuarios Activos</p>
                <p className="text-2xl font-bold">{systemHealth.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Tasa de Entrega</p>
                <p className="text-2xl font-bold">{stats.deliveryRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Tasa de Lectura</p>
                <p className="text-2xl font-bold">{stats.readRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Tasa de Error</p>
                <p className="text-2xl font-bold">{systemHealth.errorRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="broadcast" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="broadcast">Difusión</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Broadcast Notifications */}
        <TabsContent value="broadcast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Enviar Notificación Masiva</span>
              </CardTitle>
              <CardDescription>Envía una notificación a todos los usuarios de la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="broadcast-type">Tipo</Label>
                  <Select
                    value={broadcastForm.type}
                    onValueChange={(value: any) => setBroadcastForm({ ...broadcastForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">Sistema</SelectItem>
                      <SelectItem value="alert">Alerta</SelectItem>
                      <SelectItem value="gamification">Gamificación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="broadcast-priority">Prioridad</Label>
                  <Select
                    value={broadcastForm.priority}
                    onValueChange={(value: any) => setBroadcastForm({ ...broadcastForm, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="broadcast-title">Título</Label>
                <Input
                  id="broadcast-title"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  placeholder="Título de la notificación"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="broadcast-message">Mensaje</Label>
                <Textarea
                  id="broadcast-message"
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  placeholder="Contenido del mensaje"
                  rows={4}
                />
              </div>

              <Button onClick={handleBroadcast} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Enviar Notificación
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Management */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Enviar Email</span>
              </CardTitle>
              <CardDescription>Envía emails usando plantillas predefinidas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-recipients">Destinatarios (separados por coma)</Label>
                <Input
                  id="email-recipients"
                  value={emailForm.recipients}
                  onChange={(e) => setEmailForm({ ...emailForm, recipients: e.target.value })}
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-template">Plantilla</Label>
                <Select
                  value={emailForm.templateId}
                  onValueChange={(value) => setEmailForm({ ...emailForm, templateId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSendEmail} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Enviar Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="templates">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Nueva Plantilla</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Nombre</Label>
                    <Input
                      id="template-name"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      placeholder="Nombre de la plantilla"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-type">Tipo</Label>
                    <Select
                      value={templateForm.type}
                      onValueChange={(value: any) => setTemplateForm({ ...templateForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transactional">Transaccional</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-subject">Asunto</Label>
                  <Input
                    id="template-subject"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                    placeholder="Asunto del email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-html">Contenido HTML</Label>
                  <Textarea
                    id="template-html"
                    value={templateForm.htmlContent}
                    onChange={(e) => setTemplateForm({ ...templateForm, htmlContent: e.target.value })}
                    placeholder="Contenido HTML del email"
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-variables">Variables (separadas por coma)</Label>
                  <Input
                    id="template-variables"
                    value={templateForm.variables}
                    onChange={(e) => setTemplateForm({ ...templateForm, variables: e.target.value })}
                    placeholder="name, email, url"
                  />
                </div>

                <Button onClick={handleCreateTemplate} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Plantilla
                </Button>
              </CardContent>
            </Card>

            {/* Existing Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Plantillas Existentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emailTemplates.map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant={template.active ? "default" : "secondary"}>
                            {template.active ? "Activa" : "Inactiva"}
                          </Badge>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                      <p className="text-xs text-gray-500">Variables: {template.variables.join(", ") || "Ninguna"}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Logs de Notificaciones</span>
              </CardTitle>
              <CardDescription>Historial detallado de todas las notificaciones enviadas</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {notificationLogs.slice(0, 50).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <p className="text-sm font-medium">
                            {log.type.toUpperCase()} - {log.notificationType}
                          </p>
                          <p className="text-xs text-gray-500">Usuario: {log.userId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={log.status === "failed" ? "destructive" : "default"}>{log.status}</Badge>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(log.sentAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
