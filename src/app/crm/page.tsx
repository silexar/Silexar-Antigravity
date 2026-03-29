/**
 * 🤝 SILEXAR PULSE - Página CRM Avanzado
 * 
 * @description Pipeline visual de oportunidades con scoring IA
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState } from 'react';
import { 
  Users, Plus, Search, TrendingUp, DollarSign, Target,
  ChevronRight, Star, AlertTriangle, Phone, Mail, Calendar,
  Sparkles, RefreshCw, BarChart3, ArrowRight
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Oportunidad {
  id: string;
  cliente: string;
  valor: number;
  probabilidad: number;
  etapa: string;
  vendedor: string;
  fechaCierre: string;
  diasEnEtapa: number;
  ultimaActividad: string;
}

interface Lead {
  id: string;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  scoreIA: number;
  etapa: string;
  proximaAccion: string;
}

// ═══════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════

const etapas = [
  { nombre: 'Nuevo', color: 'bg-slate-400' },
  { nombre: 'Contactado', color: 'bg-blue-400' },
  { nombre: 'Calificado', color: 'bg-cyan-400' },
  { nombre: 'Propuesta', color: 'bg-amber-400' },
  { nombre: 'Negociación', color: 'bg-purple-400' }
];

const oportunidades: Oportunidad[] = [
  { id: '1', cliente: 'Empresa ABC', valor: 24000000, probabilidad: 75, etapa: 'Propuesta', vendedor: 'Carlos M.', fechaCierre: '2025-12-28', diasEnEtapa: 5, ultimaActividad: 'Reunión hace 2 días' },
  { id: '2', cliente: 'Servicios XYZ', valor: 12000000, probabilidad: 60, etapa: 'Calificado', vendedor: 'María L.', fechaCierre: '2026-01-15', diasEnEtapa: 8, ultimaActividad: 'Email hace 4 días' },
  { id: '3', cliente: 'Tech Solutions', valor: 35000000, probabilidad: 45, etapa: 'Negociación', vendedor: 'Carlos M.', fechaCierre: '2025-12-22', diasEnEtapa: 12, ultimaActividad: 'Llamada hace 1 día' },
  { id: '4', cliente: 'Comercial DEF', valor: 8000000, probabilidad: 30, etapa: 'Contactado', vendedor: 'Juan P.', fechaCierre: '2026-01-30', diasEnEtapa: 3, ultimaActividad: 'Email enviado hoy' },
  { id: '5', cliente: 'Retail GHI', valor: 18000000, probabilidad: 85, etapa: 'Negociación', vendedor: 'María L.', fechaCierre: '2025-12-20', diasEnEtapa: 7, ultimaActividad: 'Propuesta enviada' }
];

const leads: Lead[] = [
  { id: '1', nombre: 'Roberto Sánchez', empresa: 'Nueva Corp', email: 'rsanchez@nueva.cl', telefono: '+56 9 1234 5678', scoreIA: 85, etapa: 'Nuevo', proximaAccion: 'Llamar para calificar' },
  { id: '2', nombre: 'Ana Fernández', empresa: 'Digital SpA', email: 'afernandez@digital.cl', telefono: '+56 9 2345 6789', scoreIA: 72, etapa: 'Contactado', proximaAccion: 'Enviar propuesta' },
  { id: '3', nombre: 'Pedro López', empresa: 'Media Group', email: 'plopez@media.cl', telefono: '+56 9 3456 7890', scoreIA: 45, etapa: 'Nuevo', proximaAccion: 'Primer contacto' }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const ScoreBadge = ({ score }: { score: number }) => {
  const color = score >= 70 ? 'bg-emerald-100 text-emerald-700' : score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${color}`}>
      <Star className="w-3 h-3 inline mr-1" />{score}
    </span>
  );
};

const ProbabilidadBarra = ({ prob }: { prob: number }) => {
  const color = prob >= 70 ? 'from-emerald-400 to-emerald-500' : prob >= 50 ? 'from-amber-400 to-amber-500' : 'from-red-400 to-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color}`} style={{ width: `${prob}%` }} />
      </div>
      <span className="text-xs font-medium">{prob}%</span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PÁGINA
// ═══════════════════════════════════════════════════════════════

export default function CRMPage() {
  const [vistaActiva, setVistaActiva] = useState<'pipeline' | 'leads'>('pipeline');
  
  const valorTotal = oportunidades.reduce((sum, o) => sum + o.valor, 0);
  const valorPonderado = oportunidades.reduce((sum, o) => sum + (o.valor * o.probabilidad / 100), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-rose-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-rose-600 bg-clip-text text-transparent flex items-center gap-3">
              <Users className="w-10 h-10 text-rose-500" />
              CRM Avanzado
            </h1>
            <p className="text-slate-500 mt-2">Pipeline de oportunidades con scoring IA</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-xl shadow-md overflow-hidden">
              <button 
                onClick={() => setVistaActiva('pipeline')}
                className={`px-4 py-2 ${vistaActiva === 'pipeline' ? 'bg-rose-500 text-white' : ''}`}
              >
                Pipeline
              </button>
              <button 
                onClick={() => setVistaActiva('leads')}
                className={`px-4 py-2 ${vistaActiva === 'leads' ? 'bg-rose-500 text-white' : ''}`}
              >
                Leads
              </button>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-rose-400 to-rose-500">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Oportunidades</p>
                <p className="text-2xl font-bold">{oportunidades.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Valor Total</p>
                <p className="text-2xl font-bold">${(valorTotal / 1000000).toFixed(0)}M</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Ponderado IA</p>
                <p className="text-2xl font-bold">${(valorPonderado / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-violet-400 to-violet-500">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Leads Activos</p>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {vistaActiva === 'pipeline' ? (
          /* Pipeline View */
          <div className="grid grid-cols-5 gap-4 overflow-x-auto">
            {etapas.map((etapa) => {
              const opsEtapa = oportunidades.filter(o => o.etapa === etapa.nombre);
              const valorEtapa = opsEtapa.reduce((sum, o) => sum + o.valor, 0);
              
              return (
                <div key={etapa.nombre} className="min-w-[250px]">
                  <div className={`${etapa.color} rounded-t-xl px-4 py-2 text-white font-medium flex items-center justify-between`}>
                    <span>{etapa.nombre}</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{opsEtapa.length}</span>
                  </div>
                  <div className="bg-white/50 rounded-b-xl p-2 space-y-2 min-h-[300px]">
                    <p className="text-xs text-slate-500 text-center">${(valorEtapa / 1000000).toFixed(1)}M</p>
                    {opsEtapa.map((op) => (
                      <div key={op.id} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all">
                        <p className="font-medium text-slate-800">{op.cliente}</p>
                        <p className="text-lg font-bold text-rose-600">${(op.valor / 1000000).toFixed(1)}M</p>
                        <ProbabilidadBarra prob={op.probabilidad} />
                        <p className="text-xs text-slate-400 mt-2">{op.ultimaActividad}</p>
                        <p className="text-xs text-slate-500">Cierre: {op.fechaCierre}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Leads View */
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Star className="w-5 h-5 text-rose-500" />
                Leads con Score IA
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Buscar..." aria-label="Buscar" className="pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm" />
              </div>
            </div>
            
            <div className="space-y-3">
              {leads.map((lead) => (
                <div key={lead.id} className="p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold">
                        {lead.nombre.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800">{lead.nombre}</p>
                          <ScoreBadge score={lead.scoreIA} />
                        </div>
                        <p className="text-sm text-slate-500">{lead.empresa}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.telefono}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Próxima acción:</p>
                      <p className="text-sm font-medium text-rose-600 flex items-center gap-1">
                        <ArrowRight className="w-4 h-4" />
                        {lead.proximaAccion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="text-center text-slate-400 text-sm">
          <p>🤝 CRM Avanzado con IA - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}