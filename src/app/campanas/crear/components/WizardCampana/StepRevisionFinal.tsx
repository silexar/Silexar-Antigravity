/**
 * ✅ Step 7: Revisión Final ENTERPRISE 2050
 * 
 * Resumen completo con:
 * - Checklist de validaciones
 * - Preview de todas las secciones
 * - Alertas de pendientes
 * - Confirmación con modal
 * - Keyboard shortcuts
 * 
 * @enterprise TIER0 Fortune 10
 */

'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { WizardStepProps } from './types/wizard.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Check, FileText, DollarSign, Calendar, Radio, AlertTriangle, 
  ArrowRight, CheckCircle, X, Building2, User, 
  Percent, Loader2, Sparkles, ShieldCheck, Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RevisionData {
  nombre?: string
  anunciante?: string
  producto?: string
  referenciaCliente?: string
  fechaInicio?: string
  fechaFin?: string
  ejecutivo?: string
  agenciaCreativa?: string
  agenciaMedios?: string
  emisoraPrincipal?: string
  valorBruto?: number
  valorNeto?: number
  modalidad?: string
  comisionAgencia?: number
  estiloFacturacion?: string
  lineas?: Array<{
    id: string
    programa: string
    duracion: number
    distribucion: Record<string, number>
  }>
  tipoPedido?: string
  tipoPauta?: string
  categoria?: string
}

interface StepRevisionProps extends WizardStepProps {
  data: Record<string, unknown>
}

interface Validacion {
  id: string
  label: string
  campo: string
  valido: boolean
  criticidad: 'error' | 'warning' | 'info'
}

export const StepRevisionFinal: React.FC<StepRevisionProps> = ({
  isActive: _isActive,
  onComplete,
  onBack: _onBack,
  data: rawData
}) => {
  const data = rawData as RevisionData
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [creado, setCreado] = useState(false)

  useEffect(() => {
    onComplete()
  }, [onComplete])

  // Validaciones automáticas
  const validaciones = useMemo<Validacion[]>(() => [
    { id: 'nombre', label: 'Nombre de campaña', campo: 'nombre', valido: !!data.nombre, criticidad: 'error' },
    { id: 'anunciante', label: 'Anunciante', campo: 'anunciante', valido: !!data.anunciante, criticidad: 'error' },
    { id: 'producto', label: 'Producto', campo: 'producto', valido: !!data.producto, criticidad: 'error' },
    { id: 'fechas', label: 'Fechas de campaña', campo: 'fechas', valido: !!data.fechaInicio && !!data.fechaFin, criticidad: 'error' },
    { id: 'ejecutivo', label: 'Ejecutivo asignado', campo: 'ejecutivo', valido: !!data.ejecutivo, criticidad: 'warning' },
    { id: 'valor', label: 'Valor de campaña', campo: 'valor', valido: (data.valorNeto || 0) > 0, criticidad: 'error' },
    { id: 'lineas', label: 'Líneas de programación', campo: 'lineas', valido: (data.lineas?.length || 0) > 0, criticidad: 'warning' },
    { id: 'facturacion', label: 'Estilo de facturación', campo: 'facturacion', valido: !!data.estiloFacturacion, criticidad: 'info' },
    { id: 'tipoPedido', label: 'Tipo de pedido', campo: 'tipoPedido', valido: !!data.tipoPedido, criticidad: 'info' }
  ], [data])

  const errores = validaciones.filter(v => !v.valido && v.criticidad === 'error')
  const _advertencias = validaciones.filter(v => !v.valido && v.criticidad === 'warning')
  const _info = validaciones.filter(v => !v.valido && v.criticidad === 'info')
  const puedeCrear = errores.length === 0

  // Cálculos
  const totalLineas = data.lineas?.length || 0
  const totalValor = data.valorNeto || data.valorBruto || 0
  const totalSpots = data.lineas?.reduce((acc, l) => {
    const dist = l.distribucion || {}
    const total = Object.values(dist).reduce((s, v) => s + (v as number), 0)
    return acc + (total * 4) // 4 semanas aproximado
  }, 0) || 0

  const handleCreate = async () => {
    if (!puedeCrear) return
    
    setIsCreating(true)
    try {
      // Mapear propiedades a formato de backend (PropiedadesIntegrationAPI)
      const propiedades = [];
      if (data.tipoPedido) propiedades.push({ tipoCodigo: 'TIPO_PEDIDO', valorCodigoRef: data.tipoPedido, nombre: data.tipoPedido });
      if (data.tipoPauta) propiedades.push({ tipoCodigo: 'TIPO_PAUTA', valorCodigoRef: data.tipoPauta, nombre: data.tipoPauta });
      if (data.categoria) propiedades.push({ tipoCodigo: 'CATEGORIA', valorCodigoRef: data.categoria, nombre: data.categoria });

      const response = await fetch('/api/campanas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: data.nombre,
          tipoCampana: data.tipoPedido || 'promocional',
          fechaInicio: data.fechaInicio,
          fechaFin: data.fechaFin,
          presupuestoTotal: data.valorBruto || 0,
          propiedades: propiedades
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error al crear la campaña');
      }

      setCreado(true)
      setMostrarConfirmacion(false)
      
      setTimeout(() => {
        router.push(`/campanas?success=true&id=${result.data?.id || 'CMP-2025-NEW'}`)
      }, 1500)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error desconocido de validación cruzada: ' + error);
      setIsCreating(false);
      setMostrarConfirmacion(false);
    }
  }

  const formatMoney = (valor: number) => {
    if (valor >= 1000000) return `$${(valor / 1000000).toFixed(2)}M`
    return `$${valor.toLocaleString('es-CL')}`
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey && puedeCrear && !isCreating) {
        setMostrarConfirmacion(true)
      }
      if (e.key === 'Escape') {
        setMostrarConfirmacion(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [puedeCrear, isCreating])

  if (creado) {
    return (
      <div className="text-center py-16 animate-in fade-in zoom-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-green-700 mb-2">¡Campaña Creada!</h2>
        <p className="text-gray-500 mb-4">Redirigiendo al listado...</p>
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">✅ Revisión Final</h2>
        <p className="text-gray-500 mt-2">
          Verifica todos los datos antes de crear la campaña
          <kbd className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd>
        </p>
      </div>

      {/* Checklist de validaciones */}
      <Card className={`border-2 ${errores.length > 0 ? 'border-red-200 bg-red-50/50' : 'border-green-200 bg-green-50/50'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            {errores.length > 0 ? (
              <><AlertTriangle className="h-5 w-5 text-red-600" /> Validaciones Pendientes</>
            ) : (
              <><CheckCircle className="h-5 w-5 text-green-600" /> Todas las Validaciones OK</>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-2">
            {validaciones.map(v => (
              <div 
                key={v.id} 
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  v.valido ? 'bg-green-100' : 
                  v.criticidad === 'error' ? 'bg-red-100' :
                  v.criticidad === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}
              >
                {v.valido ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : v.criticidad === 'error' ? (
                  <X className="h-4 w-4 text-red-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <span className={`text-sm ${v.valido ? 'text-green-700' : v.criticidad === 'error' ? 'text-red-700' : 'text-yellow-700'}`}>
                  {v.label}
                </span>
              </div>
            ))}
          </div>
          
          {errores.length > 0 && (
            <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                <strong>{errores.length} errores</strong> deben corregirse antes de crear la campaña
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview de secciones */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Info General */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Campaña:</span>
              <span className="font-semibold">{data.nombre || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cliente:</span>
              <span className="font-semibold flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {data.anunciante || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Producto:</span>
              <span>{data.producto || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ejecutivo:</span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> {data.ejecutivo || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vigencia:</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {data.fechaInicio || '—'} al {data.fechaFin || '—'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Financiero */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Resumen Financiero
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Valor Bruto:</span>
              <span>{formatMoney(data.valorBruto || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-700 font-semibold">
              <span>Valor Neto:</span>
              <span className="text-lg">{formatMoney(totalValor)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Modalidad:</span>
              <Badge variant="secondary">{data.modalidad || 'Paquete'}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Comisión:</span>
              <span className="flex items-center gap-1">
                <Percent className="h-3 w-3" /> {data.comisionAgencia || 15}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Facturación:</span>
              <Badge variant="outline">{data.estiloFacturacion || 'Posterior'}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Propiedades */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Propiedades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {data.tipoPedido && <Badge className="bg-blue-100 text-blue-700">{data.tipoPedido}</Badge>}
              {data.tipoPauta && <Badge className="bg-green-100 text-green-700">{data.tipoPauta}</Badge>}
              {data.categoria && <Badge className="bg-purple-100 text-purple-700">{data.categoria}</Badge>}
              {!data.tipoPedido && !data.tipoPauta && !data.categoria && (
                <span className="text-gray-400 text-sm">Sin propiedades asignadas</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Programación */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="w-4 h-4 text-orange-500" />
              Programación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-orange-50 rounded-lg p-2">
                <div className="text-2xl font-bold text-orange-700">{totalLineas}</div>
                <div className="text-xs text-orange-600">Líneas</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-2">
                <div className="text-2xl font-bold text-orange-700">{totalSpots}</div>
                <div className="text-xs text-orange-600">Spots</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-2xl font-bold text-green-700">98</div>
                <div className="text-xs text-green-600">Score IA</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón crear */}
      <div className="pt-4 flex justify-center">
        <Button 
          size="lg" 
          onClick={() => setMostrarConfirmacion(true)} 
          disabled={!puedeCrear || isCreating}
          className={`px-12 py-6 text-xl rounded-xl shadow-xl transition-all ${
            puedeCrear 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-200' 
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <Zap className="w-6 h-6 mr-2" />
          Confirmar y Crear Campaña
          <ArrowRight className="w-6 h-6 ml-2" />
        </Button>
      </div>

      <div className="text-center text-xs text-slate-400">
        Al confirmar, se generará la orden de trabajo OT-{new Date().getFullYear()}-00XX
      </div>

      {/* Modal de confirmación */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setMostrarConfirmacion(false)}>
          <Card className="w-[500px] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <CardHeader className="text-center border-b">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle>¿Confirmar creación de campaña?</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="font-semibold text-lg text-gray-900">{data.nombre}</div>
                  <div className="text-gray-500">{data.anunciante}</div>
                  <div className="text-2xl font-bold text-green-700 mt-2">{formatMoney(totalValor)}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setMostrarConfirmacion(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700" 
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creando...</>
                  ) : (
                    <><CheckCircle className="h-4 w-4 mr-2" /> Confirmar</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default StepRevisionFinal
