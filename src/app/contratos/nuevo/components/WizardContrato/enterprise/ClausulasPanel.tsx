/**
 * 📚 SILEXAR PULSE - Biblioteca de Cláusulas TIER 0
 *
 * @description Panel de gestión de cláusulas legales
 * con búsqueda, categorización y sugerencias IA.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  Lock,
  Plus,
  Search,
  Sparkles,
  Star,
  Tag,
  Unlock,
  X,
} from "lucide-react";
import {
  CategoriaClausula,
  ClausulaLegal,
  VariableClausula,
} from "../types/enterprise.types";
import { useClausulas } from "../services/ClausulasService";

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

const CATEGORIA_CONFIG: Record<CategoriaClausula, {
  color: string;
  bgColor: string;
  label: string;
}> = {
  general: {
    color: "text-[#69738c]",
    bgColor: "bg-[#dfeaff]",
    label: "General",
  },
  pago: { color: "text-emerald-600", bgColor: "bg-emerald-100", label: "Pago" },
  entrega: { color: "text-blue-600", bgColor: "bg-blue-100", label: "Entrega" },
  exclusividad: {
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    label: "Exclusividad",
  },
  confidencialidad: {
    color: "text-[#6888ff]",
    bgColor: "bg-[#6888ff25]",
    label: "Confidencialidad",
  },
  terminacion: {
    color: "text-red-600",
    bgColor: "bg-red-100",
    label: "Terminación",
  },
  penalizaciones: {
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    label: "Penalizaciones",
  },
  garantias: {
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    label: "Garantías",
  },
  propiedad_intelectual: {
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    label: "Propiedad Intelectual",
  },
  jurisdiccion: {
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    label: "Jurisdicción",
  },
  fuerza_mayor: {
    color: "text-rose-600",
    bgColor: "bg-rose-100",
    label: "Fuerza Mayor",
  },
  modificaciones: {
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    label: "Modificaciones",
  },
  notificaciones: {
    color: "text-sky-600",
    bgColor: "bg-sky-100",
    label: "Notificaciones",
  },
  publicidad_medios: {
    color: "text-fuchsia-600",
    bgColor: "bg-fuchsia-100",
    label: "Publicidad/Medios",
  },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const ClausulaCard: React.FC<{
  clausula: ClausulaLegal;
  onSeleccionar: () => void;
  onPreview: () => void;
  isSelected: boolean;
}> = ({ clausula, onSeleccionar, onPreview, isSelected }) => {
  const categoriaConfig = CATEGORIA_CONFIG[clausula.categoria];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-4 rounded-xl border-2 transition-all cursor-pointer
        ${
        isSelected
          ? "border-indigo-500 bg-[#6888ff15]"
          : "border-[#bec8de40] bg-[#dfeaff] hover:border-[#6888ff30] hover:bg-[#6888ff15]/30"
      }
      `}
      onClick={onSeleccionar}
      whileHover={{ x: 2 }}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div
          className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
          ${
            isSelected
              ? "border-indigo-500 bg-indigo-500"
              : "border-[#bec8de50]"
          }
        `}
        >
          {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-[#9aa3b8]">
              {clausula.codigo}
            </span>
            <h4 className="font-semibold text-[#69738c] truncate">
              {clausula.nombre}
            </h4>
            {clausula.esObligatoria && (
              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-[10px] font-medium flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" />
                Obligatoria
              </span>
            )}
            {clausula.sugerenciaIA && (
              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 text-[10px] font-medium flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                IA
              </span>
            )}
          </div>

          <p className="text-sm text-[#69738c] line-clamp-2">
            {clausula.contenido.substring(0, 150)}...
          </p>

          <div className="flex items-center gap-3 mt-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${categoriaConfig.bgColor} ${categoriaConfig.color}`}
            >
              {categoriaConfig.label}
            </span>

            {clausula.variables.length > 0 && (
              <span className="text-xs text-[#9aa3b8] flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {clausula.variables.length} variables
              </span>
            )}

            <span className="text-xs text-[#9aa3b8] flex items-center gap-1">
              <FileText className="w-3 h-3" />
              v{clausula.version}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="p-2 rounded-lg bg-[#dfeaff] text-[#69738c] hover:bg-[#dfeaff] transition-colors"
            title="Vista previa"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const VariableInput: React.FC<{
  variable: VariableClausula;
  value: string | number;
  onChange: (value: string | number) => void;
}> = ({ variable, value, onChange }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-[#69738c] flex items-center gap-2">
      {variable.nombre}
      {variable.requerida && <span className="text-red-500">*</span>}
    </label>
    {variable.tipo === "select" && variable.opciones
      ? (
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#bec8de40] text-sm"
        >
          {variable.opciones.map((opt) => (
            <option key={opt.valor} value={opt.valor}>{opt.etiqueta}</option>
          ))}
        </select>
      )
      : (
        <input
          type={variable.tipo === "numero" || variable.tipo === "porcentaje" ||
              variable.tipo === "moneda"
            ? "number"
            : "text"}
          value={value}
          onChange={(e) =>
            onChange(
              variable.tipo === "numero"
                ? Number(e.target.value)
                : e.target.value,
            )}
          placeholder={variable.descripcion}
          aria-label={variable.nombre}
          className="w-full px-3 py-2 rounded-lg border border-[#bec8de40] text-sm"
        />
      )}
    {variable.descripcion && (
      <p className="text-xs text-[#9aa3b8]">{variable.descripcion}</p>
    )}
  </div>
);

const PreviewModal: React.FC<{
  clausula: ClausulaLegal | null;
  valores: Record<string, string | number>;
  onClose: () => void;
  onAgregar: () => void;
  onValorChange: (nombre: string, valor: string | number) => void;
}> = ({ clausula, valores, onClose, onAgregar, onValorChange }) => {
  const clausulasService = useClausulas();

  if (!clausula) return null;

  const contenidoRenderizado = clausulasService.renderizar(
    clausula.id,
    valores,
  );
  const variablesPendientes = clausulasService.obtenerVariablesPendientes(
    clausula.id,
    valores,
  );
  const categoriaConfig = CATEGORIA_CONFIG[clausula.categoria];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-[#dfeaff] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#bec8de40]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-[#9aa3b8]">
                  {clausula.codigo}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${categoriaConfig.bgColor} ${categoriaConfig.color}`}
                >
                  {categoriaConfig.label}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#69738c]">
                {clausula.nombre}
              </h3>
            </div>
            <button
              aria-label="Cerrar"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#dfeaff] transition-colors"
            >
              <X className="w-5 h-5 text-[#9aa3b8]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Variables */}
          {clausula.variables.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Variables a completar
              </h4>
              <div className="grid gap-4">
                {clausula.variables.map((variable) => (
                  <VariableInput
                    key={variable.nombre}
                    variable={variable}
                    value={valores[variable.nombre] ??
                      variable.valorPorDefecto ?? ""}
                    onChange={(val) => onValorChange(variable.nombre, val)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="p-4 rounded-xl bg-[#dfeaff] border border-[#bec8de40]">
            <h4 className="text-sm font-medium text-[#9aa3b8] mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Vista previa
            </h4>
            <div className="prose prose-sm max-w-none">
              <p className="text-[#69738c] whitespace-pre-wrap">
                {contenidoRenderizado}
              </p>
            </div>
          </div>

          {/* Advertencias */}
          {variablesPendientes.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">
                Hay {variablesPendientes.length}{" "}
                variable(s) requerida(s) sin completar
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#bec8de40] flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-[#9aa3b8]">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Versión {clausula.version}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {clausula.usosCount} usos
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#bec8de40] text-[#69738c] hover:bg-[#dfeaff]"
            >
              Cancelar
            </button>
            <button
              onClick={onAgregar}
              disabled={variablesPendientes.length > 0}
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar al Contrato
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

interface ClausulasPanelProps {
  tipoContrato?: string;
  onSeleccion?: (clausulas: ClausulaLegal[]) => void;
  onClose?: () => void;
  clausulasSeleccionadas?: string[];
}

export const ClausulasPanel: React.FC<ClausulasPanelProps> = ({
  tipoContrato = "nuevo",
  onSeleccion,
  onClose,
  clausulasSeleccionadas: initialSeleccionadas = [],
}) => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<
    CategoriaClausula | "todas"
  >("todas");
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(
    new Set(initialSeleccionadas),
  );
  const [previewClausula, setPreviewClausula] = useState<ClausulaLegal | null>(
    null,
  );
  const [valoresVariables, setValoresVariables] = useState<
    Record<string, Record<string, string | number>>
  >({});

  const clausulasService = useClausulas();
  const todasClausulas = clausulasService.obtenerParaTipoContrato(tipoContrato);
  const categorias = clausulasService.obtenerCategorias();

  const clausulasFiltradas = useMemo(() => {
    return todasClausulas.filter((c) => {
      if (filtroCategoria !== "todas" && c.categoria !== filtroCategoria) {
        return false;
      }
      if (busqueda) {
        const query = busqueda.toLowerCase();
        return (
          c.nombre.toLowerCase().includes(query) ||
          c.contenido.toLowerCase().includes(query) ||
          c.codigo.toLowerCase().includes(query) ||
          c.tags.some((t) => t.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [todasClausulas, filtroCategoria, busqueda]);

  const handleToggleSeleccion = (id: string) => {
    const nuevaSeleccion = new Set(seleccionadas);
    if (nuevaSeleccion.has(id)) {
      nuevaSeleccion.delete(id);
    } else {
      nuevaSeleccion.add(id);
      clausulasService.registrarUso(id);
    }
    setSeleccionadas(nuevaSeleccion);
  };

  const handleConfirmar = () => {
    const clausulasSeleccionadasObj = todasClausulas.filter((c) =>
      seleccionadas.has(c.id)
    );
    onSeleccion?.(clausulasSeleccionadasObj);
  };

  const handleValorChange = (
    clausulaId: string,
    nombre: string,
    valor: string | number,
  ) => {
    setValoresVariables((prev) => ({
      ...prev,
      [clausulaId]: {
        ...(prev[clausulaId] || {}),
        [nombre]: valor,
      },
    }));
  };

  // Análisis de riesgo
  const analisisRiesgo = useMemo(() => {
    return clausulasService.calcularRiesgo(Array.from(seleccionadas));
  }, [clausulasService, seleccionadas]);

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
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Biblioteca de Cláusulas
              </h2>
              <p className="text-white/70 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {todasClausulas.length} cláusulas disponibles •{" "}
                {seleccionadas.size} seleccionadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleConfirmar}
              disabled={seleccionadas.size === 0}
              className="px-4 py-2 rounded-xl bg-[#dfeaff] text-[#6888ff] font-medium flex items-center gap-2 hover:bg-[#6888ff15] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar ({seleccionadas.size})
            </button>
            {onClose && (
              <button
                aria-label="Cerrar"
                onClick={onClose}
                className="p-2 rounded-lg bg-[#dfeaff]/20 text-white hover:bg-[#dfeaff]/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Análisis de riesgo */}
        {seleccionadas.size > 0 && (
          <div
            className={`
            mb-6 p-4 rounded-xl border
            ${
              analisisRiesgo.nivelRiesgo === "bajo"
                ? "bg-emerald-50 border-emerald-200"
                : analisisRiesgo.nivelRiesgo === "medio"
                ? "bg-blue-50 border-blue-200"
                : "bg-amber-50 border-amber-200"
            }
          `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`
                  p-2 rounded-lg
                  ${
                    analisisRiesgo.nivelRiesgo === "bajo"
                      ? "bg-emerald-100"
                      : analisisRiesgo.nivelRiesgo === "medio"
                      ? "bg-blue-100"
                      : "bg-amber-100"
                  }
                `}
                >
                  <Unlock
                    className={`w-5 h-5 ${
                      analisisRiesgo.nivelRiesgo === "bajo"
                        ? "text-emerald-600"
                        : analisisRiesgo.nivelRiesgo === "medio"
                        ? "text-blue-600"
                        : "text-amber-600"
                    }`}
                  />
                </div>
                <div>
                  <p className="font-medium text-[#69738c]">
                    Nivel de Riesgo: {analisisRiesgo.nivelRiesgo.toUpperCase()}
                  </p>
                  <p className="text-sm text-[#69738c]">
                    Score: {analisisRiesgo.riesgoTotal.toFixed(1)}
                  </p>
                </div>
              </div>

              {analisisRiesgo.recomendaciones.length > 0 && (
                <div className="text-right">
                  {analisisRiesgo.recomendaciones.map((rec, idx) => (
                    <p key={`rec-${idx}`} className="text-xs text-[#69738c]">
                      {rec}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9aa3b8]" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar cláusulas..."
              aria-label="Buscar cláusulas"
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#bec8de40] outline-none focus:ring-2 focus:ring-[#6888ff]/50"
            />
          </div>

          {/* Filtro categoría */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#9aa3b8]" />
            <select
              value={filtroCategoria}
              onChange={(e) =>
                setFiltroCategoria(e.target.value as typeof filtroCategoria)}
              className="px-3 py-2 rounded-lg border border-[#bec8de40] text-sm"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map(({ categoria, count }) => (
                <option key={categoria} value={categoria}>
                  {CATEGORIA_CONFIG[categoria].label} ({count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de cláusulas */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {clausulasFiltradas.map((clausula) => (
              <ClausulaCard
                key={clausula.id}
                clausula={clausula}
                isSelected={seleccionadas.has(clausula.id)}
                onSeleccionar={() => handleToggleSeleccion(clausula.id)}
                onPreview={() => setPreviewClausula(clausula)}
              />
            ))}
          </AnimatePresence>

          {clausulasFiltradas.length === 0 && (
            <div className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-[#9aa3b8] mx-auto mb-3" />
              <p className="text-[#9aa3b8]">
                No hay cláusulas que coincidan con los filtros
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Preview */}
      <AnimatePresence>
        {previewClausula && (
          <PreviewModal
            clausula={previewClausula}
            valores={valoresVariables[previewClausula.id] || {}}
            onClose={() => setPreviewClausula(null)}
            onAgregar={() => {
              handleToggleSeleccion(previewClausula.id);
              setPreviewClausula(null);
            }}
            onValorChange={(nombre, valor) =>
              handleValorChange(previewClausula.id, nombre, valor)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClausulasPanel;
