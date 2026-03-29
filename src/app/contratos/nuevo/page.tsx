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
  Clock,
  Shield,
  Zap,
  Target,
  Mail,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

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
    beneficioIcono: <Sparkles className="w-4 h-4 text-indigo-500" />,
    color: 'border-indigo-200 hover:border-indigo-400',
    bgGradient: 'from-indigo-50 to-indigo-100/50'
  },
  {
    id: 'renovacion',
    icono: '🔄',
    titulo: 'Renovación Automática',
    descripcion: 'Basado en contrato existente',
    beneficio: 'Términos pre-validados',
    beneficioIcono: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    color: 'border-green-200 hover:border-green-400',
    bgGradient: 'from-green-50 to-green-100/50'
  },
  {
    id: 'programatico',
    icono: '📊',
    titulo: 'Contrato Programático',
    descripcion: 'Para campañas de alto volumen',
    beneficio: 'Optimización automática',
    beneficioIcono: <Target className="w-4 h-4 text-purple-500" />,
    color: 'border-purple-200 hover:border-purple-400',
    bgGradient: 'from-purple-50 to-purple-100/50'
  },
  {
    id: 'marco',
    icono: '🏢',
    titulo: 'Contrato Marco Anual',
    descripcion: 'Cliente corporativo recurrente',
    beneficio: 'Términos preferenciales',
    beneficioIcono: <Building2 className="w-4 h-4 text-blue-500" />,
    color: 'border-blue-200 hover:border-blue-400',
    bgGradient: 'from-blue-50 to-blue-100/50'
  },
  {
    id: 'express',
    icono: '📱',
    titulo: 'Contrato Express (Móvil)',
    descripcion: 'Creación rápida desde terreno',
    beneficio: 'Validación instantánea',
    beneficioIcono: <Zap className="w-4 h-4 text-amber-500" />,
    color: 'border-amber-200 hover:border-amber-400',
    bgGradient: 'from-amber-50 to-amber-100/50'
  }
];

// Wizard con carga dinámica
const WizardContrato = dynamic(
  () => import('./components/WizardContrato'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-slate-700">Cargando Wizard...</h2>
          <p className="text-slate-500 mt-1">Preparando formulario de contrato</p>
        </div>
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
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-5 rounded-2xl border-2 transition-all text-left w-full
        ${seleccionado 
          ? `border-indigo-500 bg-gradient-to-br ${tipo.bgGradient} shadow-lg ring-2 ring-indigo-500/20` 
          : `${tipo.color} bg-white hover:shadow-md`
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{tipo.icono}</div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-lg">{tipo.titulo}</h3>
          <p className="text-sm text-slate-600 mt-1">{tipo.descripcion}</p>
          <div className="flex items-center gap-1.5 mt-2 text-sm">
            {tipo.beneficioIcono}
            <span className="text-slate-700">{tipo.beneficio}</span>
          </div>
        </div>
        {seleccionado && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-1 rounded-full bg-indigo-500"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
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
  
  const [fase, setFase] = useState<'selector' | 'wizard'>('selector');
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
    if (fase === 'wizard') {
      setFase('selector');
    } else {
      router.push('/contratos/comando');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span>Contratos</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-800 font-medium">Nuevo Contrato</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl mb-4">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            🎯 ¿Qué tipo de contrato crearás?
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            Selecciona el tipo de contrato para optimizar el proceso de creación con sugerencias inteligentes.
          </p>
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
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  {contexto.origen === 'anunciante' && <Building2 className="w-5 h-5 text-indigo-600" />}
                  {contexto.origen === 'renovacion' && <RefreshCw className="w-5 h-5 text-green-600" />}
                  {contexto.origen === 'oportunidad' && <Target className="w-5 h-5 text-purple-600" />}
                  {contexto.origen === 'whatsapp' && <MessageSquare className="w-5 h-5 text-green-600" />}
                  {contexto.origen === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
                  <div>
                    <p className="font-medium text-slate-800">
                      {contexto.origen === 'anunciante' && `📋 Creando contrato para: ${contexto.anuncianteNombre || contexto.anuncianteId}`}
                      {contexto.origen === 'renovacion' && `🔄 Renovando contrato: ${contexto.contratoBaseId}`}
                      {contexto.origen === 'oportunidad' && `🎯 Desde oportunidad comercial`}
                      {contexto.origen === 'whatsapp' && `📱 Datos importados desde WhatsApp`}
                      {contexto.origen === 'email' && `📧 Datos importados desde Email`}
                    </p>
                    <p className="text-sm text-slate-600">
                      Los datos se pre-llenarán automáticamente
                    </p>
                  </div>
                  <Sparkles className="w-5 h-5 text-amber-500 ml-auto" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {detectando && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
            <p className="text-slate-600">Detectando contexto...</p>
          </div>
        )}

        {/* Grid de tipos */}
        {!detectando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {tiposContrato.map((tipo, index) => (
              <motion.div
                key={tipo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
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
              <button
                onClick={handleCancel}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={iniciarWizard}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Continuar
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer informativo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-3 gap-4"
        >
          {[
            { icono: <Clock className="w-5 h-5" />, label: 'Tiempo promedio', valor: '5 min' },
            { icono: <Shield className="w-5 h-5" />, label: 'Validaciones IA', valor: 'Automáticas' },
            { icono: <Sparkles className="w-5 h-5" />, label: 'Sugerencias', valor: 'Personalizadas' }
          ].map((item, idx) => (
            <div key={idx} className="text-center p-4 rounded-xl bg-white border border-slate-200">
              <div className="text-indigo-500 flex justify-center mb-2">{item.icono}</div>
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="font-semibold text-slate-800">{item.valor}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function NuevoContratoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-slate-700">Cargando...</h2>
        </div>
      </div>
    }>
      <NuevoContratoContent />
    </Suspense>
  );
}
