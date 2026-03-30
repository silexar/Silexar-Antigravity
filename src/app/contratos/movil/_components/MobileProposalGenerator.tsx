/**
 * 📄 MOBILE: Generador de Propuestas Rápido
 * 
 * Genera propuestas con IA desde el móvil en 3 toques:
 * seleccionar cliente → IA genera → enviar.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  Sparkles, Send, Download, Building2,
  DollarSign, CheckCircle2, Loader2,
  Radio, Tv, Globe, Zap, ArrowRight,
} from 'lucide-react';

interface Cliente { id: string; nombre: string; rubro: string; valor: number; }
interface Medio { nombre: string; tipo: string; cant: number; tarifa: number; }
interface Propuesta { titulo: string; medios: Medio[]; total: number; desc: number; args: string[]; }

const CLIENTES: Cliente[] = [
  { id: 'c1', nombre: 'Banco Chile', rubro: 'Banca', valor: 85e6 },
  { id: 'c2', nombre: 'Falabella', rubro: 'Retail', valor: 120e6 },
  { id: 'c3', nombre: 'Cencosud', rubro: 'Retail', valor: 45e6 },
  { id: 'c4', nombre: 'LATAM', rubro: 'Aerolínea', valor: 200e6 },
  { id: 'c5', nombre: 'Ripley', rubro: 'Retail', valor: 0 },
];

export function MobileProposalGenerator() {
  const [step, setStep] = useState<'cliente' | 'generando' | 'resultado'>('cliente');
  const [, setClienteId] = useState('');
  const [propuesta, setPropuesta] = useState<Propuesta | null>(null);

  const generar = async (cId: string) => {
    setClienteId(cId);
    setStep('generando');
    const cl = CLIENTES.find(c => c.id === cId);
    await new Promise(r => setTimeout(r, 1800));

    setPropuesta({
      titulo: `Propuesta ${cl?.nombre} Q2 2025`,
      medios: [
        { nombre: 'Radio Corazón', tipo: 'Radio', cant: 25, tarifa: 675000 },
        { nombre: 'ADN Radio', tipo: 'Radio', cant: 15, tarifa: 832000 },
        { nombre: 'Canal 13', tipo: 'TV', cant: 8, tarifa: 5000000 },
        { nombre: 'Google Ads', tipo: 'Digital', cant: 1, tarifa: 12000000 },
      ],
      total: Math.round((cl?.valor || 80e6) * 1.1),
      desc: 12,
      args: [
        'Cobertura multimedia integrada',
        `ROI 3.2x sector ${cl?.rubro}`,
        'Horarios prime validados',
      ],
    });
    setStep('resultado');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-800">Propuesta Rápida</h3>
          <p className="text-xs text-slate-500">IA genera en segundos</p>
        </div>
      </div>

      {/* CLIENTE */}
      {step === 'cliente' && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400">Seleccionar cliente</p>
          {CLIENTES.map(c => (
            <button key={c.id} onClick={() => generar(c.id)}
              className="w-full p-3 neo-mobile-card rounded-xl flex items-center gap-3 active:scale-[0.97]">
              <Building2 className="w-5 h-5 text-violet-500" />
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-slate-800">{c.nombre}</p>
                <p className="text-[10px] text-slate-400">{c.rubro}{c.valor > 0 ? ` · $${(c.valor / 1e6).toFixed(0)}M anterior` : ''}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </button>
          ))}
        </div>
      )}

      {/* GENERANDO */}
      {step === 'generando' && (
        <div className="text-center py-10">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin mx-auto" />
          <p className="mt-3 font-bold text-slate-700">Generando propuesta...</p>
          <p className="text-[10px] text-slate-400 mt-1">IA analizando historial y mercado</p>
        </div>
      )}

      {/* RESULTADO */}
      {step === 'resultado' && propuesta && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <p className="font-bold text-sm text-slate-800">{propuesta.titulo}</p>
          </div>

          {/* MEDIOS */}
          <div className="space-y-1.5">
            {propuesta.medios.map((m, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                {m.tipo === 'Radio' ? <Radio className="w-3 h-3 text-blue-500" /> :
                 m.tipo === 'TV' ? <Tv className="w-3 h-3 text-purple-500" /> :
                 <Globe className="w-3 h-3 text-cyan-500" />}
                <span className="text-xs font-bold text-slate-700 flex-1">{m.nombre}</span>
                <span className="text-[10px] text-slate-400">{m.cant}x</span>
                <span className="text-xs font-bold text-slate-600">${(m.cant * m.tarifa / 1e6).toFixed(1)}M</span>
              </div>
            ))}
          </div>

          {/* RESUMEN */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-violet-50 rounded-xl p-3 text-center">
              <DollarSign className="w-4 h-4 text-violet-500 mx-auto" />
              <p className="text-lg font-black text-slate-800">${(propuesta.total / 1e6).toFixed(0)}M</p>
              <p className="text-[9px] text-violet-500">Total</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <Zap className="w-4 h-4 text-emerald-500 mx-auto" />
              <p className="text-lg font-black text-slate-800">{propuesta.desc}%</p>
              <p className="text-[9px] text-emerald-500">Descuento</p>
            </div>
          </div>

          {/* ARGUMENTOS */}
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-[9px] font-bold text-amber-700 mb-1">Argumentos IA:</p>
            {propuesta.args.map((a, i) => (
              <p key={i} className="text-[10px] text-amber-600 flex items-start gap-1">
                <ArrowRight className="w-2.5 h-2.5 mt-0.5 shrink-0" /> {a}
              </p>
            ))}
          </div>

          {/* ACCIONES */}
          <div className="flex gap-2">
            <button className="flex-[2] py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-lg">
              <Send className="w-4 h-4" /> Enviar
            </button>
            <button className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-1 active:scale-95">
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>

          <button onClick={() => { setStep('cliente'); setPropuesta(null); }}
            className="w-full py-2 text-[10px] text-slate-400 font-bold">Nueva propuesta</button>
        </div>
      )}
    </div>
  );
}
