/**
 * 🌐 SILEXAR PULSE - Panel de Especificaciones Digitales
 *
 * @description Panel neumórfico para configurar especificaciones de
 * campañas digitales dentro del paso 3 del wizard de contratos.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  DollarSign,
  FileText,
  Globe,
  Link2,
  Plus,
  Target,
  Users,
  X,
} from "lucide-react";
import { EspecificacionDigitalData } from "../types/wizard.types";

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE PLATAFORMAS
// ═══════════════════════════════════════════════════════════════

const PLATAFORMAS = [
  { id: "meta_ads", nombre: "Meta Ads", color: "from-blue-500 to-indigo-600" },
  {
    id: "google_ads",
    nombre: "Google Ads",
    color: "from-emerald-400 to-teal-600",
  },
  {
    id: "tiktok_ads",
    nombre: "TikTok Ads",
    color: "from-rose-400 to-pink-600",
  },
  {
    id: "linkedin_ads",
    nombre: "LinkedIn Ads",
    color: "from-sky-500 to-blue-700",
  },
  {
    id: "twitter_ads",
    nombre: "Twitter Ads",
    color: "from-slate-400 to-slate-600",
  },
  { id: "spotify", nombre: "Spotify", color: "from-green-400 to-emerald-600" },
  { id: "deezer", nombre: "Deezer", color: "from-orange-400 to-amber-600" },
  {
    id: "soundcloud",
    nombre: "SoundCloud",
    color: "from-orange-500 to-red-600",
  },
  {
    id: "youtube_ads",
    nombre: "YouTube Ads",
    color: "from-red-500 to-rose-600",
  },
  {
    id: "programmatic",
    nombre: "Programmatic",
    color: "from-violet-400 to-purple-600",
  },
  {
    id: "sitio_propio",
    nombre: "Sitio Propio",
    color: "from-cyan-400 to-blue-600",
  },
  {
    id: "app_propia",
    nombre: "App Propia",
    color: "from-fuchsia-400 to-purple-600",
  },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUMÓRFICOS BASE
// ═══════════════════════════════════════════════════════════════

const NeuromorphicInput: React.FC<{
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
  type?: "text" | "number" | "url";
  className?: string;
  min?: number;
}> = (
  {
    label,
    value,
    onChange,
    placeholder,
    icon: Icon,
    type = "text",
    className = "",
    min,
  },
) => (
  <div className={`space-y-2 ${className}`}>
    {label && (
      <label className="block text-sm font-medium text-[#69738c]">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9aa3b8]" />
      )}
      <input
        type={type}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full rounded-xl py-3 bg-[#dfeaff]
          shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
          border-2 border-transparent
          outline-none focus:ring-2 focus:ring-[#6888ff]/50
          text-[#69738c] placeholder-[#9aa3b8]
          transition-all duration-200
          ${Icon ? "pl-12 pr-4" : "px-4"}
        `}
      />
    </div>
  </div>
);

const NeuromorphicTextarea: React.FC<{
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}> = ({ label, value, onChange, placeholder, rows = 3, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    {label && (
      <label className="block text-sm font-medium text-[#69738c]">
        {label}
      </label>
    )}
    <textarea
      value={value}
      onChange={(e) =>
        onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="
        w-full rounded-xl py-3 px-4 bg-[#dfeaff]
        shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
        border-2 border-transparent
        outline-none focus:ring-2 focus:ring-[#6888ff]/50
        text-[#69738c] placeholder-[#9aa3b8]
        transition-all duration-200 resize-none
      "
    />
  </div>
);

// ═══════════════════════════════════════════════════════════════
// PROPS PRINCIPALES
// ═══════════════════════════════════════════════════════════════

interface PanelEspecificacionesDigitalesProps {
  data: EspecificacionDigitalData;
  onUpdate: (payload: Partial<EspecificacionDigitalData>) => void;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const PanelEspecificacionesDigitales: React.FC<
  PanelEspecificacionesDigitalesProps
> = ({
  data,
  onUpdate,
}) => {
  const [nuevaRegion, setNuevaRegion] = useState("");
  const [nuevoLink, setNuevoLink] = useState("");

  const togglePlataforma = (id: string) => {
    const current = data.plataformas || [];
    const next = current.includes(id)
      ? current.filter((p) => p !== id)
      : [...current, id];
    onUpdate({ plataformas: next });
  };

  const addTrackingLink = () => {
    if (!nuevoLink.trim()) return;
    const current = data.trackingLinks || [];
    onUpdate({ trackingLinks: [...current, nuevoLink.trim()] });
    setNuevoLink("");
  };

  const removeTrackingLink = (index: number) => {
    const current = data.trackingLinks || [];
    onUpdate({ trackingLinks: current.filter((_, i) => i !== index) });
  };

  const addRegion = () => {
    if (!nuevaRegion.trim()) return;
    const current = (data.configuracionTargeting?.regiones as string[]) || [];
    onUpdate({
      configuracionTargeting: {
        ...data.configuracionTargeting,
        regiones: [...current, nuevaRegion.trim()],
      },
    });
    setNuevaRegion("");
  };

  const removeRegion = (index: number) => {
    const current = (data.configuracionTargeting?.regiones as string[]) || [];
    onUpdate({
      configuracionTargeting: {
        ...data.configuracionTargeting,
        regiones: current.filter((_, i) => i !== index),
      },
    });
  };

  const toggleGenero = (genero: string) => {
    const current = (data.configuracionTargeting?.generos as string[]) || [];
    const next = current.includes(genero)
      ? current.filter((g) => g !== genero)
      : [...current, genero];
    onUpdate({
      configuracionTargeting: {
        ...data.configuracionTargeting,
        generos: next,
      },
    });
  };

  const updateObjetivo = (key: string, value: string) => {
    const num = parseInt(value) || 0;
    onUpdate({
      objetivos: {
        ...data.objetivos,
        [key]: num,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 mt-8"
    >
      {/* Título del panel */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-[#6888ff15]">
          <Globe className="w-7 h-7 text-[#6888ff]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#69738c]">
            Especificaciones Digitales
          </h2>
          <p className="text-[#9aa3b8]">
            Configure plataformas, presupuesto y targeting de la campaña digital
          </p>
        </div>
      </div>

      {/* Plataformas */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#69738c] flex items-center gap-2">
          <Target className="w-5 h-5 text-[#6888ff]" />
          Plataformas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {PLATAFORMAS.map((plataforma) => {
            const isSelected = (data.plataformas || []).includes(plataforma.id);
            return (
              <motion.button
                key={plataforma.id}
                onClick={() => togglePlataforma(plataforma.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative p-4 rounded-2xl text-left transition-all duration-300
                  ${
                  isSelected
                    ? `bg-gradient-to-br ${plataforma.color} text-white shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]`
                    : "bg-[#dfeaff] hover:bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]"
                }
                `}
              >
                <span
                  className={`block text-sm font-semibold ${
                    isSelected ? "text-white" : "text-[#69738c]"
                  }`}
                >
                  {plataforma.nombre}
                </span>
                {isSelected && (
                  <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-white" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Presupuesto */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#69738c] flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#6888ff]" />
          Presupuesto Digital
        </h3>
        <div className="grid md:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#dfeaff] shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]">
          <NeuromorphicInput
            label="Monto"
            type="number"
            min={0}
            value={data.presupuestoDigital || ""}
            onChange={(v) =>
              onUpdate({ presupuestoDigital: parseFloat(v) || 0 })}
            placeholder="Ej: 500000"
            icon={DollarSign}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#69738c]">
              Moneda
            </label>
            <select
              value={data.moneda || "CLP"}
              onChange={(e) => onUpdate({ moneda: e.target.value })}
              className="
                w-full rounded-xl py-3 px-4 bg-[#dfeaff]
                shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
                border-2 border-transparent
                outline-none focus:ring-2 focus:ring-[#6888ff]/50
                text-[#69738c]
                transition-all duration-200
              "
            >
              <option value="CLP">CLP</option>
              <option value="USD">USD</option>
              <option value="UF">UF</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#69738c]">
              Tipo de Presupuesto
            </label>
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#dfeaff]/60">
              <button
                onClick={() => onUpdate({ tipoPresupuesto: "total" })}
                className={`
                  flex-1 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                  data.tipoPresupuesto === "total" || !data.tipoPresupuesto
                    ? "bg-[#dfeaff] text-[#6888ff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]"
                    : "text-[#9aa3b8] hover:text-[#69738c]"
                }
                `}
              >
                Total
              </button>
              <button
                onClick={() => onUpdate({ tipoPresupuesto: "diario" })}
                className={`
                  flex-1 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                  data.tipoPresupuesto === "diario"
                    ? "bg-[#dfeaff] text-[#6888ff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]"
                    : "text-[#9aa3b8] hover:text-[#69738c]"
                }
                `}
              >
                Diario
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Objetivos */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#69738c] flex items-center gap-2">
          <Target className="w-5 h-5 text-[#6888ff]" />
          Objetivos de Campaña
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <NeuromorphicInput
            label="Alcance"
            type="number"
            min={0}
            value={data.objetivos?.alcance || ""}
            onChange={(v) => updateObjetivo("alcance", v)}
            placeholder="Ej: 100000"
          />
          <NeuromorphicInput
            label="Impresiones"
            type="number"
            min={0}
            value={data.objetivos?.impresiones || ""}
            onChange={(v) => updateObjetivo("impresiones", v)}
            placeholder="Ej: 500000"
          />
          <NeuromorphicInput
            label="Clics"
            type="number"
            min={0}
            value={data.objetivos?.clics || ""}
            onChange={(v) => updateObjetivo("clics", v)}
            placeholder="Ej: 5000"
          />
        </div>
      </div>

      {/* Tracking Links */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#69738c] flex items-center gap-2">
          <Link2 className="w-5 h-5 text-[#6888ff]" />
          Tracking Links
        </h3>
        <div className="p-5 rounded-2xl bg-[#dfeaff] shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] space-y-3">
          <div className="flex gap-3">
            <NeuromorphicInput
              type="url"
              value={nuevoLink}
              onChange={setNuevoLink}
              placeholder="https://..."
              className="flex-1"
            />
            <motion.button
              onClick={addTrackingLink}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-3 rounded-xl bg-[#6888ff] text-white font-medium shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] hover:shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] transition-all"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
          <AnimatePresence>
            {(data.trackingLinks || []).length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2"
              >
                {(data.trackingLinks || []).map((link, idx) => (
                  <motion.div
                    key={`${link}-${idx}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2 px-3 py-2 bg-[#dfeaff] rounded-xl shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] border border-[#bec8de20]"
                  >
                    <Link2 className="w-4 h-4 text-[#9aa3b8]" />
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#6888ff] hover:underline max-w-[200px] truncate"
                    >
                      {link}
                    </a>
                    <button
                      onClick={() => removeTrackingLink(idx)}
                      className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                      aria-label="Eliminar link"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Targeting */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#69738c] flex items-center gap-2">
          <Users className="w-5 h-5 text-[#6888ff]" />
          Configuración de Targeting
        </h3>
        <div className="grid md:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#dfeaff] shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]">
          <div className="grid grid-cols-2 gap-4">
            <NeuromorphicInput
              label="Edad Mínima"
              type="number"
              min={0}
              value={data.configuracionTargeting?.edadMinima || ""}
              onChange={(v) =>
                onUpdate({
                  configuracionTargeting: {
                    ...data.configuracionTargeting,
                    edadMinima: parseInt(v) || 0,
                  },
                })}
              placeholder="18"
            />
            <NeuromorphicInput
              label="Edad Máxima"
              type="number"
              min={0}
              value={data.configuracionTargeting?.edadMaxima || ""}
              onChange={(v) =>
                onUpdate({
                  configuracionTargeting: {
                    ...data.configuracionTargeting,
                    edadMaxima: parseInt(v) || 0,
                  },
                })}
              placeholder="65"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#69738c]">
              Géneros
            </label>
            <div className="flex items-center gap-3">
              {["M", "F"].map((genero) => {
                const selected =
                  (data.configuracionTargeting?.generos as string[])?.includes(
                    genero,
                  );
                return (
                  <button
                    key={genero}
                    onClick={() => toggleGenero(genero)}
                    className={`
                      px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${
                      selected
                        ? "bg-[#6888ff] text-white shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]"
                        : "bg-[#dfeaff] shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] text-[#69738c]"
                    }
                    `}
                  >
                    {genero === "M" ? "Masculino" : "Femenino"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Regiones */}
        <div className="p-5 rounded-2xl bg-[#dfeaff] shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] space-y-3">
          <label className="block text-sm font-medium text-[#69738c]">
            Regiones
          </label>
          <div className="flex gap-3">
            <NeuromorphicInput
              type="text"
              value={nuevaRegion}
              onChange={setNuevaRegion}
              placeholder="Ej: Metropolitana"
              className="flex-1"
            />
            <motion.button
              onClick={addRegion}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-3 rounded-xl bg-[#6888ff] text-white font-medium shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] hover:shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] transition-all"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
          <AnimatePresence>
            {((data.configuracionTargeting?.regiones as string[]) || [])
                  .length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2"
              >
                {((data.configuracionTargeting?.regiones as string[]) || [])
                  .map((region, idx) => (
                    <motion.div
                      key={`${region}-${idx}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg text-[#6888ff] font-medium text-sm border border-[#6888ff30]"
                    >
                      {region}
                      <button
                        onClick={() => removeRegion(idx)}
                        className="hover:text-red-500 ml-1"
                        aria-label="Eliminar región"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#69738c] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#6888ff]" />
          Notas Adicionales
        </h3>
        <NeuromorphicTextarea
          value={data.notas || ""}
          onChange={(v) => onUpdate({ notas: v })}
          placeholder="Agregue notas sobre la estrategia digital, restricciones creativas, fechas especiales..."
          rows={4}
        />
      </div>
    </motion.div>
  );
};

export default PanelEspecificacionesDigitales;
