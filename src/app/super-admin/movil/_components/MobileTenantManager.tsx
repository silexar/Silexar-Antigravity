import React, { useState } from 'react';
import { Building, Users, Ticket, ChevronRight, Search, Plus, MoreVertical, ShieldCheck, Ban } from 'lucide-react';

/* ─── MOCK DATA ────────────────────────────────────────── */

const MOCK_TENANTS = [
  { id: 't1', name: 'Tech Solutions Inc', plan: 'Enterprise', status: 'active', usersCount: 45, ticketsOpen: 2 },
  { id: 't2', name: 'Media Corp Latam', plan: 'Professional', status: 'active', usersCount: 23, ticketsOpen: 0 },
  { id: 't3', name: 'Retail Plus Systems', plan: 'Starter', status: 'trial', usersCount: 5, ticketsOpen: 1 },
  { id: 't4', name: 'Finance Pro Global', plan: 'Enterprise', status: 'active', usersCount: 67, ticketsOpen: 3 },
  { id: 't5', name: 'Health Systems', plan: 'Professional', status: 'suspended', usersCount: 34, ticketsOpen: 0 }
];

/* ─── NEUROMORPHIC COMPONENTS ────────────────────────────────── */

interface Tenant {
  id: string;
  name: string;
  plan: string;
  status: string;
  usersCount: number;
  ticketsOpen: number;
}

function ActionSheet({ isOpen, onClose, tenant }: { isOpen: boolean; onClose: () => void; tenant: Tenant | null }) {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-[#E8E5E0] rounded-t-3xl p-6 z-50 animate-in slide-in-from-bottom border-t border-[#D4D1CC] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="w-12 h-1.5 bg-slate-600 rounded-full mx-auto mb-6 opacity-50" />
        <h3 className="text-xl font-bold text-[#2C2C2A] mb-2">{tenant?.name}</h3>
        <p className="text-[#888780] text-sm mb-6 flex items-center gap-2">
          <span className="bg-[#D4D1CC] px-2 py-0.5 rounded text-xs">{tenant?.plan}</span>
          ID: {tenant?.id?.toUpperCase()}
        </p>
        
        <div className="space-y-3">
          <button className="w-full p-4 bg-[#D4D1CC]/50 hover:bg-[#D4D1CC] rounded-2xl flex items-center justify-between text-left transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[#2C2C2A] font-medium">Gestionar Usuarios</p>
                <p className="text-[#888780] text-xs">{tenant?.usersCount} usuarios activos</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#888780]" />
          </button>

          <button className="w-full p-4 bg-[#D4D1CC]/50 hover:bg-[#D4D1CC] rounded-2xl flex items-center justify-between text-left transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[#2C2C2A] font-medium">Cambiar Plan</p>
                <p className="text-[#888780] text-xs">Actual: {tenant?.plan}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#888780]" />
          </button>

          <div className="border-t border-[#D4D1CC]/50 my-2" />

          {tenant?.status === 'suspended' ? (
             <button className="w-full p-4 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-2xl flex items-center justify-center gap-2 text-left transition-colors font-bold">
              <ShieldCheck className="w-5 h-5" />
              Reactivar Tenant
            </button>
          ) : (
             <button className="w-full p-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-2xl flex items-center justify-center gap-2 text-left transition-colors font-bold">
              <Ban className="w-5 h-5" />
              Suspender Tenant
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── MAIN OVERVIEW ────────────────────────────────────────────── */

export function MobileTenantManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const filteredTenants = MOCK_TENANTS.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="pb-24 pt-6 px-4 space-y-6">
      <ActionSheet isOpen={!!selectedTenant} onClose={() => setSelectedTenant(null)} tenant={selectedTenant} />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#2C2C2A] flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-400" />
            Tenants
          </h2>
          <p className="text-[#888780] mt-1">{MOCK_TENANTS.length} clientes registrados</p>
        </div>
        <button className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-[#2C2C2A] shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-all active:scale-95">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888780]" />
        <input
          type="text"
          placeholder="Buscar clientes o IDs..."
          aria-label="Buscar clientes o IDs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#E8E5E0]/80 border border-[#D4D1CC]/50 rounded-2xl py-4 pl-12 pr-4 text-[#2C2C2A] placeholder:text-[#888780] focus:outline-none focus:border-blue-500/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
        />
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredTenants.map(tenant => (
          <div key={tenant.id} className="bg-[#E8E5E0]/40 border border-[#D4D1CC]/30 rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-lg font-bold text-[#2C2C2A] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-[#CCCAC5]/30">
                  {tenant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-[#2C2C2A] font-medium text-lg leading-tight">{tenant.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#888780]">{tenant.plan}</span>
                    <span className="text-slate-600 text-[10px]">•</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wide uppercase ${
                      tenant.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                      tenant.status === 'trial' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {tenant.status}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTenant(tenant)}
                className="p-2 -mr-2 text-[#888780] hover:text-[#2C2C2A] transition-colors"
                aria-label="Opciones"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-[#F0EDE8]/50 rounded-xl p-3 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                   <Users className="w-4 h-4" />
                 </div>
                 <div>
                   <p className="text-[#2C2C2A] font-bold">{tenant.usersCount}</p>
                   <p className="text-[#888780] text-[10px] uppercase tracking-wider">Usuarios</p>
                 </div>
               </div>
               <div className="bg-[#F0EDE8]/50 rounded-xl p-3 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                   <Ticket className="w-4 h-4" />
                 </div>
                 <div>
                   <p className="text-[#2C2C2A] font-bold">{tenant.ticketsOpen}</p>
                   <p className="text-[#888780] text-[10px] uppercase tracking-wider">Tickets Activos</p>
                 </div>
               </div>
            </div>
          </div>
        ))}
        {filteredTenants.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
            <p className="text-[#888780] font-medium">No se encontraron clientes.</p>
          </div>
        )}
      </div>

    </div>
  );
}
