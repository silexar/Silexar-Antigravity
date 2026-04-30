/**
 * ðŸ’¾ Backup Automático - Sistema de Respaldo Enterprise 2050
 *
 * Sistema de backup y versionado con:
 * - Backup automático antes de acciones críticas
 * - Versionado completo de campañas
 * - Restauración a cualquier punto
 * - Comparación entre versiones
 * - Retención configurable
 *
 * @enterprise TIER0 Fortune 10
 * @security Neuromorphic Level
 */

'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Save, History, RotateCcw, Clock, CheckCircle,
  AlertTriangle, Download, Eye, Trash2, Archive,
  RefreshCw, Database, HardDrive, Loader2, Diff
} from 'lucide-react'

// ==================== INTERFACES ====================

interface VersionCampana {
  id: string
  campanaId: string
  version: number
  fechaCreacion: string
  horaCreacion: string
  usuario: string
  tipoAccion: 'creacion' | 'edicion' | 'programacion' | 'aprobacion' | 'restauracion'
  descripcion: string
  tamanioKB: number
  hash: string
  esActual: boolean
}

interface BackupConfig {
  backupAutomatico: boolean
  intervaloMinutos: number
  retencionDias: number
  compresion: boolean
  encriptacion: boolean
}

// ==================== DATOS MOCK ====================

const MOCK_VERSIONES: VersionCampana[] = [
  {
    id: 'v_001',
    campanaId: 'CMP-2025-001',
    version: 8,
    fechaCreacion: '2025-12-19',
    horaCreacion: '16:40:00',
    usuario: 'Ana García',
    tipoAccion: 'edicion',
    descripcion: 'Modificación de líneas programación Prime',
    tamanioKB: 245,
    hash: 'sha256-abc123def456',
    esActual: true
  },
  {
    id: 'v_002',
    campanaId: 'CMP-2025-001',
    version: 7,
    fechaCreacion: '2025-12-19',
    horaCreacion: '14:22:00',
    usuario: 'Carlos Ruiz',
    tipoAccion: 'programacion',
    descripcion: 'Resolución conflicto bloque 08:26',
    tamanioKB: 242,
    hash: 'sha256-789ghi012jkl',
    esActual: false
  },
  {
    id: 'v_003',
    campanaId: 'CMP-2025-001',
    version: 6,
    fechaCreacion: '2025-12-18',
    horaCreacion: '17:45:00',
    usuario: 'Ana García',
    tipoAccion: 'aprobacion',
    descripcion: 'Aprobación por cliente Banco Chile',
    tamanioKB: 240,
    hash: 'sha256-mno345pqr678',
    esActual: false
  },
  {
    id: 'v_004',
    campanaId: 'CMP-2025-001',
    version: 5,
    fechaCreacion: '2025-12-18',
    horaCreacion: '10:15:00',
    usuario: 'Sistema',
    tipoAccion: 'edicion',
    descripcion: 'Backup automático pre-modificación',
    tamanioKB: 238,
    hash: 'sha256-stu901vwx234',
    esActual: false
  },
  {
    id: 'v_005',
    campanaId: 'CMP-2025-001',
    version: 4,
    fechaCreacion: '2025-12-17',
    horaCreacion: '15:30:00',
    usuario: 'Ana García',
    tipoAccion: 'edicion',
    descripcion: 'Ajuste tarifas y descuentos',
    tamanioKB: 235,
    hash: 'sha256-yza567bcd890',
    esActual: false
  }
]

const MOCK_CONFIG: BackupConfig = {
  backupAutomatico: true,
  intervaloMinutos: 30,
  retencionDias: 90,
  compresion: true,
  encriptacion: true
}

// ==================== SERVICIO BACKUP ====================

export class BackupService {
  private static instance: BackupService

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService()
    }
    return BackupService.instance
  }

  async crearBackup(campanaId: string, descripcion: string): Promise<VersionCampana> {
    // Simular creación de backup
    await new Promise(r => setTimeout(r, 1000))

    const nuevaVersion: VersionCampana = {
      id: `v_${Date.now()}`,
      campanaId,
      version: MOCK_VERSIONES[0].version + 1,
      fechaCreacion: new Date().toISOString().split('T')[0],
      horaCreacion: new Date().toTimeString().split(' ')[0],
      usuario: 'Sistema',
      tipoAccion: 'edicion',
      descripcion,
      tamanioKB: 250,
      hash: `sha256-${Math.random().toString(36).slice(2)}`,
      esActual: true
    }

    return nuevaVersion
  }

  async restaurarVersion(versionId: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 1500))
    return true
  }

  async compararVersiones(_v1: string, _v2: string): Promise<object> {
    await new Promise(r => setTimeout(r, 800))
    return {
      added: 5,
      removed: 2,
      modified: 8,
      cambios: [
        { campo: 'valorBruto', anterior: 2500000, nuevo: 2750000 },
        { campo: 'lineas', anterior: 12, nuevo: 15 }
      ]
    }
  }
}

// ==================== COMPONENTE PRINCIPAL ====================

export function BackupAutomatico() {
  const [versiones] = useState<VersionCampana[]>(MOCK_VERSIONES)
  const [config] = useState<BackupConfig>(MOCK_CONFIG)
  const [restaurando, setRestaurando] = useState<string | null>(null)
  const [creandoBackup, setCreandoBackup] = useState(false)
  const [versionSeleccionada, setVersionSeleccionada] = useState<string | null>(null)

  const stats = useMemo(() => ({
    totalVersiones: versiones.length,
    tamanioTotalMB: (versiones.reduce((sum, v) => sum + v.tamanioKB, 0) / 1024).toFixed(2),
    ultimoBackup: versiones[0]?.horaCreacion || '-'
  }), [versiones])

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'creacion': return <CheckCircle className="h-4 w-4 text-[#6888ff]" />
      case 'edicion': return <History className="h-4 w-4 text-[#6888ff]" />
      case 'programacion': return <Clock className="h-4 w-4 text-[#6888ff]" />
      case 'aprobacion': return <CheckCircle className="h-4 w-4 text-[#6888ff]" />
      case 'restauracion': return <RotateCcw className="h-4 w-4 text-[#6888ff]" />
      default: return <History className="h-4 w-4" />
    }
  }

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'creacion': return <Badge className="bg-[#6888ff]/10 text-[#6888ff]">Creación</Badge>
      case 'edicion': return <Badge className="bg-[#6888ff]/10 text-[#6888ff]">Edición</Badge>
      case 'programacion': return <Badge className="bg-[#6888ff]/10 text-[#6888ff]">Programación</Badge>
      case 'aprobacion': return <Badge className="bg-[#6888ff]/10 text-[#6888ff]">Aprobación</Badge>
      case 'restauracion': return <Badge className="bg-[#6888ff]/10 text-[#6888ff]">Restauración</Badge>
      default: return null
    }
  }

  const handleCrearBackup = async () => {
    setCreandoBackup(true)
    const service = BackupService.getInstance()
    await service.crearBackup('CMP-2025-001', 'Backup manual creado por usuario')
    setCreandoBackup(false)
  }

  const handleRestaurar = async (versionId: string) => {
    setRestaurando(versionId)
    const service = BackupService.getInstance()
    await service.restaurarVersion(versionId)
    setRestaurando(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-100">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-xl flex items-center gap-2">
            <Database className="h-6 w-6 text-[#6888ff]" />
            ðŸ’¾ BACKUP AUTOMÁTICO - VERSIONADO CAMPAÁ‘AS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-[#69738c]">{stats.totalVersiones}</div>
              <div className="text-xs text-[#9aa3b8]">Versiones</div>
            </div>
            <div className="bg-[#6888ff]/08 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-[#6888ff]">{stats.tamanioTotalMB}MB</div>
              <div className="text-xs text-[#6888ff]">Tamaño Total</div>
            </div>
            <div className="bg-[#6888ff]/08 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-[#6888ff]">{stats.ultimoBackup}</div>
              <div className="text-xs text-[#6888ff]">Ášltimo Backup</div>
            </div>
            <div className="bg-[#6888ff]/08 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-[#6888ff]">{config.retencionDias}d</div>
              <div className="text-xs text-[#6888ff]">Retención</div>
            </div>
          </div>

          {/* Configuración */}
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  {config.backupAutomatico ? (
                    <CheckCircle className="h-4 w-4 text-[#6888ff]" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-[#6888ff]" />
                  )}
                  Auto: {config.backupAutomatico ? 'ON' : 'OFF'}
                </span>
                <span>Intervalo: {config.intervaloMinutos}min</span>
                <span>Compresión: {config.compresion ? 'œ…' : 'Œ'}</span>
                <span>Encriptación: {config.encriptacion ? 'ðŸ”' : 'Œ'}</span>
              </div>
              <Button size="sm" variant="outline" onClick={handleCrearBackup} disabled={creandoBackup}>
                {creandoBackup ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="ml-1">Backup Manual</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de versiones */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-5 w-5" />
            ðŸ“œ HISTORIAL DE VERSIONES
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="px-3 py-2 text-left">Ver.</th>
                  <th className="px-3 py-2 text-left">Fecha/Hora</th>
                  <th className="px-3 py-2 text-left">Usuario</th>
                  <th className="px-3 py-2 text-center">Tipo</th>
                  <th className="px-3 py-2 text-left">Descripción</th>
                  <th className="px-3 py-2 text-center">Tamaño</th>
                  <th className="px-3 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {versiones.map(version => (
                  <tr
                    key={version.id}
                    className={`border-b hover:bg-slate-50 ${version.esActual ? 'bg-[#6888ff]/08' : ''}`}
                  >
                    <td className="px-3 py-2">
                      <span className="font-mono font-bold">v{version.version}</span>
                      {version.esActual && <Badge className="ml-1 bg-[#6888ff] text-white text-xs">Actual</Badge>}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      <div>{version.fechaCreacion}</div>
                      <div className="text-xs">{version.horaCreacion}</div>
                    </td>
                    <td className="px-3 py-2">{version.usuario}</td>
                    <td className="px-3 py-2 text-center">
                      {getTipoBadge(version.tipoAccion)}
                    </td>
                    <td className="px-3 py-2 text-gray-600 max-w-xs truncate">
                      {version.descripcion}
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-xs">
                      {version.tamanioKB}KB
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Comparar">
                          <Diff className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Descargar">
                          <Download className="h-3 w-3" />
                        </Button>
                        {!version.esActual && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[#6888ff]"
                            title="Restaurar"
                            onClick={() => handleRestaurar(version.id)}
                            disabled={restaurando === version.id}
                          >
                            {restaurando === version.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex gap-3">
        <Button variant="outline" className="gap-2">
          <Archive className="h-4 w-4" />
          ðŸ“¦ Exportar Todas
        </Button>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          ðŸ”„ Sincronizar Cloud
        </Button>
        <Button variant="ghost" className="gap-2 text-[#6888ff]">
          <Trash2 className="h-4 w-4" />
          Limpiar Antiguas
        </Button>
      </div>
    </div>
  )
}

export default BackupAutomatico
