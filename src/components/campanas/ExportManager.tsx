/**
 * 📄 ExportManager - Exportación Multi-formato
 * @enterprise Enterprise 2050
 */

'use client'

import React, { useState } from 'react'
import { Download, FileText, FileSpreadsheet, Table, X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// Badge import removed - not currently used

interface ExportItem {
  id: string
  numeroCampana: string
  anunciante: string
  nombreCampana: string
  estado: string
  valorNeto: number
  fechaInicio: string
  fechaTermino: string
  vendedor: string
}

interface ExportManagerProps {
  items: ExportItem[]
  isOpen: boolean
  onClose: () => void
}

type ExportFormat = 'excel' | 'csv' | 'pdf'

export function ExportManager({ items, isOpen, onClose }: ExportManagerProps) {
  const [formato, setFormato] = useState<ExportFormat>('excel')
  const [exportando, setExportando] = useState(false)
  const [completado, setCompletado] = useState(false)

  if (!isOpen) return null

  const handleExport = async () => {
    setExportando(true)
    
    // Simular exportación
    await new Promise(r => setTimeout(r, 1500))
    
    // En producción: llamar a API real
    if (formato === 'csv') {
      const headers = ['Campaña', 'Anunciante', 'Nombre', 'Estado', 'Valor', 'Inicio', 'Término', 'Vendedor']
      const rows = items.map(i => [
        i.numeroCampana, i.anunciante, i.nombreCampana, i.estado,
        i.valorNeto, i.fechaInicio, i.fechaTermino, i.vendedor
      ])
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `campanas_export_${Date.now()}.csv`
      a.click()
    }

    setExportando(false)
    setCompletado(true)
    setTimeout(() => { setCompletado(false); onClose() }, 1500)
  }

  const formatos: { id: ExportFormat; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { id: 'excel', label: 'Excel', icon: FileSpreadsheet, desc: 'Formato .xlsx con formato' },
    { id: 'csv', label: 'CSV', icon: Table, desc: 'Datos separados por comas' },
    { id: 'pdf', label: 'PDF', icon: FileText, desc: 'Documento formateado' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <Card className="w-[450px] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Exportar Campañas
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              📊 <strong>{items.length}</strong> campañas seleccionadas para exportar
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Formato de exportación</label>
            <div className="grid grid-cols-3 gap-2">
              {formatos.map(f => (
                <button
                  key={f.id}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    formato === f.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                  }`}
                  onClick={() => setFormato(f.id)}
                >
                  <f.icon className={`h-6 w-6 mx-auto mb-1 ${formato === f.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className={`text-sm font-medium ${formato === f.id ? 'text-blue-700' : 'text-gray-600 dark:text-gray-300'}`}>
                    {f.label}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">{formatos.find(f => f.id === formato)?.desc}</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700" 
              onClick={handleExport}
              disabled={exportando || completado}
            >
              {exportando ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Exportando...</>
              ) : completado ? (
                <><Check className="h-4 w-4 mr-2" /> ¡Listo!</>
              ) : (
                <><Download className="h-4 w-4 mr-2" /> Exportar</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
