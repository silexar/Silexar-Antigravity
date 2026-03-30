import { inicializarDatosDemo, obtenerTiposPropiedadAction } from '../../../modules/propiedades/infrastructure/actions/propiedadesActions';
import { MobilePropiedadesDashboard } from './_components/MobilePropiedadesDashboard';
import { Metadata } from 'next';

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Propiedades Mobile | Silexar Pulse',
  description: 'Gestión móvil de propiedades y taxonomías',
};

export default async function MobilePropiedadesPage() {
  await inicializarDatosDemo();
  const tipos = await obtenerTiposPropiedadAction();

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <MobilePropiedadesDashboard tiposIniciales={tipos} />
    </div>
  );
}
