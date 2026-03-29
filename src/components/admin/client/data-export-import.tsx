'use client'

/**
 * 📤 SILEXAR PULSE - Data Export/Import (Client)
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
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
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
  status: 'completed' | 'processing' | 'failed'
  createdAt: Date
  completedAt?: Date
  fileSize?: string
  downloadUrl?: string
}

interface ImportJob {
  id: string
  name: string
  type: 'leads' | 'contacts' | 'campaigns'
  status: 'completed' | 'processing' | 'failed' | 'pending_review'
  createdAt: Date
  recordsTotal: number
  recordsProcessed: number
  recordsFailed: number
}

export function DataExportImport() {
  const [exports, setExports] = useState<ExportJob[]>([])
  const [imports, setImports] = useState<ImportJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')

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
      { id: 'exp_003', name: 'Backup Completo', type: 'all', format: 'json', status: 'processing', createdAt: new Date() }
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
      status: 'processing',
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
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'processing': return <Clock className="w-4 h-4 text-blue-400 animate-spin" />
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'pending_review': return <Clock className="w-4 h-4 text-yellow-400" />
      default: return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'xlsx': return <Table className="w-4 h-4 text-green-400" />
      case 'csv': return <FileText className="w-4 h-4 text-blue-400" />
      case 'json': return <Database className="w-4 h-4 text-yellow-400" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Data Export/Import...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          Data Export/Import
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('export')}
              className={`px-3 py-1 text-sm rounded ${activeTab === 'export' ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}
            >
              <Download className="w-4 h-4 inline mr-1" />
              Export
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-3 py-1 text-sm rounded ${activeTab === 'import' ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}
            >
              <Upload className="w-4 h-4 inline mr-1" />
              Import
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'export' && (
        <>
          {/* Export Actions */}
          <NeuromorphicCard variant="embossed" className="p-4">
            <h4 className="text-white font-medium mb-3">Crear Exportación</h4>
            <div className="grid grid-cols-5 gap-3">
              {['campaigns', 'leads', 'analytics', 'users', 'all'].map(type => (
                <NeuromorphicButton 
                  key={type} 
                  variant="secondary" 
                  size="sm"
                  onClick={() => createExport(type)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </NeuromorphicButton>
              ))}
            </div>
          </NeuromorphicCard>

          {/* Export History */}
          <NeuromorphicCard variant="embossed" className="p-4">
            <h4 className="text-white font-medium mb-3">Historial de Exportaciones</h4>
            <div className="space-y-2">
              {exports.map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFormatIcon(exp.format)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white">{exp.name}</span>
                        {getStatusIcon(exp.status)}
                      </div>
                      <p className="text-xs text-slate-500">
                        {exp.type.toUpperCase()} • {exp.format.toUpperCase()}
                        {exp.fileSize && ` • ${exp.fileSize}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exp.status === 'completed' && exp.downloadUrl && (
                      <NeuromorphicButton variant="secondary" size="sm">
                        <Download className="w-4 h-4" />
                      </NeuromorphicButton>
                    )}
                    <button onClick={() => deleteExport(exp.id)} className="p-1 hover:bg-slate-700 rounded">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </NeuromorphicCard>
        </>
      )}

      {activeTab === 'import' && (
        <>
          {/* Import Dropzone */}
          <NeuromorphicCard variant="embossed" className="p-4">
            <h4 className="text-white font-medium mb-3">Importar Datos</h4>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">Arrastra un archivo aquí o haz clic para seleccionar</p>
              <p className="text-xs text-slate-500">Soporta CSV, XLSX, JSON • Máximo 50MB</p>
              <NeuromorphicButton variant="secondary" size="sm" className="mt-4">
                Seleccionar Archivo
              </NeuromorphicButton>
            </div>
          </NeuromorphicCard>

          {/* Import History */}
          <NeuromorphicCard variant="embossed" className="p-4">
            <h4 className="text-white font-medium mb-3">Historial de Importaciones</h4>
            <div className="space-y-2">
              {imports.map(imp => (
                <div key={imp.id} className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white">{imp.name}</span>
                      {getStatusIcon(imp.status)}
                    </div>
                    <span className="text-xs text-slate-500">{imp.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-400">Total: {imp.recordsTotal}</span>
                    <span className="text-green-400">Procesados: {imp.recordsProcessed}</span>
                    {imp.recordsFailed > 0 && (
                      <span className="text-red-400">Fallidos: {imp.recordsFailed}</span>
                    )}
                  </div>
                  {imp.status === 'pending_review' && (
                    <div className="flex gap-2 mt-2">
                      <NeuromorphicButton variant="primary" size="sm">Aprobar</NeuromorphicButton>
                      <NeuromorphicButton variant="secondary" size="sm">Revisar</NeuromorphicButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </NeuromorphicCard>
        </>
      )}
    </div>
  )
}

export default DataExportImport
