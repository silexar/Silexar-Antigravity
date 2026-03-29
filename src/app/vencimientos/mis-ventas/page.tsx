import MisVentasDashboard from '../_components/MisVentasDashboard'

/**
 * PAGE: MIS VENTAS (ESCRITORIO EJECUTIVO) - TIER 0 FASE 4
 *
 * @description Ruta dedicada para el Ejecutivo de Ventas con sus KPIs,
 * Oportunidades IA y el Cotizador de simulador de vuelo integrado.
 */
export default function MisVentasPage() {
  return (
    <div className="min-h-screen bg-[#ECEFF8] p-6">
      <MisVentasDashboard />
    </div>
  )
}
