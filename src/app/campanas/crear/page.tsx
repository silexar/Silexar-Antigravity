/**
 * 🚀 Page: Crear Campaña
 * Route: /campanas/crear
 */

import CrearCampanaWizard from './components/WizardCampana';

export default function CrearCampanaPage() {
  return (
    <div className="min-h-screen" style={{ background: '#dfeaff' }}>
      <CrearCampanaWizard />
    </div>
  );
}
