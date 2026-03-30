/**
 * 🧠 SILEXAR PULSE - AI Command Center TIER 0
 * 
 * @description Centro de comandos inteligente con IA para
 * ejecutar acciones rápidas mediante lenguaje natural,
 * atajos de teclado y comandos de voz.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  Search,
  Sparkles,
  Zap,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Mic,
  MicOff,
  ArrowRight,
  Keyboard,
  Brain,
  Target,
  BarChart3,
  RefreshCw,
  Plus
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ComandoIA {
  id: string;
  texto: string;
  tipo: 'navegacion' | 'accion' | 'busqueda' | 'analisis' | 'creacion';
  icono: React.ReactNode;
  descripcion: string;
  atajo?: string;
  accion: () => void;
  relevancia?: number;
}

interface SugerenciaIA {
  id: string;
  tipo: 'alerta' | 'oportunidad' | 'recordatorio' | 'prediccion';
  titulo: string;
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
  accionSugerida?: string;
  datos?: Record<string, unknown>;
}

interface ContextoUsuario {
  ultimasAcciones: string[];
  contratoActivo?: string;
  clienteActivo?: string;
  horaActual: Date;
  cargaTrabajo: number;
  reunionesHoy: number;
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS NEUROMORPHIC
// ═══════════════════════════════════════════════════════════════

const neuro = {
  overlay: `
    fixed inset-0 z-50
    bg-slate-900/60 backdrop-blur-md
  `,
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
    text-white font-semibold
    rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]
    transition-all duration-200
  `,
  badge: `
    px-3 py-1
    rounded-lg
    shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    text-xs font-medium
  `
};

// ═══════════════════════════════════════════════════════════════
// MOTOR DE IA (SIMULADO)
// ═══════════════════════════════════════════════════════════════

class IACommandEngine {
  private contexto: ContextoUsuario;

  constructor() {
    this.contexto = {
      ultimasAcciones: [],
      horaActual: new Date(),
      cargaTrabajo: 75,
      reunionesHoy: 3
    };
  }

  /**
   * Procesa entrada de lenguaje natural y sugiere comandos
   */
  procesarEntrada(texto: string): ComandoIA[] {
    const textoLower = texto.toLowerCase();
    const comandos: ComandoIA[] = [];

    // Patrones de navegación
    if (textoLower.includes('ir a') || textoLower.includes('abrir') || textoLower.includes('ver')) {
      if (textoLower.includes('pipeline')) {
        comandos.push({
          id: 'nav-pipeline',
          texto: 'Ir a Pipeline de Contratos',
          tipo: 'navegacion',
          icono: <BarChart3 className="w-5 h-5" />,
          descripcion: 'Abre el pipeline Kanban de contratos',
          atajo: '⌘ + P',
          accion: () => window.location.href = '/contratos/pipeline',
          relevancia: 95
        });
      }
      if (textoLower.includes('dashboard') || textoLower.includes('inicio')) {
        comandos.push({
          id: 'nav-dashboard',
          texto: 'Ir a Dashboard',
          tipo: 'navegacion',
          icono: <TrendingUp className="w-5 h-5" />,
          descripcion: 'Panel principal con métricas',
          atajo: '⌘ + D',
          accion: () => window.location.href = '/contratos/dashboard',
          relevancia: 90
        });
      }
      if (textoLower.includes('renovacion') || textoLower.includes('renovar')) {
        comandos.push({
          id: 'nav-renovaciones',
          texto: 'Ir a Renovaciones',
          tipo: 'navegacion',
          icono: <RefreshCw className="w-5 h-5" />,
          descripcion: 'Panel de renovaciones predictivo',
          accion: () => window.location.href = '/contratos/renovaciones',
          relevancia: 88
        });
      }
    }

    // Patrones de creación
    if (textoLower.includes('crear') || textoLower.includes('nuevo') || textoLower.includes('agregar')) {
      if (textoLower.includes('contrato')) {
        comandos.push({
          id: 'crear-contrato',
          texto: 'Crear Nuevo Contrato',
          tipo: 'creacion',
          icono: <Plus className="w-5 h-5" />,
          descripcion: 'Inicia el wizard de creación de contrato',
          atajo: '⌘ + N',
          accion: () => window.location.href = '/contratos/nuevo',
          relevancia: 95
        });
      }
      if (textoLower.includes('express') || textoLower.includes('rapido')) {
        comandos.push({
          id: 'crear-express',
          texto: 'Contrato Express (Móvil)',
          tipo: 'creacion',
          icono: <Zap className="w-5 h-5" />,
          descripcion: 'Creación rápida optimizada para móvil',
          accion: () => window.location.href = '/contratos/movil/express',
          relevancia: 90
        });
      }
    }

    // Patrones de búsqueda
    if (textoLower.includes('buscar') || textoLower.includes('encontrar') || textoLower.match(/cliente\s+\w+/)) {
      const clienteMatch = textoLower.match(/cliente\s+(\w+)/);
      if (clienteMatch) {
        comandos.push({
          id: 'buscar-cliente',
          texto: `Buscar cliente "${clienteMatch[1]}"`,
          tipo: 'busqueda',
          icono: <Users className="w-5 h-5" />,
          descripcion: 'Busca contratos y datos del cliente',
          accion: () => {},
          relevancia: 92
        });
      }
      comandos.push({
        id: 'buscar-avanzada',
        texto: 'Búsqueda Avanzada con IA',
        tipo: 'busqueda',
        icono: <Brain className="w-5 h-5" />,
        descripcion: 'Búsqueda semántica inteligente',
        atajo: '⌘ + F',
        accion: () => {},
        relevancia: 85
      });
    }

    // Patrones de análisis
    if (textoLower.includes('analizar') || textoLower.includes('predecir') || textoLower.includes('tendencia')) {
      comandos.push({
        id: 'analisis-prediccion',
        texto: 'Análisis Predictivo IA',
        tipo: 'analisis',
        icono: <Brain className="w-5 h-5" />,
        descripcion: 'Ejecuta análisis predictivo con Cortex-Flow',
        accion: () => window.location.href = '/contratos/analytics',
        relevancia: 90
      });
      comandos.push({
        id: 'analisis-riesgo',
        texto: 'Análisis de Riesgo de Cartera',
        tipo: 'analisis',
        icono: <AlertCircle className="w-5 h-5" />,
        descripcion: 'Evalúa riesgo de toda la cartera',
        accion: () => {},
        relevancia: 85
      });
    }

    // Patrones de acciones rápidas
    if (textoLower.includes('aprobar') || textoLower.includes('firmar')) {
      comandos.push({
        id: 'ver-pendientes',
        texto: 'Ver Aprobaciones Pendientes',
        tipo: 'accion',
        icono: <CheckCircle className="w-5 h-5" />,
        descripcion: 'Muestra contratos esperando tu aprobación',
        atajo: '⌘ + A',
        accion: () => {},
        relevancia: 95
      });
    }

    if (textoLower.includes('factura') || textoLower.includes('cobrar')) {
      comandos.push({
        id: 'ir-facturacion',
        texto: 'Ir a Facturación',
        tipo: 'navegacion',
        icono: <DollarSign className="w-5 h-5" />,
        descripcion: 'Panel de facturación y OC',
        accion: () => {},
        relevancia: 90
      });
    }

    // Si no hay match específico, sugerir comandos populares
    if (comandos.length === 0 && texto.length > 0) {
      comandos.push(
        {
          id: 'ai-help',
          texto: `Interpretar: "${texto}"`,
          tipo: 'analisis',
          icono: <Sparkles className="w-5 h-5" />,
          descripcion: 'Deja que la IA interprete tu solicitud',
          accion: () => this.interpretarConIA(texto),
          relevancia: 70
        }
      );
    }

    // Ordenar por relevancia
    return comandos.sort((a, b) => (b.relevancia || 0) - (a.relevancia || 0));
  }

  /**
   * Genera sugerencias proactivas basadas en contexto
   */
  generarSugerencias(): SugerenciaIA[] {
    const hora = new Date().getHours();
    const sugerencias: SugerenciaIA[] = [];

    // Sugerencias basadas en hora
    if (hora >= 8 && hora < 10) {
      sugerencias.push({
        id: 'morning-review',
        tipo: 'recordatorio',
        titulo: '🌅 Revisión Matutina',
        descripcion: 'Tienes 5 contratos esperando aprobación y 2 renovaciones próximas.',
        prioridad: 'alta',
        accionSugerida: 'Revisar pendientes'
      });
    }

    if (hora >= 15 && hora < 17) {
      sugerencias.push({
        id: 'afternoon-followup',
        tipo: 'recordatorio',
        titulo: '📞 Seguimiento de la Tarde',
        descripcion: '3 clientes tienen facturas vencidas hace más de 30 días.',
        prioridad: 'media',
        accionSugerida: 'Llamar clientes'
      });
    }

    // Sugerencias de oportunidad
    sugerencias.push({
      id: 'oportunidad-upsell',
      tipo: 'oportunidad',
      titulo: '💡 Oportunidad de Upsell',
      descripcion: 'Cliente "Banco Chile" aumentó inversión 40% en competencia. Momento ideal para propuesta.',
      prioridad: 'alta',
      accionSugerida: 'Generar propuesta'
    });

    // Predicciones
    sugerencias.push({
      id: 'prediccion-renovacion',
      tipo: 'prediccion',
      titulo: '🔮 Predicción: Renovación en Riesgo',
      descripcion: 'Contrato "Falabella Q1" tiene 68% probabilidad de no renovar según análisis de engagement.',
      prioridad: 'alta',
      accionSugerida: 'Agendar reunión'
    });

    // Alertas
    sugerencias.push({
      id: 'alerta-vencimiento',
      tipo: 'alerta',
      titulo: '⚠️ 3 Contratos Vencen Esta Semana',
      descripcion: 'Banco Estado, Ripley, Latam tienen vencimiento en los próximos 7 días.',
      prioridad: 'alta',
      accionSugerida: 'Ver contratos'
    });

    return sugerencias;
  }

  /**
   * Interpreta solicitud con IA cuando no hay match directo
   */
  private interpretarConIA(texto: string): void {
    ;
    // Aquí iría la integración con modelo de lenguaje
  }

  /**
   * Obtiene comandos rápidos frecuentes
   */
  obtenerComandosRapidos(): ComandoIA[] {
    return [
      {
        id: 'quick-nuevo',
        texto: 'Nuevo Contrato',
        tipo: 'creacion',
        icono: <Plus className="w-5 h-5" />,
        descripcion: 'Crear contrato',
        atajo: '⌘N',
        accion: () => window.location.href = '/contratos/nuevo',
      },
      {
        id: 'quick-pipeline',
        texto: 'Pipeline',
        tipo: 'navegacion',
        icono: <BarChart3 className="w-5 h-5" />,
        descripcion: 'Ver pipeline',
        atajo: '⌘P',
        accion: () => window.location.href = '/contratos/pipeline',
      },
      {
        id: 'quick-aprobar',
        texto: 'Aprobar',
        tipo: 'accion',
        icono: <CheckCircle className="w-5 h-5" />,
        descripcion: 'Pendientes',
        atajo: '⌘A',
        accion: () => {},
      },
      {
        id: 'quick-buscar',
        texto: 'Buscar',
        tipo: 'busqueda',
        icono: <Search className="w-5 h-5" />,
        descripcion: 'Búsqueda rápida',
        atajo: '⌘F',
        accion: () => {},
      },
      {
        id: 'quick-analytics',
        texto: 'Analytics',
        tipo: 'analisis',
        icono: <Brain className="w-5 h-5" />,
        descripcion: 'Ver analytics',
        atajo: '⌘I',
        accion: () => window.location.href = '/contratos/analytics',
      }
    ];
  }
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE AI COMMAND CENTER
// ═══════════════════════════════════════════════════════════════

export function AICommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [comandos, setComandos] = useState<ComandoIA[]>([]);
  const [sugerencias, setSugerencias] = useState<SugerenciaIA[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<'comandos' | 'sugerencias'>('comandos');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef(new IACommandEngine());

  // Keyboard shortcut para abrir (CMD/CTRL + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSugerencias(engineRef.current.generarSugerencias());
    }
  }, [isOpen]);

  // Procesar query
  useEffect(() => {
    if (query.trim()) {
      const results = engineRef.current.procesarEntrada(query);
      setComandos(results);
    } else {
      setComandos(engineRef.current.obtenerComandosRapidos());
    }
    setSelectedIndex(0);
  }, [query]);

  // Navegación con teclado
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = activeTab === 'comandos' ? comandos : sugerencias;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && comandos[selectedIndex]) {
      e.preventDefault();
      comandos[selectedIndex].accion();
      setIsOpen(false);
    }
  }, [comandos, sugerencias, selectedIndex, activeTab]);

  // Toggle voice input (simulado)
  const toggleVoice = () => {
    setIsListening(prev => !prev);
    if (!isListening) {
      // Simular reconocimiento de voz
      setTimeout(() => {
        setQuery('crear contrato para cliente nuevo');
        setIsListening(false);
      }, 2000);
    }
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-700';
      case 'media': return 'bg-amber-100 text-amber-700';
      case 'baja': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'alerta': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'oportunidad': return <Target className="w-5 h-5 text-green-500" />;
      case 'recordatorio': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'prediccion': return <Brain className="w-5 h-5 text-purple-500" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={neuro.overlay}
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`${neuro.modal} w-full max-w-2xl mx-auto mt-[15vh]`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con input */}
          <div className="p-5 pb-3">
            <div className={`${neuro.input} flex items-center gap-3 px-5 py-4`}>
              {isListening ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Mic className="w-5 h-5 text-red-500" />
                </motion.div>
              ) : (
                <Command className="w-5 h-5 text-indigo-500" />
              )}
              
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Escuchando..." : "Escribe un comando o pregunta a la IA..."}
                className="flex-1 bg-transparent text-lg text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-xl transition-all ${
                  isListening 
                    ? 'bg-red-100 text-red-600' 
                    : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Keyboard className="w-4 h-4" />
                <span>ESC</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-5 flex gap-2">
            <button
              onClick={() => setActiveTab('comandos')}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'comandos'
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Comandos
              </div>
            </button>
            <button
              onClick={() => setActiveTab('sugerencias')}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'sugerencias'
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Sugerencias IA
                {sugerencias.filter(s => s.prioridad === 'alta').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="p-5 max-h-[50vh] overflow-y-auto">
            {activeTab === 'comandos' ? (
              <div className="space-y-2">
                {query === '' && (
                  <p className="text-xs text-slate-400 mb-3 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Acciones rápidas
                  </p>
                )}
                
                {comandos.map((cmd, idx) => (
                  <motion.button
                    key={cmd.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      cmd.accion();
                      setIsOpen(false);
                    }}
                    className={`w-full ${neuro.card} ${neuro.cardHover} p-4 flex items-center gap-4 ${
                      idx === selectedIndex ? 'ring-2 ring-indigo-400 ring-offset-2' : ''
                    }`}
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${
                      cmd.tipo === 'creacion' ? 'from-green-400 to-emerald-500' :
                      cmd.tipo === 'navegacion' ? 'from-blue-400 to-cyan-500' :
                      cmd.tipo === 'accion' ? 'from-amber-400 to-orange-500' :
                      cmd.tipo === 'analisis' ? 'from-purple-400 to-pink-500' :
                      'from-indigo-400 to-purple-500'
                    } text-white`}>
                      {cmd.icono}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-slate-800">{cmd.texto}</p>
                      <p className="text-sm text-slate-500">{cmd.descripcion}</p>
                    </div>
                    
                    {cmd.atajo && (
                      <div className={`${neuro.badge} bg-slate-50 text-slate-600`}>
                        {cmd.atajo}
                      </div>
                    )}
                    
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 mb-3 flex items-center gap-2">
                  <Brain className="w-3 h-3" />
                  Sugerencias inteligentes basadas en tu contexto
                </p>
                
                {sugerencias.map((sug, idx) => (
                  <motion.div
                    key={sug.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`${neuro.card} p-4`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getTipoIcon(sug.tipo)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-800">{sug.titulo}</h4>
                          <span className={`${neuro.badge} ${getPriorityColor(sug.prioridad)}`}>
                            {sug.prioridad}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{sug.descripcion}</p>
                        
                        {sug.accionSugerida && (
                          <button className={`${neuro.btnPrimary} px-4 py-2 text-sm flex items-center gap-2`}>
                            <Zap className="w-4 h-4" />
                            {sug.accionSugerida}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Keyboard className="w-3 h-3" />
                ↑↓ navegar
              </span>
              <span className="flex items-center gap-1">
                ↵ seleccionar
              </span>
              <span className="flex items-center gap-1">
                <Mic className="w-3 h-3" /> voz
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>Powered by Cortex-Flow AI</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// TRIGGER BUTTON (para abrir el command center)
// ═══════════════════════════════════════════════════════════════

export function AICommandTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 right-6 z-40
          p-4 rounded-2xl
          bg-gradient-to-br from-indigo-500 to-purple-600
          text-white
          shadow-[8px_8px_20px_rgba(99,102,241,0.4),-4px_-4px_12px_rgba(255,255,255,0.1)]
          hover:shadow-[4px_4px_12px_rgba(99,102,241,0.5),0_0_40px_rgba(99,102,241,0.3)]
          transition-all duration-300
          group
        `}
      >
        <div className="flex items-center gap-2">
          <Command className="w-6 h-6" />
          <span className="hidden group-hover:inline font-medium">⌘K</span>
        </div>
      </button>

      {isOpen && <AICommandCenterModal onClose={() => setIsOpen(false)} />}
    </>
  );
}

// Modal wrapper
function AICommandCenterModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [comandos, setComandos] = useState<ComandoIA[]>([]);
  const [sugerencias, setSugerencias] = useState<SugerenciaIA[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<'comandos' | 'sugerencias'>('comandos');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef(new IACommandEngine());

  useEffect(() => {
    inputRef.current?.focus();
    setSugerencias(engineRef.current.generarSugerencias());
    setComandos(engineRef.current.obtenerComandosRapidos());
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const results = engineRef.current.procesarEntrada(query);
      setComandos(results);
    } else {
      setComandos(engineRef.current.obtenerComandosRapidos());
    }
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, comandos.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && comandos[selectedIndex]) {
      e.preventDefault();
      comandos[selectedIndex].accion();
      onClose();
    }
  };

  const toggleVoice = () => {
    setIsListening(prev => !prev);
    if (!isListening) {
      setTimeout(() => {
        setQuery('crear contrato para cliente nuevo');
        setIsListening(false);
      }, 2000);
    }
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-700';
      case 'media': return 'bg-amber-100 text-amber-700';
      case 'baja': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'alerta': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'oportunidad': return <Target className="w-5 h-5 text-green-500" />;
      case 'recordatorio': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'prediccion': return <Brain className="w-5 h-5 text-purple-500" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={neuro.overlay}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`${neuro.modal} w-full max-w-2xl mx-auto mt-[15vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-3">
          <div className={`${neuro.input} flex items-center gap-3 px-5 py-4`}>
            {isListening ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                <Mic className="w-5 h-5 text-red-500" />
              </motion.div>
            ) : (
              <Command className="w-5 h-5 text-indigo-500" />
            )}
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Escuchando..." : "Escribe un comando o pregunta a la IA..."}
              className="flex-1 bg-transparent text-lg text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            
            <button
              onClick={toggleVoice}
              className={`p-2 rounded-xl transition-all ${
                isListening ? 'bg-red-100 text-red-600' : 'hover:bg-slate-100 text-slate-400'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 flex gap-2">
          <button
            onClick={() => setActiveTab('comandos')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'comandos'
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Comandos
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sugerencias')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'sugerencias'
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Sugerencias IA
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[50vh] overflow-y-auto">
          {activeTab === 'comandos' ? (
            <div className="space-y-2">
              {comandos.map((cmd, idx) => (
                <motion.button
                  key={cmd.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => { cmd.accion(); onClose(); }}
                  className={`w-full ${neuro.card} ${neuro.cardHover} p-4 flex items-center gap-4 ${
                    idx === selectedIndex ? 'ring-2 ring-indigo-400 ring-offset-2' : ''
                  }`}
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${
                    cmd.tipo === 'creacion' ? 'from-green-400 to-emerald-500' :
                    cmd.tipo === 'navegacion' ? 'from-blue-400 to-cyan-500' :
                    cmd.tipo === 'accion' ? 'from-amber-400 to-orange-500' :
                    'from-purple-400 to-pink-500'
                  } text-white`}>
                    {cmd.icono}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-800">{cmd.texto}</p>
                    <p className="text-sm text-slate-500">{cmd.descripcion}</p>
                  </div>
                  {cmd.atajo && (
                    <div className={`${neuro.badge} bg-slate-50 text-slate-600`}>{cmd.atajo}</div>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {sugerencias.map((sug, idx) => (
                <motion.div
                  key={sug.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`${neuro.card} p-4`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getTipoIcon(sug.tipo)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800">{sug.titulo}</h4>
                        <span className={`${neuro.badge} ${getPriorityColor(sug.prioridad)}`}>
                          {sug.prioridad}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{sug.descripcion}</p>
                      {sug.accionSugerida && (
                        <button className={`${neuro.btnPrimary} px-4 py-2 text-sm flex items-center gap-2`}>
                          <Zap className="w-4 h-4" />
                          {sug.accionSugerida}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>↑↓ navegar</span>
            <span>↵ seleccionar</span>
            <span>ESC cerrar</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>Cortex-Flow AI</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AICommandTrigger;
