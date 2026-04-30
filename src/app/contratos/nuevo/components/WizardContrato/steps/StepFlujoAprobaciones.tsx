/**
 * ✅ SILEXAR PULSE - Step 4: Flujo de Aprobaciones TIER 0
 *
 * @description Paso 4 con sistema de aprobaciones multinivel automático,
 * escalamiento inteligente y notificaciones push.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Crown,
  Info,
  Mail,
  MessageSquare,
  Shield,
  Smartphone,
  Star,
  Timer,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type NivelAprobacion =
  | "AUTOMATICO"
  | "SUPERVISOR"
  | "GERENTE_COMERCIAL"
  | "GERENTE_GENERAL"
  | "DIRECTORIO";

export interface Aprobador {
  id: string;
  nombre: string;
  cargo: string;
  email: string;
  telefono?: string;
  avatar?: string;
  disponible: boolean;
  tiempoRespuestaPromedio: number; // minutos
}

export interface NivelAprobacionConfig {
  nivel: NivelAprobacion;
  orden: number;
  icono: React.ReactNode;
  color: string;
  bgColor: string;
  tiempoLimite: number; // horas
  aprobadores: Aprobador[];
  requiereJustificacion: boolean;
  puedeDelegar: boolean;
}

export interface FactorEscalamiento {
  nombre: string;
  activo: boolean;
  descripcion: string;
  impacto: NivelAprobacion;
  icono: React.ReactNode;
}

export interface AprobacionPendiente {
  nivelId: NivelAprobacion;
  aprobadorId?: string;
  estado: "PENDIENTE" | "EN_PROGRESO" | "APROBADO" | "RECHAZADO" | "ESCALADO";
  fechaAsignacion?: Date;
  fechaLimite?: Date;
  fechaRespuesta?: Date;
  comentario?: string;
}

interface StepFlujoAprobacionesProps {
  datos: {
    valorContrato: number;
    descuento: number;
    diasPago: number;
    scoreRiesgo: number;
    esNuevoCliente: boolean;
    tieneExclusividad: boolean;
  };
  onChange: (datos: Record<string, unknown>) => void;
  onValidationChange?: (isValid: boolean) => void;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE NIVELES
// ═══════════════════════════════════════════════════════════════

const nivelesAprobacion: NivelAprobacionConfig[] = [
  {
    nivel: "AUTOMATICO",
    orden: 0,
    icono: <Zap className="w-5 h-5" />,
    color: "text-[#6888ff]",
    bgColor: "bg-[#6888ff]/10",
    tiempoLimite: 0,
    aprobadores: [],
    requiereJustificacion: false,
    puedeDelegar: false,
  },
  {
    nivel: "SUPERVISOR",
    orden: 1,
    icono: <User className="w-5 h-5" />,
    color: "text-[#6888ff]",
    bgColor: "bg-[#6888ff]/10",
    tiempoLimite: 2,
    aprobadores: [
      {
        id: "sup-001",
        nombre: "María López",
        cargo: "Supervisora Comercial",
        email: "mlopez@silexar.cl",
        disponible: true,
        tiempoRespuestaPromedio: 25,
      },
      {
        id: "sup-002",
        nombre: "Roberto Díaz",
        cargo: "Supervisor Comercial",
        email: "rdiaz@silexar.cl",
        disponible: true,
        tiempoRespuestaPromedio: 35,
      },
    ],
    requiereJustificacion: false,
    puedeDelegar: true,
  },
  {
    nivel: "GERENTE_COMERCIAL",
    orden: 2,
    icono: <Building2 className="w-5 h-5" />,
    color: "text-[#6888ff]",
    bgColor: "bg-[#6888ff]/10",
    tiempoLimite: 4,
    aprobadores: [
      {
        id: "gc-001",
        nombre: "Carolina Muñoz",
        cargo: "Gerente Comercial",
        email: "cmunoz@silexar.cl",
        disponible: true,
        tiempoRespuestaPromedio: 45,
      },
    ],
    requiereJustificacion: true,
    puedeDelegar: true,
  },
  {
    nivel: "GERENTE_GENERAL",
    orden: 3,
    icono: <Crown className="w-5 h-5" />,
    color: "text-[#6888ff]",
    bgColor: "bg-[#6888ff]/10",
    tiempoLimite: 24,
    aprobadores: [
      {
        id: "gg-001",
        nombre: "Andrés Vargas",
        cargo: "Gerente General",
        email: "avargas@silexar.cl",
        disponible: true,
        tiempoRespuestaPromedio: 180,
      },
    ],
    requiereJustificacion: true,
    puedeDelegar: false,
  },
  {
    nivel: "DIRECTORIO",
    orden: 4,
    icono: <Star className="w-5 h-5" />,
    color: "text-[#9aa3b8]",
    bgColor: "bg-[#dfeaff]",
    tiempoLimite: 48,
    aprobadores: [
      {
        id: "dir-001",
        nombre: "Directorio Ejecutivo",
        cargo: "Directorio",
        email: "directorio@silexar.cl",
        disponible: true,
        tiempoRespuestaPromedio: 360,
      },
    ],
    requiereJustificacion: true,
    puedeDelegar: false,
  },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
};

const NivelCard: React.FC<{
  config: NivelAprobacionConfig;
  estado: "pendiente" | "actual" | "completado" | "omitido";
  aprobacion?: AprobacionPendiente;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}> = ({ config, estado, aprobacion: _aprobacion }) => {
  const [expandido, setExpandido] = useState(estado === "actual");

  return (
    <motion.div
      layout
      className={`rounded-xl border-2 overflow-hidden transition-all ${
        estado === "completado"
          ? "border-[#bec8de] bg-[#6888ff]/5"
          : estado === "actual"
          ? "border-[#bec8de] bg-[#6888ff15] shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]"
          : estado === "omitido"
          ? "border-[#bec8de40] bg-[#dfeaff] opacity-50"
          : "border-[#bec8de40] bg-[#dfeaff]"
      }`}
    >
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full p-4 flex items-center gap-4 text-left"
      >
        <div className={`p-3 rounded-xl ${config.bgColor}`}>
          <span className={config.color}>{config.icono}</span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-[#69738c]">
              {config.nivel === "AUTOMATICO"
                ? "Aprobación Automática"
                : config.nivel === "SUPERVISOR"
                ? "Supervisor"
                : config.nivel === "GERENTE_COMERCIAL"
                ? "Gerente Comercial"
                : config.nivel === "GERENTE_GENERAL"
                ? "Gerente General"
                : "Directorio"}
            </h4>
            {estado === "completado" && (
              <CheckCircle2 className="w-5 h-5 text-[#6888ff]" />
            )}
            {estado === "actual" && (
              <Clock className="w-5 h-5 text-[#6888ff] animate-pulse" />
            )}
          </div>
          <p className="text-sm text-[#9aa3b8]">
            {config.nivel === "AUTOMATICO"
              ? "Sin intervención humana requerida"
              : `Tiempo límite: ${config.tiempoLimite}h • ${config.aprobadores.length} aprobador(es)`}
          </p>
        </div>

        {config.nivel !== "AUTOMATICO" && (
          <ChevronDown
            className={`w-5 h-5 text-[#9aa3b8] transition-transform ${
              expandido ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      <AnimatePresence>
        {expandido && config.nivel !== "AUTOMATICO" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[#bec8de40] p-4"
          >
            <div className="space-y-3">
              {config.aprobadores.map((aprobador) => (
                <div
                  key={aprobador.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#dfeaff] border border-[#bec8de40]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6888ff] to-[#5572ee] flex items-center justify-center text-white font-bold">
                      {aprobador.nombre.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-[#69738c]">
                        {aprobador.nombre}
                      </p>
                      <p className="text-sm text-[#9aa3b8]">
                        {aprobador.cargo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        aprobador.disponible
                          ? "bg-[#6888ff]/10 text-[#6888ff]"
                          : "bg-[#6888ff]/10 text-[#6888ff]"
                      }`}
                    >
                      {aprobador.disponible ? "Disponible" : "Ocupado"}
                    </span>
                    <span className="text-xs text-[#9aa3b8]">
                      ~{aprobador.tiempoRespuestaPromedio}min
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Info adicional */}
            <div className="mt-4 p-3 rounded-lg bg-[#dfeaff]">
              <div className="flex items-center gap-4 text-sm text-[#69738c]">
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span>Límite: {config.tiempoLimite}h</span>
                </div>
                {config.requiereJustificacion && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>Requiere justificación</span>
                  </div>
                )}
                {config.puedeDelegar && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Puede delegar</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FactorEscalamientoCard: React.FC<{ factor: FactorEscalamiento }> = (
  { factor },
) => (
  <div
    className={`p-3 rounded-lg border ${
      factor.activo
        ? "bg-[#6888ff]/5 border-[#bec8de]"
        : "bg-[#dfeaff] border-[#bec8de40]"
    }`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-lg ${
          factor.activo ? "bg-[#6888ff]/10" : "bg-[#dfeaff]"
        }`}
      >
        {factor.icono}
      </div>
      <div className="flex-1">
        <p
          className={`font-medium ${
            factor.activo ? "text-[#6888ff]" : "text-[#69738c]"
          }`}
        >
          {factor.nombre}
        </p>
        <p className="text-xs text-[#9aa3b8]">{factor.descripcion}</p>
      </div>
      {factor.activo && (
        <span className="px-2 py-1 rounded-full bg-[#6888ff]/20 text-[#6888ff] text-xs font-medium">
          Activo
        </span>
      )}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function StepFlujoAprobaciones({
  datos,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange: _onChange,
  onValidationChange,
}: StepFlujoAprobacionesProps) {
  const [nivelesRequeridos, setNivelesRequeridos] = useState<NivelAprobacion[]>(
    [],
  );
  const [factoresEscalamiento, setFactoresEscalamiento] = useState<
    FactorEscalamiento[]
  >([]);
  const [notificacionesConfig, setNotificacionesConfig] = useState({
    email: true,
    push: true,
    sms: false,
  });
  const [analizando, setAnalizando] = useState(true);

  // Calcular niveles de aprobación requeridos
  useEffect(() => {
    setAnalizando(true);

    const timer = setTimeout(() => {
      const niveles: NivelAprobacion[] = [];
      const factores: FactorEscalamiento[] = [];
      const valor = datos.valorContrato;
      const descuento = datos.descuento;
      const diasPago = datos.diasPago;
      const riesgo = datos.scoreRiesgo;

      // Reglas base por valor
      if (valor <= 10000000 && riesgo >= 700) {
        niveles.push("AUTOMATICO");
      } else if (valor <= 50000000) {
        niveles.push("SUPERVISOR");
      } else if (valor <= 100000000) {
        niveles.push("SUPERVISOR", "GERENTE_COMERCIAL");
      } else if (valor <= 500000000) {
        niveles.push("SUPERVISOR", "GERENTE_COMERCIAL", "GERENTE_GENERAL");
      } else {
        niveles.push(
          "SUPERVISOR",
          "GERENTE_COMERCIAL",
          "GERENTE_GENERAL",
          "DIRECTORIO",
        );
      }

      // Factores de escalamiento
      factores.push({
        nombre: "Valor del contrato",
        activo: valor > 100000000,
        descripcion: `${formatCurrency(valor)} - ${
          valor > 500000000
            ? "Requiere Directorio"
            : valor > 100000000
            ? "Requiere Gerente General"
            : "Estándar"
        }`,
        impacto: valor > 500000000
          ? "DIRECTORIO"
          : valor > 100000000
          ? "GERENTE_GENERAL"
          : "SUPERVISOR",
        icono: <TrendingUp className="w-4 h-4 text-[#6888ff]" />,
      });

      if (descuento > 20) {
        factores.push({
          nombre: "Descuento > 20%",
          activo: true,
          descripcion: `Descuento del ${descuento}% excede política estándar`,
          impacto: "GERENTE_COMERCIAL",
          icono: <AlertTriangle className="w-4 h-4 text-[#6888ff]" />,
        });
        if (!niveles.includes("GERENTE_COMERCIAL")) {
          niveles.push("GERENTE_COMERCIAL");
        }
      }

      if (diasPago > 45) {
        factores.push({
          nombre: "Términos de pago > 45 días",
          activo: true,
          descripcion: `Plazo de ${diasPago} días requiere aprobación especial`,
          impacto: "GERENTE_COMERCIAL",
          icono: <Clock className="w-4 h-4 text-[#6888ff]" />,
        });
        if (!niveles.includes("GERENTE_COMERCIAL")) {
          niveles.push("GERENTE_COMERCIAL");
        }
      }

      if (riesgo < 600) {
        factores.push({
          nombre: "Cliente con score < 600",
          activo: true,
          descripcion:
            `Score de riesgo ${riesgo}/1000 requiere validación adicional`,
          impacto: "GERENTE_GENERAL",
          icono: <Shield className="w-4 h-4 text-[#9aa3b8]" />,
        });
        if (!niveles.includes("GERENTE_GENERAL")) {
          niveles.push("GERENTE_GENERAL");
        }
      }

      if (datos.esNuevoCliente) {
        factores.push({
          nombre: "Nuevo cliente sin historial",
          activo: true,
          descripcion: "Primera operación con el cliente",
          impacto: "SUPERVISOR",
          icono: <User className="w-4 h-4 text-[#6888ff]" />,
        });
      }

      if (datos.tieneExclusividad) {
        factores.push({
          nombre: "Exclusividades o términos especiales",
          activo: true,
          descripcion: "Contrato incluye cláusulas de exclusividad",
          impacto: "GERENTE_COMERCIAL",
          icono: <Star className="w-4 h-4 text-[#6888ff]" />,
        });
        if (!niveles.includes("GERENTE_COMERCIAL")) {
          niveles.push("GERENTE_COMERCIAL");
        }
      }

      // Ordenar niveles
      const nivelesOrdenados = Array.from(new Set(niveles)).sort((a, b) => {
        const ordenA = nivelesAprobacion.find((n) => n.nivel === a)?.orden || 0;
        const ordenB = nivelesAprobacion.find((n) => n.nivel === b)?.orden || 0;
        return ordenA - ordenB;
      });

      setNivelesRequeridos(nivelesOrdenados);
      setFactoresEscalamiento(factores);
      setAnalizando(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [datos]);

  // Validación
  useEffect(() => {
    onValidationChange?.(nivelesRequeridos.length > 0 || !analizando);
  }, [nivelesRequeridos, analizando, onValidationChange]);

  const tiempoEstimadoTotal = useMemo(() => {
    return nivelesRequeridos.reduce((acc, nivel) => {
      const config = nivelesAprobacion.find((n) => n.nivel === nivel);
      return acc + (config?.tiempoLimite || 0);
    }, 0);
  }, [nivelesRequeridos]);

  const esAprobacionAutomatica = nivelesRequeridos.length === 1 &&
    nivelesRequeridos[0] === "AUTOMATICO";

  return (
    <div className="space-y-6">
      {/* Panel de análisis */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-[#dfeaff] border border-[#bec8de40]"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-[#6888ff25]">
            <Shield className="w-5 h-5 text-[#6888ff]" />
          </div>
          <h3 className="text-lg font-semibold text-[#69738c]">
            ⚡ Configuración Automática de Aprobaciones
          </h3>
        </div>

        {analizando
          ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-[#6888ff30] border-t-indigo-500 animate-spin" />
              <p className="text-[#69738c]">
                Analizando requisitos de aprobación...
              </p>
              <p className="text-sm text-[#9aa3b8] mt-1">
                Evaluando valor, riesgo y términos
              </p>
            </div>
          )
          : (
            <div className="space-y-4">
              {/* Resultado */}
              <div
                className={`p-4 rounded-xl ${
                  esAprobacionAutomatica
                    ? "bg-[#6888ff]/10 border border-[#bec8de]"
                    : "bg-[#dfeaff] border border-[#bec8de40]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {esAprobacionAutomatica
                    ? (
                      <>
                        <Zap className="w-8 h-8 text-[#6888ff]" />
                        <div>
                          <p className="text-lg font-bold text-[#6888ff]">
                            ✅ Aprobación Automática
                          </p>
                          <p className="text-sm text-[#6888ff]">
                            El contrato cumple todos los criterios para
                            aprobación instantánea
                          </p>
                        </div>
                      </>
                    )
                    : (
                      <>
                        <Users className="w-8 h-8 text-[#6888ff]" />
                        <div>
                          <p className="text-lg font-bold text-[#69738c]">
                            {nivelesRequeridos.length}{" "}
                            nivel{nivelesRequeridos.length > 1 ? "es" : ""}{" "}
                            de aprobación requerido{nivelesRequeridos.length > 1
                              ? "s"
                              : ""}
                          </p>
                          <p className="text-sm text-[#9aa3b8]">
                            Tiempo estimado total:{" "}
                            <strong>{tiempoEstimadoTotal}h</strong> máximo
                          </p>
                        </div>
                      </>
                    )}
                </div>
              </div>

              {/* Factores de escalamiento */}
              {factoresEscalamiento.filter((f) => f.activo).length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[#69738c] mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#6888ff]" />
                    Factores que escalan automáticamente:
                  </p>
                  <div className="grid md:grid-cols-2 gap-2">
                    {factoresEscalamiento.filter((f) => f.activo).map((
                      factor,
                      idx,
                    ) => <FactorEscalamientoCard key={idx} factor={factor} />)}
                  </div>
                </div>
              )}
            </div>
          )}
      </motion.div>

      {/* Flujo de aprobaciones */}
      {!analizando && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#69738c] flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-[#6888ff]" />
            Flujo de Aprobaciones
          </h3>

          <div className="space-y-3">
            {nivelesAprobacion
              .filter((config) => nivelesRequeridos.includes(config.nivel))
              .map((config, idx) => (
                <NivelCard
                  key={config.nivel}
                  config={config}
                  estado={idx === 0 ? "actual" : "pendiente"}
                />
              ))}
          </div>
        </div>
      )}

      {/* Configuración de notificaciones */}
      {!analizando && !esAprobacionAutomatica && (
        <div className="p-6 rounded-2xl bg-[#dfeaff] border border-[#bec8de40]">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-[#6888ff]" />
            <h3 className="text-lg font-semibold text-[#69738c]">
              Notificaciones Push Críticas
            </h3>
          </div>

          <p className="text-sm text-[#69738c] mb-4">
            Los aprobadores recibirán notificación inmediata con contexto
            completo para decidir.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                id: "email",
                label: "Email",
                icon: <Mail className="w-5 h-5" />,
                desc: "Notificación por correo",
              },
              {
                id: "push",
                label: "Push Móvil",
                icon: <Smartphone className="w-5 h-5" />,
                desc: "Notificación instantánea",
              },
              {
                id: "sms",
                label: "SMS",
                icon: <MessageSquare className="w-5 h-5" />,
                desc: "Solo críticos",
              },
            ].map((canal) => (
              <button
                key={canal.id}
                onClick={() =>
                  setNotificacionesConfig((prev) => ({
                    ...prev,
                    [canal.id]: !prev[canal.id as keyof typeof prev],
                  }))}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  notificacionesConfig[
                      canal.id as keyof typeof notificacionesConfig
                    ]
                    ? "border-[#bec8de] bg-[#6888ff]/5"
                    : "border-[#bec8de40] hover:border-[#bec8de50]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={notificacionesConfig[
                        canal.id as keyof typeof notificacionesConfig
                      ]
                      ? "text-[#6888ff]"
                      : "text-[#9aa3b8]"}
                  >
                    {canal.icon}
                  </span>
                  <div>
                    <p className="font-medium text-[#69738c]">{canal.label}</p>
                    <p className="text-xs text-[#9aa3b8]">{canal.desc}</p>
                  </div>
                  {notificacionesConfig[
                    canal.id as keyof typeof notificacionesConfig
                  ] && (
                    <CheckCircle2 className="w-5 h-5 text-[#6888ff] ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Info de escalamiento */}
          <div className="mt-4 p-4 rounded-xl bg-[#6888ff15] border border-[#6888ff30]">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#6888ff] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#6888ff]">
                  Escalamiento automático
                </p>
                <p className="text-sm text-[#6888ff]">
                  Si un aprobador no responde dentro del tiempo límite, el
                  sistema escalará automáticamente al siguiente nivel para
                  evitar demoras.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen */}
      {!analizando && (
        <div className="p-4 rounded-xl bg-[#dfeaff] text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#9aa3b8] text-sm">
                Configuración de Aprobaciones
              </p>
              <p className="text-xl font-bold">
                {esAprobacionAutomatica
                  ? "Automática ⚡"
                  : `${nivelesRequeridos.length} niveles • ${tiempoEstimadoTotal}h máximo`}
              </p>
            </div>
            {!esAprobacionAutomatica && (
              <div className="flex items-center gap-2">
                {notificacionesConfig.email && (
                  <Mail className="w-5 h-5 text-[#6888ff]" />
                )}
                {notificacionesConfig.push && (
                  <Smartphone className="w-5 h-5 text-[#6888ff]" />
                )}
                {notificacionesConfig.sms && (
                  <MessageSquare className="w-5 h-5 text-[#6888ff]" />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
