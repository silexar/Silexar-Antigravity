/**
 * 📋 SILEXAR PULSE - Página Nuevo Contrato TIER 0
 * 
 * @description Página de entrada inteligente para creación de contratos
 * con detección automática de contexto y selector de tipo.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  FileText,
  RefreshCw,
  Building2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Shield,
  Zap,
  Target,
  Mail,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// NEUROMORPHIC DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════

const N = { base: '#dfeaff', dark: '#bec8de', light: '#ffffff', accent: '#6888ff', text: '#69738c', sub: '#9aa3b8' };
const neu = `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`;
const neuSm = `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`;
const inset = `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`;

const NeuromorphicCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 ${className}`} style={{ background: N.base, boxShadow: neu }}>
    {children}
  </div>
);

const NeuromorphicButton = ({ children, onClick, variant = 'secondary', className = '' }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; className?: string;
}) => {
  const s = variant === 'primary'
    ? { background: N.accent, color: '#fff', boxShadow: neuSm }
    : { background: N.base, color: N.text, boxShadow: neu };
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${className}`} style={s}>
      {children}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type TipoContrato = 'nuevo' | 'renovacion' | 'programatico' | 'marco' | 'express';
type OrigenContexto = 'directo' | 'anunciante' | 'oportunidad' | 'renovacion' | 'whatsapp' | 'email';

interface ContextoCreacion {
  origen: OrigenContexto;
  anuncianteId?: string;
  anuncianteNombre?: string;
  contratoBaseId?: string;
  oportunidadId?: string;
  datosParseados?: Record<string, unknown>;
}

interface TipoContratoOption {
  id: TipoContrato;
  icono: string;
  titulo: string;
  descripcion: string;
  beneficio: string;
  beneficioIcono: React.ReactNode;
  color: string;
  bgGradient: string;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE TIPOS
// ═══════════════════════════════════════════════════════════════

const tiposContrato: TipoContratoOption[] = [
  {
    id: 'nuevo',
    icono: '🆕',
    titulo: 'Nuevo Contrato',
    descripcion: 'Cliente nuevo o campaña nueva',
    beneficio: 'IA sugerirá términos óptimos',
    beneficioIcono: <Sparkles className="w-4 h-4 text-[#6888ff]" />,
    color: 'border-[#bec8de] hover:border-[#6888ff]',
    bgGradient: ''
  },
  {
    id: 'renovacion',
    icono: '🔄',
    titulo: 'Renovación Automática',
    descripcion: 'Basado en contrato existente',
    beneficio: 'Términos pre-validados',
    beneficioIcono: <CheckCircle2 className="w-4 h-4 text-[#6888ff]" />,
    color: 'border-[#bec8de] hover:border-[#6888ff]',
    bgGradient: ''
  },
  {
    id: 'programatico',
    icono: '📊',
    titulo: 'Contrato Programático',
    descripcion: 'Para campañas de alto volumen',
    beneficio: 'Optimización automática',
    beneficioIcono: <Target className="w-4 h-4 text-[#6888ff]" />,
    color: 'border-[#bec8de] hover:border-[#6888ff]',
    bgGradient: ''
  },
  {
    id: 'marco',
    icono: '🏢',
    titulo: 'Contrato Marco Anual',
    descripcion: 'Cliente corporativo recurrente',
    beneficio: 'Términos preferenciales',
    beneficioIcono: <Building2 className="w-4 h-4 text-[#6888ff]" />,
    color: 'border-[#bec8de] hover:border-[#6888ff]',
    bgGradient: ''
  },
  {
    id: 'express',
    icono: '📱',
    titulo: 'Contrato Express (Móvil)',
    descripcion: 'Creación rápida desde terreno',
    beneficio: 'Validación instantánea',
    beneficioIcono: <Zap className="w-4 h-4 text-[#6888ff]" />,
    color: 'border-[#bec8de] hover:border-[#6888ff]',
    bgGradient: ''
  }
];

// Wizard con carga dinámica
const WizardContrato = dynamic(
  () => import('./components/WizardContrato'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center" style={{ background: N.base }}>
        <NeuromorphicCard className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: N.accent, boxShadow: neuSm }}>
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-bold" style={{ color: N.text }}>Cargando Wizard...</h2>
          <p className="text-sm mt-1" style={{ color: N.sub }}>Preparando formulario de contrato</p>
        </NeuromorphicCard>
      </div>
    )
  }
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE SELECTOR DE TIPO
// ═══════════════════════════════════════════════════════════════

function TipoContratoCard({
  tipo,
  seleccionado,
  onClick
}: {
  tipo: TipoContratoOption;
  seleccionado: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`
        relative p-4 rounded-2xl transition-all text-left w-full
        ${seleccionado
          ? `border-[#bec8de] shadow-lg ring-2 ring-indigo-500/20`
          : `border-2 ${tipo.color} hover:shadow-md`
        }
      `}
      style={{ background: N.base, boxShadow: neu }}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
          <span className="text-2xl">{tipo.icono}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base" style={{ color: N.text }}>{tipo.titulo}</h3>
          <p className="text-sm mt-0.5" style={{ color: N.sub }}>{tipo.descripcion}</p>
          <div className="flex items-center gap-1.5 mt-1.5 text-sm">
            {tipo.beneficioIcono}
            <span style={{ color: N.sub }}>{tipo.beneficio}</span>
          </div>
        </div>
        {seleccionado && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-1.5 rounded-full flex items-center justify-center"
            style={{ background: N.accent }}
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL CON SUSPENSE
// ═══════════════════════════════════════════════════════════════

function NuevoContratoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fase, setFase] = useState<'selector' | 'wizard'>('wizard');
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoContrato | null>(null);
  const [contexto, setContexto] = useState<ContextoCreacion>({ origen: 'directo' });
  const [detectando, setDetectando] = useState(true);

  // Detectar contexto automáticamente
  useEffect(() => {
    const detectarContexto = async () => {
      setDetectando(true);

      // Buscar parámetros de URL
      const anuncianteId = searchParams?.get('anunciante');
      const contratoBaseId = searchParams?.get('renovar');
      const oportunidadId = searchParams?.get('oportunidad');
      const origenParam = searchParams?.get('origen');

      if (contratoBaseId) {
        // Viene de renovación
        setContexto({
          origen: 'renovacion',
          contratoBaseId,
          anuncianteNombre: 'Cargando...' // Se cargaría del API
        });
        setTipoSeleccionado('renovacion');
      } else if (anuncianteId) {
        // Viene desde el módulo de Anunciantes
        setContexto({
          origen: 'anunciante',
          anuncianteId,
          anuncianteNombre: 'Cargando...' // Se cargaría del API
        });
      } else if (oportunidadId) {
        // Viene desde oportunidad comercial
        setContexto({
          origen: 'oportunidad',
          oportunidadId
        });
      } else if (origenParam === 'whatsapp' || origenParam === 'email') {
        // Viene de parser automático
        setContexto({
          origen: origenParam as OrigenContexto,
          datosParseados: {} // Se cargarían los datos parseados
        });
      }

      // Simular carga
      await new Promise(resolve => setTimeout(resolve, 500));
      setDetectando(false);
    };

    detectarContexto();
  }, [searchParams]);

  const handleComplete = (contratoId: string) => {
    router.push(`/contratos/${contratoId}?created=true`);
  };

  const handleCancel = () => {
    router.push('/contratos');
  };

  const iniciarWizard = () => {
    if (tipoSeleccionado) {
      setFase('wizard');
    }
  };

  // Si hay contexto de renovación, ir directo al wizard
  useEffect(() => {
    if (contexto.origen === 'renovacion' && !detectando) {
      setFase('wizard');
    }
  }, [contexto, detectando]);

  // Mostrar wizard
  if (fase === 'wizard') {
    return (
      <WizardContrato
        onComplete={handleComplete}
        onCancel={handleCancel}
        tipoContrato={tipoSeleccionado || 'nuevo'}
        contexto={contexto}
      />
    );
  }

  // Mostrar selector
  return (
    <div className="min-h-screen flex flex-col" style={{ background: N.base }}>
      {/* Header con botón de retorno simple */}
      <div className="border-b border-[#bec8de30]" style={{ background: N.base }}>
        <div className="max-w-xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/contratos')}
            className="p-2 rounded-xl transition-all hover:scale-105"
            style={{ background: N.base, boxShadow: neuSm }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: N.text }} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl">
          {/* Título centrado con icono a la izquierda del texto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="p-3 rounded-2xl" style={{ background: N.base, boxShadow: neu }}>
              <FileText className="w-6 h-6" style={{ color: N.accent }} />
            </div>
            <h1 className="text-xl font-bold" style={{ color: N.text }}>
              Selecciona el tipo de contrato para optimizar el proceso
            </h1>
          </motion.div>

          {/* Contexto detectado */}
          <AnimatePresence>
            {contexto.origen !== 'directo' && !detectando && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <NeuromorphicCard className="mb-6">
                  <div className="flex items-center gap-3">
                    {contexto.origen === 'anunciante' && <Building2 className="w-5 h-5 text-[#6888ff]" />}
                    {contexto.origen === 'renovacion' && <RefreshCw className="w-5 h-5 text-[#6888ff]" />}
                    {contexto.origen === 'oportunidad' && <Target className="w-5 h-5 text-[#6888ff]" />}
                    {contexto.origen === 'whatsapp' && <MessageSquare className="w-5 h-5 text-[#6888ff]" />}
                    {contexto.origen === 'email' && <Mail className="w-5 h-5 text-[#6888ff]" />}
                    <div>
                      <p className="font-medium text-[#69738c]">
                        {contexto.origen === 'anunciante' && `📋 Creando contrato para: ${contexto.anuncianteNombre || contexto.anuncianteId}`}
                        {contexto.origen === 'renovacion' && `🔄 Renovando contrato: ${contexto.contratoBaseId}`}
                        {contexto.origen === 'oportunidad' && `🎯 Desde oportunidad comercial`}
                        {contexto.origen === 'whatsapp' && `📱 Datos importados desde WhatsApp`}
                        {contexto.origen === 'email' && `📧 Datos importados desde Email`}
                      </p>
                      <p className="text-sm text-[#69738c]">
                        Los datos se pre-llenarán automáticamente
                      </p>
                    </div>
                    <Sparkles className="w-5 h-5 text-[#6888ff] ml-auto" />
                  </div>
                </NeuromorphicCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading */}
          {detectando && (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-[#bec8de] border-t-[#6888ff] animate-spin" />
              <p className="text-[#69738c]">Detectando contexto...</p>
            </div>
          )}

          {/* Grid de tipos - 2 columnas con el último elemento ocupando ambas */}
          {!detectando && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {tiposContrato.map((tipo, index) => (
                <motion.div
                  key={tipo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={index === 4 ? 'col-span-2' : ''}
                >
                  <TipoContratoCard
                    tipo={tipo}
                    seleccionado={tipoSeleccionado === tipo.id}
                    onClick={() => setTipoSeleccionado(tipo.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Botón continuar */}
          <AnimatePresence>
            {tipoSeleccionado && !detectando && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-8 flex justify-center gap-4"
              >
                <NeuromorphicButton variant="secondary" onClick={handleCancel}>
                  Cancelar
                </NeuromorphicButton>
                <NeuromorphicButton variant="primary" onClick={iniciarWizard}>
                  Continuar
                  <ArrowRight className="w-5 h-5" />
                </NeuromorphicButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function NuevoContratoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: N.base }}>
        <NeuromorphicCard className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: N.accent, boxShadow: neuSm }}>
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-bold" style={{ color: N.text }}>Cargando...</h2>
        </NeuromorphicCard>
      </div>
    }>
      <NuevoContratoContent />
    </Suspense>
  );
}
