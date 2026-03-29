/**
 * UNIVERSAL EXPORTER - SUB-MÓDULO 9.3
 * 
 * @description Exportador universal con compatibilidad para todos los sistemas
 * de playout (Dalet, Sara, WideOrbit, etc.) y validación post-exportación
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { 
  Download, 
  Upload, 
  FileText, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Server,
  Database,
  Wifi,
  Shield,
  Zap,
  Eye,
  RefreshCw,
  Play,
  Pause,
  Calendar,
  Radio
} from "lucide-react"

interface PlayoutSystem {
  id: string
  name: string
  version: string
  format: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string
  features: string[]
}

interface ExportJob {
  id: string
  name: string
  system: string
  format: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'validating'
  progress: number
  startTime: string
  endTime?: string
  spotsCount: number
  fileSize?: string
  validationResults?: ValidationResult[]
}

interface ValidationResult {
  type: 'error' | 'warning' | 'info'
  message: string
  spotId?: string
  timestamp: string
}

export function UniversalExporter() {
  const [selectedSystem, setSelectedSystem] = useState("")
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0])
  const [exportTime, setExportTime] = useState("00:00")
  const [duration, setDuration] = useState("24")
  const [autoValidation, setAutoValidation] = useState(true)
  const [ftpUpload, setFtpUpload] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const playoutSystems: PlayoutSystem[] = [
    {
      id: 'dalet',
      name: 'Dalet Plus',
      version: '7.2.1',
      format: 'XML',
      status: 'connected',
      lastSync: '10:30',
      features: ['Auto-Import', 'Real-time Sync', 'Backup']
    },
    {
      id: 'sara',
      name: 'SARA Professional',
      version: '4.8.3',
      format: 'CSV',
      status: 'connected',
      lastSync: '10:25',
      features: ['FTP Upload', 'Validation', 'Scheduling']
    },
    {
      id: 'wideorbit',
      name: 'WideOrbit Automation',
      version: '6.1.2',
      format: 'TXT',
      status: 'connected',
      lastSync: '10:28',
      features: ['API Integration', 'Live Updates']
    },
    {
      id: 'rcs',
      name: 'RCS Zetta',
      version: '5.3.0',
      format: 'JSON',
      status: 'disconnected',
      lastSync: '09:45',
      features: ['Cloud Sync', 'Mobile Access']
    },
    {
      id: 'marketron',
      name: 'Marketron Traffic',
      version: '3.9.1',
      format: 'XML',
      status: 'connected',
      lastSync: '10:32',
      features: ['CRM Integration', 'Billing Sync']
    },
    {
      id: 'nexgen',
      name: 'NexGen Digital',
      version: '2.7.4',
      format: 'Binary',
      status: 'error',
      lastSync: '08:15',
      features: ['HD Audio', 'Multi-Channel']
    }
  ]

  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: 'job-1',
      name: 'Pauta Matinal - Radio Futuro',
      system: 'Dalet Plus',
      format: 'XML',
      status: 'completed',
      progress: 100,
      startTime: '10:15',
      endTime: '10:17',
      spotsCount: 47,
      fileSize: '2.3 MB',
      validationResults: [
        {
          type: 'info',
          message: 'Exportación completada exitosamente',
          timestamp: '10:17'
        }
      ]
    },
    {
      id: 'job-2',
      name: 'Pauta Completa - Radio Corazón',
      system: 'SARA Professional',
      format: 'CSV',
      status: 'processing',
      progress: 65,
      startTime: '10:20',
      spotsCount: 89,
      validationResults: []
    },
    {
      id: 'job-3',
      name: 'Pauta Tarde - Radio Activa',
      system: 'WideOrbit Automation',
      format: 'TXT',
      status: 'failed',
      progress: 0,
      startTime: '10:10',
      endTime: '10:12',
      spotsCount: 32,
      validationResults: [
        {
          type: 'error',
          message: 'Error de conexión con servidor FTP',
          timestamp: '10:12'
        },
        {
          type: 'warning',
          message: 'Spot ID duplicado detectado',
          spotId: 'spot-15',
          timestamp: '10:11'
        }
      ]
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500'
      case 'disconnected': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle
      case 'disconnected': return Clock
      case 'error': return AlertTriangle
      default: return Server
    }
  }

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-700 border-green-500/30'
      case 'processing': return 'bg-blue-500/20 text-blue-700 border-blue-500/30'
      case 'failed': return 'bg-red-500/20 text-red-700 border-red-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'
      case 'validating': return 'bg-purple-500/20 text-purple-700 border-purple-500/30'
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30'
    }
  }

  const startExport = async () => {
    if (!selectedSystem) return
    
    setIsExporting(true)
    
    const newJob: ExportJob = {
      id: `job-${Date.now()}`,
      name: `Pauta ${exportDate} - ${playoutSystems.find(s => s.id === selectedSystem)?.name}`,
      system: playoutSystems.find(s => s.id === selectedSystem)?.name || '',
      format: playoutSystems.find(s => s.id === selectedSystem)?.format || '',
      status: 'processing',
      progress: 0,
      startTime: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      spotsCount: Math.floor(Math.random() * 100) + 20
    }
    
    setExportJobs(prev => [newJob, ...prev])
    
    // Simular progreso de exportación
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setExportJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, progress: i }
          : job
      ))
    }
    
    // Completar exportación
    setExportJobs(prev => prev.map(job => 
      job.id === newJob.id 
        ? { 
            ...job, 
            status: 'completed',
            endTime: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
            fileSize: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
            validationResults: [
              {
                type: 'info',
                message: 'Exportación completada exitosamente',
                timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          }
        : job
    ))
    
    setIsExporting(false)
  }

  return (
    <div className="space-y-6">
      {/* Panel de Configuración */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2 text-broadcast-500" />
                Exportador Universal
              </CardTitle>
              <CardDescription>
                Compatibilidad con todos los sistemas de playout del mercado
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-broadcast-400 border-broadcast-400/50">
              <Shield className="w-3 h-3 mr-1" />
              TIER 0 SECURITY
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="system">Sistema de Playout</Label>
              <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sistema" />
                </SelectTrigger>
                <SelectContent>
                  {playoutSystems.map((system) => {
                    const StatusIcon = getStatusIcon(system.status)
                    return (
                      <SelectItem key={system.id} value={system.id}>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(system.status)}`} />
                          <div>
                            <div className="font-medium">{system.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {system.format} • v{system.version}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha de Exportación</Label>
              <Input
                id="date"
                type="date"
                value={exportDate}
                onChange={(e) => setExportDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora de Inicio</Label>
              <Input
                id="time"
                type="time"
                value={exportTime}
                onChange={(e) => setExportTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duración (horas)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Duración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="6">6 horas</SelectItem>
                  <SelectItem value="12">12 horas</SelectItem>
                  <SelectItem value="24">24 horas</SelectItem>
                  <SelectItem value="168">1 semana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-validation"
                  checked={autoValidation}
                  onCheckedChange={setAutoValidation}
                />
                <Label htmlFor="auto-validation" className="text-sm">
                  Validación Automática
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ftp-upload"
                  checked={ftpUpload}
                  onCheckedChange={setFtpUpload}
                />
                <Label htmlFor="ftp-upload" className="text-sm">
                  Subida FTP Automática
                </Label>
              </div>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={startExport} 
                disabled={!selectedSystem || isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Iniciar Exportación
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de Sistemas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="w-5 h-5 mr-2 text-broadcast-500" />
            Estado de Sistemas de Playout
          </CardTitle>
          <CardDescription>
            Conectividad y sincronización en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playoutSystems.map((system) => {
              const StatusIcon = getStatusIcon(system.status)
              return (
                <div key={system.id} className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`w-5 h-5 ${getStatusColor(system.status)}`} />
                      <span className="font-semibold">{system.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      v{system.version}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Formato:</span>
                      <span>{system.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Última Sync:</span>
                      <span>{system.lastSync}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <span className={`capitalize ${getStatusColor(system.status)}`}>
                        {system.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-1">Características:</div>
                    <div className="flex flex-wrap gap-1">
                      {system.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Historial de Exportaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-broadcast-500" />
            Historial de Exportaciones
          </CardTitle>
          <CardDescription>
            Trabajos de exportación recientes y su estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exportJobs.map((job) => (
              <div key={job.id} className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{job.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {job.system} • {job.format} • {job.spotsCount} spots
                    </p>
                  </div>
                  <Badge className={getJobStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>

                {job.status === 'processing' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progreso</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-muted-foreground">
                      Inicio: {job.startTime}
                    </span>
                    {job.endTime && (
                      <span className="text-muted-foreground">
                        Fin: {job.endTime}
                      </span>
                    )}
                    {job.fileSize && (
                      <span className="text-muted-foreground">
                        Tamaño: {job.fileSize}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    {job.status === 'completed' && (
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3 mr-1" />
                        Descargar
                      </Button>
                    )}
                  </div>
                </div>

                {job.validationResults && job.validationResults.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <h5 className="text-sm font-medium mb-2">Validación:</h5>
                    <div className="space-y-1">
                      {job.validationResults.map((result, index) => {
                        const icon = result.type === 'error' ? AlertTriangle : 
                                   result.type === 'warning' ? AlertTriangle : CheckCircle
                        const color = result.type === 'error' ? 'text-red-500' : 
                                    result.type === 'warning' ? 'text-yellow-500' : 'text-green-500'
                        const Icon = icon
                        
                        return (
                          <div key={index} className="flex items-start space-x-2 text-sm">
                            <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
                            <div className="flex-1">
                              <span>{result.message}</span>
                              {result.spotId && (
                                <span className="text-muted-foreground ml-2">
                                  (Spot: {result.spotId})
                                </span>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {result.timestamp}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}