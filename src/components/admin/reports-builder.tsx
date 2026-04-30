'use client'

/**
 * ðŸ“Š SILEXAR PULSE - Custom Reports Builder
 * Generador de reportes personalizados
 * 
 * @description Sistema de reportes avanzado:
 * - Builder drag & drop
 * - Múltiples fuentes de datos
 * - Visualizaciones personalizadas
 * - Programación de reportes
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  FileText,
  BarChart3,
  PieChart,
  Table,
  Plus,
  Play,
  Download,
  Clock,
  Calendar,
  Database,
  Eye,
  Trash2,
  Copy,
  Settings
} from 'lucide-react'

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'table' | 'chart' | 'dashboard' | 'pdf'
  dataSources: string[]
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
  }
  lastRun?: Date
  status: 'draft' | 'published' | 'scheduled'
  createdBy: string
  createdAt: Date
}

interface DataSource {
  id: string
  name: string
  type: 'campaigns' | 'users' | 'revenue' | 'tenants' | 'security' | 'api'
  fields: string[]
}

export function ReportsBuilder() {
  const [reports, setReports] = useState<ReportTemplate[]>([])
  const [dataSources] = useState<DataSource[]>([
    { id: 'ds_campaigns', name: 'Campañas', type: 'campaigns', fields: ['id', 'nombre', 'impresiones', 'clicks', 'ctr', 'costo', 'conversiones'] },
    { id: 'ds_users', name: 'Usuarios', type: 'users', fields: ['id', 'email', 'rol', 'tenant', 'ultimoLogin', 'sesiones'] },
    { id: 'ds_revenue', name: 'Ingresos', type: 'revenue', fields: ['fecha', 'monto', 'tenant', 'plan', 'tipo'] },
    { id: 'ds_tenants', name: 'Tenants', type: 'tenants', fields: ['id', 'nombre', 'plan', 'usuarios', 'licenciaExpira'] },
    { id: 'ds_security', name: 'Seguridad', type: 'security', fields: ['evento', 'severidad', 'ip', 'usuario', 'timestamp'] },
    { id: 'ds_api', name: 'API Stats', type: 'api', fields: ['endpoint', 'requests', 'latencia', 'errores', 'fecha'] }
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setReports([
      {
        id: 'rpt_001',
        name: 'Reporte Ejecutivo Mensual',
        description: 'KPIs principales, revenue, usuarios activos y growth',
        type: 'dashboard',
        dataSources: ['ds_revenue', 'ds_users', 'ds_campaigns'],
        schedule: { frequency: 'monthly', recipients: ['ceo@silexar.com', 'board@silexar.com'] },
        lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'scheduled',
        createdBy: 'CEO',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'rpt_002',
        name: 'Performance de Campañas',
        description: 'Métricas detalladas de todas las campañas activas',
        type: 'table',
        dataSources: ['ds_campaigns'],
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'published',
        createdBy: 'CEO',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'rpt_003',
        name: 'Revenue por Tenant',
        description: 'Análisis de ingresos por cliente con proyecciones',
        type: 'chart',
        dataSources: ['ds_revenue', 'ds_tenants'],
        schedule: { frequency: 'weekly', recipients: ['sales@silexar.com'] },
        lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'scheduled',
        createdBy: 'CEO',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'rpt_004',
        name: 'Auditoría de Seguridad',
        description: 'Eventos de seguridad, amenazas y accesos',
        type: 'pdf',
        dataSources: ['ds_security'],
        schedule: { frequency: 'daily', recipients: ['security@silexar.com'] },
        lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000),
        status: 'scheduled',
        createdBy: 'CEO',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'rpt_005',
        name: 'Uso de API',
        description: 'Estadísticas de consumo de API por tenant',
        type: 'chart',
        dataSources: ['ds_api', 'ds_tenants'],
        status: 'draft',
        createdBy: 'CEO',
        createdAt: new Date()
      }
    ])

    setIsLoading(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'table': return <Table className="w-4 h-4 text-[#6888ff]" />
      case 'chart': return <BarChart3 className="w-4 h-4 text-[#6888ff]" />
      case 'dashboard': return <PieChart className="w-4 h-4 text-[#6888ff]" />
      case 'pdf': return <FileText className="w-4 h-4 text-[#6888ff]" />
      default: return <FileText className="w-4 h-4 text-[#9aa3b8]" />
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'published': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'scheduled': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'draft': return 'bg-slate-500/20 text-[#9aa3b8]'
      default: return 'bg-slate-500/20 text-[#9aa3b8]'
    }
  }

  const runReport = (report: ReportTemplate) => {

    setReports(prev => prev.map(r =>
      r.id === report.id ? { ...r, lastRun: new Date() } : r
    ))
  }

  const duplicateReport = (report: ReportTemplate) => {
    const newReport: ReportTemplate = {
      ...report,
      id: `rpt_${Date.now()}`,
      name: `${report.name} (Copia)`,
      status: 'draft',
      createdAt: new Date()
    }
    setReports(prev => [...prev, newReport])
  }

  const deleteReport = (id: string) => {
    if (confirm('¿Eliminar este reporte?')) {
      setReports(prev => prev.filter(r => r.id !== id))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Reports Builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#6888ff]" />
          Custom Reports Builder
        </h3>
        <NeuButton variant="primary" >
          <Plus className="w-4 h-4 mr-1" />
          Nuevo Reporte
        </NeuButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-[#dfeaff]/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#69738c]">{reports.length}</p>
          <p className="text-xs text-[#9aa3b8]">Total Reportes</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">
            {reports.filter(r => r.schedule).length}
          </p>
          <p className="text-xs text-[#9aa3b8]">Programados</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{dataSources.length}</p>
          <p className="text-xs text-[#9aa3b8]">Data Sources</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">
            {reports.filter(r => r.lastRun && (Date.now() - r.lastRun.getTime()) < 24 * 60 * 60 * 1000).length}
          </p>
          <p className="text-xs text-[#9aa3b8]">Ejecutados Hoy</p>
        </div>
      </div>

      {/* Data Sources */}
      <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
        <h4 className="text-sm text-[#9aa3b8] mb-3 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Fuentes de Datos Disponibles
        </h4>
        <div className="flex flex-wrap gap-2">
          {dataSources.map(ds => (
            <span key={ds.id} className="text-xs px-3 py-1.5 bg-[#dfeaff] text-[#69738c] rounded-lg flex items-center gap-1">
              <Database className="w-3 h-3 text-[#6888ff]" />
              {ds.name}
              <span className="text-[#9aa3b8]">({ds.fields.length} campos)</span>
            </span>
          ))}
        </div>
      </NeuCard>

      {/* Reports Grid */}
      <div className="grid grid-cols-2 gap-4">
        {reports.map(report => (
          <NeuCard
            key={report.id}
            style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}
            className={`cursor-pointer hover:border-[#6888ff]/30 transition-all ${selectedReport?.id === report.id ? 'ring-1 ring-purple-500/50' : ''}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getTypeIcon(report.type)}
                <span className="text-[#69738c] font-medium">{report.name}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(report.status)}`}>
                {report.status}
              </span>
            </div>

            <p className="text-sm text-[#9aa3b8] mb-3">{report.description}</p>

            <div className="flex items-center gap-2 mb-3">
              {report.dataSources.map(ds => {
                const source = dataSources.find(d => d.id === ds)
                return source ? (
                  <span key={ds} className="text-xs px-2 py-0.5 bg-[#dfeaff] text-[#69738c] rounded">
                    {source.name}
                  </span>
                ) : null
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-[#9aa3b8]">
              <div className="flex items-center gap-2">
                {report.schedule && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {report.schedule.frequency}
                  </span>
                )}
                {report.lastRun && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {report.lastRun.toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); runReport(report); }}
                  className="p-1.5 text-[#9aa3b8] hover:text-[#6888ff]"
                  title="Ejecutar"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); duplicateReport(report); }}
                  className="p-1.5 text-[#9aa3b8] hover:text-[#6888ff]"
                  title="Duplicar"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteReport(report.id); }}
                  className="p-1.5 text-[#9aa3b8] hover:text-[#6888ff]"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </NeuCard>
        ))}
      </div>

      {/* Preview Panel */}
      {selectedReport && (
        <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1.5rem', background: N.base }}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[#69738c] font-bold flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#6888ff]" />
              Preview: {selectedReport.name}
            </h4>
            <div className="flex items-center gap-2">
              <NeuButton variant="secondary" >
                <Settings className="w-4 h-4 mr-1" />
                Configurar
              </NeuButton>
              <NeuButton variant="primary" onClick={() => runReport(selectedReport)}>
                <Play className="w-4 h-4 mr-1" />
                Ejecutar Ahora
              </NeuButton>
              <NeuButton variant="secondary" >
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </NeuButton>
            </div>
          </div>

          {/* Preview Content */}
          <div className="p-8 bg-[#dfeaff]/30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              {getTypeIcon(selectedReport.type)}
              <p className="text-[#9aa3b8] mt-2">Vista previa de {selectedReport.type}</p>
              <p className="text-xs text-[#9aa3b8] mt-1">
                Datos de: {selectedReport.dataSources.map(ds => dataSources.find(d => d.id === ds)?.name).join(', ')}
              </p>
            </div>
          </div>

          {selectedReport.schedule && (
            <div className="mt-4 p-3 bg-[#6888ff]/10 rounded-lg">
              <p className="text-sm text-[#6888ff]">
                ðŸ“§ Se envía {selectedReport.schedule.frequency} a: {selectedReport.schedule.recipients.join(', ')}
              </p>
            </div>
          )}
        </NeuCard>
      )}
    </div>
  )
}

export default ReportsBuilder