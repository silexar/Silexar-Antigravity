import MLAlertDashboard from '@/components/monitoring/MLAlertDashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Alertas ML - Silexar Pulse Quantum',
  description: 'Sistema de alertas predictivas con inteligencia artificial para monitoreo proactivo del sistema',
}

export default function MLAlertsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Alertas con ML</h1>
          <p className="text-muted-foreground">
            Monitoreo predictivo con inteligencia artificial para prevención de problemas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">Sistema Activo</span>
        </div>
      </div>
      
      <MLAlertDashboard />
    </div>
  )
}