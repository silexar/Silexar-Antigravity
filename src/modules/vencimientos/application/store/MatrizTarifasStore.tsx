'use client'

/**
 * STORE: MATRIZ TARIFARIA DINÁMICA - TIER 0
 * 
 * @description Contexto local (zustand a futuro, React Context por ahora) para 
 * almacenar la tabla de factores comerciales que definen cuánto vale una 
 * frase dependiente de su duración. Reemplaza la lógica matemática proporcional.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react'
/* eslint-disable react-refresh/only-export-components */

// El Factor es un porcentaje matemático. 1.0 = 100% (tarifa base de 30s)
export type MatrizFactores = Record<number, number>

export interface TariffAuditLog {
  id: string
  fechaIso: string
  usuario: string
  segundos: number
  factorAnterior: number
  factorNuevo: number
}

interface TarifasContextProps {
  factores: MatrizFactores
  auditLogs: TariffAuditLog[]
  actualizarFactor: (segundos: number, nuevoPorcentaje: number) => void
  obtenerFactorParaDuracion: (segundos: number) => number
}

const DEFAULT_FACTORES: MatrizFactores = {
  5: 0.35,   // 5s cobra 35% de 30s
  10: 0.50,  // 10s cobra 50% de 30s
  15: 0.65,  // 15s cobra 65% de 30s
  20: 0.80,
  25: 0.90,
  30: 1.00,  // Base Line
  45: 1.40,  // No es 1.5, hay un pequeño descuento por volumen
  60: 1.80,  // No es 2.0, incentivo a comprar más largo
  90: 2.50   // No es 3.0
}

const TarifasContext = createContext<TarifasContextProps | undefined>(undefined)

export const TarifasProvider = ({ children }: { children: ReactNode }) => {
  const [factores, setFactores] = useState<MatrizFactores>(DEFAULT_FACTORES)
  const [auditLogs, setAuditLogs] = useState<TariffAuditLog[]>([])

  const actualizarFactor = (segundos: number, nuevoPorcentaje: number) => {
    const factorAnterior = factores[segundos] || 0
    
    // Solo auditamos si realmente hay un cambio táctico
    if (factorAnterior !== nuevoPorcentaje) {
      setAuditLogs(prev => [{
        id: Date.now().toString(),
        fechaIso: new Date().toISOString(),
        usuario: 'gerencia_central_gg', // Mock
        segundos, factorAnterior, factorNuevo: nuevoPorcentaje
      }, ...prev])
    }

    setFactores(prev => ({ ...prev, [segundos]: nuevoPorcentaje }))
  }

  // Lógica de interpolación: Si piden 12s y tenemos 10 y 15, o buscamos el superior más cercano
  // Por regla comercial genérica: cobraremos el factor del tramo inmediatamente superior.
  const obtenerFactorParaDuracion = (segundos: number): number => {
    if (factores[segundos]) return factores[segundos]
    
    // Si la radio no definió el factor exacto para "12s", buscamos el escalón superior.
    const tramos = Object.keys(factores).map(Number).sort((a,b) => a-b)
    const tramoSuperior = tramos.find(t => t >= segundos)
    
    if (tramoSuperior) {
      return factores[tramoSuperior]
    }
    
    // Si piden 120s y el máximo configurado es 90s, escalamos proporcionalmente 
    // usando el máximo factor como ratio base.
    const maxEscalon = tramos[tramos.length - 1]
    return factores[maxEscalon] * (segundos / maxEscalon)
  }

  return (
    <TarifasContext.Provider value={{ factores, auditLogs, actualizarFactor, obtenerFactorParaDuracion }}>
      {children}
    </TarifasContext.Provider>
  )
}

export const useMatrizTarifas = () => {
  const context = useContext(TarifasContext)
  if (!context) throw new Error('useMatrizTarifas debe estar dentro de un TarifasProvider')
  return context
}
