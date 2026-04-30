/**
 * 📊 SILEXAR PULSE - Step 3: Especificaciones Avanzadas TIER 0
 *
 * @description Paso 3 con validación de inventario en tiempo real,
 * detección de conflictos y sugerencias automáticas.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Filter,
  Globe,
  Lightbulb,
  MapPin,
  Package,
  Plus,
  Radio,
  RefreshCw,
  Sparkles,
  Target,
  Tv,
  XCircle,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type EstadoDisponibilidad =
  | "disponible"
  | "saturado"
  | "no_disponible"
  | "verificando";

interface MedioSeleccionado {
  id: string;
  nombre: string;
  tipo: "RADIO" | "TV" | "DIGITAL" | "VIA_PUBLICA";
  programa?: string;
  horario: string;
  fechaInicio: Date;
  fechaFin: Date;
  disponibilidad: EstadoDisponibilidad;
  porcentajeDisponible?: number;
  conflicto?: {
    tipo: "saturacion" | "exclusividad" | "mantenimiento";
    descripcion: string;
    competidor?: string;
  };
  alternativa?: {
    horario: string;
    disponibilidad: number;
  };
  duracionSpot: number;
  cantidadCunas: number;
  precioUnitario: number;
  precioTotal: number;
}

interface ValidacionInventario {
  estado: "validando" | "completado" | "error";
  mediosValidados: number;
  mediosTotales: number;
  alertas: number;
  conflictos: number;
  todosDisponibles: boolean;
}

interface StepEspecificacionesAvanzadasProps {
  datos: {
    medios?: MedioSeleccionado[];
  };
  anunciante?: {
    id: string;
    nombre: string;
    industria: string;
  };
  onChange: (datos: Record<string, unknown>) => void;
  onValidationChange?: (isValid: boolean) => void;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockMedios: MedioSeleccionado[] = [
  {
    id: "med-001",
    nombre: "Radio Corazón",
    tipo: "RADIO",
    programa: "Prime Mañana",
    horario: "07:00 - 09:00",
    fechaInicio: new Date(2025, 5, 15),
    fechaFin: new Date(2025, 7, 30),
    disponibilidad: "disponible",
    porcentajeDisponible: 85,
    duracionSpot: 30,
    cantidadCunas: 60,
    precioUnitario: 85000,
    precioTotal: 5100000,
  },
  {
    id: "med-002",
    nombre: "FM Dos",
    tipo: "RADIO",
    programa: "Repartido",
    horario: "10:00 - 12:00",
    fechaInicio: new Date(2025, 5, 15),
    fechaFin: new Date(2025, 7, 30),
    disponibilidad: "saturado",
    porcentajeDisponible: 60,
    conflicto: {
      tipo: "saturacion",
      descripcion: "Horario con alta ocupación (60% disponible)",
    },
    alternativa: {
      horario: "14:00 - 16:00",
      disponibilidad: 95,
    },
    duracionSpot: 30,
    cantidadCunas: 45,
    precioUnitario: 65000,
    precioTotal: 2925000,
  },
  {
    id: "med-003",
    nombre: "La Clave",
    tipo: "RADIO",
    programa: "Prime",
    horario: "08:00 - 10:00",
    fechaInicio: new Date(2025, 5, 15),
    fechaFin: new Date(2025, 7, 30),
    disponibilidad: "no_disponible",
    conflicto: {
      tipo: "exclusividad",
      descripcion: "Exclusividad activa para cliente financiero",
      competidor: "Banco XYZ",
    },
    alternativa: {
      horario: "18:00 - 20:00 (Tarde)",
      disponibilidad: 100,
    },
    duracionSpot: 30,
    cantidadCunas: 40,
    precioUnitario: 95000,
    precioTotal: 3800000,
  },
  {
    id: "med-004",
    nombre: "Canal 13",
    tipo: "TV",
    programa: "Noticiero Central",
    horario: "21:00 - 22:00",
    fechaInicio: new Date(2025, 5, 15),
    fechaFin: new Date(2025, 7, 30),
    disponibilidad: "disponible",
    porcentajeDisponible: 92,
    duracionSpot: 20,
    cantidadCunas: 30,
    precioUnitario: 850000,
    precioTotal: 25500000,
  },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
};

const TipoMedioIcon: React.FC<{ tipo: MedioSeleccionado["tipo"] }> = (
  { tipo },
) => {
  const icons = {
    RADIO: <Radio className="w-5 h-5" />,
    TV: <Tv className="w-5 h-5" />,
    DIGITAL: <Globe className="w-5 h-5" />,
    VIA_PUBLICA: <MapPin className="w-5 h-5" />,
  };
  return icons[tipo];
};

const DisponibilidadBadge: React.FC<
  { estado: EstadoDisponibilidad; porcentaje?: number }
> = ({ estado, porcentaje }) => {
  const config = {
    disponible: {
      bg: "bg-[#6888ff]/10",
      text: "text-[#6888ff]",
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: "Disponible",
    },
    saturado: {
      bg: "bg-[#6888ff]/10",
      text: "text-[#6888ff]",
      icon: <AlertTriangle className="w-4 h-4" />,
      label: "Saturado",
    },
    no_disponible: {
      bg: "bg-[#dfeaff]",
      text: "text-[#9aa3b8]",
      icon: <XCircle className="w-4 h-4" />,
      label: "No disponible",
    },
    verificando: {
      bg: "bg-[#6888ff]/10",
      text: "text-[#6888ff]",
      icon: <RefreshCw className="w-4 h-4 animate-spin" />,
      label: "Verificando",
    },
  }[estado];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bg}`}
    >
      {config.icon}
      <span className={`text-sm font-medium ${config.text}`}>
        {config.label}
        {porcentaje !== undefined && estado !== "no_disponible" &&
          ` (${porcentaje}%)`}
      </span>
    </div>
  );
};

const MedioCard: React.FC<{
  medio: MedioSeleccionado;
  onEdit: () => void;
  onAceptarAlternativa?: () => void;
  expandido: boolean;
  onToggle: () => void;
}> = ({ medio, onEdit, onAceptarAlternativa, expandido, onToggle }) => (
  <motion.div
    layout
    className={`rounded-xl border-2 overflow-hidden transition-all ${
      medio.disponibilidad === "disponible"
        ? "border-[#bec8de] bg-[#dfeaff]"
        : medio.disponibilidad === "saturado"
        ? "border-[#bec8de] bg-[#6888ff]/5/30"
        : "border-[#bec8de] bg-[#dfeaff]/30"
    }`}
  >
    {/* Header */}
    <button
      onClick={onToggle}
      className="w-full p-4 flex items-center gap-4 text-left"
    >
      <div
        className={`p-3 rounded-xl ${
          medio.tipo === "RADIO"
            ? "bg-[#6888ff]/10 text-[#6888ff]"
            : medio.tipo === "TV"
            ? "bg-[#6888ff]/10 text-[#6888ff]"
            : medio.tipo === "DIGITAL"
            ? "bg-[#6888ff]/10 text-[#6888ff]"
            : "bg-[#6888ff]/10 text-[#6888ff]"
        }`}
      >
        <TipoMedioIcon tipo={medio.tipo} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-[#69738c]">{medio.nombre}</h4>
          <DisponibilidadBadge
            estado={medio.disponibilidad}
            porcentaje={medio.porcentajeDisponible}
          />
        </div>
        <p className="text-sm text-[#9aa3b8]">
          {medio.programa} • {medio.horario}
        </p>
      </div>

      <div className="text-right">
        <p className="font-bold text-[#69738c]">
          {formatCurrency(medio.precioTotal)}
        </p>
        <p className="text-xs text-[#9aa3b8]">{medio.cantidadCunas} cuñas</p>
      </div>

      <ChevronDown
        className={`w-5 h-5 text-[#9aa3b8] transition-transform ${
          expandido ? "rotate-180" : ""
        }`}
      />
    </button>

    {/* Contenido expandido */}
    <AnimatePresence>
      {expandido && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-[#bec8de40]"
        >
          <div className="p-4 space-y-4">
            {/* Detalles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-[#9aa3b8]">Horarios</p>
                <p className="font-medium text-[#69738c]">{medio.horario}</p>
              </div>
              <div>
                <p className="text-xs text-[#9aa3b8]">Fechas</p>
                <p className="font-medium text-[#69738c]">
                  {medio.fechaInicio.toLocaleDateString("es-CL", {
                    day: "2-digit",
                    month: "short",
                  })} - {medio.fechaFin.toLocaleDateString("es-CL", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9aa3b8]">Duración Spot</p>
                <p className="font-medium text-[#69738c]">
                  {medio.duracionSpot} segundos
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9aa3b8]">Precio Unitario</p>
                <p className="font-medium text-[#69738c]">
                  {formatCurrency(medio.precioUnitario)}
                </p>
              </div>
            </div>

            {/* Barra de disponibilidad */}
            {medio.porcentajeDisponible !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-[#9aa3b8]">
                    Disponibilidad del horario
                  </p>
                  <p className="text-xs font-medium text-[#69738c]">
                    {medio.porcentajeDisponible}% libre
                  </p>
                </div>
                <div className="w-full h-2 bg-[#dfeaff] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      medio.porcentajeDisponible >= 80
                        ? "bg-[#6888ff]/50"
                        : medio.porcentajeDisponible >= 50
                        ? "bg-[#6888ff]/50"
                        : "bg-[#dfeaff]0"
                    }`}
                    style={{ width: `${medio.porcentajeDisponible}%` }}
                  />
                </div>
              </div>
            )}

            {/* Conflicto */}
            {medio.conflicto && (
              <div
                className={`p-3 rounded-lg ${
                  medio.conflicto.tipo === "exclusividad"
                    ? "bg-[#dfeaff]"
                    : "bg-[#6888ff]/10"
                }`}
              >
                <div className="flex items-start gap-2">
                  {medio.conflicto.tipo === "exclusividad"
                    ? <XCircle className="w-5 h-5 text-[#9aa3b8] flex-shrink-0" />
                    : (
                      <AlertTriangle className="w-5 h-5 text-[#6888ff] flex-shrink-0" />
                    )}
                  <div>
                    <p
                      className={`font-medium ${
                        medio.conflicto.tipo === "exclusividad"
                          ? "text-[#9aa3b8]"
                          : "text-[#6888ff]"
                      }`}
                    >
                      {medio.conflicto.tipo === "exclusividad"
                        ? "Conflicto de Exclusividad"
                        : "Disponibilidad Limitada"}
                    </p>
                    <p className="text-sm text-[#69738c]">
                      {medio.conflicto.descripcion}
                    </p>
                    {medio.conflicto.competidor && (
                      <p className="text-sm text-[#9aa3b8] mt-1">
                        Exclusividad: {medio.conflicto.competidor}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Alternativa sugerida */}
            {medio.alternativa && (
              <div className="p-3 rounded-lg bg-[#6888ff15] border border-[#6888ff30]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#6888ff]" />
                    <div>
                      <p className="font-medium text-[#6888ff]">
                        Alternativa sugerida
                      </p>
                      <p className="text-sm text-[#69738c]">
                        Horario {medio.alternativa.horario} •{" "}
                        {medio.alternativa.disponibilidad}% disponible
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onAceptarAlternativa}
                    className="px-3 py-1.5 rounded-lg bg-[#6888ff]/50 text-white text-sm font-medium hover:bg-[#6888ff] transition-colors"
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-2 pt-2 border-t border-[#bec8de40]">
              <button
                onClick={onEdit}
                className="flex-1 py-2 rounded-lg bg-[#dfeaff] text-[#69738c] font-medium flex items-center justify-center gap-2 hover:bg-[#dfeaff] transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </button>
              <button className="px-4 py-2 rounded-lg bg-[#6888ff25] text-[#6888ff] font-medium flex items-center justify-center gap-2 hover:bg-[#6888ff]/20 transition-colors">
                <Sparkles className="w-4 h-4" />
                Sugerencias IA
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function StepEspecificacionesAvanzadas({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  datos: _datos,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  anunciante: _anunciante,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange: _onChange,
  onValidationChange,
}: StepEspecificacionesAvanzadasProps) {
  const [medios, setMedios] = useState<MedioSeleccionado[]>(mockMedios);
  const [validacion, setValidacion] = useState<ValidacionInventario>({
    estado: "validando",
    mediosValidados: 0,
    mediosTotales: mockMedios.length,
    alertas: 0,
    conflictos: 0,
    todosDisponibles: false,
  });
  const [medioExpandido, setMedioExpandido] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  // Simular validación de inventario
  useEffect(() => {
    setValidacion((prev) => ({
      ...prev,
      estado: "validando",
      mediosValidados: 0,
    }));

    const intervalId = setInterval(() => {
      setValidacion((prev) => {
        if (prev.mediosValidados >= prev.mediosTotales) {
          clearInterval(intervalId);
          const alertas = medios.filter((m) =>
            m.disponibilidad === "saturado"
          ).length;
          const conflictos = medios.filter((m) =>
            m.disponibilidad === "no_disponible"
          ).length;
          return {
            ...prev,
            estado: "completado",
            alertas,
            conflictos,
            todosDisponibles: alertas === 0 && conflictos === 0,
          };
        }
        return { ...prev, mediosValidados: prev.mediosValidados + 1 };
      });
    }, 400);

    return () => clearInterval(intervalId);
  }, [medios]);

  // Validación del paso
  useEffect(() => {
    const tieneMedios = medios.length > 0;
    const sinConflictosBloquantes = !medios.some((m) =>
      m.disponibilidad === "no_disponible"
    );
    onValidationChange?.(
      tieneMedios &&
        (sinConflictosBloquantes || validacion.estado === "validando"),
    );
  }, [medios, validacion, onValidationChange]);

  const handleRevalidar = () => {
    setValidacion({
      estado: "validando",
      mediosValidados: 0,
      mediosTotales: medios.length,
      alertas: 0,
      conflictos: 0,
      todosDisponibles: false,
    });
  };

  const mediosFiltrados = filtroTipo === "todos"
    ? medios
    : medios.filter((m) => m.tipo === filtroTipo);

  const totalValor = medios.reduce((acc, m) => acc + m.precioTotal, 0);
  const totalCunas = medios.reduce((acc, m) => acc + m.cantidadCunas, 0);

  return (
    <div className="space-y-6">
      {/* Panel de Validación de Inventario */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-[#dfeaff] border border-[#bec8de40]"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-[#6888ff25]">
            <Package className="w-5 h-5 text-[#6888ff]" />
          </div>
          <h3 className="text-lg font-semibold text-[#69738c]">
            📊 VALIDACIÓN DE INVENTARIO AUTOMÁTICA
          </h3>
        </div>

        {validacion.estado === "validando"
          ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-[#6888ff30] border-t-indigo-500 animate-spin" />
                <span className="text-[#69738c]">
                  🔍 Verificando disponibilidad...
                </span>
              </div>
              <div className="w-full h-2 bg-[#dfeaff] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#6888ff]/50 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      (validacion.mediosValidados / validacion.mediosTotales) *
                      100
                    }%`,
                  }}
                />
              </div>
              <p className="text-sm text-[#9aa3b8]">
                Validando {validacion.mediosValidados} de{" "}
                {validacion.mediosTotales} medios...
              </p>
            </div>
          )
          : (
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#dfeaff] border border-[#bec8de40]">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-[#6888ff]" />
                  <span className="text-sm text-[#69738c]">Disponibles</span>
                </div>
                <p className="text-2xl font-bold text-[#6888ff]">
                  {medios.filter((m) => m.disponibilidad === "disponible")
                    .length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#dfeaff] border border-[#bec8de40]">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-5 h-5 text-[#6888ff]" />
                  <span className="text-sm text-[#69738c]">Alertas</span>
                </div>
                <p className="text-2xl font-bold text-[#6888ff]">
                  {validacion.alertas}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#dfeaff] border border-[#bec8de40]">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-5 h-5 text-[#9aa3b8]" />
                  <span className="text-sm text-[#69738c]">Conflictos</span>
                </div>
                <p className="text-2xl font-bold text-[#9aa3b8]">
                  {validacion.conflictos}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#dfeaff] border border-[#bec8de40]">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-5 h-5 text-[#6888ff]" />
                  <span className="text-sm text-[#69738c]">Total</span>
                </div>
                <p className="text-2xl font-bold text-[#69738c]">
                  {formatCurrency(totalValor)}
                </p>
                <p className="text-xs text-[#9aa3b8]">{totalCunas} cuñas</p>
              </div>
            </div>
          )}

        {/* Acciones */}
        {validacion.estado === "completado" && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleRevalidar}
              className="px-4 py-2 rounded-lg bg-[#dfeaff] border border-[#bec8de40] text-[#69738c] font-medium flex items-center gap-2 hover:bg-[#dfeaff]"
            >
              <RefreshCw className="w-4 h-4" />
              Re-validar
            </button>
            <button className="px-4 py-2 rounded-lg bg-[#dfeaff] border border-[#bec8de40] text-[#69738c] font-medium flex items-center gap-2 hover:bg-[#dfeaff]">
              <Edit3 className="w-4 h-4" />
              Ajustar
            </button>
            <button className="px-4 py-2 rounded-lg bg-[#6888ff25] text-[#6888ff] font-medium flex items-center gap-2 hover:bg-[#6888ff]/20">
              <Sparkles className="w-4 h-4" />
              Sugerencias IA
            </button>
          </div>
        )}
      </motion.div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#9aa3b8]" />
          {["todos", "RADIO", "TV", "DIGITAL", "VIA_PUBLICA"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filtroTipo === tipo
                  ? "bg-[#6888ff]/50 text-white"
                  : "bg-[#dfeaff] text-[#69738c] hover:bg-[#dfeaff]"
              }`}
            >
              {tipo === "todos"
                ? "Todos"
                : tipo === "VIA_PUBLICA"
                ? "Vía Pública"
                : tipo}
            </button>
          ))}
        </div>
        <button className="px-4 py-2 rounded-xl bg-[#6888ff] text-white font-medium flex items-center gap-2 hover:shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] transition-shadow">
          <Plus className="w-4 h-4" />
          Agregar Medio
        </button>
      </div>

      {/* Lista de Medios */}
      <div className="space-y-4">
        {mediosFiltrados.map((medio) => (
          <MedioCard
            key={medio.id}
            medio={medio}
            expandido={medioExpandido === medio.id}
            onToggle={() =>
              setMedioExpandido(medioExpandido === medio.id ? null : medio.id)}
            onEdit={() => {}}
            onAceptarAlternativa={() => {
              setMedios((prev) =>
                prev.map((m) =>
                  m.id === medio.id
                    ? {
                      ...m,
                      horario: m.alternativa?.horario || m.horario,
                      disponibilidad: "disponible",
                      porcentajeDisponible: m.alternativa?.disponibilidad,
                      conflicto: undefined,
                      alternativa: undefined,
                    }
                    : m
                )
              );
            }}
          />
        ))}
      </div>

      {mediosFiltrados.length === 0 && (
        <div className="p-12 text-center bg-[#dfeaff] rounded-xl border-2 border-dashed border-[#bec8de40]">
          <Package className="w-12 h-12 text-[#9aa3b8] mx-auto mb-3" />
          <p className="text-[#9aa3b8]">No hay medios agregados</p>
          <button className="mt-3 px-4 py-2 rounded-lg bg-[#6888ff]/50 text-white font-medium">
            Agregar primer medio
          </button>
        </div>
      )}

      {/* Resumen */}
      {medios.length > 0 && (
        <div className="p-4 rounded-xl bg-[#dfeaff] text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#9aa3b8] text-sm">Total Especificaciones</p>
              <p className="text-2xl font-bold">{formatCurrency(totalValor)}</p>
            </div>
            <div className="text-right">
              <p className="text-[#9aa3b8] text-sm">
                {medios.length} medios • {totalCunas} cuñas
              </p>
              {validacion.conflictos > 0 && (
                <p className="text-[#6888ff] text-sm">
                  ⚠️ {validacion.conflictos} conflictos por resolver
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
