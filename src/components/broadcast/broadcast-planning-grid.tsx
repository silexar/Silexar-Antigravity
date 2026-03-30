/**
 * BROADCAST PLANNING GRID - SUB-MÓDULO 9.1
 * 
 * @description Cuadrícula de planificación visual con booking grid inteligente,
 * drag & drop con validaciones y sistema de alertas contextuales
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
import { 
  Calendar, 
  Clock, 
  Filter, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Volume2,
  Zap,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Settings
} from "lucide-react"

interface TimeSlot {
  id: string
  time: string
  hour: number
  minute: number
}

interface BroadcastSpot {
  id: string
  clientName: string
  campaignName: string
  duration: number
  startTime: string
  endTime: string
  station: string
  status: 'scheduled' | 'confirmed' | 'aired' | 'missed' | 'conflict'
  priority: 'low' | 'medium' | 'high' | 'premium'
  value: number
  audienceSize: number
  conflicts?: string[]
  cortexScore?: number
}

interface Station {
  id: string
  name: string
  frequency: string
  color: string
  active: boolean
}

export function BroadcastPlanningGrid() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedStation, setSelectedStation] = useState<string>("all")
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  const [searchTerm, setSearchTerm] = useState("")
  const [draggedSpot, setDraggedSpot] = useState<BroadcastSpot | null>(null)

  const stations: Station[] = [
    { id: 'radio-futuro', name: 'Radio Futuro', frequency: '88.9 FM', color: 'bg-blue-500', active: true },
    { id: 'radio-corazon', name: 'Radio Corazón', frequency: '101.3 FM', color: 'bg-red-500', active: true },
    { id: 'radio-activa', name: 'Radio Activa', frequency: '92.5 FM', color: 'bg-green-500', active: true },
    { id: 'radio-pudahuel', name: 'Radio Pudahuel', frequency: '90.5 FM', color: 'bg-purple-500', active: true },
    { id: 'radio-zero', name: 'Radio Zero', frequency: '97.7 FM', color: 'bg-orange-500', active: false }
  ]

  const timeSlots: TimeSlot[] = Array.from({ length: 24 }, (_, i) => ({
    id: `slot-${i}`,
    time: `${i.toString().padStart(2, '0')}:00`,
    hour: i,
    minute: 0
  }))

  const [spots, setSpots] = useState<BroadcastSpot[]>([
    {
      id: 'spot-1',
      clientName: 'Banco Santander',
      campaignName: 'Crédito Hipotecario 2025',
      duration: 30,
      startTime: '08:15',
      endTime: '08:15:30',
      station: 'radio-futuro',
      status: 'confirmed',
      priority: 'premium',
      value: 125000,
      audienceSize: 45000,
      cortexScore: 92
    },
    {
      id: 'spot-2',
      clientName: 'Coca-Cola',
      campaignName: 'Verano Refrescante',
      duration: 20,
      startTime: '08:16',
      endTime: '08:16:20',
      station: 'radio-futuro',
      status: 'scheduled',
      priority: 'high',
      value: 95000,
      audienceSize: 42000,
      cortexScore: 88
    },
    {
      id: 'spot-3',
      clientName: 'Pepsi',
      campaignName: 'Nueva Fórmula',
      duration: 30,
      startTime: '08:17',
      endTime: '08:17:30',
      station: 'radio-futuro',
      status: 'conflict',
      priority: 'high',
      value: 98000,
      audienceSize: 41000,
      conflicts: ['Competidor directo con Coca-Cola'],
      cortexScore: 65
    },
    {
      id: 'spot-4',
      clientName: 'Falabella',
      campaignName: 'Cyber Monday',
      duration: 25,
      startTime: '12:30',
      endTime: '12:30:25',
      station: 'radio-corazon',
      status: 'confirmed',
      priority: 'medium',
      value: 75000,
      audienceSize: 38000,
      cortexScore: 85
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-700 border-green-500/30'
      case 'scheduled': return 'bg-blue-500/20 text-blue-700 border-blue-500/30'
      case 'aired': return 'bg-gray-500/20 text-gray-700 border-gray-500/30'
      case 'missed': return 'bg-red-500/20 text-red-700 border-red-500/30'
      case 'conflict': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'premium': return 'bg-purple-500'
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const handleDragStart = (spot: BroadcastSpot) => {
    setDraggedSpot(spot)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, timeSlot: string, station: string) => {
    e.preventDefault()
    if (draggedSpot) {
      // Aquí implementarías la lógica de validación y actualización
      
      setDraggedSpot(null)
    }
  }

  const filteredSpots = spots.filter(spot => {
    const matchesSearch = spot.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStation = selectedStation === 'all' || spot.station === selectedStation
    return matchesSearch && matchesStation
  })

  const getSpotsByTimeAndStation = (hour: number, stationId: string) => {
    return filteredSpots.filter(spot => {
      const spotHour = parseInt(spot.startTime.split(':')[0])
      return spotHour === hour && spot.station === stationId
    })
  }

  return (
    <div className="space-y-6">
      {/* Controles y Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-broadcast-500" />
                Cuadrícula de Planificación Visual
              </CardTitle>
              <CardDescription>
                Booking grid inteligente con drag & drop y validaciones automáticas
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-broadcast-400 border-broadcast-400/50">
                <Zap className="w-3 h-3 mr-1" />
                CORTEX ACTIVO
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="station">Emisora</Label>
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar emisora" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las emisoras</SelectItem>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name} ({station.frequency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Cliente o campaña..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Vista</Label>
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                >
                  Día
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  Semana
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Principal */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Header con emisoras */}
              <div className="grid grid-cols-[100px_repeat(5,1fr)] border-b">
                <div className="p-4 bg-muted/50 font-semibold">Hora</div>
                {stations.filter(s => s.active).map((station) => (
                  <div key={station.id} className="p-4 bg-muted/50 text-center">
                    <div className="font-semibold">{station.name}</div>
                    <div className="text-xs text-muted-foreground">{station.frequency}</div>
                    <div className={`w-3 h-3 rounded-full ${station.color} mx-auto mt-1`}></div>
                  </div>
                ))}
              </div>

              {/* Grid de tiempo */}
              <div className="max-h-[600px] overflow-y-auto">
                {timeSlots.map((timeSlot) => (
                  <div key={timeSlot.id} className="grid grid-cols-[100px_repeat(5,1fr)] border-b hover:bg-muted/30">
                    <div className="p-4 bg-muted/20 font-mono text-sm border-r">
                      {timeSlot.time}
                    </div>
                    {stations.filter(s => s.active).map((station) => {
                      const spotsInSlot = getSpotsByTimeAndStation(timeSlot.hour, station.id)
                      return (
                        <div
                          key={`${timeSlot.id}-${station.id}`}
                          className="p-2 min-h-[80px] border-r relative"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, timeSlot.time, station.id)}
                        >
                          {spotsInSlot.map((spot) => (
                            <div
                              key={spot.id}
                              draggable
                              onDragStart={() => handleDragStart(spot)}
                              className={`
                                p-2 mb-1 rounded-lg border cursor-move text-xs
                                ${getStatusColor(spot.status)}
                                hover:shadow-md transition-all duration-200
                              `}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold truncate">{spot.clientName}</span>
                                <div className="flex items-center space-x-1">
                                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(spot.priority)}`}></div>
                                  {spot.cortexScore && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      {spot.cortexScore}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {spot.campaignName}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs">{spot.duration}s</span>
                                <span className="text-xs">{spot.startTime}</span>
                              </div>
                              {spot.conflicts && spot.conflicts.length > 0 && (
                                <div className="flex items-center mt-1">
                                  <AlertTriangle className="w-3 h-3 text-yellow-500 mr-1" />
                                  <span className="text-xs text-yellow-600">Conflicto</span>
                                </div>
                              )}
                            </div>
                          ))}
                          {spotsInSlot.length === 0 && (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                              <Plus className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Panel de Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
            Alertas Contextuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Conflicto de Competidores Detectado</p>
                <p className="text-xs text-muted-foreground">
                  Coca-Cola y Pepsi programados consecutivamente en Radio Futuro (08:16-08:17)
                </p>
              </div>
              <Button size="sm" variant="outline">
                Resolver
              </Button>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Zap className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Optimización Disponible</p>
                <p className="text-xs text-muted-foreground">
                  Cortex-Scheduler sugiere reordenar tanda matinal para +12% engagement
                </p>
              </div>
              <Button size="sm" variant="outline">
                Aplicar
              </Button>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Validación Completada</p>
                <p className="text-xs text-muted-foreground">
                  Todos los spots de la tanda 12:00-13:00 validados correctamente
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}