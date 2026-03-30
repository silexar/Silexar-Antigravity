/**
 * 🧾 Tabla Facturas Campaña - Enterprise 2050
 * 
 * Gestión de facturas generadas:
 * - Ver facturas existentes
 * - Crear nueva factura
 * - Estados (Pendiente, Emitida, Enviada, Pagada)
 * - Acciones rápidas
 * 
 * @enterprise TIER0 Fortune 10
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus, FileText, Send, Eye, Trash2,
  CheckCircle, Clock, AlertTriangle,
  Mail, Printer
} from 'lucide-react'

interface Factura {
  id: string
  numero?: string
  credito: boolean
  fechaEmision: string
  fechaInicio: string
  fechaFinal: string
  valorBruto: number
  valorNeto: number
  estado: 'pendiente' | 'emitida' | 'enviada' | 'pagada' | 'anulada'
}

interface TablaFacturasProps {
  facturas: Factura[]
  onUpdateFacturas: (facturas: Factura[]) => void
  valorCampana: number
}

export function TablaFacturas({ facturas, onUpdateFacturas, valorCampana }: TablaFacturasProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mostrarCrear, setMostrarCrear] = useState(false)

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" /> Pendiente</Badge>
      case 'emitida':
        return <Badge className="bg-blue-100 text-blue-700"><FileText className="h-3 w-3 mr-1" /> Emitida</Badge>
      case 'enviada':
        return <Badge className="bg-purple-100 text-purple-700"><Send className="h-3 w-3 mr-1" /> Enviada</Badge>
      case 'pagada':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" /> Pagada</Badge>
      case 'anulada':
        return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="h-3 w-3 mr-1" /> Anulada</Badge>
      default:
        return null
    }
  }

  const formatMoney = (valor: number) => {
    if (valor >= 1000000) return `$${(valor / 1000000).toFixed(2)}M`
    return `$${valor.toLocaleString('es-CL')}`
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL')
  }

  const crearFactura = () => {
    const nueva: Factura = {
      id: `fac_${Date.now()}`,
      credito: false,
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFinal: new Date().toISOString().split('T')[0],
      valorBruto: valorCampana,
      valorNeto: valorCampana,
      estado: 'pendiente'
    }
    onUpdateFacturas([...facturas, nueva])
    setMostrarCrear(false)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const actualizarEstado = (id: string, estado: Factura['estado']) => {
    onUpdateFacturas(facturas.map(f => f.id === id ? { ...f, estado } : f))
  }

  const eliminarFactura = (id: string) => {
    onUpdateFacturas(facturas.filter(f => f.id !== id))
  }

  const totalFacturado = facturas
    .filter(f => f.estado !== 'anulada')
    .reduce((sum, f) => sum + f.valorNeto, 0)

  const pendientePorFacturar = valorCampana - totalFacturado

  return (
    <Card className="border-2 border-purple-100">
      <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            📋 FACTURAS GENERADAS
          </CardTitle>
          <Button 
            size="sm" 
            className="gap-1 bg-purple-600 hover:bg-purple-700"
            onClick={crearFactura}
          >
            <Plus className="h-4 w-4" />
            Crear Factura
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Resumen */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Valor Campaña</div>
            <div className="font-bold text-blue-700">{formatMoney(valorCampana)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Facturado</div>
            <div className="font-bold text-green-700">{formatMoney(totalFacturado)}</div>
          </div>
          <div className={`rounded-lg p-3 text-center ${pendientePorFacturar > 0 ? 'bg-yellow-50' : 'bg-gray-50'}`}>
            <div className="text-xs text-gray-500">Pendiente</div>
            <div className={`font-bold ${pendientePorFacturar > 0 ? 'text-yellow-700' : 'text-gray-500'}`}>
              {formatMoney(pendientePorFacturar)}
            </div>
          </div>
        </div>

        {/* Tabla */}
        {facturas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-2 w-10">
                    <Checkbox />
                  </th>
                  <th className="px-3 py-2 text-left">Factura</th>
                  <th className="px-3 py-2 text-center">Crédito</th>
                  <th className="px-3 py-2 text-center">F. Emisión</th>
                  <th className="px-3 py-2 text-center">Período</th>
                  <th className="px-3 py-2 text-right">Bruto</th>
                  <th className="px-3 py-2 text-right">Neto</th>
                  <th className="px-3 py-2 text-center">Estado</th>
                  <th className="px-3 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map(factura => (
                  <tr key={factura.id} className="border-b hover:bg-slate-50">
                    <td className="px-2 py-2">
                      <Checkbox />
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-purple-700">
                        {factura.numero || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Checkbox checked={factura.credito} />
                    </td>
                    <td className="px-3 py-2 text-center text-gray-600">
                      {formatFecha(factura.fechaEmision)}
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500">
                      {formatFecha(factura.fechaInicio)} - {formatFecha(factura.fechaFinal)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatMoney(factura.valorBruto)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-green-700">
                      {formatMoney(factura.valorNeto)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {getEstadoBadge(factura.estado)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Enviar">
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Imprimir">
                          <Printer className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-red-500" 
                          title="Eliminar"
                          onClick={() => eliminarFactura(factura.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No hay facturas generadas</p>
            <p className="text-xs">Haz clic en "Crear Factura" para generar una nueva</p>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="gap-1">
            <FileText className="h-4 w-4" />
            📄 Crear Factura
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Mail className="h-4 w-4" />
            📧 Enviar Seleccionadas
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Eye className="h-4 w-4" />
            👁️ Ver Detalle
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TablaFacturas
