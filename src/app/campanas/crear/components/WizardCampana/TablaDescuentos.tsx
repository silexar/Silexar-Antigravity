/**
 * 💰 Tabla Descuentos Campaña - Enterprise 2050
 * 
 * Gestión de descuentos aplicables:
 * - Descuento Cliente (AAA, AA, A)
 * - Descuento Volumen
 * - Descuento Pronto Pago
 * - Descuento Especial/Negociado
 * 
 * @enterprise TIER0 Fortune 10
 */

'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, Trash2, Percent,
  CheckCircle, Building2, Clock, Volume2, Sparkles, RefreshCw
} from 'lucide-react'

interface Descuento {
  id: string
  tipo: 'cliente' | 'volumen' | 'pronto_pago' | 'especial'
  nombre: string
  porcentaje: number
  aplicaA: 'global' | 'emisora'
  emisora?: string
  descripcion?: string
}

interface TablaDescuentosProps {
  valorBruto: number
  descuentos: Descuento[]
  onUpdateDescuentos: (descuentos: Descuento[]) => void
  statusCliente?: 'AAA' | 'AA' | 'A' | 'B' | 'C'
}

const TIPOS_DESCUENTO = [
  { id: 'cliente', label: 'Cliente', icon: Building2, color: 'bg-blue-100 text-blue-700' },
  { id: 'volumen', label: 'Volumen', icon: Volume2, color: 'bg-green-100 text-green-700' },
  { id: 'pronto_pago', label: 'Pronto Pago', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'especial', label: 'Especial', icon: Sparkles, color: 'bg-purple-100 text-purple-700' }
]

const EMISORAS = [
  { id: 'global', label: 'Todas las emisoras' },
  { id: 't13', label: 'T13 Radio' },
  { id: 'playfm', label: 'Play FM' },
  { id: 'sonar', label: 'Sonar FM' },
  { id: 'horizonte', label: 'Horizonte' }
]

export function TablaDescuentos({ valorBruto, descuentos, onUpdateDescuentos, statusCliente }: TablaDescuentosProps) {
  const [nuevoDescuento, setNuevoDescuento] = useState<Partial<Descuento>>({
    tipo: 'cliente',
    porcentaje: 5,
    aplicaA: 'global'
  })
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  // Sugerir descuento por status cliente
  const descuentoSugerido = useMemo(() => {
    switch (statusCliente) {
      case 'AAA': return 5
      case 'AA': return 3
      case 'A': return 2
      default: return 0
    }
  }, [statusCliente])

  // Calcular totales
  const { totalDescuento, valorNeto, porcentajeTotal } = useMemo(() => {
    const total = descuentos.reduce((sum, d) => sum + d.porcentaje, 0)
    const montoDescuento = valorBruto * (total / 100)
    return {
      porcentajeTotal: total,
      totalDescuento: montoDescuento,
      valorNeto: valorBruto - montoDescuento
    }
  }, [valorBruto, descuentos])

  const agregarDescuento = () => {
    if (!nuevoDescuento.nombre || !nuevoDescuento.porcentaje) return

    const nuevo: Descuento = {
      id: `desc_${Date.now()}`,
      tipo: nuevoDescuento.tipo as Descuento['tipo'],
      nombre: nuevoDescuento.nombre,
      porcentaje: nuevoDescuento.porcentaje,
      aplicaA: nuevoDescuento.aplicaA as Descuento['aplicaA'],
      emisora: nuevoDescuento.emisora,
      descripcion: nuevoDescuento.descripcion
    }

    onUpdateDescuentos([...descuentos, nuevo])
    setNuevoDescuento({ tipo: 'cliente', porcentaje: 5, aplicaA: 'global' })
    setMostrarFormulario(false)
  }

  const eliminarDescuento = (id: string) => {
    onUpdateDescuentos(descuentos.filter(d => d.id !== id))
  }

  const aplicarDescuentoSugerido = () => {
    if (!statusCliente || descuentoSugerido === 0) return
    const nuevo: Descuento = {
      id: `desc_cliente_${Date.now()}`,
      tipo: 'cliente',
      nombre: `Cliente ${statusCliente}`,
      porcentaje: descuentoSugerido,
      aplicaA: 'global',
      descripcion: `Descuento automático por status ${statusCliente}`
    }
    onUpdateDescuentos([...descuentos, nuevo])
  }

  const formatMoney = (valor: number) => {
    if (valor >= 1000000) return `$${(valor / 1000000).toFixed(2)}M`
    if (valor >= 1000) return `$${(valor / 1000).toFixed(0)}K`
    return `$${valor.toLocaleString('es-CL')}`
  }

  return (
    <Card className="border-2 border-green-100">
      <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Percent className="h-5 w-5 text-green-600" />
            📊 DESCUENTOS APLICABLES
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-1"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            <Plus className="h-4 w-4" />
            Agregar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Sugerencia automática */}
        {statusCliente && descuentoSugerido > 0 && !descuentos.find(d => d.tipo === 'cliente') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-blue-700 font-medium">💡 Sugerencia:</span>
              <span className="text-blue-600 ml-2">
                Cliente {statusCliente} tiene descuento de {descuentoSugerido}%
              </span>
            </div>
            <Button size="sm" onClick={aplicarDescuentoSugerido}>
              Aplicar
            </Button>
          </div>
        )}

        {/* Formulario nuevo descuento */}
        {mostrarFormulario && (
          <div className="bg-slate-50 border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm">Nuevo Descuento</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Tipo</label>
                <Select 
                  value={nuevoDescuento.tipo} 
                  onValueChange={(v) => setNuevoDescuento({...nuevoDescuento, tipo: v as Descuento['tipo']})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_DESCUENTO.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Nombre</label>
                <Input 
                  placeholder="Ej: Volumen Navidad"
                  value={nuevoDescuento.nombre || ''}
                  onChange={(e) => setNuevoDescuento({...nuevoDescuento, nombre: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Porcentaje</label>
                <div className="relative">
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={nuevoDescuento.porcentaje || ''}
                    onChange={(e) => setNuevoDescuento({...nuevoDescuento, porcentaje: parseFloat(e.target.value)})}
                    className="pr-8"
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Aplica a</label>
                <Select 
                  value={nuevoDescuento.aplicaA} 
                  onValueChange={(v) => setNuevoDescuento({...nuevoDescuento, aplicaA: v as Descuento['aplicaA'], emisora: v !== 'global' ? nuevoDescuento.emisora : undefined})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EMISORAS.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setMostrarFormulario(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={agregarDescuento}>
                <CheckCircle className="h-4 w-4 mr-1" /> Agregar
              </Button>
            </div>
          </div>
        )}

        {/* Tabla de descuentos */}
        {descuentos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Descuento</th>
                  <th className="px-3 py-2 text-center">Porcentaje</th>
                  <th className="px-3 py-2 text-center">Emisora</th>
                  <th className="px-3 py-2 text-right">Monto</th>
                  <th className="px-3 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {descuentos.map(desc => {
                  const tipoInfo = TIPOS_DESCUENTO.find(t => t.id === desc.tipo)
                  const monto = valorBruto * (desc.porcentaje / 100)
                  return (
                    <tr key={desc.id} className="border-b hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Badge className={tipoInfo?.color}>{tipoInfo?.label}</Badge>
                          <span className="font-medium">{desc.nombre}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center font-mono font-semibold text-green-700">
                        {desc.porcentaje.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 text-center text-gray-600">
                        {desc.aplicaA === 'global' ? 'Todas' : desc.emisora || desc.aplicaA}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-red-600">
                        -{formatMoney(monto)}
                      </td>
                      <td className="px-3 py-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-red-500 hover:text-red-700"
                          onClick={() => eliminarDescuento(desc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-slate-100 font-semibold">
                <tr>
                  <td className="px-3 py-2">Total Descuentos</td>
                  <td className="px-3 py-2 text-center text-green-700">{porcentajeTotal.toFixed(2)}%</td>
                  <td></td>
                  <td className="px-3 py-2 text-right text-red-600">-{formatMoney(totalDescuento)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Percent className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No hay descuentos aplicados</p>
            <p className="text-xs">Haz clic en "Agregar" para añadir descuentos</p>
          </div>
        )}

        {/* Resumen financiero */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Valor bruto campaña:</span>
            <span className="font-semibold">{formatMoney(valorBruto)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-red-600">
            <span>Descuentos aplicados ({porcentajeTotal.toFixed(1)}%):</span>
            <span className="font-semibold">-{formatMoney(totalDescuento)}</span>
          </div>
          <div className="border-t pt-2 flex items-center justify-between">
            <span className="font-semibold text-gray-700">Valor neto:</span>
            <span className="text-xl font-bold text-green-700">{formatMoney(valorNeto)}</span>
          </div>
        </div>

        {/* Botón recalcular */}
        <Button variant="outline" className="w-full gap-2">
          <RefreshCw className="h-4 w-4" />
          🧮 Recalcular Valores
        </Button>
      </CardContent>
    </Card>
  )
}

export default TablaDescuentos
