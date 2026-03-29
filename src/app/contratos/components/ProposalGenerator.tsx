/**
 * 📄 DESKTOP: Generador de Propuestas IA
 * 
 * Genera propuestas comerciales completas con IA en 1 click:
 * - Seleccionar cliente → IA pre-llena historial
 * - Elegir plantilla o escribir objetivo
 * - IA genera propuesta con medios, presupuesto, calendario
 * - Exportar PDF / enviar email directo
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

'use client';

import { useState } from 'react';
import {
  Sparkles, Send, Download,
  Building2, DollarSign, Radio, Tv,
  Globe, CheckCircle2, Loader2, Copy,
  ArrowRight, Zap, Calendar, Target,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ClienteSugerido {
  id: string;
  nombre: string;
  rubro: string;
  ultimoContrato: string;
  valorAnterior: number;
}

interface PropuestaGenerada {
  titulo: string;
  objetivo: string;
  medios: { nombre: string; tipo: string; cantidad: number; tarifa: number }[];
  duracion: string;
  presupuestoTotal: number;
  descuentoSugerido: number;
  argumentosVenta: string[];
}

const CLIENTES: ClienteSugerido[] = [
  { id: 'cli-001', nombre: 'Banco Chile', rubro: 'Banca', ultimoContrato: 'SP-2024-0142', valorAnterior: 85000000 },
  { id: 'cli-002', nombre: 'Falabella', rubro: 'Retail', ultimoContrato: 'SP-2024-0189', valorAnterior: 120000000 },
  { id: 'cli-003', nombre: 'Cencosud', rubro: 'Retail', ultimoContrato: 'SP-2024-0201', valorAnterior: 45000000 },
  { id: 'cli-007', nombre: 'LATAM', rubro: 'Aerolínea', ultimoContrato: 'SP-2024-0088', valorAnterior: 200000000 },
  { id: 'cli-010', nombre: 'Ripley', rubro: 'Retail', ultimoContrato: '', valorAnterior: 0 },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════

export function ProposalGenerator() {
  const [step, setStep] = useState<'cliente' | 'config' | 'generando' | 'resultado'>('cliente');
  const [clienteId, setClienteId] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [propuesta, setPropuesta] = useState<PropuestaGenerada | null>(null);
  const [search, setSearch] = useState('');

  const clientesFiltrados = CLIENTES.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const generarPropuesta = async () => {
    setStep('generando');
    const cliente = CLIENTES.find(c => c.id === clienteId);

    // Simular IA generando propuesta (2 segundos)
    await new Promise(r => setTimeout(r, 2000));

    setPropuesta({
      titulo: `Propuesta Comercial ${cliente?.nombre || 'Cliente'} — Q2 2025`,
      objetivo: objetivo || `Campaña multimedia Q2 para incrementar awareness y conversión`,
      medios: [
        { nombre: 'Radio Corazón', tipo: 'Radio FM', cantidad: 25, tarifa: 675000 },
        { nombre: 'ADN Radio', tipo: 'Radio FM', cantidad: 15, tarifa: 832000 },
        { nombre: 'Canal 13', tipo: 'TV Abierta', cantidad: 8, tarifa: 5000000 },
        { nombre: 'Google Ads', tipo: 'Digital SEM', cantidad: 1, tarifa: 12000000 },
      ],
      duracion: '2 meses (Abril - Mayo 2025)',
      presupuestoTotal: Number(presupuesto) || (cliente?.valorAnterior ? Math.round(cliente.valorAnterior * 1.1) : 80000000),
      descuentoSugerido: 12,
      argumentosVenta: [
        `Cobertura multimedia integrada: Radio + TV + Digital`,
        `Historial exitoso: ${cliente?.ultimoContrato ? `contrato ${cliente.ultimoContrato} renovado` : 'nueva oportunidad'}`,
        `ROI estimado 3.2x basado en campañas similares del sector ${cliente?.rubro}`,
        `Horarios prime validados con datos de audiencia actualizados`,
      ],
    });
    setStep('resultado');
  };

  return (
    <div className="neo-card rounded-2xl overflow-hidden">
      {/* HEADER */}
      <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 border-b border-violet-100 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-violet-600" />
        <div>
          <h2 className="font-black text-lg text-slate-800">Generador de Propuestas IA</h2>
          <p className="text-xs text-slate-500">Crea propuestas comerciales en segundos</p>
        </div>
      </div>

      <div className="p-6">
        {/* PASO 1: SELECCIONAR CLIENTE */}
        {step === 'cliente' && (
          <div className="space-y-4">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-violet-400" />
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {clientesFiltrados.map(c => (
                <button key={c.id} onClick={() => { setClienteId(c.id); setStep('config'); }}
                  className={`p-4 rounded-xl border text-left transition hover:border-violet-300 hover:bg-violet-50 ${
                    clienteId === c.id ? 'border-violet-400 bg-violet-50' : 'border-slate-100'
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-violet-500" />
                    <p className="font-bold text-sm text-slate-800">{c.nombre}</p>
                  </div>
                  <p className="text-[10px] text-slate-400">{c.rubro}</p>
                  {c.valorAnterior > 0 && (
                    <p className="text-[10px] text-violet-500 mt-1">Último: ${(c.valorAnterior / 1e6).toFixed(0)}M</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: CONFIGURAR */}
        {step === 'config' && (
          <div className="space-y-4">
            <div className="p-3 bg-violet-50 rounded-xl flex items-center gap-2">
              <Building2 className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-bold text-violet-700">
                {CLIENTES.find(c => c.id === clienteId)?.nombre}
              </span>
              <button onClick={() => setStep('cliente')} className="ml-auto text-xs text-violet-500 hover:underline">Cambiar</button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Objetivo de la campaña (opcional)</label>
              <textarea value={objetivo} onChange={e => setObjetivo(e.target.value)}
                placeholder="Ej: Incrementar ventas navideñas 20%... La IA completará si lo dejas vacío"
                rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Presupuesto objetivo (opcional)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={presupuesto} onChange={e => setPresupuesto(e.target.value)}
                  placeholder="La IA sugerirá basado en historial"
                  type="number" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-violet-400" />
              </div>
            </div>

            <button onClick={generarPropuesta}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-200 transition">
              <Sparkles className="w-5 h-5" /> Generar Propuesta con IA
            </button>
          </div>
        )}

        {/* GENERANDO */}
        {step === 'generando' && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto" />
            <p className="mt-4 font-bold text-slate-700">Generando propuesta...</p>
            <p className="text-xs text-slate-400 mt-1">IA analizando historial, medios y mercado</p>
          </div>
        )}

        {/* RESULTADO */}
        {step === 'resultado' && propuesta && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="font-black text-lg text-slate-800">{propuesta.titulo}</h3>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-400 mb-1">Objetivo</p>
              <p className="text-sm text-slate-700">{propuesta.objetivo}</p>
            </div>

            {/* MEDIOS SUGERIDOS */}
            <div>
              <p className="text-xs font-bold text-slate-400 mb-2">Medios Sugeridos</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-slate-400 border-b border-slate-100">
                    <th className="text-left py-2">Medio</th>
                    <th className="text-left py-2">Tipo</th>
                    <th className="text-right py-2">Cant.</th>
                    <th className="text-right py-2">Tarifa</th>
                    <th className="text-right py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {propuesta.medios.map((m, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-2 font-bold text-slate-700 flex items-center gap-1">
                        {m.tipo.includes('Radio') ? <Radio className="w-3 h-3 text-blue-400" /> :
                         m.tipo.includes('TV') ? <Tv className="w-3 h-3 text-purple-400" /> :
                         <Globe className="w-3 h-3 text-cyan-400" />}
                        {m.nombre}
                      </td>
                      <td className="py-2 text-slate-500">{m.tipo}</td>
                      <td className="py-2 text-right text-slate-600">{m.cantidad}</td>
                      <td className="py-2 text-right text-slate-600">${(m.tarifa / 1e6).toFixed(2)}M</td>
                      <td className="py-2 text-right font-bold text-slate-700">${(m.cantidad * m.tarifa / 1e6).toFixed(1)}M</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RESUMEN */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-violet-50 rounded-xl p-3 text-center">
                <DollarSign className="w-4 h-4 text-violet-500 mx-auto" />
                <p className="text-lg font-black text-slate-800 mt-1">${(propuesta.presupuestoTotal / 1e6).toFixed(0)}M</p>
                <p className="text-[9px] text-violet-500">Presupuesto</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <Target className="w-4 h-4 text-emerald-500 mx-auto" />
                <p className="text-lg font-black text-slate-800 mt-1">{propuesta.descuentoSugerido}%</p>
                <p className="text-[9px] text-emerald-500">Descuento</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <Calendar className="w-4 h-4 text-blue-500 mx-auto" />
                <p className="text-lg font-black text-slate-800 mt-1">2 meses</p>
                <p className="text-[9px] text-blue-500">Duración</p>
              </div>
            </div>

            {/* ARGUMENTOS VENTA */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-[10px] font-bold text-amber-700 mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Argumentos de Venta IA
              </p>
              {propuesta.argumentosVenta.map((a, i) => (
                <p key={i} className="text-xs text-amber-700 mt-1 flex items-start gap-1.5">
                  <ArrowRight className="w-3 h-3 shrink-0 mt-0.5" /> {a}
                </p>
              ))}
            </div>

            {/* ACCIONES */}
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-blue-700 shadow-lg transition">
                <Send className="w-4 h-4" /> Enviar al Cliente
              </button>
              <button className="py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-1 hover:bg-slate-50">
                <Download className="w-4 h-4" /> PDF
              </button>
              <button className="py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-1 hover:bg-slate-50">
                <Copy className="w-4 h-4" /> Copiar
              </button>
            </div>

            <button onClick={() => { setStep('cliente'); setPropuesta(null); setObjetivo(''); setPresupuesto(''); }}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-600">
              Nueva propuesta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
