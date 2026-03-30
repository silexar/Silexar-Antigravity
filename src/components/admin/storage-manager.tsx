'use client'

/**
 * 📁 SILEXAR PULSE - Storage Manager
 * Gestión de almacenamiento y archivos
 * 
 * @description Storage Management:
 * - Uso de storage por tenant
 * - Limpieza de archivos
 * - Estadísticas de uso
 * - Archivos huérfanos
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  HardDrive,
  Folder,
  File,
  Trash2,
  RefreshCw,
  Download,
  AlertTriangle,
  Search
} from 'lucide-react'

interface StorageBucket {
  id: string
  name: string
  provider: 'aws-s3' | 'gcp-storage' | 'azure-blob' | 'local'
  region: string
  totalSize: number
  usedSize: number
  objectCount: number
  lastSync: Date
}

interface StorageFile {
  id: string
  path: string
  size: number
  type: string
  tenantId?: string
  uploaded: Date
  lastAccessed?: Date
  isOrphan: boolean
}

export function StorageManager() {
  const [buckets, setBuckets] = useState<StorageBucket[]>([])
  const [files, setFiles] = useState<StorageFile[]>([])
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadStorageData()
  }, [])

  const loadStorageData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setBuckets([
      { id: 'bucket_001', name: 'silexar-media', provider: 'aws-s3', region: 'sa-east-1', totalSize: 500 * 1024, usedSize: 234 * 1024, objectCount: 45230, lastSync: new Date() },
      { id: 'bucket_002', name: 'silexar-exports', provider: 'aws-s3', region: 'sa-east-1', totalSize: 100 * 1024, usedSize: 45 * 1024, objectCount: 1250, lastSync: new Date() },
      { id: 'bucket_003', name: 'silexar-backups', provider: 'aws-s3', region: 'us-east-1', totalSize: 1000 * 1024, usedSize: 789 * 1024, objectCount: 365, lastSync: new Date() },
      { id: 'bucket_004', name: 'silexar-temp', provider: 'aws-s3', region: 'sa-east-1', totalSize: 50 * 1024, usedSize: 12 * 1024, objectCount: 3450, lastSync: new Date() }
    ])

    setIsLoading(false)
  }

  const loadFiles = (bucketId: string) => {
    setSelectedBucket(bucketId)
    setFiles([
      { id: 'file_001', path: '/campaigns/2024/banner_001.jpg', size: 2500000, type: 'image/jpeg', tenantId: 'tenant_001', uploaded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), isOrphan: false },
      { id: 'file_002', path: '/campaigns/2024/video_promo.mp4', size: 125000000, type: 'video/mp4', tenantId: 'tenant_001', uploaded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), isOrphan: false },
      { id: 'file_003', path: '/temp/upload_abc123.tmp', size: 5000000, type: 'application/octet-stream', uploaded: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), isOrphan: true },
      { id: 'file_004', path: '/exports/report_2024_q3.csv', size: 8500000, type: 'text/csv', tenantId: 'tenant_002', uploaded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), isOrphan: false },
      { id: 'file_005', path: '/campaigns/old/deleted_banner.png', size: 1500000, type: 'image/png', uploaded: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), isOrphan: true }
    ])
  }

  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const cleanOrphans = () => {
    if (confirm('¿Eliminar todos los archivos huérfanos?')) {
      setFiles(prev => prev.filter(f => !f.isOrphan))
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
  }

  const totalUsed = buckets.reduce((sum, b) => sum + b.usedSize, 0)
  const totalCapacity = buckets.reduce((sum, b) => sum + b.totalSize, 0)
  const orphanFiles = files.filter(f => f.isOrphan)

  const filteredFiles = files.filter(f => 
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Storage Manager...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-blue-400" />
          Storage Manager
        </h3>
        <div className="flex items-center gap-2">
          <NeuromorphicButton variant="secondary" size="sm" onClick={loadStorageData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </NeuromorphicButton>
          {orphanFiles.length > 0 && (
            <NeuromorphicButton variant="secondary" size="sm" onClick={cleanOrphans}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clean Orphans ({orphanFiles.length})
            </NeuromorphicButton>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <NeuromorphicCard variant="embossed" className="p-4 text-center">
          <HardDrive className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{buckets.length}</p>
          <p className="text-xs text-slate-400">Buckets</p>
        </NeuromorphicCard>
        <NeuromorphicCard variant="embossed" className="p-4 text-center">
          <Folder className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-cyan-400">{formatSize(totalUsed * 1024)}</p>
          <p className="text-xs text-slate-400">Usado</p>
        </NeuromorphicCard>
        <NeuromorphicCard variant="embossed" className="p-4 text-center">
          <File className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-400">{buckets.reduce((sum, b) => sum + b.objectCount, 0).toLocaleString()}</p>
          <p className="text-xs text-slate-400">Objetos</p>
        </NeuromorphicCard>
        <NeuromorphicCard variant="embossed" className="p-4 text-center">
          <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center">
            <span className="text-lg">{Math.round((totalUsed / totalCapacity) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
            <div 
              className={`h-2 rounded-full ${totalUsed / totalCapacity > 0.8 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${(totalUsed / totalCapacity) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">Capacidad</p>
        </NeuromorphicCard>
      </div>

      {/* Buckets Grid */}
      <div className="grid grid-cols-2 gap-3">
        {buckets.map(bucket => (
          <NeuromorphicCard 
            key={bucket.id}
            variant="embossed" 
            className={`p-4 cursor-pointer ${selectedBucket === bucket.id ? 'ring-1 ring-blue-500/50' : ''}`}
            onClick={() => loadFiles(bucket.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium">{bucket.name}</span>
              </div>
              <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded">{bucket.provider}</span>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Uso</span>
                <span className="text-white">{formatSize(bucket.usedSize * 1024)} / {formatSize(bucket.totalSize * 1024)}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${bucket.usedSize / bucket.totalSize > 0.8 ? 'bg-red-500' : 'bg-cyan-500'}`}
                  style={{ width: `${(bucket.usedSize / bucket.totalSize) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{bucket.objectCount.toLocaleString()} objetos</span>
              <span>{bucket.region}</span>
            </div>
          </NeuromorphicCard>
        ))}
      </div>

      {/* Files Browser */}
      {selectedBucket && (
        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">Archivos</h4>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredFiles.map(file => (
              <div key={file.id} className={`flex items-center justify-between p-3 rounded-lg ${file.isOrphan ? 'bg-yellow-500/5 border border-yellow-500/20' : 'bg-slate-800/50'}`}>
                <div className="flex items-center gap-3">
                  <File className={`w-5 h-5 ${file.isOrphan ? 'text-yellow-400' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-white text-sm">{file.path}</span>
                    <p className="text-xs text-slate-500">
                      {formatSize(file.size)} • {file.type}
                      {file.tenantId && ` • ${file.tenantId}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {file.isOrphan && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Huérfano
                    </span>
                  )}
                  <button className="p-1 hover:bg-slate-700 rounded" aria-label="Descargar">
                    <Download className="w-4 h-4 text-slate-400" />
                  </button>
                  <button onClick={() => deleteFile(file.id)} className="p-1 hover:bg-slate-700 rounded" aria-label="Eliminar">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </NeuromorphicCard>
      )}
    </div>
  )
}

export default StorageManager
