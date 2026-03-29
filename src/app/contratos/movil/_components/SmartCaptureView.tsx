/**
 * 🧠 MOBILE: Smart Capture View
 * 
 * Hub centralizado para captura inteligente de contratos.
 * 5 métodos de ingreso: voz, texto libre, WhatsApp, email, foto.
 * El ejecutivo habla o tipea → IA genera el contrato.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState, useRef } from 'react';
import {
  Mic, MicOff, MessageSquare, Mail, Camera, Zap,
  Loader2, Sparkles, ArrowLeft, X, FileText,
  ChevronRight, AlertTriangle
} from 'lucide-react';
import { useSmartCapture } from '../../_shared/useSmartCapture';
import { MobileWizardExpress } from './MobileWizardExpress';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type InputMode = 'menu' | 'voice' | 'text' | 'whatsapp' | 'email' | 'quick' | 'review';

interface QuickFields {
  clienteNombre: string;
  producto: string;
  valorEstimado: string;
  periodoInicio: string;
  periodoFin: string;
  notas: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function SmartCaptureView({ onClose }: { onClose: () => void }) {
  const { processing, resultado, error, captureVoice, captureText, captureWhatsApp, captureQuick, captureEmail, reset } = useSmartCapture();
  const [mode, setMode] = useState<InputMode>('menu');
  const [textInput, setTextInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [quickFields, setQuickFields] = useState<QuickFields>({
    clienteNombre: '', producto: '', valorEstimado: '', periodoInicio: '', periodoFin: '', notas: '',
  });

  // Voice recording simulation
  const startRecording = () => {
    setRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(t => t + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    // Simulate transcription, in production: actual STT
    const result = await captureVoice('Cerré con Banco Chile, campaña de radio y TV para marzo y abril, 85 millones, descuento del 15 por ciento, pago a 45 días');
    if (result) setMode('review');
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    const result = await captureText(textInput);
    if (result) setMode('review');
  };

  const handleWhatsAppSubmit = async () => {
    if (!textInput.trim()) return;
    const result = await captureWhatsApp(textInput);
    if (result) setMode('review');
  };

  const handleEmailSubmit = async () => {
    if (!textInput.trim()) return;
    const result = await captureEmail('Propuesta comercial', textInput);
    if (result) setMode('review');
  };

  const handleQuickSubmit = async () => {
    if (!quickFields.clienteNombre) return;
    const result = await captureQuick({
      clienteNombre: quickFields.clienteNombre,
      producto: quickFields.producto,
      valorEstimado: quickFields.valorEstimado ? parseInt(quickFields.valorEstimado) * 1000000 : undefined,
      periodoInicio: quickFields.periodoInicio,
      periodoFin: quickFields.periodoFin,
      notas: quickFields.notas,
    });
    if (result) setMode('review');
  };

  const handleBack = () => {
    if (mode === 'review') {
      reset();
      setMode('menu');
    } else if (mode === 'menu') {
      onClose();
    } else {
      setTextInput('');
      setMode('menu');
    }
  };

  // ── REVIEW MODE → WIZARD EXPRESS ──
  if (mode === 'review' && resultado) {
    return (
      <MobileWizardExpress
        resultado={resultado}
        onBack={handleBack}
        onClose={() => {
          reset();
          onClose();
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button onClick={handleBack} aria-label="Atrás" className="p-2 rounded-xl bg-white border border-slate-200 active:scale-90">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" /> Smart Capture
          </h2>
          <p className="text-xs text-slate-400">IA genera el contrato por ti</p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-xs text-red-600 font-medium">{error}</p>
          <button onClick={reset} aria-label="Cerrar" className="ml-auto"><X className="w-4 h-4 text-red-400" /></button>
        </div>
      )}

      {/* MENU */}
      {mode === 'menu' && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">¿Cómo quieres ingresar la venta?</p>

          <CaptureOption
            icon={<Mic className="w-6 h-6" />}
            title="Nota de Voz"
            desc="Graba 30 segundos, IA crea el contrato"
            time="~30 seg"
            color="bg-gradient-to-r from-red-500 to-pink-500"
            highlight
            onClick={() => setMode('voice')}
          />
          <CaptureOption
            icon={<Zap className="w-6 h-6" />}
            title="Quick Capture"
            desc="5 campos mínimos, IA rellena el resto"
            time="~1 min"
            color="bg-gradient-to-r from-amber-500 to-orange-500"
            onClick={() => setMode('quick')}
          />
          <CaptureOption
            icon={<MessageSquare className="w-6 h-6" />}
            title="Pegar WhatsApp"
            desc="Copia el chat con el cliente"
            time="~5 seg"
            color="bg-gradient-to-r from-green-500 to-emerald-500"
            onClick={() => { setTextInput(''); setMode('whatsapp'); }}
          />
          <CaptureOption
            icon={<FileText className="w-6 h-6" />}
            title="Texto Libre"
            desc="Escribe lo que vendiste en tus palabras"
            time="~1 min"
            color="bg-gradient-to-r from-blue-500 to-indigo-500"
            onClick={() => { setTextInput(''); setMode('text'); }}
          />
          <CaptureOption
            icon={<Mail className="w-6 h-6" />}
            title="Pegar Email"
            desc="Pega el email de confirmación del cliente"
            time="~5 seg"
            color="bg-gradient-to-r from-purple-500 to-violet-500"
            onClick={() => { setTextInput(''); setMode('email'); }}
          />
          <CaptureOption
            icon={<Camera className="w-6 h-6" />}
            title="Foto de Nota"
            desc="Fotografía una propuesta o nota manuscrita"
            time="~10 seg"
            color="bg-gradient-to-r from-slate-600 to-slate-700"
            onClick={() => { /* In production: open camera */ }}
          />
        </div>
      )}

      {/* VOICE MODE */}
      {mode === 'voice' && (
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
            recording ? 'bg-red-500 scale-110 animate-pulse shadow-2xl shadow-red-200' : 'bg-indigo-600 shadow-xl shadow-indigo-200'
          }`}>
            {recording ? <MicOff className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}
          </div>

          <div className="text-center">
            {recording ? (
              <>
                <p className="text-3xl font-black text-red-600 font-mono">{String(Math.floor(recordingTime / 60)).padStart(2, '0')}:{String(recordingTime % 60).padStart(2, '0')}</p>
                <p className="text-sm text-slate-500 mt-1">Grabando... Describe la venta</p>
              </>
            ) : (
              <>
                <p className="font-bold text-slate-700">Presiona para grabar</p>
                <p className="text-xs text-slate-400 mt-1">Ejemplo: &quot;Cerré con Banco Chile, radio y TV, 85 palos, marzo a abril&quot;</p>
              </>
            )}
          </div>

          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={processing}
            className={`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-all ${
              recording ? 'bg-red-500' : processing ? 'bg-slate-400' : 'bg-indigo-600'
            }`}
          >
            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> :
             recording ? <><MicOff className="w-5 h-5" /> Detener y Procesar</> :
             <><Mic className="w-5 h-5" /> Iniciar Grabación</>}
          </button>
        </div>
      )}

      {/* TEXT / WHATSAPP / EMAIL MODE */}
      {(mode === 'text' || mode === 'whatsapp' || mode === 'email') && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
            <p className="text-xs font-bold text-indigo-700">
              {mode === 'text' && '📝 Escribe lo que vendiste en tus propias palabras'}
              {mode === 'whatsapp' && '💬 Pega la conversación de WhatsApp con el cliente'}
              {mode === 'email' && '📧 Pega el contenido del email de confirmación'}
            </p>
          </div>

          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={
              mode === 'text' ? 'Cerré con Banco Chile, radio y TV, 85 millones, marzo a abril, descuento 15%...'
              : mode === 'whatsapp' ? 'Cliente: OK, cerramos con $45M para radio, empezamos en marzo...'
              : 'Asunto: Confirmación propuesta\n\nEstimado Juan, confirmamos la pauta de $85M...'
            }
            rows={8}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
            autoFocus
          />

          <button
            onClick={mode === 'whatsapp' ? handleWhatsAppSubmit : mode === 'email' ? handleEmailSubmit : handleTextSubmit}
            disabled={processing || !textInput.trim()}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Procesar con IA</>}
          </button>
        </div>
      )}

      {/* QUICK CAPTURE MODE */}
      {mode === 'quick' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-xs font-bold text-amber-700">⚡ Solo los datos esenciales. La IA completa el resto con historial del cliente.</p>
          </div>

          <QuickInput label="Cliente *" placeholder="Banco Chile" value={quickFields.clienteNombre}
            onChange={(v) => setQuickFields(p => ({ ...p, clienteNombre: v }))} />
          <QuickInput label="Producto / Campaña" placeholder="Campaña Radio Marzo" value={quickFields.producto}
            onChange={(v) => setQuickFields(p => ({ ...p, producto: v }))} />
          <QuickInput label="Valor (millones)" placeholder="85" value={quickFields.valorEstimado} type="number"
            onChange={(v) => setQuickFields(p => ({ ...p, valorEstimado: v }))} />

          <div className="grid grid-cols-2 gap-3">
            <QuickInput label="Inicio" placeholder="" value={quickFields.periodoInicio} type="date"
              onChange={(v) => setQuickFields(p => ({ ...p, periodoInicio: v }))} />
            <QuickInput label="Fin" placeholder="" value={quickFields.periodoFin} type="date"
              onChange={(v) => setQuickFields(p => ({ ...p, periodoFin: v }))} />
          </div>

          <QuickInput label="Notas" placeholder="Descuento 15%, pago a 45 días..." value={quickFields.notas}
            onChange={(v) => setQuickFields(p => ({ ...p, notas: v }))} />

          <button
            onClick={handleQuickSubmit}
            disabled={processing || !quickFields.clienteNombre}
            className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" /> Generar Contrato</>}
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function CaptureOption({ icon, title, desc, time, color, highlight, onClick }: {
  icon: React.ReactNode; title: string; desc: string; time: string;
  color: string; highlight?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-2xl flex items-center gap-4 active:scale-[0.97] transition-transform ${
        highlight ? `${color} text-white shadow-lg` : 'bg-white border border-slate-100'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
        highlight ? 'bg-white/20' : color + ' text-white'
      }`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className={`font-bold text-sm ${highlight ? 'text-white' : 'text-slate-800'}`}>{title}</p>
        <p className={`text-xs ${highlight ? 'text-white/70' : 'text-slate-500'}`}>{desc}</p>
      </div>
      <div className="text-right">
        <span className={`text-[10px] font-bold ${highlight ? 'text-white/60' : 'text-slate-400'}`}>{time}</span>
        <ChevronRight className={`w-4 h-4 ${highlight ? 'text-white/50' : 'text-slate-300'}`} />
      </div>
    </button>
  );
}

function QuickInput({ label, placeholder, value, onChange, type = 'text' }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-amber-400 outline-none"
      />
    </div>
  );
}
