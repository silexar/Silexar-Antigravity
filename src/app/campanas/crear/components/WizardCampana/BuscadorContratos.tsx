/**
 * 🔍 Buscador Contratos Inteligente - Enterprise 2050
 * 
 * Autocomplete con búsqueda inteligente de contratos:
 * - Búsqueda por número, cliente, ejecutivo
 * - Validación de vigencia automática
 * - Info detallada con RUT y status
 * 
 * @enterprise TIER0 Fortune 10
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Search, FileText, CheckCircle, AlertTriangle, X, 
  Building2, User, DollarSign, Loader2
} from 'lucide-react'

interface Contrato {
  id: string
  numero: string
  cliente: string
  rut: string
  statusCliente: 'AAA' | 'AA' | 'A' | 'B' | 'C'
  ejecutivo: string
  vigenciaInicio: string
  vigenciaFin: string
  valorTotal: number
  estado: 'vigente' | 'por_vencer' | 'vencido'
}

interface BuscadorContratosProps {
  onSelect: (contrato: Contrato) => void
  valorInicial?: string
}

// Mock de contratos
const CONTRATOS_MOCK: Contrato[] = [
  {
    id: 'con-001',
    numero: 'CON-2025-0234',
    cliente: 'BANCO DE CHILE',
    rut: '97.004.000-5',
    statusCliente: 'AAA',
    ejecutivo: 'Ana García',
    vigenciaInicio: '2025-01-01',
    vigenciaFin: '2025-12-31',
    valorTotal: 25000000,
    estado: 'vigente'
  },
  {
    id: 'con-002',
    numero: 'CON-2025-0189',
    cliente: 'COCA COLA CHILE',
    rut: '96.885.100-7',
    statusCliente: 'AAA',
    ejecutivo: 'Carlos Ruiz',
    vigenciaInicio: '2025-01-01',
    vigenciaFin: '2025-06-30',
    valorTotal: 45000000,
    estado: 'por_vencer'
  },
  {
    id: 'con-003',
    numero: 'CON-2025-0156',
    cliente: 'TOYOTA CHILE',
    rut: '96.578.900-3',
    statusCliente: 'AA',
    ejecutivo: 'María López',
    vigenciaInicio: '2024-01-01',
    vigenciaFin: '2024-12-31',
    valorTotal: 35000000,
    estado: 'vencido'
  },
  {
    id: 'con-004',
    numero: 'CON-2025-0298',
    cliente: 'FALABELLA',
    rut: '90.749.000-9',
    statusCliente: 'AAA',
    ejecutivo: 'Pedro Sánchez',
    vigenciaInicio: '2025-01-01',
    vigenciaFin: '2025-12-31',
    valorTotal: 60000000,
    estado: 'vigente'
  },
  {
    id: 'con-005',
    numero: 'CON-2025-0312',
    cliente: 'ENTEL',
    rut: '92.580.000-7',
    statusCliente: 'AA',
    ejecutivo: 'Laura Martínez',
    vigenciaInicio: '2025-01-01',
    vigenciaFin: '2026-03-31',
    valorTotal: 80000000,
    estado: 'vigente'
  }
]

export function BuscadorContratos({ onSelect, valorInicial }: BuscadorContratosProps) {
  const [busqueda, setBusqueda] = useState(valorInicial || '')
  const [resultados, setResultados] = useState<Contrato[]>([])
  const [mostrarResultados, setMostrarResultados] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [contratoSeleccionado, setContratoSeleccionado] = useState<Contrato | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Buscar contratos
  useEffect(() => {
    if (busqueda.length < 2) {
      setResultados([])
      return
    }

    setCargando(true)
    const timer = setTimeout(() => {
      const term = busqueda.toLowerCase()
      const encontrados = CONTRATOS_MOCK.filter(c =>
        c.numero.toLowerCase().includes(term) ||
        c.cliente.toLowerCase().includes(term) ||
        c.ejecutivo.toLowerCase().includes(term)
      )
      setResultados(encontrados)
      setCargando(false)
    }, 300) // Simular delay de API

    return () => clearTimeout(timer)
  }, [busqueda])

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMostrarResultados(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const seleccionar = (contrato: Contrato) => {
    setContratoSeleccionado(contrato)
    setBusqueda(contrato.numero)
    setMostrarResultados(false)
    onSelect(contrato)
  }

  const limpiar = () => {
    setContratoSeleccionado(null)
    setBusqueda('')
    setResultados([])
    inputRef.current?.focus()
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" /> Vigente</Badge>
      case 'por_vencer':
        return <Badge className="bg-yellow-100 text-yellow-700"><AlertTriangle className="h-3 w-3 mr-1" /> Por vencer</Badge>
      case 'vencido':
        return <Badge className="bg-red-100 text-red-700"><X className="h-3 w-3 mr-1" /> Vencido</Badge>
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AAA': return 'bg-green-500'
      case 'AA': return 'bg-blue-500'
      case 'A': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const formatMoney = (valor: number) => `$${(valor / 1000000).toFixed(1)}M`

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          placeholder="🔍 Buscar: CON-2025-0234, Banco Chile, Ana García..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setMostrarResultados(true)
          }}
          onFocus={() => setMostrarResultados(true)}
          className="pl-10 pr-24"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {cargando && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
          {contratoSeleccionado && (
            <>
              {getEstadoBadge(contratoSeleccionado.estado)}
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={limpiar}>
                <X className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Dropdown de resultados */}
      {mostrarResultados && resultados.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl z-50 max-h-80 overflow-auto">
          {resultados.map(contrato => (
            <button
              key={contrato.id}
              className="w-full text-left p-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
              onClick={() => seleccionar(contrato)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="font-mono font-semibold text-blue-700">{contrato.numero}</span>
                </div>
                {getEstadoBadge(contrato.estado)}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-gray-400" />
                  <span className="font-medium">{contrato.cliente}</span>
                </span>
                <Badge className={`${getStatusColor(contrato.statusCliente)} text-white text-xs`}>
                  {contrato.statusCliente}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                <span>RUT: {contrato.rut}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {contrato.ejecutivo}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatMoney(contrato.valorTotal)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Info contrato seleccionado */}
      {contratoSeleccionado && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-blue-900">{contratoSeleccionado.cliente}</span>
                <Badge className={`${getStatusColor(contratoSeleccionado.statusCliente)} text-white text-xs`}>
                  Cliente {contratoSeleccionado.statusCliente}
                </Badge>
              </div>
              <div className="text-sm text-blue-700 mt-1">
                RUT: {contratoSeleccionado.rut} • {contratoSeleccionado.ejecutivo} • 
                Vigente hasta {new Date(contratoSeleccionado.vigenciaFin).toLocaleDateString('es-CL')}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-700">{formatMoney(contratoSeleccionado.valorTotal)}</div>
              <div className="text-xs text-gray-500">Valor contrato</div>
            </div>
          </div>
        </div>
      )}

      {/* Sugerencias cuando no hay búsqueda */}
      {mostrarResultados && busqueda.length < 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl z-50 p-3">
          <p className="text-sm text-gray-500 mb-2">💡 Sugerencias recientes:</p>
          <div className="space-y-1">
            {CONTRATOS_MOCK.slice(0, 3).map(c => (
              <button
                key={c.id}
                className="w-full text-left text-sm p-2 hover:bg-gray-50 rounded flex items-center gap-2"
                onClick={() => seleccionar(c)}
              >
                <FileText className="h-3 w-3 text-gray-400" />
                <span className="font-mono">{c.numero}</span>
                <span className="text-gray-500">-</span>
                <span>{c.cliente}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BuscadorContratos
