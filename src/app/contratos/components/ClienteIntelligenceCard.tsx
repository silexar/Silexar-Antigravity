/**
 * 🏢 DESKTOP: Ficha de Inteligencia de Cliente
 * 
 * Vista 360° del cliente con: historial de contratos,
 * preferencias de medios, datos de contacto, scoring,
 * oportunidades activas, comportamiento de pago.
 * Todo sin que el ejecutivo busque en el sistema.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

'use client';

import { useState } from 'react';
import {
  Building2, Phone, Mail, Globe, Star,
  TrendingUp, DollarSign, Clock,
  FileText, Radio, Tv, CheckCircle2,
  ArrowUpRight, MapPin,
} from 'lucide-react';

interface ClienteInfo {
  id: string;
  nombre: string;
  rubro: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  scoring: number;
  valorHistorico: number;
  contratosTotal: number;
  tasaRenovacion: number;
  ultimoContacto: string;
  preferencias: string[];
  contratos: { num: string; valor: number; estado: string; fecha: string }[];
  oportunidades: { titulo: string; valor: number; prob: number }[];
  pagos: { promedioDias: number; morosidad: number };
}

const CLIENTES_DB: ClienteInfo[] = [
  {
    id: 'cli-001', nombre: 'Banco Chile', rubro: 'Banca / Servicios Financieros',
    contacto: 'José Rodríguez (Gte. Marketing)', telefono: '+56 2 2345 6789',
    email: 'jrodriguez@bancochile.cl', direccion: 'Av. Providencia 1234, Santiago',
    scoring: 92, valorHistorico: 340000000, contratosTotal: 4, tasaRenovacion: 100,
    ultimoContacto: 'Hace 2 días',
    preferencias: ['Radio FM prime', 'TV horario estelar', 'Digital SEM'],
    contratos: [
      { num: 'SP-2024-0142', valor: 85000000, estado: 'activo', fecha: '2024-09' },
      { num: 'SP-2024-0089', valor: 75000000, estado: 'completado', fecha: '2024-03' },
      { num: 'SP-2023-0201', valor: 90000000, estado: 'completado', fecha: '2023-09' },
      { num: 'SP-2023-0045', valor: 90000000, estado: 'completado', fecha: '2023-01' },
    ],
    oportunidades: [
      { titulo: 'Campaña tarjeta crédito Q2', valor: 95000000, prob: 85 },
      { titulo: 'Lanzamiento App Móvil', valor: 40000000, prob: 60 },
    ],
    pagos: { promedioDias: 38, morosidad: 0 },
  },
];

export function ClienteIntelligenceCard() {
  const [selected] = useState<ClienteInfo | null>(CLIENTES_DB[0]);

  const cl = selected;
  if (!cl) return null;

  return (
    <div className="neo-card rounded-2xl overflow-hidden">
      {/* HEADER */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-xl text-slate-800">{cl.nombre}</h2>
              <p className="text-xs text-slate-500">{cl.rubro}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-emerald-100 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">Score: {cl.scoring}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* CONTACTO RÁPIDO */}
        <div className="grid grid-cols-3 gap-3">
          <a href={`tel:${cl.telefono}`} className="p-3 bg-blue-50 rounded-xl flex items-center gap-2 hover:bg-blue-100 transition">
            <Phone className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-[10px] text-blue-400">Teléfono</p>
              <p className="text-xs font-bold text-blue-700">{cl.telefono.slice(-8)}</p>
            </div>
          </a>
          <a href={`mailto:${cl.email}`} className="p-3 bg-purple-50 rounded-xl flex items-center gap-2 hover:bg-purple-100 transition">
            <Mail className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-[10px] text-purple-400">Email</p>
              <p className="text-xs font-bold text-purple-700 truncate">{cl.email.split('@')[0]}</p>
            </div>
          </a>
          <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-[10px] text-slate-400">Contacto</p>
              <p className="text-xs font-bold text-slate-600 truncate">{cl.contacto.split('(')[0]}</p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <DollarSign className="w-4 h-4 text-emerald-500 mx-auto" />
            <p className="text-lg font-black text-slate-800">${(cl.valorHistorico / 1e6).toFixed(0)}M</p>
            <p className="text-[9px] text-slate-400">Valor histórico</p>
          </div>
          <div className="text-center">
            <FileText className="w-4 h-4 text-indigo-500 mx-auto" />
            <p className="text-lg font-black text-slate-800">{cl.contratosTotal}</p>
            <p className="text-[9px] text-slate-400">Contratos</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-4 h-4 text-blue-500 mx-auto" />
            <p className="text-lg font-black text-slate-800">{cl.tasaRenovacion}%</p>
            <p className="text-[9px] text-slate-400">Renovación</p>
          </div>
          <div className="text-center">
            <Clock className="w-4 h-4 text-amber-500 mx-auto" />
            <p className="text-lg font-black text-slate-800">{cl.pagos.promedioDias}d</p>
            <p className="text-[9px] text-slate-400">Pago prom.</p>
          </div>
        </div>

        {/* PREFERENCIAS */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Preferencias de Medios</p>
          <div className="flex flex-wrap gap-2">
            {cl.preferencias.map((p, i) => (
              <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full flex items-center gap-1">
                {p.includes('Radio') ? <Radio className="w-3 h-3" /> :
                 p.includes('TV') ? <Tv className="w-3 h-3" /> :
                 <Globe className="w-3 h-3" />}
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* HISTORIAL CONTRATOS */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Historial de Contratos</p>
          <div className="space-y-1.5">
            {cl.contratos.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <span className="text-xs font-mono text-indigo-500">{c.num}</span>
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                  c.estado === 'activo' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                }`}>{c.estado}</span>
                <span className="text-xs text-slate-400 flex-1 text-right">{c.fecha}</span>
                <span className="text-xs font-bold text-slate-700">${(c.valor / 1e6).toFixed(0)}M</span>
              </div>
            ))}
          </div>
        </div>

        {/* OPORTUNIDADES */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Oportunidades Activas</p>
          {cl.oportunidades.map((o, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl mb-2">
              <ArrowUpRight className="w-4 h-4 text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{o.titulo}</p>
                <p className="text-[10px] text-slate-500">${(o.valor / 1e6).toFixed(0)}M · {o.prob}% probabilidad</p>
              </div>
            </div>
          ))}
        </div>

        {/* PAGO */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <div>
            <p className="text-xs font-bold text-emerald-700">Excelente pagador</p>
            <p className="text-[10px] text-emerald-600">Promedio {cl.pagos.promedioDias} días · {cl.pagos.morosidad}% morosidad</p>
          </div>
        </div>
      </div>
    </div>
  );
}
