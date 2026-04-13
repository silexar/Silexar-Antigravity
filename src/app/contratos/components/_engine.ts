/**
 * AICommandCenter engine: types, styles, and IACommandEngine class.
 * Extracted to keep AICommandCenter.tsx under 400 lines.
 */

import React from 'react';
import {
  BarChart3, TrendingUp, RefreshCw, Plus, Zap, Users,
  Brain, Search, AlertCircle, Target, Clock, CheckCircle, DollarSign, Sparkles,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────

export interface ComandoIA {
  id: string;
  texto: string;
  tipo: 'navegacion' | 'accion' | 'busqueda' | 'analisis' | 'creacion';
  icono: React.ReactNode;
  descripcion: string;
  atajo?: string;
  accion: () => void;
  relevancia?: number;
}

export interface SugerenciaIA {
  id: string;
  tipo: 'alerta' | 'oportunidad' | 'recordatorio' | 'prediccion';
  titulo: string;
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
  accionSugerida?: string;
  datos?: Record<string, unknown>;
}

export interface ContextoUsuario {
  ultimasAcciones: string[];
  contratoActivo?: string;
  clienteActivo?: string;
  horaActual: Date;
  cargaTrabajo: number;
  reunionesHoy: number;
}

// ─── Neumorphic styles ───────────────────────────────────────────

export const neuro = {
  overlay: `fixed inset-0 z-50 bg-[#F0EDE8]/60 backdrop-blur-md`,
  modal: `
    bg-gradient-to-br from-slate-50 via-white to-slate-100
    rounded-3xl
    shadow-[20px_20px_60px_#c5c5c5,-20px_-20px_60px_#ffffff]
    border border-slate-200/50
    overflow-hidden
  `,
  input: `
    bg-gradient-to-br from-slate-100 to-slate-50
    rounded-2xl
    shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]
    border-none
    focus:ring-2 focus:ring-indigo-400/50 focus:outline-none
    transition-all duration-200
  `,
  card: `
    bg-gradient-to-br from-slate-50 to-slate-100
    rounded-2xl
    shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]
    border border-slate-200/30
  `,
  cardHover: `
    hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:scale-[1.02]
    cursor-pointer
    transition-all duration-200
  `,
  btnPrimary: `
    bg-gradient-to-br from-indigo-500 to-purple-600
    text-[#2C2C2A] font-semibold
    rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]
    transition-all duration-200
  `,
  badge: `px-3 py-1 rounded-lg shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] text-xs font-medium`,
};

// ─── IA Command Engine ───────────────────────────────────────────

export class IACommandEngine {
  private contexto: ContextoUsuario;

  constructor() {
    this.contexto = {
      ultimasAcciones: [],
      horaActual: new Date(),
      cargaTrabajo: 75,
      reunionesHoy: 3,
    };
  }

  procesarEntrada(texto: string): ComandoIA[] {
    const textoLower = texto.toLowerCase();
    const comandos: ComandoIA[] = [];

    if (textoLower.includes('ir a') || textoLower.includes('abrir') || textoLower.includes('ver')) {
      if (textoLower.includes('pipeline')) {
        comandos.push({
          id: 'nav-pipeline', texto: 'Ir a Pipeline de Contratos', tipo: 'navegacion',
          icono: React.createElement(BarChart3, { className: 'w-5 h-5' }),
          descripcion: 'Abre el pipeline Kanban de contratos', atajo: '⌘ + P',
          accion: () => { window.location.href = '/contratos/pipeline' }, relevancia: 95,
        });
      }
      if (textoLower.includes('dashboard') || textoLower.includes('inicio')) {
        comandos.push({
          id: 'nav-dashboard', texto: 'Ir a Dashboard', tipo: 'navegacion',
          icono: React.createElement(TrendingUp, { className: 'w-5 h-5' }),
          descripcion: 'Panel principal con métricas', atajo: '⌘ + D',
          accion: () => { window.location.href = '/contratos/dashboard' }, relevancia: 90,
        });
      }
      if (textoLower.includes('renovacion') || textoLower.includes('renovar')) {
        comandos.push({
          id: 'nav-renovaciones', texto: 'Ir a Renovaciones', tipo: 'navegacion',
          icono: React.createElement(RefreshCw, { className: 'w-5 h-5' }),
          descripcion: 'Panel de renovaciones predictivo',
          accion: () => { window.location.href = '/contratos/renovaciones' }, relevancia: 88,
        });
      }
    }

    if (textoLower.includes('crear') || textoLower.includes('nuevo') || textoLower.includes('agregar')) {
      if (textoLower.includes('contrato')) {
        comandos.push({
          id: 'crear-contrato', texto: 'Crear Nuevo Contrato', tipo: 'creacion',
          icono: React.createElement(Plus, { className: 'w-5 h-5' }),
          descripcion: 'Inicia el wizard de creación de contrato', atajo: '⌘ + N',
          accion: () => { window.location.href = '/contratos/nuevo' }, relevancia: 95,
        });
      }
      if (textoLower.includes('express') || textoLower.includes('rapido')) {
        comandos.push({
          id: 'crear-express', texto: 'Contrato Express (Móvil)', tipo: 'creacion',
          icono: React.createElement(Zap, { className: 'w-5 h-5' }),
          descripcion: 'Creación rápida optimizada para móvil',
          accion: () => { window.location.href = '/contratos/movil/express' }, relevancia: 90,
        });
      }
    }

    if (textoLower.includes('buscar') || textoLower.includes('encontrar') || textoLower.match(/cliente\s+\w+/)) {
      const clienteMatch = textoLower.match(/cliente\s+(\w+)/);
      if (clienteMatch) {
        comandos.push({
          id: 'buscar-cliente', texto: `Buscar cliente "${clienteMatch[1]}"`, tipo: 'busqueda',
          icono: React.createElement(Users, { className: 'w-5 h-5' }),
          descripcion: 'Busca contratos y datos del cliente',
          accion: () => {}, relevancia: 92,
        });
      }
      comandos.push({
        id: 'buscar-avanzada', texto: 'Búsqueda Avanzada con IA', tipo: 'busqueda',
        icono: React.createElement(Brain, { className: 'w-5 h-5' }),
        descripcion: 'Búsqueda semántica inteligente', atajo: '⌘ + F',
        accion: () => {}, relevancia: 85,
      });
    }

    if (textoLower.includes('analizar') || textoLower.includes('predecir') || textoLower.includes('tendencia')) {
      comandos.push({
        id: 'analisis-prediccion', texto: 'Análisis Predictivo IA', tipo: 'analisis',
        icono: React.createElement(Brain, { className: 'w-5 h-5' }),
        descripcion: 'Ejecuta análisis predictivo con Cortex-Flow',
        accion: () => { window.location.href = '/contratos/analytics' }, relevancia: 90,
      });
      comandos.push({
        id: 'analisis-riesgo', texto: 'Análisis de Riesgo de Cartera', tipo: 'analisis',
        icono: React.createElement(AlertCircle, { className: 'w-5 h-5' }),
        descripcion: 'Evalúa riesgo de toda la cartera',
        accion: () => {}, relevancia: 85,
      });
    }

    if (textoLower.includes('aprobar') || textoLower.includes('firmar')) {
      comandos.push({
        id: 'ver-pendientes', texto: 'Ver Aprobaciones Pendientes', tipo: 'accion',
        icono: React.createElement(CheckCircle, { className: 'w-5 h-5' }),
        descripcion: 'Muestra contratos esperando tu aprobación', atajo: '⌘ + A',
        accion: () => {}, relevancia: 95,
      });
    }

    if (textoLower.includes('factura') || textoLower.includes('cobrar')) {
      comandos.push({
        id: 'ir-facturacion', texto: 'Ir a Facturación', tipo: 'navegacion',
        icono: React.createElement(DollarSign, { className: 'w-5 h-5' }),
        descripcion: 'Panel de facturación y OC',
        accion: () => {}, relevancia: 90,
      });
    }

    if (comandos.length === 0 && texto.length > 0) {
      comandos.push({
        id: 'ai-help', texto: `Interpretar: "${texto}"`, tipo: 'analisis',
        icono: React.createElement(Sparkles, { className: 'w-5 h-5' }),
        descripcion: 'Deja que la IA interprete tu solicitud',
        accion: () => this.interpretarConIA(texto), relevancia: 70,
      });
    }

    return comandos.sort((a, b) => (b.relevancia ?? 0) - (a.relevancia ?? 0));
  }

  generarSugerencias(): SugerenciaIA[] {
    const hora = new Date().getHours();
    const sugerencias: SugerenciaIA[] = [];

    if (hora >= 8 && hora < 10) {
      sugerencias.push({
        id: 'morning-review', tipo: 'recordatorio',
        titulo: '🌅 Revisión Matutina',
        descripcion: 'Tienes 5 contratos esperando aprobación y 2 renovaciones próximas.',
        prioridad: 'alta', accionSugerida: 'Revisar pendientes',
      });
    }
    if (hora >= 15 && hora < 17) {
      sugerencias.push({
        id: 'afternoon-followup', tipo: 'recordatorio',
        titulo: '📞 Seguimiento de la Tarde',
        descripcion: '3 clientes tienen facturas vencidas hace más de 30 días.',
        prioridad: 'media', accionSugerida: 'Llamar clientes',
      });
    }
    sugerencias.push(
      {
        id: 'oportunidad-upsell', tipo: 'oportunidad',
        titulo: '💡 Oportunidad de Upsell',
        descripcion: 'Cliente "Banco Chile" aumentó inversión 40% en competencia.',
        prioridad: 'alta', accionSugerida: 'Generar propuesta',
      },
      {
        id: 'prediccion-renovacion', tipo: 'prediccion',
        titulo: '🔮 Predicción: Renovación en Riesgo',
        descripcion: 'Contrato "Falabella Q1" tiene 68% probabilidad de no renovar.',
        prioridad: 'alta', accionSugerida: 'Agendar reunión',
      },
      {
        id: 'alerta-vencimiento', tipo: 'alerta',
        titulo: '⚠️ 3 Contratos Vencen Esta Semana',
        descripcion: 'Banco Estado, Ripley, Latam tienen vencimiento en los próximos 7 días.',
        prioridad: 'alta', accionSugerida: 'Ver contratos',
      },
    );
    return sugerencias;
  }

  obtenerComandosRapidos(): ComandoIA[] {
    return [
      { id: 'quick-nuevo', texto: 'Nuevo Contrato', tipo: 'creacion', icono: React.createElement(Plus, { className: 'w-5 h-5' }), descripcion: 'Crear contrato', atajo: '⌘N', accion: () => { window.location.href = '/contratos/nuevo' } },
      { id: 'quick-pipeline', texto: 'Pipeline', tipo: 'navegacion', icono: React.createElement(BarChart3, { className: 'w-5 h-5' }), descripcion: 'Ver pipeline', atajo: '⌘P', accion: () => { window.location.href = '/contratos/pipeline' } },
      { id: 'quick-aprobar', texto: 'Aprobar', tipo: 'accion', icono: React.createElement(CheckCircle, { className: 'w-5 h-5' }), descripcion: 'Pendientes', atajo: '⌘A', accion: () => {} },
      { id: 'quick-buscar', texto: 'Buscar', tipo: 'busqueda', icono: React.createElement(Search, { className: 'w-5 h-5' }), descripcion: 'Búsqueda rápida', atajo: '⌘F', accion: () => {} },
      { id: 'quick-analytics', texto: 'Analytics', tipo: 'analisis', icono: React.createElement(Brain, { className: 'w-5 h-5' }), descripcion: 'Ver analytics', atajo: '⌘I', accion: () => { window.location.href = '/contratos/analytics' } },
    ];
  }

  private interpretarConIA(_texto: string): void {
    // Placeholder for future AI integration
  }
}

// ─── Priority/type helpers (shared between modal and center) ─────

export function getPriorityColor(prioridad: string): string {
  switch (prioridad) {
    case 'alta': return 'bg-red-100 text-red-700';
    case 'media': return 'bg-amber-100 text-amber-700';
    case 'baja': return 'bg-green-100 text-green-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

export function getTipoIcon(tipo: string): React.ReactNode {
  switch (tipo) {
    case 'alerta': return React.createElement(AlertCircle, { className: 'w-5 h-5 text-red-500' });
    case 'oportunidad': return React.createElement(Target, { className: 'w-5 h-5 text-green-500' });
    case 'recordatorio': return React.createElement(Clock, { className: 'w-5 h-5 text-amber-500' });
    case 'prediccion': return React.createElement(Brain, { className: 'w-5 h-5 text-purple-500' });
    default: return React.createElement(Sparkles, { className: 'w-5 h-5 text-indigo-500' });
  }
}
