/**
 * ⚡ DESKTOP WIZARD EXPRESS — Creación Rápida de Contratos IA
 *
 * Wizard compacto de 3 pasos para desktop que permite
 * crear contratos directamente desde Smart Capture.
 * Muestra los datos en layout desktop optimizado con tablas.
 *
 * Flujo:
 *   1. Resumen IA → borrador editable con campos detectados
 *   2. Líneas de Pauta → tabla de emisoras con edición inline
 *   3. Confirmar → resumen final y creación del contrato
 *
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

"use client";

import { useCallback, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Globe,
  History,
  Loader2,
  Newspaper,
  Package,
  PartyPopper,
  Plus,
  Radio,
  Send,
  Shield,
  Sparkles,
  Trash2,
  Tv,
  X,
} from "lucide-react";
import type {
  ContratoSugerido,
  DatosExtraidos,
  LineaPautaSugerida,
  ResultadoCaptura,
} from "../../../_shared/useSmartCapture";
import { useSmartCapture } from "../../../_shared/useSmartCapture";

// ═══════════════════════════════════════════════════════════════
// CATÁLOGO DESKTOP
// ═══════════════════════════════════════════════════════════════

const CATALOGO: {
  id: string;
  nombre: string;
  categoria: LineaPautaSugerida["categoria"];
  producto: string;
  tarifa: number;
}[] = [
  {
    id: "med-001",
    nombre: "Radio Corazón",
    categoria: "Radio",
    producto: "Radio FM",
    tarifa: 450000,
  },
  {
    id: "med-002",
    nombre: "FM Dos",
    categoria: "Radio",
    producto: "Radio FM",
    tarifa: 380000,
  },
  {
    id: "med-003",
    nombre: "Radio Futuro",
    categoria: "Radio",
    producto: "Radio FM",
    tarifa: 350000,
  },
  {
    id: "med-004",
    nombre: "ADN Radio",
    categoria: "Radio",
    producto: "Radio FM",
    tarifa: 520000,
  },
  {
    id: "med-005",
    nombre: "Canal 13",
    categoria: "Televisión",
    producto: "TV Abierta",
    tarifa: 2500000,
  },
  {
    id: "med-006",
    nombre: "CHV",
    categoria: "Televisión",
    producto: "TV Abierta",
    tarifa: 2200000,
  },
  {
    id: "med-007",
    nombre: "Mega",
    categoria: "Televisión",
    producto: "TV Abierta",
    tarifa: 2000000,
  },
  {
    id: "med-008",
    nombre: "Google Ads",
    categoria: "Digital",
    producto: "Digital SEM",
    tarifa: 150000,
  },
  {
    id: "med-009",
    nombre: "Meta Ads",
    categoria: "Digital",
    producto: "Digital Social",
    tarifa: 120000,
  },
  {
    id: "med-010",
    nombre: "El Mercurio",
    categoria: "Prensa",
    producto: "Prensa Escrita",
    tarifa: 800000,
  },
];

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type WizardStep = "resumen" | "lineas" | "confirmar";

interface WizardExpressContainerProps {
  resultado: ResultadoCaptura;
  onBack: () => void;
  onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function WizardExpressContainer(
  { resultado, onBack, onClose }: WizardExpressContainerProps,
) {
  const [step, setStep] = useState<WizardStep>("resumen");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedNum, setCopiedNum] = useState(false);

  const {
    confirming,
    confirmacion,
    error,
    confirmarBorrador,
    actualizarLinea,
    agregarLinea,
    eliminarLinea,
    resultado: resultadoActual,
  } = useSmartCapture();

  const contrato: ContratoSugerido = resultadoActual?.contratoSugerido ||
    resultado.contratoSugerido;
  const datos: DatosExtraidos = resultadoActual?.datosExtraidos ||
    resultado.datosExtraidos;
  const lineas = contrato.lineasPauta;

  const stepIndex = step === "resumen" ? 0 : step === "lineas" ? 1 : 2;
  const totalNeto = lineas.reduce((s, l) => s + l.totalNeto, 0);
  // totalBruto available if needed: lineas.reduce((s, l) => s + l.subtotal, 0)
  const emisorasEnUso = new Set(lineas.map((l) => l.medioId));

  const handleConfirmar = useCallback(async () => {
    await confirmarBorrador(resultado.borradorId, contrato);
  }, [confirmarBorrador, resultado.borradorId, contrato]);

  const handleAddEmisora = (e: typeof CATALOGO[0]) => {
    const cantidad = 10;
    const subtotal = e.tarifa * cantidad;
    const net = subtotal * (1 - contrato.descuento / 100);
    agregarLinea({
      id: `lp-${e.id}-${Date.now()}`,
      medioId: e.id,
      medioNombre: e.nombre,
      categoria: e.categoria,
      productoNombre: e.producto,
      cantidad,
      tarifaUnitaria: e.tarifa,
      descuento: contrato.descuento,
      subtotal,
      totalNeto: net,
      fechaInicio: contrato.fechaInicio,
      fechaFin: contrato.fechaFin,
      confianza: 100,
      fuenteDeteccion: "manual",
      disponibilidad: { estado: "disponible", porcentaje: 80 },
    });
    setShowAddModal(false);
  };

  const handleCantidadChange = (
    id: string,
    l: LineaPautaSugerida,
    newQty: number,
  ) => {
    if (newQty < 1) return;
    const sub = l.tarifaUnitaria * newQty;
    actualizarLinea(id, {
      cantidad: newQty,
      subtotal: sub,
      totalNeto: sub * (1 - l.descuento / 100),
    });
  };

  const copyNumero = () => {
    if (confirmacion?.numero) {
      navigator.clipboard.writeText(confirmacion.numero);
      setCopiedNum(true);
      setTimeout(() => setCopiedNum(false), 2000);
    }
  };

  // ═══════════════════════════════════════════
  // PANTALLA DE ÉXITO
  // ═══════════════════════════════════════════

  if (confirmacion) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#10b981] flex items-center justify-center mx-auto shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] shadow-emerald-200">
          <PartyPopper className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#69738c]">
            Contrato Creado
          </h2>
          <p className="text-sm text-[#9aa3b8] mt-1">{confirmacion.mensaje}</p>
        </div>
        <div className="bg-[#dfeaff] border border-[#bec8de40] rounded-2xl p-5 inline-block">
          <p className="text-xs text-[#9aa3b8] uppercase font-bold tracking-widest">
            Número de contrato
          </p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <p className="text-3xl font-mono font-black text-[#6888ff]">
              {confirmacion.numero}
            </p>
            <button
              onClick={copyNumero}
              className="p-2 rounded-xl bg-[#6888ff25] hover:bg-indigo-200 transition"
            >
              {copiedNum
                ? <Check className="w-5 h-5 text-emerald-500" />
                : <Copy className="w-5 h-5 text-[#6888ff]" />}
            </button>
          </div>
        </div>
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
            confirmacion.estado === "activo"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {confirmacion.estado === "activo"
            ? <CheckCircle2 className="w-5 h-5" />
            : <Shield className="w-5 h-5" />}
          <span className="text-sm font-bold">
            {confirmacion.estado === "activo"
              ? "Activo"
              : "Pendiente de aprobación"}
          </span>
        </div>
        <div className="flex gap-3 justify-center">
          {confirmacion.pdfUrl && (
            <button className="px-5 py-3 border border-[#6888ff30] text-[#6888ff] rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#6888ff15] transition">
              <FileText className="w-4 h-4" /> Ver PDF{" "}
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Listo
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // WIZARD PRINCIPAL
  // ═══════════════════════════════════════════

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER + STEPPER */}
      <div className="flex items-center gap-4">
        <button
          onClick={step === "resumen"
            ? onBack
            : () => setStep(step === "confirmar" ? "lineas" : "resumen")}
          className="p-2 rounded-xl bg-[#dfeaff] border border-[#bec8de40] hover:bg-[#dfeaff] transition"
        >
          <ArrowLeft className="w-5 h-5 text-[#69738c]" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-black text-[#69738c] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6888ff]" /> Wizard Express
          </h2>
        </div>
        {/* STEPPER */}
        <div className="flex items-center gap-2">
          {["Resumen IA", "Líneas de Pauta", "Confirmar"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i === stepIndex
                    ? "bg-indigo-600 text-white"
                    : i < stepIndex
                    ? "bg-emerald-500 text-white"
                    : "bg-[#dfeaff] text-[#9aa3b8]"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  i === stepIndex ? "text-[#6888ff]" : "text-[#9aa3b8]"
                }`}
              >
                {label}
              </span>
              {i < 2 && (
                <div
                  className={`w-8 h-0.5 ${
                    i < stepIndex ? "bg-emerald-400" : "bg-[#dfeaff]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {
        /* ═════════════════════════════════════════
          PASO 1: RESUMEN IA
         ═════════════════════════════════════════ */
      }
      {step === "resumen" && (
        <div className="grid grid-cols-3 gap-5">
          {/* DATOS PRINCIPALES */}
          <div className="col-span-2 space-y-4">
            <div className="bg-[#dfeaff] rounded-2xl border border-[#bec8de20] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] overflow-hidden">
              <div className="px-5 py-3 bg-[#dfeaff] border-b border-[#bec8de20] font-bold text-sm text-[#69738c] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#6888ff]" />{" "}
                Datos del Contrato
              </div>
              <div className="divide-y divide-slate-50">
                <DesktopField
                  label="Cliente"
                  value={contrato.cliente.nombre}
                  badge={contrato.cliente.esNuevo ? "Nuevo" : "Existente"}
                  badgeColor={contrato.cliente.esNuevo
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"}
                />
                <DesktopField
                  label="Tipo contrato"
                  value={datos.tipoContrato}
                />
                <DesktopField label="Valor" value={fmt(contrato.valor)} />
                <DesktopField
                  label="Descuento"
                  value={`${contrato.descuento}%`}
                />
                <DesktopField
                  label="Período"
                  value={`${fmtDate(contrato.fechaInicio)} → ${
                    fmtDate(contrato.fechaFin)
                  }`}
                />
                <DesktopField
                  label="Pago"
                  value={`${contrato.terminosPago} días · ${datos.facturacion.modalidad}`}
                />
              </div>
            </div>

            {/* MEDIOS */}
            {datos.mediosDetectados.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {datos.mediosDetectados.map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1.5 bg-[#6888ff15] border border-[#6888ff20] rounded-full text-xs font-bold text-[#6888ff] flex items-center gap-1.5"
                  >
                    {catIcon(m)} {m}
                  </span>
                ))}
              </div>
            )}

            {lineas.length > 0 && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-[#6888ff20]">
                <p className="text-sm font-bold text-[#6888ff]">
                  {lineas.length} línea{lineas.length > 1 ? "s" : ""}{" "}
                  de pauta detectada{lineas.length > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-[#6888ff]">
                  Total: {fmt(totalNeto)}
                </p>
              </div>
            )}
          </div>

          {/* CONFIANZA + META */}
          <div className="space-y-4">
            <div
              className={`p-4 rounded-2xl border ${
                datos.confianzaGlobal >= 85
                  ? "bg-emerald-50 border-emerald-200"
                  : datos.confianzaGlobal >= 70
                  ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <Sparkles
                className={`w-6 h-6 ${
                  datos.confianzaGlobal >= 85
                    ? "text-emerald-500"
                    : "text-amber-500"
                }`}
              />
              <p className="text-3xl font-black mt-2">
                {datos.confianzaGlobal}%
              </p>
              <p className="text-xs text-[#9aa3b8]">Confianza IA</p>
              {datos.lineasClonadas && (
                <span className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                  <History className="w-3 h-3" /> Desde historial
                </span>
              )}
            </div>

            {datos.camposFaltantes.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Campos pendientes
                </p>
                <p className="text-[10px] text-amber-600 mt-1">
                  {datos.camposFaltantes.join(", ")}
                </p>
              </div>
            )}

            {contrato.aprobacionRequerida && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <p className="text-xs font-bold text-purple-700 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Aprobación:{" "}
                  {contrato.nivelAprobacion}
                </p>
                {contrato.motivoAprobacion && (
                  <p className="text-[10px] text-purple-500 mt-1">
                    {contrato.motivoAprobacion}
                  </p>
                )}
              </div>
            )}

            {/* CAMPOS DETECTADOS */}
            <div className="bg-[#dfeaff] rounded-2xl border border-[#bec8de20] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]">
              <div className="px-4 py-2 bg-[#dfeaff] border-b border-[#bec8de20] text-xs font-bold text-[#9aa3b8]">
                Campos detectados ({datos.camposDetectados.length})
              </div>
              <div className="divide-y divide-slate-50 max-h-48 overflow-y-auto">
                {datos.camposDetectados.map((c, i) => (
                  <div
                    key={`${c}-${i}`}
                    className="px-4 py-2 flex items-center gap-2 text-xs"
                  >
                    <span className="text-[#9aa3b8] w-20">{c.campo}</span>
                    <span className="font-bold text-[#69738c] flex-1 truncate">
                      {String(c.valor)}
                    </span>
                    <span
                      className={`font-bold ${
                        c.confianza >= 85
                          ? "text-emerald-500"
                          : "text-amber-500"
                      }`}
                    >
                      {c.confianza}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOTÓN */}
          <div className="col-span-3 flex justify-end">
            <button
              onClick={() => setStep("lineas")}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] shadow-indigo-200"
            >
              Revisar Líneas de Pauta <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {
        /* ═════════════════════════════════════════
          PASO 2: LÍNEAS DE PAUTA (TABLA)
         ═════════════════════════════════════════ */
      }
      {step === "lineas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#69738c]">
              {lineas.length} línea{lineas.length !== 1 ? "s" : ""} de pauta
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" /> Agregar emisora
            </button>
          </div>

          {lineas.length === 0
            ? (
              <div className="text-center py-12 bg-[#dfeaff] rounded-2xl border border-[#bec8de20]">
                <Package className="w-16 h-16 text-[#9aa3b8] mx-auto" />
                <p className="mt-4 text-lg font-bold text-[#9aa3b8]">
                  Sin líneas de pauta
                </p>
                <p className="text-sm text-[#9aa3b8]">
                  Agrega emisoras para completar el contrato
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                >
                  <Plus className="w-4 h-4 inline mr-1" /> Agregar emisora
                </button>
              </div>
            )
            : (
              <div className="bg-[#dfeaff] rounded-2xl border border-[#bec8de20] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#dfeaff] border-b border-[#bec8de20]">
                      <th className="px-4 py-3 text-left text-xs font-bold text-[#9aa3b8]">
                        Medio
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-[#9aa3b8]">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-[#9aa3b8]">
                        Tarifa
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-[#9aa3b8]">
                        Horario
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-[#9aa3b8]">
                        Disp.
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-[#9aa3b8]">
                        Total Neto
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-[#9aa3b8] w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {lineas.map((l) => (
                      <tr
                        key={l.id}
                        className="hover:bg-[#dfeaff]/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                catColor(l.categoria)
                              }`}
                            >
                              {catIconSmall(l.categoria)}
                            </div>
                            <div>
                              <p className="font-bold text-[#69738c]">
                                {l.medioNombre}
                              </p>
                              <p className="text-[10px] text-[#9aa3b8]">
                                {l.productoNombre}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {editingId === l.id
                            ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() =>
                                    handleCantidadChange(
                                      l.id,
                                      l,
                                      l.cantidad - 1,
                                    )}
                                  className="w-6 h-6 rounded bg-[#dfeaff] text-xs font-bold"
                                >
                                  -
                                </button>
                                <span className="w-10 text-center font-bold">
                                  {l.cantidad}
                                </span>
                                <button
                                  onClick={() =>
                                    handleCantidadChange(
                                      l.id,
                                      l,
                                      l.cantidad + 1,
                                    )}
                                  className="w-6 h-6 rounded bg-indigo-500 text-white text-xs font-bold"
                                >
                                  +
                                </button>
                              </div>
                            )
                            : <span className="font-bold">{l.cantidad}</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          {fmt(l.tarifaUnitaria)}
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-[#9aa3b8]">
                          {l.horarioInicio
                            ? `${l.horarioInicio}-${l.horarioFin}`
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {l.disponibilidad && (
                            <span
                              className={`text-[10px] font-bold ${
                                dispColor(l.disponibilidad.estado)
                              }`}
                            >
                              {l.disponibilidad.estado === "disponible"
                                ? "✓"
                                : l.disponibilidad.estado === "limitado"
                                ? "⚠"
                                : "✗"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">
                          {fmt(l.totalNeto)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                setEditingId(editingId === l.id ? null : l.id)}
                              className="p-1 rounded hover:bg-[#dfeaff]"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#9aa3b8]" />
                            </button>
                            <button
                              onClick={() => eliminarLinea(l.id)}
                              className="p-1 rounded hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#dfeaff] text-white">
                      <td colSpan={5} className="px-4 py-3 font-bold text-sm">
                        Total Neto
                      </td>
                      <td className="px-4 py-3 text-right font-black text-lg font-mono">
                        {fmt(totalNeto)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

          {/* NAV */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep("resumen")}
              className="px-6 py-3 border border-[#bec8de40] rounded-xl font-bold text-sm text-[#69738c] hover:bg-[#dfeaff] transition flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <button
              onClick={() => setStep("confirmar")}
              disabled={lineas.length === 0}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] shadow-indigo-200 disabled:opacity-50"
            >
              Confirmar y Enviar <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* MODAL AGREGAR */}
          {showAddModal && (
            <div
              className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
              onClick={() => setShowAddModal(false)}
            >
              <div
                className="bg-[#dfeaff] rounded-2xl p-6 w-full max-w-md max-h-[75vh] overflow-y-auto shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-[#69738c]">
                    Agregar Emisora
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 rounded-xl bg-[#dfeaff] hover:bg-[#dfeaff]"
                  >
                    <X className="w-5 h-5 text-[#9aa3b8]" />
                  </button>
                </div>
                <div className="space-y-2">
                  {CATALOGO.filter((e) => !emisorasEnUso.has(e.id)).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => handleAddEmisora(e)}
                      className="w-full p-4 bg-[#dfeaff] border border-[#bec8de20] rounded-xl flex items-center gap-3 hover:bg-[#6888ff15] hover:border-[#6888ff30] transition"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          catColor(e.categoria)
                        }`}
                      >
                        {catIconSmall(e.categoria)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-sm text-[#69738c]">
                          {e.nombre}
                        </p>
                        <p className="text-[10px] text-[#9aa3b8]">
                          {e.producto}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-[#69738c]">
                        {fmt(e.tarifa)}/u
                      </p>
                    </button>
                  ))}
                  {CATALOGO.filter((e) => !emisorasEnUso.has(e.id)).length ===
                      0 && (
                    <p className="text-center py-6 text-sm text-[#9aa3b8]">
                      Todas las emisoras ya están agregadas
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {
        /* ═════════════════════════════════════════
          PASO 3: CONFIRMAR
         ═════════════════════════════════════════ */
      }
      {step === "confirmar" && (
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-4">
            <div className="bg-[#dfeaff] rounded-2xl border border-[#bec8de20] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] overflow-hidden">
              <div className="px-5 py-3 bg-[#dfeaff] border-b border-[#bec8de20] font-bold text-sm text-[#69738c] flex items-center gap-2">
                <Send className="w-4 h-4 text-[#6888ff]" /> Resumen Final
              </div>
              <div className="divide-y divide-slate-50">
                <DesktopField label="Cliente" value={contrato.cliente.nombre} />
                <DesktopField
                  label="Valor total"
                  value={fmt(totalNeto || contrato.valor)}
                />
                <DesktopField
                  label="Período"
                  value={`${fmtDate(contrato.fechaInicio)} → ${
                    fmtDate(contrato.fechaFin)
                  }`}
                />
                <DesktopField
                  label="Facturación"
                  value={`${contrato.facturacion.modalidad} · ${contrato.terminosPago} días`}
                />
                <DesktopField
                  label="Líneas de pauta"
                  value={`${lineas.length} línea${
                    lineas.length !== 1 ? "s" : ""
                  }`}
                />
              </div>
            </div>

            {/* LÍNEAS COMPACTAS */}
            <div className="space-y-2">
              {lineas.map((l) => (
                <div
                  key={l.id}
                  className="px-4 py-2 bg-[#dfeaff] rounded-xl border border-[#bec8de20] flex items-center gap-3"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      catColor(l.categoria)
                    }`}
                  >
                    {catIconSmall(l.categoria)}
                  </div>
                  <span className="text-sm font-bold text-[#69738c] flex-1">
                    {l.medioNombre}
                  </span>
                  <span className="text-xs text-[#9aa3b8]">
                    {l.cantidad} frases
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    {fmt(l.totalNeto)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {contrato.aprobacionRequerida && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                <Shield className="w-5 h-5 text-purple-500" />
                <p className="text-sm font-bold text-purple-700 mt-2">
                  Requiere aprobación
                </p>
                <p className="text-xs text-purple-500">
                  {contrato.nivelAprobacion}
                </p>
                {contrato.motivoAprobacion && (
                  <p className="text-[10px] text-purple-400 mt-1">
                    {contrato.motivoAprobacion}
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleConfirmar}
                disabled={confirming}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-green-700 transition disabled:opacity-70 shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] shadow-emerald-200"
              >
                {confirming
                  ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Creando...
                    </>
                  )
                  : (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> Crear Contrato
                    </>
                  )}
              </button>
              <button
                onClick={() => setStep("lineas")}
                disabled={confirming}
                className="w-full py-3 border border-[#bec8de40] text-[#69738c] rounded-xl font-bold text-sm hover:bg-[#dfeaff] transition disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Volver a líneas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function DesktopField({ label, value, badge, badgeColor }: {
  label: string;
  value: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div className="px-5 py-3 flex items-center gap-4">
      <span className="text-xs text-[#9aa3b8] w-28 shrink-0">{label}</span>
      <span className="text-sm font-bold text-[#69738c] flex-1">{value}</span>
      {badge && (
        <span
          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${badgeColor}`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function fmt(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v.toLocaleString("es-CL")}`;
}
function fmtDate(f: string): string {
  if (!f) return "-";
  return new Date(f + "T00:00:00").toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
  });
}
function catIcon(m: string) {
  const l = m.toLowerCase();
  if (l.includes("radio")) return <Radio className="w-3 h-3" />;
  if (l.includes("tv") || l.includes("tele")) return <Tv className="w-3 h-3" />;
  if (l.includes("digital") || l.includes("redes")) {
    return <Globe className="w-3 h-3" />;
  }
  if (l.includes("prensa")) return <Newspaper className="w-3 h-3" />;
  return null;
}
function catIconSmall(c: string) {
  switch (c) {
    case "Radio":
      return <Radio className="w-3.5 h-3.5 text-white" />;
    case "Televisión":
      return <Tv className="w-3.5 h-3.5 text-white" />;
    case "Digital":
      return <Globe className="w-3.5 h-3.5 text-white" />;
    case "Prensa":
      return <Newspaper className="w-3.5 h-3.5 text-white" />;
    default:
      return null;
  }
}
function catColor(c: string) {
  switch (c) {
    case "Radio":
      return "bg-gradient-to-br from-red-500 to-pink-500";
    case "Televisión":
      return "bg-gradient-to-br from-blue-500 to-indigo-500";
    case "Digital":
      return "bg-gradient-to-br from-emerald-500 to-teal-500";
    case "Prensa":
      return "bg-gradient-to-br from-amber-500 to-orange-500";
    default:
      return "bg-[#69738c]";
  }
}
function dispColor(s: string) {
  switch (s) {
    case "disponible":
      return "text-emerald-600";
    case "limitado":
      return "text-amber-600";
    case "saturado":
      return "text-orange-600";
    case "no_disponible":
      return "text-red-600";
    default:
      return "text-[#9aa3b8]";
  }
}
