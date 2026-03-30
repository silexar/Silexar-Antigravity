'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Building2, MapPin, User, FileText, CreditCard, 
  Briefcase, Globe, Mail, Phone, Calendar, Paperclip,
  MoreVertical, Edit3, Trash2, CheckCircle2, XCircle, AlertCircle,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import { Anunciante } from '../page';

interface DetailProps {
  anuncianteId: string;
  onBack: () => void;
  onUpdate: () => void;
}

export const MobileAnuncianteDetail: React.FC<DetailProps> = ({ anuncianteId, onBack, onUpdate }) => {
  const [anunciante, setAnunciante] = useState<Anunciante | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchAnunciante = async () => {
      try {
        const response = await fetch(`/api/anunciantes/${anuncianteId}`);
        const data = await response.json();
        if (data.success) setAnunciante(data.data);
      } catch {
        // /* console.error('Error fetching anunciante:', error) */;
      } finally {
        setLoading(false);
      }
    };
    fetchAnunciante();
  }, [anuncianteId]);

  const handleToggleActivo = async () => {
    if (!anunciante) return;
    try {
      const response = await fetch(`/api/anunciantes/${anunciante.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_activo' })
      });
      const data = await response.json();
      if (data.success) {
        setAnunciante(data.data);
        onUpdate();
        setShowMenu(false);
      }
    } catch {
      // /* console.error('Error toggling anunciante:', error) */;
    }
  };

  const handleDelete = async () => {
    if (!anunciante || !confirm(`¿Eliminar ${anunciante.nombreRazonSocial}? Esta acción no se puede deshacer.`)) return;
    try {
      await fetch(`/api/anunciantes/${anunciante.id}`, { method: 'DELETE' });
      onUpdate();
      onBack();
    } catch {
      // /* console.error('Error deleting anunciante:', error) */;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-[100dvh] bg-slate-50 items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!anunciante) {
    return (
      <div className="flex-1 flex flex-col h-[100dvh] bg-slate-50 p-6 items-center justify-center text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Anunciante no encontrado</h2>
        <button onClick={onBack} className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg">Volver</button>
      </div>
    );
  }

  const TabButton = ({ id, label }: { id: string; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`whitespace-nowrap px-4 py-3 border-b-2 font-bold transition-all text-sm ${
        activeTab === id 
          ? 'border-blue-600 text-blue-600' 
          : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  );

  const InfoRowMobile = ({ label, value, icon: Icon }: { label: string; value: string | null; icon?: React.ElementType }) => (
    <div className="flex items-start gap-4 py-3.5 border-b border-slate-100 last:border-0">
      {Icon && (
        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-[15px] font-semibold text-slate-800 break-words">{value || 'No especificado'}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
      
      {/* Header Sticky */}
      <header className="bg-white/80 backdrop-blur-xl px-4 pt-12 pb-4 shadow-sm z-20 flex justify-between items-start rounded-b-3xl border-b border-white/60">
        <button aria-label="Volver" onClick={onBack} className="p-2 -ml-2 rounded-full active:scale-95 text-slate-800 transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 px-3 text-center">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-50 text-blue-600 mb-1">
            {anunciante.codigo}
          </span>
          <h1 className="text-xl font-bold text-slate-800 leading-tight truncate">{anunciante.nombreRazonSocial}</h1>
        </div>
        <button aria-label="Más opciones" onClick={() => setShowMenu(!showMenu)} className="p-2 -mr-2 rounded-full active:bg-slate-100 text-slate-800 transition-colors">
          <MoreVertical className="w-6 h-6" />
        </button>
      </header>

      {/* Action Menu (Overlay) */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm" onClick={() => setShowMenu(false)} />
          <div className="fixed top-24 right-4 z-40 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 animate-in fade-in zoom-in-95 duration-200">
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors text-left" onClick={() => { alert('Funcionalidad de edición pendiente'); setShowMenu(false); }}>
              <Edit3 className="w-5 h-5 text-blue-500" /> Editar Anunciante
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors text-left" onClick={handleToggleActivo}>
              {anunciante.activo ? <ToggleLeft className="w-5 h-5 text-amber-500" /> : <ToggleRight className="w-5 h-5 text-emerald-500" />}
              {anunciante.activo ? 'Marcar Inactivo' : 'Marcar Activo'}
            </button>
            <div className="h-px bg-slate-100 my-1 w-full" />
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 text-red-600 font-semibold text-sm transition-colors text-left" onClick={handleDelete}>
              <Trash2 className="w-5 h-5" /> Eliminar Definitivamente
            </button>
          </div>
        </>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="flex overflow-x-auto scrollbar-hide px-2">
          <TabButton id="info" label="Información" />
          <TabButton id="facturacion" label="Facturación" />
          <TabButton id="contratos" label="Contratos" />
          <TabButton id="campanas" label="Campañas" />
          <TabButton id="archivos" label="Archivos" />
        </div>
      </div>

      {/* Content Scrollable */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        
        {/* Status indicator always visible on top of content */}
        <div className="mb-6 flex justify-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            anunciante.activo 
              ? 'bg-emerald-100 text-emerald-700' 
              : anunciante.estado === 'suspendido'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-200 text-slate-600'
          }`}>
            {anunciante.activo ? <CheckCircle2 className="w-4 h-4" /> : anunciante.estado === 'suspendido' ? <AlertCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            Estado: {anunciante.estado}
          </span>
        </div>

        {activeTab === 'info' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-white/60">
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Empresa
              </h3>
              <InfoRowMobile label="Razón Social" value={anunciante.nombreRazonSocial} />
              <InfoRowMobile label="RUT" value={anunciante.rut} icon={FileText} />
              <InfoRowMobile label="Giro o Actividad" value={anunciante.giroActividad} icon={Briefcase} />
              <InfoRowMobile label="Página Web" value={anunciante.paginaWeb} icon={Globe} />
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-white/60">
              <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Dirección
              </h3>
              <InfoRowMobile label="Dirección" value={anunciante.direccion} />
              <InfoRowMobile label="Ciudad" value={anunciante.ciudad} />
              <InfoRowMobile label="Comuna/Provincia" value={anunciante.comunaProvincia} />
              <InfoRowMobile label="País" value={anunciante.pais} />
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-white/60">
              <h3 className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> Contacto Principal
              </h3>
              <InfoRowMobile label="Nombre y Apellido" value={anunciante.nombreContactoPrincipal} icon={User} />
              <InfoRowMobile label="Cargo" value={anunciante.cargoContactoPrincipal} />
              <InfoRowMobile label="Email" value={anunciante.emailContacto} icon={Mail} />
              <InfoRowMobile label="Teléfono" value={anunciante.telefonoContacto} icon={Phone} />
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-white/60">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Auditoría
              </h3>
              <InfoRowMobile label="Fecha de Registro" value={anunciante.fechaCreacion ? new Date(anunciante.fechaCreacion).toLocaleString('es-CL') : null} />
              <InfoRowMobile label="Última Modificación" value={anunciante.fechaModificacion ? new Date(anunciante.fechaModificacion).toLocaleString('es-CL') : null} />
            </div>
          </div>
        )}

        {activeTab === 'facturacion' && (
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-white/60 animate-in fade-in duration-300">
            <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Facturación
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
              <span className="font-bold text-slate-700">Recibe Factura Electrónica (DTE)</span>
              <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${anunciante.tieneFacturacionElectronica ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${anunciante.tieneFacturacionElectronica ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>
            <InfoRowMobile label="Dirección Facturación" value={anunciante.direccionFacturacion} icon={MapPin} />
            <InfoRowMobile label="Email Facturación" value={anunciante.emailFacturacion} icon={Mail} />
          </div>
        )}

        {(activeTab === 'contratos' || activeTab === 'campanas' || activeTab === 'archivos') && (
          <div className="flex flex-col items-center justify-center p-10 mt-10 text-center animate-in fade-in duration-300">
            {activeTab === 'contratos' && <FileText className="w-20 h-20 text-slate-200 mb-6" />}
            {activeTab === 'campanas' && <Briefcase className="w-20 h-20 text-slate-200 mb-6" />}
            {activeTab === 'archivos' && <Paperclip className="w-20 h-20 text-slate-200 mb-6" />}
            <h3 className="text-lg font-bold text-slate-600 capitalize">Sin {activeTab} asociados</h3>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed">
              Este módulo será habilitado en la próxima actualización de Silexar Pulse.
            </p>
          </div>
        )}

      </main>
    </div>
  );
};
