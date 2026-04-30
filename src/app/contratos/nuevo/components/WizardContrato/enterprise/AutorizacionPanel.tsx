/**
 * 🔐 SILEXAR PULSE - Panel de Autorización TIER 0
 *
 * @description Panel centralizado para gestión de autorizaciones anti-fraude.
 * Incluye evidencias de negociación, aprobaciones escalonadas, y justificaciones.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  History,
  Lock,
  MessageSquare,
  Paperclip,
  RefreshCw,
  Shield,
  Trash2,
  Unlock,
  Upload,
  User,
  XCircle,
} from "lucide-react";
import {
  AntiFraudeService,
  AprobacionContrato,
  ConfiguracionAntiFraude,
  EvidenciaNegociacion,
  NivelAprobacionAntiFraude,
} from "../services/AntiFraudeService";

// ═══════════════════════════════════════════════════════════════
// TIPOS LOCALES
// ═══════════════════════════════════════════════════════════════

interface AutorizacionPanelProps {
  contratoId?: string;
  descuentoPorcentaje: number;
  valorBruto?: number;
  valorNeto?: number;
  configuracion: ConfiguracionAntiFraude;
  onConfigChange: (config: ConfiguracionAntiFraude) => void;
  onEvidenciaUpload?: (file: File) => Promise<string>;
  usuarioActual: {
    id: string;
    nombre: string;
    email: string;
    rol: "ejecutivo" | "jefatura" | "gerente_comercial" | "gerente_general";
  };
  readOnly?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE EVIDENCIA
// ═══════════════════════════════════════════════════════════════

const EvidenciaCard: React.FC<{
  evidencia: EvidenciaNegociacion;
  onView: () => void;
  onDelete: () => void;
  onValidar?: () => void;
  puedeValidar: boolean;
}> = ({ evidencia, onView, onDelete, onValidar, puedeValidar }) => {
  const tipoLabels: Record<string, string> = {
    "email_cliente": "📧 Email del Cliente",
    "orden_compra": "📋 Orden de Compra",
    "cotizacion_firmada": "✍️ Cotización Firmada",
    "whatsapp_chat": "💬 WhatsApp",
    "grabacion_llamada": "🎙️ Grabación",
    "minuta_reunion": "📝 Minuta Reunión",
    "otro": "📁 Otro Documento",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-4 rounded-xl border-2 transition-all
        ${
        evidencia.validado
          ? "border-[#bec8de] bg-[#6888ff]/5"
          : "border-[#bec8de40] bg-[#dfeaff] hover:border-[#6888ff30]"
      }
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
          p-2 rounded-lg
          ${evidencia.validado ? "bg-[#6888ff]/10" : "bg-[#dfeaff]"}
        `}
        >
          <FileText
            className={`w-5 h-5 ${
              evidencia.validado ? "text-[#6888ff]" : "text-[#9aa3b8]"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-[#69738c] truncate">
              {evidencia.nombre}
            </h4>
            {evidencia.validado && (
              <span className="px-2 py-0.5 rounded-full bg-[#6888ff]/10 text-[#6888ff] text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Validada
              </span>
            )}
          </div>
          <p className="text-sm text-[#9aa3b8]">{tipoLabels[evidencia.tipo]}</p>
          <p className="text-xs text-[#9aa3b8] mt-1">
            Subido por {evidencia.subidoPor.nombre} •{" "}
            {new Date(evidencia.fechaSubida).toLocaleDateString("es-CL")}
          </p>
          {evidencia.validadoPor && (
            <p className="text-xs text-[#6888ff] mt-1">
              ✓ Validado por {evidencia.validadoPor.nombre}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onView}
            className="p-2 rounded-lg hover:bg-[#dfeaff] text-[#9aa3b8] transition-colors"
            title="Ver documento"
          >
            <Eye className="w-4 h-4" />
          </button>

          {!evidencia.validado && puedeValidar && onValidar && (
            <button
              onClick={onValidar}
              className="p-2 rounded-lg hover:bg-[#6888ff]/10 text-[#6888ff] transition-colors"
              title="Validar evidencia"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          {!evidencia.validado && (
            <button
              onClick={onDelete}
              className="p-2 rounded-lg hover:bg-[#dfeaff] text-[#9aa3b8] transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE NIVEL DE APROBACIÓN
// ═══════════════════════════════════════════════════════════════

const NivelAprobacionCard: React.FC<{
  nivel: NivelAprobacionAntiFraude;
  aprobacion?: AprobacionContrato;
  esRequerido: boolean;
  puedeAprobar: boolean;
  onAprobar: (aprobado: boolean, comentarios?: string) => void;
}> = ({ nivel, aprobacion, esRequerido, puedeAprobar, onAprobar }) => {
  const [showForm, setShowForm] = useState(false);
  const [comentarios, setComentarios] = useState("");

  const nivelInfo: Record<
    NivelAprobacionAntiFraude,
    { titulo: string; color: string }
  > = {
    "jefatura_directa": {
      titulo: "Jefatura Directa",
      color: "from-[#6888ff] to-[#5572ee]",
    },
    "gerente_comercial": {
      titulo: "Gerente Comercial",
      color: "from-[#6888ff] to-[#5572ee]",
    },
    "gerente_general": {
      titulo: "Gerente General",
      color: "from-[#6888ff] to-[#5572ee]",
    },
  };

  const info = nivelInfo[nivel];

  const getEstadoContent = () => {
    if (!esRequerido) {
      return (
        <span className="px-3 py-1 rounded-lg bg-[#dfeaff] text-[#9aa3b8] text-sm">
          No requerido
        </span>
      );
    }

    if (!aprobacion || aprobacion.estado === "pendiente") {
      return (
        <span className="px-3 py-1 rounded-lg bg-[#6888ff]/10 text-[#6888ff] text-sm flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pendiente
        </span>
      );
    }

    if (aprobacion.estado === "aprobado") {
      return (
        <span className="px-3 py-1 rounded-lg bg-[#6888ff]/10 text-[#6888ff] text-sm flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Aprobado
        </span>
      );
    }

    return (
      <span className="px-3 py-1 rounded-lg bg-[#dfeaff] text-[#9aa3b8] text-sm flex items-center gap-1">
        <XCircle className="w-3 h-3" />
        Rechazado
      </span>
    );
  };

  return (
    <div
      className={`
      p-4 rounded-xl border-2 transition-all
      ${!esRequerido ? "opacity-40 border-[#bec8de20]" : "border-[#bec8de40]"}
      ${
        aprobacion?.estado === "aprobado"
          ? "border-[#bec8de] bg-[#6888ff]/5/50"
          : ""
      }
      ${aprobacion?.estado === "rechazado" ? "border-[#bec8de] bg-[#dfeaff]/50" : ""}
    `}
    >
      <div className="flex items-center gap-4">
        <div
          className={`
          w-12 h-12 rounded-xl bg-gradient-to-br ${info.color}
          flex items-center justify-center text-white shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]
        `}
        >
          <User className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-[#69738c]">{info.titulo}</h4>
          {aprobacion?.aprobadorNombre && (
            <p className="text-sm text-[#9aa3b8]">
              {aprobacion.aprobadorNombre}
            </p>
          )}
          {aprobacion?.fecha && (
            <p className="text-xs text-[#9aa3b8]">
              {new Date(aprobacion.fecha).toLocaleString("es-CL")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {getEstadoContent()}

          {puedeAprobar && esRequerido && aprobacion?.estado === "pendiente" &&
            (
              <button
                onClick={() => setShowForm(!showForm)}
                className="p-2 rounded-lg bg-[#6888ff25] text-[#6888ff] hover:bg-[#6888ff]/20 transition-colors"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showForm ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
        </div>
      </div>

      {/* Comentarios si existen */}
      {aprobacion?.comentarios && (
        <div className="mt-3 p-3 rounded-lg bg-[#dfeaff]">
          <p className="text-sm text-[#69738c]">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            {aprobacion.comentarios}
          </p>
        </div>
      )}

      {/* Formulario de aprobación */}
      <AnimatePresence>
        {showForm && puedeAprobar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-[#bec8de40] space-y-3">
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Comentarios (opcional para aprobar, obligatorio para rechazar)"
                className="w-full p-3 rounded-lg border border-[#bec8de40] text-sm resize-none"
                rows={2}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onAprobar(true, comentarios);
                    setShowForm(false);
                    setComentarios("");
                  }}
                  className="flex-1 py-2 rounded-lg bg-[#6888ff]/50 text-white font-medium hover:bg-[#6888ff] flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Aprobar
                </button>

                <button
                  onClick={() => {
                    if (!comentarios.trim()) {
                      alert("Debe ingresar un comentario para rechazar");
                      return;
                    }
                    onAprobar(false, comentarios);
                    setShowForm(false);
                    setComentarios("");
                  }}
                  className="flex-1 py-2 rounded-lg bg-[#dfeaff]0 text-white font-medium hover:bg-[#6888ff] flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Rechazar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const AutorizacionPanel: React.FC<AutorizacionPanelProps> = ({
  descuentoPorcentaje,
  configuracion,
  onConfigChange,
  onEvidenciaUpload,
  usuarioActual,
  readOnly = false,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "evidencias",
  );
  const [justificacionTexto, setJustificacionTexto] = useState(
    configuracion.justificacionDescuento?.texto || "",
  );
  const [uploading, setUploading] = useState(false);

  // Calcular reglas de aprobación
  const reglas = useMemo(
    () => AntiFraudeService.determinarNivelesAprobacion(descuentoPorcentaje),
    [descuentoPorcentaje],
  );

  // Validación general
  const validacion = useMemo(
    () => AntiFraudeService.validarContrato(configuracion, descuentoPorcentaje),
    [configuracion, descuentoPorcentaje],
  );

  // Verificar permisos de usuario
  const puedeValidarEvidencias = [
    "jefatura",
    "gerente_comercial",
    "gerente_general",
  ].includes(usuarioActual.rol);

  const puedeAprobarNivel = (nivel: NivelAprobacionAntiFraude): boolean => {
    if (readOnly) return false;
    if (nivel === "jefatura_directa") return usuarioActual.rol === "jefatura";
    if (nivel === "gerente_comercial") {
      return usuarioActual.rol === "gerente_comercial";
    }
    if (nivel === "gerente_general") {
      return usuarioActual.rol === "gerente_general";
    }
    return false;
  };

  // Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const url = onEvidenciaUpload
          ? await onEvidenciaUpload(file)
          : URL.createObjectURL(file);

        const hash = await AntiFraudeService.generarHashDocumento(file);

        const nuevaEvidencia: EvidenciaNegociacion = {
          id: crypto.randomUUID(),
          tipo: "otro",
          nombre: file.name,
          url,
          fechaSubida: new Date(),
          subidoPor: {
            id: usuarioActual.id,
            nombre: usuarioActual.nombre,
          },
          validado: false,
          hash,
        };

        onConfigChange({
          ...configuracion,
          evidenciasSubidas: [
            ...configuracion.evidenciasSubidas,
            nuevaEvidencia,
          ],
        });
      }
    } finally {
      setUploading(false);
    }

    e.target.value = "";
  };

  const handleDeleteEvidencia = (id: string) => {
    onConfigChange({
      ...configuracion,
      evidenciasSubidas: configuracion.evidenciasSubidas.filter((e) =>
        e.id !== id
      ),
    });
  };

  const handleValidarEvidencia = (id: string) => {
    onConfigChange({
      ...configuracion,
      evidenciasSubidas: configuracion.evidenciasSubidas.map((e) =>
        e.id === id
          ? {
            ...e,
            validado: true,
            validadoPor: {
              id: usuarioActual.id,
              nombre: usuarioActual.nombre,
              fecha: new Date(),
            },
          }
          : e
      ),
    });
  };

  const handleAprobacion = (
    nivel: NivelAprobacionAntiFraude,
    aprobado: boolean,
    comentarios?: string,
  ) => {
    const nuevasAprobaciones = AntiFraudeService.registrarAprobacion(
      configuracion.aprobaciones,
      nivel,
      usuarioActual.id,
      usuarioActual.nombre,
      usuarioActual.email,
      aprobado,
      comentarios,
      nivel === "gerente_general" && reglas.requiereJustificacion
        ? justificacionTexto
        : undefined,
    );

    // Determinar nuevo estado
    const todasAprobadas = AntiFraudeService.todasAprobacionesCompletas(
      nuevasAprobaciones,
      reglas.nivelesRequeridos,
    );

    const tieneEvidencias = configuracion.evidenciasSubidas.length > 0;
    const tieneJustificacion = reglas.requiereJustificacion
      ? !!justificacionTexto.trim()
      : true;

    const nuevoEstado = AntiFraudeService.determinarEstadoContrato(
      tieneEvidencias,
      todasAprobadas,
      tieneJustificacion,
      reglas.requiereJustificacion,
      false,
    );

    onConfigChange({
      ...configuracion,
      aprobaciones: nuevasAprobaciones,
      estado: nuevoEstado,
      puedeCargarCampanas: nuevoEstado === "operativo",
      justificacionDescuento:
        reglas.requiereJustificacion && justificacionTexto.trim()
          ? {
            texto: justificacionTexto,
            documentos: [],
            fechaCreacion: new Date(),
            creadoPor: { id: usuarioActual.id, nombre: usuarioActual.nombre },
          }
          : configuracion.justificacionDescuento,
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-6">
      {/* Header con estado general */}
      <div
        className={`
        p-5 rounded-2xl border-2 transition-all
        ${
          configuracion.estado === "operativo"
            ? "border-[#bec8de] bg-gradient-to-r from-[#6888ff]/10 to-[#6888ff]/20"
            : configuracion.estado === "pendiente_reaprobacion"
            ? "border-[#bec8de] bg-gradient-to-r from-[#6888ff] to-[#5572ee]"
            : "border-[#bec8de40] bg-[#dfeaff]"
        }
      `}
      >
        <div className="flex items-center gap-4">
          <div
            className={`
            p-3 rounded-xl
            ${
              configuracion.estado === "operativo"
                ? "bg-[#6888ff]/20"
                : configuracion.estado === "pendiente_reaprobacion"
                ? "bg-[#6888ff]/20"
                : "bg-[#dfeaff]"
            }
          `}
          >
            {configuracion.estado === "operativo"
              ? <Unlock className="w-6 h-6 text-[#6888ff]" />
              : <Lock className="w-6 h-6 text-[#69738c]" />}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#69738c]">
              {configuracion.estado === "operativo"
                ? "✅ Contrato Operativo"
                : configuracion.estado === "pendiente_reaprobacion"
                ? "⚠️ Requiere Re-aprobación"
                : "🔒 Contrato Bloqueado"}
            </h3>
            <p className="text-sm text-[#69738c]">
              {configuracion.puedeCargarCampanas
                ? "Puede crear campañas y cargar materiales"
                : validacion.errores[0] ||
                  "Complete los requisitos para activar"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-[#9aa3b8]">Descuento</p>
            <p
              className={`text-2xl font-bold ${
                descuentoPorcentaje >= 65
                  ? "text-[#9aa3b8]"
                  : descuentoPorcentaje > 50
                  ? "text-[#6888ff]"
                  : "text-[#69738c]"
              }`}
            >
              {descuentoPorcentaje}%
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-[#9aa3b8] mb-1">
            <span>Progreso de autorización</span>
            <span>
              {Math.round(
                (configuracion.aprobaciones.filter((a) =>
                  a.estado === "aprobado"
                ).length / reglas.nivelesRequeridos.length) * 100,
              )}%
            </span>
          </div>
          <div className="h-2 bg-[#dfeaff] rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                configuracion.estado === "operativo"
                  ? "bg-[#6888ff]/50"
                  : "bg-[#6888ff]/50"
              }`}
              initial={{ width: 0 }}
              animate={{
                width: `${
                  (configuracion.aprobaciones.filter((a) =>
                    a.estado === "aprobado"
                  ).length / reglas.nivelesRequeridos.length) * 100
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Sección: Evidencias */}
      <div className="rounded-2xl border border-[#bec8de40] overflow-hidden">
        <button
          onClick={() => toggleSection("evidencias")}
          className="w-full p-4 flex items-center justify-between bg-[#dfeaff] hover:bg-[#dfeaff] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#6888ff]/10">
              <Paperclip className="w-5 h-5 text-[#6888ff]" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-[#69738c]">
                Evidencia de Negociación
              </h4>
              <p className="text-sm text-[#9aa3b8]">
                {configuracion.evidenciasSubidas.length} documento(s) adjunto(s)
              </p>
            </div>
          </div>
          <ChevronRight
            className={`w-5 h-5 text-[#9aa3b8] transition-transform ${
              expandedSection === "evidencias" ? "rotate-90" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {expandedSection === "evidencias" && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 border-t border-[#bec8de20] space-y-3">
                {/* Lista de evidencias */}
                {configuracion.evidenciasSubidas.map((evidencia) => (
                  <EvidenciaCard
                    key={evidencia.id}
                    evidencia={evidencia}
                    onView={() => window.open(evidencia.url, "_blank")}
                    onDelete={() => handleDeleteEvidencia(evidencia.id)}
                    onValidar={puedeValidarEvidencias
                      ? () => handleValidarEvidencia(evidencia.id)
                      : undefined}
                    puedeValidar={puedeValidarEvidencias}
                  />
                ))}

                {/* Zona de upload */}
                {!readOnly && (
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp3,.mp4"
                    />
                    <div
                      className={`
                      p-6 rounded-xl border-2 border-dashed border-[#bec8de50]
                      hover:border-[#bec8de] hover:bg-[#6888ff15] transition-all
                      flex flex-col items-center justify-center gap-2
                      ${uploading ? "opacity-50" : ""}
                    `}
                    >
                      {uploading
                        ? (
                          <RefreshCw className="w-8 h-8 text-[#6888ff] animate-spin" />
                        )
                        : <Upload className="w-8 h-8 text-[#9aa3b8]" />}
                      <p className="text-sm text-[#9aa3b8]">
                        {uploading
                          ? "Subiendo..."
                          : "Clic o arrastra archivos para adjuntar"}
                      </p>
                      <p className="text-xs text-[#9aa3b8]">
                        PDF, Word, imágenes, audio o video
                      </p>
                    </div>
                  </label>
                )}

                {configuracion.evidenciasSubidas.length === 0 && (
                  <div className="p-4 rounded-lg bg-[#6888ff]/5 border border-[#bec8de]">
                    <p className="text-sm text-[#6888ff] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Debe adjuntar al menos 1 evidencia de negociación con el
                      cliente
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sección: Aprobaciones */}
      <div className="rounded-2xl border border-[#bec8de40] overflow-hidden">
        <button
          onClick={() => toggleSection("aprobaciones")}
          className="w-full p-4 flex items-center justify-between bg-[#dfeaff] hover:bg-[#dfeaff] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#6888ff]/10">
              <Shield className="w-5 h-5 text-[#6888ff]" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-[#69738c]">
                Cadena de Aprobación
              </h4>
              <p className="text-sm text-[#9aa3b8]">
                {AntiFraudeService.getDescripcionNiveles(reglas)}
              </p>
            </div>
          </div>
          <ChevronRight
            className={`w-5 h-5 text-[#9aa3b8] transition-transform ${
              expandedSection === "aprobaciones" ? "rotate-90" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {expandedSection === "aprobaciones" && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 border-t border-[#bec8de20] space-y-3">
                {([
                  "jefatura_directa",
                  "gerente_comercial",
                  "gerente_general",
                ] as NivelAprobacionAntiFraude[]).map((nivel) => (
                  <NivelAprobacionCard
                    key={nivel}
                    nivel={nivel}
                    aprobacion={configuracion.aprobaciones.find((a) =>
                      a.nivel === nivel
                    )}
                    esRequerido={reglas.nivelesRequeridos.includes(nivel)}
                    puedeAprobar={puedeAprobarNivel(nivel)}
                    onAprobar={(aprobado, comentarios) =>
                      handleAprobacion(nivel, aprobado, comentarios)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sección: Justificación (solo si descuento >= 65%) */}
      {reglas.requiereJustificacion && (
        <div className="rounded-2xl border-2 border-[#bec8de] overflow-hidden bg-[#6888ff]/5">
          <button
            onClick={() => toggleSection("justificacion")}
            className="w-full p-4 flex items-center justify-between hover:bg-[#6888ff]/10/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#6888ff]/20">
                <MessageSquare className="w-5 h-5 text-[#6888ff]" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-[#6888ff]">
                  Justificación Obligatoria
                </h4>
                <p className="text-sm text-[#6888ff]">
                  Descuento ≥65% requiere justificación escrita
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-5 h-5 text-[#6888ff] transition-transform ${
                expandedSection === "justificacion" ? "rotate-90" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {expandedSection === "justificacion" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 border-t border-[#bec8de]">
                  <textarea
                    value={justificacionTexto}
                    onChange={(e) => setJustificacionTexto(e.target.value)}
                    placeholder="Explique detalladamente los motivos que justifican este nivel de descuento..."
                    className="w-full p-4 rounded-xl border border-[#bec8de] bg-[#dfeaff] text-sm resize-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    rows={4}
                    disabled={readOnly ||
                      !!configuracion.justificacionDescuento?.texto}
                  />

                  {configuracion.justificacionDescuento && (
                    <p className="mt-2 text-xs text-[#6888ff]">
                      Justificación registrada por{" "}
                      {configuracion.justificacionDescuento.creadoPor.nombre}
                      el {new Date(
                        configuracion.justificacionDescuento.fechaCreacion,
                      ).toLocaleDateString("es-CL")}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Sección: Historial de cambios */}
      {configuracion.historialCambios.length > 0 && (
        <div className="rounded-2xl border border-[#bec8de40] overflow-hidden">
          <button
            onClick={() => toggleSection("historial")}
            className="w-full p-4 flex items-center justify-between bg-[#dfeaff] hover:bg-[#dfeaff] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#dfeaff]">
                <History className="w-5 h-5 text-[#69738c]" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-[#69738c]">
                  Historial de Modificaciones
                </h4>
                <p className="text-sm text-[#9aa3b8]">
                  {configuracion.historialCambios.length} cambio(s) detectado(s)
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-5 h-5 text-[#9aa3b8] transition-transform ${
                expandedSection === "historial" ? "rotate-90" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {expandedSection === "historial" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 border-t border-[#bec8de20]">
                  <div className="space-y-2">
                    {configuracion.historialCambios.map((cambio) => (
                      <div
                        key={cambio.id}
                        className={`
                          p-3 rounded-lg border
                          ${
                          cambio.requiereReaprobacion
                            ? "border-[#bec8de] bg-[#dfeaff]"
                            : "border-[#bec8de40] bg-[#dfeaff]"
                        }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#69738c]">
                            {cambio.campo === "descuento" && "% Descuento"}
                            {cambio.campo === "valorBruto" && "Valor Bruto"}
                            {cambio.campo === "valorNeto" && "Valor Neto"}
                            {cambio.campo === "lineas" &&
                              "Líneas de Especificación"}
                          </span>
                          {cambio.requiereReaprobacion && (
                            <span className="px-2 py-0.5 rounded bg-[#dfeaff] text-[#9aa3b8] text-xs">
                              Requiere re-aprobación
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#9aa3b8] mt-1">
                          {String(cambio.valorAnterior)} →{" "}
                          {String(cambio.valorNuevo)}
                        </p>
                        <p className="text-xs text-[#9aa3b8]">
                          Por {cambio.usuarioNombre} •{" "}
                          {new Date(cambio.fecha).toLocaleString("es-CL")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AutorizacionPanel;
