'use client'

/**
 * ðŸ“¤ SILEXAR PULSE - Data Export/Import (Client)
 * Exportación e importación de datos
 * 
 * @description Data Management:
 * - Exportar datos
 * - Importar leads/contactos
 * - Backups de datos
 * - Formatos CSV, Excel, JSON
 * 
 * @version 2025.1.0
 * @tier CLIENT_ADMIN
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Download,
  Upload,
  FileText,
  Table,
  Database,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Trash2
} from 'lucide-react'

interface ExportJob {
  id: string
  name: string
  type: 'campaigns' | 'leads' | 'analytics' | 'users' | 'all'
  format: 'csv' | 'xlsx' | 'json'
  status: 'completed' | 'Procesando' | 'Fallido'
  createdAt: Date
  completedAt?: Date
  fileSize?: string
  downloadUrl?: string
}

interface ImportJob {
  id: string
  name: string
  type: 'leads' | 'contacts' | 'campaigns'
  status: 'completed' | 'Procesando' | 'Fallido' | 'pending_review'
  createdAt: Date
  recordsTotal: number
  recordsProcessed: number
  recordsFailed: number
}

export function DataExportImport() {
  const [exports, setExports] = useState<ExportJob[]>([])
  const [imports, setImports] = useState<ImportJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'Exportar' | 'Importar'>('Exportar')

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setExports([
      { id: 'exp_001', name: 'Campañas Q4 2024', type: 'campaigns', format: 'xlsx', status: 'completed', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000), fileSize: '2.4 MB', downloadUrl: '#' },
      { id: 'exp_002', name: 'Analytics Enero 2025', type: 'analytics', format: 'csv', status: 'completed', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000), fileSize: '5.1 MB', downloadUrl: '#' },
      { id: 'exp_003', name: 'Backup Completo', type: 'all', format: 'json', status: 'Procesando', createdAt: new Date() }
    ])

    setImports([
      { id: 'imp_001', name: 'Leads Diciembre.csv', type: 'leads', status: 'completed', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), recordsTotal: 1500, recordsProcessed: 1485, recordsFailed: 15 },
      { id: 'imp_002', name: 'Contactos CRM.xlsx', type: 'contacts', status: 'pending_review', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), recordsTotal: 850, recordsProcessed: 850, recordsFailed: 0 }
    ])

    setIsLoading(false)
  }

  const createExport = (type: string) => {
    const newExport: ExportJob = {
      id: `exp_${Date.now()}`,
      name: `Export ${type} ${new Date().toLocaleDateString()}`,
      type: type as ExportJob['type'],
      format: 'csv',
      status: 'Procesando',
      createdAt: new Date()
    }
    setExports(prev => [newExport, ...prev])

    // Simulate completion
    setTimeout(() => {
      setExports(prev => prev.map(e =>
        e.id === newExport.id ? { ...e, status: 'completed', completedAt: new Date(), fileSize: '1.2 MB', downloadUrl: '#' } : e
      ))
    }, 3000)
  }

  const deleteExport = (id: string) => {
    setExports(prev => prev.filter(e => e.id !== id))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-[#6888ff]" />
      case 'Procesando': return <Clock className="w-4 h-4 text-[#6888ff] animate-spin" />
      case 'Fallido': return <AlertTriangle className="w-4 h-4 text-[#6888ff]" />
      case 'pending_review': return <Clock className="w-4 h-4 text-[#6888ff]" />
      default: return <Clock className="w-4 h-4 text-[#9aa3b8]" />
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'xlsx': return <Table className="w-4 h-4 text-[#6888ff]" />
      case 'csv': return <FileText className="w-4 h-4 text-[#6888ff]" />
      case 'json': return <Database className="w-4 h-4 text-[#6888ff]" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Data Export/Import...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Database className="w-5 h-5 text-[#6888ff]" />
          Data Export/Import
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#dfeaff] rounded-lg p-1">
            <button
              onClick={() => setActiveTab('Exportar')}
              className={`px-3 py-1 text-sm rounded ${activeTab === 'Exportar' ? 'bg-[#6888ff] text-white' : 'text-[#9aa3b8]'}`}
            >
              <Download className="w-4 h-4 inline mr-1" />
              Export
            </button>
            <button
              onClick={() => setActiveTab('Importar')}
              className={`px-3 py-1 text-sm rounded ${activeTab === 'Importar' ? 'bg-[#6888ff] text-white' : 'text-[#9aa3b8]'}`}
            >
              <Upload className="w-4 h-4 inline mr-1" />
              Import
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'Exportar' && (
        <>
          {/* Export Actions */}
          <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
            <h4 className="text-[#69738c] font-medium mb-3">Crear Exportación</h4>
            <div className="grid grid-cols-5 gap-3">
              {['campaigns', 'leads', 'analytics', 'users', 'all'].map(type => (
                <NeuButton
                  key={type}
                  variant="secondary"
                  onClick={() => createExport(type)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </NeuButton>
              ))}
            </div>
          </NeuCard>

          {/* Export History */}
          <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
            <h4 className="text-[#69738c] font-medium mb-3">Historial de Exportaciones</h4>
            <div className="space-y-2">
              {exports.map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-3 bg-[#dfeaff]/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFormatIcon(exp.format)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#69738c]">{exp.name}</span>
                        {getStatusIcon(exp.status)}
                      </div>
                      <p className="text-xs text-[#9aa3b8]">
                        {exp.type.toUpperCase()} • {exp.format.toUpperCase()}
                        {exp.fileSize && ` • ${exp.fileSize}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exp.status === 'completed' && exp.downloadUrl && (
                      <NeuButton variant="secondary">
                        <Download className="w-4 h-4" />
                      </NeuButton>
                    )}
                    <button onClick={() => deleteExport(exp.id)} className="p-1 hover:bg-[#dfeaff] rounded">
                      <Trash2 className="w-4 h-4 text-[#6888ff]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </NeuCard>
        </>
      )}

      {activeTab === 'Importar' && (
        <>
          {/* Import Dropzone */}
          <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
            <h4 className="text-[#69738c] font-medium mb-3">Importar Datos</h4>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-[#9aa3b8] mx-auto mb-4" />
              <p className="text-[#9aa3b8] mb-2">Arrastra un archivo aquí o haz clic para seleccionar</p>
              <p className="text-xs text-[#9aa3b8]">Soporta CSV, XLSX, JSON • Máximo 50MB</p>
              <NeuButton variant="secondary" className="mt-4">
                Seleccionar Archivo
              </NeuButton>
            </div>
          </NeuCard>

          {/* Import History */}
          <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
            <h4 className="text-[#69738c] font-medium mb-3">Historial de Importaciones</h4>
            <div className="space-y-2">
              {imports.map(imp => (
                <div key={imp.id} className="p-3 bg-[#dfeaff]/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#69738c]">{imp.name}</span>
                      {getStatusIcon(imp.status)}
                    </div>
                    <span className="text-xs text-[#9aa3b8]">{imp.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-[#9aa3b8]">Total: {imp.recordsTotal}</span>
                    <span className="text-[#6888ff]">Procesados: {imp.recordsProcessed}</span>
                    {imp.recordsFailed > 0 && (
                      <span className="text-[#6888ff]">Fallidos: {imp.recordsFailed}</span>
                    )}
                  </div>
                  {imp.status === 'pending_review' && (
                    <div className="flex gap-2 mt-2">
                      <NeuButton variant="primary">Aprobar</NeuButton>
                      <NeuButton variant="secondary">Revisar</NeuButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </NeuCard>
        </>
      )}
    </div>
  )
}

export default DataExportImport