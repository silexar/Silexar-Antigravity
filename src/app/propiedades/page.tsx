import { inicializarDatosDemo, obtenerTiposPropiedadAction } from '../../modules/propiedades/infrastructure/actions/propiedadesActions';
import { DesktopPropiedadesDashboard } from './components/DesktopPropiedadesDashboard';
import { Metadata } from 'next';

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Módulo de Propiedades | Silexar Pulse',
  description: 'Centro de Gestión de Propiedades y Taxonomías',
};

export default async function PropiedadesPage() {
  // Inicialización de datos mockup simulando la base de datos para la UI
  await inicializarDatosDemo();
  
  // Obtenemos el árbol de propiedades
  const tipos = await obtenerTiposPropiedadAction();

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 overflow-hidden flex flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <span className="text-xl">🏷️</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Centro de Gestión de Propiedades</h1>
          <p className="text-sm text-slate-500">Dashboard &gt; Configuración &gt; Propiedades</p>
        </div>
      </div>
      
      <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden shadow-indigo-100/50 ring-1 ring-slate-900/5">
        <DesktopPropiedadesDashboard tiposIniciales={tipos} />
      </div>
    </div>
  );
}
