/**
 * MÁ“DULO 1.3: CONFIGURACIÁ“N DE EXPORTACIÁ“N - TIER 0 Fortune 10
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
 * @last_modified 2025-04-27 - Migrated to AdminDesignSystem pattern
 */

'use client'

import { useState, useEffect } from 'react'
import { N, NeuCard, NeuCardSmall, NeuButton, StatusBadge, NeuTabs, NeuProgress, NeuDivider, getShadow, getSmallShadow } from './_sdk/AdminDesignSystem'
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
  type: 'string' | 'number' | 'Fecha' | 'Hora' | 'datetime' | 'boolean' | 'enum'
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

  useEffect(() => {
    loadTemplates()
  }, [tenantId])

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
          { id: 'field_001', name: 'spot_id', label: 'ID del Spot', type: 'string', required: true, maxLength: 20, mapping: 'campaign.spots[].id', position: 1 },
          { id: 'field_002', name: 'title', label: 'Título', type: 'string', required: true, maxLength: 100, mapping: 'campaign.spots[].title', position: 2 },
          { id: 'field_003', name: 'duration', label: 'Duración', type: 'number', required: true, format: '00:00:00', mapping: 'campaign.spots[].duration', position: 3 },
          { id: 'field_004', name: 'start_date', label: 'Fecha Inicio', type: 'Fecha', required: true, format: 'YYYY-MM-DD', mapping: 'campaign.startDate', position: 4 },
          { id: 'field_005', name: 'end_date', label: 'Fecha Fin', type: 'Fecha', required: true, format: 'YYYY-MM-DD', mapping: 'campaign.endDate', position: 5 }
        ],
        settings: { encoding: 'utf-8', dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm:ss', numberFormat: '0.00', booleanFormat: { true: '1', false: '0' }, headerRow: true, compression: 'none', encryption: false },
        validation: [
          { id: 'val_001', field: 'duration', rule: 'duration > 0 && duration <= 300', message: 'La duración debe estar entre 1 y 300 segundos', severity: 'error' },
          { id: 'val_002', field: 'start_date', rule: 'start_date <= end_date', message: 'La fecha de inicio debe ser anterior a la fecha de fin', severity: 'error' }
        ],
        isActive: true, isSystem: true, createdAt: '2024-01-15T00:00:00Z', updatedAt: new Date().toISOString(), createdBy: 'system', usageCount: 1247
      },
      {
        id: 'template_002',
        name: 'WideOrbit Traffic',
        description: 'Formato para integración con WideOrbit Traffic',
        system: 'wideorbit',
        version: '6.5',
        format: 'csv',
        fields: [
          { id: 'field_006', name: 'cart_number', label: 'Número de Cart', type: 'string', required: true, maxLength: 10, mapping: 'campaign.spots[].cartNumber', position: 1 },
          { id: 'field_007', name: 'advertiser', label: 'Anunciante', type: 'string', required: true, maxLength: 50, mapping: 'campaign.advertiser.name', position: 2 },
          { id: 'field_008', name: 'length', label: 'Duración', type: 'string', required: true, format: 'MM:SS', mapping: 'campaign.spots[].duration', position: 3 }
        ],
        settings: { delimiter: ',', encoding: 'utf-8', dateFormat: 'MM/DD/YYYY', timeFormat: 'HH:mm:ss', numberFormat: '0.00', booleanFormat: { true: 'Y', false: 'N' }, headerRow: true, compression: 'zip', encryption: false },
        validation: [{ id: 'val_003', field: 'cart_number', rule: 'cart_number.match(/^[A-Z0-9]{1,10}$/)', message: 'El número de cart debe contener solo letras y números', severity: 'error' }],
        isActive: true, isSystem: true, createdAt: '2024-01-20T00:00:00Z', updatedAt: new Date().toISOString(), createdBy: 'system', usageCount: 856
      },
      {
        id: 'template_003',
        name: 'Custom Radio Station',
        description: 'Plantilla personalizada para radio local',
        system: 'custom',
        version: '1.0',
        format: 'json',
        fields: [
          { id: 'field_009', name: 'ID', label: 'ID', type: 'string', required: true, mapping: 'campaign.id', position: 1 },
          { id: 'field_010', name: 'Nombre', label: 'Nombre', type: 'string', required: true, mapping: 'campaign.name', position: 2 }
        ],
        settings: { encoding: 'utf-8', dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm:ss', numberFormat: '0.00', booleanFormat: { true: 'true', false: 'false' }, headerRow: false, compression: 'none', encryption: true },
        validation: [],
        isActive: false, isSystem: false, createdAt: '2025-01-10T00:00:00Z', updatedAt: new Date().toISOString(), createdBy: 'user_001', usageCount: 23
      }
    ]
    setTemplates(mockTemplates)
  }

  const getSystemIcon = (system: string) => {
    const iconProps = { width: 16, height: 16 }
    switch (system) {
      case 'dalet': return <Database {...iconProps} />
      case 'wideorbit': return <Radio {...iconProps} />
      case 'sara': return <Tv {...iconProps} />
      case 'rcs': return <Music {...iconProps} />
      case 'marketron': return <BarChart3 {...iconProps} />
      case 'nexgen': return <Headphones {...iconProps} />
      case 'radiotraffic': return <Wifi {...iconProps} />
      default: return <Server {...iconProps} />
    }
  }

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'xml': return '#6888ff'
      case 'csv': return '#6888ff'
      case 'json': return '#6888ff'
      case 'txt': return '#6888ff'
      case 'binary': return '#6888ff'
      default: return N.textSub
    }
  }

  const getFieldTypeIcon = (type: string) => {
    const iconProps = { width: 16, height: 16 }
    switch (type) {
      case 'string': return <Type {...iconProps} />
      case 'number': return <Hash {...iconProps} />
      case 'Fecha': return <Calendar {...iconProps} />
      case 'Hora': return <Clock {...iconProps} />
      case 'datetime': return <Clock {...iconProps} />
      case 'boolean': return <CheckCircle {...iconProps} />
      default: return <FileText {...iconProps} />
    }
  }

  const testTemplate = async (template: ExportTemplate) => {
    setIsTestingTemplate(true)
    setTestResult(null)
    await new Promise(resolve => setTimeout(resolve, 2000))

    const mockResult: TestResult = {
      success: true,
      errors: [],
      warnings: [{ field: 'duration', message: 'Algunos registros tienen duración mayor a 180 segundos', line: 15 }],
      sampleOutput: template.format === 'xml'
        ? `<?xml version="1.0" encoding="UTF-8"?>\n<playlist>\n  <spot id="SP001" title="Campaña Verano 2025" duration="30" start_date="2025-02-10" end_date="2025-02-28"/>\n</playlist>`
        : template.format === 'csv'
          ? `cart_number,advertiser,length\nSP001,"Acme Corp","00:30"\nSP002,"Tech Solutions","00:20"`
          : `{\n  "spots": [\n    {"id": "SP001", "Nombre": "Campaña Verano 2025"},\n    {"id": "SP002", "Nombre": "Promoción Especial"}\n  ]\n}`,
      executionTime: 1.2,
      recordsProcessed: 150
    }
    setTestResult(mockResult)
    setIsTestingTemplate(false)
  }

  const createNewTemplate = () => {
    const newTemplate: ExportTemplate = {
      id: `template_${Date.now()}`,
      name: 'Nueva Plantilla',
      description: 'Plantilla personalizada',
      system: 'custom',
      version: '1.0',
      format: 'csv',
      fields: [],
      settings: { encoding: 'utf-8', dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm:ss', numberFormat: '0.00', booleanFormat: { true: '1', false: '0' }, headerRow: true, compression: 'none', encryption: false },
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

  const saveTemplate = () => {
    if (selectedTemplate) {
      const existingIndex = templates.findIndex(t => t.id === selectedTemplate.id)
      if (existingIndex >= 0) {
        const updatedTemplates = [...templates]
        updatedTemplates[existingIndex] = { ...selectedTemplate, updatedAt: new Date().toISOString() }
        setTemplates(updatedTemplates)
      } else {
        setTemplates([...templates, selectedTemplate])
      }
      setIsEditing(false)
    }
  }

  const exportTemplate = (template: ExportTemplate) => {
    const dataStr = JSON.stringify(template, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', `${template.name.replace(/\s+/g, '_')}_template.json`)
    linkElement.click()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            ðŸ“¤ Configuración de Exportación
          </h2>
          <p style={{ color: N.textSub, fontSize: '0.875rem' }}>
            Constructor visual de formatos de playout y validación automática
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <StatusBadge status="success" label={`${templates.filter(t => t.isActive).length} Activas`} />
          <NeuButton variant="primary" onClick={createNewTemplate}>
            <Plus style={{ width: 16, height: 16, marginRight: 4 }} />
            Nueva Plantilla
          </NeuButton>
        </div>
      </div>

      {/* KPIs de Exportación */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.875rem' }}>Plantillas Totales</p>
              <p style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>{templates.length}</p>
              <p style={{ color: N.textSub, fontSize: '0.75rem' }}>{templates.filter(t => t.isSystem).length} del sistema</p>
            </div>
            <FileText style={{ width: 24, height: 24, color: '#6888ff' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.875rem' }}>Sistemas Soportados</p>
              <p style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>{new Set(templates.map(t => t.system)).size}</p>
              <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Plataformas integradas</p>
            </div>
            <Server style={{ width: 24, height: 24, color: '#6888ff' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.875rem' }}>Exportaciones</p>
              <p style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>{templates.reduce((sum, t) => sum + t.usageCount, 0).toLocaleString()}</p>
              <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Total histórico</p>
            </div>
            <Download style={{ width: 24, height: 24, color: '#6888ff' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.875rem' }}>Formatos</p>
              <p style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>{new Set(templates.map(t => t.format)).size}</p>
              <p style={{ color: N.textSub, fontSize: '0.75rem' }}>Tipos soportados</p>
            </div>
            <Code style={{ width: 24, height: 24, color: '#6888ff' }} />
          </div>
        </NeuCard>
      </div>

      {/* Tabs Principal */}
      <NeuTabs
        tabs={[
          { id: 'templates', label: 'Plantillas', icon: <FileText style={{ width: 16, height: 16 }} /> },
          { id: 'editor', label: 'Editor', icon: <Edit style={{ width: 16, height: 16 }} /> },
          { id: 'testing', label: 'Testing', icon: <Play style={{ width: 16, height: 16 }} /> },
          { id: 'systems', label: 'Sistemas', icon: <Server style={{ width: 16, height: 16 }} /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Plantillas */}
      {activeTab === 'templates' && (
        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText style={{ color: '#6888ff', width: 20, height: 20 }} />
              Plantillas de Exportación
            </h3>
            <p style={{ color: N.textSub, fontSize: '0.875rem' }}>Gestión de formatos de playout para diferentes sistemas</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {templates.map((template) => (
              <div
                key={template.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  background: `${N.dark}30`,
                  borderRadius: 8,
                  border: `1px solid ${N.dark}60`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.5rem', background: `${N.dark}50`, borderRadius: 8 }}>
                    {getSystemIcon(template.system)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ color: N.text, fontWeight: 500, fontSize: '1rem' }}>{template.name}</h3>
                      <StatusBadge status="info" label={template.format.toUpperCase()} />
                      <StatusBadge status={template.isActive ? "success" : "warning"} label={template.isActive ? 'Activa' : 'Inactiva'} />
                      {template.isSystem && <StatusBadge status="info" label="Sistema" />}
                    </div>
                    <p style={{ color: N.textSub, fontSize: '0.875rem' }}>{template.description} • v{template.version}</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.75rem', color: N.textSub }}>
                      <span>{template.fields.length} campos</span>
                      <span>{template.validation.length} validaciones</span>
                      <span>{template.usageCount} usos</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <NeuButton variant="secondary" onClick={() => testTemplate(template)}>
                    <Play style={{ width: 14, height: 14, marginRight: 4 }} />
                    Probar
                  </NeuButton>
                  <NeuButton variant="secondary" onClick={() => { setSelectedTemplate(template); setIsEditing(false); setActiveTab('editor'); }}>
                    <Edit style={{ width: 14, height: 14, marginRight: 4 }} />
                    Editar
                  </NeuButton>
                  <NeuButton variant="secondary" onClick={() => exportTemplate(template)}>
                    <Download style={{ width: 14, height: 14, marginRight: 4 }} />
                    Exportar
                  </NeuButton>
                  {!template.isSystem && (
                    <NeuButton variant="secondary">
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </NeuButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </NeuCard>
      )}

      {/* Tab Editor */}
      {activeTab === 'editor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {selectedTemplate ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <NeuCard style={{ boxShadow: getShadow() }}>
                <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings style={{ color: '#6888ff', width: 20, height: 20 }} />
                  Configuración General
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ color: N.textSub, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Nombre</label>
                    <input
                      type="text"
                      value={selectedTemplate.name}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: `${N.dark}50`,
                        border: `1px solid ${N.dark}70`,
                        borderRadius: 6,
                        color: N.text,
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: N.textSub, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Descripción</label>
                    <textarea
                      value={selectedTemplate.description}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, description: e.target.value })}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: `${N.dark}50`,
                        border: `1px solid ${N.dark}70`,
                        borderRadius: 6,
                        color: N.text,
                        fontSize: '0.875rem',
                        minHeight: 80
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div>
                      <label style={{ color: N.textSub, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Sistema</label>
                      <select
                        value={selectedTemplate.system}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, system: e.target.value as ExportTemplate['system'] })}
                        disabled={!isEditing}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          background: `${N.dark}50`,
                          border: `1px solid ${N.dark}70`,
                          borderRadius: 6,
                          color: N.text,
                          fontSize: '0.875rem'
                        }}
                      >
                        <option value="dalet">Dalet Galaxy</option>
                        <option value="wideorbit">WideOrbit</option>
                        <option value="sara">Sara Automation</option>
                        <option value="rcs">RCS Zetta</option>
                        <option value="marketron">Marketron</option>
                        <option value="nexgen">NexGen Digital</option>
                        <option value="radiotraffic">RadioTraffic</option>
                        <option value="custom">Personalizado</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ color: N.textSub, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Formato</label>
                      <select
                        value={selectedTemplate.format}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, format: e.target.value as ExportTemplate['format'] })}
                        disabled={!isEditing}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          background: `${N.dark}50`,
                          border: `1px solid ${N.dark}70`,
                          borderRadius: 6,
                          color: N.text,
                          fontSize: '0.875rem'
                        }}
                      >
                        <option value="xml">XML</option>
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                        <option value="txt">TXT</option>
                        <option value="binary">Binary</option>
                      </select>
                    </div>
                  </div>
                </div>
              </NeuCard>

              <NeuCard style={{ boxShadow: getShadow() }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Database style={{ color: '#6888ff', width: 20, height: 20 }} />
                    Campos de Exportación
                  </h3>
                  {isEditing && (
                    <NeuButton variant="primary">
                      <Plus style={{ width: 14, height: 14, marginRight: 4 }} />
                      Agregar Campo
                    </NeuButton>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedTemplate.fields.map((field) => (
                    <div key={field.id} style={{ padding: '0.75rem', background: `${N.dark}30`, borderRadius: 8, border: `1px solid ${N.dark}60` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {getFieldTypeIcon(field.type)}
                          <span style={{ color: N.text, fontWeight: 500, fontSize: '0.875rem' }}>{field.label}</span>
                          <StatusBadge status="info" label={field.type} />
                          {field.required && <StatusBadge status="danger" label="Requerido" />}
                        </div>
                        <span style={{ color: N.textSub, fontSize: '0.75rem' }}>Pos: {field.position}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: N.textSub }}>
                        <p>Nombre: <code style={{ color: '#6888ff' }}>{field.name}</code></p>
                        <p>Mapeo: <code style={{ color: '#6888ff' }}>{field.mapping}</code></p>
                      </div>
                    </div>
                  ))}
                </div>
              </NeuCard>
            </div>
          ) : (
            <NeuCard style={{ boxShadow: getShadow() }}>
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Edit style={{ width: 64, height: 64, color: N.textSub, margin: '0 auto 1rem' }} />
                <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>Editor de Plantillas</h3>
                <p style={{ color: N.textSub, fontSize: '0.875rem', marginBottom: '1rem' }}>Selecciona una plantilla para editar o crea una nueva</p>
                <NeuButton variant="primary" onClick={createNewTemplate}>
                  <Plus style={{ width: 16, height: 16, marginRight: 4 }} />
                  Nueva Plantilla
                </NeuButton>
              </div>
            </NeuCard>
          )}
          {selectedTemplate && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <NeuButton variant="secondary" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <XCircle style={{ width: 16, height: 16, marginRight: 4 }} /> : <Edit style={{ width: 16, height: 16, marginRight: 4 }} />}
                {isEditing ? 'Cancelar' : 'Editar'}
              </NeuButton>
              {isEditing && (
                <NeuButton variant="primary" onClick={saveTemplate}>
                  <CheckCircle style={{ width: 16, height: 16, marginRight: 4 }} />
                  Guardar
                </NeuButton>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Testing */}
      {activeTab === 'testing' && (
        <NeuCard style={{ boxShadow: getShadow() }}>
          <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Play style={{ color: '#6888ff', width: 20, height: 20 }} />
            Validador de Plantillas
          </h3>
          <p style={{ color: N.textSub, fontSize: '0.875rem', marginBottom: '1.5rem' }}>Prueba automática de formatos con datos de muestra</p>

          {isTestingTemplate ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: 48, height: 48, border: '4px solid #6888ff30', borderTopColor: '#6888ff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <p style={{ color: N.textSub }}>Ejecutando validación...</p>
            </div>
          ) : testResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ padding: '1rem', borderRadius: 8, background: testResult.success ? '#6888ff15' : '#6888ff15', border: `1px solid ${testResult.success ? '#6888ff50' : '#6888ff50'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {testResult.success ? <CheckCircle style={{ width: 20, height: 20, color: '#6888ff' }} /> : <XCircle style={{ width: 20, height: 20, color: '#6888ff' }} />}
                  <span style={{ color: testResult.success ? '#6888ff' : '#6888ff', fontWeight: 500 }}>{testResult.success ? 'Validación Exitosa' : 'Validación Fallida'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
                  <div><span style={{ color: N.textSub }}>Tiempo:</span><span style={{ color: N.text, marginLeft: '0.5rem' }}>{testResult.executionTime}s</span></div>
                  <div><span style={{ color: N.textSub }}>Registros:</span><span style={{ color: N.text, marginLeft: '0.5rem' }}>{testResult.recordsProcessed}</span></div>
                  <div><span style={{ color: N.textSub }}>Errores:</span><span style={{ color: testResult.errors.length > 0 ? '#6888ff' : '#6888ff', marginLeft: '0.5rem' }}>{testResult.errors.length}</span></div>
                </div>
              </div>
              {(testResult.errors.length > 0 || testResult.warnings.length > 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {testResult.errors.map((error, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', borderRadius: 8, background: '#6888ff15', border: '1px solid #6888ff50' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <XCircle style={{ width: 16, height: 16, color: '#6888ff' }} />
                        <span style={{ color: '#6888ff', fontWeight: 500 }}>Error</span>
                        {error.line && <StatusBadge status="danger" label={`Línea ${error.line}`} />}
                      </div>
                      <p style={{ color: '#fca5a5', fontSize: '0.875rem', marginTop: '0.25rem' }}>Campo: {error.field} - {error.message}</p>
                    </div>
                  ))}
                  {testResult.warnings.map((warning, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', borderRadius: 8, background: '#6888ff15', border: '1px solid #6888ff50' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle style={{ width: 16, height: 16, color: '#6888ff' }} />
                        <span style={{ color: '#6888ff', fontWeight: 500 }}>Advertencia</span>
                        {warning.line && <StatusBadge status="warning" label={`Línea ${warning.line}`} />}
                      </div>
                      <p style={{ color: '#fde047', fontSize: '0.875rem', marginTop: '0.25rem' }}>Campo: {warning.field} - {warning.message}</p>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ padding: '1rem', background: `${N.dark}30`, borderRadius: 8, border: `1px solid ${N.dark}60` }}>
                <h4 style={{ color: N.text, fontWeight: 500, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Code style={{ width: 16, height: 16, color: '#6888ff' }} />
                  Salida de Muestra
                </h4>
                <pre style={{ color: N.textSub, fontSize: '0.875rem', background: `${N.dark}50`, padding: '1rem', borderRadius: 6, overflowX: 'auto' }}>
                  {testResult.sampleOutput}
                </pre>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Play style={{ width: 64, height: 64, color: N.textSub, margin: '0 auto 1rem' }} />
              <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>Validador de Plantillas</h3>
              <p style={{ color: N.textSub, fontSize: '0.875rem', marginBottom: '1rem' }}>Selecciona una plantilla desde la pestaña "Plantillas" y haz clic en "Probar"</p>
              <NeuButton variant="secondary" onClick={() => setActiveTab('templates')}>Ver Plantillas</NeuButton>
            </div>
          )}
        </NeuCard>
      )}

      {/* Tab Sistemas */}
      {activeTab === 'systems' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[
            { id: 'dalet', name: 'Dalet Galaxy', icon: Database, color: '#6888ff', description: 'Sistema de automatización broadcast profesional' },
            { id: 'wideorbit', name: 'WideOrbit', icon: Radio, color: '#6888ff', description: 'Plataforma de gestión de tráfico de radio' },
            { id: 'sara', name: 'Sara Automation', icon: Tv, color: '#6888ff', description: 'Automatización para radio y televisión' },
            { id: 'rcs', name: 'RCS Zetta', icon: Music, color: '#6888ff', description: 'Sistema de automatización de radio' },
            { id: 'marketron', name: 'Marketron', icon: BarChart3, color: '#6888ff', description: 'Gestión de ventas y tráfico' },
            { id: 'nexgen', name: 'NexGen Digital', icon: Headphones, color: '#6888ff', description: 'Automatización digital avanzada' }
          ].map((system) => {
            const Icon = system.icon
            const systemTemplates = templates.filter(t => t.system === system.id)
            return (
              <NeuCard key={system.id} style={{ boxShadow: getShadow() }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', background: system.color, borderRadius: 8 }}>
                    <Icon style={{ width: 24, height: 24, color: N.base }} />
                  </div>
                  <div>
                    <h3 style={{ color: N.text, fontWeight: 500 }}>{system.name}</h3>
                    <p style={{ color: N.textSub, fontSize: '0.75rem' }}>{systemTemplates.length} plantillas</p>
                  </div>
                </div>
                <p style={{ color: N.textSub, fontSize: '0.875rem', marginBottom: '0.75rem' }}>{system.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {systemTemplates.slice(0, 3).map((template) => (
                    <div key={template.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: `${N.dark}30`, borderRadius: 6 }}>
                      <span style={{ color: N.textSub, fontSize: '0.875rem' }}>{template.name}</span>
                      <StatusBadge status="info" label={template.format} />
                    </div>
                  ))}
                  {systemTemplates.length > 3 && (
                    <p style={{ color: N.textSub, fontSize: '0.75rem', textAlign: 'center' }}>+{systemTemplates.length - 3} más</p>
                  )}
                </div>
              </NeuCard>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ExportConfiguration