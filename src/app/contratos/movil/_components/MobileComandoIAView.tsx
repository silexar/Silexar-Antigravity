/**
 * 🤖 MOBILE: Comando IA View
 * 
 * Chat con asistente de contratos inteligente.
 * Paridad con desktop: contratos/comando/page.tsx
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Brain, Send, Loader2,
} from 'lucide-react';

interface MensajeChat {
  id: string;
  rol: 'user' | 'assistant';
  contenido: string;
  timestamp: Date;
  tipo?: 'texto' | 'sugerencia' | 'alerta';
}

const SUGERENCIAS = [
  '¿Cuántos contratos vencen este mes?',
  'Resume el estado del pipeline',
  '¿Qué clientes tienen pagos pendientes?',
  'Analiza tendencia de cierre Q1',
  'Top 5 contratos por valor',
];

const RESPUESTAS_MOCK: Record<string, string> = {
  'vencen': '📊 Este mes vencen **12 contratos** por un valor total de **$185M**. Los más urgentes:\n\n1. **Falabella** — CTR-0045 — $45M (vence en 3 días)\n2. **Banco Chile** — CTR-0067 — $32M (vence en 5 días)\n3. **TechCorp** — CTR-0089 — $28M (vence en 7 días)\n\n⚠️ Recomiendo contactar a Falabella hoy para renovación.',
  'pipeline': '📈 **Pipeline actual:**\n\n• Prospección: 23 contratos ($450M)\n• Negociación: 15 contratos ($320M)\n• Cierre: 8 contratos ($180M)\n• Firmado: 45 contratos ($890M)\n\n✅ Tasa de conversión: 68% (arriba del benchmark 62%)',
  'pendientes': '💰 **3 clientes con pagos pendientes:**\n\n1. Ripley — $15.8M (17 días vencido)\n2. Falabella — $12.5M (12 días vencido)\n3. Banco Chile — $8.7M (en gestión)\n\nTotal pendiente: **$37M**',
  'default': '🤖 Entendido. Analizando los datos del módulo de contratos...\n\nBasado en la información disponible, puedo observar que el módulo cuenta con **156 contratos activos** por un valor total de **$2.4B**. La tasa de renovación es del 78%, superior al promedio del mercado.\n\n¿Te gustaría que profundice en algún aspecto específico?',
};

export function MobileComandoIAView() {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([
    { id: 'welcome', rol: 'assistant', contenido: '👋 ¡Hola! Soy tu asistente de contratos. Puedo analizar datos, generar reportes, y responder preguntas sobre el estado de tus contratos.\n\n¿En qué puedo ayudarte?', timestamp: new Date(), tipo: 'texto' },
  ]);
  const [input, setInput] = useState('');
  const [pensando, setPensando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes]);

  const enviar = (texto: string) => {
    if (!texto.trim() || pensando) return;
    const userMsg: MensajeChat = { id: `msg-${Date.now()}`, rol: 'user', contenido: texto, timestamp: new Date() };
    setMensajes(prev => [...prev, userMsg]);
    setInput('');
    setPensando(true);

    setTimeout(() => {
      const key = Object.keys(RESPUESTAS_MOCK).find(k => texto.toLowerCase().includes(k)) || 'default';
      const respuesta: MensajeChat = {
        id: `resp-${Date.now()}`, rol: 'assistant',
        contenido: RESPUESTAS_MOCK[key],
        timestamp: new Date(), tipo: 'texto'
      };
      setMensajes(prev => [...prev, respuesta]);
      setPensando(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-700 rounded-2xl p-4 text-white shadow-xl mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-sm">Comando IA</p>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-purple-200">Online · Analizando 156 contratos</span>
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4">
        {mensajes.map(msg => (
          <div key={msg.id} className={`flex ${msg.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line ${
              msg.rol === 'user'
                ? 'bg-indigo-600 text-white rounded-br-md'
                : 'bg-white border border-slate-100 text-slate-700 rounded-bl-md'
            }`}>
              {msg.contenido}
            </div>
          </div>
        ))}
        {pensando && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
              <span className="text-xs text-slate-400">Analizando...</span>
            </div>
          </div>
        )}
      </div>

      {/* SUGGESTIONS */}
      {mensajes.length <= 1 && (
        <div className="flex flex-wrap gap-2 pb-3">
          {SUGERENCIAS.map((s) => (
            <button key={s} onClick={() => enviar(s)}
              className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-[11px] font-bold border border-purple-200 active:scale-95">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* INPUT */}
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar(input)}
          placeholder="Pregunta algo..."
          aria-label="Pregunta algo"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-purple-400 outline-none" />
        <button onClick={() => enviar(input)} disabled={!input.trim() || pensando}
          className="px-4 py-3 bg-purple-600 text-white rounded-xl active:scale-90 disabled:opacity-50">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
