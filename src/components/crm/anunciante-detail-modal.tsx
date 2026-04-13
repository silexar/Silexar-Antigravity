/**
 * COMPONENTE: Vista Detallada 360° del Anunciante
 * 
 * @description Modal completo con pestañas para información general, portfolio,
 * historial comercial, análisis de performance y estado financiero con Cortex-Risk
 * 
 * @tier TIER_0_FORTUNE_10
 * @security_level MILITARY_GRADE
 */

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileText,
  CreditCard,
  BarChart3,
  Package,
  History,
  Target,
  Shield
} from 'lucide-react'

interface Anunciante {
  id: string
  rut: string
  razonSocial: string
  nombreFantasia: string
  contactoPrincipal: string
  email: string
  telefono: string
  direccion?: string
  giroComercial?: string
  estado: 'activo' | 'inactivo' | 'prospecto'
  clasificacionRiesgo: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC'
  facturacionAcumulada: number
  fechaUltimaCampana: string
  ejecutivoAsignado: string
  industria: string
  scoreRiesgo: number
  limiteCredito?: number
  condicionesPago?: string
}

interface AnuncianteDetailModalProps {
  anunciante: Anunciante | null
  isOpen: boolean
  onClose: () => void
}

export default function AnuncianteDetailModal({ 
  anunciante, 
  isOpen, 
  onClose 
}: AnuncianteDetailModalProps) {
  const [activeTab, setActiveTab] = useState('general')

  if (!anunciante) return null

  const getRiskColor = (clasificacion: string) => {
    const colors = {
      'AAA': 'bg-green-500',
      'AA': 'bg-green-400', 
      'A': 'bg-lime-500',
      'BBB': 'bg-yellow-500',
      'BB': 'bg-orange-500',
      'B': 'bg-red-500',
      'CCC': 'bg-red-600'
    }
    return colors[clasificacion as keyof typeof colors] || 'bg-gray-500'
  }

  // Mock data para las pestañas
  const productos = [
    { id: 1, nombre: 'Cuenta Corriente Premium', categoria: 'Servicios Financieros' },
    { id: 2, nombre: 'Tarjeta de Crédito Platinum', categoria: 'Productos Crediticios' },
    { id: 3, nombre: 'Seguros Automotriz', categoria: 'Seguros' }
  ]

  const historialComercial = [
    { 
      id: 1, 
      fecha: '2025-01-15', 
      tipo: 'Campaña', 
      descripcion: 'Campaña Verano 2025', 
      valor: 25000000,
      estado: 'Completada'
    },
    { 
      id: 2, 
      fecha: '2024-11-20', 
      tipo: 'Contrato', 
      descripcion: 'Auspicios Deportivos Q4', 
      valor: 18000000,
      estado: 'Activo'
    },
    { 
      id: 3, 
      fecha: '2024-09-10', 
      tipo: 'Campaña', 
      descripcion: 'Lanzamiento Producto Digital', 
      valor: 12000000,
      estado: 'Completada'
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#F0EDE8] border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-3">
            <Building2 className="h-6 w-6 text-blue-400" />
            Vista 360° - {anunciante.nombreFantasia}
            <Badge className={`${getRiskColor(anunciante.clasificacionRiesgo)} text-white ml-2`}>
              {anunciante.clasificacionRiesgo}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="general" className="data-[state=active]:bg-blue-600">
              General
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-green-600">
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="historial" className="data-[state=active]:bg-purple-600">
              Historial
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-orange-600">
              Performance
            </TabsTrigger>
            <TabsTrigger value="financiero" className="data-[state=active]:bg-red-600">
              Financiero
            </TabsTrigger>
          </TabsList>

          {/* Pestaña Información General */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-400" />
                    Datos Corporativos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-400">RUT</label>
                      <p className="text-white font-medium">{anunciante.rut}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Razón Social</label>
                      <p className="text-white font-medium">{anunciante.razonSocial}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Nombre Fantasía</label>
                      <p className="text-white font-medium">{anunciante.nombreFantasia}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Industria</label>
                      <p className="text-white font-medium">{anunciante.industria}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Giro Comercial</label>
                    <p className="text-white font-medium">
                      {anunciante.giroComercial || 'Servicios financieros y bancarios'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Dirección</label>
                    <p className="text-white font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {anunciante.direccion || 'Ahumada 251, Santiago Centro'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-green-400" />
                    Contacto Principal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400">Nombre</label>
                    <p className="text-white font-medium">{anunciante.contactoPrincipal}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Email</label>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {anunciante.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Teléfono</label>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {anunciante.telefono}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Ejecutivo Asignado</label>
                    <p className="text-white font-medium">{anunciante.ejecutivoAsignado}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Historial de Interacciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Reunión comercial</p>
                        <p className="text-slate-400 text-sm">Presentación propuesta Q1 2025</p>
                      </div>
                    </div>
                    <span className="text-slate-400 text-sm">Hace 3 días</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Email enviado</p>
                        <p className="text-slate-400 text-sm">Seguimiento post-campaña con métricas</p>
                      </div>
                    </div>
                    <span className="text-slate-400 text-sm">Hace 1 semana</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-orange-400" />
                      <div>
                        <p className="text-white font-medium">Llamada telefónica</p>
                        <p className="text-slate-400 text-sm">Coordinación de creatividades</p>
                      </div>
                    </div>
                    <span className="text-slate-400 text-sm">Hace 2 semanas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Portfolio de Productos */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-400" />
                    Portfolio de Productos/Servicios
                  </CardTitle>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Package className="h-4 w-4 mr-2" />
                    Agregar Producto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productos.map((producto) => (
                    <Card key={producto.id} className="bg-slate-700/30 border-slate-600">
                      <CardContent className="p-4">
                        <h3 className="text-white font-medium mb-2">{producto.nombre}</h3>
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          {producto.categoria}
                        </Badge>
                        <div className="mt-3 flex space-x-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            Ver Campañas
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            Editar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Historial Comercial */}
          <TabsContent value="historial" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-400" />
                  Historial Comercial Completo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historialComercial.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                          <Calendar className="h-5 w-5 text-blue-400" />
                          <span className="text-xs text-slate-400 mt-1">
                            {new Date(item.fecha).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{item.descripcion}</h3>
                          <p className="text-slate-400 text-sm">Tipo: {item.tipo}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-white font-medium">
                            ${item.valor.toLocaleString()}
                          </p>
                          <Badge 
                            variant={item.estado === 'Completada' ? 'default' : 'secondary'}
                            className={item.estado === 'Completada' ? 'bg-green-600' : 'bg-blue-600'}
                          >
                            {item.estado}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña Análisis de Performance */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-400" />
                    Métricas de Efectividad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-2xl font-bold text-green-400">87%</p>
                      <p className="text-slate-400 text-sm">ROI Promedio</p>
                    </div>
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-2xl font-bold text-blue-400">2.3x</p>
                      <p className="text-slate-400 text-sm">ROAS Promedio</p>
                    </div>
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-2xl font-bold text-purple-400">94%</p>
                      <p className="text-slate-400 text-sm">Tasa Conversión</p>
                    </div>
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-2xl font-bold text-orange-400">156K</p>
                      <p className="text-slate-400 text-sm">Leads Generados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-400" />
                    Benchmarking vs Competencia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Performance vs Industria</span>
                        <span className="text-green-400">+23%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Eficiencia de Inversión</span>
                        <span className="text-blue-400">+15%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Alcance de Audiencia</span>
                        <span className="text-purple-400">+31%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pestaña Estado Financiero */}
          <TabsContent value="financiero" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-400" />
                    Evaluación Cortex-Risk
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getRiskColor(anunciante.clasificacionRiesgo)} mb-4`}>
                      <span className="text-2xl font-bold text-white">
                        {anunciante.clasificacionRiesgo}
                      </span>
                    </div>
                    <p className="text-white font-medium text-lg">Score: {anunciante.scoreRiesgo}</p>
                    <p className="text-slate-400 text-sm">Evaluación automática Cortex-Risk</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Solvencia</span>
                      <span className="text-green-400">Excelente</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Historial de Pagos</span>
                      <span className="text-green-400">Sin mora</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Capacidad de Pago</span>
                      <span className="text-green-400">Alta</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Riesgo de Impago</span>
                      <span className="text-green-400">Muy Bajo (2%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-400" />
                    Estado de Cuentas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-xl font-bold text-green-400">$0</p>
                      <p className="text-slate-400 text-sm">Facturas Vencidas</p>
                    </div>
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-xl font-bold text-blue-400">$8.5M</p>
                      <p className="text-slate-400 text-sm">Facturas Pendientes</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Límite de Crédito</span>
                      <span className="text-white font-medium">
                        ${anunciante.limiteCredito?.toLocaleString() || '50,000,000'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Utilización</span>
                      <span className="text-green-400">17% (Bajo)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Condiciones de Pago</span>
                      <span className="text-white font-medium">
                        {anunciante.condicionesPago || '30 días'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Días Promedio Pago</span>
                      <span className="text-green-400">22 días</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-400">
            Cerrar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4 mr-2" />
            Crear Campaña
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}