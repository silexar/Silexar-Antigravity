'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
/* eslint-disable react-refresh/only-export-components */

/**
 * STORE: BUSINESS RULES (TIER 0)
 * 
 * @description Estado global que administra las reglas de negocio propuestas por 
 * la IA (Cortex) y aprobadas por Gerencia. Permite activar funciones dinámicas 
 * como Surge Pricing (Uber-style) en las cotizaciones en tiempo real.
 */

export interface AiBusinessRule {
  id: string
  titulo: string
  descripcion: string
  tipo: 'surge_pricing' | 'anti_hoarding' | 'discount_lock'
  estado: 'propuesta' | 'activa' | 'rechazada'
  parametros: {
    thresholdOcupacion?: number
    multiplicadorTarifa?: number
    limiteReservaMonto?: number
    maxDescuentoAuto?: number
  }
}

export interface RuleAuditLog {
  id: string
  fechaIso: string
  usuario: string
  accion: 'APROBADA' | 'RECHAZADA'
  reglaId: string
  tituloAnterior: string
}

const REGLAS_INICIALES: AiBusinessRule[] = [
  {
    id: 'br-001',
    titulo: 'Surge Pricing (Alta Demanda)',
    descripcion: 'Si un programa supera el 85% de ocupación en su tanda, aplica automáticamente x1.3 al valor del segundo para maximizar yield.',
    tipo: 'surge_pricing',
    estado: 'propuesta',
    parametros: { thresholdOcupacion: 0.85, multiplicadorTarifa: 1.3 }
  },
  {
    id: 'br-002',
    titulo: 'Anti-Hoarding Script',
    descripcion: 'Bloquear a ejecutivos que acumulen más de $10M en reservas temporales simultáneas sin cerrar, evitando secuestro de inventario.',
    tipo: 'anti_hoarding',
    estado: 'activa', // Esta viene activa por defecto de gerencia
    parametros: { limiteReservaMonto: 10000000 }
  },
  {
    id: 'br-003',
    titulo: 'Candado de Descuentos',
    descripcion: 'Exigir token/aprobación de gerencia si el descuento supera el 25%.',
    tipo: 'discount_lock',
    estado: 'activa',
    parametros: { maxDescuentoAuto: 25 }
  }
]

interface BusinessRulesContextProps {
  reglas: AiBusinessRule[]
  auditLogs: RuleAuditLog[]
  aprobarRegla: (id: string) => void
  rechazarRegla: (id: string) => void
  obtenerReglaActiva: (tipo: AiBusinessRule['tipo']) => AiBusinessRule | undefined
}

const BusinessRulesContext = createContext<BusinessRulesContextProps | undefined>(undefined)

export const BusinessRulesProvider = ({ children }: { children: ReactNode }) => {
  const [reglas, setReglas] = useState<AiBusinessRule[]>(REGLAS_INICIALES)
  const [auditLogs, setAuditLogs] = useState<RuleAuditLog[]>([])

  const registrarAuditoria = (regla: AiBusinessRule, accion: 'APROBADA'|'RECHAZADA') => {
    setAuditLogs(prev => [{
      id: Date.now().toString(),
      fechaIso: new Date().toISOString(),
      usuario: 'gerencia_central_gg', // Simulado
      accion,
      reglaId: regla.id,
      tituloAnterior: regla.titulo
    }, ...prev])
  }

  const aprobarRegla = (id: string) => {
    const regla = reglas.find(r => r.id === id)
    if (regla) registrarAuditoria(regla, 'APROBADA')
    setReglas(prev => prev.map(r => r.id === id ? { ...r, estado: 'activa' } : r))
  }

  const rechazarRegla = (id: string) => {
    const regla = reglas.find(r => r.id === id)
    if (regla) registrarAuditoria(regla, 'RECHAZADA')
    setReglas(prev => prev.map(r => r.id === id ? { ...r, estado: 'rechazada' } : r))
  }

  const obtenerReglaActiva = (tipo: AiBusinessRule['tipo']) => {
    return reglas.find(r => r.tipo === tipo && r.estado === 'activa')
  }

  return (
    <BusinessRulesContext.Provider value={{ reglas, auditLogs, aprobarRegla, rechazarRegla, obtenerReglaActiva }}>
      {children}
    </BusinessRulesContext.Provider>
  )
}

export const useBusinessRules = () => {
  const context = useContext(BusinessRulesContext)
  if (!context) throw new Error('useBusinessRules debe estar dentro de un BusinessRulesProvider')
  return context
}
