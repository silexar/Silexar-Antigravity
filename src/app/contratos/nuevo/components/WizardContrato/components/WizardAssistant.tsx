/**
 * 🤖 SILEXAR PULSE - Contextual Wizard Assistant TIER 0
 *
 * @description Asistente contextual que guía al usuario durante
 * la creación del contrato con tips, ayudas y sugerencias IA.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Clock,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Target,
  ThumbsDown,
  ThumbsUp,
  Video,
  X,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type TipoAyuda = "tip" | "sugerencia" | "advertencia" | "guia" | "ia";

interface AyudaContextual {
  id: string;
  tipo: TipoAyuda;
  titulo: string;
  mensaje: string;
  accionable?: boolean;
  accionTexto?: string;
  accionUrl?: string;
  videoUrl?: string;
  documentoUrl?: string;
  paso: string;
  relevancia: number; // 0-100
}

interface HistorialInteraccion {
  ayudaId: string;
  util: boolean | null;
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS NEUROMORPHIC
// ═══════════════════════════════════════════════════════════════

const neuro = {
  panel: `
    bg-[#dfeaff]
    rounded-2xl
    shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]
    border border-[#bec8de30]
  `,
  card: `
    bg-[#dfeaff]
    rounded-xl
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    border border-[#bec8de20]
  `,
  btn: `
    bg-[#dfeaff]
    text-[#69738c] font-medium rounded-lg
    shadow-[3px_3px_6px_#bec8de,-3px_-3px_6px_#ffffff]
    hover:shadow-[1px_1px_3px_#bec8de,-1px_-1px_3px_#ffffff]
    transition-all duration-200
  `,
  badge: `
    px-2 py-0.5 rounded-md
    shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    text-xs font-medium
  `,
};

// ═══════════════════════════════════════════════════════════════
// BASE DE CONOCIMIENTO
// ═══════════════════════════════════════════════════════════════

const ayudasPorPaso: Record<string, AyudaContextual[]> = {
  "cliente": [
    {
      id: "c-1",
      tipo: "tip",
      titulo: "💡 Autocompletado inteligente",
      mensaje:
        "Al seleccionar un cliente existente, sus datos se autocompletarán. Si es un cliente nuevo, puedes crearlo directamente aquí.",
      paso: "cliente",
      relevancia: 100,
    },
    {
      id: "c-2",
      tipo: "guia",
      titulo: "📚 Guía: Datos del cliente",
      mensaje:
        "Asegúrate de tener el RUT correcto del cliente. El sistema validará automáticamente el dígito verificador.",
      documentoUrl: "/docs/clientes",
      paso: "cliente",
      relevancia: 80,
    },
  ],
  "lineas": [
    {
      id: "l-1",
      tipo: "sugerencia",
      titulo: "✨ Sugerencia de Cortex",
      mensaje:
        "Basado en contratos similares, este cliente típicamente contrata Radio FM + Digital. Considera agregar ambos medios.",
      accionable: true,
      accionTexto: "Agregar combo sugerido",
      paso: "lineas",
      relevancia: 95,
    },
    {
      id: "l-2",
      tipo: "tip",
      titulo: "💡 Importar desde cotización",
      mensaje:
        "Puedes importar líneas directamente desde una cotización existente para ahorrar tiempo.",
      accionable: true,
      accionTexto: "Importar cotización",
      paso: "lineas",
      relevancia: 85,
    },
    {
      id: "l-3",
      tipo: "guia",
      titulo: "📚 Tarifas actualizadas",
      mensaje:
        "Las tarifas mostradas están actualizadas al 1 de enero 2025. Consulta con tu supervisor para tarifas especiales.",
      videoUrl: "/videos/tarifas",
      paso: "lineas",
      relevancia: 70,
    },
  ],
  "terminos": [
    {
      id: "t-1",
      tipo: "ia",
      titulo: "🤖 Análisis de riesgo crediticio",
      mensaje:
        "Este cliente tiene score crediticio AAA. Puedes ofrecer hasta 60 días sin aumentar el riesgo.",
      paso: "terminos",
      relevancia: 100,
    },
    {
      id: "t-2",
      tipo: "advertencia",
      titulo: "⚠️ Descuento alto detectado",
      mensaje:
        "El descuento del 18% excede tu límite autorizado (15%). Necesitarás aprobación de nivel 2.",
      paso: "terminos",
      relevancia: 100,
    },
    {
      id: "t-3",
      tipo: "tip",
      titulo: "💡 Calculadora",
      mensaje:
        "Usa la calculadora inteligente (botón 🧮) para simular diferentes escenarios de descuento y comisión.",
      accionable: true,
      accionTexto: "Abrir calculadora",
      paso: "terminos",
      relevancia: 80,
    },
  ],
  "documentacion": [
    {
      id: "d-1",
      tipo: "tip",
      titulo: "💡 Drag & Drop desde Gmail",
      mensaje:
        "Puedes arrastrar correos directamente desde Gmail a esta área para adjuntar toda la negociación.",
      paso: "documentacion",
      relevancia: 95,
    },
    {
      id: "d-2",
      tipo: "sugerencia",
      titulo: "✨ OC detectada en email",
      mensaje:
        'Cortex detectó una posible Orden de Compra en el email "Re: Propuesta comercial". ¿Quieres procesarla?',
      accionable: true,
      accionTexto: "Procesar OC",
      paso: "documentacion",
      relevancia: 100,
    },
  ],
  "aprobaciones": [
    {
      id: "a-1",
      tipo: "ia",
      titulo: "🤖 Cadena de aprobación",
      mensaje:
        "Por el monto ($82M) y descuento (18%), se requieren 2 niveles de aprobación: Supervisor + Gerente Comercial.",
      paso: "aprobaciones",
      relevancia: 100,
    },
    {
      id: "a-2",
      tipo: "tip",
      titulo: "💡 Aprobación express",
      mensaje:
        "Ana García (Supervisora) está activa ahora. El tiempo promedio de aprobación es de 2 horas.",
      paso: "aprobaciones",
      relevancia: 85,
    },
  ],
  "resumen": [
    {
      id: "r-1",
      tipo: "guia",
      titulo: "📋 Checklist final",
      mensaje:
        "Antes de enviar, ejecuta el checklist de verificación para asegurar que todo esté correcto.",
      accionable: true,
      accionTexto: "Abrir checklist",
      paso: "resumen",
      relevancia: 100,
    },
    {
      id: "r-2",
      tipo: "sugerencia",
      titulo: "✨ Preview del contrato",
      mensaje:
        "Genera un preview del PDF para revisar cómo quedará el contrato antes de enviarlo.",
      accionable: true,
      accionTexto: "Ver preview",
      paso: "resumen",
      relevancia: 90,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const getTipoConfig = (tipo: TipoAyuda) => {
  const configs = {
    tip: {
      icon: <Lightbulb className="w-4 h-4" />,
      color: "bg-blue-100 text-blue-600",
      border: "border-blue-200",
    },
    sugerencia: {
      icon: <Sparkles className="w-4 h-4" />,
      color: "bg-purple-100 text-purple-600",
      border: "border-purple-200",
    },
    advertencia: {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "bg-amber-100 text-amber-600",
      border: "border-amber-300",
    },
    guia: {
      icon: <BookOpen className="w-4 h-4" />,
      color: "bg-[#dfeaff] text-[#69738c]",
      border: "border-[#bec8de40]",
    },
    ia: {
      icon: <Sparkles className="w-4 h-4" />,
      color: "bg-[#6888ff25] text-[#6888ff]",
      border: "border-[#6888ff30]",
    },
  };
  return configs[tipo];
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function WizardAssistant({
  pasoActual,
  minimizado = false,
  onAccion,
  onMinimizar,
}: {
  pasoActual: string;
  minimizado?: boolean;
  onAccion?: (accionId: string, accionTexto: string) => void;
  onMinimizar?: (min: boolean) => void;
}) {
  const [ayudas, setAyudas] = useState<AyudaContextual[]>([]);
  const [ayudaActiva, setAyudaActiva] = useState<string | null>(null);
  const [historial, setHistorial] = useState<HistorialInteraccion[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Cargar ayudas del paso actual
  useEffect(() => {
    const ayudasPaso = ayudasPorPaso[pasoActual] || [];
    const filtradas = ayudasPaso
      .filter((a) => !dismissed.includes(a.id))
      .sort((a, b) => b.relevancia - a.relevancia);
    setAyudas(filtradas);

    if (filtradas.length > 0 && !ayudaActiva) {
      setAyudaActiva(filtradas[0].id);
    }
  }, [pasoActual, dismissed]);

  const handleFeedback = (ayudaId: string, util: boolean) => {
    setHistorial([...historial, { ayudaId, util, timestamp: new Date() }]);
    // En producción: enviar a analytics
  };

  const handleDismiss = (ayudaId: string) => {
    setDismissed([...dismissed, ayudaId]);
  };

  if (ayudas.length === 0) return null;

  if (minimizado) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => onMinimizar?.(false)}
        className={`${neuro.panel} p-3 fixed bottom-24 right-6 z-40`}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#6888ff]" />
          <span className={`${neuro.badge} bg-[#6888ff25] text-[#6888ff]`}>
            {ayudas.length}
          </span>
        </div>
      </motion.button>
    );
  }

  const ayudaSeleccionada = ayudas.find((a) => a.id === ayudaActiva) ||
    ayudas[0];
  const config = getTipoConfig(ayudaSeleccionada.tipo);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${neuro.panel} p-4 w-80`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#6888ff]" />
          <span className="font-semibold text-sm text-[#69738c]">
            Asistente
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMinimizar?.(true)}
            className="p-1 hover:bg-[#dfeaff] rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-[#9aa3b8]" />
          </button>
        </div>
      </div>

      {/* Tabs de ayudas */}
      {ayudas.length > 1 && (
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {ayudas.map((ayuda) => {
            const cfg = getTipoConfig(ayuda.tipo);
            return (
              <button
                key={ayuda.id}
                onClick={() => setAyudaActiva(ayuda.id)}
                className={`p-1.5 rounded-lg flex-shrink-0 transition-all ${
                  ayudaActiva === ayuda.id
                    ? `${cfg.color} ring-2 ring-offset-1 ring-current`
                    : "bg-[#dfeaff] text-[#9aa3b8] hover:bg-[#dfeaff]"
                }`}
              >
                {cfg.icon}
              </button>
            );
          })}
        </div>
      )}

      {/* Contenido de ayuda activa */}
      <AnimatePresence mode="wait">
        <motion.div
          key={ayudaSeleccionada.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`${neuro.card} p-3 border-l-4 ${config.border}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className={`p-1.5 rounded-lg ${config.color}`}>
              {config.icon}
            </div>
            <button
              onClick={() => handleDismiss(ayudaSeleccionada.id)}
              className="text-[#9aa3b8] hover:text-[#69738c]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="font-semibold text-sm text-[#69738c] mt-2">
            {ayudaSeleccionada.titulo}
          </p>
          <p className="text-xs text-[#69738c] mt-1 leading-relaxed">
            {ayudaSeleccionada.mensaje}
          </p>

          {/* Acciones */}
          <div className="mt-3 space-y-2">
            {ayudaSeleccionada.accionable && (
              <button
                onClick={() =>
                  onAccion?.(
                    ayudaSeleccionada.id,
                    ayudaSeleccionada.accionTexto || "",
                  )}
                className={`${neuro.btn} w-full px-3 py-2 text-xs flex items-center justify-center gap-1`}
              >
                {ayudaSeleccionada.accionTexto}
                <ChevronRight className="w-3 h-3" />
              </button>
            )}

            {ayudaSeleccionada.videoUrl && (
              <a
                href={ayudaSeleccionada.videoUrl}
                className="flex items-center gap-2 text-xs text-[#6888ff] hover:underline"
              >
                <Video className="w-3 h-3" />
                Ver video tutorial
              </a>
            )}

            {ayudaSeleccionada.documentoUrl && (
              <a
                href={ayudaSeleccionada.documentoUrl}
                className="flex items-center gap-2 text-xs text-[#6888ff] hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Leer documentación
              </a>
            )}
          </div>

          {/* Feedback */}
          <div className="mt-3 pt-3 border-t border-[#bec8de20] flex items-center justify-between">
            <span className="text-xs text-[#9aa3b8]">¿Te fue útil?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback(ayudaSeleccionada.id, true)}
                className="p-1.5 hover:bg-green-100 rounded-lg text-[#9aa3b8] hover:text-green-600 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFeedback(ayudaSeleccionada.id, false)}
                className="p-1.5 hover:bg-red-100 rounded-lg text-[#9aa3b8] hover:text-red-600 transition-colors"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Quick help */}
      <div className="mt-3 flex items-center justify-center">
        <button className="text-xs text-[#9aa3b8] flex items-center gap-1 hover:text-[#6888ff] transition-colors">
          <MessageSquare className="w-3 h-3" />
          Preguntar a Cortex
        </button>
      </div>
    </motion.div>
  );
}
