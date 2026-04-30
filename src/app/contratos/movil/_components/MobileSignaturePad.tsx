/**
 * ?? MOBILE: Captura de Firma T�ctil
 * 
 * Pad de firma digital que permite al ejecutivo o cliente
 * firmar directamente en el dispositivo m�vil.
 * Soporta: dibujo t�ctil, limpiar, confirmar.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  PenTool, RotateCcw, Check, X,
  Download, User, Shield,
} from 'lucide-react';

// ---------------------------------------------------------------
// TIPOS
// ---------------------------------------------------------------

interface MobileSignaturePadProps {
  firmante: string;
  rol: 'ejecutivo' | 'cliente' | 'aprobador';
  onFirmar: (firmaBase64: string) => void;
  onCancelar: () => void;
}

// ---------------------------------------------------------------
// COMPONENTE
// ---------------------------------------------------------------

export function MobileSignaturePad({ firmante, rol, onFirmar, onCancelar }: MobileSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = 200;
    }

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDraw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasSignature(true);
  }, []);

  const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing]);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const limpiar = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }, []);

  const confirmar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base64 = canvas.toDataURL('image/png');
    setConfirmed(true);
    setTimeout(() => onFirmar(base64), 800);
  }, [onFirmar]);

  const rolConfig = {
    ejecutivo: { color: 'bg-[#6888ff]', icon: <PenTool className="w-5 h-5 text-white" />, label: 'Ejecutivo Comercial' },
    cliente: { color: 'from-[#6888ff] to-[#5572ee]', icon: <User className="w-5 h-5 text-white" />, label: 'Cliente' },
    aprobador: { color: 'from-[#6888ff] to-violet-600', icon: <Shield className="w-5 h-5 text-white" />, label: 'Aprobador' },
  }[rol];

  // Pantalla de confirmaci�n
  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6888ff] to-[#5572ee] flex items-center justify-center shadow-xl animate-bounce">
          <Check className="w-8 h-8 text-white" />
        </div>
        <p className="text-lg font-black text-[#69738c]">Firma Registrada</p>
        <p className="text-sm text-[#9aa3b8]">{firmante} � {rolConfig.label}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rolConfig.color} flex items-center justify-center shadow-lg`}>
          {rolConfig.icon}
        </div>
        <div>
          <p className="text-sm font-bold text-[#69738c]">Firma Digital</p>
          <p className="text-[10px] text-[#9aa3b8]">{firmante} � {rolConfig.label}</p>
        </div>
      </div>

      {/* CANVAS */}
      <div className="relative">
        <div className="bg-[#dfeaff] rounded-2xl border-2 border-dashed border-[#bec8de30] overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full touch-none cursor-crosshair"
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
          />
          {/* L�nea gu�a */}
          <div className="absolute bottom-12 left-8 right-8 border-b border-[#bec8de30]" />
          <div className="absolute bottom-8 left-8">
            <p className="text-[9px] text-[#9aa3b8] uppercase tracking-widest">Firma aqu�</p>
          </div>
        </div>

        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <PenTool className="w-8 h-8 text-[#9aa3b8] mx-auto" />
              <p className="text-xs text-[#9aa3b8] mt-2 font-bold">Dibuja tu firma con el dedo</p>
            </div>
          </div>
        )}
      </div>

      {/* INFO LEGAL */}
      <div className="p-3 rounded-xl bg-[#6888ff]/5 border border-[#bec8de30]">
        <p className="text-[10px] text-[#6888ff] font-medium">
          Al firmar, acepta los t�rminos y condiciones del contrato. Esta firma tiene validez legal equivalente a una firma manuscrita seg�n la Ley 19.799.
        </p>
      </div>

      {/* ACCIONES */}
      <div className="flex gap-3">
        <button onClick={onCancelar}
          className="flex-1 py-3 border border-[#bec8de30] text-[#69738c] rounded-2xl font-bold text-sm flex items-center justify-center gap-1 active:scale-[0.97]">
          <X className="w-4 h-4" /> Cancelar
        </button>
        <button onClick={limpiar} disabled={!hasSignature}
          className="py-3 px-4 border border-[#bec8de30] text-[#69738c] rounded-2xl font-bold text-sm flex items-center justify-center gap-1 active:scale-[0.97] disabled:opacity-40">
          <RotateCcw className="w-4 h-4" /> Limpiar
        </button>
        <button onClick={confirmar} disabled={!hasSignature}
          className="flex-[2] py-3 bg-[#6888ff] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-50 shadow-lg shadow-emerald-200">
          <Check className="w-4 h-4" /> Firmar
        </button>
      </div>

      {/* DESCARGAR */}
      {hasSignature && (
        <button className="w-full py-2 text-xs text-[#9aa3b8] font-bold flex items-center justify-center gap-1">
          <Download className="w-3 h-3" /> Descargar como imagen
        </button>
      )}
    </div>
  );
}
