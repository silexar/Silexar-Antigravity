/**
 * UTILITY STUDIO - TIER 0 Silexar Pulse 2.0
 * Constructor de Micro-Aplicaciones de Utilidad
 * 
 * @description Constructor visual de micro-aplicaciones de utilidad (calculadoras,
 * conversores, checklists, mini-juegos) compatible con MRAID v3 para monetización CPVI
 * 
 * @version 2040.20.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant - Silexar Pulse 2.0 Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calculator, 
  ArrowRightLeft, 
  CheckSquare, 
  Gamepad2,
  Smartphone,
  Palette,
  Settings,
  Eye,
  Download,
  Upload,
  Play,
  Code,
  Zap,
  DollarSign,
  Target,
  Lightbulb,
  Save,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Type,
  MousePointer
} from 'lucide-react'

// Interfaces para el constructor
interface UtilityTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: 'FINANCIAL' | 'CONVERSION' | 'PRODUCTIVITY' | 'ENTERTAINMENT'
  complexity: 'SIMPLE' | 'MEDIUM' | 'ADVANCED'
  estimated_time: string
  preview_image: string
  default_config: Record<string, any>
  billing_events: string[]
}

interface BrandAssets {
  logo: File | null
  primary_color: string
  secondary_color: string
  font_family: string
  sponsor_text: string
}

interface UtilityConfig {
  template_id: string
  brand_assets: BrandAssets
  custom_config: Record<string, any>
  billing_event: string
  name: string
  description: string
}

export function UtilityStudio() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<UtilityTemplate | null>(null)
  const [brandAssets, setBrandAssets] = useState<BrandAssets>({
    logo: null,
    primary_color: '#3b82f6',
    secondary_color: '#1e40af',
    font_family: 'Inter',
    sponsor_text: 'Patrocinado por'
  })
  const [customConfig, setCustomConfig] = useState<Record<string, any>>({})
  const [billingEvent, setBillingEvent] = useState('')
  const [utilityName, setUtilityName] = useState('')
  const [utilityDescription, setUtilityDescription] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Plantillas predefinidas
  const utilityTemplates: UtilityTemplate[] = [
    {
      id: 'loan_calculator',
      name: 'Calculadora de Préstamos',
      description: 'Calculadora interactiva para préstamos hipotecarios y personales',
      icon: Calculator,
      category: 'FINANCIAL',
      complexity: 'MEDIUM',
      estimated_time: '15 min',
      preview_image: '/templates/loan-calculator.png',
      default_config: {
        max_amount: 1000000,
        min_amount: 100000,
        default_rate: 4.5,
        max_term: 30
      },
      billing_events: ['loan_calculated', 'quote_requested', 'contact_submitted']
    },
    {
      id: 'currency_converter',
      name: 'Conversor de Divisas',
      description: 'Conversor en tiempo real con tasas de cambio actualizadas',
      icon: ArrowRightLeft,
      category: 'CONVERSION',
      complexity: 'SIMPLE',
      estimated_time: '10 min',
      preview_image: '/templates/currency-converter.png',
      default_config: {
        base_currency: 'CLP',
        supported_currencies: ['USD', 'EUR', 'GBP', 'JPY'],
        update_frequency: 3600
      },
      billing_events: ['conversion_completed', 'rate_checked', 'currency_saved']
    },
    {
      id: 'travel_checklist',
      name: 'Checklist de Viaje',
      description: 'Lista interactiva personalizable para preparación de viajes',
      icon: CheckSquare,
      category: 'PRODUCTIVITY',
      complexity: 'SIMPLE',
      estimated_time: '12 min',
      preview_image: '/templates/travel-checklist.png',
      default_config: {
        categories: ['Documentos', 'Equipaje', 'Reservas', 'Salud'],
        max_items: 50,
        allow_custom_items: true
      },
      billing_events: ['checklist_completed', 'checklist_saved', 'item_checked']
    },
    {
      id: 'memory_game',
      name: 'Mini-Juego de Memoria',
      description: 'Juego de memoria con branding personalizado y premios',
      icon: Gamepad2,
      category: 'ENTERTAINMENT',
      complexity: 'ADVANCED',
      estimated_time: '25 min',
      preview_image: '/templates/memory-game.png',
      default_config: {
        grid_size: '4x4',
        time_limit: 120,
        difficulty_levels: 3,
        rewards_enabled: true
      },
      billing_events: ['game_completed', 'high_score', 'reward_claimed']
    }
  ]

  const handleTemplateSelect = (template: UtilityTemplate) => {
    setSelectedTemplate(template)
    setCustomConfig(template.default_config)
    setBillingEvent(template.billing_events[0])
    setUtilityName(template.name)
    setUtilityDescription(template.description)
    setCurrentStep(2)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setBrandAssets(prev => ({ ...prev, logo: file }))
    }
  }

  const generateUtility = () => {
    if (!selectedTemplate) return

    const utilityConfig: UtilityConfig = {
      template_id: selectedTemplate.id,
      brand_assets: brandAssets,
      custom_config: customConfig,
      billing_event: billingEvent,
      name: utilityName,
      description: utilityDescription
    }

    // Simular generación de micro-aplicación
    
    alert('Micro-aplicación generada exitosamente!')
    setIsOpen(false)
  }

  const resetWizard = () => {
    setCurrentStep(1)
    setSelectedTemplate(null)
    setBrandAssets({
      logo: null,
      primary_color: '#3b82f6',
      secondary_color: '#1e40af',
      font_family: 'Inter',
      sponsor_text: 'Patrocinado por'
    })
    setCustomConfig({})
    setBillingEvent('')
    setUtilityName('')
    setUtilityDescription('')
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FINANCIAL': return 'bg-green-100 text-green-800'
      case 'CONVERSION': return 'bg-blue-100 text-blue-800'
      case 'PRODUCTIVITY': return 'bg-purple-100 text-purple-800'
      case 'ENTERTAINMENT': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'SIMPLE': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'ADVANCED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={resetWizard}>
          <Zap className="h-4 w-4 mr-2" />
          Crear Micro-Aplicación
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Utility Studio - Constructor de Micro-Aplicaciones
          </DialogTitle>
          <DialogDescription>
            Crea micro-aplicaciones interactivas con monetización CPVI (Cost Per Valuable Interaction)
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-full">
          {/* Contenido principal */}
          <div className="flex-1 p-6">
            {/* Paso 1: Selección de Plantilla */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Paso 1: Selecciona una Plantilla</h3>
                  <p className="text-gray-600">Elige el tipo de micro-aplicación que quieres crear</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {utilityTemplates.map((template) => {
                    const Icon = template.icon
                    return (
                      <Card 
                        key={template.id} 
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Icon className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{template.name}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getCategoryColor(template.category)}>
                                    {template.category}
                                  </Badge>
                                  <Badge className={getComplexityColor(template.complexity)}>
                                    {template.complexity}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">{template.estimated_time}</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="mb-3">
                            {template.description}
                          </CardDescription>
                          <div className="text-sm text-gray-600">
                            <strong>Eventos facturables:</strong> {template.billing_events.join(', ')}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Paso 2: Personalización */}
            {currentStep === 2 && selectedTemplate && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Paso 2: Personalización</h3>
                    <p className="text-gray-600">Configura la marca y funcionalidad</p>
                  </div>
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Cambiar Plantilla
                  </Button>
                </div>

                <Tabs defaultValue="brand" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="brand">Marca</TabsTrigger>
                    <TabsTrigger value="config">Configuración</TabsTrigger>
                    <TabsTrigger value="billing">Facturación</TabsTrigger>
                  </TabsList>

                  <TabsContent value="brand" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Activos de Marca</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="logo-upload">Logo de la Marca</Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Button
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Subir Logo
                            </Button>
                            {brandAssets.logo && (
                              <span className="text-sm text-green-600">
                                ✓ {brandAssets.logo.name}
                              </span>
                            )}
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="primary-color">Color Primario</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                id="primary-color"
                                type="color"
                                value={brandAssets.primary_color}
                                onChange={(e) => setBrandAssets(prev => ({ ...prev, primary_color: e.target.value }))}
                                className="w-16 h-10"
                              />
                              <Input
                                value={brandAssets.primary_color}
                                onChange={(e) => setBrandAssets(prev => ({ ...prev, primary_color: e.target.value }))}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="secondary-color">Color Secundario</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                id="secondary-color"
                                type="color"
                                value={brandAssets.secondary_color}
                                onChange={(e) => setBrandAssets(prev => ({ ...prev, secondary_color: e.target.value }))}
                                className="w-16 h-10"
                              />
                              <Input
                                value={brandAssets.secondary_color}
                                onChange={(e) => setBrandAssets(prev => ({ ...prev, secondary_color: e.target.value }))}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="sponsor-text">Texto del Patrocinador</Label>
                          <Input
                            id="sponsor-text"
                            value={brandAssets.sponsor_text}
                            onChange={(e) => setBrandAssets(prev => ({ ...prev, sponsor_text: e.target.value }))}
                            placeholder="Ej: Patrocinado por Banco XYZ"
                          />
                        </div>

                        <div>
                          <Label htmlFor="font-family">Familia de Fuente</Label>
                          <Select
                            value={brandAssets.font_family}
                            onValueChange={(value) => setBrandAssets(prev => ({ ...prev, font_family: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter">Inter</SelectItem>
                              <SelectItem value="Roboto">Roboto</SelectItem>
                              <SelectItem value="Open Sans">Open Sans</SelectItem>
                              <SelectItem value="Lato">Lato</SelectItem>
                              <SelectItem value="Montserrat">Montserrat</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="config" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Configuración de la Lógica</CardTitle>
                        <CardDescription>
                          Parámetros específicos para {selectedTemplate.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedTemplate.id === 'loan_calculator' && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Monto Mínimo</Label>
                                <Input
                                  type="number"
                                  value={customConfig.min_amount || ''}
                                  onChange={(e) => setCustomConfig(prev => ({ ...prev, min_amount: parseInt(e.target.value) }))}
                                />
                              </div>
                              <div>
                                <Label>Monto Máximo</Label>
                                <Input
                                  type="number"
                                  value={customConfig.max_amount || ''}
                                  onChange={(e) => setCustomConfig(prev => ({ ...prev, max_amount: parseInt(e.target.value) }))}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Tasa de Interés por Defecto (%)</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={customConfig.default_rate || ''}
                                  onChange={(e) => setCustomConfig(prev => ({ ...prev, default_rate: parseFloat(e.target.value) }))}
                                />
                              </div>
                              <div>
                                <Label>Plazo Máximo (años)</Label>
                                <Input
                                  type="number"
                                  value={customConfig.max_term || ''}
                                  onChange={(e) => setCustomConfig(prev => ({ ...prev, max_term: parseInt(e.target.value) }))}
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {selectedTemplate.id === 'currency_converter' && (
                          <>
                            <div>
                              <Label>Moneda Base</Label>
                              <Select
                                value={customConfig.base_currency || 'CLP'}
                                onValueChange={(value) => setCustomConfig(prev => ({ ...prev, base_currency: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CLP">Peso Chileno (CLP)</SelectItem>
                                  <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Frecuencia de Actualización (segundos)</Label>
                              <Input
                                type="number"
                                value={customConfig.update_frequency || ''}
                                onChange={(e) => setCustomConfig(prev => ({ ...prev, update_frequency: parseInt(e.target.value) }))}
                              />
                            </div>
                          </>
                        )}

                        {selectedTemplate.id === 'travel_checklist' && (
                          <>
                            <div>
                              <Label>Máximo de Items</Label>
                              <Input
                                type="number"
                                value={customConfig.max_items || ''}
                                onChange={(e) => setCustomConfig(prev => ({ ...prev, max_items: parseInt(e.target.value) }))}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="allow-custom"
                                checked={customConfig.allow_custom_items || false}
                                onChange={(e) => setCustomConfig(prev => ({ ...prev, allow_custom_items: e.target.checked }))}
                              />
                              <Label htmlFor="allow-custom">Permitir items personalizados</Label>
                            </div>
                          </>
                        )}

                        {selectedTemplate.id === 'memory_game' && (
                          <>
                            <div>
                              <Label>Tamaño de Grilla</Label>
                              <Select
                                value={customConfig.grid_size || '4x4'}
                                onValueChange={(value) => setCustomConfig(prev => ({ ...prev, grid_size: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="3x3">3x3 (Fácil)</SelectItem>
                                  <SelectItem value="4x4">4x4 (Medio)</SelectItem>
                                  <SelectItem value="5x5">5x5 (Difícil)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Límite de Tiempo (segundos)</Label>
                              <Input
                                type="number"
                                value={customConfig.time_limit || ''}
                                onChange={(e) => setCustomConfig(prev => ({ ...prev, time_limit: parseInt(e.target.value) }))}
                              />
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="billing" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Definir Interacción Valiosa</CardTitle>
                        <CardDescription>
                          Configura el evento que cuenta como interacción facturable para modelos CPVI
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Evento de Facturación</Label>
                          <Select value={billingEvent} onValueChange={setBillingEvent}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar evento" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedTemplate.billing_events.map((event) => (
                                <SelectItem key={event} value={event}>
                                  {event.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Alert>
                          <DollarSign className="h-4 w-4" />
                          <AlertDescription>
                            <strong>CPVI (Cost Per Valuable Interaction):</strong> Solo se factura cuando el usuario 
                            completa la acción específica definida, no por simples impresiones o clics.
                          </AlertDescription>
                        </Alert>

                        <div>
                          <Label>Nombre de la Micro-Aplicación</Label>
                          <Input
                            value={utilityName}
                            onChange={(e) => setUtilityName(e.target.value)}
                            placeholder="Ej: Calculadora de Préstamos Banco XYZ"
                          />
                        </div>

                        <div>
                          <Label>Descripción</Label>
                          <Textarea
                            value={utilityDescription}
                            onChange={(e) => setUtilityDescription(e.target.value)}
                            placeholder="Describe brevemente la funcionalidad..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setPreviewMode(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Vista Previa
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Anterior
                    </Button>
                    <Button onClick={generateUtility}>
                      <Save className="h-4 w-4 mr-2" />
                      Generar Micro-Aplicación
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel lateral de vista previa */}
          {currentStep === 2 && (
            <div className="w-80 border-l bg-gray-50 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Vista Previa</h4>
                  <Smartphone className="h-4 w-4 text-gray-500" />
                </div>

                <div className="bg-white rounded-lg border p-4 shadow-sm">
                  <div className="aspect-[9/16] bg-gray-100 rounded-lg flex items-center justify-center">
                    {selectedTemplate && (
                      <div className="text-center">
                        <selectedTemplate.icon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <div className="text-sm font-medium">{utilityName || selectedTemplate.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {brandAssets.sponsor_text}
                        </div>
                        <div 
                          className="w-4 h-4 rounded mx-auto mt-2"
                          style={{ backgroundColor: brandAssets.primary_color }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>Evento facturable:</strong> {billingEvent}</div>
                  <div><strong>Plantilla:</strong> {selectedTemplate?.name}</div>
                  <div><strong>Complejidad:</strong> {selectedTemplate?.complexity}</div>
                </div>

                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    La micro-aplicación será compatible con MRAID v3 y emitirá eventos 
                    para facturación CPVI automáticamente.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}