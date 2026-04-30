/**
 * 📋 SILEXAR PULSE - Panel de Obligaciones TIER 0
 *
 * @description Gestión visual de obligaciones contractuales
 * con tracking de estado, alertas y extracción IA.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import {
  EstadoObligacion,
  ObligacionContrato,
  ResumenObligaciones,
  TipoObligacion,
} from "../types/enterprise.types";
import { useObligaciones } from "../services/ObligacionesService";

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

const ESTADO_CONFIG: Record<EstadoObligacion, {
  color: string;
  bgColor: string;
  icon: React.ElementType;
  label: string;
}> = {
  pendiente: {
    color: "text-[#9aa3b8]",
    bgColor: "bg-[#dfeaff]",
    icon: Clock,
    label: "Pendiente",
  },
  en_progreso: {
    color: "text-[#6888ff]",
    bgColor: "bg-[#6888ff]/10",
    icon: RefreshCw,
    label: "En Progreso",
  },
  completada: {
    color: "text-[#6888ff]",
    bgColor: "bg-[#6888ff]/10",
    icon: CheckCircle2,
    label: "Completada",
  },
  vencida: {
    color: "text-[#9aa3b8]",
    bgColor: "bg-[#dfeaff]",
    icon: AlertTriangle,
    label: "Vencida",
  },
  incumplida: {
    color: "text-[#9aa3b8]",
    bgColor: "bg-[#dfeaff]",
    icon: X,
    label: "Incumplida",
  },
  dispensada: {
    color: "text-[#6888ff]",
    bgColor: "bg-[#6888ff]/10",
    icon: CheckCircle2,
    label: "Dispensada",
  },
  en_disputa: {
    color: "text-[#6888ff]",
    bgColor: "bg-[#6888ff]/10",
    icon: AlertTriangle,
    label: "En Disputa",
  },
};

const TIPO_CONFIG: Record<
  TipoObligacion,
  { icon: React.ElementType; label: string }
> = {
  entrega_material: { icon: Package, label: "Entrega Material" },
  pago: { icon: DollarSign, label: "Pago" },
  reporte: { icon: BarChart3, label: "Reporte" },
  aprobacion_material: { icon: CheckCircle2, label: "Aprobación" },
  exclusividad: { icon: User, label: "Exclusividad" },
  confidencialidad: { icon: FileText, label: "Confidencialidad" },
  entrega_pauta: { icon: Send, label: "Entrega Pauta" },
  facturacion: { icon: FileText, label: "Facturación" },
  renovacion: { icon: RefreshCw, label: "Renovación" },
  otro: { icon: ClipboardList, label: "Otro" },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const ResumenCard: React.FC<{
  titulo: string;
  valor: number;
  icono: React.ElementType;
  color: string;
  trend?: { valor: number; tipo: "up" | "down" };
}> = ({ titulo, valor, icono: Icon, color, trend }) => (
  <motion.div
    className={`p-4 rounded-xl ${color} transition-all`}
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex items-center justify-between">
      <Icon className="w-5 h-5 opacity-70" />
      {trend && (
        <span
          className={`text-xs font-medium ${
            trend.tipo === "up" ? "text-[#6888ff]" : "text-[#9aa3b8]"
          }`}
        >
          {trend.tipo === "up" ? "+" : ""}
          {trend.valor}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold mt-2">{valor}</p>
    <p className="text-xs opacity-70">{titulo}</p>
  </motion.div>
);

const ObligacionCard: React.FC<{
  obligacion: ObligacionContrato;
  onCompletarClick: () => void;
  onVerDetalles: () => void;
}> = ({ obligacion, onCompletarClick, onVerDetalles }) => {
  const estadoConfig = ESTADO_CONFIG[obligacion.estado];
  const tipoConfig = TIPO_CONFIG[obligacion.tipo];
  const IconoEstado = estadoConfig.icon;
  const IconoTipo = tipoConfig.icon;

  const diasRestantes = useMemo(() => {
    const ahora = new Date();
    return Math.ceil(
      (obligacion.fechaLimite.getTime() - ahora.getTime()) /
        (24 * 60 * 60 * 1000),
    );
  }, [obligacion.fechaLimite]);

  const urgencia = diasRestantes <= 0
    ? "critica"
    : diasRestantes <= 3
    ? "alta"
    : diasRestantes <= 7
    ? "media"
    : "baja";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-4 rounded-xl border-2 transition-all cursor-pointer
        ${
        obligacion.estado === "vencida" || obligacion.estado === "incumplida"
          ? "border-[#bec8de] bg-[#dfeaff]"
          : urgencia === "alta"
          ? "border-[#bec8de] bg-[#6888ff]/5"
          : "border-[#bec8de40] bg-[#dfeaff] hover:border-[#6888ff30] hover:bg-[#6888ff15]/30"
      }
      `}
      onClick={onVerDetalles}
      whileHover={{ x: 4 }}
    >
      <div className="flex items-start gap-4">
        {/* Icono de tipo */}
        <div className={`p-2 rounded-lg ${estadoConfig.bgColor}`}>
          <IconoTipo className={`w-5 h-5 ${estadoConfig.color}`} />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-[#69738c] truncate">
              {obligacion.titulo}
            </h4>
            {obligacion.extraidaPorIA && (
              <span className="px-1.5 py-0.5 rounded bg-[#6888ff]/10 text-[#6888ff] text-[10px] font-medium flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                IA
              </span>
            )}
          </div>

          <p className="text-sm text-[#69738c] line-clamp-1">
            {obligacion.descripcion}
          </p>

          <div className="flex items-center gap-4 mt-2 text-xs text-[#9aa3b8]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {obligacion.fechaLimite.toLocaleDateString("es-CL")}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {obligacion.responsable.tipo === "empresa"
                ? "Empresa"
                : "Cliente"}
            </span>
            {obligacion.penalizacion && (
              <span className="flex items-center gap-1 text-[#9aa3b8]">
                <AlertTriangle className="w-3 h-3" />
                Penalización
              </span>
            )}
          </div>
        </div>

        {/* Estado y acciones */}
        <div className="flex flex-col items-end gap-2">
          <span
            className={`
            px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1
            ${estadoConfig.bgColor} ${estadoConfig.color}
          `}
          >
            <IconoEstado className="w-3 h-3" />
            {estadoConfig.label}
          </span>

          {diasRestantes <= 7 && obligacion.estado !== "completada" && (
            <span
              className={`
              text-xs font-medium
              ${
                diasRestantes <= 0
                  ? "text-[#9aa3b8]"
                  : diasRestantes <= 3
                  ? "text-[#6888ff]"
                  : "text-[#9aa3b8]"
              }
            `}
            >
              {diasRestantes <= 0
                ? `Vencida hace ${Math.abs(diasRestantes)} días`
                : `${diasRestantes} días restantes`}
            </span>
          )}

          {obligacion.estado !== "completada" &&
            obligacion.estado !== "incumplida" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompletarClick();
              }}
              className="px-3 py-1 rounded-lg bg-[#6888ff]/50 text-white text-xs font-medium hover:bg-[#6888ff] transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" />
              Completar
            </button>
          )}
        </div>
      </div>

      {/* Barra de progreso */}
      {obligacion.porcentajeCompletado > 0 &&
        obligacion.porcentajeCompletado < 100 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-[#9aa3b8] mb-1">
            <span>Progreso</span>
            <span>{obligacion.porcentajeCompletado}%</span>
          </div>
          <div className="h-1.5 bg-[#dfeaff] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#6888ff]/50 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${obligacion.porcentajeCompletado}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

const FiltroChip: React.FC<{
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ activo, onClick, children }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 rounded-lg text-sm font-medium transition-all
      ${
      activo
        ? "bg-[#6888ff]/50 text-white"
        : "bg-[#dfeaff] text-[#69738c] hover:bg-[#dfeaff]"
    }
    `}
  >
    {children}
  </button>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

interface ObligacionesPanelProps {
  contratoId?: string;
  onClose?: () => void;
}

export const ObligacionesPanel: React.FC<ObligacionesPanelProps> = ({
  contratoId,
  onClose,
}) => {
  const [filtroEstado, setFiltroEstado] = useState<EstadoObligacion | "todas">(
    "todas",
  );
  const [filtroTipo] = useState<TipoObligacion | "todos">("todos");
  const [mostrarCrear, setMostrarCrear] = useState(false);

  const obligacionesService = useObligaciones(contratoId);
  const obligaciones = contratoId
    ? (obligacionesService.obtenerPorContrato as () => ObligacionContrato[])()
    : [];
  const resumen = obligacionesService.obtenerResumen();

  // Mock para demo
  const mockObligaciones: ObligacionContrato[] = [
    {
      id: "1",
      contratoId: contratoId || "c-001",
      numeroContrato: "CON-2024-00145",
      tipo: "entrega_material",
      titulo: "Entrega de Material Creativo",
      descripcion: "El cliente debe entregar spots de radio y material gráfico",
      clausulaOrigen: "Cláusula 5.1",
      responsable: { tipo: "cliente", personaNombre: "Marketing Team" },
      fechaInicio: new Date(),
      fechaLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      frecuencia: "unico",
      diasAnticipacionAlerta: [7, 3, 1],
      estado: "pendiente",
      porcentajeCompletado: 0,
      documentosAdjuntos: [],
      alertasEnviadas: [],
      creadoPor: "sistema",
      fechaCreacion: new Date(),
      ultimaModificacion: new Date(),
      extraidaPorIA: true,
      confianzaExtraccion: 95,
    },
    {
      id: "2",
      contratoId: contratoId || "c-001",
      numeroContrato: "CON-2024-00145",
      tipo: "pago",
      titulo: "Pago Cuota 1/3",
      descripcion: "Primera cuota del contrato por $15.000.000",
      clausulaOrigen: "Cláusula 3.2",
      responsable: { tipo: "cliente", personaNombre: "Finanzas" },
      fechaInicio: new Date(),
      fechaLimite: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      frecuencia: "unico",
      diasAnticipacionAlerta: [5, 2, 1],
      estado: "pendiente",
      porcentajeCompletado: 0,
      documentosAdjuntos: [],
      alertasEnviadas: [],
      creadoPor: "sistema",
      fechaCreacion: new Date(),
      ultimaModificacion: new Date(),
      extraidaPorIA: true,
      penalizacion: {
        tipo: "interes_mora",
        porcentaje: 1.5,
        descripcion: "Interés por mora del 1.5% mensual",
      },
    },
    {
      id: "3",
      contratoId: contratoId || "c-001",
      numeroContrato: "CON-2024-00145",
      tipo: "reporte",
      titulo: "Reporte Mensual de Campaña",
      descripcion: "Generar y entregar reporte de performance",
      clausulaOrigen: "Cláusula 7.1",
      responsable: { tipo: "empresa", departamento: "Analytics" },
      fechaInicio: new Date(),
      fechaLimite: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      frecuencia: "mensual",
      diasAnticipacionAlerta: [3, 1],
      estado: "vencida",
      porcentajeCompletado: 60,
      documentosAdjuntos: [],
      alertasEnviadas: [
        {
          fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          canal: "email",
          destinatario: "analytics@silexar.com",
          leida: true,
        },
      ],
      creadoPor: "sistema",
      fechaCreacion: new Date(),
      ultimaModificacion: new Date(),
      extraidaPorIA: true,
    },
  ];

  const obligacionesFiltradas = useMemo(() => {
    const lista = obligaciones.length > 0 ? obligaciones : mockObligaciones;

    return lista.filter((o) => {
      if (filtroEstado !== "todas" && o.estado !== filtroEstado) return false;
      if (filtroTipo !== "todos" && o.tipo !== filtroTipo) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obligaciones.length, filtroEstado, filtroTipo]);

  const resumenData: ResumenObligaciones = resumen.total > 0 ? resumen : {
    total: mockObligaciones.length,
    porEstado: {
      pendiente: 2,
      en_progreso: 0,
      completada: 0,
      vencida: 1,
      incumplida: 0,
      dispensada: 0,
      en_disputa: 0,
    },
    vencidasHoy: 0,
    proximasVencer: 2,
    cumplimientoPorcentaje: 0,
    obligacionesCriticas: mockObligaciones.filter((o) =>
      o.estado === "vencida"
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#dfeaff] rounded-3xl shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 bg-[#69738c]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#dfeaff]/10 ">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Gestión de Obligaciones
              </h2>
              <p className="text-white/70 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Extracción automática con IA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMostrarCrear(true)}
              className="px-4 py-2 rounded-xl bg-[#dfeaff] text-[#69738c] font-medium flex items-center gap-2 hover:bg-[#dfeaff] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Obligación
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-[#dfeaff]/10 text-white hover:bg-[#dfeaff]/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Resumen */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <ResumenCard
            titulo="Total"
            valor={resumenData.total}
            icono={ClipboardList}
            color="bg-[#dfeaff] text-[#69738c]"
          />
          <ResumenCard
            titulo="Pendientes"
            valor={resumenData.porEstado.pendiente}
            icono={Clock}
            color="bg-[#6888ff]/5 text-[#6888ff]"
          />
          <ResumenCard
            titulo="Completadas"
            valor={resumenData.porEstado.completada}
            icono={CheckCircle2}
            color="bg-[#6888ff]/5 text-[#6888ff]"
          />
          <ResumenCard
            titulo="Vencidas"
            valor={resumenData.porEstado.vencida}
            icono={AlertTriangle}
            color="bg-[#dfeaff] text-[#9aa3b8]"
          />
          <ResumenCard
            titulo="Cumplimiento"
            valor={Math.round(resumenData.cumplimientoPorcentaje)}
            icono={TrendingUp}
            color="bg-[#6888ff]/5 text-[#6888ff]"
            trend={{ valor: 5, tipo: "up" }}
          />
        </div>

        {/* Alertas críticas */}
        {resumenData.obligacionesCriticas.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-[#dfeaff] border border-[#bec8de]">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-[#9aa3b8]" />
              <span className="font-semibold text-[#9aa3b8]">
                {resumenData.obligacionesCriticas.length}{" "}
                obligaciones requieren atención urgente
              </span>
            </div>
            <p className="text-sm text-[#9aa3b8]">
              Hay obligaciones vencidas o próximas a vencer que necesitan acción
              inmediata.
            </p>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#9aa3b8]" />
            <span className="text-sm text-[#9aa3b8]">Estado:</span>
            <div className="flex gap-1">
              <FiltroChip
                activo={filtroEstado === "todas"}
                onClick={() => setFiltroEstado("todas")}
              >
                Todas
              </FiltroChip>
              <FiltroChip
                activo={filtroEstado === "pendiente"}
                onClick={() => setFiltroEstado("pendiente")}
              >
                Pendientes
              </FiltroChip>
              <FiltroChip
                activo={filtroEstado === "vencida"}
                onClick={() => setFiltroEstado("vencida")}
              >
                Vencidas
              </FiltroChip>
              <FiltroChip
                activo={filtroEstado === "completada"}
                onClick={() => setFiltroEstado("completada")}
              >
                Completadas
              </FiltroChip>
            </div>
          </div>
        </div>

        {/* Lista de obligaciones */}
        <div className="space-y-3">
          <AnimatePresence>
            {obligacionesFiltradas.length > 0
              ? (
                obligacionesFiltradas.map((obligacion) => (
                  <ObligacionCard
                    key={obligacion.id}
                    obligacion={obligacion}
                    onCompletarClick={() => {
                      obligacionesService.marcarCompletada(obligacion.id);
                    }}
                    onVerDetalles={() => {
                    }}
                  />
                ))
              )
              : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-[#6888ff] mx-auto mb-3" />
                  <p className="text-[#69738c]">
                    No hay obligaciones que mostrar
                  </p>
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal crear (placeholder) */}
      <AnimatePresence>
        {mostrarCrear && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setMostrarCrear(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#dfeaff] rounded-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Nueva Obligación</h3>
              <p className="text-[#69738c] text-sm mb-4">
                Las obligaciones se extraen automáticamente del contrato usando
                IA. También puedes agregar manualmente.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setMostrarCrear(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-[#bec8de40] text-[#69738c] hover:bg-[#dfeaff]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setMostrarCrear(false);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#6888ff]/50 text-white hover:bg-[#6888ff] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Extraer con IA
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ObligacionesPanel;
