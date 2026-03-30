/**
 * ✉️ MOBILE: Smart Messaging
 * 
 * Templates IA con compartir WhatsApp/Email 1-toque.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Mail, MessageSquare, Sparkles, Send,
  Copy, CheckCircle2, Star, Loader2,
} from 'lucide-react';

interface Tmpl { id: string; categoria: string; titulo: string; canal: string; tasaRespuesta: number; cuerpo: string; }

export function MobileSmartMessaging() {
  const [tpls, setTpls] = useState<Tmpl[]>([]);
  const [gen, setGen] = useState<{ asunto: string; cuerpo: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selId, setSelId] = useState('');

  useEffect(() => {
    fetch('/api/equipos-ventas/deals?tipo=templates')
      .then(r => r.json())
      .then(d => { if (d.success) setTpls(d.data); })
      .catch(() => {});
  }, []);

  const generate = async (t: Tmpl) => {
    setSelId(t.id); setLoading(true); setGen(null);
    try {
      const res = await fetch('/api/equipos-ventas/deals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'generar-mensaje', cliente: 'Cliente' }) });
      const d = await res.json();
      if (d.success) setGen(d.data);
    } catch { /* */ }
    setLoading(false);
  };

  const copy = (txt: string) => { navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-lg text-slate-800">Smart Messaging</h3>
      </div>

      {/* TEMPLATES */}
      <div className="space-y-2">
        {tpls.map(t => (
          <button key={t.id} onClick={() => generate(t)}
            className={`w-full text-left p-3 neo-mobile-card rounded-xl ${selId === t.id ? 'border-2 border-purple-400' : ''}`}>
            <div className="flex items-center gap-2">
              {t.canal === 'email' ? <Mail className="w-4 h-4 text-purple-500" /> : <MessageSquare className="w-4 h-4 text-emerald-500" />}
              <p className="text-xs font-bold text-slate-800 flex-1">{t.titulo}</p>
              <span className="text-[9px] text-amber-500 flex items-center gap-0.5"><Star className="w-2.5 h-2.5" />{t.tasaRespuesta}%</span>
            </div>
          </button>
        ))}
      </div>

      {/* GENERATED */}
      {loading && (
        <div className="text-center py-8"><Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" /><p className="mt-2 text-[10px] text-slate-400">IA generando...</p></div>
      )}

      {gen && !loading && (
        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
          <p className="text-[9px] font-bold text-purple-700 flex items-center gap-0.5 mb-1"><Sparkles className="w-2.5 h-2.5" /> Generado por IA</p>
          {gen.asunto && <p className="text-xs font-bold text-slate-800 mb-1">{gen.asunto}</p>}
          <p className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">{gen.cuerpo}</p>
          <div className="flex gap-2 mt-3">
            <button className="flex-[2] py-2 bg-purple-600 text-white rounded-lg text-[10px] font-bold active:scale-95 flex items-center justify-center gap-1"><Send className="w-3 h-3" />Enviar</button>
            <button onClick={() => copy(gen.cuerpo)} className="flex-1 py-2 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 active:scale-95 flex items-center justify-center gap-1">
              {copied ? <><CheckCircle2 className="w-3 h-3 text-emerald-500" />OK</> : <><Copy className="w-3 h-3" />Copiar</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
