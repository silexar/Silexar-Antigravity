/**
 * Layout compartido del Módulo Campañas
 * Aplica fondo neumórfico TIER 0 a todas las sub-rutas
 */

export default function CampanasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#dfeaff' }}>
      {children}
    </div>
  );
}
