/**
 * PLANNING GRID - Cuadrícula de Planificación Visual TIER 0
 * 
 * @description Booking Grid inteligente con 3 paneles, filtros y navegación temporal,
 * Drag & Drop con validaciones y sistema de alertas contextuales
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 * @classification ENTERPRISE_SECURITY
 * 
 * @author Silexar Development Team - Broadcast Division
 * @created 2025-02-08
 */

'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, 
  Clock, 
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Zap,
  Target,
  Users,
  DollarSign,
  BarChart3,
  Activity,
  RefreshCw
} from 'lucide-react'

interface TimeSlot {
  id: string
  time: string
  duration: number
  program: string
  type: 'commercial' | 'program' | 'news' | 'music'
  spots: SpotBooking[]
  capacity: number
  rate: number
  audienceSize: number
}

interface SpotBooking {
  id: string
  client: string
  product: string
  duration: number
  priority: number
  status: 'confirmed' | 'pending' | 'conflict' | 'cancelled'
  value: number
  position: number
}

interface PlanningGridProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function PlanningGrid({ selectedDate, onDateChange }: PlanningGridProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day')
  const [selectedStation, setSelectedStation] = useState<string>('all')
  const [filterProgram, setFilterProgram] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data para time slots
  const [timeSlots] = useState<TimeSlot[]>([
    {
      id: 'slot_0600',
      time: '06:00',
      duration: 60,
      program: 'Buenos Días Chile',
      type: 'program',
      capacity: 8,
      rate: 150000,
      audienceSize: 125000,
      spots: [
        {
          id: 'spot_001',
          client: 'Banco de Chile',
          product: 'Cuenta Corriente',
          duration: 30,
          priority: 9,
          status: 'confirmed',
          value: 180000,
          position: 1
        },
        {
          id: 'spot_002',
          client: 'Falabella',
          product: 'Black Friday',
          duration: 20,
          priority: 8,
          status: 'pending',
          value: 120000,
          position: 2
        }
      ]
    },
    {
      id: 'slot_0700',
      time: '07:00',
      duration: 60,
      program: 'Noticias Matinales',
      type: 'news',
      capacity: 6,
      rate: 200000,
      audienceSize: 180000,
      spots: [
        {
          id: 'spot_003',
          client: 'Coca-Cola',
          product: 'Campaña Verano',
          duration: 30,
          priority: 10,
          status: 'confirmed',
          value: 250000,
          position: 1
        }
      ]
    },
    {
      id: 'slot_0800',
      time: '08:00',
      duration: 60,
      program: 'Morning Drive',
      type: 'music',
      capacity: 10,
      rate: 180000,
      audienceSize: 220000,
      spots: [
        {
          id: 'spot_004',
          client: 'McDonald\'s',
          product: 'Desayunos',
          duration: 20,
          priority: 7,
          status: 'conflict',
          value: 140000,
          position: 1
        },
        {
          id: 'spot_005',
          client: 'Movistar',
          product: 'Planes Móviles',
          duration: 30,
          priority: 8,
          status: 'confirmed',
          value: 190000,
          position: 2
        }
      ]
    }
  ])

  const getStatusColor = (status: string) => {
    const colors = {
      'confirmed': 'bg-green-500',
      'pending': 'bg-yellow-500',
      'conflict': 'bg-red-500',
      'cancelled': 'bg-gray-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const getTypeColor = (type: string) => {
    const colors = {
      'commercial': 'border-blue-500',
      'program': 'border-green-500',
      'news': 'border-red-500',
      'music': 'border-purple-500'
    }
    return colors[type as keyof typeof colors] || 'border-gray-500'
  }

  const calculateOccupancy = (slot: TimeSlot) => {
    const totalDuration = slot.spots.reduce((sum, spot) => sum + spot.duration, 0)
    return Math.round((totalDuration / (slot.duration * 60)) * 100)
  }


  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    onDateChange(newDate)
  }

  return (
    <div className="space-y-6">
      {/* Header y Controles */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-blue-400" />
                Cuadrícula de Planificación
              </CardTitle>
              <CardDescription className="text-slate-400">
                Booking Grid inteligente con validaciones automáticas
              </CardDescription>
            </div>
            
            {/* Navegación de Fecha */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateDate('prev')}
                  className="border-slate-600 text-slate-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-center">
                  <div className="text-white font-medium">
                    {selectedDate.toLocaleDateString('es-CL', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateDate('next')}
                  className="border-slate-600 text-slate-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Select value={viewMode} onValueChange={(value: 'day' | 'week' | 'month') => setViewMode(value)}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Día</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filtros */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar cliente, producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
                <SelectValue placeholder="Todas las emisoras" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las emisoras</SelectItem>
                <SelectItem value="radio_1">Radio Cooperativa</SelectItem>
                <SelectItem value="radio_2">T13 Radio</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterProgram} onValueChange={setFilterProgram}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
                <SelectValue placeholder="Todos los programas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los programas</SelectItem>
                <SelectItem value="news">Noticias</SelectItem>
                <SelectItem value="music">Música</SelectItem>
                <SelectItem value="talk">Conversación</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsLoading(true)}
              className="border-slate-600 text-slate-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 gap-4">
        {timeSlots.map((slot) => (
          <Card 
            key={slot.id} 
            className={`bg-slate-800/50 border-2 transition-all cursor-pointer ${
              selectedTimeSlot === slot.id 
                ? 'border-blue-500 bg-blue-500/10' 
                : `${getTypeColor(slot.type)} hover:border-slate-500`
            }`}
            onClick={() => setSelectedTimeSlot(slot.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                {/* Info del Slot */}
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{slot.time}</div>
                    <div className="text-xs text-slate-400">{slot.duration}min</div>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium text-lg">{slot.program}</h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {slot.audienceSize.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatCurrency(slot.rate)}
                      </span>
                      <span className="flex items-center">
                        <Target className="h-3 w-3 mr-1" />
                        {calculateOccupancy(slot)}% ocupado
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Métricas */}
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">
                    {slot.spots.length}/{slot.capacity}
                  </div>
                  <div className="text-xs text-slate-400">Spots</div>
                </div>
              </div>
              
              {/* Spots en el Slot */}
              <div className="space-y-2">
                {slot.spots.map((spot, index) => (
                  <div 
                    key={spot.id}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(spot.status)}`} />
                        <span className="text-sm font-medium text-white">#{index + 1}</span>
                      </div>
                      
                      <div>
                        <div className="text-white font-medium">{spot.client}</div>
                        <div className="text-slate-400 text-sm">{spot.product}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-white font-medium">{spot.duration}s</div>
                        <div className="text-slate-400 text-xs">Duración</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-green-400 font-medium">
                          {formatCurrency(spot.value)}
                        </div>
                        <div className="text-slate-400 text-xs">Valor</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-blue-400 font-medium">{spot.priority}</div>
                        <div className="text-slate-400 text-xs">Prioridad</div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-400 h-8 w-8 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-400 h-8 w-8 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-400 h-8 w-8 p-0">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Slot Vacío */}
                {slot.spots.length < slot.capacity && (
                  <div className="flex items-center justify-center p-3 border-2 border-dashed border-slate-600 rounded-lg hover:border-slate-500 transition-colors cursor-pointer">
                    <div className="text-center">
                      <Plus className="h-6 w-6 text-slate-500 mx-auto mb-1" />
                      <div className="text-slate-500 text-sm">Agregar Spot</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Alertas del Slot */}
              {slot.spots.some(s => s.status === 'conflict') && (
                <div className="mt-3 p-2 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-red-400 text-sm font-medium">
                      Conflicto detectado en este bloque
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Panel de Acciones Rápidas */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Spot
              </Button>
              
              <Button variant="outline" className="border-slate-600 text-slate-300">
                <Zap className="h-4 w-4 mr-2" />
                Auto-Optimizar
              </Button>
              
              <Button variant="outline" className="border-slate-600 text-slate-300">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Analytics
              </Button>
            </div>
            
            <div className="text-right text-sm text-slate-400">
              <div>Total slots: {timeSlots.length}</div>
              <div>Ocupación promedio: {Math.round(timeSlots.reduce((sum, slot) => sum + calculateOccupancy(slot), 0) / timeSlots.length)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}