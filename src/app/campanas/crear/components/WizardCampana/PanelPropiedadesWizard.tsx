/**
 * 🎯 Panel Propiedades Wizard - Enterprise 2050
 * 
 * Panel lateral para selección de propiedades de campaña:
 * - Tipo Pedido (Publicidad, Canje, Digital, Nuevos Negocios)
 * - Tipo Pauta (Prime, Auspicio, Menciones, Repartido)
 * - Categoría (Bancos, Automotriz, Retail, Telecom)
 * 
 * @enterprise TIER0 Fortune 10
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Settings, ChevronDown, ChevronUp, Check, X, 
  ShoppingCart, Radio, Tags, Sparkles
} from 'lucide-react'

interface Propiedad {
  id: string
  label: string
  descripcion?: string
}

interface GrupoPropiedad {
  id: string
  nombre: string
  icon: React.ReactNode
  opciones: Propiedad[]
}

interface PropiedadesSeleccionadas {
  tipoPedido?: string
  tipoPauta?: string
  categoria?: string
}

interface PanelPropiedadesProps {
  seleccionadas: PropiedadesSeleccionadas
  onUpdate: (props: PropiedadesSeleccionadas) => void
}

const GRUPOS_PROPIEDADES: GrupoPropiedad[] = [
  {
    id: 'tipoPedido',
    nombre: '🎵 Tipo Pedido',
    icon: <ShoppingCart className="h-4 w-4" />,
    opciones: [
      { id: '01_PUBLICIDAD', label: '01 PUBLICIDAD', descripcion: 'Pauta comercial estándar' },
      { id: '02_CANJE', label: '02 CANJE', descripcion: 'Intercambio comercial' },
      { id: '03_DIGITAL', label: '03 DIGITAL', descripcion: 'Pauta digital/streaming' },
      { id: '04_NUEVOS_NEGOCIOS', label: '04 NUEVOS NEGOCIOS', descripcion: 'Clientes nuevos' },
      { id: '05_ESPECIAL', label: '05 ESPECIAL', descripcion: 'Eventos y especiales' }
    ]
  },
  {
    id: 'tipoPauta',
    nombre: '📻 Tipo Pauta',
    icon: <Radio className="h-4 w-4" />,
    opciones: [
      { id: 'PRIME_DETERMINADO', label: 'PRIME DETERMINADO', descripcion: 'Horario fijo premium' },
      { id: 'AUSPICIO', label: 'AUSPICIO', descripcion: 'Auspicio de programa' },
      { id: 'MENCIONES', label: 'MENCIONES', descripcion: 'Menciones en vivo' },
      { id: 'REPARTIDO', label: 'REPARTIDO / ROTATIVO', descripcion: 'Distribución automática' },
      { id: 'FRASES', label: 'FRASES', descripcion: 'Frases cortas' }
    ]
  },
  {
    id: 'categoria',
    nombre: '🎯 Categoría',
    icon: <Tags className="h-4 w-4" />,
    opciones: [
      { id: 'BANCOS', label: 'BANCOS', descripcion: 'Servicios financieros' },
      { id: 'AUTOMOTRIZ', label: 'AUTOMOTRIZ', descripcion: 'Vehículos y accesorios' },
      { id: 'RETAIL', label: 'RETAIL', descripcion: 'Comercio minorista' },
      { id: 'TELECOM', label: 'TELECOMUNICACIONES', descripcion: 'Telefonía y datos' },
      { id: 'ALIMENTOS', label: 'ALIMENTOS', descripcion: 'Productos alimenticios' },
      { id: 'SALUD', label: 'SALUD', descripcion: 'Salud y bienestar' },
      { id: 'GOBIERNO', label: 'GOBIERNO', descripcion: 'Sector público' },
      { id: 'EDUCACION', label: 'EDUCACIÓN', descripcion: 'Instituciones educativas' }
    ]
  }
]

export function PanelPropiedadesWizard({ seleccionadas, onUpdate }: PanelPropiedadesProps) {
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set(['tipoPedido', 'tipoPauta', 'categoria']))

  const toggleGrupo = (id: string) => {
    setExpandidos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const seleccionarPropiedad = (grupoId: string, propiedadId: string) => {
    onUpdate({
      ...seleccionadas,
      [grupoId]: seleccionadas[grupoId as keyof PropiedadesSeleccionadas] === propiedadId 
        ? undefined 
        : propiedadId
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const propiedadesAsignadas = Object.entries(seleccionadas).filter(([_key, v]) => v)

  return (
    <Card className="h-full border-2 border-blue-100 shadow-lg">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          🎯 PROPIEDADES DISPONIBLES
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Grupos de propiedades */}
        {GRUPOS_PROPIEDADES.map(grupo => (
          <div key={grupo.id} className="border rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
              onClick={() => toggleGrupo(grupo.id)}
            >
              <div className="flex items-center gap-2 font-medium text-gray-700">
                {grupo.icon}
                {grupo.nombre}
              </div>
              {expandidos.has(grupo.id) ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            
            {expandidos.has(grupo.id) && (
              <div className="p-2 space-y-1 bg-white">
                {grupo.opciones.map(opcion => {
                  const isSelected = seleccionadas[grupo.id as keyof PropiedadesSeleccionadas] === opcion.id
                  return (
                    <button
                      key={opcion.id}
                      className={`w-full text-left p-2 rounded-lg transition-all flex items-center gap-2 ${
                        isSelected 
                          ? 'bg-blue-100 border-2 border-blue-400' 
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                      onClick={() => seleccionarPropiedad(grupo.id, opcion.id)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm ${isSelected ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                          {opcion.label}
                        </div>
                        {opcion.descripcion && (
                          <div className="text-xs text-gray-500">{opcion.descripcion}</div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {/* Propiedades asignadas */}
        <div className="border-t pt-3 mt-3">
          <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            📋 PROPIEDADES ASIGNADAS
          </h4>
          {propiedadesAsignadas.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Ninguna seleccionada</p>
          ) : (
            <div className="space-y-1">
              {propiedadesAsignadas.map(([key, value]) => {
                const grupo = GRUPOS_PROPIEDADES.find(g => g.id === key)
                const opcion = grupo?.opciones.find(o => o.id === value)
                return (
                  <div key={key} className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-700 gap-1">
                      <Check className="h-3 w-3" />
                      {opcion?.label || value}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => seleccionarPropiedad(key, value as string)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Botón gestionar */}
        <Button variant="outline" className="w-full mt-3 gap-2" size="sm">
          <Settings className="h-4 w-4" />
          ⚙️ Gestionar Propiedades
        </Button>
      </CardContent>
    </Card>
  )
}

export default PanelPropiedadesWizard
