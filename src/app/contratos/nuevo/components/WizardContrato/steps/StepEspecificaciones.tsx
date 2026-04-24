/**
 * 📊 SILEXAR PULSE - Paso 3: Especificaciones de Pauta TIER 0
 *
 * @description Selección de emisoras, paquetes y configuración
 * de pauta con grilla semanal o rango de fechas.
 *
 * @version 2025.5.0
 * @tier TIER_0_FORTUNE_10
 */

"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Hash,
  Package,
  Plus,
  Radio,
  Trash2,
  X,
} from "lucide-react";
import {
  EspecificacionPauta,
  formatCurrency,
  GrillaDiaSemana,
  TipoPauta,
  WizardAction,
  WizardContratoState,
} from "../types/wizard.types";

const N = {
  base: "#dfeaff",
  dark: "#bec8de",
  light: "#ffffff",
  accent: "#6888ff",
  text: "#69738c",
  sub: "#9aa3b8",
};

const DIAS_SEMANA: { key: GrillaDiaSemana["dia"]; label: string }[] = [
  { key: "L", label: "Lun" },
  { key: "M", label: "Mar" },
  { key: "X", label: "Mié" },
  { key: "J", label: "Jue" },
  { key: "V", label: "Vie" },
  { key: "S", label: "Sáb" },
  { key: "D", label: "Dom" },
];

const TIPOS_PAUTA: { tipo: TipoPauta; label: string }[] = [
  { tipo: "auspicios", label: "Auspicios" },
  { tipo: "prime", label: "Prime" },
  { tipo: "repartida", label: "Repartida" },
  { tipo: "prime_determinada", label: "Prime Det." },
  { tipo: "repartida_determinada", label: "Repartida Det." },
  { tipo: "tanda", label: "Tanda" },
  { tipo: "tanda_noche", label: "Tanda Noche" },
  { tipo: "menciones", label: "Menciones" },
];

const grillaInicial = (): GrillaDiaSemana[] =>
  DIAS_SEMANA.map((d) => ({ dia: d.key, cantidad: 0, activo: true }));

// ═══════════════════════════════════════════════════════════════
// SELECTOR DE EMISORA
// ═══════════════════════════════════════════════════════════════

interface EmisoraItem {
  id: string;
  nombre: string;
  ciudad?: string;
}

const SelectorEmisora: React.FC<{
  emisoras: EmisoraItem[];
  selectedId?: string;
  onSelect: (e: EmisoraItem) => void;
}> = ({ emisoras, selectedId, onSelect }) => (
  <div className="grid grid-cols-3 gap-2">
    {emisoras.map((e) => {
      const active = e.id === selectedId;
      return (
        <motion.button
          key={e.id}
          onClick={() => onSelect(e)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-2 rounded-xl text-left transition-all ${
            active
              ? "bg-[#6888ff] text-white shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]"
              : "bg-[#dfeaff] text-[#69738c] shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]"
          }`}
        >
          <Radio className={`w-4 h-4 mb-0.5 ${active ? "text-white" : "text-[#9aa3b8]"}`} />
          <p className={`text-[11px] font-semibold truncate ${active ? "text-white" : "text-[#69738c]"}`}>
            {e.nombre}
          </p>
          {e.ciudad && (
            <p className={`text-[10px] truncate ${active ? "text-white/70" : "text-[#9aa3b8]"}`}>
              {e.ciudad}
            </p>
          )}
        </motion.button>
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SELECTOR DE PAQUETE
// ═══════════════════════════════════════════════════════════════

interface PaqueteItem {
  id: string;
  nombre: string;
  tipo: string;
  precioActual: number;
  horarioInicio?: string;
  horarioFin?: string;
}

const SelectorPaquete: React.FC<{
  paquetes: PaqueteItem[];
  selectedId?: string;
  onSelect: (p: PaqueteItem) => void;
}> = ({ paquetes, selectedId, onSelect }) => (
  <div className="grid grid-cols-2 gap-2">
    {paquetes.map((p) => {
      const active = p.id === selectedId;
      return (
        <motion.button
          key={p.id}
          onClick={() => onSelect(p)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-2 rounded-xl text-left transition-all border ${
            active
              ? "bg-[#6888ff15] border-[#6888ff40] text-[#6888ff]"
              : "bg-[#dfeaff] border-[#bec8de20] text-[#69738c]"
          }`}
        >
          <p className="text-[11px] font-semibold truncate">{p.nombre}</p>
          <p className="text-[10px] text-[#9aa3b8]">
            {p.tipo} {p.horarioInicio && `• ${p.horarioInicio.slice(0, 5)}`}
          </p>
          <p className="text-[11px] font-bold text-[#6888ff]">
            {formatCurrency(p.precioActual)}
          </p>
        </motion.button>
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SELECTOR DE TIPO DE PAUTA
// ═══════════════════════════════════════════════════════════════

const SelectorTipoPauta: React.FC<{
  selected?: TipoPauta;
  onSelect: (t: TipoPauta) => void;
}> = ({ selected, onSelect }) => (
  <div className="grid grid-cols-4 gap-2">
    {TIPOS_PAUTA.map(({ tipo, label }) => {
      const active = tipo === selected;
      return (
        <motion.button
          key={tipo}
          onClick={() => onSelect(tipo)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-2 rounded-xl text-center transition-all text-[11px] font-medium ${
            active
              ? "bg-[#6888ff] text-white shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]"
              : "bg-[#dfeaff] text-[#69738c] shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]"
          }`}
        >
          {label}
        </motion.button>
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// CONFIGURADOR AUSPICIOS
// ═══════════════════════════════════════════════════════════════

const fmtDate = (d: Date | string | null | undefined): string => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const ConfiguradorAuspicios: React.FC<{
  fechaInicio: Date | null;
  fechaFin: Date | null;
  cantidad?: number;
  onChange: (f: { fechaInicio: Date | null; fechaFin: Date | null; cantidad: number }) => void;
}> = ({ fechaInicio, fechaFin, cantidad, onChange }) => {
  const calcularDias = (ini: Date | null, fin: Date | null) => {
    if (!ini || !fin) return 0;
    return Math.max(1, Math.ceil((fin.getTime() - ini.getTime()) / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="space-y-0.5">
        <label className="block text-[10px] font-semibold text-[#69738c] uppercase tracking-wide">Inicio</label>
        <input
          type="date"
          value={fmtDate(fechaInicio)}
          onChange={(e) => {
            const ini = e.target.value ? new Date(e.target.value) : null;
            const fin = fechaFin;
            const dias = calcularDias(ini, fin);
            onChange({ fechaInicio: ini, fechaFin: fin, cantidad: dias });
          }}
          className="w-full rounded-lg py-1.5 px-2 bg-[#dfeaff] shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff] border-none outline-none focus:ring-1 focus:ring-[#6888ff]/40 text-xs text-[#69738c]"
        />
      </div>
      <div className="space-y-0.5">
        <label className="block text-[10px] font-semibold text-[#69738c] uppercase tracking-wide">Fin</label>
        <input
          type="date"
          value={fmtDate(fechaFin)}
          onChange={(e) => {
            const fin = e.target.value ? new Date(e.target.value) : null;
            const ini = fechaInicio;
            const dias = calcularDias(ini, fin);
            onChange({ fechaInicio: ini, fechaFin: fin, cantidad: dias });
          }}
          className="w-full rounded-lg py-1.5 px-2 bg-[#dfeaff] shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff] border-none outline-none focus:ring-1 focus:ring-[#6888ff]/40 text-xs text-[#69738c]"
        />
      </div>
      <div className="space-y-0.5">
        <label className="block text-[10px] font-semibold text-[#69738c] uppercase tracking-wide">Cantidad</label>
        <input
          type="number"
          value={cantidad || 0}
          readOnly
          className="w-full rounded-lg py-1.5 px-2 bg-[#dfeaff] shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff] border-none outline-none text-xs text-[#6888ff] font-bold"
        />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CONFIGURADOR GRILLA SEMANAL
// ═══════════════════════════════════════════════════════════════

const ConfiguradorGrillaSemanal: React.FC<{
  grilla: GrillaDiaSemana[];
  onChange: (g: GrillaDiaSemana[]) => void;
}> = ({ grilla, onChange }) => {
  const update = (dia: GrillaDiaSemana["dia"], patch: Partial<GrillaDiaSemana>) => {
    onChange(grilla.map((d) => (d.dia === dia ? { ...d, ...patch } : d)));
  };

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {DIAS_SEMANA.map(({ key, label }) => {
        const dia = grilla.find((d) => d.dia === key)!;
        return (
          <div key={key} className="space-y-1">
            <button
              onClick={() => update(key, { activo: !dia.activo })}
              className={`w-full py-1 rounded-lg text-[10px] font-bold transition-all ${
                dia.activo
                  ? "bg-[#6888ff] text-white shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]"
                  : "bg-[#dfeaff] text-[#9aa3b8] shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]"
              }`}
            >
              {label}
            </button>
            <input
              type="number"
              min={0}
              value={dia.cantidad}
              disabled={!dia.activo}
              onChange={(e) => update(key, { cantidad: Number(e.target.value) || 0 })}
              className={`w-full rounded-lg py-1 px-1 text-center text-[11px] font-bold border-none outline-none ${
                dia.activo
                  ? "bg-[#dfeaff] shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff] text-[#6888ff]"
                  : "bg-[#dfeaff] shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff] text-[#9aa3b8]"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// LÍNEA ESPECIFICACIÓN COMPACTA
// ═══════════════════════════════════════════════════════════════

const LineaEspecificacionCompacta: React.FC<{
  linea: EspecificacionPauta;
  onRemove: () => void;
}> = ({ linea, onRemove }) => {
  const tipo = linea.tipoPauta || "sin tipo";
  const cantidadTotal =
    tipo === "auspicios"
      ? linea.cantidad || 0
      : linea.grillaSemanal?.reduce((s, d) => s + (d.activo ? d.cantidad : 0), 0) || 0;

  const emisora = linea.emisoraNombre || linea.medioNombre || "Sin emisora";
  const paquete = linea.paqueteNombre || linea.productoNombre || "Sin paquete";

  return (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#dfeaff] shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]">
      <div className="w-7 h-7 rounded-lg bg-[#6888ff] flex items-center justify-center text-white shrink-0">
        <Radio className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-[#69738c] truncate">
          {emisora} → {paquete}
        </p>
        <p className="text-[10px] text-[#9aa3b8]">
          {String(tipo).replace("_", " ")} • {cantidadTotal} emisiones
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[11px] font-bold text-[#6888ff]">{formatCurrency(linea.totalNeto || 0)}</p>
      </div>
      <button
        onClick={onRemove}
        aria-label="Eliminar"
        className="p-1.5 hover:bg-[#bec8de30] rounded-lg transition-colors shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5 text-[#9aa3b8]" />
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

interface StepEspecificacionesProps {
  state: WizardContratoState;
  dispatch: React.Dispatch<WizardAction>;
}

export const StepEspecificaciones: React.FC<StepEspecificacionesProps> = ({
  state,
  dispatch,
}) => {
  const [emisoras, setEmisoras] = useState<EmisoraItem[]>([]);
  const [paquetes, setPaquetes] = useState<PaqueteItem[]>([]);
  const [loadingEmisoras, setLoadingEmisoras] = useState(false);
  const [loadingPaquetes, setLoadingPaquetes] = useState(false);

  // Línea en construcción
  const [draft, setDraft] = useState<Partial<EspecificacionPauta> & { id: string }>({
    id: `esp-${Date.now()}`,
    grillaSemanal: grillaInicial(),
    fechaInicio: null,
    fechaFin: null,
    tipoPauta: "auspicios",
    tarifaUnitaria: 0,
    totalNeto: 0,
  });

  const [step, setStep] = useState<1 | 2 | 3 | 0>(0);

  useEffect(() => {
    setLoadingEmisoras(true);
    fetch("/api/emisoras")
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data.data) ? data.data : data;
        if (Array.isArray(items)) {
          setEmisoras(
            items.map((e: any) => ({
              id: e.id,
              nombre: e.nombre,
              ciudad: e.ciudad,
            }))
          );
        }
      })
      .catch(() => setEmisoras([]))
      .finally(() => setLoadingEmisoras(false));
  }, []);

  useEffect(() => {
    if (!draft.emisoraId) return;
    setLoadingPaquetes(true);
    fetch(`/api/paquetes?editoraId=${draft.emisoraId}&estado=ACTIVO&limite=50`)
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data.data) ? data.data : data.items || [];
        if (Array.isArray(items)) {
          setPaquetes(
            items.map((p: any) => ({
              id: p.id,
              nombre: p.nombre || p.programaNombre,
              tipo: p.tipo,
              precioActual: Number(p.precioActual) || 0,
              horarioInicio: p.horarioInicio,
              horarioFin: p.horarioFin,
            }))
          );
        }
      })
      .catch(() => setPaquetes([]))
      .finally(() => setLoadingPaquetes(false));
  }, [draft.emisoraId]);

  const totalGeneral = state.lineasEspecificacion.reduce((s, l) => s + l.totalNeto, 0);

  const agregarLinea = () => {
    if (!draft.emisoraId || !draft.paqueteId || !draft.tipoPauta) return;
    const linea: EspecificacionPauta = {
      id: draft.id,
      emisoraId: draft.emisoraId,
      emisoraNombre: draft.emisoraNombre || "",
      paqueteId: draft.paqueteId,
      paqueteNombre: draft.paqueteNombre || "",
      tipoPauta: draft.tipoPauta,
      fechaInicio: draft.fechaInicio || null,
      fechaFin: draft.fechaFin || null,
      grillaSemanal: draft.grillaSemanal,
      cantidad: draft.cantidad,
      duracion: draft.duracion,
      tarifaUnitaria: draft.tarifaUnitaria || 0,
      descuento: draft.descuento,
      totalNeto: draft.totalNeto || 0,
    };
    dispatch({ type: "ADD_LINEA_ESPECIFICACION", payload: linea });
    setDraft({
      id: `esp-${Date.now()}`,
      grillaSemanal: grillaInicial(),
      fechaInicio: null,
      fechaFin: null,
      tipoPauta: "auspicios",
      tarifaUnitaria: 0,
      totalNeto: 0,
    });
    setStep(0);
  };

  return (
    <div className="space-y-2">
      {/* Header resumen */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6888ff] text-white text-xs font-medium shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar Línea
        </button>
        <div className="text-right">
          <p className="text-[10px] text-[#9aa3b8]">Líneas {state.lineasEspecificacion.length}</p>
          <p className="text-sm font-bold text-[#6888ff]">{formatCurrency(totalGeneral)}</p>
        </div>
      </div>

      {/* Líneas agregadas */}
      <AnimatePresence>
        {state.lineasEspecificacion.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5"
          >
            {state.lineasEspecificacion.map((linea) => (
              <LineaEspecificacionCompacta
                key={linea.id}
                linea={linea}
                onRemove={() => dispatch({ type: "REMOVE_LINEA_ESPECIFICACION", payload: linea.id })}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel de agregar línea */}
      <AnimatePresence>
        {step > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3 rounded-2xl bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] space-y-2"
          >
            {/* Stepper mini */}
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => setStep(Math.max(0, step - 1) as 0 | 1 | 2 | 3)}
                className="p-1 rounded-lg hover:bg-[#bec8de30]"
              >
                <ChevronLeft className="w-4 h-4 text-[#9aa3b8]" />
              </button>
              <div className="flex-1 flex items-center gap-1">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      s <= step ? "bg-[#6888ff]" : "bg-[#bec8de50]"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setStep(0)}
                className="p-1 rounded-lg hover:bg-[#bec8de30]"
              >
                <X className="w-4 h-4 text-[#9aa3b8]" />
              </button>
            </div>

            {/* Paso 1: Emisora */}
            {step === 1 && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-semibold text-[#69738c] uppercase tracking-wide">
                  1. Seleccionar Emisora
                </h4>
                {loadingEmisoras ? (
                  <div className="text-center py-3 text-[#9aa3b8] text-xs">
                    <div className="w-5 h-5 border-2 border-[#6888ff] border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                    Cargando emisoras...
                  </div>
                ) : (
                  <SelectorEmisora
                    emisoras={emisoras}
                    selectedId={draft.emisoraId}
                    onSelect={(e) => {
                      setDraft((d) => ({
                        ...d,
                        emisoraId: e.id,
                        emisoraNombre: e.nombre,
                        paqueteId: undefined,
                        paqueteNombre: undefined,
                      }));
                      setStep(2);
                    }}
                  />
                )}
              </div>
            )}

            {/* Paso 2: Paquete */}
            {step === 2 && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-semibold text-[#69738c] uppercase tracking-wide">
                  2. Seleccionar Paquete
                </h4>
                {loadingPaquetes ? (
                  <div className="text-center py-3 text-[#9aa3b8] text-xs">
                    <div className="w-5 h-5 border-2 border-[#6888ff] border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                    Cargando paquetes...
                  </div>
                ) : (
                  <SelectorPaquete
                    paquetes={paquetes}
                    selectedId={draft.paqueteId}
                    onSelect={(p) => {
                      setDraft((d) => ({
                        ...d,
                        paqueteId: p.id,
                        paqueteNombre: p.nombre,
                        tarifaUnitaria: p.precioActual,
                        totalNeto: p.precioActual,
                      }));
                      setStep(3);
                    }}
                  />
                )}
              </div>
            )}

            {/* Paso 3: Configurar pauta */}
            {step === 3 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold text-[#69738c] uppercase tracking-wide">
                  3. Configurar Pauta
                </h4>

                <SelectorTipoPauta
                  selected={draft.tipoPauta}
                  onSelect={(tipo) => setDraft((d) => ({ ...d, tipoPauta: tipo }))}
                />

                {draft.tipoPauta === "auspicios" ? (
                  <ConfiguradorAuspicios
                    fechaInicio={draft.fechaInicio || null}
                    fechaFin={draft.fechaFin || null}
                    cantidad={draft.cantidad}
                    onChange={({ fechaInicio, fechaFin, cantidad }) => {
                      const total = Math.round((draft.tarifaUnitaria || 0) * cantidad);
                      setDraft((d) => ({ ...d, fechaInicio, fechaFin, cantidad, totalNeto: total }));
                    }}
                  />
                ) : (
                  <ConfiguradorGrillaSemanal
                    grilla={draft.grillaSemanal || grillaInicial()}
                    onChange={(g) => {
                      const cantidadTotal = g.reduce((s, d) => s + (d.activo ? d.cantidad : 0), 0);
                      const total = Math.round((draft.tarifaUnitaria || 0) * cantidadTotal);
                      setDraft((d) => ({ ...d, grillaSemanal: g, totalNeto: total }));
                    }}
                  />
                )}

                {/* Total preview */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#6888ff15]">
                  <span className="text-[11px] text-[#69738c]">Total línea</span>
                  <span className="text-sm font-bold text-[#6888ff]">
                    {formatCurrency(draft.totalNeto || 0)}
                  </span>
                </div>

                <button
                  onClick={agregarLinea}
                  disabled={!draft.emisoraId || !draft.paqueteId}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-[#6888ff] shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] disabled:opacity-50 transition-all"
                >
                  Agregar Línea
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StepEspecificaciones;
