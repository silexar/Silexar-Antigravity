/**
 * ✅ SILEXAR PULSE - Pre-Send Checklist TIER 0
 * 
 * @description Checklist de verificación previo al envío del contrato.
 * Verifica automáticamente que todo esté completo y correcto.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Send,
  ChevronDown,
  ChevronRight,
  FileText,
  DollarSign,
  Users,
  Calendar,
  PenTool,
  Shield,
  RefreshCw,
  Sparkles
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type EstadoVerificacion = 'pendiente' | 'verificando' | 'ok' | 'error' | 'advertencia';

interface ItemChecklist {
  id: string;
  categoria: string;
  nombre: string;
  descripcion: string;
  estado: EstadoVerificacion;
  obligatorio: boolean;
  detalle?: string;
  accionCorrectiva?: string;
  urlAccion?: string;
}

interface CategoriaChecklist {
  id: string;
  nombre: string;
  icono: React.ReactNode;
  color: string;
  items: ItemChecklist[];
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS NEUROMORPHIC
// ═══════════════════════════════════════════════════════════════

const neuro = {
  panel: `
    bg-[#dfeaff]
    rounded-3xl
    shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]

  `,
  card: `
    bg-[#dfeaff]
    rounded-2xl
    shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]

  `,
  btnPrimary: `
    bg-[#6888ff]
    text-white font-semibold rounded-xl
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  btnSecondary: `
    bg-[#dfeaff]
    text-[#69738c] font-medium rounded-xl
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  badge: `
    px-3 py-1 rounded-lg
    shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    text-xs font-medium
  `
};

// ═══════════════════════════════════════════════════════════════
// DATOS DE VERIFICACIÓN
// ═══════════════════════════════════════════════════════════════

const generarChecklist = (): CategoriaChecklist[] => [
  {
    id: 'datos',
    nombre: 'Datos del Contrato',
    icono: <FileText className="w-5 h-5" />,
    color: 'bg-[#6888ff]/10 text-[#6888ff]',
    items: [
      {
        id: 'datos-1',
        categoria: 'datos',
        nombre: 'Información del cliente completa',
        descripcion: 'RUT, razón social, dirección y contactos',
        estado: 'ok',
        obligatorio: true
      },
      {
        id: 'datos-2',
        categoria: 'datos',
        nombre: 'Fechas de vigencia definidas',
        descripcion: 'Fecha inicio y fin del contrato',
        estado: 'ok',
        obligatorio: true
      },
      {
        id: 'datos-3',
        categoria: 'datos',
        nombre: 'Tipo de contrato especificado',
        descripcion: 'Nuevo, renovación, enmienda u orden de compra',
        estado: 'ok',
        obligatorio: true
      }
    ]
  },
  {
    id: 'comercial',
    nombre: 'Condiciones Comerciales',
    icono: <DollarSign className="w-5 h-5" />,
    color: 'bg-[#6888ff]/10 text-[#6888ff]',
    items: [
      {
        id: 'com-1',
        categoria: 'comercial',
        nombre: 'Líneas de contrato agregadas',
        descripcion: 'Al menos una línea con medio, unidades y valor',
        estado: 'ok',
        obligatorio: true,
        detalle: '3 líneas agregadas por $100M total'
      },
      {
        id: 'com-2',
        categoria: 'comercial',
        nombre: 'Descuento dentro de límite',
        descripcion: 'El descuento aplicado está dentro de tu límite autorizado',
        estado: 'advertencia',
        obligatorio: false,
        detalle: 'Descuento: 18% (tu límite: 15%)',
        accionCorrectiva: 'Requiere aprobación de supervisor'
      },
      {
        id: 'com-3',
        categoria: 'comercial',
        nombre: 'Condiciones de pago definidas',
        descripcion: 'Modalidad y días de crédito especificados',
        estado: 'ok',
        obligatorio: true,
        detalle: 'Crédito 30 días'
      },
      {
        id: 'com-4',
        categoria: 'comercial',
        nombre: 'Comisión de agencia especificada',
        descripcion: 'Porcentaje de comisión si aplica',
        estado: 'ok',
        obligatorio: false,
        detalle: '15% para Agencia Creativa'
      }
    ]
  },
  {
    id: 'documentos',
    nombre: 'Documentación',
    icono: <FileText className="w-5 h-5" />,
    color: 'bg-[#6888ff]/10 text-[#6888ff]',
    items: [
      {
        id: 'doc-1',
        categoria: 'documentos',
        nombre: 'Orden de compra adjunta',
        descripcion: 'OC del cliente en formato PDF',
        estado: 'ok',
        obligatorio: true,
        detalle: 'OC-45678.pdf adjunta'
      },
      {
        id: 'doc-2',
        categoria: 'documentos',
        nombre: 'Cotización relacionada',
        descripcion: 'Cotización previa vinculada al contrato',
        estado: 'ok',
        obligatorio: false,
        detalle: 'COT-2024-089 vinculada'
      },
      {
        id: 'doc-3',
        categoria: 'documentos',
        nombre: 'Material creativo adjunto',
        descripcion: 'Piezas publicitarias si aplica',
        estado: 'advertencia',
        obligatorio: false,
        detalle: 'Sin material adjunto',
        accionCorrectiva: 'Considera adjuntar el material para referencia'
      }
    ]
  },
  {
    id: 'aprobaciones',
    nombre: 'Aprobaciones',
    icono: <Users className="w-5 h-5" />,
    color: 'bg-[#6888ff]/10 text-[#6888ff]',
    items: [
      {
        id: 'apr-1',
        categoria: 'aprobaciones',
        nombre: 'Aprobación nivel 1',
        descripcion: 'Aprobación del supervisor directo',
        estado: 'ok',
        obligatorio: true,
        detalle: 'Aprobado por Ana García'
      },
      {
        id: 'apr-2',
        categoria: 'aprobaciones',
        nombre: 'Aprobación nivel 2',
        descripcion: 'Aprobación gerencial requerida por monto',
        estado: 'ok',
        obligatorio: true,
        detalle: 'Aprobado por Roberto Silva'
      }
    ]
  },
  {
    id: 'firma',
    nombre: 'Firma Digital',
    icono: <PenTool className="w-5 h-5" />,
    color: 'bg-[#dfeaff] text-[#6888ff]',
    items: [
      {
        id: 'fir-1',
        categoria: 'firma',
        nombre: 'Firmante interno configurado',
        descripcion: 'Representante legal de la empresa',
        estado: 'ok',
        obligatorio: true,
        detalle: 'Patricia Muñoz - Gerente General'
      },
      {
        id: 'fir-2',
        categoria: 'firma',
        nombre: 'Firmante cliente configurado',
        descripcion: 'Representante del cliente',
        estado: 'ok',
        obligatorio: true,
        detalle: 'Juan Pérez - Director Comercial'
      },
      {
        id: 'fir-3',
        categoria: 'firma',
        nombre: 'Proveedor de firma activo',
        descripcion: 'DocuSign o Adobe Sign configurado',
        estado: 'ok',
        obligatorio: true,
        detalle: 'DocuSign conectado'
      }
    ]
  },
  {
    id: 'legal',
    nombre: 'Cumplimiento Legal',
    icono: <Shield className="w-5 h-5" />,
    color: 'bg-[#dfeaff] text-[#69738c]',
    items: [
      {
        id: 'leg-1',
        categoria: 'legal',
        nombre: 'Cláusulas obligatorias incluidas',
        descripcion: 'Todas las cláusulas legales requeridas',
        estado: 'ok',
        obligatorio: true,
        detalle: '3 de 3 cláusulas obligatorias'
      },
      {
        id: 'leg-2',
        categoria: 'legal',
        nombre: 'Términos y condiciones aceptados',
        descripcion: 'T&C estándar de la empresa',
        estado: 'ok',
        obligatorio: true
      }
    ]
  }
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const getEstadoIcon = (estado: EstadoVerificacion) => {
  switch (estado) {
    case 'ok': return <CheckCircle className="w-5 h-5 text-[#6888ff]" />;
    case 'error': return <XCircle className="w-5 h-5 text-[#9aa3b8]" />;
    case 'advertencia': return <AlertTriangle className="w-5 h-5 text-[#6888ff]" />;
    case 'verificando': return <Loader2 className="w-5 h-5 text-[#6888ff] animate-spin" />;
    default: return <div className="w-5 h-5 rounded-full bg-[#dfeaff]" />;
  }
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function PreSendChecklist({
  contratoId,
  onEnviar,
  onCancelar
}: {
  contratoId: string;
  onEnviar?: () => void;
  onCancelar?: () => void;
}) {
  const [categorias, setCategorias] = useState<CategoriaChecklist[]>(generarChecklist());
  const [verificando, setVerificando] = useState(false);
  const [expanded, setExpanded] = useState<string | null>('datos');

  // Calcular totales
  const estadisticas = useMemo(() => {
    const todos = categorias.flatMap(c => c.items);
    const obligatorios = todos.filter(i => i.obligatorio);
    
    return {
      total: todos.length,
      ok: todos.filter(i => i.estado === 'ok').length,
      errores: todos.filter(i => i.estado === 'error').length,
      advertencias: todos.filter(i => i.estado === 'advertencia').length,
      obligatoriosOk: obligatorios.filter(i => i.estado === 'ok').length,
      obligatoriosTotal: obligatorios.length
    };
  }, [categorias]);

  const puedeEnviar = estadisticas.errores === 0 && 
    estadisticas.obligatoriosOk === estadisticas.obligatoriosTotal;

  const handleVerificar = async () => {
    setVerificando(true);
    
    // Simular verificación
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setCategorias(generarChecklist());
    setVerificando(false);
  };

  return (
    <div className={neuro.panel}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#bec8de30]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#6888ff]">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#69738c]">Checklist Pre-Envío</h3>
              <p className="text-sm text-[#9aa3b8]">
                Verifica que todo esté listo antes de enviar
              </p>
            </div>
          </div>

          <button
            onClick={handleVerificar}
            disabled={verificando}
            className={`${neuro.btnSecondary} px-4 py-2 flex items-center gap-2`}
          >
            <RefreshCw className={`w-4 h-4 ${verificando ? 'animate-spin' : ''}`} />
            {verificando ? 'Verificando...' : 'Re-verificar'}
          </button>
        </div>

        {/* Barra progreso */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[#69738c]">
              {estadisticas.ok} de {estadisticas.total} verificaciones correctas
            </span>
            <div className="flex items-center gap-3">
              {estadisticas.errores > 0 && (
                <span className="text-[#9aa3b8]">
                  {estadisticas.errores} errores
                </span>
              )}
              {estadisticas.advertencias > 0 && (
                <span className="text-[#6888ff]">
                  {estadisticas.advertencias} advertencias
                </span>
              )}
            </div>
          </div>
          <div className="h-2 bg-[#dfeaff] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                estadisticas.errores > 0 ? 'bg-[#dfeaff]0' :
                estadisticas.advertencias > 0 ? 'bg-[#6888ff]/50' :
                'bg-[#6888ff]/50'
              }`}
              style={{ width: `${(estadisticas.ok / estadisticas.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="p-6 space-y-4">
        {categorias.map(categoria => {
          const oks = categoria.items.filter(i => i.estado === 'ok').length;
          const total = categoria.items.length;
          const hayErrores = categoria.items.some(i => i.estado === 'error');
          const hayAdvertencias = categoria.items.some(i => i.estado === 'advertencia');

          return (
            <div key={categoria.id} className={neuro.card}>
              {/* Categoria header */}
              <div
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => setExpanded(expanded === categoria.id ? null : categoria.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${categoria.color}`}>
                    {categoria.icono}
                  </div>
                  <div>
                    <p className="font-semibold text-[#69738c]">{categoria.nombre}</p>
                    <p className="text-xs text-[#9aa3b8]">
                      {oks} de {total} completados
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {hayErrores ? (
                    <span className={`${neuro.badge} bg-[#dfeaff] text-[#9aa3b8]`}>
                      <XCircle className="w-3 h-3 inline mr-1" />
                      Errores
                    </span>
                  ) : hayAdvertencias ? (
                    <span className={`${neuro.badge} bg-[#6888ff]/10 text-[#6888ff]`}>
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      Advertencias
                    </span>
                  ) : (
                    <span className={`${neuro.badge} bg-[#6888ff]/10 text-[#6888ff]`}>
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      OK
                    </span>
                  )}

                  <ChevronRight className={`w-5 h-5 text-[#9aa3b8] transition-transform ${
                    expanded === categoria.id ? 'rotate-90' : ''
                  }`} />
                </div>
              </div>

              {/* Items de la categoría */}
              <AnimatePresence>
                {expanded === categoria.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 space-y-3 overflow-hidden"
                  >
                    {categoria.items.map(item => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl flex items-start gap-3 ${
                          item.estado === 'error' ? 'bg-[#dfeaff]' :
                          item.estado === 'advertencia' ? 'bg-[#6888ff]/5' :
                          'bg-[#dfeaff]'
                        }`}
                      >
                        {getEstadoIcon(item.estado)}
                        <div className="flex-1">
                          <p className={`font-medium ${
                            item.estado === 'error' ? 'text-[#9aa3b8]' :
                            item.estado === 'advertencia' ? 'text-[#6888ff]' :
                            'text-[#69738c]'
                          }`}>
                            {item.nombre}
                            {item.obligatorio && (
                              <span className="text-[#9aa3b8] ml-1">*</span>
                            )}
                          </p>
                          <p className="text-xs text-[#9aa3b8] mt-0.5">
                            {item.descripcion}
                          </p>

                          {item.detalle && (
                            <p className="text-xs text-[#69738c] mt-1 font-medium">
                              {item.detalle}
                            </p>
                          )}

                          {item.accionCorrectiva && (
                            <p className="text-xs text-[#6888ff] mt-1 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {item.accionCorrectiva}
                            </p>
                          )}
                        </div>

                        {item.urlAccion && (
                          <a
                            href={item.urlAccion}
                            className="text-xs text-[#6888ff] hover:underline"
                          >
                            Corregir
                          </a>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer con acciones */}
      <div className="px-6 py-4 bg-[#dfeaff]/50 border-t border-[#bec8de30] flex items-center justify-between">
        <div className="text-sm text-[#9aa3b8]">
          {puedeEnviar ? (
            <span className="text-[#6888ff] flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Listo para enviar
            </span>
          ) : (
            <span className="text-[#9aa3b8] flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              Hay {estadisticas.errores} error(es) que corregir
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancelar}
            className={`${neuro.btnSecondary} px-4 py-2`}
          >
            Cancelar
          </button>
          <button
            onClick={onEnviar}
            disabled={!puedeEnviar}
            className={`${neuro.btnPrimary} px-6 py-2 flex items-center gap-2`}
          >
            <Send className="w-4 h-4" />
            Enviar Contrato
          </button>
        </div>
      </div>
    </div>
  );
}
