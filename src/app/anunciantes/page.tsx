'use client';

/**
 * /anunciantes — Módulo Gestión de Anunciantes TIER 0
 * Paleta oficial: base #dfeaff | acento #6888ff | texto #69738c
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useRouter } from 'next/navigation';
import {
  Building2, Search, Plus, Eye, Edit3, Trash2,
  ToggleLeft, ToggleRight, Mail, Phone, MapPin,
  RefreshCw, TrendingUp, X, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle2, XCircle, ArrowLeft, Globe,
  FileText, User, Briefcase, AlertTriangle, Calendar,
} from 'lucide-react';
import { AnuncianteForm } from './_components/AnuncianteForm';
import { toast } from '@/components/ui/use-toast';

// ─── Tokens ──────────────────────────────────────────────────
const N = {
  base: '#dfeaff', dark: '#bec8de', light: '#ffffff',
  accent: '#6888ff', text: '#69738c', textSub: '#9aa3b8',
}

// ─── Types ────────────────────────────────────────────────────
interface Anunciante {
  id: string; codigo: string; rut: string | null;
  nombreRazonSocial: string; giroActividad: string | null;
  direccion: string | null; ciudad: string | null; pais: string;
  emailContacto: string | null; telefonoContacto: string | null;
  estado: 'activo' | 'inactivo' | 'suspendido' | 'pendiente';
  activo: boolean; fechaCreacion: string;
  categoriaCliente?: string; comunaProvincia?: string | null;
  nombreContactoPrincipal?: string | null; cargoContactoPrincipal?: string | null;
  paginaWeb?: string | null; telefonoContacto2?: string | null;
  riesgoFinanciero?: string; notas?: string;
  tieneFacturacionElectronica?: boolean; numeroDeudor?: string;
  tipoDTE?: string; condicionPago?: string; direccionFacturacion?: string;
  creadoPor?: string; modificadoPor?: string; fechaModificacion?: string;
}
interface PaginationInfo {
  total: number; page: number; limit: number;
  totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean;
}

// ─── Components ───────────────────────────────────────────────
function NeuCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-3xl ${className}`} style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`, ...style }}>
      {children}
    </div>
  )
}

function NeuButton({ children, onClick, variant = 'secondary', disabled = false, className = '', 'aria-label': al }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  disabled?: boolean; className?: string; 'aria-label'?: string
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: N.accent, color: '#fff', boxShadow: `4px 4px 8px ${N.dark},-2px -2px 6px ${N.light}` },
    secondary: { background: N.base, color: N.text, boxShadow: `6px 6px 12px ${N.dark},-6px -6px 12px ${N.light}` },
    danger:    { background: N.base, color: '#ef4444', boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` },
    ghost:     { background: 'transparent', color: N.textSub },
  }
  return (
    <button onClick={onClick} disabled={disabled} aria-label={al}
      className={`flex items-center gap-2 justify-center rounded-2xl font-bold text-sm transition-all duration-200 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      style={styles[variant]}
    >
      {children}
    </button>
  )
}

function NeuInput({ placeholder, value, onChange, icon: Icon }: {
  placeholder?: string; value: string; onChange: (v: string) => void; icon?: React.ElementType
}) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: N.textSub }} />}
      <input
        type="text" placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} aria-label={placeholder}
        className="w-full py-3 rounded-2xl text-sm focus:outline-none transition-all"
        style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`, color: N.text, paddingLeft: Icon ? '2.5rem' : '1rem', paddingRight: '1rem' }}
      />
    </div>
  )
}

function NeuSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="py-3 px-4 rounded-2xl text-sm focus:outline-none cursor-pointer"
      style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`, color: N.text }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function StatusBadge({ estado }: { estado: string }) {
  const config: Record<string, { color: string; label: string; icon: React.ElementType }> = {
    activo:    { color: '#22c55e', label: 'Activo',    icon: CheckCircle2 },
    inactivo:  { color: N.textSub, label: 'Inactivo',  icon: XCircle },
    suspendido:{ color: '#f59e0b', label: 'Suspendido', icon: AlertCircle },
    pendiente: { color: N.accent,  label: 'Pendiente',  icon: Building2 },
  }
  const c = config[estado] ?? config.pendiente
  const Icon = c.icon
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
      style={{ background: `${c.color}18`, color: c.color, boxShadow: `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}` }}>
      <Icon className="w-3 h-3" />{c.label}
    </span>
  )
}

// ─── Detail Modal (Draggable) ──────────────────────────────
function DetailModal({ a, onClose }: { a: Anunciante; onClose: () => void }) {
  const dragRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'info' | 'contratos' | 'campanas' | 'facturas'>('info');
  
  // Estados de busqueda para pestañas
  const [searchC, setSearchC] = useState('');
  const [searchCamp, setSearchCamp] = useState('');
  const [searchF, setSearchF] = useState('');
  
  // Estado para sub-modales
  const [selectedItem, setSelectedItem] = useState<{type: string, data: any} | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    if (selectedItem) return; // Deshabilitar arrastre si hay un sub-modal abierto
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };
  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y }); };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const CATEGORIA_MAP: Record<string, string> = { normal: '🏢 Cliente General', politica: '🏛️ Contenido Político', juego_azar: '🎰 Juego de Azar' };

  // Datos simulados para las vistas relacionadas
  const mockContratos = [
    { id: 'CTR-2026-089', estado: 'Activo', fechaInicio: '2026-03-01', fechaTermino: '2026-12-31', valor: '$12.500.000', creadoPor: 'Admin' },
    { id: 'CTR-2025-012', estado: 'Finalizado', fechaInicio: '2025-01-01', fechaTermino: '2025-12-31', valor: '$8.000.000', creadoPor: 'Ventas' },
  ].filter(c => c.id.toLowerCase().includes(searchC.toLowerCase()) || c.fechaInicio.includes(searchC));
  
  const mockCampanas = [
    { id: 'CMP-2026-01', nombre: 'Campaña Verano Radios', estado: 'En curso', inversion: '$5.000.000', inicio: '2026-03-15' },
    { id: 'CMP-2026-02', nombre: 'Lanzamiento Producto Nuevo', estado: 'Planificada', inversion: '$2.500.000', inicio: '2026-05-01' },
  ].filter(c => c.id.toLowerCase().includes(searchCamp.toLowerCase()) || c.nombre.toLowerCase().includes(searchCamp.toLowerCase()) || c.inicio.includes(searchCamp));

  const mockFacturas = [
    { id: 'FAC-88902', fecha: '2026-04-01', monto: '$2.500.000', estado: 'Pagada', vencimiento: '2026-04-30' },
    { id: 'FAC-88945', fecha: '2026-05-01', monto: '$2.500.000', estado: 'Pendiente', vencimiento: '2026-05-30' },
  ].filter(f => f.id.toLowerCase().includes(searchF.toLowerCase()) || f.fecha.includes(searchF));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(104,136,255,0.08)', backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{`
        .neu-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .neu-scrollbar::-webkit-scrollbar-track { background: rgba(104, 136, 255, 0.05); border-radius: 10px; margin: 4px; }
        .neu-scrollbar::-webkit-scrollbar-thumb { background: rgba(104, 136, 255, 0.25); border-radius: 10px; }
        .neu-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(104, 136, 255, 0.5); }
      `}</style>
      <div
        ref={dragRef}
        style={{ transform: `translate(${pos.x}px,${pos.y}px)`, background: N.base, boxShadow: `12px 12px 24px ${N.dark},-12px -12px 24px ${N.light}`, width: 'min(850px, 95vw)', maxHeight: '90vh', cursor: 'default' }}
        className="relative rounded-3xl flex flex-col overflow-hidden"
      >
        {/* Drag handle */}
        <div onMouseDown={onMouseDown} className="flex items-center justify-between px-6 py-4 border-b border-[#bec8de]/40 cursor-grab active:cursor-grabbing" style={{ background: N.base }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
              <Building2 className="w-5 h-5" style={{ color: N.accent }} />
            </div>
            <div>
              <h2 className="text-base font-black" style={{ color: N.text }}>{a.nombreRazonSocial}</h2>
              <p className="text-xs font-mono" style={{ color: N.accent }}>{a.codigo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge estado={a.estado} />
            <button onClick={onClose} className="p-2 rounded-xl transition-all" style={{ background: N.base, boxShadow: `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}`, color: '#ef4444' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs Nav */}
        <div className="flex gap-2 px-6 pt-4 pb-2 border-b border-[#bec8de]/30 bg-[#dfeaff]/50 overflow-x-auto">
          {[
            { id: 'info', label: 'General', icon: FileText },
            { id: 'contratos', label: 'Contratos', icon: Briefcase },
            { id: 'campanas', label: 'Campañas', icon: TrendingUp },
            { id: 'facturas', label: 'Facturas', icon: FileText }
          ].map(t => (
            <button
              key={t.id} onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${activeTab === t.id ? 'bg-[#6888ff] text-white shadow-[4px_4px_8px_#bec8de,-2px_-2px_6px_#ffffff]' : 'text-[#69738c] hover:bg-[#6888ff]/10'}`}
            >
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>

        {/* Content scrollable */}
        <div className="overflow-y-auto p-6 space-y-5 neu-scrollbar">
          
          {activeTab === 'info' && (
            <>
              {/* Legal */}
              <Section icon={<Building2 className="w-4 h-4" />} title="Información Legal y Fiscal">
                <Grid2>
                  <Field label="RUT" value={a.rut} mono />
                  <Field label="Giro / Actividad" value={a.giroActividad} />
                  <Field label="Categoría" value={CATEGORIA_MAP[a.categoriaCliente ?? ''] ?? a.categoriaCliente} />
                  <Field label="País" value={a.pais} />
                </Grid2>
              </Section>
              {/* Ubicación */}
              <Section icon={<MapPin className="w-4 h-4" />} title="Ubicación Geográfica">
                <Grid2>
                  <Field label="Dirección" value={a.direccion} />
                  <Field label="Ciudad" value={a.ciudad} />
                  <Field label="Comuna / Provincia" value={a.comunaProvincia} />
                </Grid2>
              </Section>
              {/* Contacto */}
              <Section icon={<User className="w-4 h-4" />} title="Contacto">
                <Grid2>
                  <Field label="Email" value={a.emailContacto} icon={<Mail className="w-3 h-3" />} />
                  <Field label="Teléfono" value={a.telefonoContacto} icon={<Phone className="w-3 h-3" />} />
                  <Field label="Sitio Web" value={a.paginaWeb} icon={<Globe className="w-3 h-3" />} />
                </Grid2>
                <div className="mt-3 p-3 rounded-2xl" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}>
                  <p className="text-xs font-bold mb-1" style={{ color: N.accent }}>Representante Principal</p>
                  <p className="text-sm font-bold" style={{ color: N.text }}>{a.nombreContactoPrincipal || '—'}</p>
                  <p className="text-xs" style={{ color: N.textSub }}>{a.cargoContactoPrincipal || '—'}</p>
                </div>
              </Section>
              {/* Facturación */}
              <Section icon={<Briefcase className="w-4 h-4" />} title="Facturación y Riesgo">
                <Grid2>
                  <Field label="Perfil de Riesgo" value={a.riesgoFinanciero} />
                  <Field label="Facturación DTE" value={a.tieneFacturacionElectronica ? 'Habilitada ✅' : 'No habilitada'} />
                  {a.tieneFacturacionElectronica && <>
                    <Field label="N° Deudor (ERP)" value={a.numeroDeudor} mono />
                    <Field label="Tipo DTE" value={a.tipoDTE} />
                    <Field label="Condición de Pago" value={a.condicionPago} />
                    <Field label="Dirección Fiscal" value={a.direccionFacturacion} />
                  </>}
                </Grid2>
              </Section>
              {/* Notas */}
              {a.notas && (
                <Section icon={<FileText className="w-4 h-4" />} title="Notas y Documentos">
                  <p className="text-sm whitespace-pre-wrap" style={{ color: N.text }}>{a.notas}</p>
                </Section>
              )}
            </>
          )}

          {activeTab === 'contratos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black uppercase" style={{ color: N.text }}>Historial de Contratos</h3>
                  <input type="text" placeholder="Buscar por N° o Año..." value={searchC} onChange={e => setSearchC(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-xs w-48 focus:outline-none" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }} />
                </div>
                <NeuButton variant="primary" className="px-3 py-1.5 text-xs"><Plus className="w-3 h-3" />Nuevo</NeuButton>
              </div>
              {mockContratos.length > 0 ? mockContratos.map(c => (
                <div key={c.id} onClick={() => setSelectedItem({type: 'contrato', data: c})} className="p-4 rounded-2xl flex items-center justify-between transition-all hover:bg-[#6888ff]/10 cursor-pointer" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-[#6888ff]">{c.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.estado === 'Activo' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>{c.estado}</span>
                    </div>
                    <p className="text-xs text-[#69738c] font-medium">Vigencia: {c.fechaInicio} al {c.fechaTermino}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-[#9aa3b8]">Valor Total</p>
                    <p className="text-lg font-black text-[#69738c]">{c.valor}</p>
                  </div>
                </div>
              )) : <p className="text-center text-xs text-[#9aa3b8] py-4">No se encontraron contratos.</p>}
            </div>
          )}

          {activeTab === 'campanas' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black uppercase" style={{ color: N.text }}>Campañas Asociadas</h3>
                  <input type="text" placeholder="Buscar campaña o año..." value={searchCamp} onChange={e => setSearchCamp(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-xs w-48 focus:outline-none" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }} />
                </div>
                <NeuButton variant="primary" className="px-3 py-1.5 text-xs"><Plus className="w-3 h-3" />Nueva</NeuButton>
              </div>
              {mockCampanas.length > 0 ? mockCampanas.map(c => (
                <div key={c.id} onClick={() => setSelectedItem({type: 'campaña', data: c})} className="p-4 rounded-2xl flex items-center justify-between transition-all hover:bg-[#6888ff]/10 cursor-pointer" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-[#69738c]">{c.nombre}</span>
                      <span className="font-mono text-[10px] text-[#6888ff] bg-[#6888ff]/10 px-1.5 rounded">{c.id}</span>
                    </div>
                    <p className="text-xs text-[#9aa3b8] font-medium">Inicio: {c.inicio} • Estado: <span className="text-[#69738c]">{c.estado}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-[#9aa3b8]">Inversión Estimada</p>
                    <p className="text-base font-black text-[#69738c]">{c.inversion}</p>
                  </div>
                </div>
              )) : <p className="text-center text-xs text-[#9aa3b8] py-4">No se encontraron campañas.</p>}
            </div>
          )}

          {activeTab === 'facturas' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black uppercase" style={{ color: N.text }}>Facturación DTE</h3>
                  <input type="text" placeholder="Buscar por N° de factura..." value={searchF} onChange={e => setSearchF(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-xs w-48 focus:outline-none" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }} />
                </div>
              </div>
              {mockFacturas.length > 0 ? mockFacturas.map(f => (
                <div key={f.id} onClick={() => setSelectedItem({type: 'factura', data: f})} className="p-4 rounded-2xl flex items-center justify-between transition-all hover:bg-[#6888ff]/10 cursor-pointer" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-[#6888ff]">{f.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${f.estado === 'Pagada' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{f.estado}</span>
                    </div>
                    <p className="text-xs text-[#69738c] font-medium">Emitida: {f.fecha} • Vence: {f.vencimiento}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-[#9aa3b8]">Monto Neto</p>
                    <p className="text-base font-black text-[#69738c]">{f.monto}</p>
                  </div>
                </div>
              )) : <p className="text-center text-xs text-[#9aa3b8] py-4">No se encontraron facturas.</p>}
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-4 mt-4 border-t border-[#bec8de]/30" style={{ color: N.textSub }}>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Creado: {a.fechaCreacion ? new Date(a.fechaCreacion).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Por: {a.creadoPor || 'Administrador del Sistema'}
            </div>
            
            {a.fechaModificacion && (
              <>
                <div className="w-px h-4 bg-[#bec8de] mx-1"></div>
                <div className="flex items-center gap-1.5 text-[#f59e0b]">
                  <Edit3 className="w-3.5 h-3.5" />
                  Editado: {new Date(a.fechaModificacion).toLocaleDateString('es-CL')} a las {new Date(a.fechaModificacion).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-1.5 text-[#f59e0b]">
                  <User className="w-3.5 h-3.5" />
                  Por: {a.modificadoPor}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sub-Modal Overlay para vista rapida */}
        {selectedItem && (
          <div className="absolute inset-0 z-50 bg-[#dfeaff]/95 backdrop-blur-sm p-8 flex flex-col justify-center transition-all animate-in fade-in zoom-in-95 duration-200 overflow-y-auto neu-scrollbar">
            <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 p-2 rounded-xl bg-white shadow-md hover:scale-110 transition-all text-[#69738c]">
              <X className="w-5 h-5" />
            </button>
            <div className="max-w-md mx-auto w-full text-center">
              <div className="w-16 h-16 rounded-3xl bg-white shadow-[4px_4px_10px_rgba(190,200,222,0.5)] mx-auto flex items-center justify-center mb-6">
                {selectedItem.type === 'contrato' && <Briefcase className="w-8 h-8 text-[#6888ff]" />}
                {selectedItem.type === 'campaña' && <TrendingUp className="w-8 h-8 text-[#6888ff]" />}
                {selectedItem.type === 'factura' && <FileText className="w-8 h-8 text-[#6888ff]" />}
              </div>
              <h3 className="text-2xl font-black text-[#69738c] capitalize mb-1">Vista Previa {selectedItem.type}</h3>
              <p className="text-sm font-mono text-[#6888ff] font-bold mb-8">{selectedItem.data.id}</p>
              
              <div className="space-y-3 text-left">
                {Object.entries(selectedItem.data).map(([key, val]) => (
                  <div key={key} className="flex justify-between p-3 rounded-xl bg-white/50 border border-white/50 shadow-sm">
                    <span className="text-xs uppercase font-bold text-[#9aa3b8]">{key}</span>
                    <span className="text-sm font-bold text-[#69738c]">{String(val)}</span>
                  </div>
                ))}
              </div>
              <NeuButton variant="primary" className="w-full mt-8 py-3" onClick={() => alert(`Abre la ruta: /${selectedItem.type}s/${selectedItem.data.id}`)}>
                Ir al Módulo de {selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1)}s
              </NeuButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper sub-components for DetailModal
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}>
      <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 mb-3" style={{ color: N.accent }}>{icon}{title}</h3>
      {children}
    </div>
  );
}
function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
function Field({ label, value, mono, icon }: { label: string; value?: string | null; mono?: boolean; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: N.textSub }}>{label}</p>
      <p className={`text-sm font-semibold flex items-center gap-1 ${mono ? 'font-mono' : ''}`} style={{ color: N.text }}>{icon}{value}</p>
    </div>
  );
}

// ─── Edit Modal ────────────────────────────────────────────────
function EditModal({ a, onClose, onSuccess }: { a: Anunciante; onClose: () => void; onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const handleUpdate = async (data: any) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    
    // Injecting modification metadata
    const updatePayload = {
      ...data,
      modificadoPor: 'Usuario Activo', // En produccion usar token de sesion
      fechaModificacion: new Date().toISOString()
    };

    const LS_KEY = 'silexar_anunciantes';
    const all = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
    const updated = all.map((item: any) => item.id === a.id ? { ...item, ...updatePayload } : item);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    toast({ title: '✅ Actualizado exitosamente', description: 'Los cambios han sido guardados.' });
    setIsLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#dfeaff]/95 backdrop-blur-md p-4 sm:p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 z-50 p-2.5 rounded-2xl bg-white shadow-[4px_4px_10px_rgba(0,0,0,0.1)] text-red-500 hover:scale-110 active:scale-95 transition-all">
          <X className="w-5 h-5" />
        </button>
        <div className="mt-8">
          <AnuncianteForm mode="edit" initialData={a as any} onSubmit={handleUpdate} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ────────────────────────────────────────────────
function DeleteModal({ a, onClose, onConfirm }: { a: Anunciante; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#dfeaff]/80 backdrop-blur-sm p-4">
      <div className="rounded-3xl p-8 max-w-md w-full text-center" style={{ background: N.base, boxShadow: `12px 12px 24px ${N.dark},-12px -12px 24px ${N.light}` }}>
        <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-red-100 text-red-500 shadow-[inset_4px_4px_8px_rgba(239,68,68,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black mb-2" style={{ color: N.text }}>¿Eliminar Anunciante?</h3>
        <p className="text-sm mb-8" style={{ color: N.textSub }}>
          Estás a punto de eliminar a <strong style={{ color: N.text }}>{a.nombreRazonSocial}</strong>. Esta acción no se puede deshacer y borrará todos sus datos.
        </p>
        <div className="flex gap-4 justify-center">
          <NeuButton variant="secondary" onClick={onClose} className="px-6 py-2.5">Cancelar</NeuButton>
          <NeuButton variant="danger" onClick={onConfirm} className="px-6 py-2.5 bg-red-500 text-white hover:bg-red-600 shadow-[4px_4px_8px_#bec8de,-2px_-2px_6px_#ffffff]">Eliminar</NeuButton>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function AnunciantesPage() {
  const router = useRouter();
  const [anunciantes, setAnunciantes] = useState<Anunciante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filterEstado, setFilterEstado] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false
  });
  const [viewingAnunciante, setViewingAnunciante] = useState<Anunciante | null>(null);
  const [editingAnunciante, setEditingAnunciante] = useState<Anunciante | null>(null);
  const [deletingAnunciante, setDeletingAnunciante] = useState<Anunciante | null>(null);

  const activos   = anunciantes.filter(a => a.activo).length;
  const inactivos = anunciantes.filter(a => !a.activo).length;

  const LS_KEY = 'silexar_anunciantes';

  const fetchAnunciantes = useCallback(async () => {
    setLoading(true);
    try {
      // Leer registros locales (guardados sin backend)
      const localRecords: Anunciante[] = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');

      // Intentar obtener registros del servidor
      let serverRecords: Anunciante[] = [];
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(), limit: '999',
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(filterEstado    && { estado: filterEstado }),
        });
        const res  = await fetch(`/api/anunciantes?${params}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) serverRecords = data.data;
      } catch { /* sin backend, usamos solo localStorage */ }

      // Fusionar: locales primero, luego los del servidor que no estén ya
      const localIds = new Set(localRecords.map(r => r.id));
      const merged = [
        ...localRecords,
        ...serverRecords.filter(r => !localIds.has(r.id)),
      ];

      // Filtros en memoria
      const filtered = merged.filter(a => {
        const matchSearch = !debouncedSearch ||
          a.nombreRazonSocial?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (a.rut ?? '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (a.emailContacto ?? '').toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchEstado = !filterEstado || a.estado === filterEstado;
        return matchSearch && matchEstado;
      });

      setAnunciantes(filtered);
      setPagination(p => ({
        ...p,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / p.limit),
        hasNextPage: p.page < Math.ceil(filtered.length / p.limit),
        hasPreviousPage: p.page > 1,
      }));
    } catch { /* silent */ } finally { setLoading(false); }
  }, [pagination.page, pagination.limit, debouncedSearch, filterEstado]);

  useEffect(() => { fetchAnunciantes(); }, [fetchAnunciantes]);
  useEffect(() => { setPagination(p => ({ ...p, page: 1 })); }, [debouncedSearch]);

  const LS_KEY_ACTIONS = 'silexar_anunciantes';

  const handleToggle = (id: string) => {
    const all = JSON.parse(localStorage.getItem(LS_KEY_ACTIONS) ?? '[]');
    const updated = all.map((a: Anunciante) =>
      a.id === id ? { ...a, activo: !a.activo, estado: a.activo ? 'inactivo' : 'activo' } : a
    );
    localStorage.setItem(LS_KEY_ACTIONS, JSON.stringify(updated));
    fetchAnunciantes();
  };

  const handleDelete = (a: Anunciante) => {
    setDeletingAnunciante(a);
  };

  const confirmDelete = () => {
    if (!deletingAnunciante) return;
    const all = JSON.parse(localStorage.getItem(LS_KEY_ACTIONS) ?? '[]');
    localStorage.setItem(LS_KEY_ACTIONS, JSON.stringify(all.filter((a: Anunciante) => a.id !== deletingAnunciante.id)));
    setDeletingAnunciante(null);
    fetchAnunciantes();
  };

  const handleView = (a: Anunciante) => {
    setViewingAnunciante(a);
  };

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
      <div className="max-w-7xl mx-auto space-y-7">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="p-2.5 rounded-xl transition-all"
              style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`, color: N.textSub }}>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: N.text }}>
                <Building2 className="w-6 h-6" style={{ color: N.accent }} />
                Gestión de Anunciantes
              </h1>
              <p className="text-sm mt-0.5" style={{ color: N.textSub }}>Administra tus clientes publicitarios</p>
            </div>
          </div>
          <NeuButton variant="primary" onClick={() => router.push('/anunciantes/nuevo')} className="px-5 py-3">
            <Plus className="w-4 h-4" />
            Nuevo Anunciante
          </NeuButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: 'Total Anunciantes', value: pagination.total, color: N.accent,   icon: Building2   },
            { label: 'Activos',           value: activos,           color: '#22c55e',  icon: TrendingUp  },
            { label: 'Inactivos',         value: inactivos,         color: N.textSub,  icon: AlertCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <NeuCard key={label} className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: N.textSub }}>{label}</p>
                  <p className="text-3xl font-black" style={{ color: N.text }}>{value}</p>
                </div>
              </div>
            </NeuCard>
          ))}
        </div>

        {/* Filters */}
        <NeuCard className="p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <NeuInput placeholder="Buscar por nombre, RUT, código o email..." value={search} onChange={setSearch} icon={Search} />
            </div>
            <div className="flex gap-3">
              <NeuSelect value={filterEstado} onChange={v => { setFilterEstado(v); setPagination(p => ({ ...p, page: 1 })); }}
                options={[
                  { value: '', label: 'Todos los estados' },
                  { value: 'activo', label: 'Activos' },
                  { value: 'inactivo', label: 'Inactivos' },
                  { value: 'suspendido', label: 'Suspendidos' },
                ]}
              />
              <NeuButton variant="secondary" onClick={fetchAnunciantes} aria-label="Actualizar" className="px-4">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </NeuButton>
            </div>
          </div>
        </NeuCard>

        {/* Table */}
        <NeuCard className="overflow-hidden p-0">
          {loading ? (
            <div className="p-5 space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-12 rounded-2xl animate-pulse" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }} />
              ))}
            </div>
          ) : anunciantes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}>
                <Building2 className="w-8 h-8" style={{ color: N.textSub }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: N.text }}>No hay anunciantes</h3>
              <p className="text-sm" style={{ color: N.textSub }}>
                {search || filterEstado ? 'Sin resultados para los filtros aplicados' : 'Comienza agregando tu primer anunciante'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${N.dark}40` }}>
                    {['Código ID', 'Razón Social', 'RUT', 'Contacto', 'Ciudad', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="text-left py-4 px-4 text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {anunciantes.map(a => (
                    <tr key={a.id} onClick={() => handleView(a)} className="transition-all group hover:bg-[#6888ff]/5 cursor-pointer" style={{ borderBottom: `1px solid ${N.dark}30` }}>
                      <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                        <span className="font-mono text-sm font-bold" style={{ color: N.accent }}>{a.codigo}</span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-sm" style={{ color: N.text }}>{a.nombreRazonSocial}</p>
                        {a.giroActividad && <p className="text-xs mt-0.5" style={{ color: N.textSub }}>{a.giroActividad}</p>}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm" style={{ color: N.text }}>{a.rut || '—'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {a.emailContacto && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: N.textSub }}>
                              <Mail className="w-3.5 h-3.5" />{a.emailContacto}
                            </div>
                          )}
                          {a.telefonoContacto && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: N.textSub }}>
                              <Phone className="w-3.5 h-3.5" />{a.telefonoContacto}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: N.textSub }}>
                          <MapPin className="w-3.5 h-3.5" />{a.ciudad || a.pais}
                        </div>
                      </td>
                      <td className="py-4 px-4"><StatusBadge estado={a.estado} /></td>
                      <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {
                            [
                              { icon: Eye,    color: N.accent,   action: () => handleView(a),                                                         title: 'Ver detalle' },
                              { icon: Edit3,  color: '#f59e0b',  action: () => setEditingAnunciante(a),                                               title: 'Editar' },
                              { icon: a.activo ? ToggleRight : ToggleLeft, color: a.activo ? N.textSub : '#22c55e', action: () => handleToggle(a.id), title: a.activo ? 'Desactivar' : 'Activar' },
                              { icon: Trash2, color: '#ef4444',  action: () => handleDelete(a),                                                      title: 'Eliminar' },
                            ].map(({ icon: Icon, color, action, title }) => (
                              <button key={title} onClick={action} title={title}
                                className="p-2 rounded-xl transition-all hover:scale-110 active:scale-95"
                                style={{ background: N.base, boxShadow: `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}`, color }}>
                                <Icon className="w-3.5 h-3.5" />
                              </button>
                            ))
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: `1px solid ${N.dark}30` }}>
              <p className="text-xs" style={{ color: N.textSub }}>
                {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <NeuButton variant="secondary" aria-label="Anterior" disabled={!pagination.hasPreviousPage}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} className="p-2.5">
                  <ChevronLeft className="w-4 h-4" />
                </NeuButton>
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}`, color: N.text }}>
                  {pagination.page} / {pagination.totalPages}
                </span>
                <NeuButton variant="secondary" aria-label="Siguiente" disabled={!pagination.hasNextPage}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} className="p-2.5">
                  <ChevronRight className="w-4 h-4" />
                </NeuButton>
              </div>
            </div>
          )}
        </NeuCard>

        {/* Footer */}
        <div className="text-center pb-4">
          <p className="text-xs font-medium" style={{ color: N.textSub }}>
            Módulo Anunciantes · Silexar Pulse TIER 0 Enterprise
          </p>
        </div>

      </div>

      {viewingAnunciante && <DetailModal a={viewingAnunciante} onClose={() => setViewingAnunciante(null)} />}
      {editingAnunciante && <EditModal a={editingAnunciante} onClose={() => setEditingAnunciante(null)} onSuccess={fetchAnunciantes} />}
      {deletingAnunciante && <DeleteModal a={deletingAnunciante} onClose={() => setDeletingAnunciante(null)} onConfirm={confirmDelete} />}

    </div>
  );
}
