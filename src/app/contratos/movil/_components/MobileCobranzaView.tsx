/**
 * 💰 MOBILE: Cobranza View
 * 
 * Gestión de pagos vencidos y recordatorios de cobro.
 * Paridad con desktop: contratos/cobranza/page.tsx
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  Clock, Phone, Mail,
  CheckCircle2, TrendingDown,
  Calendar, Search
} from 'lucide-react';
import { formatCurrency } from '../../_shared/useContratos';

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

interface CuentaPendiente {
  id: string;
  cliente: string;
  contrato: string;
  monto: number;
  fechaVencimientos: string;
  diasVencido: number;
  estado: 'vencido' | 'por_vencer' | 'en_gestion' | 'comprometido';
  ultimaGestion?: string;
  telefono: string;
}

const CUENTAS_MOCK: CuentaPendiente[] = [
  { id: 'cob-1', cliente: 'Falabella', contrato: 'CTR-2025-0045', monto: 12500000, fechaVencimientos: '2025-02-15', diasVencido: 12, estado: 'vencido', ultimaGestion: 'Llamada 25/02', telefono: '+56912345678' },
  { id: 'cob-2', cliente: 'Banco Chile', contrato: 'CTR-2025-0067', monto: 8700000, fechaVencimientos: '2025-02-20', diasVencido: 7, estado: 'en_gestion', ultimaGestion: 'Email enviado 26/02', telefono: '+56923456789' },
  { id: 'cob-3', cliente: 'TechCorp', contrato: 'CTR-2025-0089', monto: 4300000, fechaVencimientos: '2025-03-01', diasVencido: 0, estado: 'por_vencer', telefono: '+56934567890' },
  { id: 'cob-4', cliente: 'Ripley', contrato: 'CTR-2025-0034', monto: 15800000, fechaVencimientos: '2025-02-10', diasVencido: 17, estado: 'vencido', ultimaGestion: 'Compromiso pago 28/02', telefono: '+56945678901' },
  { id: 'cob-5', cliente: 'Cencosud', contrato: 'CTR-2025-0056', monto: 6200000, fechaVencimientos: '2025-03-05', diasVencido: 0, estado: 'comprometido', ultimaGestion: 'Pago parcial recibido', telefono: '+56956789012' },
];

type FiltroCobranza = 'todos' | 'vencido' | 'por_vencer' | 'en_gestion' | 'comprometido';

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════

export function MobileCobranzaView() {
  const [filtro, setFiltro] = useState<FiltroCobranza>('todos');
  const [busqueda, setBusqueda] = useState('');

  const filtered = CUENTAS_MOCK
    .filter(c => filtro === 'todos' || c.estado === filtro)
    .filter(c => !busqueda || c.cliente.toLowerCase().includes(busqueda.toLowerCase()));

  const totalVencido = CUENTAS_MOCK.filter(c => c.estado === 'vencido').reduce((s, c) => s + c.monto, 0);
  const totalPendiente = CUENTAS_MOCK.reduce((s, c) => s + c.monto, 0);

  const estadoConfig: Record<string, { label: string; color: string; bg: string }> = {
    vencido: { label: 'Vencido', color: 'text-[#9aa3b8]', bg: 'bg-[#dfeaff]' },
    por_vencer: { label: 'Por vencer', color: 'text-[#6888ff]', bg: 'bg-[#6888ff]/10' },
    en_gestion: { label: 'En gestión', color: 'text-[#6888ff]', bg: 'bg-[#6888ff]/10' },
    comprometido: { label: 'Comprometido', color: 'text-[#6888ff]', bg: 'bg-[#6888ff]/10' },
  };

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="bg-gradient-to-br from-[#6888ff] to-[#5572ee] rounded-2xl p-5 text-white shadow-xl">
        <p className="text-xs font-bold text-[#9aa3b8] uppercase tracking-widest">Cobranza</p>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <p className="text-2xl font-black">{formatCurrency(totalVencido)}</p>
            <p className="text-xs text-[#9aa3b8]">Vencido</p>
          </div>
          <div>
            <p className="text-2xl font-black">{formatCurrency(totalPendiente)}</p>
            <p className="text-xs text-[#9aa3b8]">Total pendiente</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 bg-[#dfeaff]/10 rounded-xl px-3 py-2">
          <TrendingDown className="w-4 h-4 text-[#9aa3b8]" />
          <span className="text-xs font-bold text-[#9aa3b8]">{CUENTAS_MOCK.filter(c => c.estado === 'vencido').length} cuentas vencidas</span>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-[#9aa3b8]" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar cliente..."
          aria-label="Buscar cliente"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#bec8de30] bg-[#dfeaff] text-sm focus:ring-2 focus:ring-[#6888ff]/50 outline-none"
        />
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['todos', 'vencido', 'por_vencer', 'en_gestion', 'comprometido'] as FiltroCobranza[]).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filtro === f ? 'bg-[#6888ff] text-white' : 'bg-[#dfeaff] text-[#9aa3b8] border border-[#bec8de30]'
            }`}>
            {f === 'todos' ? 'Todos' : estadoConfig[f]?.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {filtered.map(cuenta => (
          <div key={cuenta.id} className="bg-[#dfeaff] rounded-xl border border-[#bec8de30] p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-bold text-[#69738c] text-sm">{cuenta.cliente}</p>
                <p className="text-[10px] text-[#9aa3b8]">{cuenta.contrato}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${estadoConfig[cuenta.estado]?.bg} ${estadoConfig[cuenta.estado]?.color}`}>
                {estadoConfig[cuenta.estado]?.label}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-lg font-black text-[#69738c]">{formatCurrency(cuenta.monto)}</p>
              <div className="flex items-center gap-1 text-xs text-[#9aa3b8]">
                <Calendar className="w-3 h-3" />
                {cuenta.diasVencido > 0 ? <span className="text-[#9aa3b8] font-bold">{cuenta.diasVencido}d vencido</span> : <span>Vence {cuenta.fechaVencimientos}</span>}
              </div>
            </div>
            {cuenta.ultimaGestion && (
              <p className="text-[10px] text-[#9aa3b8] mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> {cuenta.ultimaGestion}</p>
            )}
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-[#6888ff]/5 text-[#6888ff] rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95">
                <Phone className="w-3.5 h-3.5" /> Llamar
              </button>
              <button className="flex-1 py-2 bg-[#dfeaff] text-[#6888ff] rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95">
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button className="flex-1 py-2 bg-[#6888ff]/5 text-[#6888ff] rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95">
                <CheckCircle2 className="w-3.5 h-3.5" /> Gestionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
