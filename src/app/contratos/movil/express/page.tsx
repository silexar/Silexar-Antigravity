/**
 * ⚡ SILEXAR PULSE - Express Contract Creation (Mobile) TIER 0
 * 
 * @description Wizard optimizado para creación rápida desde móvil
 * con reconocimiento de voz, cámara y geolocalización.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mic,
  Camera,
  MapPin,
  Wifi,
  WifiOff,
  Sparkles,
  CheckCircle2,
  Building2,
  Package,
  DollarSign,
  Send,
  Save,
  Clock,
  Phone,
  Mail
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface TemplateExpress {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  tiempoEstimado: string;
}

interface DatosExpress {
  templateId?: string;
  clienteNombre?: string;
  clienteTelefono?: string;
  clienteEmail?: string;
  producto?: string;
  fechaInicio?: string;
  fechaFin?: string;
  valorEstimado?: number;
  notas?: string;
  ubicacion?: { lat: number; lng: number; direccion: string };
  imagenes?: string[];
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const templatesExpress: TemplateExpress[] = [
  { id: 't-1', nombre: 'Campaña Radio', descripcion: 'Pauta radial estándar', icono: '📻', tiempoEstimado: '2 min' },
  { id: 't-2', nombre: 'Campaña TV', descripcion: 'Spots televisivos', icono: '📺', tiempoEstimado: '3 min' },
  { id: 't-3', nombre: 'Digital 360', descripcion: 'Redes + Display + Video', icono: '🌐', tiempoEstimado: '2 min' },
  { id: 't-4', nombre: 'Vía Pública', descripcion: 'Pantallas y vallas', icono: '🏙️', tiempoEstimado: '3 min' },
  { id: 't-5', nombre: 'Contrato Libre', descripcion: 'Configuración manual', icono: '📝', tiempoEstimado: '5 min' }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════

const TemplateCard: React.FC<{
  template: TemplateExpress;
  seleccionado: boolean;
  onClick: () => void;
}> = ({ template, seleccionado, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${
      seleccionado
        ? 'border-[#bec8de] bg-[#6888ff]/10 shadow-lg'
        : 'border-[#bec8de30] bg-[#dfeaff]'
    }`}
  >
    <span className="text-3xl">{template.icono}</span>
    <div className="flex-1">
      <p className="font-bold text-[#69738c]">{template.nombre}</p>
      <p className="text-sm text-[#69738c]">{template.descripcion}</p>
    </div>
    <div className="text-right">
      <Clock className="w-4 h-4 text-[#9aa3b8] mx-auto mb-1" />
      <span className="text-xs text-[#69738c]">{template.tiempoEstimado}</span>
    </div>
  </motion.button>
);

const InputMobile: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  icon?: React.ReactNode;
  onVoice?: () => void;
}> = ({ label, placeholder, value, onChange, type = 'text', icon, onVoice }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-[#69738c]">{label}</label>
    <div className="relative flex gap-2">
      {icon && (
        <div className="p-3 rounded-xl bg-[#dfeaff] flex items-center justify-center">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="flex-1 px-4 py-3 rounded-xl border border-[#bec8de30] bg-[#dfeaff] text-lg"
      />
      {onVoice && (
        <button onClick={onVoice} aria-label="Entrada por voz" className="p-3 rounded-xl bg-[#6888ff]/10 text-[#6888ff]">
          <Mic className="w-5 h-5" />
        </button>
      )}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ExpressContractPage() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState<DatosExpress>({});
  const [grabando, setGrabando] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_ubicacionCargando, setUbicacionCargando] = useState(false);
  const [online] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Detectar ubicación
  useEffect(() => {
    if (navigator.geolocation) {
      setUbicacionCargando(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDatos(prev => ({
            ...prev,
            ubicacion: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              direccion: 'Detectando dirección...'
            }
          }));
          setUbicacionCargando(false);
        },
        () => setUbicacionCargando(false)
      );
    }
  }, []);

  const handleVoice = () => {
    setGrabando(!grabando);
    if (!grabando) {
      // Simular reconocimiento de voz
      setTimeout(() => {
        setGrabando(false);
      }, 3000);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleGuardar = async (_enviar: boolean) => {
    setGuardando(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setGuardando(false);
    router.push('/contratos/movil?created=express');
  };

  const pasoActual = () => {
    switch (paso) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#69738c] mb-4">Selecciona un Template</h2>
            <div className="space-y-3">
              {templatesExpress.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  seleccionado={datos.templateId === template.id}
                  onClick={() => {
                    setDatos(prev => ({ ...prev, templateId: template.id }));
                    setPaso(2);
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#69738c]">Datos del Cliente</h2>
            
            <InputMobile
              label="Nombre del Cliente"
              placeholder="Nombre o empresa"
              value={datos.clienteNombre || ''}
              onChange={(v) => setDatos(prev => ({ ...prev, clienteNombre: v }))}
              icon={<Building2 className="w-5 h-5 text-[#69738c]" />}
              onVoice={handleVoice}
            />

            <InputMobile
              label="Teléfono"
              placeholder="+56 9 1234 5678"
              value={datos.clienteTelefono || ''}
              onChange={(v) => setDatos(prev => ({ ...prev, clienteTelefono: v }))}
              type="tel"
              icon={<Phone className="w-5 h-5 text-[#69738c]" />}
            />

            <InputMobile
              label="Email"
              placeholder="email@empresa.cl"
              value={datos.clienteEmail || ''}
              onChange={(v) => setDatos(prev => ({ ...prev, clienteEmail: v }))}
              type="email"
              icon={<Mail className="w-5 h-5 text-[#69738c]" />}
            />

            {datos.ubicacion && (
              <div className="p-4 rounded-xl bg-[#6888ff]/5 border border-[#bec8de] flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#6888ff]" />
                <div className="flex-1">
                  <p className="font-medium text-[#6888ff]">Ubicación detectada</p>
                  <p className="text-sm text-[#6888ff]">{datos.ubicacion.direccion}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#6888ff]" />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setPaso(1)}
                className="flex-1 py-4 rounded-xl border border-[#bec8de30] text-[#69738c] font-medium"
              >
                Atrás
              </button>
              <button
                onClick={() => setPaso(3)}
                disabled={!datos.clienteNombre}
                className="flex-1 py-4 rounded-xl bg-[#6888ff] text-white font-medium disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#69738c]">Detalles del Contrato</h2>

            <InputMobile
              label="Producto / Campaña"
              placeholder="Describe la campaña"
              value={datos.producto || ''}
              onChange={(v) => setDatos(prev => ({ ...prev, producto: v }))}
              icon={<Package className="w-5 h-5 text-[#69738c]" />}
              onVoice={handleVoice}
            />

            <div className="grid grid-cols-2 gap-3">
              <InputMobile
                label="Fecha Inicio"
                placeholder=""
                value={datos.fechaInicio || ''}
                onChange={(v) => setDatos(prev => ({ ...prev, fechaInicio: v }))}
                type="date"
              />
              <InputMobile
                label="Fecha Fin"
                placeholder=""
                value={datos.fechaFin || ''}
                onChange={(v) => setDatos(prev => ({ ...prev, fechaFin: v }))}
                type="date"
              />
            </div>

            <InputMobile
              label="Valor Estimado"
              placeholder="$0"
              value={datos.valorEstimado?.toString() || ''}
              onChange={(v) => setDatos(prev => ({ ...prev, valorEstimado: parseInt(v) || 0 }))}
              type="number"
              icon={<DollarSign className="w-5 h-5 text-[#69738c]" />}
            />

            {/* Botón Cámara */}
            <button className="w-full p-4 rounded-xl border-2 border-dashed border-[#bec8de] flex items-center justify-center gap-3 text-[#69738c] hover:border-[#bec8de] hover:text-[#6888ff] transition-colors">
              <Camera className="w-6 h-6" />
              <span className="font-medium">Fotografiar briefing u orden</span>
            </button>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#69738c]">Notas adicionales</label>
              <textarea
                value={datos.notas || ''}
                onChange={(e) => setDatos(prev => ({ ...prev, notas: e.target.value }))}
                placeholder="Notas del cliente, requerimientos especiales..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#bec8de30] bg-[#dfeaff]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setPaso(2)}
                className="flex-1 py-4 rounded-xl border border-[#bec8de30] text-[#69738c] font-medium"
              >
                Atrás
              </button>
              <button
                onClick={() => setPaso(4)}
                className="flex-1 py-4 rounded-xl bg-[#6888ff] text-white font-medium"
              >
                Revisar
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#69738c]">Resumen del Contrato</h2>

            <div className="p-4 rounded-xl bg-[#6888ff]/10 border border-[#bec8de]">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-6 h-6 text-[#6888ff]" />
                <span className="font-bold text-[#6888ff]">Contrato Express</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#69738c]">Cliente:</span>
                  <span className="font-medium text-[#69738c]">{datos.clienteNombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#69738c]">Producto:</span>
                  <span className="font-medium text-[#69738c]">{datos.producto || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#69738c]">Período:</span>
                  <span className="font-medium text-[#69738c]">{datos.fechaInicio} - {datos.fechaFin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#69738c]">Valor estimado:</span>
                  <span className="font-bold text-[#6888ff]">${datos.valorEstimado?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>

            {!online && (
              <div className="p-4 rounded-xl bg-[#6888ff]/5 border border-[#bec8de] flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-[#6888ff]" />
                <div>
                  <p className="font-medium text-[#6888ff]">Modo Offline</p>
                  <p className="text-sm text-[#6888ff]">Se sincronizará al reconectar</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => handleGuardar(false)}
                disabled={guardando}
                className="flex-1 py-4 rounded-xl border border-[#bec8de30] text-[#69738c] font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                Guardar
              </button>
              <button
                onClick={() => handleGuardar(true)}
                disabled={guardando}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#6888ff] to-[#5572ee] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {guardando ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Enviar
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dfeaff] to-[#5572ee]">
      {/* Header */}
      <div className="bg-[#dfeaff] border-b border-[#bec8de30] px-4 pt-12 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-[#dfeaff]">
            <ArrowLeft className="w-5 h-5 text-[#69738c]" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#69738c]">📋 Contrato Express</h1>
            <p className="text-sm text-[#69738c]">Paso {paso} de 4</p>
          </div>
          <div className="flex items-center gap-2">
            {online ? (
              <Wifi className="w-5 h-5 text-[#6888ff]" />
            ) : (
              <WifiOff className="w-5 h-5 text-[#6888ff]" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4].map(p => (
            <div
              key={p}
              className={`flex-1 h-1.5 rounded-full ${
                p <= paso ? 'bg-[#6888ff]/50' : 'bg-[#dfeaff]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Indicador de voz */}
      <AnimatePresence>
        {grabando && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-32 left-4 right-4 p-4 rounded-xl bg-[#dfeaff]0 text-white flex items-center justify-center gap-3 z-20"
          >
            <div className="w-4 h-4 rounded-full bg-[#dfeaff] animate-pulse" />
            <span className="font-medium">Escuchando...</span>
            <Mic className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido */}
      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={paso}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {pasoActual()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
