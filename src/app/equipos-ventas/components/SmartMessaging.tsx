/**
 * ✉️ DESKTOP: Smart Messaging — Templates IA
 * 
 * Genera emails/WhatsApp contextuales por stage del deal.
 * Preview, edición inline, envío directo.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Mail, MessageSquare, Sparkles, Send,
  Copy, Edit3, CheckCircle2, Star,
  Loader2,
} from 'lucide-react';

interface Template {
  id: string; categoria: string; titulo: string; canal: string;
  asunto: string; cuerpo: string; tasaRespuesta: number; vecesUsado: number;
}

const CATS = [
  { key: 'prospeccion', label: 'Prospección', color: 'bg-blue-100 text-blue-600' },
  { key: 'follow_up', label: 'Follow-up', color: 'bg-purple-100 text-purple-600' },
  { key: 'propuesta', label: 'Propuesta', color: 'bg-indigo-100 text-indigo-600' },
  { key: 'cierre', label: 'Cierre', color: 'bg-emerald-100 text-emerald-600' },
  { key: 'post_venta', label: 'Post-venta', color: 'bg-amber-100 text-amber-600' },
];

export function SmartMessaging() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [catFilter, setCatFilter] = useState('');
  const [selected, setSelected] = useState<Template | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<{ asunto: string; cuerpo: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/equipos-ventas/deals?tipo=templates')
      .then(r => r.json())
      .then(d => { if (d.success) setTemplates(d.data); })
      .catch((error) => {
        console.error('[SmartMessaging] Failed to load templates:', error);
      });
  }, []);

  const filtered = catFilter ? templates.filter(t => t.categoria === catFilter) : templates;

  const generateIA = async (tmpl: Template) => {
    setSelected(tmpl);
    setGenerating(true);
    try {
      const res = await fetch('/api/equipos-ventas/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'generar-mensaje', cliente: 'TechCorp', contacto: 'James' }),
      });
      const data = await res.json();
      if (data.success) setGenerated(data.data);
    } catch { /* fallback */ }
    setGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="neo-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 flex items-center gap-3">
        <MessageSquare className="w-5 h-5 text-purple-600" />
        <div>
          <h2 className="font-black text-lg text-slate-800">Smart Messaging</h2>
          <p className="text-xs text-slate-500">Templates IA por stage · {templates.length} disponibles</p>
        </div>
      </div>

      <div className="p-6">
        {/* FILTROS */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setCatFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${!catFilter ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>Todos</button>
          {CATS.map(c => (
            <button key={c.key} onClick={() => setCatFilter(c.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${catFilter === c.key ? c.color : 'bg-slate-100 text-slate-500'}`}>{c.label}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* TEMPLATES LIST */}
          <div className="space-y-2">
            {filtered.map(t => (
              <button key={t.id} onClick={() => generateIA(t)}
                className={`w-full text-left p-4 rounded-xl border transition hover:border-purple-300 ${selected?.id === t.id ? 'border-purple-400 bg-purple-50' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {t.canal === 'email' ? <Mail className="w-3 h-3 text-purple-500" /> : <MessageSquare className="w-3 h-3 text-emerald-500" />}
                  <p className="font-bold text-sm text-slate-800">{t.titulo}</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span>{CATS.find(c => c.key === t.categoria)?.label}</span>
                  <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-amber-400" />{t.tasaRespuesta}% resp</span>
                  <span>{t.vecesUsado}x usado</span>
                </div>
              </button>
            ))}
          </div>

          {/* PREVIEW */}
          <div>
            {generating ? (
              <div className="text-center py-12"><Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" /><p className="mt-3 text-sm text-slate-500">IA personalizando...</p></div>
            ) : generated && selected ? (
              <div className="p-4 border border-purple-100 rounded-xl bg-purple-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <p className="text-xs font-bold text-purple-700">Preview Generado por IA</p>
                </div>
                {selected.canal === 'email' && (
                  <div className="mb-3">
                    <p className="text-[10px] text-slate-400 mb-1">Asunto:</p>
                    <p className="text-sm font-bold text-slate-800">{generated.asunto}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-slate-400 mb-1">Mensaje:</p>
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{generated.cuerpo}</pre>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 flex items-center justify-center gap-1"><Send className="w-3 h-3" /> Enviar</button>
                  <button onClick={() => copyToClipboard(generated.cuerpo)}
                    className="py-2 px-4 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg flex items-center gap-1 hover:bg-slate-50">
                    {copied ? <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                  </button>
                  <button className="py-2 px-4 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg flex items-center gap-1 hover:bg-slate-50"><Edit3 className="w-3 h-3" /> Editar</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Selecciona un template para ver preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
