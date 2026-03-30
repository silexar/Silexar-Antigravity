/**
 * 🚀 Page: Crear Campaña
 * Route: /campanas/crear
 */

import CrearCampanaWizard from './components/WizardCampana';

export default function CrearCampanaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <CrearCampanaWizard />
    </div>
  );
}
