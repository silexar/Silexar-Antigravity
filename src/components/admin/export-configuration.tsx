/**
 * MÓDULO 1.3: CONFIGURACIÓN DE EXPORTACIÓN - TIER 0 Fortune 10
 * 
 * @description Constructor visual de formatos de playout con plantillas
 * predefinidas, validador automático y exportación de configuraciones
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 * @classification ENTERPRISE_SECURITY
 * @security_level MILITARY_GRADE
 * 
 * @author Silexar Development Team - Export Configuration Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  Download, 
  Upload, 
  Settings, 
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Edit,
  Trash2,
  Plus,
  Code,
  Database,
  Radio,
  Tv,
  Music,
  Headphones,
  Server,
  Wifi,
  HardDrive,
  Clock,
  Calendar,
  Hash,
  Type,
  BarChart3
} from 'lucide-react'

/**
 * Interfaces para Configuración de Exportación
 */
interface ExportTemplate {
  id: string
  name: string
  description: string
  system: 'dalet' | 'sara' | 'wideorbit' | 'rcs' | 'marketron' | 'nexgen' | 'radiotraffic' | 'custom'
  version: string
  format: 'xml' | 'csv' | 'json' | 'txt' | 'binary'
  fields: ExportField[]
  settings: ExportSettings
  validation: ValidationRule[]
  isActive: boolean
  isSystem: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  usageCount: number
}

interface ExportField {
  id: string
  name: string
  label: string
  type: 'string' | 'number' | 'date' | 'time' | 'datetime' | 'boolean' | 'enum'
  required: boolean
  maxLength?: number
  format?: string
  defaultValue?: string | number | boolean
  mapping: string
  position: number
  validation?: FieldValidation
}

interface FieldValidation {
  pattern?: string
  min?: number
  max?: number
  options?: string[]
  customRule?: string
}

interface ExportSettings {
  delimiter?: string
  encoding: 'utf-8' | 'iso-8859-1' | 'windows-1252'
  dateFormat: string
  timeFormat: string
  numberFormat: string
  booleanFormat: { true: string; false: string }
  headerRow: boolean
  footerTemplate?: string
  compression: 'none' | 'zip' | 'gzip'
  encryption: boolean
  ftpSettings?: FTPSettings
}

interface FTPSettings {
  host: string
  port: number
  username: string
  password: string
  path: string
  passive: boolean
  secure: boolean
}

interface ValidationRule {
  id: string
  field: string
  rule: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

interface TestResult {
  success: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  sampleOutput: string
  executionTime: number
  recordsProcessed: number
}

interface ValidationError {
  field: string
  message: string
  line?: number
  value?: string | number | boolean
}

interface ExportConfigurationProps {
  tenantId: string
}

/**
 * Configuración de Exportación
 */
export function ExportConfiguration({ tenantId }: ExportConfigurationProps) {
  const [activeTab, setActiveTab] = useState('templates')
  const [templates, setTemplates] = useState<ExportTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [isTestingTemplate, setIsTestingTemplate] = useState(false)

  // Cargar plantillas
  useEffect(() => {
    loadTemplates()
  }, [tenantId])

  /**
   * Cargar plantillas de exportación
   */
  const loadTemplates = async () => {
    const mockTemplates: ExportTemplate[] = [
      {
        id: 'template_001',
        name: 'Dalet Galaxy Standard',
        description: 'Formato estándar para exportación a Dalet Galaxy',
        system: 'dalet',
        version: '10.2',
        format: 'xml',
        fields: [
          {
            id: 'field_001',
            name: 'spot_id',
            label: 'ID del Spot',
            type: 'string',
            required: true,
            maxLength: 20,
            mapping: 'campaign.spots[].id',
            position: 1
          },
          {
            id: 'field_002',
            name: 'title',
            label: 'Título',
            type: 'string',
            required: true,
            maxLength: 100,
            mapping: 'campaign.spots[].title',
            position: 2
          },
          {
            id: 'field_003',
            name: 'duration',
            label: 'Duración',
            type: 'number',
            required: true,
            format: '00:00:00',
            mapping: 'campaign.spots[].duration',
            position: 3
          },
          {
            id: 'field_004',
            name: 'start_date',
            label: 'Fecha Inicio',
            type: 'date',
            required: true,
            format: 'YYYY-MM-DD',
            mapping: 'campaign.startDate',
            position: 4
          },
          {
            id: 'field_005',
            name: 'end_date',
            label: 'Fecha Fin',
            type: 'date',
            required: true,
            format: 'YYYY-MM-DD',
            mapping: 'campaign.endDate',
            position: 5
          }
        ],
        settings: {
          encoding: 'utf-8',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: 'HH:mm:ss',
          numberFormat: '0.00',
          booleanFormat: { true: '1', false: '0' },
          headerRow: true,
          compression: 'none',
          encryption: false
        },
        validation: [
          {
            id: 'val_001',
            field: 'duration',
            rule: 'duration > 0 && duration <= 300',
            message: 'La duración debe estar entre 1 y 300 segundos',
            severity: 'error'
          },
          {
            id: 'val_002',
            field: 'start_date',
            rule: 'start_date <= end_date',
            message: 'La fecha de inicio debe ser anterior a la fecha de fin',
            severity: 'error'
          }
        ],
        isActive: true,
        isSystem: true,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        usageCount: 1247
      },
      {
        id: 'template_002',
        name: 'WideOrbit Traffic',
        description: 'Formato para integración con WideOrbit Traffic',
        system: 'wideorbit',
        version: '6.5',
        format: 'csv',
        fields: [
          {
            id: 'field_006',
            name: 'cart_number',
            label: 'Número de Cart',
            type: 'string',
            required: true,
            maxLength: 10,
            mapping: 'campaign.spots[].cartNumber',
            position: 1
          },
          {
            id: 'field_007',
            name: 'advertiser',
            label: 'Anunciante',
            type: 'string',
            required: true,
            maxLength: 50,
            mapping: 'campaign.advertiser.name',
            position: 2
          },
          {
            id: 'field_008',
            name: 'length',
            label: 'Duración',
            type: 'string',
            required: true,
            format: 'MM:SS',
            mapping: 'campaign.spots[].duration',
            position: 3
          }
        ],
        settings: {
          delimiter: ',',
          encoding: 'utf-8',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: 'HH:mm:ss',
          numberFormat: '0.00',
          booleanFormat: { true: 'Y', false: 'N' },
          headerRow: true,
          compression: 'zip',
          encryption: false
        },
        validation: [
          {
            id: 'val_003',
            field: 'cart_number',
            rule: 'cart_number.match(/^[A-Z0-9]{1,10}$/)',
            message: 'El número de cart debe contener solo letras y números',
            severity: 'error'
          }
        ],
        isActive: true,
        isSystem: true,
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        usageCount: 856
      },
      {
        id: 'template_003',
        name: 'Custom Radio Station',
        description: 'Plantilla personalizada para radio local',
        system: 'custom',
        version: '1.0',
        format: 'json',
        fields: [
          {
            id: 'field_009',
            name: 'id',
            label: 'ID',
            type: 'string',
            required: true,
            mapping: 'campaign.id',
            position: 1
          },
          {
            id: 'field_010',
            name: 'name',
            label: 'Nombre',
            type: 'string',
            required: true,
            mapping: 'campaign.name',
            position: 2
          }
        ],
        settings: {
          encoding: 'utf-8',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: 'HH:mm:ss',
          numberFormat: '0.00',
          booleanFormat: { true: 'true', false: 'false' },
          headerRow: false,
          compression: 'none',
          encryption: true
        },
        validation: [],
        isActive: false,
        isSystem: false,
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: new Date().toISOString(),
        createdBy: 'user_001',
        usageCount: 23
      }
    ]
    setTemplates(mockTemplates)
  }

  /**
   * Obtener icono por sistema
   */
  const getSystemIcon = (system: string) => {
    switch (system) {
      case 'dalet': return <Database className="h-4 w-4" />
      case 'wideorbit': return <Radio className="h-4 w-4" />
      case 'sara': return <Tv className="h-4 w-4" />
      case 'rcs': return <Music className="h-4 w-4" />
      case 'marketron': return <BarChart3 className="h-4 w-4" />
      case 'nexgen': return <Headphones className="h-4 w-4" />
      case 'radiotraffic': return <Wifi className="h-4 w-4" />
      default: return <Server className="h-4 w-4" />
    }
  }

  /**
   * Obtener color por formato
   */
  const getFormatColor = (format: string) => {
    switch (format) {
      case 'xml': return 'border-blue-400 text-blue-400'
      case 'csv': return 'border-green-400 text-green-400'
      case 'json': return 'border-purple-400 text-purple-400'
      case 'txt': return 'border-yellow-400 text-yellow-400'
      case 'binary': return 'border-red-400 text-red-400'
      default: return 'border-gray-400 text-gray-400'
    }
  }

  /**
   * Obtener icono por tipo de campo
   */
  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'string': return <Type className="h-4 w-4" />
      case 'number': return <Hash className="h-4 w-4" />
      case 'date': return <Calendar className="h-4 w-4" />
      case 'time': return <Clock className="h-4 w-4" />
      case 'datetime': return <Clock className="h-4 w-4" />
      case 'boolean': return <CheckCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  /**
   * Probar plantilla
   */
  const testTemplate = async (template: ExportTemplate) => {
    setIsTestingTemplate(true)
    setTestResult(null)

    // Simulación de prueba
    await new Promise(resolve => setTimeout(resolve, 2000))

    const mockResult: TestResult = {
      success: true,
      errors: [],
      warnings: [
        {
          field: 'duration',
          message: 'Algunos registros tienen duración mayor a 180 segundos',
          line: 15
        }
      ],
      sampleOutput: template.format === 'xml' 
        ? `<?xml version="1.0" encoding="UTF-8"?>
<playlist>
  <spot id="SP001" title="Campaña Verano 2025" duration="30" start_date="2025-02-10" end_date="2025-02-28"/>
  <spot id="SP002" title="Promoción Especial" duration="20" start_date="2025-02-10" end_date="2025-02-28"/>
</playlist>`
        : template.format === 'csv'
        ? `cart_number,advertiser,length
SP001,"Acme Corp","00:30"
SP002,"Tech Solutions","00:20"`
        : `{
  "spots": [
    {"id": "SP001", "name": "Campaña Verano 2025"},
    {"id": "SP002", "name": "Promoción Especial"}
  ]
}`,
      executionTime: 1.2,
      recordsProcessed: 150
    }

    setTestResult(mockResult)
    setIsTestingTemplate(false)
  }

  /**
   * Crear nueva plantilla
   */
  const createNewTemplate = () => {
    const newTemplate: ExportTemplate = {
      id: `template_${Date.now()}`,
      name: 'Nueva Plantilla',
      description: 'Plantilla personalizada',
      system: 'custom',
      version: '1.0',
      format: 'csv',
      fields: [],
      settings: {
        encoding: 'utf-8',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
        numberFormat: '0.00',
        booleanFormat: { true: '1', false: '0' },
        headerRow: true,
        compression: 'none',
        encryption: false
      },
      validation: [],
      isActive: false,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current_user',
      usageCount: 0
    }
    setSelectedTemplate(newTemplate)
    setIsEditing(true)
    setActiveTab('editor')
  }

  /**
   * Guardar plantilla
   */
  const saveTemplate = () => {
    if (selectedTemplate) {
      const existingIndex = templates.findIndex(t => t.id === selectedTemplate.id)
      if (existingIndex >= 0) {
        const updatedTemplates = [...templates]
        updatedTemplates[existingIndex] = {
          ...selectedTemplate,
          updatedAt: new Date().toISOString()
        }
        setTemplates(updatedTemplates)
      } else {
        setTemplates([...templates, selectedTemplate])
      }
      setIsEditing(false)
    }
  }

  /**
   * Exportar plantilla
   */
  const exportTemplate = (template: ExportTemplate) => {
    const dataStr = JSON.stringify(template, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${template.name.replace(/\s+/g, '_')}_template.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            📤 Configuración de Exportación
          </h2>
          <p className="text-slate-300">
            Constructor visual de formatos de playout y validación automática
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-green-400 border-green-400">
            {templates.filter(t => t.isActive).length} Activas
          </Badge>
          <Button className="bg-green-600 hover:bg-green-700" onClick={createNewTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Plantilla
          </Button>
        </div>
      </div>

      {/* KPIs de Exportación */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Plantillas Totales</CardTitle>
            <FileText className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {templates.length}
            </div>
            <p className="text-xs text-slate-400">
              {templates.filter(t => t.isSystem).length} del sistema
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Sistemas Soportados</CardTitle>
            <Server className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Set(templates.map(t => t.system)).size}
            </div>
            <p className="text-xs text-slate-400">
              Plataformas integradas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Exportaciones</CardTitle>
            <Download className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {templates.reduce((sum, t) => sum + t.usageCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">
              Total histórico
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Formatos</CardTitle>
            <Code className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Set(templates.map(t => t.format)).size}
            </div>
            <p className="text-xs text-slate-400">
              Tipos soportados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
          <TabsTrigger value="templates" className="data-[state=active]:bg-blue-600">
            <FileText className="h-4 w-4 mr-2" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="editor" className="data-[state=active]:bg-green-600">
            <Edit className="h-4 w-4 mr-2" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="testing" className="data-[state=active]:bg-purple-600">
            <Play className="h-4 w-4 mr-2" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="systems" className="data-[state=active]:bg-orange-600">
            <Server className="h-4 w-4 mr-2" />
            Sistemas
          </TabsTrigger>
        </TabsList>

        {/* Tab Plantillas */}
        <TabsContent value="templates" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                Plantillas de Exportación
              </CardTitle>
              <CardDescription className="text-slate-400">
                Gestión de formatos de playout para diferentes sistemas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div 
                    key={template.id}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-slate-600 rounded-lg">
                        {getSystemIcon(template.system)}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-medium text-lg">
                            {template.name}
                          </h3>
                          <Badge 
                            variant="outline"
                            className={getFormatColor(template.format)}
                          >
                            {template.format.toUpperCase()}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={template.isActive ? 'border-green-500 text-green-400' : 'border-gray-500 text-gray-400'}
                          >
                            {template.isActive ? 'Activa' : 'Inactiva'}
                          </Badge>
                          {template.isSystem && (
                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                              Sistema
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">
                          {template.description} • v{template.version}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                          <span>{template.fields.length} campos</span>
                          <span>{template.validation.length} validaciones</span>
                          <span>{template.usageCount} usos</span>
                          <span>Actualizado: {new Date(template.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                        onClick={() => testTemplate(template)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Probar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-green-500 text-green-400 hover:bg-green-500/10"
                        onClick={() => {
                          setSelectedTemplate(template)
                          setIsEditing(false)
                          setActiveTab('editor')
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                        onClick={() => exportTemplate(template)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Exportar
                      </Button>
                      {!template.isSystem && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Editor */}
        <TabsContent value="editor" className="space-y-6">
          {selectedTemplate ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuración General */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-green-400" />
                    Configuración General
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Nombre</Label>
                    <Input 
                      value={selectedTemplate.name}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        name: e.target.value
                      })}
                      className="bg-slate-700 border-slate-600"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Descripción</Label>
                    <Textarea 
                      value={selectedTemplate.description}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        description: e.target.value
                      })}
                      className="bg-slate-700 border-slate-600"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Sistema</Label>
                      <Select 
                        value={selectedTemplate.system}
                        onValueChange={(value: ExportTemplate['system']) => setSelectedTemplate({
                          ...selectedTemplate,
                          system: value
                        })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dalet">Dalet Galaxy</SelectItem>
                          <SelectItem value="wideorbit">WideOrbit</SelectItem>
                          <SelectItem value="sara">Sara Automation</SelectItem>
                          <SelectItem value="rcs">RCS Zetta</SelectItem>
                          <SelectItem value="marketron">Marketron</SelectItem>
                          <SelectItem value="nexgen">NexGen Digital</SelectItem>
                          <SelectItem value="radiotraffic">RadioTraffic</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Formato</Label>
                      <Select 
                        value={selectedTemplate.format}
                        onValueChange={(value: ExportTemplate['format']) => setSelectedTemplate({
                          ...selectedTemplate,
                          format: value
                        })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xml">XML</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="txt">TXT</SelectItem>
                          <SelectItem value="binary">Binary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Plantilla Activa</Label>
                    <Switch 
                      checked={selectedTemplate.isActive}
                      onCheckedChange={(checked) => setSelectedTemplate({
                        ...selectedTemplate,
                        isActive: checked
                      })}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Campos de Exportación */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-400" />
                      Campos de Exportación
                    </CardTitle>
                    {isEditing && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Campo
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedTemplate.fields.map((field, index) => (
                      <div 
                        key={field.id}
                        className="p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getFieldTypeIcon(field.type)}
                            <h4 className="text-white font-medium text-sm">
                              {field.label}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {field.type}
                            </Badge>
                            {field.required && (
                              <Badge variant="outline" className="border-red-400 text-red-400 text-xs">
                                Requerido
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 text-xs">
                              Pos: {field.position}
                            </span>
                            {isEditing && (
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">
                          <p>Nombre: <code className="text-blue-400">{field.name}</code></p>
                          <p>Mapeo: <code className="text-green-400">{field.mapping}</code></p>
                          {field.format && (
                            <p>Formato: <code className="text-purple-400">{field.format}</code></p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="text-center py-12">
                <Edit className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-400 mb-2">
                  Editor de Plantillas
                </h3>
                <p className="text-slate-500 mb-4">
                  Selecciona una plantilla para editar o crea una nueva
                </p>
                <Button className="bg-green-600 hover:bg-green-700" onClick={createNewTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Plantilla
                </Button>
              </CardContent>
            </Card>
          )}
          
          {selectedTemplate && (
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <XCircle className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
              {isEditing && (
                <Button className="bg-green-600 hover:bg-green-700" onClick={saveTemplate}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tab Testing */}
        <TabsContent value="testing" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Play className="h-5 w-5 text-purple-400" />
                Validador de Plantillas
              </CardTitle>
              <CardDescription className="text-slate-400">
                Prueba automática de formatos con datos de muestra
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isTestingTemplate ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                  <p className="text-slate-400">Ejecutando validación...</p>
                </div>
              ) : testResult ? (
                <div className="space-y-6">
                  {/* Resultado de la Prueba */}
                  <div className={`p-4 rounded-lg border ${
                    testResult.success ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {testResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <h4 className={`font-medium ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                        {testResult.success ? 'Validación Exitosa' : 'Validación Fallida'}
                      </h4>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Tiempo:</span>
                        <span className="text-white ml-2">{testResult.executionTime}s</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Registros:</span>
                        <span className="text-white ml-2">{testResult.recordsProcessed}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Errores:</span>
                        <span className={`ml-2 ${testResult.errors.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {testResult.errors.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Errores y Advertencias */}
                  {(testResult.errors.length > 0 || testResult.warnings.length > 0) && (
                    <div className="space-y-3">
                      {testResult.errors.map((error, index) => (
                        <div key={index} className="p-3 border border-red-500 bg-red-500/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-400" />
                            <span className="text-red-400 font-medium">Error</span>
                            {error.line && (
                              <Badge variant="outline" className="border-red-400 text-red-400">
                                Línea {error.line}
                              </Badge>
                            )}
                          </div>
                          <p className="text-red-300 text-sm mt-1">
                            Campo: {error.field} - {error.message}
                          </p>
                        </div>
                      ))}
                      
                      {testResult.warnings.map((warning, index) => (
                        <div key={index} className="p-3 border border-yellow-500 bg-yellow-500/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            <span className="text-yellow-400 font-medium">Advertencia</span>
                            {warning.line && (
                              <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                                Línea {warning.line}
                              </Badge>
                            )}
                          </div>
                          <p className="text-yellow-300 text-sm mt-1">
                            Campo: {warning.field} - {warning.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Salida de Muestra */}
                  <Card className="bg-slate-700/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Code className="h-5 w-5 text-blue-400" />
                        Salida de Muestra
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm text-slate-300 bg-slate-800 p-4 rounded-lg overflow-x-auto">
                        {testResult.sampleOutput}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Play className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-400 mb-2">
                    Validador de Plantillas
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Selecciona una plantilla desde la pestaña "Plantillas" y haz clic en "Probar"
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('templates')}
                  >
                    Ver Plantillas
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Sistemas */}
        <TabsContent value="systems" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'dalet', name: 'Dalet Galaxy', icon: Database, color: 'blue', description: 'Sistema de automatización broadcast profesional' },
              { id: 'wideorbit', name: 'WideOrbit', icon: Radio, color: 'green', description: 'Plataforma de gestión de tráfico de radio' },
              { id: 'sara', name: 'Sara Automation', icon: Tv, color: 'purple', description: 'Automatización para radio y televisión' },
              { id: 'rcs', name: 'RCS Zetta', icon: Music, color: 'red', description: 'Sistema de automatización de radio' },
              { id: 'marketron', name: 'Marketron', icon: BarChart3, color: 'yellow', description: 'Gestión de ventas y tráfico' },
              { id: 'nexgen', name: 'NexGen Digital', icon: Headphones, color: 'pink', description: 'Automatización digital avanzada' }
            ].map((system) => {
              const Icon = system.icon
              const systemTemplates = templates.filter(t => t.system === system.id)
              
              return (
                <Card key={system.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-${system.color}-600 rounded-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">
                          {system.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {systemTemplates.length} plantillas
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm mb-4">
                      {system.description}
                    </p>
                    <div className="space-y-2">
                      {systemTemplates.slice(0, 3).map((template) => (
                        <div key={template.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                          <span className="text-slate-300 text-sm">{template.name}</span>
                          <Badge 
                            variant="outline"
                            className={getFormatColor(template.format)}
                          >
                            {template.format}
                          </Badge>
                        </div>
                      ))}
                      {systemTemplates.length > 3 && (
                        <p className="text-slate-500 text-xs text-center">
                          +{systemTemplates.length - 3} más
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}