'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Server, Layers, Crosshair, Activity,
  RefreshCw, Pause, Play,
  Filter, Download, Eye, Settings,
  Image, Video, Volume2, FileText, Sparkles, Maximize,
} from 'lucide-react'

interface DigitalCampaign {
  id: string
  name: string
  type: string
  status: string
  budget: number
  spent: number
  impressions: number
  clicks: number
  ctr: number
  cpm: number
  targeting: string[]
  formats: string[]
}

interface AdServerTabProps {
  isServerRunning: boolean
  onToggleServer: () => void
  digitalCampaigns: DigitalCampaign[]
}

export function AdServerTab({ isServerRunning, onToggleServer, digitalCampaigns }: AdServerTabProps) {
  return (
    <div className="space-y-6">
      {/* Estado del Servidor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Control del Servidor */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-400" />
              Control del Ad Server
            </CardTitle>
            <CardDescription className="text-slate-400">
              Gestión y monitoreo en tiempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Estado del Servidor</span>
                <Badge className={`${isServerRunning ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                  {isServerRunning ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">CPU Usage</span>
                <span className="text-sm text-white">23.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Memory Usage</span>
                <span className="text-sm text-white">67.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Disk Usage</span>
                <span className="text-sm text-white">45.8%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                className={`w-full ${isServerRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                onClick={onToggleServer}
              >
                {isServerRunning ? (
                  <><Pause className="h-4 w-4 mr-2" />Detener Servidor</>
                ) : (
                  <><Play className="h-4 w-4 mr-2" />Iniciar Servidor</>
                )}
              </Button>
              <Button variant="outline" className="w-full border-slate-500 text-slate-300">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reiniciar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Formatos */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-400" />
              Formatos Publicitarios
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configuración de formatos soportados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Display Banner', icon: Image, active: true, count: 15 },
              { name: 'Video Pre-roll', icon: Video, active: true, count: 8 },
              { name: 'Audio Streaming', icon: Volume2, active: true, count: 12 },
              { name: 'Native Ads', icon: FileText, active: true, count: 6 },
              { name: 'Rich Media', icon: Sparkles, active: false, count: 3 },
              { name: 'Interstitial', icon: Maximize, active: true, count: 4 },
            ].map((format) => {
              const IconComponent = format.icon
              return (
                <div key={format.name} className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-300">{format.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">{format.count} activos</span>
                    <div className={`w-2 h-2 rounded-full ${format.active ? 'bg-green-400' : 'bg-red-400'}`} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Targeting Avanzado */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Crosshair className="h-5 w-5 text-green-400" />
              Targeting Avanzado
            </CardTitle>
            <CardDescription className="text-slate-400">
              Capacidades de segmentación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { category: 'Demográfico', options: ['Edad', 'Género', 'Ingresos'], active: true },
              { category: 'Geográfico', options: ['País', 'Ciudad', 'Código Postal'], active: true },
              { category: 'Comportamental', options: ['Intereses', 'Historial', 'Dispositivo'], active: true },
              { category: 'Contextual', options: ['Contenido', 'Horario', 'Clima'], active: true },
              { category: 'Lookalike', options: ['Audiencias Similares', 'ML Clustering'], active: false },
            ].map((targeting) => (
              <div key={targeting.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">{targeting.category}</span>
                  <div className={`w-2 h-2 rounded-full ${targeting.active ? 'bg-green-400' : 'bg-slate-500'}`} />
                </div>
                <div className="flex flex-wrap gap-1">
                  {targeting.options.map((option) => (
                    <Badge key={option} variant="outline" className="text-xs text-slate-400 border-slate-500">
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Campañas Digitales Activas */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-400" />
                Campañas Digitales Activas
              </CardTitle>
              <CardDescription className="text-slate-400">
                Monitoreo en tiempo real de campañas en ejecución
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="border-slate-500">
                <Filter className="h-4 w-4 mr-1" />
                Filtros
              </Button>
              <Button size="sm" variant="outline" className="border-slate-500">
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {digitalCampaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-white">{campaign.name}</h3>
                      <Badge
                        className={`${
                          campaign.status === 'active' ? 'bg-green-600' :
                          campaign.status === 'paused' ? 'bg-yellow-600' :
                          'bg-red-600'
                        } text-white`}
                      >
                        {campaign.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-slate-300 border-slate-500">
                        {campaign.type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {campaign.targeting.map((target) => (
                        <Badge key={target} variant="outline" className="text-xs text-blue-400 border-blue-400">
                          {target}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400">CTR</div>
                    <div className="text-xl font-bold text-white">{campaign.ctr}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-slate-400">Presupuesto</div>
                    <div className="text-white font-medium">${(campaign.budget / 1000000).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Gastado</div>
                    <div className="text-white font-medium">${(campaign.spent / 1000000).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Impressions</div>
                    <div className="text-white font-medium">{(campaign.impressions / 1000000).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">CPM</div>
                    <div className="text-white font-medium">${campaign.cpm}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Progreso del Presupuesto</span>
                    <span className="text-white">{Math.round((campaign.spent / campaign.budget) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Formatos Activos</div>
                    <div className="flex flex-wrap gap-1">
                      {campaign.formats.map((format) => (
                        <Badge key={format} variant="outline" className="text-xs text-green-400 border-green-400">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-slate-500 text-slate-300">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-500 text-slate-300">
                      <Settings className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
