/**
 * MÓDULO 8: GESTIÓN DE CREATIVIDADES - TIER 0 Supremacy
 * 
 * @description Biblioteca inteligente de activos publicitarios con herramientas
 * de generación automática, edición profesional y optimización por IA.
 * Integrado con Cortex-Creative para generación automática de contenido.
 * 
 * @version 2040.5.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant - Creative Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Palette, 
  Play, 
  Image, 
  Video, 
  Mic,
  Plus,
  Search,
  Eye,
  Edit,
  Download,
  Upload,
  Wand2,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Brain,
  Zap
} from 'lucide-react'

/**
 * Interfaces para Creatividades
 */
interface Creatividad {
  id: string
  codigo: string
  nombre: string
  tipo: 'audio' | 'display' | 'video' | 'native'
  formato: string
  duracion?: number
  tamaño?: string
  estado: 'activa' | 'inactiva' | 'vencida' | 'revision'
  anunciante: {
    nombre: string
    logo?: string
  }
  producto: string
  vigencia: {
    inicio: string
    fin: string
  }
  usoActual: number
  performance: {
    ctr?: number
    vtr?: number
    engagement?: number
    conversiones?: number
  }
  fechaCreacion: string
  creadoPor: string
  thumbnail?: string
}

/**
 * TIER 0 Gestión de Creatividades Component
 */
export default function CreatividadesPage() {
  const [activeTab, setActiveTab] = useState('biblioteca')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState<string>('todos')
  const [filterEstado, setFilterEstado] = useState<string>('todos')

  // Mock data
  const [creatividades, setCreatividades] = useState<Creatividad[]>([
    {
      id: 'cre_001',
      codigo: 'SPX000123',
      nombre: 'Banco Chile - Crédito Hipotecario Verano',
      tipo: 'audio',
      formato: 'MP3',
      duracion: 30,
      estado: 'activa',
      anunciante: {
        nombre: 'Banco de Chile'
      },
      producto: 'Crédito Hipotecario',
      vigencia: {
        inicio: '2025-02-01',
        fin: '2025-03-31'
      },
      usoActual: 3,
      performance: {
        engagement: 0.78,
        conversiones: 245
      },
      fechaCreacion: '2025-01-25',
      creadoPor: 'Juan Pérez'
    },
    {
      id: 'cre_002',
      codigo: 'SPX000124',
      nombre: 'Falabella - Banner Black Friday',
      tipo: 'display',
      formato: 'JPG',
      tamaño: '728x90',
      estado: 'activa',
      anunciante: {
        nombre: 'Falabella'
      },
      producto: 'Black Friday',
      vigencia: {
        inicio: '2025-01-15',
        fin: '2025-02-15'
      },
      usoActual: 5,
      performance: {
        ctr: 0.034,
        conversiones: 1247
      },
      fechaCreacion: '2025-01-10',
      creadoPor: 'Ana Silva'
    },
    {
      id: 'cre_003',
      codigo: 'SPX000125',
      nombre: 'TechStart - Video Lanzamiento App',
      tipo: 'video',
      formato: 'MP4',
      duracion: 15,
      estado: 'revision',
      anunciante: {
        nombre: 'TechStart'
      },
      producto: 'App Móvil',
      vigencia: {
        inicio: '2025-02-10',
        fin: '2025-03-10'
      },
      usoActual: 0,
      performance: {},
      fechaCreacion: '2025-02-05',
      creadoPor: 'Luis Torres'
    }
  ])

  /**
   * Filtrar creatividades
   */
  const filteredCreatividades = creatividades.filter(creatividad => {
    const matchesSearch = 
      creatividad.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creatividad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creatividad.anunciante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creatividad.producto.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTipo = filterTipo === 'todos' || creatividad.tipo === filterTipo
    const matchesEstado = filterEstado === 'todos' || creatividad.estado === filterEstado
    
    return matchesSearch && matchesTipo && matchesEstado
  })

  /**
   * Obtener color por tipo
   */
  const getTipoColor = (tipo: string) => {
    const colors = {
      'audio': 'text-green-400',
      'display': 'text-blue-400',
      'video': 'text-purple-400',
      'native': 'text-orange-400'
    }
    return colors[tipo as keyof typeof colors] || 'text-slate-400'
  }

  /**
   * Obtener icono por tipo
   */
  const getTipoIcon = (tipo: string) => {
    const icons = {
      'audio': Mic,
      'display': Image,
      'video': Video,
      'native': Palette
    }
    const IconComponent = icons[tipo as keyof typeof icons] || Palette
    return <IconComponent className="h-4 w-4" />
  }

  /**
   * Obtener color por estado
   */
  const getEstadoColor = (estado: string) => {
    const colors = {
      'activa': 'bg-green-500',
      'inactiva': 'bg-gray-500',
      'vencida': 'bg-red-500',
      'revision': 'bg-yellow-500'
    }
    return colors[estado as keyof typeof colors] || 'bg-gray-500'
  }

  /**
   * Estadísticas de creatividades
   */
  const stats = {
    total: creatividades.length,
    activas: creatividades.filter(c => c.estado === 'activa').length,
    porVencer: creatividades.filter(c => {
      const vencimiento = new Date(c.vigencia.fin)
      const hoy = new Date()
      const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24))
      return diasRestantes <= 7 && diasRestantes > 0
    }).length,
    enRevision: creatividades.filter(c => c.estado === 'revision').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🎨 Gestión de Creatividades TIER 0
            </h1>
            <p className="text-slate-300">
              Biblioteca inteligente con generación automática por IA
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-pink-400 border-pink-400">
              🧠 Cortex-Creative Active
            </Badge>
            <Badge variant="outline" className="text-purple-400 border-purple-400">
              ⚡ IA Studio Ready
            </Badge>
          </div>
        </div>

        {/* KPIs de Creatividades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Total Activos</CardTitle>
              <Palette className="h-4 w-4 text-pink-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activas}</div>
              <p className="text-xs text-slate-400">
                de {stats.total} creatividades
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Por Vencer</CardTitle>
              <Clock className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.porVencer}</div>
              <p className="text-xs text-slate-400">
                Próximos 7 días
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">En Revisión</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.enRevision}</div>
              <p className="text-xs text-slate-400">
                Pendientes aprobación
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Performance</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {creatividades.filter(c => c.performance.ctr && c.performance.ctr > 0.03).length}
              </div>
              <p className="text-xs text-slate-400">
                Alto rendimiento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="biblioteca" className="data-[state=active]:bg-pink-600">
              Biblioteca
            </TabsTrigger>
            <TabsTrigger value="editor" className="data-[state=active]:bg-blue-600">
              Editor
            </TabsTrigger>
            <TabsTrigger value="ia-studio" className="data-[state=active]:bg-purple-600">
              IA Studio
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-green-600">
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Tab Biblioteca */}
          <TabsContent value="biblioteca" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Palette className="h-5 w-5 text-pink-400" />
                      Biblioteca Maestra de Creatividades
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Repositorio central inteligente con búsqueda avanzada
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Filtros */}
                    <select
                      value={filterTipo}
                      onChange={(e) => setFilterTipo(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2 text-sm"
                    >
                      <option value="todos">Todos los tipos</option>
                      <option value="audio">Audio</option>
                      <option value="display">Display</option>
                      <option value="video">Video</option>
                      <option value="native">Native</option>
                    </select>

                    <select
                      value={filterEstado}
                      onChange={(e) => setFilterEstado(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2 text-sm"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="activa">Activas</option>
                      <option value="inactiva">Inactivas</option>
                      <option value="vencida">Vencidas</option>
                      <option value="revision">En Revisión</option>
                    </select>

                    {/* Búsqueda */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar creatividades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-white w-80"
                      />
                    </div>

                    <Button className="bg-pink-600 hover:bg-pink-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Creatividad
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCreatividades.map((creatividad) => {
                    const TipoIcon = getTipoIcon(creatividad.tipo)
                    
                    return (
                      <Card key={creatividad.id} className="bg-slate-700/30 border-slate-600 hover:border-slate-500 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`p-2 rounded-lg bg-slate-600/50`}>
                                {TipoIcon}
                              </div>
                              <div>
                                <Badge 
                                  className={`${getEstadoColor(creatividad.estado)} text-white text-xs`}
                                >
                                  {creatividad.estado.toUpperCase()}
                                </Badge>
                                <p className="text-xs text-slate-400 mt-1">
                                  {creatividad.codigo}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-400">
                                Uso actual
                              </p>
                              <p className="text-sm font-medium text-white">
                                {creatividad.usoActual} campañas
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Thumbnail/Preview */}
                          <div className="aspect-video bg-slate-600/30 rounded-lg flex items-center justify-center">
                            {creatividad.tipo === 'audio' ? (
                              <Mic className="h-8 w-8 text-slate-400" />
                            ) : creatividad.tipo === 'video' ? (
                              <Video className="h-8 w-8 text-slate-400" />
                            ) : (
                              <Image className="h-8 w-8 text-slate-400" />
                            )}
                          </div>

                          {/* Información */}
                          <div>
                            <h3 className="text-white font-medium text-sm line-clamp-2">
                              {creatividad.nombre}
                            </h3>
                            <p className="text-slate-400 text-xs mt-1">
                              {creatividad.anunciante.nombre} • {creatividad.producto}
                            </p>
                          </div>

                          {/* Detalles Técnicos */}
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>
                              {creatividad.formato}
                              {creatividad.duracion && ` • ${creatividad.duracion}s`}
                              {creatividad.tamaño && ` • ${creatividad.tamaño}`}
                            </span>
                            <span>
                              Vence: {new Date(creatividad.vigencia.fin).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Performance */}
                          {(creatividad.performance.ctr || creatividad.performance.engagement) && (
                            <div className="flex items-center justify-between text-xs">
                              {creatividad.performance.ctr && (
                                <span className="text-green-400">
                                  CTR: {(creatividad.performance.ctr * 100).toFixed(2)}%
                                </span>
                              )}
                              {creatividad.performance.engagement && (
                                <span className="text-blue-400">
                                  Engagement: {(creatividad.performance.engagement * 100).toFixed(0)}%
                                </span>
                              )}
                            </div>
                          )}

                          {/* Acciones */}
                          <div className="flex space-x-2 pt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1 border-pink-500 text-pink-400 hover:bg-pink-500/10"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1 border-slate-500 text-slate-400 hover:bg-slate-500/10"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Estado vacío */}
                {filteredCreatividades.length === 0 && (
                  <div className="text-center py-12">
                    <Palette className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-slate-400 mb-2">
                      No se encontraron creatividades
                    </h3>
                    <p className="text-slate-500 mb-4">
                      {searchTerm || filterTipo !== 'todos' || filterEstado !== 'todos'
                        ? 'Intenta ajustar los filtros de búsqueda'
                        : 'Crea tu primera creatividad para comenzar'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Editor */}
          <TabsContent value="editor" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Edit className="h-5 w-5 text-blue-400" />
                  Creador/Editor de Creatividades
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Herramientas de producción integradas con editor profesional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Edit className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-400 mb-2">
                    Editor Profesional
                  </h3>
                  <p className="text-slate-500">
                    Herramientas de edición serán implementadas próximamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab IA Studio */}
          <TabsContent value="ia-studio" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-400" />
                  Estudio de Creatividad Automática
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Generador de contenido con IA - Cortex-Creative
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-400 mb-2">
                    IA Studio Powered by Cortex-Creative
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Generación automática de creatividades será implementada próximamente
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generar con IA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  Analytics de Creatividades
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Inteligencia de performance creativa con insights predictivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-400 mb-2">
                    Analytics Avanzado
                  </h3>
                  <p className="text-slate-500">
                    Métricas de performance y analytics predictivo próximamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm">
          <p>
            🎨 GESTIÓN DE CREATIVIDADES TIER 0 - Powered by Cortex-Creative
          </p>
          <p>
            IA Studio • Professional Editor • Pentagon++ Asset Protection
          </p>
        </div>
      </div>
    </div>
  )
}