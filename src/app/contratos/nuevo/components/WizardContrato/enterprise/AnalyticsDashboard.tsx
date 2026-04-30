/**
 * 📊 SILEXAR PULSE - Dashboard de Analytics TIER 0
 *
 * @description Panel de analytics con métricas en tiempo real,
 * predicciones IA y alertas inteligentes.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  FileText,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  AlertaInteligente,
  ContractAnalyticsDashboard,
  PrediccionRenovacion,
} from "../types/enterprise.types";

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockAnalytics: ContractAnalyticsDashboard = {
  metricas: {
    valorTotalContratos: 2850000000,
    valorContratosMes: 450000000,
    contratosPorEstado: {
      borrador: 5,
      revision_interna: 3,
      revision_legal: 2,
      negociacion: 4,
      pendiente_cliente: 6,
      aprobacion_interna: 2,
      aprobacion_cliente: 3,
      firmado: 8,
      activo: 45,
      en_ejecucion: 38,
      pausa_temporal: 2,
      disputa: 1,
      renovacion: 5,
      enmienda: 2,
      cierre: 4,
      finalizado: 120,
      cancelado: 8,
      archivado: 85,
    },
    tiempoPromedioCreacion: 45,
    tiempoPromedioAprobacion: 18,
    tiempoPromedioNegociacion: 5,
    tasaConversion: 78,
  },
  predicciones: {
    renovaciones: [
      {
        contratoId: "c-001",
        numeroContrato: "CON-2024-00145",
        clienteNombre: "Banco Nacional S.A.",
        fechaVencimientos: new Date("2025-02-15"),
        probabilidadRenovacion: 92,
        factoresPositivos: ["Excelente historial", "Alta satisfacción"],
        factoresNegativos: [],
        accionRecomendada: "Iniciar negociación proactiva",
        valorEstimadoRenovacion: 180000000,
        confianza: 95,
      },
      {
        contratoId: "c-002",
        numeroContrato: "CON-2024-00189",
        clienteNombre: "SuperMax SpA",
        fechaVencimientos: new Date("2025-01-31"),
        probabilidadRenovacion: 75,
        factoresPositivos: ["Cliente recurrente"],
        factoresNegativos: ["Reducción de presupuesto"],
        accionRecomendada: "Ofrecer paquete ajustado",
        valorEstimadoRenovacion: 65000000,
        confianza: 80,
      },
      {
        contratoId: "c-003",
        numeroContrato: "CON-2024-00201",
        clienteNombre: "TechStart SpA",
        fechaVencimientos: new Date("2025-03-01"),
        probabilidadRenovacion: 45,
        factoresPositivos: [],
        factoresNegativos: ["Startup en reestructuración", "Pagos retrasados"],
        accionRecomendada: "Contactar para evaluar continuidad",
        valorEstimadoRenovacion: 15000000,
        confianza: 70,
      },
    ],
    riesgoPago: [],
    oportunidadesUpsell: [],
    churnProbability: [],
  },
  rentabilidad: {
    porCliente: [],
    porMedio: [],
    porEjecutivo: [],
    tendenciaMensual: [
      {
        mes: "Jul",
        ingresos: 380000000,
        margen: 32,
        contratos: 12,
        variacionMensual: 5,
      },
      {
        mes: "Ago",
        ingresos: 420000000,
        margen: 35,
        contratos: 15,
        variacionMensual: 10,
      },
      {
        mes: "Sep",
        ingresos: 390000000,
        margen: 28,
        contratos: 11,
        variacionMensual: -7,
      },
      {
        mes: "Oct",
        ingresos: 450000000,
        margen: 34,
        contratos: 14,
        variacionMensual: 15,
      },
      {
        mes: "Nov",
        ingresos: 480000000,
        margen: 36,
        contratos: 16,
        variacionMensual: 7,
      },
      {
        mes: "Dic",
        ingresos: 450000000,
        margen: 33,
        contratos: 13,
        variacionMensual: -6,
      },
    ],
  },
  alertas: [
    {
      id: "a-001",
      tipo: "renovacion_pendiente",
      titulo: "Renovación próxima: Banco Nacional",
      descripcion:
        "Contrato vence en 45 días. Alta probabilidad de renovación.",
      urgencia: "alta",
      fechaGeneracion: new Date(),
      contratoId: "c-001",
      accionSugerida: "Iniciar conversación",
      leida: false,
      descartada: false,
    },
    {
      id: "a-002",
      tipo: "vencimientos_obligacion",
      titulo: "Material pendiente: SuperMax",
      descripcion: "El cliente debe entregar material creativo en 3 días.",
      urgencia: "media",
      fechaGeneracion: new Date(),
      contratoId: "c-002",
      accionSugerida: "Enviar recordatorio",
      leida: false,
      descartada: false,
    },
    {
      id: "a-003",
      tipo: "riesgo_pago",
      titulo: "Alerta de pago: TechStart",
      descripcion: "Factura con 15 días de atraso.",
      urgencia: "critica",
      fechaGeneracion: new Date(),
      contratoId: "c-003",
      accionSugerida: "Contactar cliente",
      leida: false,
      descartada: false,
    },
  ],
  kpis: {
    nps: 72,
    csat: 4.5,
    tiempoResolucion: 24,
    tasaCumplimientoSLA: 94,
  },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const MetricCard: React.FC<{
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icono: React.ElementType;
  color: string;
  tendencia?: { valor: number; tipo: "subida" | "bajada" | "neutral" };
}> = ({ titulo, valor, subtitulo, icono: Icon, color, tendencia }) => (
  <motion.div
    className={`
      relative overflow-hidden rounded-2xl p-6
      bg-gradient-to-br ${color}
      shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]
    `}
    whileHover={{ scale: 1.02, y: -4 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium">{titulo}</p>
        <h3 className="text-3xl font-bold text-white mt-1">{valor}</h3>
        {subtitulo && <p className="text-white/60 text-xs mt-1">{subtitulo}</p>}
      </div>
      <div className="p-3 rounded-xl bg-[#dfeaff]/20 ">
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>

    {tendencia && (
      <div
        className={`flex items-center gap-1 mt-4 text-sm ${
          tendencia.tipo === "subida"
            ? "text-[#6888ff]"
            : tendencia.tipo === "bajada"
            ? "text-[#9aa3b8]"
            : "text-white/60"
        }`}
      >
        {tendencia.tipo === "subida"
          ? <TrendingUp className="w-4 h-4" />
          : tendencia.tipo === "bajada"
          ? <TrendingDown className="w-4 h-4" />
          : null}
        <span>{tendencia.tipo === "subida" ? "+" : ""}{tendencia.valor}%</span>
        <span className="text-white/50 ml-1">vs mes anterior</span>
      </div>
    )}

    {/* Efecto decorativo */}
    <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-[#dfeaff]/10" />
  </motion.div>
);

const AlertaCard: React.FC<{
  alerta: AlertaInteligente;
  onAccion: () => void;
  onDescartar: () => void;
}> = ({ alerta, onAccion, onDescartar }) => {
  const urgenciaConfig = {
    critica: {
      bg: "bg-[#dfeaff]",
      border: "border-[#bec8de]",
      icon: "text-[#9aa3b8]",
      badge: "bg-[#dfeaff]0",
    },
    alta: {
      bg: "bg-[#6888ff]/5",
      border: "border-[#bec8de]",
      icon: "text-[#6888ff]",
      badge: "bg-[#6888ff]/50",
    },
    media: {
      bg: "bg-[#6888ff]/5",
      border: "border-[#bec8de]",
      icon: "text-[#6888ff]",
      badge: "bg-[#6888ff]/50",
    },
    baja: {
      bg: "bg-[#dfeaff]",
      border: "border-[#bec8de40]",
      icon: "text-[#9aa3b8]",
      badge: "bg-[#69738c]",
    },
  };

  const config = urgenciaConfig[alerta.urgencia];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`
        p-4 rounded-xl border-2 ${config.bg} ${config.border}
        transition-all duration-200
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          {alerta.tipo === "riesgo_pago"
            ? <AlertTriangle className={`w-5 h-5 ${config.icon}`} />
            : alerta.tipo === "renovacion_pendiente"
            ? <RefreshCw className={`w-5 h-5 ${config.icon}`} />
            : <Bell className={`w-5 h-5 ${config.icon}`} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-[#69738c] truncate">
              {alerta.titulo}
            </h4>
            <span
              className={`px-2 py-0.5 rounded-full text-xs text-white ${config.badge}`}
            >
              {alerta.urgencia}
            </span>
          </div>
          <p className="text-sm text-[#69738c] line-clamp-2">
            {alerta.descripcion}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={onAccion}
              className="px-3 py-1.5 rounded-lg bg-[#6888ff]/50 text-white text-sm font-medium hover:bg-[#6888ff] transition-colors flex items-center gap-1"
            >
              {alerta.accionSugerida}
              <ArrowUpRight className="w-3 h-3" />
            </button>
            <button
              onClick={onDescartar}
              className="px-3 py-1.5 rounded-lg bg-[#dfeaff] text-[#69738c] text-sm hover:bg-[#dfeaff] transition-colors"
            >
              Descartar
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PrediccionRenovacionCard: React.FC<{
  prediccion: PrediccionRenovacion;
}> = ({ prediccion }) => {
  const probabilidadColor = prediccion.probabilidadRenovacion >= 80
    ? "from-[#6888ff] to-[#5572ee]"
    : prediccion.probabilidadRenovacion >= 50
    ? "from-[#6888ff] to-[#5572ee]"
    : "from-[#6888ff] to-[#5572ee]";

  return (
    <motion.div
      className="p-4 rounded-xl bg-[#dfeaff] border border-[#bec8de40] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] transition-shadow"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-[#69738c]">
            {prediccion.clienteNombre}
          </h4>
          <p className="text-xs text-[#9aa3b8]">{prediccion.numeroContrato}</p>
        </div>
        <div
          className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${probabilidadColor} text-white text-sm font-bold`}
        >
          {prediccion.probabilidadRenovacion}%
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-[#69738c]">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>Vence: {prediccion.fechaVencimientos.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          <span>
            ${(prediccion.valorEstimadoRenovacion / 1000000).toFixed(0)}M
          </span>
        </div>
      </div>

      {prediccion.factoresPositivos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {prediccion.factoresPositivos.slice(0, 2).map((factor) => (
            <span
              key={factor}
              className="px-2 py-0.5 rounded-full bg-[#6888ff]/10 text-[#6888ff] text-xs"
            >
              {factor}
            </span>
          ))}
        </div>
      )}

      {prediccion.factoresNegativos.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {prediccion.factoresNegativos.slice(0, 2).map((factor) => (
            <span
              key={factor}
              className="px-2 py-0.5 rounded-full bg-[#dfeaff] text-[#9aa3b8] text-xs"
            >
              {factor}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-[#6888ff] font-medium flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        {prediccion.accionRecomendada}
      </p>
    </motion.div>
  );
};

const MiniChart: React.FC<{
  data: { mes: string; ingresos: number }[];
}> = ({ data }) => {
  const maxValue = Math.max(...data.map((d) => d.ingresos));

  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((item, index) => (
        <div key={item.mes} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            className="w-full bg-[#6888ff] rounded-t-sm"
            style={{ height: `${(item.ingresos / maxValue) * 100}%` }}
            initial={{ height: 0 }}
            animate={{ height: `${(item.ingresos / maxValue) * 100}%` }}
            transition={{ delay: index * 0.1 }}
          />
          <span className="text-[10px] text-[#9aa3b8]">{item.mes}</span>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

interface AnalyticsDashboardProps {
  onClose?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = (
  { onClose },
) => {
  const [analytics] = useState<ContractAnalyticsDashboard>(mockAnalytics);
  const [alertasVisibles, setAlertasVisibles] = useState(analytics.alertas);
  const [vistaActiva, setVistaActiva] = useState<
    "resumen" | "predicciones" | "alertas"
  >("resumen");

  const contratosActivos = useMemo(() => {
    return analytics.metricas.contratosPorEstado.activo +
      analytics.metricas.contratosPorEstado.en_ejecucion;
  }, [analytics]);

  const handleDescartarAlerta = (id: string) => {
    setAlertasVisibles((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#dfeaff] rounded-3xl shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 bg-[#6888ff]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#dfeaff]/20 ">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Analytics Dashboard
              </h2>
              <p className="text-white/70 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Powered by Cortex-AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex bg-[#dfeaff]/20 rounded-xl p-1">
              {(["resumen", "predicciones", "alertas"] as const).map(
                (vista) => (
                  <button
                    key={vista}
                    onClick={() => setVistaActiva(vista)}
                    className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      vistaActiva === vista
                        ? "bg-[#dfeaff] text-[#6888ff]"
                        : "text-white/80 hover:text-white hover:bg-[#dfeaff]/10"
                    }
                  `}
                  >
                    {vista.charAt(0).toUpperCase() + vista.slice(1)}
                    {vista === "alertas" && alertasVisibles.length > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[#dfeaff]0 text-white text-xs">
                        {alertasVisibles.length}
                      </span>
                    )}
                  </button>
                ),
              )}
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-[#dfeaff]/20 text-white hover:bg-[#dfeaff]/30 transition-colors"
              >
                <Eye className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {vistaActiva === "resumen" && (
            <motion.div
              key="resumen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Métricas principales */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  titulo="Valor Total Contratos"
                  valor={`$${
                    (analytics.metricas.valorTotalContratos / 1000000000)
                      .toFixed(1)
                  }B`}
                  subtitulo="Cartera activa"
                  icono={DollarSign}
                  color="#6888ff"
                  tendencia={{ valor: 12, tipo: "subida" }}
                />
                <MetricCard
                  titulo="Contratos Activos"
                  valor={contratosActivos}
                  subtitulo="En ejecución"
                  icono={FileText}
                  color="from-[#6888ff] to-teal-600"
                  tendencia={{ valor: 8, tipo: "subida" }}
                />
                <MetricCard
                  titulo="Tasa Conversión"
                  valor={`${analytics.metricas.tasaConversion}%`}
                  subtitulo="Borradores a firmados"
                  icono={Target}
                  color="from-[#6888ff] to-[#5572ee]"
                  tendencia={{ valor: 3, tipo: "subida" }}
                />
                <MetricCard
                  titulo="Tiempo Aprobación"
                  valor={`${analytics.metricas.tiempoPromedioAprobacion}h`}
                  subtitulo="Promedio"
                  icono={Clock}
                  color="from-[#6888ff] to-cyan-600"
                  tendencia={{ valor: 15, tipo: "bajada" }}
                />
              </div>

              {/* Gráficos y KPIs */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Tendencia mensual */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-[#dfeaff] border border-[#bec8de20]">
                  <h3 className="text-lg font-semibold text-[#69738c] mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#6888ff]" />
                    Tendencia de Ingresos
                  </h3>
                  <MiniChart data={analytics.rentabilidad.tendenciaMensual} />
                </div>

                {/* KPIs */}
                <div className="p-6 rounded-2xl bg-[#69738c]">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#6888ff]" />
                    KPIs de Calidad
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#9aa3b8] text-sm">NPS</span>
                      <span className="text-2xl font-bold text-[#6888ff]">
                        {analytics.kpis.nps}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#9aa3b8] text-sm">CSAT</span>
                      <span className="text-2xl font-bold text-[#6888ff]">
                        {analytics.kpis.csat}/5
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#9aa3b8] text-sm">
                        SLA Cumplimiento
                      </span>
                      <span className="text-2xl font-bold text-[#6888ff]">
                        {analytics.kpis.tasaCumplimientoSLA}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estados de contratos */}
              <div className="p-6 rounded-2xl bg-[#dfeaff] border border-[#bec8de20]">
                <h3 className="text-lg font-semibold text-[#69738c] mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#6888ff]" />
                  Distribución por Estado
                </h3>

                <div className="flex flex-wrap gap-2">
                  {Object.entries(analytics.metricas.contratosPorEstado)
                    .filter(([, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([estado, count]) => (
                      <div
                        key={estado}
                        className="px-3 py-2 rounded-lg bg-[#dfeaff] border border-[#bec8de40] flex items-center gap-2"
                      >
                        <span className="text-sm text-[#69738c] capitalize">
                          {estado.replace(/_/g, " ")}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#6888ff25] text-[#6888ff] text-xs font-bold">
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}

          {vistaActiva === "predicciones" && (
            <motion.div
              key="predicciones"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-[#6888ff]" />
                <h3 className="text-lg font-semibold text-[#69738c]">
                  Predicciones de Renovación
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#6888ff]/10 text-[#6888ff] text-xs">
                  IA
                </span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.predicciones.renovaciones.map((prediccion) => (
                  <PrediccionRenovacionCard
                    key={prediccion.contratoId}
                    prediccion={prediccion}
                  />
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#6888ff15] border border-[#6888ff20]">
                <p className="text-sm text-[#6888ff] flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Las predicciones se actualizan diariamente basándose en
                  historial de pagos, interacciones y tendencias del mercado.
                </p>
              </div>
            </motion.div>
          )}

          {vistaActiva === "alertas" && (
            <motion.div
              key="alertas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#69738c] flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#6888ff]" />
                  Alertas Inteligentes
                </h3>
                <span className="text-sm text-[#9aa3b8]">
                  {alertasVisibles.length} pendientes
                </span>
              </div>

              <AnimatePresence>
                {alertasVisibles.length > 0
                  ? (
                    alertasVisibles.map((alerta) => (
                      <AlertaCard
                        key={alerta.id}
                        alerta={alerta}
                        onAccion={() => {}}
                        onDescartar={() => handleDescartarAlerta(alerta.id)}
                      />
                    ))
                  )
                  : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-8 text-center"
                    >
                      <CheckCircle2 className="w-12 h-12 text-[#6888ff] mx-auto mb-3" />
                      <p className="text-[#69738c]">
                        No hay alertas pendientes
                      </p>
                    </motion.div>
                  )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
