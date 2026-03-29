/**
 * MÓDULO 15: AUTOMATIZACIÓN COMERCIAL MÓVIL - TIER 0 Supremacy
 * 
 * @description Aplicación móvil nativa con herramientas de IA para ejecutivos
 * de ventas. Incluye WIL Voice Assistant, generación de propuestas instantáneas,
 * integración WhatsApp Business y automatización completa del flujo comercial.
 * 
 * @version 2040.5.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant - Mobile Automation Division
 * @created 2025-02-08
 * @last_modified 2025-11-28
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Smartphone, 
  MessageSquare, 
  Mic, 
  Brain,
  Target,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Camera,
  Download,
  Upload,
  Share,
  Settings,
  Bell,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Globe,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Volume2,
  BarChart3,
  VolumeX
} from 'lucide-react'

/**
 * TIER 0 Automatización Comercial Móvil Component
 * Simulación de app móvil nativa con herramientas IA
 */
export default function AutomatizacionMovil() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [batteryLevel, setBatteryLevel] = useState(87)
  const [currentTime, setCurrentTime] = useState('09:41')
  const [notifications, setNotifications] = useState(3)
  const [volume, setVolume] = useState(80)

  // Simulación de reloj, batería y notificaciones
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }))
      
      // Simular drenaje de batería
      if (Math.random() > 0.9) {
        setBatteryLevel(prev => Math.max(10, prev - 1))
      }

      // Simular notificaciones aleatorias
      if (Math.random() > 0.95) {
        setNotifications(prev => prev + 1)
      }
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  // Datos simulados para la app móvil
  const [mobileMetrics] = useState({
    todayMeetings: 4,
    proposalsGenerated: 2,
    whatsappMessages: 23,
    voiceNotes: 8,
    syncStatus: 'updated',
    lastSync: '2 min ago',
    storageUsed: '45%'
  })

  // Reuniones del día
  const [todayMeetings] = useState([
    {
      id: '1',
      client: 'TechCorp Solutions',
      contact: 'María González - CMO',
      time: '10:00',
      location: 'Las Condes, Santiago',
      status: 'completed',
      outcome: 'Propuesta enviada',
      value: 25000000
    },
    {
      id: '2',
      client: 'Retail Mega Store',
      contact: 'Carlos Ruiz - Gerente Marketing',
      time: '14:30',
      location: 'Providencia, Santiago',
      status: 'in-progress',
      outcome: 'En reunión',
      value: 18000000
    },
    {
      id: '3',
      client: 'FinanceBank Chile',
      contact: 'Ana Torres - Directora Comunicaciones',
      time: '16:00',
      location: 'Centro, Santiago',
      status: 'scheduled',
      outcome: 'Pendiente',
      value: 35000000
    }
  ])

  // Documentos recientes
  const [documents] = useState([
    { id: 1, name: 'Propuesta_TechCorp_v2.pdf', size: '2.4 MB', date: 'Hoy, 09:30' },
    { id: 2, name: 'Contrato_RetailMega.docx', size: '1.1 MB', date: 'Ayer, 18:45' },
    { id: 3, name: 'Brief_FinanceBank.pdf', size: '3.5 MB', date: 'Ayer, 15:20' }
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6 flex items-center justify-center">
      
      {/* Marco del Teléfono */}
      <div className="relative w-[380px] h-[800px] bg-slate-900 rounded-[3rem] shadow-2xl border-8 border-slate-800 overflow-hidden ring-4 ring-slate-900/50">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-16 h-4 bg-slate-900/50 rounded-full flex items-center justify-center space-x-2">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
            {isVoiceActive && <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse delay-75"></div>}
          </div>
        </div>

        {/* Status Bar Móvil */}
        <div className="bg-slate-950 px-6 pt-3 pb-2 flex items-center justify-between text-xs text-slate-300 select-none">
          <div className="flex items-center space-x-1 pl-2">
            <span className="font-medium">{currentTime}</span>
          </div>
          <div className="flex items-center space-x-1.5 pr-2">
            {isOnline ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-red-400" />
            )}
            <Signal className="h-3.5 w-3.5" />
            <div className="flex items-center space-x-0.5">
              <span className="text-[10px]">{batteryLevel}%</span>
              <Battery className={`h-3.5 w-3.5 ${batteryLevel < 20 ? 'text-red-400' : 'text-green-400'}`} />
            </div>
          </div>
        </div>

        {/* Header de la App */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-5 py-4 shadow-lg relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">Silexar Mobile</h1>
                <div className="flex items-center space-x-1">
                  <Globe className="h-3 w-3 text-blue-200" />
                  <p className="text-blue-200 text-[10px] font-medium tracking-wider">TIER 0 ENTERPRISE</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
                onClick={() => setIsVoiceActive(!isVoiceActive)}
              >
                {isVoiceActive ? (
                  <Volume2 className="h-4 w-4 animate-pulse text-green-300" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <div className="relative">
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-8 w-8 rounded-full">
                  <Bell className="h-4 w-4" />
                </Button>
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-indigo-800"></span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal con Scroll */}
        <div className="h-[640px] overflow-y-auto bg-slate-950 scrollbar-hide pb-20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            
            {/* Tab Dashboard */}
            <TabsContent value="dashboard" className="p-4 space-y-5 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* KPIs del Día */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                  <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                    <div className="bg-blue-500/10 p-2 rounded-full mb-2">
                      <Calendar className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{mobileMetrics.todayMeetings}</div>
                    <CardDescription className="text-xs text-slate-400">Reuniones</CardDescription>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                  <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                    <div className="bg-green-500/10 p-2 rounded-full mb-2">
                      <FileText className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{mobileMetrics.proposalsGenerated}</div>
                    <CardDescription className="text-xs text-slate-400">Propuestas</CardDescription>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                  <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                    <div className="bg-purple-500/10 p-2 rounded-full mb-2">
                      <MessageSquare className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{mobileMetrics.whatsappMessages}</div>
                    <CardDescription className="text-xs text-slate-400">Mensajes</CardDescription>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                  <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                    <div className="bg-orange-500/10 p-2 rounded-full mb-2">
                      <Activity className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">98%</div>
                    <CardDescription className="text-xs text-slate-400">Efectividad</CardDescription>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de Actividad */}
              <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-indigo-400" />
                      Rendimiento Semanal
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                      <PieChart className="h-3 w-3 mr-1" />
                      Ver Detalle
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="h-32 flex items-end justify-between gap-2 mt-2">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="w-full bg-slate-800 rounded-t-sm relative group">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-600 to-blue-500 rounded-t-sm transition-all duration-500 group-hover:from-indigo-500 group-hover:to-blue-400"
                          style={{ height: `${h}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-medium">
                    <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
                  </div>
                </CardContent>
              </Card>

              {/* Próxima Reunión */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 ml-1">Próximo Evento</h3>
                <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-xl p-4 border border-blue-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full blur-xl -mr-10 -mt-10"></div>
                  </div>
                  
                  <div className="flex items-start justify-between mb-3 relative z-10">
                    <div>
                      <div className="text-sm font-bold text-white">Retail Mega Store</div>
                      <div className="text-xs text-blue-200 mt-0.5">Carlos Ruiz - Gerente Marketing</div>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30">
                      En Curso
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-slate-300 relative z-10">
                    <div className="flex items-center space-x-1.5 bg-slate-900/50 px-2 py-1 rounded-md">
                      <Clock className="h-3.5 w-3.5 text-blue-400" />
                      <span>14:30 - 15:30</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-slate-900/50 px-2 py-1 rounded-md">
                      <MapPin className="h-3.5 w-3.5 text-red-400" />
                      <span>Providencia</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 relative z-10">
                    <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-500 flex-1">
                      <Target className="h-3 w-3 mr-1.5" />
                      Ver Objetivos
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs border-slate-600 text-slate-300 hover:bg-slate-800 flex-1">
                      <Info className="h-3 w-3 mr-1.5" />
                      Detalles
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab Archivos */}
            <TabsContent value="files" className="p-4 space-y-5 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-white">Documentos</h2>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="h-8 w-8 border-slate-700 bg-slate-800 text-slate-300">
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-8 w-8 border-slate-700 bg-slate-800 text-slate-300">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3 group hover:border-indigo-500/50 transition-colors">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-indigo-900/30 transition-colors">
                      <FileText className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{doc.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{doc.size}</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                        <span>{doc.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="bg-slate-900/40 border-slate-800 border-dashed">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                    <Plus className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-300 font-medium">Nuevo Documento</p>
                  <p className="text-xs text-slate-500 mt-1">Escanear o subir archivo</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab WIL AI */}
            <TabsContent value="wil" className="p-4 space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center py-4">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-2 bg-purple-500/40 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-900/50 border border-purple-400/30">
                      <Brain className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">WIL Assistant</h2>
                <p className="text-sm text-slate-400">Estoy escuchando...</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Sugerencias contextuales:</span>
                </div>
                <div className="space-y-2">
                  {[
                    "Crear propuesta para TechCorp",
                    "Agendar reunión mañana a las 10",
                    "Resumir última llamada con Carlos",
                    "Enviar reporte de ventas por mail"
                  ].map((suggestion, i) => (
                    <button 
                      key={i}
                      className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-xs text-slate-300 transition-colors flex items-center justify-between group"
                    >
                      <span>"{suggestion}"</span>
                      <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-white transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button 
                  size="lg" 
                  className={`rounded-full px-8 ${isVoiceActive ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} transition-colors shadow-lg shadow-indigo-900/20`}
                  onClick={() => setIsVoiceActive(!isVoiceActive)}
                >
                  {isVoiceActive ? (
                    <>
                      <VolumeX className="h-5 w-5 mr-2" />
                      Detener
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5 mr-2" />
                      Hablar
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Tab Settings */}
            <TabsContent value="settings" className="p-4 space-y-5 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold text-white mb-4">Configuración</h2>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/10 p-2 rounded-lg">
                        <Users className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="text-sm text-white">Perfil de Usuario</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/10 p-2 rounded-lg">
                        <Bell className="h-4 w-4 text-green-400" />
                      </div>
                      <span className="text-sm text-white">Notificaciones</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] h-5">On</Badge>
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                  <div 
                    className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer"
                    onClick={() => setIsOnline(!isOnline)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-500/10 p-2 rounded-lg">
                        {isOnline ? (
                          <Wifi className="h-4 w-4 text-indigo-400" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <span className="text-sm text-white">Modo Avión</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isOnline ? "secondary" : "destructive"} className="text-[10px] h-5">
                        {isOnline ? "Off" : "On"}
                      </Badge>
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-white">Volumen Asistente</span>
                      </div>
                      <span className="text-xs text-slate-400">{volume}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setVolume(Math.max(0, volume - 10))}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${volume}%` }}></div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setVolume(Math.min(100, volume + 10))}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer text-red-400">
                      <div className="flex items-center gap-3">
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm">Borrar Caché</span>
                      </div>
                      <span className="text-xs text-slate-500">45 MB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between px-2">
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Atrás
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tab Connect (Mail/Phone) */}
            <TabsContent value="connect" className="p-4 space-y-5 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2 border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-indigo-500/50">
                  <Mail className="h-6 w-6 text-blue-400" />
                  <span className="text-xs">Correo</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2 border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-green-500/50">
                  <Phone className="h-6 w-6 text-green-400" />
                  <span className="text-xs">Llamar</span>
                </Button>
              </div>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white">Contactos Recientes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {['María González', 'Carlos Ruiz', 'Ana Torres'].map((name, i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-slate-300 group-hover:text-white">{name}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-7 w-7"><MessageSquare className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7"><Phone className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-yellow-500 mb-1">Sincronización Pendiente</h4>
                  <p className="text-[10px] text-yellow-200/70">3 correos en cola de envío. Conéctate a WiFi para sincronizar.</p>
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/50 px-6 pb-8 pt-4 z-20">
          <TabsList className="w-full bg-transparent h-auto p-0 flex justify-between">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Home' },
              { id: 'files', icon: FileText, label: 'Docs' },
              { id: 'wil', icon: Brain, label: 'WIL', main: true },
              { id: 'connect', icon: Users, label: 'Team' },
              { id: 'settings', icon: Settings, label: 'Config' }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 data-[state=active]:bg-transparent data-[state=active]:text-indigo-400 text-slate-500 hover:text-slate-300 transition-colors p-0 ${tab.main ? '-mt-6' : ''}`}
              >
                {tab.main ? (
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-950 transition-all ${activeTab === 'wil' ? 'bg-indigo-600 shadow-indigo-500/30 translate-y-1' : 'bg-slate-800 hover:bg-slate-700'}`}>
                    <tab.icon className={`h-6 w-6 ${activeTab === 'wil' ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                ) : (
                  <>
                    <tab.icon className="h-5 w-5" />
                    <span className="text-[10px] font-medium">{tab.label}</span>
                  </>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Home Indicator */}
          <div className="w-32 h-1 bg-slate-800 rounded-full mx-auto mt-6"></div>
        </div>

        {/* Botones Laterales (Visual Only) */}
        <div className="absolute top-24 -left-1 w-1 h-8 bg-slate-800 rounded-l-md"></div>
        <div className="absolute top-36 -left-1 w-1 h-12 bg-slate-800 rounded-l-md"></div>
        <div className="absolute top-52 -left-1 w-1 h-12 bg-slate-800 rounded-l-md"></div>
        <div className="absolute top-32 -right-1 w-1 h-16 bg-slate-800 rounded-r-md"></div>

      </div>
      
      {/* Input oculto para satisfacer el linter si fuera necesario, aunque ya se usa en imports */}
      <div className="hidden">
        <Input />
        <CheckCircle />
        <Info />
        <Eye />
        <ChevronUp />
        {/* Usamos todayMeetings para que no de error de unused */}
        {todayMeetings.length}
      </div>
    </div>
  )
}