'use client'

import { useState } from 'react';

export default function GestionProgramasView() {
  const [formData, setFormData] = useState({ nombre: '', horario: '', cupoMax: 20 });
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(`✅ Programa "${formData.nombre}" creado exitosamente (Simulador)`);
    setFormData({ nombre: '', horario: '', cupoMax: 20 });
    setTimeout(() => setMensaje(null), 3000);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-6" style={{ backdropFilter: 'blur(10px)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">📻 Centro de Gestión de Programas</h2>
          <p className="text-gray-500 text-sm mt-1">Crea nuevos bloques para comercializar integrados directo al Core TIER 0.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> ONLINE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-500 mb-1 uppercase tracking-wider">Nombre del Programa</label>
            <input
              type="text" required
              aria-label="Nombre del Programa"
              value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
              placeholder="Ej: Buenos Días Silexar"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-500 mb-1 uppercase tracking-wider">Franja Horaria</label>
              <select 
                value={formData.horario} onChange={e => setFormData({ ...formData, horario: e.target.value })}
                className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
              >
                <option value="">Seleccionar...</option>
                <option value="prime_am">Prime AM (06:00-10:00)</option>
                <option value="repartida">Repartida (10:00-17:00)</option>
                <option value="prime_pm">Prime PM (17:00-20:00)</option>
                <option value="noche">Noche (20:00-00:00)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 mb-1 uppercase tracking-wider">Cupos Máx.</label>
              <input
                type="number" min="1" required
                aria-label="Cupos Máximos"
                value={formData.cupoMax} onChange={e => setFormData({ ...formData, cupoMax: parseInt(e.target.value) })}
                className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all uppercase tracking-widest text-sm mt-4"
          >
            ✚ Inyectar al Core
          </button>
          
          {mensaje && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-500/20 text-emerald-600 text-xs font-bold rounded-lg animate-in fade-in slide-in-from-bottom-2">
              {mensaje}
            </div>
          )}
        </form>

        <div className="bg-white/80/30 rounded-xl border border-gray-200/50 p-5 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full"></div>
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">💡 Cortex Intelligence</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Nuestro sistema <strong>Domain-Driven</strong> automáticamente asociará este programa al Tarifario Base de la emisora. 
            Te sugerimos establecer un límite de cupos equilibrado para evitar fragmentación o saturación auditiva, Silexar te mostrará proyecciones financieras para este bloque enseguida.
          </p>
        </div>
      </div>
    </div>
  );
}
