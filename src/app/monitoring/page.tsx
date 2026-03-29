/**
 * TIER 0 Monitoring Dashboard Page - Quantum-Enhanced System Monitoring
 * 
 * @description Pentagon++ quantum-enhanced monitoring dashboard with consciousness-level
 * system observability and transcendent performance insights.
 * 
 * @version 2040.1.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

import { Metadata } from 'next';
import { Tier0MonitoringDashboard } from '@/components/monitoring/tier0-monitoring-dashboard';

export const metadata: Metadata = {
  title: 'TIER 0 Monitoring Dashboard | Silexar Pulse Quantum',
  description: 'Pentagon++ quantum-enhanced monitoring dashboard with consciousness-level system observability and transcendent performance insights.',
  keywords: [
    'monitoring',
    'observability',
    'performance metrics',
    'system health',
    'quantum enhancement',
    'Pentagon++ security',
    'TIER 0 supremacy',
    'consciousness-level insights'
  ],
  robots: 'index, follow',
  openGraph: {
    title: 'TIER 0 Monitoring Dashboard',
    description: 'Consciousness-level system monitoring with quantum enhancement',
    type: 'website',
  },
};

/**
 * TIER 0 Monitoring Dashboard Page Component
 * Pentagon++ quantum-enhanced monitoring interface
 */
export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation breadcrumb */}
      <div className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">
              Home
            </a>
            <span>/</span>
            <span className="text-foreground font-medium">Monitoring Dashboard</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto">
        <Tier0MonitoringDashboard />
      </main>

      {/* Footer info */}
      <footer className="border-t bg-muted/30 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              TIER 0 Monitoring System powered by Pentagon++ quantum enhancement
            </p>
            <p className="mt-1">
              Consciousness-level system observability with transcendent performance insights
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}