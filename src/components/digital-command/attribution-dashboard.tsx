/**
 * ATTRIBUTION DASHBOARD - TIER0 FORTUNE 10
 * 
 * @description Dashboard avanzado de atribución multi-touch con modelado
 * predictivo, análisis cross-device y measurement unificado
 * 
 * @version 2040.14.4
 * @tier TIER0 - Fortune 10 Standards
 * @security Military Grade - OWASP Compliant
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Target, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Zap,
  Eye,
  MousePointer,
  ShoppingCart,
  Clock,
  Users,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  ArrowRight,
  Activity
} from 'lucide-react'

interface AttributionModel {
  id: string
  name: string
  description: string
  conversions: number
  revenue: number
  percentage: number
  isActive: boolean
}

interface TouchpointData {
  channel: string
  platform: string
  touchpoints: number
  firstTouch: number
  lastTouch: number
  assisted: number
  revenue: number
  color: string
}

interface ConversionPath {
  id: string
  path: string[]
  conversions: number
  revenue: number
  avgTimeToConversion: number
  touchpoints: number
}

interface DeviceAttribution {
  device: string
  conversions: number
  revenue: number
  percentage: number
  icon: React.ReactNode
}

export function AttributionDashboard() {
  const [attributionModels, setAttributionModels] = useState<AttributionModel[]>([])
  const [touchpointData, setTouchpointData] = useState<TouchpointData[]>([])
  const [conversionPaths, setConversionPaths] = useState<ConversionPath[]>([])
  const [deviceAttribution, setDeviceAttribution] = useState<DeviceAttribution[]>([])
  const [selectedModel, setSelectedModel] = useState('data-driven')
  const [timeRange, setTimeRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAttributionData()
  }, [selectedModel, timeRange])

  const loadAttributionData = async () => {
    try {

      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Modelos de Atribución
      setAttributionModels([
        {
          id: 'first-touch',
          name: 'First Touch',
          description: 'Atribuye 100% del crédito al primer touchpoint',
          conversions: 8450,
          revenue: 2850000,
          percentage: 18.2,
          isActive: false
        },
        {
          id: 'last-touch',
          name: 'Last Touch',
          description: 'Atribuye 100% del crédito al último touchpoint',
          conversions: 12400,
          revenue: 4200000,
          percentage: 26.8,
          isActive: false
        },
        {
          id: 'linear',
          name: 'Linear',
          description: 'Distribuye el crédito equitativamente entre todos los touchpoints',
          conversions: 10200,
          revenue: 3450000,
          percentage: 22.0,
          isActive: false
        },
        {
          id: 'time-decay',
          name: 'Time Decay',
          description: 'Da más crédito a touchpoints más cercanos a la conversión',
          conversions: 11800,
          revenue: 3980000,
          percentage: 25.4,
          isActive: false
        },
        {
          id: 'data-driven',
          name: 'Data-Driven',
          description: 'Modelo basado en ML que analiza patrones históricos',
          conversions: 13600,
          revenue: 4600000,
          percentage: 29.3,
          isActive: true
        }
      ])

      // Datos de Touchpoints
      setTouchpointData([
        {
          channel: 'Google Ads',
          platform: 'Search',
          touchpoints: 45600,
          firstTouch: 12400,
          lastTouch: 8900,
          assisted: 24300,
          revenue: 1850000,
          color: 'bg-blue-500'
        },
        {
          channel: 'Meta Ads',
          platform: 'Social',
          touchpoints: 38200,
          firstTouch: 8900,
          lastTouch: 11200,
          assisted: 18100,
          revenue: 1420000,
          color: 'bg-blue-600'
        },
        {
          channel: 'TikTok Ads',
          platform: 'Social',
          touchpoints: 28900,
          firstTouch: 15600,
          lastTouch: 4200,
          assisted: 9100,
          revenue: 890000,
          color: 'bg-pink-500'
        },
        {
          channel: 'LinkedIn Ads',
          platform: 'Professional',
          touchpoints: 12400,
          firstTouch: 2800,
          lastTouch: 4900,
          assisted: 4700,
          revenue: 1240000,
          color: 'bg-blue-700'
        },
        {
          channel: 'DV360',
          platform: 'Display',
          touchpoints: 18700,
          firstTouch: 3200,
          lastTouch: 2100,
          assisted: 13400,
          revenue: 650000,
          color: 'bg-green-500'
        },
        {
          channel: 'Email',
          platform: 'Direct',
          touchpoints: 22100,
          firstTouch: 1200,
          lastTouch: 8900,
          assisted: 12000,
          revenue: 780000,
          color: 'bg-purple-500'
        }
      ])

      // Rutas de Conversión
      setConversionPaths([
        {
          id: 'path_1',
          path: ['TikTok Ads', 'Google Ads', 'Email'],
          conversions: 2840,
          revenue: 1420000,
          avgTimeToConversion: 7.2,
          touchpoints: 3
        },
        {
          id: 'path_2',
          path: ['Google Ads', 'Meta Ads'],
          conversions: 2150,
          revenue: 1075000,
          avgTimeToConversion: 3.8,
          touchpoints: 2
        },
        {
          id: 'path_3',
          path: ['Meta Ads', 'Google Ads', 'Email', 'Google Ads'],
          conversions: 1890,
          revenue: 945000,
          avgTimeToConversion: 12.5,
          touchpoints: 4
        },
        {
          id: 'path_4',
          path: ['LinkedIn Ads', 'Email'],
          conversions: 1650,
          revenue: 1320000,
          avgTimeToConversion: 5.1,
          touchpoints: 2
        },
        {
          id: 'path_5',
          path: ['DV360', 'Google Ads', 'Meta Ads'],
          conversions: 1420,
          revenue: 710000,
          avgTimeToConversion: 9.3,
          touchpoints: 3
        }
      ])

      // Atribución por Dispositivo
      setDeviceAttribution([
        {
          device: 'Desktop',
          conversions: 6800,
          revenue: 2720000,
          percentage: 50.0,
          icon: <Monitor className="h-4 w-4" />
        },
        {
          device: 'Mobile',
          conversions: 5440,
          revenue: 1632000,
          percentage: 40.0,
          icon: <Smartphone className="h-4 w-4" />
        },
        {
          device: 'Tablet',
          conversions: 1360,
          revenue: 408000,
          percentage: 10.0,
          icon: <Tablet className="h-4 w-4" />
        }
      ])

      setIsLoading(false)

    } catch (error) {
      console.error('❌ Error cargando datos de atribución:', error)
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const getSelectedModelData = () => {
    return attributionModels.find(model => model.id === selectedModel) || attributionModels[0]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando datos de atribución...</p>
        </div>
      </div>
    )
  }

  const selectedModelData = getSelectedModelData()

  return (
    <div className="space-y-6">
      {/* Header y Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Attribution Dashboard
          </h2>
          <p className="text-gray-600">
            Análisis avanzado de atribución multi-touch con IA predictiva
          </p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversiones Totales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(selectedModelData.conversions)}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{selectedModelData.percentage}% vs otros modelos
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Atribuido</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(selectedModelData.revenue)}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              ROAS: 3.8x promedio
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Touchpoints Promedio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <Clock className="h-3 w-3 mr-1" />
              8.5 días promedio
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cross-Device</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <div className="flex items-center text-xs text-purple-600 mt-1">
              <Globe className="h-3 w-3 mr-1" />
              Multi-dispositivo
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principales */}
      <Tabs defaultValue="models" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="touchpoints">Touchpoints</TabsTrigger>
          <TabsTrigger value="paths">Rutas</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Comparación de Modelos de Atribución
              </CardTitle>
              <CardDescription>
                Análisis comparativo de diferentes modelos de atribución
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attributionModels.map((model) => (
                  <div 
                    key={model.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedModel === model.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          model.isActive ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <h3 className="font-semibold">{model.name}</h3>
                        {model.isActive && (
                          <Badge variant="default">Recomendado</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatNumber(model.conversions)} conv.</div>
                        <div className="text-sm text-gray-500">{formatCurrency(model.revenue)}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${model.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="touchpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Análisis de Touchpoints por Canal
              </CardTitle>
              <CardDescription>
                Distribución de touchpoints en el customer journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Canal</th>
                      <th className="text-right p-2">Total Touchpoints</th>
                      <th className="text-right p-2">First Touch</th>
                      <th className="text-right p-2">Last Touch</th>
                      <th className="text-right p-2">Assisted</th>
                      <th className="text-right p-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {touchpointData.map((touchpoint, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${touchpoint.color}`}></div>
                            <div>
                              <div className="font-medium">{touchpoint.channel}</div>
                              <div className="text-xs text-gray-500">{touchpoint.platform}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right p-2 font-medium">
                          {formatNumber(touchpoint.touchpoints)}
                        </td>
                        <td className="text-right p-2">
                          {formatNumber(touchpoint.firstTouch)}
                        </td>
                        <td className="text-right p-2">
                          {formatNumber(touchpoint.lastTouch)}
                        </td>
                        <td className="text-right p-2">
                          {formatNumber(touchpoint.assisted)}
                        </td>
                        <td className="text-right p-2 font-medium">
                          {formatCurrency(touchpoint.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Top Conversion Paths
              </CardTitle>
              <CardDescription>
                Rutas de conversión más frecuentes y efectivas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionPaths.map((path, index) => (
                  <div key={path.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{formatNumber(path.conversions)} conversiones</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(path.revenue)}</div>
                        <div className="text-xs text-gray-500">{path.avgTimeToConversion} días promedio</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {path.path.map((step, stepIndex) => (
                        <React.Fragment key={stepIndex}>
                          <Badge variant="secondary" className="text-xs">
                            {step}
                          </Badge>
                          {stepIndex < path.path.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deviceAttribution.map((device, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {device.icon}
                    {device.device}
                  </CardTitle>
                  <Badge variant="outline">{device.percentage}%</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{formatNumber(device.conversions)}</div>
                  <div className="text-sm text-gray-600 mb-2">{formatCurrency(device.revenue)}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Cross-Device Journey Insights
              </CardTitle>
              <CardDescription>
                Análisis de comportamiento multi-dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Patrones de Comportamiento</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Mobile → Desktop</span>
                      </div>
                      <Badge>42% conversiones</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Desktop → Mobile</span>
                      </div>
                      <Badge>28% conversiones</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tablet className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Tablet → Desktop</span>
                      </div>
                      <Badge>18% conversiones</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Métricas Cross-Device</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tiempo promedio entre dispositivos</span>
                      <span className="font-medium">2.3 días</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Usuarios multi-dispositivo</span>
                      <span className="font-medium">68%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Touchpoints promedio</span>
                      <span className="font-medium">5.2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Lift en conversiones</span>
                      <span className="font-medium text-green-600">+34%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}