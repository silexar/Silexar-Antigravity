import { Metadata } from 'next';

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

export default function MonitoringLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
