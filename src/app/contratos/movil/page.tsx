/**
 * 📱 SILEXAR PULSE - Contratos Mobile App TIER 0
 * 
 * @description Interface móvil completa para gestión de contratos
 * con 6 tabs funcionales, API-driven, y acciones en tiempo real.
 * Paridad 1:1 con desktop. Integrado con /api/mobile/contratos.
 * 
 * @version 2025.5.0
 * @tier TIER_0_FORTUNE_10
 * @platform MOBILE
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home, FileText, BarChart3, Brain, MoreHorizontal,
  Bell, Wifi, WifiOff, Plus, Phone, ChevronRight,
  CheckCircle2, AlertTriangle, Zap, Send, RefreshCw,
  Shield, Clock, Target, Search, TrendingUp, Sparkles,
  DollarSign, Activity, Briefcase, Download, Settings,
  ClipboardList, MessageSquare, Mic, Building2,
} from 'lucide-react';
import type { DashboardMobile, AlertaContrato } from '../_shared/types';
import { formatCurrency } from '../_shared/useContratos';
import { MobileContratosView } from './_components/MobileContratosView';
import { MobilePipelineView } from './_components/MobilePipelineView';
import { MobileCalendarioView } from './_components/MobileCalendarioView';
import { MobileAnalyticsView } from './_components/MobileAnalyticsView';
import { MobileAccionesSheet } from './_components/MobileAccionesSheet';
import { SmartCaptureView } from './_components/SmartCaptureView';
import { ValidationQueueView } from './_components/ValidationQueueView';
import { MobileCobranzaView } from './_components/MobileCobranzaView';
import { MobileCuentaCorrienteView } from './_components/MobileCuentaCorrienteView';
import { MobileFacturacionView } from './_components/MobileFacturacionView';
import { MobileExportView } from './_components/MobileExportView';
import { MobileReportesView } from './_components/MobileReportesView';
import { MobileComandoIAView } from './_components/MobileComandoIAView';
import { MobileConfigView } from './_components/MobileConfigView';
import { MobileRenovacionesView } from './_components/MobileRenovacionesView';
import { MobileTrafficView } from './_components/MobileTrafficView';
import { MobileWorkspaceView } from './_components/MobileWorkspaceView';
import { MobileAprobacionView } from './_components/MobileAprobacionView';
import { MobileNotificacionesView } from './_components/MobileNotificacionesView';
import { MobileMiRendimientoView } from './_components/MobileMiRendimientoView';
import { MobileDailyChecklist } from './_components/MobileDailyChecklist';
import { MobileTimelineView } from './_components/MobileTimelineView';
import { MobilePredictorView } from './_components/MobilePredictorView';
import { FloatingActionButton } from './_components/FloatingActionButton';
import { MobileProposalGenerator } from './_components/MobileProposalGenerator';
import { MobileClienteCard } from './_components/MobileClienteCard';
import { MobileVoiceNotes } from './_components/MobileVoiceNotes';
import { MobileAutoFollowUp } from './_components/MobileAutoFollowUp';

type ContratoTab = 'home' | 'contratos' | 'crear' | 'pipeline' | 'calendario' | 'analytics' | 'mas';
type SubVistaMas = 'menu' | 'cobranza' | 'cuenta' | 'facturacion' | 'exportar' | 'reportes' | 'comando' | 'config' | 'renovaciones' | 'traffic' | 'workspace' | 'validacion' | 'aprobaciones' | 'notificaciones' | 'rendimiento' | 'checklist' | 'timeline' | 'predictor' | 'propuestas' | 'fichacliente' | 'voicenotes' | 'seguimientos';

// ═══════════════════════════════════════════════════════════════
// AUTH HEADERS (centralizado)
// ═══════════════════════════════════════════════════════════════

const AUTH_HEADERS = {
  'Authorization': 'Bearer mock-token-silexar',
  'Content-Type': 'application/json',
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ContratosMovilPage() {
  const router = useRouter();
  const [tabActiva, setTabActiva] = useState<ContratoTab>('home');
  const [showSmartCapture, setShowSmartCapture] = useState(false);
  const [subVista, setSubVista] = useState<SubVistaMas>('menu');
  const [dashboard, setDashboard] = useState<DashboardMobile | null>(null);
  const [alertas, setAlertas] = useState<AlertaContrato[]>([]);
  const [online] = useState(true);
  const [loading, setLoading] = useState(true);

  // Action sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetContrato, setSheetContrato] = useState({ id: '', numero: '', cliente: '', acciones: ['aprobar', 'comentar'] });

  // ── FETCH DASHBOARD ──
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, alertRes] = await Promise.all([
        fetch('/api/mobile/contratos?endpoint=dashboard', { headers: AUTH_HEADERS }),
        fetch('/api/mobile/contratos?endpoint=alertas', { headers: AUTH_HEADERS }),
      ]);
      const dashData = await dashRes.json();
      const alertData = await alertRes.json();

      if (dashData.success) setDashboard(dashData.data);
      if (alertData.success) setAlertas(alertData.data);
    } catch {
      // Silent fail, show cached or defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const kpis = dashboard?.kpis;
  const usuario = dashboard?.usuario;
  const noLeidas = alertas.filter(a => !a.leida).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dfeaff] to-[#5572ee] pb-24">
      {/* ═══════════════════════════════════════════════════════ */}
      {/*  HEADER                                                */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-[#6888ff] to-[#5572ee] text-white px-4 pt-12 pb-6 rounded-b-3xl shadow-xl shadow-indigo-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[#6888ff] text-sm">Bienvenido/a</p>
            <h1 className="text-xl font-black">{usuario?.nombre || 'Ejecutivo'}</h1>
            <p className="text-xs text-[#6888ff] mt-0.5">{usuario?.rol || 'Comercial'}</p>
          </div>
          <div className="flex items-center gap-2">
            {online ? (
              <Wifi className="w-5 h-5 text-[#6888ff]" />
            ) : (
              <WifiOff className="w-5 h-5 text-[#6888ff]" />
            )}
            <button className="p-2 rounded-xl bg-[#dfeaff]/10 relative active:scale-90">
              <Bell className="w-5 h-5" />
              {noLeidas > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#dfeaff]0 rounded-full text-[10px] font-bold flex items-center justify-center">
                  {noLeidas}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* QUICK KPIs */}
        {kpis && (
          <div className="grid grid-cols-3 gap-3">
            <KPIMini icon={<FileText className="w-4 h-4 text-[#6888ff]" />} valor={String(kpis.contratosActivos)} label="Activos" />
            <KPIMini icon={<Target className="w-4 h-4 text-[#6888ff]" />} valor={String(kpis.accionesPendientes)} label="Pendientes" />
            <KPIMini icon={<TrendingUp className="w-4 h-4 text-[#6888ff]" />} valor={`${Math.round((kpis.metaCompletada / kpis.metaMes) * 100)}%`} label="Meta" />
          </div>
        )}

        {loading && !kpis && (
          <div className="flex justify-center py-4">
            <RefreshCw className="w-6 h-6 animate-spin text-[#6888ff]" />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  CONTENT                                               */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="px-4 py-6 space-y-6">
        {/* TAB: HOME */}
        {tabActiva === 'home' && (
          <>
            {/* ACCIONES RÁPIDAS */}
            <SectionTitle icon={<Zap className="w-5 h-5 text-[#6888ff]" />} title="ACCIONES RÁPIDAS" />
            <div className="space-y-3">
              <AccionRapida
                icon={<Sparkles className="w-5 h-5 text-white" />}
                titulo="Smart Capture IA"
                badge={0}
                onClick={() => setShowSmartCapture(true)}
                color="bg-gradient-to-r from-violet-600 to-fuchsia-600"
                highlight
              />
              <AccionRapida
                icon={<Plus className="w-5 h-5 text-white" />}
                titulo="Nuevo Contrato Express"
                onClick={() => router.push('/contratos/movil/express')}
                color="bg-[#6888ff]"
              />
              <AccionRapida
                icon={<Phone className="w-5 h-5 text-white" />}
                titulo="Llamadas Pendientes"
                badge={2}
                onClick={() => setTabActiva('contratos')}
                color="bg-gradient-to-r from-[#6888ff] to-cyan-500"
              />
              <AccionRapida
                icon={<CheckCircle2 className="w-5 h-5 text-white" />}
                titulo="Aprobaciones Recibidas"
                badge={kpis?.accionesPendientes || 0}
                onClick={() => {
                  setSheetContrato({ id: 'ctr-002', numero: 'CTR-2025-00090', cliente: 'Falabella', acciones: ['aprobar', 'rechazar', 'comentar'] });
                  setSheetOpen(true);
                }}
                color="bg-gradient-to-r from-[#6888ff] to-[#5572ee]"
              />
              <AccionRapida
                icon={<Send className="w-5 h-5 text-white" />}
                titulo="Enviar Propuesta"
                onClick={() => setTabActiva('contratos')}
                color="bg-gradient-to-r from-[#6888ff] to-[#5572ee]"
              />
            </div>

            {/* ALERTAS */}
            {alertas.length > 0 && (
              <>
                <SectionTitle icon={<AlertTriangle className="w-5 h-5 text-[#9aa3b8]" />} title="ALERTAS" />
                <div className="space-y-2">
                  {alertas.map(alerta => (
                    <AlertaCard key={alerta.id} alerta={alerta} />
                  ))}
                </div>
              </>
            )}

            {/* PIPELINE PREVIEW */}
            {dashboard?.pipeline && (
              <>
                <SectionTitle icon={<BarChart3 className="w-5 h-5 text-[#6888ff]" />} title="PIPELINE" />
                <div className="bg-[#dfeaff] rounded-2xl border border-[#bec8de30] p-4 shadow-sm">
                  {dashboard.pipeline.map((etapa) => (
                    <div key={etapa.etapa} className="flex items-center justify-between py-2 border-b border-[#bec8de] last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: etapa.color }} />
                        <span className="text-sm font-medium text-[#69738c]">{etapa.etapa}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#9aa3b8]">{etapa.cantidad} ctr</span>
                        <span className="text-xs font-bold text-[#69738c]">{formatCurrency(etapa.valor)}</span>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setTabActiva('pipeline')} className="w-full text-center pt-3 text-xs font-bold text-[#6888ff]">
                    Ver Pipeline Completo →
                  </button>
                </div>
              </>
            )}

            {/* ACTIVIDAD RECIENTE */}
            {dashboard?.actividadReciente && (
              <>
                <SectionTitle icon={<Clock className="w-5 h-5 text-[#9aa3b8]" />} title="ACTIVIDAD RECIENTE" />
                <div className="space-y-2">
                  {dashboard.actividadReciente.map(act => (
                    <div key={act.id} className="bg-[#dfeaff] rounded-xl p-3 flex items-center gap-3 border border-[#bec8de30]">
                      <div className="w-8 h-8 rounded-lg bg-[#6888ff]/10 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-[#6888ff]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#69738c] truncate">{act.descripcion}</p>
                      </div>
                      <span className="text-xs text-[#9aa3b8] shrink-0">{act.hace}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* SENTINEL STATUS */}
            <div className="p-4 rounded-2xl bg-[#dfeaff] text-white flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#6888ff]/40 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-bold">Sentinel Activo</p>
                <p className="text-xs text-[#9aa3b8]">Sincronización automática · {online ? 'Online' : 'Offline'}</p>
              </div>
              <Search className="w-4 h-4 text-[#9aa3b8]" />
            </div>
          </>
        )}

        {/* TAB: CONTRATOS */}
        {tabActiva === 'contratos' && <MobileContratosView />}

        {/* TAB: CREAR (Smart Capture) */}
        {tabActiva === 'crear' && <SmartCaptureView onClose={() => setTabActiva('home')} />}

        {/* TAB: PIPELINE */}
        {tabActiva === 'pipeline' && <MobilePipelineView />}

        {/* TAB: CALENDARIO */}
        {tabActiva === 'calendario' && <MobileCalendarioView />}

        {/* TAB: ANALYTICS */}
        {tabActiva === 'analytics' && <MobileAnalyticsView />}

        {/* TAB: MÁS */}
        {tabActiva === 'mas' && (
          <div className="space-y-3">
            {/* Sub-vista back button */}
            {subVista !== 'menu' && (
              <button onClick={() => setSubVista('menu')} className="flex items-center gap-1 text-sm text-[#6888ff] font-bold mb-2 active:scale-95">
                <ChevronRight className="w-4 h-4 rotate-180" /> Volver
              </button>
            )}

            {/* MENU */}
            {subVista === 'menu' && (
              <>
                {/* COLA IA */}
                <ValidationQueueView />

                <SectionTitle icon={<MoreHorizontal className="w-5 h-5 text-[#9aa3b8]" />} title="MÁS OPCIONES" />
                <MasOpcion icon={<DollarSign className="w-5 h-5" />} label="Cobranza" desc="Gestión de pagos vencidos" color="bg-[#dfeaff] text-[#9aa3b8]" onClick={() => setSubVista('cobranza')} />
                <MasOpcion icon={<Shield className="w-5 h-5" />} label="Cuenta Corriente" desc="Balance y movimientos" color="bg-[#6888ff]/10 text-[#6888ff]" onClick={() => setSubVista('cuenta')} />
                <MasOpcion icon={<FileText className="w-5 h-5" />} label="Facturación" desc="Emisión y consulta de facturas" color="bg-[#6888ff]/10 text-[#6888ff]" onClick={() => setSubVista('facturacion')} />
                <MasOpcion icon={<RefreshCw className="w-5 h-5" />} label="Renovaciones" desc="Contratos por renovar" color="bg-[#6888ff]/10 text-[#6888ff]" onClick={() => setSubVista('renovaciones')} />
                <MasOpcion icon={<Activity className="w-5 h-5" />} label="Tráfico Comercial" desc="Flujo y conversión de leads" color="bg-cyan-100 text-cyan-600" onClick={() => setSubVista('traffic')} />
                <MasOpcion icon={<Briefcase className="w-5 h-5" />} label="Workspace" desc="Tareas y notas del ejecutivo" color="bg-[#dfeaff] text-[#69738c]" onClick={() => setSubVista('workspace')} />
                <MasOpcion icon={<Download className="w-5 h-5" />} label="Exportaciones" desc="Exportar reportes PDF/CSV" color="bg-[#6888ff]/10 text-[#6888ff]" onClick={() => setSubVista('exportar')} />
                <MasOpcion icon={<BarChart3 className="w-5 h-5" />} label="Reportes" desc="Builder de reportes" color="bg-[#6888ff]/10 text-[#6888ff]" onClick={() => setSubVista('reportes')} />
                <MasOpcion icon={<Brain className="w-5 h-5" />} label="Comando IA" desc="Asistente inteligente" color="bg-violet-100 text-violet-600" onClick={() => setSubVista('comando')} />
                <MasOpcion icon={<Shield className="w-5 h-5" />} label="Aprobaciones" desc="Contratos pendientes de firmar" color="bg-[#6888ff]/10 text-[#6888ff]" onClick={() => setSubVista('aprobaciones')} />
                <MasOpcion icon={<Bell className="w-5 h-5" />} label="Notificaciones" desc="Alertas y avisos inteligentes" color="bg-[#dfeaff] text-[#9aa3b8]" onClick={() => setSubVista('notificaciones')} />
                <MasOpcion icon={<TrendingUp className="w-5 h-5" />} label="Mi Rendimiento" desc="Metas, comisiones y ranking" color="bg-[#6888ff]/10 text-[#6888ff]" onClick={() => setSubVista('rendimiento')} />
                <MasOpcion icon={<ClipboardList className="w-5 h-5" />} label="Checklist del Día" desc="Tareas prioritarias de hoy" color="bg-[#6888ff]/10 text-[#6888ff]" onClick={() => setSubVista('checklist')} />
                <MasOpcion icon={<MessageSquare className="w-5 h-5" />} label="Timeline" desc="Actividad por contrato" color="bg-[#6888ff]/10 text-[#6888ff]" onClick={() => setSubVista('timeline')} />
                <MasOpcion icon={<Brain className="w-5 h-5" />} label="Predictor IA" desc="Predicción de renovaciones" color="bg-violet-100 text-violet-600" onClick={() => setSubVista('predictor')} />
                <MasOpcion icon={<Sparkles className="w-5 h-5" />} label="Propuesta Rápida" desc="Genera propuestas con IA" color="bg-fuchsia-100 text-fuchsia-600" onClick={() => setSubVista('propuestas')} />
                <MasOpcion icon={<Building2 className="w-5 h-5" />} label="Ficha Cliente" desc="Vista 360° del cliente" color="bg-[#6888ff]/10 text-[#6888ff]" onClick={() => setSubVista('fichacliente')} />
                <MasOpcion icon={<Mic className="w-5 h-5" />} label="Notas de Voz" desc="Graba y la IA transcribe" color="bg-[#dfeaff] text-[#9aa3b8]" onClick={() => setSubVista('voicenotes')} />
                <MasOpcion icon={<RefreshCw className="w-5 h-5" />} label="Seguimientos" desc="Auto-seguimiento inteligente" color="bg-cyan-100 text-cyan-600" onClick={() => setSubVista('seguimientos')} />
                <MasOpcion icon={<Settings className="w-5 h-5" />} label="Configuración" desc="Permisos, emails, webhooks" color="bg-[#dfeaff] text-[#69738c]" onClick={() => setSubVista('config')} />
              </>
            )}

            {/* SUB-VISTAS */}
            {subVista === 'cobranza' && <MobileCobranzaView />}
            {subVista === 'cuenta' && <MobileCuentaCorrienteView />}
            {subVista === 'facturacion' && <MobileFacturacionView />}
            {subVista === 'exportar' && <MobileExportView />}
            {subVista === 'reportes' && <MobileReportesView />}
            {subVista === 'comando' && <MobileComandoIAView />}
            {subVista === 'config' && <MobileConfigView />}
            {subVista === 'renovaciones' && <MobileRenovacionesView />}
            {subVista === 'traffic' && <MobileTrafficView />}
            {subVista === 'workspace' && <MobileWorkspaceView />}
            {subVista === 'aprobaciones' && <MobileAprobacionView />}
            {subVista === 'notificaciones' && <MobileNotificacionesView />}
            {subVista === 'rendimiento' && <MobileMiRendimientoView />}
            {subVista === 'checklist' && <MobileDailyChecklist />}
            {subVista === 'timeline' && <MobileTimelineView />}
            {subVista === 'predictor' && <MobilePredictorView />}
            {subVista === 'propuestas' && <MobileProposalGenerator />}
            {subVista === 'fichacliente' && <MobileClienteCard />}
            {subVista === 'voicenotes' && <MobileVoiceNotes />}
            {subVista === 'seguimientos' && <MobileAutoFollowUp />}
          </div>
        )}
      </div>

      {/* FAB GLOBAL */}
      <FloatingActionButton
        onSmartCapture={() => setTabActiva('crear')}
        onNuevoContrato={() => setTabActiva('crear')}
        onEscanear={() => setTabActiva('crear')}
        onLlamar={() => {}}
      />

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  BOTTOM NAV                                            */}
      {/* ═══════════════════════════════════════════════════════ */}
      <BottomNav activa={tabActiva} onChange={setTabActiva} alertCount={noLeidas} />

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  SMART CAPTURE OVERLAY                                 */}
      {/* ═══════════════════════════════════════════════════════ */}
      {showSmartCapture && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#dfeaff] to-[#5572ee] overflow-y-auto">
          <div className="p-4 pt-12">
            <SmartCaptureView onClose={() => setShowSmartCapture(false)} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  ACTION SHEET                                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      <MobileAccionesSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        contratoId={sheetContrato.id}
        contratoNumero={sheetContrato.numero}
        clienteNombre={sheetContrato.cliente}
        accionesDisponibles={sheetContrato.acciones}
        onSuccess={fetchDashboard}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function KPIMini({ icon, valor, label }: { icon: React.ReactNode; valor: string; label: string }) {
  return (
    <div className="bg-[#dfeaff]/10 rounded-xl p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-2xl font-black">{valor}</p>
      <p className="text-[10px] text-[#6888ff] font-bold uppercase">{label}</p>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="text-xs font-black text-[#69738c] uppercase tracking-widest flex items-center gap-2">
      {icon} {title}
    </h2>
  );
}

function AccionRapida({ icon, titulo, badge, onClick, color, highlight }: {
  icon: React.ReactNode; titulo: string; badge?: number; onClick: () => void; color: string; highlight?: boolean;
}) {
  return (
    <button onClick={onClick} className={`w-full p-4 rounded-2xl ${color} flex items-center gap-3 relative active:scale-[0.97] transition-transform ${highlight ? 'shadow-xl ring-2 ring-white/30' : ''}`}>
      <div className="p-2 rounded-xl bg-[#dfeaff]/20">{icon}</div>
      <span className="font-bold text-white flex-1 text-left">{titulo}</span>
      {badge !== undefined && badge > 0 && (
        <span className="px-2.5 py-1 rounded-full bg-[#dfeaff] text-[#69738c] text-sm font-bold">{badge}</span>
      )}
      <ChevronRight className="w-5 h-5 text-white/70" />
    </button>
  );
}

function AlertaCard({ alerta }: { alerta: AlertaContrato }) {
  const config = {
    urgente: { bg: 'bg-[#dfeaff]', border: 'border-[#bec8de]', icon: <AlertTriangle className="w-5 h-5 text-[#9aa3b8]" /> },
    aprobacion: { bg: 'bg-[#6888ff]/5', border: 'border-[#bec8de]', icon: <CheckCircle2 className="w-5 h-5 text-[#6888ff]" /> },
    vencimientos: { bg: 'bg-[#6888ff]/5', border: 'border-[#bec8de]', icon: <Clock className="w-5 h-5 text-[#6888ff]" /> },
    renovacion: { bg: 'bg-[#6888ff]/5', border: 'border-[#bec8de]', icon: <RefreshCw className="w-5 h-5 text-[#6888ff]" /> },
    pago: { bg: 'bg-[#6888ff]/5', border: 'border-[#bec8de]', icon: <Target className="w-5 h-5 text-[#6888ff]" /> },
    info: { bg: 'bg-[#dfeaff]', border: 'border-[#bec8de30]', icon: <Bell className="w-5 h-5 text-[#69738c]" /> },
  }[alerta.tipo] || { bg: 'bg-[#dfeaff]', border: 'border-[#bec8de30]', icon: <Bell className="w-5 h-5 text-[#69738c]" /> };

  return (
    <div className={`p-3 rounded-xl border ${config.bg} ${config.border} flex items-center gap-3`}>
      {config.icon}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#69738c] text-sm">{alerta.titulo}</p>
        <p className="text-xs text-[#69738c] truncate">{alerta.descripcion}</p>
      </div>
      {!alerta.leida && <div className="w-2 h-2 rounded-full bg-[#dfeaff]0 shrink-0" />}
    </div>
  );
}

function MasOpcion({ icon, label, desc, color, onClick }: {
  icon: React.ReactNode; label: string; desc: string; color: string; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full bg-[#dfeaff] rounded-xl border border-[#bec8de30] p-4 flex items-center gap-4 active:scale-[0.98] transition-transform">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
      <div className="text-left flex-1">
        <p className="font-bold text-[#69738c] text-sm">{label}</p>
        <p className="text-xs text-[#69738c]">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-[#9aa3b8]" />
    </button>
  );
}

function BottomNav({ activa, onChange, alertCount }: {
  activa: ContratoTab; onChange: (tab: ContratoTab) => void; alertCount: number;
}) {
  const tabs: { id: ContratoTab; icon: React.ReactNode; label: string; special?: boolean }[] = [
    { id: 'home', icon: <Home className="w-5 h-5" />, label: 'Inicio' },
    { id: 'contratos', icon: <FileText className="w-5 h-5" />, label: 'Contratos' },
    { id: 'crear', icon: <Sparkles className="w-5 h-5" />, label: 'Crear', special: true },
    { id: 'pipeline', icon: <BarChart3 className="w-5 h-5" />, label: 'Pipeline' },
    { id: 'analytics', icon: <Brain className="w-5 h-5" />, label: 'Analytics' },
    { id: 'mas', icon: <MoreHorizontal className="w-5 h-5" />, label: 'Más' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#dfeaff] border-t border-[#bec8de30] px-2 py-2 safe-area-bottom z-30">
      <div className="flex justify-around max-w-lg mx-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-colors relative ${
              tab.special ? 'text-white' :
              activa === tab.id ? 'text-[#6888ff] bg-[#6888ff]/10' : 'text-[#9aa3b8]'
            }`}
          >
            {tab.special ? (
              <div className="w-10 h-10 -mt-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-200">
                {tab.icon}
              </div>
            ) : tab.icon}
            <span className={`text-[9px] font-bold ${tab.special ? 'text-violet-600' : ''}`}>{tab.label}</span>
            {tab.id === 'home' && alertCount > 0 && (
              <span className="absolute -top-0.5 right-0 w-4 h-4 bg-[#dfeaff]0 rounded-full text-[8px] text-white font-bold flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
