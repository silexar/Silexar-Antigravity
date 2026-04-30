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
      <div className="px-6 py-4 bg-[#dfeaff] border-b border-[#bec8de30]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#6888ff] flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-xl text-[#69738c]">{cl.nombre}</h2>
              <p className="text-xs text-[#9aa3b8]">{cl.rubro}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-[#6888ff]/10 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 text-[#6888ff]" />
              <span className="text-xs font-bold text-[#6888ff]">Score: {cl.scoring}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* CONTACTO RÁPIDO */}
        <div className="grid grid-cols-3 gap-3">
          <a href={`tel:${cl.telefono}`} className="p-3 bg-[#6888ff]/5 rounded-xl flex items-center gap-2 hover:bg-[#6888ff]/10 transition">
            <Phone className="w-4 h-4 text-[#6888ff]" />
            <div>
              <p className="text-[10px] text-[#6888ff]">Teléfono</p>
              <p className="text-xs font-bold text-[#6888ff]">{cl.telefono.slice(-8)}</p>
            </div>
          </a>
          <a href={`mailto:${cl.email}`} className="p-3 bg-[#6888ff]/5 rounded-xl flex items-center gap-2 hover:bg-[#6888ff]/10 transition">
            <Mail className="w-4 h-4 text-[#6888ff]" />
            <div>
              <p className="text-[10px] text-[#6888ff]">Email</p>
              <p className="text-xs font-bold text-[#6888ff] truncate">{cl.email.split('@')[0]}</p>
            </div>
          </a>
          <div className="p-3 bg-[#dfeaff] rounded-xl flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#9aa3b8]" />
            <div>
              <p className="text-[10px] text-[#9aa3b8]">Contacto</p>
              <p className="text-xs font-bold text-[#69738c] truncate">{cl.contacto.split('(')[0]}</p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <DollarSign className="w-4 h-4 text-[#6888ff] mx-auto" />
            <p className="text-lg font-black text-[#69738c]">${(cl.valorHistorico / 1e6).toFixed(0)}M</p>
            <p className="text-[9px] text-[#9aa3b8]">Valor histórico</p>
          </div>
          <div className="text-center">
            <FileText className="w-4 h-4 text-[#6888ff] mx-auto" />
            <p className="text-lg font-black text-[#69738c]">{cl.contratosTotal}</p>
            <p className="text-[9px] text-[#9aa3b8]">Contratos</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-4 h-4 text-[#6888ff] mx-auto" />
            <p className="text-lg font-black text-[#69738c]">{cl.tasaRenovacion}%</p>
            <p className="text-[9px] text-[#9aa3b8]">Renovación</p>
          </div>
          <div className="text-center">
            <Clock className="w-4 h-4 text-[#6888ff] mx-auto" />
            <p className="text-lg font-black text-[#69738c]">{cl.pagos.promedioDias}d</p>
            <p className="text-[9px] text-[#9aa3b8]">Pago prom.</p>
          </div>
        </div>

        {/* PREFERENCIAS */}
        <div>
          <p className="text-[10px] font-bold text-[#9aa3b8] uppercase mb-2">Preferencias de Medios</p>
          <div className="flex flex-wrap gap-2">
            {cl.preferencias.map((p) => (
              <span key={p} className="px-3 py-1 bg-[#dfeaff] text-[#6888ff] text-xs font-bold rounded-full flex items-center gap-1">
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
          <p className="text-[10px] font-bold text-[#9aa3b8] uppercase mb-2">Historial de Contratos</p>
          <div className="space-y-1.5">
            {cl.contratos.map((c) => (
              <div key={c.num} className="flex items-center gap-3 p-2 bg-[#dfeaff] rounded-lg">
                <span className="text-xs font-mono text-[#6888ff]">{c.num}</span>
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                  c.estado === 'activo' ? 'bg-[#6888ff]/10 text-[#6888ff]' : 'bg-[#dfeaff] text-[#9aa3b8]'
                }`}>{c.estado}</span>
                <span className="text-xs text-[#9aa3b8] flex-1 text-right">{c.fecha}</span>
                <span className="text-xs font-bold text-[#69738c]">${(c.valor / 1e6).toFixed(0)}M</span>
              </div>
            ))}
          </div>
        </div>

        {/* OPORTUNIDADES */}
        <div>
          <p className="text-[10px] font-bold text-[#9aa3b8] uppercase mb-2">Oportunidades Activas</p>
          {cl.oportunidades.map((o) => (
            <div key={o.titulo} className="flex items-center gap-3 p-3 bg-[#6888ff]/5 border border-[#bec8de30] rounded-xl mb-2">
              <ArrowUpRight className="w-4 h-4 text-[#6888ff]" />
              <div className="flex-1">
                <p className="text-sm font-bold text-[#69738c]">{o.titulo}</p>
                <p className="text-[10px] text-[#9aa3b8]">${(o.valor / 1e6).toFixed(0)}M · {o.prob}% probabilidad</p>
              </div>
            </div>
          ))}
        </div>

        {/* PAGO */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#6888ff]/5 border border-[#bec8de30]">
          <CheckCircle2 className="w-5 h-5 text-[#6888ff]" />
          <div>
            <p className="text-xs font-bold text-[#6888ff]">Excelente pagador</p>
            <p className="text-[10px] text-[#6888ff]">Promedio {cl.pagos.promedioDias} días · {cl.pagos.morosidad}% morosidad</p>
          </div>
        </div>
      </div>
    </div>
  );
}
