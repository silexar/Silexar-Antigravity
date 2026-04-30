'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, X, Maximize2, Minimize2, FileText, MapPin, User,
  Mail, Phone, Globe, Briefcase, TrendingUp, Calendar, CheckCircle2,
  AlertCircle, XCircle, Plus, ExternalLink
} from 'lucide-react';

const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8',
};

interface Anunciante {
  id: string; codigo: string; rut: string | null;
  nombreRazonSocial: string; giroActividad: string | null;
  direccion: string | null; ciudad: string | null; pais: string;
  emailContacto: string | null; telefonoContacto: string | null;
  estado: 'activo' | 'inactivo' | 'suspendido' | 'pendiente';
  categoriaCliente?: string; comunaProvincia?: string | null;
  nombreContactoPrincipal?: string | null; cargoContactoPrincipal?: string | null;
  paginaWeb?: string | null;
  riesgoFinanciero?: string; notas?: string;
  tieneFacturacionElectronica?: boolean; numeroDeudor?: string;
  tipoDTE?: string; condicionPago?: string; direccionFacturacion?: string;
  ivaPorcentaje?: number;
  creadoPor?: string; fechaCreacion?: string; fechaModificacion?: string;
}

interface AnuncianteDetailWindowProps {
  anunciante: Anunciante;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIA_MAP: Record<string, string> = {
  normal: 'Cliente General',
  politica: 'Contenido Político',
  juego_azar: 'Juego de Azar',
};

function StatusBadge({ estado }: { estado: string }) {
  const config: Record<string, { opacity: number; label: string; icon: React.ElementType }> = {
    activo:    { opacity: 1,    label: 'Activo',    icon: CheckCircle2 },
    inactivo:  { opacity: 0.5,  label: 'Inactivo',  icon: XCircle },
    suspendido:{ opacity: 0.7,  label: 'Suspendido', icon: AlertCircle },
    pendiente: { opacity: 0.85, label: 'Pendiente',  icon: Building2 },
  };
  const c = config[estado] ?? config.pendiente;
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: `${N.accent}15`, color: N.accent, opacity: c.opacity, boxShadow: `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}` }}>
      <Icon className="w-3 h-3" />{c.label}
    </span>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-2.5" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}>
      <h3 className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 mb-1.5" style={{ color: N.accent }}>{icon}{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, mono, icon }: { label: string; value?: string | null; mono?: boolean; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: N.textSub }}>{label}</p>
      <p className={`text-xs font-semibold flex items-center gap-1 break-words ${mono ? 'font-mono' : ''}`} style={{ color: N.text }}>{icon}{value}</p>
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{children}</div>;
}

function Grid4({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">{children}</div>;
}

export function AnuncianteDetailWindow({ anunciante: a, isOpen, onClose }: AnuncianteDetailWindowProps) {
  const [pos, setPos] = useState({ x: 60, y: 40 });
  const [size, setSize] = useState({ width: 900, height: 700 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'contratos' | 'campanas' | 'facturas'>('info');
  const [selectedItem, setSelectedItem] = useState<{type: string, data: any} | null>(null);

  // Resize state
  const resizing = useRef(false);
  const resizeDir = useRef<'se' | 'sw' | 'ne' | 'nw'>('se');
  const resizeStart = useRef({ x: 0, y: 0, width: 900, height: 700, posX: 60, posY: 40 });

  useEffect(() => {
    if (isOpen) {
      const w = Math.min(900, window.innerWidth - 80);
      const h = Math.min(700, window.innerHeight - 80);
      setSize({ width: w, height: h });
      setPos({ x: (window.innerWidth - w) / 2, y: (window.innerHeight - h) / 2 });
    }
  }, [isOpen]);

  // Drag & resize global handlers
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) {
        setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
      }
      if (resizing.current) {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;
        const dir = resizeDir.current;

        let newW = resizeStart.current.width;
        let newH = resizeStart.current.height;
        let newX = resizeStart.current.posX;
        let newY = resizeStart.current.posY;

        if (dir.includes('e')) newW = Math.max(520, Math.min(window.innerWidth - 40, resizeStart.current.width + dx));
        if (dir.includes('w')) {
          const proposedW = Math.max(520, resizeStart.current.width - dx);
          newW = proposedW;
          newX = resizeStart.current.posX + (resizeStart.current.width - proposedW);
        }
        if (dir.includes('s')) newH = Math.max(400, Math.min(window.innerHeight - 40, resizeStart.current.height + dy));
        if (dir.includes('n')) {
          const proposedH = Math.max(400, resizeStart.current.height - dy);
          newH = proposedH;
          newY = resizeStart.current.posY + (resizeStart.current.height - proposedH);
        }

        setSize({ width: newW, height: newH });
        setPos({ x: newX, y: newY });
      }
    };
    const onUp = () => {
      dragging.current = false;
      resizing.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if (isMaximized || selectedItem) return;
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  const onResizeMouseDown = (e: React.MouseEvent, dir: 'se' | 'sw' | 'ne' | 'nw') => {
    e.stopPropagation();
    e.preventDefault();
    resizing.current = true;
    resizeDir.current = dir;
    resizeStart.current = { x: e.clientX, y: e.clientY, width: size.width, height: size.height, posX: pos.x, posY: pos.y };
  };

  const toggleMaximize = () => {
    if (!isMaximized) {
      setIsMaximized(true);
      setIsMinimized(false);
      setPos({ x: 20, y: 20 });
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 40 });
    } else {
      setIsMaximized(false);
      const w = Math.min(900, window.innerWidth - 80);
      const h = Math.min(700, window.innerHeight - 80);
      setSize({ width: w, height: h });
      setPos({ x: (window.innerWidth - w) / 2, y: (window.innerHeight - h) / 2 });
    }
  };

  if (!isOpen) return null;

  const mockContratos = [
    { id: 'CTR-2026-089', estado: 'Activo', fechaInicio: '2026-03-01', fechaTermino: '2026-12-31', valor: '$12.500.000', creadoPor: 'Admin' },
    { id: 'CTR-2025-012', estado: 'Finalizado', fechaInicio: '2025-01-01', fechaTermino: '2025-12-31', valor: '$8.000.000', creadoPor: 'Ventas' },
  ];

  const mockCampanas = [
    { id: 'CMP-2026-01', nombre: 'Campaña Verano Radios', estado: 'En curso', inversion: '$5.000.000', inicio: '2026-03-15' },
    { id: 'CMP-2026-02', nombre: 'Lanzamiento Producto Nuevo', estado: 'Planificada', inversion: '$2.500.000', inicio: '2026-05-01' },
  ];

  const mockFacturas = [
    { id: 'FAC-88902', fecha: '2026-04-01', monto: '$2.500.000', estado: 'Pagada', vencimientos: '2026-04-30' },
    { id: 'FAC-88945', fecha: '2026-05-01', monto: '$2.500.000', estado: 'Pendiente', vencimientos: '2026-05-30' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-[60]"
          style={{ pointerEvents: 'none' }}
        >
          <style>{`
            .neu-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
            .neu-scrollbar::-webkit-scrollbar-track { background: #dfeaff; border-radius: 10px; }
            .neu-scrollbar::-webkit-scrollbar-thumb { background: #bec8de; border-radius: 10px; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.08); }
            .neu-scrollbar::-webkit-scrollbar-thumb:hover { background: #6888ff; }
          `}</style>
          <div
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: isMinimized ? 360 : size.width,
              height: isMinimized ? 52 : size.height,
              background: N.base,
              boxShadow: `12px 12px 24px ${N.dark},-12px -12px 24px ${N.light}`,
              pointerEvents: 'auto',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 24,
              border: '1px solid rgba(255,255,255,0.4)',
              overflow: 'hidden',
              minWidth: isMinimized ? 360 : 520,
              minHeight: isMinimized ? 52 : 400,
              maxWidth: 'calc(100vw - 40px)',
              maxHeight: 'calc(100vh - 40px)',
            }}
          >
            {/* Header OS */}
            <div
              onMouseDown={onHeaderMouseDown}
              className="flex items-center justify-between px-5 py-3 border-b border-[#bec8de]/40 cursor-grab active:cursor-grabbing shrink-0 select-none"
              style={{ background: N.base }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0 flex items-center gap-2">
                  <span className="text-sm font-bold select-none truncate" style={{ color: N.text }} title={a.nombreRazonSocial}>{a.nombreRazonSocial}</span>
                  <span className="text-xs font-mono font-bold select-none px-1.5 py-0.5 rounded-md" style={{ color: N.accent, background: `${N.accent}12` }}>{a.codigo}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge estado={a.estado} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const w = window.screen.availWidth;
                    const h = window.screen.availHeight;
                    window.open(
                      `/anunciantes/ver?id=${a.id}`,
                      '_blank',
                      `width=${w},height=${h},left=0,top=0,resizable=yes,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no`
                    );
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all hover:scale-105 text-[11px] font-bold"
                  style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`, color: N.textSub }}
                  title="Abrir en ventana nueva"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ventana</span>
                </button>
                <button
                  onClick={() => toggleMaximize()}
                  className="p-1.5 rounded-lg transition-all hover:scale-105"
                  style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`, color: N.textSub }}
                  title={isMaximized ? 'Restaurar' : 'Maximizar'}
                >
                  {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-all hover:scale-105"
                  style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`, color: N.textSub }}
                  title="Cerrar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tabs Nav */}
            {!isMinimized && (
              <div className="flex gap-2 px-5 pt-3 pb-2 border-b border-[#bec8de]/30 bg-[#dfeaff]/50 overflow-x-auto shrink-0">
                {[
                  { id: 'info', label: 'General', icon: FileText },
                  { id: 'contratos', label: 'Contratos', icon: Briefcase },
                  { id: 'campanas', label: 'Campañas', icon: TrendingUp },
                  { id: 'facturas', label: 'Facturas', icon: FileText }
                ].map(t => (
                  <button
                    key={t.id} onClick={() => { setActiveTab(t.id as any); setSelectedItem(null); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-[#6888ff] text-white shadow-[4px_4px_8px_#bec8de,-2px_-2px_6px_#ffffff]' : 'text-[#69738c] hover:bg-[#6888ff]/10'}`}
                  >
                    <t.icon className="w-3.5 h-3.5" />{t.label}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            {!isMinimized && (
              <div className="flex-1 overflow-y-auto p-3 space-y-3 neu-scrollbar relative min-h-0">
                {activeTab === 'info' && (
                  <>
                    <Section icon={<Building2 className="w-3.5 h-3.5" />} title="Información Legal y Fiscal">
                      <Grid4>
                        <Field label="RUT" value={a.rut} mono />
                        <Field label="Giro / Actividad" value={a.giroActividad} />
                        <Field label="Categoría" value={CATEGORIA_MAP[a.categoriaCliente ?? ''] ?? a.categoriaCliente} />
                        <Field label="País" value={a.pais} />
                      </Grid4>
                    </Section>
                    <Section icon={<MapPin className="w-3.5 h-3.5" />} title="Ubicación Geográfica">
                      <Grid2>
                        <Field label="Dirección" value={a.direccion} />
                        <Field label="Ciudad" value={a.ciudad} />
                        <Field label="Comuna / Provincia" value={a.comunaProvincia} />
                      </Grid2>
                    </Section>
                    <Section icon={<User className="w-3.5 h-3.5" />} title="Contacto">
                      <Grid4>
                        <Field label="Email" value={a.emailContacto} icon={<Mail className="w-3 h-3" />} />
                        <Field label="Teléfono" value={a.telefonoContacto} icon={<Phone className="w-3 h-3" />} />
                        <Field label="Sitio Web" value={a.paginaWeb} icon={<Globe className="w-3 h-3" />} />
                        <div className="sm:col-span-2 lg:col-span-1">
                          <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: N.textSub }}>Representante Principal</p>
                          <p className="text-xs font-bold" style={{ color: N.text }}>{a.nombreContactoPrincipal || '—'}</p>
                          <p className="text-[11px]" style={{ color: N.textSub }}>{a.cargoContactoPrincipal || '—'}</p>
                        </div>
                      </Grid4>
                    </Section>
                    <Section icon={<Briefcase className="w-3.5 h-3.5" />} title="Facturación y Riesgo">
                      <Grid4>
                        <Field label="Perfil de Riesgo" value={a.riesgoFinanciero} />
                        <Field label="Facturación DTE" value={a.tieneFacturacionElectronica ? 'Habilitada' : 'No habilitada'} icon={a.tieneFacturacionElectronica ? <CheckCircle2 className="w-3 h-3" style={{ color: N.accent }} /> : undefined} />
                        {a.tieneFacturacionElectronica && <>
                          <Field label="N° Deudor (ERP)" value={a.numeroDeudor} mono />
                          <Field label="Tipo DTE" value={a.tipoDTE} />
                          <Field label="Condición de Pago" value={a.condicionPago} />
                          <Field label="Dirección Fiscal" value={a.direccionFacturacion} />
                          {a.tipoDTE && !a.tipoDTE.includes('(34)') && (
                            <Field label="IVA Aplicado" value={`${a.ivaPorcentaje ?? 19}%`} />
                          )}
                        </>}
                      </Grid4>
                    </Section>
                    {a.notas && (
                      <Section icon={<FileText className="w-3.5 h-3.5" />} title="Notas y Documentos">
                        <p className="text-xs whitespace-pre-wrap" style={{ color: N.text }}>{a.notas}</p>
                      </Section>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold pt-2 border-t border-[#bec8de]/30" style={{ color: N.textSub }}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Creado: {a.fechaCreacion ? new Date(a.fechaCreacion).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Por: {a.creadoPor || 'Administrador del Sistema'}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'contratos' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-xs font-black uppercase" style={{ color: N.text }}>Historial de Contratos</h3>
                      <button className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all" style={{ background: N.accent, color: '#fff', boxShadow: `4px 4px 8px ${N.dark},-2px -2px 6px ${N.light}` }}>
                        <Plus className="w-3 h-3" />Nuevo
                      </button>
                    </div>
                    {mockContratos.map(c => (
                      <div key={c.id} onClick={() => setSelectedItem({type: 'contrato', data: c})} className="p-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 transition-all hover:bg-[#6888ff]/10 cursor-pointer" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="font-mono text-xs font-bold" style={{ color: N.accent }}>{c.id}</span>
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${N.accent}15`, color: N.accent }}>{c.estado}</span>
                          </div>
                          <p className="text-[11px] font-medium" style={{ color: N.text }}>Vigencia: {c.fechaInicio} al {c.fechaTermino}</p>
                        </div>
                        <div className="text-right sm:text-right w-full sm:w-auto">
                          <p className="text-[10px] uppercase font-bold" style={{ color: N.textSub }}>Valor Total</p>
                          <p className="text-base font-black" style={{ color: N.text }}>{c.valor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'campanas' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-xs font-black uppercase" style={{ color: N.text }}>Campañas Asociadas</h3>
                      <button className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all" style={{ background: N.accent, color: '#fff', boxShadow: `4px 4px 8px ${N.dark},-2px -2px 6px ${N.light}` }}>
                        <Plus className="w-3 h-3" />Nueva
                      </button>
                    </div>
                    {mockCampanas.map(c => (
                      <div key={c.id} onClick={() => setSelectedItem({type: 'campaña', data: c})} className="p-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 transition-all hover:bg-[#6888ff]/10 cursor-pointer" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="font-bold text-xs" style={{ color: N.text }}>{c.nombre}</span>
                            <span className="font-mono text-[10px] px-1 rounded" style={{ background: `${N.accent}15`, color: N.accent }}>{c.id}</span>
                          </div>
                          <p className="text-[11px] font-medium" style={{ color: N.textSub }}>Inicio: {c.inicio} • Estado: <span style={{ color: N.text }}>{c.estado}</span></p>
                        </div>
                        <div className="text-right w-full sm:w-auto">
                          <p className="text-[10px] uppercase font-bold" style={{ color: N.textSub }}>Inversión Estimada</p>
                          <p className="text-sm font-black" style={{ color: N.text }}>{c.inversion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'facturas' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-xs font-black uppercase" style={{ color: N.text }}>Facturación DTE</h3>
                    </div>
                    {mockFacturas.map(f => (
                      <div key={f.id} onClick={() => setSelectedItem({type: 'factura', data: f})} className="p-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 transition-all hover:bg-[#6888ff]/10 cursor-pointer" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="font-mono text-xs font-bold" style={{ color: N.accent }}>{f.id}</span>
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${N.accent}15`, color: N.accent }}>{f.estado}</span>
                          </div>
                          <p className="text-[11px] font-medium" style={{ color: N.text }}>Emitida: {f.fecha} • Vence: {f.vencimientos}</p>
                        </div>
                        <div className="text-right w-full sm:w-auto">
                          <p className="text-[10px] uppercase font-bold" style={{ color: N.textSub }}>Monto Neto</p>
                          <p className="text-sm font-black" style={{ color: N.text }}>{f.monto}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-Modal */}
                {selectedItem && (
                  <div className="absolute inset-0 z-50 bg-[#dfeaff]/95 backdrop-blur-sm p-3 flex flex-col transition-all animate-in fade-in zoom-in-95 duration-200 overflow-y-auto neu-scrollbar">
                    <button onClick={() => setSelectedItem(null)} className="absolute top-3 right-3 p-2 rounded-xl transition-all hover:scale-110 z-10" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-2px -2px 6px ${N.light}`, color: N.text }}>
                      <X className="w-5 h-5" />
                    </button>
                    <div className="max-w-lg mx-auto w-full text-center my-auto py-2">
                      <div className="w-14 h-14 rounded-3xl mx-auto flex items-center justify-center mb-4" style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-4px -4px 12px ${N.light}` }}>
                        {selectedItem.type === 'contrato' && <Briefcase className="w-7 h-7" style={{ color: N.accent }} />}
                        {selectedItem.type === 'campaña' && <TrendingUp className="w-7 h-7" style={{ color: N.accent }} />}
                        {selectedItem.type === 'factura' && <FileText className="w-7 h-7" style={{ color: N.accent }} />}
                      </div>
                      <h3 className="text-xl font-black capitalize mb-1" style={{ color: N.text }}>Vista Previa {selectedItem.type}</h3>
                      <p className="text-sm font-mono font-bold mb-4" style={{ color: N.accent }}>{selectedItem.data.id}</p>
                      <div className="space-y-2 text-left">
                        {Object.entries(selectedItem.data).map(([key, val]) => (
                          <div key={key} className="flex justify-between p-2.5 rounded-xl" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }}>
                            <span className="text-[11px] uppercase font-bold" style={{ color: N.textSub }}>{key}</span>
                            <span className="text-xs font-bold" style={{ color: N.text }}>{String(val)}</span>
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-4 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all" style={{ background: N.accent, boxShadow: `4px 4px 8px ${N.dark},-2px -2px 6px ${N.light}` }} onClick={() => alert(`Abre la ruta: /${selectedItem.type}s/${selectedItem.data.id}`)}>
                        Ir al Módulo de {selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1)}s
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resize handles */}
            {!isMinimized && !isMaximized && (
              <>
                <div
                  onMouseDown={(e) => onResizeMouseDown(e, 'se')}
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
                  style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(104,136,255,0.3) 50%)', borderBottomRightRadius: 24 }}
                />
                <div
                  onMouseDown={(e) => onResizeMouseDown(e, 'sw')}
                  className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50"
                  style={{ background: 'linear-gradient(225deg, transparent 50%, rgba(104,136,255,0.3) 50%)', borderBottomLeftRadius: 24 }}
                />
                <div
                  onMouseDown={(e) => onResizeMouseDown(e, 'ne')}
                  className="absolute top-10 right-0 w-4 h-4 cursor-ne-resize z-50"
                  style={{ background: 'linear-gradient(45deg, transparent 50%, rgba(104,136,255,0.3) 50%)', borderTopRightRadius: 8 }}
                />
                <div
                  onMouseDown={(e) => onResizeMouseDown(e, 'nw')}
                  className="absolute top-10 left-0 w-4 h-4 cursor-nw-resize z-50"
                  style={{ background: 'linear-gradient(315deg, transparent 50%, rgba(104,136,255,0.3) 50%)', borderTopLeftRadius: 8 }}
                />
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
