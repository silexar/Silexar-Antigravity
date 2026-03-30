/**
 * 🎯 SILEXAR PULSE — Campañas: Helpers y Formatters
 * 
 * Funciones utilitarias para formateo y presentación de datos.
 * 
 * @module campanas/helpers
 * @version 2026.3.0
 */

import { Badge } from '@/components/ui/badge'

/**
 * Formatear fecha a formato chileno DD/MM/YYYY
 */
export function formatFecha(fecha: string): string {
  const d = new Date(fecha)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * Formatear valor monetario en formato abreviado
 */
export function formatMoney(valor: number): string {
  if (valor >= 1000000) return `$${(valor / 1000000).toFixed(1)}M`
  if (valor >= 1000) return `$${(valor / 1000).toFixed(0)}K`
  return `$${valor.toLocaleString('es-CL')}`
}

/**
 * Configuración de estados para badges
 */
const ESTADO_CONFIG: Record<string, { icon: string; label: string; class: string }> = {
  'borrador': { icon: '📝', label: 'Borrador', class: 'bg-gray-100 text-gray-700' },
  'planificando': { icon: '⚠️', label: 'Planificando', class: 'bg-yellow-100 text-yellow-700' },
  'ejecutando': { icon: '✅', label: 'Ejecutando', class: 'bg-green-100 text-green-700' },
  'completada': { icon: '✔️', label: 'Completada', class: 'bg-blue-100 text-blue-700' },
  'conflictos': { icon: '🔴', label: 'Conflictos', class: 'bg-red-100 text-red-700' }
}

/**
 * Obtener Badge de estado para una campaña
 */
export function getEstadoBadge(estado: string) {
  const c = ESTADO_CONFIG[estado] || ESTADO_CONFIG['borrador']
  return <Badge className={`${c.class} font-medium`}>{c.icon} {c.label}</Badge>
}
