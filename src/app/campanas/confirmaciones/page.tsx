/**
 * 📄 Confirmaciones Horarias — Neumórfico TIER 0
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, Download, Mail, Eye, Send,
  Printer, RefreshCw, History, Palette, LayoutTemplate, Radio, Receipt
} from 'lucide-react';
import { NeoPageHeader, NeoCard, NeoButton, NeoInput, NeoBadge, N } from '../_lib/neumorphic';

interface Template {
  id: string; nombre: string; emisora: string; descripcion: string;
  colorPrimario: string; incluirLogo: boolean; incluirMetricas: boolean; incluirFirma: boolean;
}

interface CampanaConfirmacion {
  numero: string; nombre: string; anunciante: string; emisora: string;
  fechaInicio: string; fechaFin: string; totalSpots: number; valorNeto: number;
  ejecutivo: string; estado: 'pendiente' | 'generada' | 'enviada' | 'confirmada';
}

interface HistorialEnvio {
  id: string; fecha: string; destinatarios: string[];
  formato: 'pdf' | 'email' | 'excel'; estado: 'enviado' | 'abierto' | 'descargado' | 'error'; usuario: string;
}

const MOCK_TEMPLATES: Template[] = [
  { id: 'tpl_t13', nombre: 'T13 Radio Premium', emisora: 'T13 Radio', descripcion: 'Template oficial T13 Radio con colores corporativos', colorPrimario: '#1E40AF', incluirLogo: true, incluirMetricas: true, incluirFirma: true },
  { id: 'tpl_play', nombre: 'Play FM Moderno', emisora: 'Play FM', descripcion: 'Diseño moderno para audiencia joven', colorPrimario: '#7C3AED', incluirLogo: true, incluirMetricas: false, incluirFirma: true },
  { id: 'tpl_simple', nombre: 'Corporativo Simple', emisora: 'Todas', descripcion: 'Template minimalista para cualquier emisora', colorPrimario: '#374151', incluirLogo: false, incluirMetricas: true, incluirFirma: false },
];

const MOCK_CAMPANAS: CampanaConfirmacion[] = [
  { numero: 'CAM-2025-0015', nombre: 'Campaña Verano Premium', anunciante: 'BANCO DE CHILE', emisora: 'T13 Radio', fechaInicio: '2025-02-01', fechaFin: '2025-02-28', totalSpots: 156, valorNeto: 12500000, ejecutivo: 'Ana García', estado: 'pendiente' },
  { numero: 'CAM-2025-0012', nombre: 'Lanzamiento App Q1', anunciante: 'ENTEL', emisora: 'Play FM', fechaInicio: '2025-02-15', fechaFin: '2025-03-15', totalSpots: 240, valorNeto: 18000000, ejecutivo: 'Carlos Mendoza', estado: 'generada' },
];

const MOCK_HISTORIAL: HistorialEnvio[] = [
  { id: 'env_001', fecha: '2025-02-08 10:30', destinatarios: ['cliente@bancochile.cl', 'medios@carat.cl'], formato: 'pdf', estado: 'abierto', usuario: 'Ana García' },
  { id: 'env_002', fecha: '2025-02-07 15:45', destinatarios: ['marketing@entel.cl'], formato: 'email', estado: 'enviado', usuario: 'Carlos Mendoza' },
];

export default function ConfirmacionesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'generar' | 'templates' | 'historial'>('generar');
  const [selectedCampana, setSelectedCampana] = useState(MOCK_CAMPANAS[0].numero);
  const [selectedTemplate, setSelectedTemplate] = useState(MOCK_TEMPLATES[0].id);
  const [destinatarios, setDestinatarios] = useState('');
  const [formato, setFormato] = useState<'pdf' | 'email' | 'excel'>('pdf');
  const [notasAdicionales, setNotasAdicionales] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [incluirDesglose, setIncluirDesglose] = useState(true);
  const [incluirValores, setIncluirValores] = useState(true);
  const [incluirContacto, setIncluirContacto] = useState(true);

  const campanaActual = MOCK_CAMPANAS.find(c => c.numero === selectedCampana);
  const templateActual = MOCK_TEMPLATES.find(t => t.id === selectedTemplate);

  const handleGenerarPreview = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsGenerating(false);
    setPreviewReady(true);
  };

  const handleEnviar = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsGenerating(false);
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = { enviado: '#3b82f6', abierto: '#22c55e', descargado: '#a855f7', error: '#ef4444' };
    return colors[estado] || '#9aa3b8';
  };

  const tabs = [
    { id: 'generar' as const, label: 'Generar', icon: FileText },
    { id: 'templates' as const, label: 'Templates', icon: LayoutTemplate },
    { id: 'historial' as const, label: 'Historial', icon: History },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: N.base }}>
      <div className="max-w-[1400px] mx-auto space-y-5">
        <NeoPageHeader
          title="Confirmaciones Horarias"
          subtitle="Generador profesional de confirmaciones con envío automático"
          icon={Receipt}
          backHref="/campanas"
        />

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={activeTab === t.id
                ? { background: N.accent, color: '#fff', boxShadow: `3px 3px 6px ${N.dark}` }
                : { background: 'transparent', color: N.textSub }}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* TAB: Generar */}
        {activeTab === 'generar' && (
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <NeoCard>
                <h3 className="text-sm font-black flex items-center gap-2 mb-4" style={{ color: N.text }}>
                  <FileText className="h-4 w-4" style={{ color: N.accent }} />
                  Configuración de Documento
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: N.textSub }}>Campaña</label>
                      <select value={selectedCampana} onChange={e => setSelectedCampana(e.target.value)}
                        className="w-full rounded-xl px-4 py-2.5 text-sm font-medium border-none focus:outline-none"
                        style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`, color: N.text }}>
                        {MOCK_CAMPANAS.map(c => <option key={c.numero} value={c.numero}>{c.numero} - {c.anunciante}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: N.textSub }}>Template</label>
                      <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}
                        className="w-full rounded-xl px-4 py-2.5 text-sm font-medium border-none focus:outline-none"
                        style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`, color: N.text }}>
                        {MOCK_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: N.textSub }}>Destinatarios</label>
                    <NeoInput value={destinatarios} onChange={e => setDestinatarios(e.target.value)} placeholder="email1@empresa.cl, email2@agencia.cl" />
                    <p className="text-[10px] mt-1" style={{ color: N.textSub }}>Separar múltiples emails con coma</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: N.textSub }}>Formato de Salida</label>
                      <select value={formato} onChange={e => setFormato(e.target.value as any)}
                        className="w-full rounded-xl px-4 py-2.5 text-sm font-medium border-none focus:outline-none"
                        style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`, color: N.text }}>
                        <option value="pdf">📄 PDF Descargable</option>
                        <option value="email">📧 Email Directo</option>
                        <option value="excel">📊 Excel Detallado</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: N.textSub }}>Opciones de Contenido</label>
                      <div className="space-y-2">
                        {[
                          { label: 'Incluir desglose horario', checked: incluirDesglose, onChange: setIncluirDesglose },
                          { label: 'Mostrar valores', checked: incluirValores, onChange: setIncluirValores },
                          { label: 'Datos de contacto', checked: incluirContacto, onChange: setIncluirContacto },
                        ].map(opt => (
                          <div key={opt.label} className="flex items-center justify-between">
                            <span className="text-xs" style={{ color: N.text }}>{opt.label}</span>
                            <button onClick={() => opt.onChange(!opt.checked)}
                              className="w-8 h-4 rounded-full transition-all relative"
                              style={{ background: opt.checked ? N.accent : N.base, boxShadow: opt.checked ? 'none' : `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}` }}>
                              <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                                style={{ left: opt.checked ? '18px' : '2px' }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: N.textSub }}>Notas Adicionales</label>
                    <textarea value={notasAdicionales} onChange={e => setNotasAdicionales(e.target.value)} placeholder="Observaciones o instrucciones especiales..."
                      rows={3} className="w-full rounded-xl px-4 py-3 text-sm border-none focus:outline-none resize-vertical"
                      style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`, color: N.text }} />
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t flex-wrap" style={{ borderColor: `${N.dark}40` }}>
                    <NeoButton variant="primary" onClick={handleGenerarPreview} disabled={isGenerating}>
                      {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                      Generar Preview
                    </NeoButton>
                    <NeoButton variant="secondary"><Download className="w-4 h-4" /> Descargar</NeoButton>
                    <NeoButton variant="secondary"><Printer className="w-4 h-4" /> Imprimir</NeoButton>
                    <div className="flex-1" />
                    <NeoButton variant="primary" onClick={handleEnviar} disabled={!previewReady || isGenerating}>
                      <Send className="w-4 h-4" /> Enviar por Email
                    </NeoButton>
                  </div>
                </div>
              </NeoCard>
            </div>

            {/* Preview */}
            <div>
              {campanaActual && (
                <NeoCard className="border-t-4" style={{ borderTopColor: templateActual?.colorPrimario || N.accent }}>
                  <h3 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: N.accent }}>
                    <Eye className="h-4 w-4" /> Vista Previa
                  </h3>
                  <div className="rounded-xl p-4" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }}>
                    <div className="text-center mb-4">
                      <Radio className="w-8 h-8 mx-auto mb-2" style={{ color: N.textSub }} />
                      <h4 className="font-bold text-lg" style={{ color: N.text }}>{campanaActual.emisora}</h4>
                      <p className="text-[10px]" style={{ color: N.textSub }}>Confirmación Horaria</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      {[
                        { label: 'Campaña:', value: campanaActual.numero },
                        { label: 'Cliente:', value: campanaActual.anunciante },
                        { label: 'Período:', value: `${campanaActual.fechaInicio} al ${campanaActual.fechaFin}` },
                        { label: 'Total Spots:', value: campanaActual.totalSpots.toString(), bold: true, color: N.accent },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between py-1 border-b" style={{ borderColor: `${N.dark}30` }}>
                          <span style={{ color: N.textSub }}>{row.label}</span>
                          <span className={`font-medium ${row.bold ? 'font-black' : ''}`} style={{ color: row.color || N.text }}>{row.value}</span>
                        </div>
                      ))}
                      {incluirValores && (
                        <div className="flex justify-between pt-1">
                          <span style={{ color: N.textSub }}>Valor Neto:</span>
                          <span className="font-black" style={{ color: '#22c55e' }}>${campanaActual.valorNeto.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t text-center" style={{ borderColor: `${N.dark}30` }}>
                      <p className="text-[10px]" style={{ color: N.textSub }}>Documento generado automáticamente</p>
                    </div>
                  </div>
                </NeoCard>
              )}
            </div>
          </div>
        )}

        {/* TAB: Templates */}
        {activeTab === 'templates' && (
          <NeoCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black flex items-center gap-2" style={{ color: N.text }}>
                <Palette className="h-4 w-4" style={{ color: '#a855f7' }} />
                Templates Disponibles
              </h3>
              <NeoButton variant="primary" size="sm"><LayoutTemplate className="h-3.5 w-3.5" /> Crear Template</NeoButton>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {MOCK_TEMPLATES.map(t => (
                <div key={t.id} className="p-4 rounded-2xl cursor-pointer transition-all"
                  style={{ background: N.base, boxShadow: `6px 6px 12px ${N.dark},-6px -6px 12px ${N.light}` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `6px 6px 12px ${N.dark},-6px -6px 12px ${N.light}` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${t.colorPrimario}20` }}>
                      <Radio className="w-5 h-5" style={{ color: t.colorPrimario }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm" style={{ color: N.text }}>{t.nombre}</h4>
                      <p className="text-[10px]" style={{ color: N.textSub }}>{t.emisora}</p>
                    </div>
                  </div>
                  <p className="text-xs mb-3" style={{ color: N.textSub }}>{t.descripcion}</p>
                  <div className="flex flex-wrap gap-1">
                    {t.incluirLogo && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${N.accent}15`, color: N.accent }}>Logo</span>}
                    {t.incluirMetricas && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${N.accent}15`, color: N.accent }}>Métricas</span>}
                    {t.incluirFirma && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${N.accent}15`, color: N.accent }}>Firma</span>}
                  </div>
                </div>
              ))}
            </div>
          </NeoCard>
        )}

        {/* TAB: Historial */}
        {activeTab === 'historial' && (
          <NeoCard padding="none">
            <div className="px-5 py-3 border-b" style={{ borderColor: `${N.dark}40` }}>
              <h3 className="text-sm font-black flex items-center gap-2" style={{ color: N.text }}>
                <History className="h-4 w-4" style={{ color: N.accent }} />
                Historial de Envíos
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `2px solid ${N.dark}40` }}>
                    <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Fecha</th>
                    <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Destinatarios</th>
                    <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Formato</th>
                    <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Estado</th>
                    <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Usuario</th>
                    <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}></th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_HISTORIAL.map(env => (
                    <tr key={env.id} style={{ borderBottom: `1px solid ${N.dark}30` }}>
                      <td className="px-3 py-3 font-medium" style={{ color: N.text }}>{env.fecha}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {env.destinatarios.map(d => (
                            <span key={d} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${N.accent}10`, color: N.accent }}>{d}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full" style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}`, color: N.textSub }}>{env.formato}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: getEstadoColor(env.estado) }}>{env.estado}</span>
                      </td>
                      <td className="px-3 py-3" style={{ color: N.textSub }}>{env.usuario}</td>
                      <td className="px-3 py-3">
                        <NeoButton variant="ghost" size="icon"><RefreshCw className="w-3.5 h-3.5" /></NeoButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </NeoCard>
        )}
      </div>
    </div>
  );
}
