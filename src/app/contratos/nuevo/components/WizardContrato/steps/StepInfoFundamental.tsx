/**
 * 📋 SILEXAR PULSE - Paso 1: Información Fundamental TIER 0
 *
 * @description Primer paso del wizard - Datos básicos del contrato,
 * selección de anunciante con inteligencia y productos.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Package,
  Percent,
  Plus,
  Radio,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  AnuncianteSeleccionado,
  MedioContrato,
  ProductoContrato,
  TipoContrato,
  WizardAction,
  WizardContratoState,
} from "../types/wizard.types";

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS BASE
// ═══════════════════════════════════════════════════════════════

const NeuromorphicInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
  error?: string;
  required?: boolean;
  type?: "text" | "date" | "number";
  className?: string;
  inputClassName?: string;
}> = (
  {
    label,
    value,
    onChange,
    placeholder,
    icon: Icon,
    error,
    required,
    type = "text",
    className = "",
    inputClassName = "",
  },
) => (
    <div className={`space-y-0.5 ${className}`}>
      <label className="block text-[11px] font-semibold text-[#69738c] uppercase tracking-wide">
        {label} {required && <span className="text-[#9aa3b8]">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className={`
          w-full rounded-lg py-1.5 bg-[#dfeaff]
          shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]
          border-none outline-none focus:ring-1 focus:ring-[#6888ff]/40
          text-xs text-[#69738c] placeholder:text-[#9aa3b8]/70
          transition-all duration-200
          ${Icon ? "pl-9 pr-3" : "px-3"}
          ${inputClassName}
        `}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] text-[#9aa3b8] flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </div>
  );

const NeuromorphicTextarea: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}> = ({ label, value, onChange, placeholder, rows = 3, className = "" }) => (
  <div className={`space-y-0.5 ${className}`}>
    <label className="block text-[11px] font-semibold text-[#69738c] uppercase tracking-wide">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="
        w-full rounded-lg py-1.5 px-3 bg-[#dfeaff]
        shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]
        border-none outline-none focus:ring-1 focus:ring-[#6888ff]/40
        text-xs text-[#69738c] placeholder:text-[#9aa3b8]/70
        transition-all duration-200 resize-y min-h-[120px]
      "
    />
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SELECTOR DE TIPO DE CONTRATO
// ═══════════════════════════════════════════════════════════════

const tiposContrato: {
  tipo: TipoContrato;
  titulo: string;
  descripcion: string;
  icono: React.ElementType;
  color: string;
}[] = [
    {
      tipo: "nuevo",
      titulo: "Nuevo Contrato",
      descripcion: "Cliente nuevo o campaña nueva",
      icono: Plus,
      color: "from-[#6888ff] to-[#6888ff]",
    },
    {
      tipo: "renovacion",
      titulo: "Renovación",
      descripcion: "Basado en contrato existente",
      icono: TrendingUp,
      color: "from-[#6888ff] to-[#6888ff]",
    },
    {
      tipo: "programatico",
      titulo: "Programático",
      descripcion: "Campañas de alto volumen",
      icono: Sparkles,
      color: "from-[#6888ff] to-[#6888ff]",
    },
    {
      tipo: "marco_anual",
      titulo: "Marco Anual",
      descripcion: "Cliente corporativo recurrente",
      icono: Briefcase,
      color: "from-[#6888ff] to-[#6888ff]",
    },
    {
      tipo: "express",
      titulo: "Express",
      descripcion: "Creación rápida móvil",
      icono: Star,
      color: "from-[#6888ff] to-[#6888ff]",
    },
  ];

const TipoContratoSelector: React.FC<{
  selected: TipoContrato;
  onSelect: (tipo: TipoContrato) => void;
}> = ({ selected, onSelect }) => (
  <div className="grid grid-cols-5 gap-2">
    {tiposContrato.map(({ tipo, titulo, descripcion, icono: Icon, color }) => (
      <motion.button
        key={tipo}
        onClick={() => onSelect(tipo)}
        className={`
          relative p-2 rounded-xl text-left transition-all duration-300
          ${selected === tipo
            ? "bg-[#6888ff] text-white shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]"
            : "bg-[#dfeaff] hover:bg-[#dfeaff] shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]"
          }
        `}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon
          className={`w-4 h-4 mb-1 ${selected === tipo ? "text-white" : "text-[#9aa3b8]"
            }`}
        />
        <h4
          className={`font-semibold text-sm ${selected === tipo ? "text-white" : "text-[#69738c]"
            }`}
        >
          {titulo}
        </h4>
        <p
          className={`text-[11px] mt-1 ${selected === tipo ? "text-white/80" : "text-[#9aa3b8]"
            }`}
        >
          {descripcion}
        </p>
        {selected === tipo && (
          <motion.div
            layoutId="tipoIndicator"
            className="absolute top-2 right-2"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
          </motion.div>
        )}
      </motion.button>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SELECTOR DE MEDIO
// ═══════════════════════════════════════════════════════════════

const mediosContrato: {
  id: MedioContrato;
  label: string;
  desc: string;
  icono: React.ElementType;
  color: string;
}[] = [
    {
      id: "fm",
      label: "Radio FM",
      desc: "Contrato tradicional de radio",
      icono: Radio,
      color: "from-[#6888ff] to-[#6888ff]",
    },
    {
      id: "digital",
      label: "Digital",
      desc: "Campañas 100% digitales",
      icono: Sparkles,
      color: "from-[#6888ff] to-[#6888ff]",
    },
    {
      id: "hibrido",
      label: "Híbrido",
      desc: "Radio + Digital combinado",
      icono: Briefcase,
      color: "from-[#6888ff] to-[#6888ff]",
    },
  ];

const MedioSelector: React.FC<{
  selected: MedioContrato;
  onSelect: (medio: MedioContrato) => void;
}> = ({ selected, onSelect }) => (
  <div className="grid grid-cols-3 gap-2">
    {mediosContrato.map(({ id, label, desc, icono: Icon, color }) => (
      <motion.button
        key={id}
        onClick={() => onSelect(id)}
        className={`
          relative p-2 rounded-xl text-left transition-all duration-300
          ${selected === id
            ? "bg-[#6888ff] text-white shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]"
            : "bg-[#dfeaff] hover:bg-[#dfeaff] shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]"
          }
        `}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon
          className={`w-4 h-4 mb-1 ${selected === id ? "text-white" : "text-[#9aa3b8]"
            }`}
        />
        <h4
          className={`font-semibold text-sm ${selected === id ? "text-white" : "text-[#69738c]"
            }`}
        >
          {label}
        </h4>
        <p
          className={`text-[11px] mt-1 ${selected === id ? "text-white/80" : "text-[#9aa3b8]"
            }`}
        >
          {desc}
        </p>
        {selected === id && (
          <motion.div className="absolute top-2 right-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </motion.div>
        )}
      </motion.button>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SELECTOR DE ANUNCIANTE
// ═══════════════════════════════════════════════════════════════

// Mock data para anunciantes
const mockAnunciantes: AnuncianteSeleccionado[] = [
  {
    id: "anun-001",
    nombre: "SuperMax SpA",
    rut: "76.123.456-7",
    scoreRiesgo: 850,
    nivelRiesgo: "bajo",
    terminosPreferenciales: {
      diasPago: 30,
      limiteCredito: 50000000,
      descuentoMaximo: 15,
    },
    historialContratos: { total: 12, exitosos: 12, valorHistorico: 450000000 },
    ejecutivoAsignado: {
      id: "ej-001",
      nombre: "Ana García",
      email: "ana.garcia@silexar.com",
    },
    industria: "Retail",
    esAgencia: false,
  },
  {
    id: "anun-002",
    nombre: "Banco Nacional S.A.",
    rut: "97.654.321-K",
    scoreRiesgo: 920,
    nivelRiesgo: "bajo",
    terminosPreferenciales: {
      diasPago: 45,
      limiteCredito: 200000000,
      descuentoMaximo: 20,
    },
    historialContratos: { total: 25, exitosos: 25, valorHistorico: 1200000000 },
    ejecutivoAsignado: {
      id: "ej-002",
      nombre: "Carlos Mendoza",
      email: "carlos.mendoza@silexar.com",
    },
    industria: "Banca",
    esAgencia: false,
  },
  {
    id: "anun-003",
    nombre: "TechStart SpA",
    rut: "76.987.654-3",
    scoreRiesgo: 620,
    nivelRiesgo: "medio",
    terminosPreferenciales: {
      diasPago: 15,
      limiteCredito: 10000000,
      descuentoMaximo: 10,
    },
    historialContratos: { total: 2, exitosos: 2, valorHistorico: 15000000 },
    industria: "Tecnología",
    esAgencia: false,
  },
  {
    id: "anun-004",
    nombre: "AutoMax Chile S.A.",
    rut: "96.555.444-2",
    scoreRiesgo: 780,
    nivelRiesgo: "bajo",
    terminosPreferenciales: {
      diasPago: 30,
      limiteCredito: 80000000,
      descuentoMaximo: 18,
    },
    historialContratos: { total: 8, exitosos: 7, valorHistorico: 320000000 },
    ejecutivoAsignado: {
      id: "ej-003",
      nombre: "Roberto Silva",
      email: "roberto.silva@silexar.com",
    },
    industria: "Automotriz",
    esAgencia: false,
  },
];

const SelectorAnunciante: React.FC<{
  selected: AnuncianteSeleccionado | null;
  onSelect: (anunciante: AnuncianteSeleccionado | null) => void;
}> = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [anunciantesList, setAnunciantesList] = useState<AnuncianteSeleccionado[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || anunciantesList.length > 0) return;
    setLoading(true);
    fetch('/api/anunciantes?limit=100&activo=true')
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data.data) ? data.data : [];
        const mapped: AnuncianteSeleccionado[] = items.map((a: any) => ({
          id: a.id,
          nombre: a.nombreRazonSocial || a.nombre || 'Sin nombre',
          rut: a.rut || '',
          industria: a.giroActividad || a.industria || '',
        }));
        setAnunciantesList(mapped.length > 0 ? mapped : mockAnunciantes);
      })
      .catch(() => setAnunciantesList(mockAnunciantes))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const filteredAnunciantes = anunciantesList.filter((a) =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    a.rut.includes(search)
  );

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-[#69738c] mb-1">
        Anunciante <span className="text-[#69738c]">*</span>
      </label>

      {/* Botón selector */}
      <motion.div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full p-2 rounded-xl text-left transition-all duration-300 cursor-pointer
          ${selected
            ? "bg-[#6888ff15] border-2 border-[#6888ff30]"
            : "bg-[#dfeaff] shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] border-2 border-transparent"
          }
        `}
        whileHover={{ scale: 1.005 }}
      >
        {selected
          ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#6888ff] flex items-center justify-center text-white font-bold text-sm">
                  {selected.nombre.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-[#69738c]">
                    {selected.nombre}
                  </h4>
                  <p className="text-sm text-[#9aa3b8]">
                    {selected.rut ? `RUT: ${selected.rut}` : ''}{selected.rut && selected.industria ? ' • ' : ''}{selected.industria}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(null);
                }}
                aria-label="Cerrar"
                className="p-2 hover:bg-[#bec8de30] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-[#9aa3b8]" />
              </button>
            </div>
          )
          : (
            <div className="flex items-center gap-2 text-[#9aa3b8]">
              <Search className="w-5 h-5" />
              <span>Buscar anunciante por nombre o RUT...</span>
            </div>
          )}
      </motion.div>

      {/* Dropdown de búsqueda */}
      <AnimatePresence>
        {isOpen && !selected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-[#dfeaff] rounded-2xl shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] border border-[#bec8de40] overflow-hidden"
          >
            {/* Campo de búsqueda */}
            <div className="p-2 border-b border-[#bec8de20]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9aa3b8]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar anunciante..."
                  aria-label="Buscar anunciante"
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#dfeaff] border-none outline-none focus:ring-2 focus:ring-[#6888ff]/50 text-[#69738c]"
                />
              </div>
            </div>

            {/* Lista de resultados */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-[#9aa3b8]">
                  <div className="w-6 h-6 border-2 border-[#6888ff] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm">Cargando anunciantes...</p>
                </div>
              ) : filteredAnunciantes.length === 0 ? (
                <div className="p-6 text-center text-[#9aa3b8]">
                  <Building2 className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <p>No se encontraron anunciantes</p>
                </div>
              ) : (
                filteredAnunciantes.map((anunciante) => (
                  <motion.button
                    key={anunciante.id}
                    onClick={() => {
                      onSelect(anunciante);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className="w-full p-4 hover:bg-[#6888ff15] transition-colors flex items-center justify-between text-left border-b border-[#bec8de15] last:border-0"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#6888ff] flex items-center justify-center text-white font-semibold">
                        {anunciante.nombre.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-[#69738c]">
                          {anunciante.nombre}
                        </h4>
                        <p className="text-[11px] text-[#9aa3b8]">
                          {anunciante.rut}{anunciante.rut && anunciante.industria ? ' • ' : ''}{anunciante.industria}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>

            {/* Footer eliminado — crear anunciante solo desde módulo Anunciantes */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel de stats del anunciante eliminado — pertenece al módulo Anunciantes */}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SELECTOR DE PRODUCTOS
// ═══════════════════════════════════════════════════════════════

const mockProductos: ProductoContrato[] = [
  {
    id: "prod-001",
    nombre: "Radio Prime",
    categoria: "Radio",
    tarifaBase: 500000,
    descripcion: "Horario prime 7-9 AM",
    unidad: "cuña",
    disponibilidad: "disponible",
  },
  {
    id: "prod-002",
    nombre: "TV Abierta Nacional",
    categoria: "Televisión",
    tarifaBase: 2500000,
    descripcion: "Franja prime televisiva",
    unidad: "spot",
    disponibilidad: "limitado",
  },
  {
    id: "prod-003",
    nombre: "Digital Banner Premium",
    categoria: "Digital",
    tarifaBase: 150000,
    descripcion: "Banner 970x250",
    unidad: "CPM",
    disponibilidad: "disponible",
  },
  {
    id: "prod-004",
    nombre: "Prensa Dominical",
    categoria: "Prensa",
    tarifaBase: 800000,
    descripcion: "Página completa color",
    unidad: "publicación",
    disponibilidad: "disponible",
  },
];

const SelectorProductos: React.FC<{
  selected: ProductoContrato[];
  onAdd: (producto: ProductoContrato) => void;
  onRemove: (id: string) => void;
}> = ({ selected, onAdd, onRemove }) => {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-[#69738c]">
          Paquetes
        </label>
        <motion.button
          onClick={() => setShowSelector(!showSelector)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#6888ff15] text-[#6888ff] font-medium text-sm hover:bg-[#6888ff25] transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          Agregar Producto
        </motion.button>
      </div>

      {/* Productos seleccionados */}
      {selected.length > 0
        ? (
          <div className="space-y-1">
            {selected.map((producto) => (
              <motion.div
                key={producto.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-2 rounded-xl bg-[#dfeaff] border border-[#bec8de20]"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#6888ff]" />
                  <div>
                    <h4 className="font-medium text-[#69738c]">
                      {producto.nombre}
                    </h4>
                    <p className="text-[11px] text-[#9aa3b8]">
                      {producto.categoria}{" "}
                      • ${producto.tarifaBase.toLocaleString()}/{producto
                        .unidad}
                    </p>
                  </div>
                </div>
                <button
                  aria-label="Eliminar"
                  onClick={() => onRemove(producto.id)}
                  className="p-2 hover:bg-[#dfeaff] rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-[#69738c]" />
                </button>
              </motion.div>
            ))}
          </div>
        )
        : (
          <div className="p-2 rounded-xl bg-[#dfeaff] border-2 border-dashed border-[#bec8de40] text-center">
            <Package className="w-7 h-7 mx-auto mb-1 text-[#9aa3b8]" />
            <p className="text-[#9aa3b8] text-sm">
              No hay paquetes seleccionados
            </p>
          </div>
        )}

      {/* Modal de selección */}
      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-[#dfeaff] border border-[#bec8de40] shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] overflow-hidden"
          >
            <div className="p-2 bg-[#dfeaff] border-b border-[#bec8de20] flex items-center justify-between">
              <span className="font-medium text-[#69738c]">
                Seleccionar Productos
              </span>
              <button
                aria-label="Cerrar"
                onClick={() => setShowSelector(false)}
                className="p-1 hover:bg-[#dfeaff] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 max-h-60 overflow-y-auto">
              {mockProductos.filter((p) => !selected.find((s) => s.id === p.id))
                .map((producto) => (
                  <button
                    key={producto.id}
                    onClick={() => {
                      onAdd(producto);
                      setShowSelector(false);
                    }}
                    className="w-full p-2 hover:bg-[#6888ff15] rounded-lg transition-colors flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${producto.disponibilidad === "disponible"
                          ? "bg-[#6888ff]"
                          : producto.disponibilidad === "limitado"
                            ? "bg-[#6888ff]"
                            : "bg-[#69738c]"
                          }`}
                      />
                      <div>
                        <h4 className="font-medium text-[#69738c]">
                          {producto.nombre}
                        </h4>
                        <p className="text-[11px] text-[#9aa3b8]">
                          {producto.categoria}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#6888ff]">
                      ${producto.tarifaBase.toLocaleString()}
                    </span>
                  </button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SELECTOR DE PROPIEDADES (CLAVE PARA INTEGRACIÓN)
// ═══════════════════════════════════════════════════════════════

const mockPropiedadesMaestras = [
  {
    tipoCodigo: "TIPO_CREATIVIDAD",
    valorCodigoRef: "01_SPOT_RADIO",
    nombre: "Spot de Radio",
    categoria: "Creatividad",
  },
  {
    tipoCodigo: "TIPO_CREATIVIDAD",
    valorCodigoRef: "02_JINGLE",
    nombre: "Jingle Corporativo",
    categoria: "Creatividad",
  },
  {
    tipoCodigo: "TIPO_CREATIVIDAD",
    valorCodigoRef: "03_MENCION_VIVO",
    nombre: "Mención en Vivo",
    categoria: "Creatividad",
  },
  {
    tipoCodigo: "TIPO_CREATIVIDAD",
    valorCodigoRef: "INVALIDO_SIMULADO",
    nombre: "Campaña Fantasma (Genera Error)",
    categoria: "Creatividad",
  },
  {
    tipoCodigo: "SEGMENTO_COMERCIAL",
    valorCodigoRef: "SEG_GOLD",
    nombre: "Segmento GOLD",
    categoria: "Segmentación",
  },
  {
    tipoCodigo: "SEGMENTO_COMERCIAL",
    valorCodigoRef: "SEG_BRONZE",
    nombre: "Segmento BRONZE",
    categoria: "Segmentación",
  },
  {
    tipoCodigo: "PRIORIDAD_OPERATIVA",
    valorCodigoRef: "PRIO_ALTA",
    nombre: "Prioridad ALTA",
    categoria: "Operativa",
  },
];

type PropiedadItem = { tipoCodigo: string; valorCodigoRef: string; nombre: string; categoria?: string };

const SelectorPropiedades: React.FC<{
  selected: PropiedadItem[];
  onUpdate: (propiedades: PropiedadItem[]) => void;
  error?: string;
}> = ({ selected, onUpdate, error }) => {
  const [showSelector, setShowSelector] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSelector) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSelector(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSelector]);

  const handleToggle = (prop: PropiedadItem) => {
    const isSelected = selected.some((s) =>
      s.valorCodigoRef === prop.valorCodigoRef
    );
    if (isSelected) {
      onUpdate(
        selected.filter((s) => s.valorCodigoRef !== prop.valorCodigoRef),
      );
    } else {
      onUpdate([...selected, {
        tipoCodigo: prop.tipoCodigo,
        valorCodigoRef: prop.valorCodigoRef,
        nombre: prop.nombre,
        categoria: prop.categoria,
      }]);
    }
    setShowSelector(false);
  };

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-[#69738c]">
          Clasificación Maestra (Propiedades){" "}
          <span className="text-[#69738c]">*</span>
        </label>
        <motion.button
          onClick={() => setShowSelector(!showSelector)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#6888ff15] text-[#6888ff] font-medium text-sm hover:bg-[#6888ff25] transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          Añadir Clasificación
        </motion.button>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-[#69738c] flex items-center gap-1"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </motion.p>
      )}

      {selected.length > 0
        ? (
          <div className="flex flex-wrap gap-2">
            {selected.map((prop) => (
              <motion.div
                key={prop.valorCodigoRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5  from-[#dfeaff] to-[#dfeaff] rounded-lg text-[#6888ff] font-medium text-sm border border-[#6888ff30]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {prop.nombre}
                <button
                  aria-label="Eliminar"
                  onClick={() => handleToggle(prop)}
                  className="hover:text-[#69738c] ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )
        : (
          <div className="p-4 rounded-xl bg-[#dfeaff] border-2 border-dashed border-[#bec8de30] text-center">
            <p className="text-[#69738c] text-sm">
              Validación cruzada obligatoria: Seleccione al menos una propiedad
              maestra para continuar.
            </p>
          </div>
        )}

      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-[#dfeaff] border border-[#bec8de40] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] overflow-hidden mt-2 p-1.5 grid grid-cols-3 gap-1.5"
          >
            {mockPropiedadesMaestras.map((prop) => {
              const isActive = selected.some((s) =>
                s.valorCodigoRef === prop.valorCodigoRef
              );
              return (
                <button
                  key={prop.valorCodigoRef}
                  onClick={() => handleToggle(prop)}
                  className={`px-2 py-1 rounded-md text-left transition-colors flex items-center justify-between border ${isActive
                    ? "bg-[#6888ff15] border-[#6888ff30] text-[#6888ff]"
                    : "bg-[#dfeaff] border-[#bec8de20] text-[#69738c] hover:bg-[#6888ff08]"
                    }`}
                >
                  <span className="block font-medium text-[11px] truncate">
                    {prop.nombre}
                  </span>
                  {isActive && (
                    <CheckCircle2 className="w-4 h-4 text-[#6888ff]" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL DEL PASO
// ═══════════════════════════════════════════════════════════════

interface StepInfoFundamentalProps {
  state: WizardContratoState;
  dispatch: React.Dispatch<WizardAction>;
  setAnunciante: (anunciante: AnuncianteSeleccionado | null) => void;
}


// ═══════════════════════════════════════════════════════════════
// MOCKS DE MÓDULOS CONECTADOS
// ═══════════════════════════════════════════════════════════════

const mockEjecutivos = [
  { id: 'ej-001', nombre: 'Ana García', email: 'ana.garcia@silexar.com', cargo: 'Ejecutiva Senior' },
  { id: 'ej-002', nombre: 'Carlos Mendoza', email: 'carlos.mendoza@silexar.com', cargo: 'Ejecutivo Comercial' },
  { id: 'ej-003', nombre: 'Roberto Silva', email: 'roberto.silva@silexar.com', cargo: 'Ejecutivo de Cuentas' },
];

const mockAgenciasMedios = [
  { id: 'am-001', nombre: 'MediaGroup Chile', rut: '76.123.456-7' },
  { id: 'am-002', nombre: 'Zenith Media', rut: '76.987.654-3' },
  { id: 'am-003', nombre: 'OMD Chile', rut: '76.555.444-2' },
];

const mockAgenciasCreativas = [
  { id: 'ac-001', nombre: 'DDB Chile', rut: '76.111.222-3' },
  { id: 'ac-002', nombre: 'McCann Santiago', rut: '76.333.444-5' },
  { id: 'ac-003', nombre: 'Wunderman Thompson', rut: '76.777.888-9' },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL DEL PASO
// ═══════════════════════════════════════════════════════════════

interface StepInfoFundamentalProps {
  state: WizardContratoState;
  dispatch: React.Dispatch<WizardAction>;
  setAnunciante: (anunciante: AnuncianteSeleccionado | null) => void;
}

const fmtDate = (d: Date | string | null | undefined): string => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

export const StepInfoFundamental: React.FC<StepInfoFundamentalProps> = ({
  state,
  dispatch,
  setAnunciante,
}) => {
  return (
    <div className="space-y-3">
      {/* Medio */}
      <div>
        <h3 className="text-[11px] font-semibold text-[#69738c] mb-1 flex items-center gap-1 uppercase tracking-wide">
          <Radio className="w-3.5 h-3.5 text-[#6888ff]" />
          Medio del Contrato
        </h3>
        <MedioSelector
          selected={state.medio}
          onSelect={(medio) => dispatch({ type: "SET_MEDIO", payload: medio })}
        />
      </div>

      {/* Selector de anunciante */}
      <SelectorAnunciante
        selected={state.anunciante}
        onSelect={setAnunciante}
      />

      {/* Campaña + Fechas */}
      <div className="grid md:grid-cols-5 gap-3">
        <div className="md:col-span-3">
          <NeuromorphicInput
            label="Nombre de Campaña (Producto)"
            value={state.campana}
            onChange={(value) => dispatch({ type: "SET_CAMPANA", payload: value })}
            placeholder="Ej: Campaña Navidad 2025"
            icon={Sparkles}
            required
            error={state.errors["step1_error0"]}
          />
        </div>
        <div className="md:col-span-2 grid grid-cols-2 gap-2">
          <NeuromorphicInput
            label="Fecha Inicio"
            type="date"
            value={fmtDate(state.fechaInicio)}
            onChange={(value) => dispatch({ type: "SET_FECHAS", payload: { inicio: value ? new Date(value) : null, fin: state.fechaFin } })}
            icon={Calendar}
            required
          />
          <NeuromorphicInput
            label="Fecha Fin"
            type="date"
            value={fmtDate(state.fechaFin)}
            onChange={(value) => dispatch({ type: "SET_FECHAS", payload: { inicio: state.fechaInicio, fin: value ? new Date(value) : null } })}
            icon={Calendar}
            required
          />
        </div>
      </div>

      {/* Datos | Dinero — fila por fila alineada */}
      <div className="space-y-3">
        {/* Fila 1: Agencia de Medios | Valor Bruto */}
        <div className="grid md:grid-cols-2 gap-3 items-start">
          <div className="space-y-0.5">
            <label className="block text-[11px] font-semibold text-[#69738c] uppercase tracking-wide">Agencia de Medios</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
              <select
                value={state.agenciaMediosId || ''}
                onChange={(e) => dispatch({ type: 'SET_AGENCIA_MEDIOS', payload: e.target.value })}
                className="w-full rounded-lg py-1.5 pl-9 pr-3 bg-[#dfeaff] shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] border-none outline-none focus:ring-1 focus:ring-[#6888ff]/40 text-xs text-[#69738c]"
              >
                <option value="">Seleccionar...</option>
                {mockAgenciasMedios.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-0.5">
            <label className="block text-[11px] font-semibold text-[#69738c] uppercase tracking-wide">
              {state.tieneComisionAgencia ? "Valor Bruto" : "Valor Bruto (bloqueado)"}
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
              <input
                type="text"
                inputMode="numeric"
                value={state.tieneComisionAgencia && state.valorBruto > 0 ? state.valorBruto.toLocaleString('es-CL') : ''}
                disabled={!state.tieneComisionAgencia}
                onChange={(e) => {
                  if (!state.tieneComisionAgencia) return;
                  const rawValue = e.target.value.replace(/\./g, '').replace(/ /g, '');
                  const bruto = Number(rawValue) || 0;
                  const factor = state.comisionAgencia > 0 ? (1 - state.comisionAgencia / 100) : 1;
                  const neto = Math.round(bruto * factor);
                  dispatch({ type: 'SET_VALORES', payload: { bruto, descuento: state.descuentoPorcentaje } });
                  dispatch({ type: 'SET_VALOR_NETO_MANUAL', payload: neto });
                }}
                onFocus={(e) => {
                  if (state.tieneComisionAgencia && state.valorBruto > 0) {
                    e.target.value = state.valorBruto.toString();
                  }
                }}
                onBlur={(e) => {
                  if (state.tieneComisionAgencia && state.valorBruto > 0) {
                    e.target.value = state.valorBruto.toLocaleString('es-CL');
                  }
                }}
                placeholder={state.tieneComisionAgencia ? "0" : "Activar comisión"}
                className={`w-full rounded-lg py-1.5 pl-9 pr-3 bg-[#dfeaff] shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] border-none outline-none focus:ring-1 focus:ring-[#6888ff]/40 text-sm font-bold text-[#6888ff] ${!state.tieneComisionAgencia ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Fila 2: Agencia Creativa | Comisión Agencia */}
        <div className="grid md:grid-cols-2 gap-3 items-start">
          <div className="space-y-0.5">
            <label className="block text-[11px] font-semibold text-[#69738c] uppercase tracking-wide">Agencia Creativa</label>
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
              <select
                value={state.agenciaCreativaId || ''}
                onChange={(e) => dispatch({ type: 'SET_AGENCIA_CREATIVA', payload: e.target.value })}
                className="w-full rounded-lg py-1.5 pl-9 pr-3 bg-[#dfeaff] shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] border-none outline-none focus:ring-1 focus:ring-[#6888ff]/40 text-xs text-[#69738c]"
              >
                <option value="">Seleccionar...</option>
                {mockAgenciasCreativas.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-0.5">
            <label className="block text-[11px] font-semibold text-[#69738c] uppercase tracking-wide">Comisión Agencia</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch({ type: 'SET_TIENE_COMISION', payload: !state.tieneComisionAgencia })}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={state.tieneComisionAgencia
                  ? { background: '#6888ff', color: '#fff', boxShadow: '2px 2px 4px #bec8de, -2px -2px 4px #ffffff' }
                  : { background: '#dfeaff', color: '#9aa3b8', boxShadow: 'inset 2px 2px 4px #bec8de, inset -2px -2px 4px #ffffff' }}
              >
                {state.tieneComisionAgencia ? 'Sí' : 'No'}
              </button>
              {state.tieneComisionAgencia && (
                <div className="relative flex-1">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8] z-10" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={state.comisionAgencia > 0 ? state.comisionAgencia.toString() : ''}
                    onChange={(e) => {
                      const comision = Number(e.target.value) || 0;
                      dispatch({ type: 'SET_COMISION_AGENCIA', payload: { comision, facturar: state.facturarComisionAgencia } });
                    }}
                    placeholder="0"
                    className="w-full rounded-lg py-1.5 pl-9 pr-3 bg-[#dfeaff] shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] border-none outline-none focus:ring-1 focus:ring-[#6888ff]/40 text-sm font-bold text-[#6888ff]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fila 3: Ejecutivo | Valor Neto */}
        <div className="grid md:grid-cols-2 gap-3 items-start">
          <div className="space-y-0.5">
            <label className="block text-[11px] font-semibold text-[#69738c] uppercase tracking-wide">Ejecutivo *</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
              <select
                value={state.ejecutivoAsignado?.id || ''}
                onChange={(e) => {
                  const v = mockEjecutivos.find(x => x.id === e.target.value);
                  dispatch({ type: 'SET_EJECUTIVO', payload: v ? { id: v.id, nombre: v.nombre } : null });
                }}
                className="w-full rounded-lg py-1.5 pl-9 pr-3 bg-[#dfeaff] shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] border-none outline-none focus:ring-1 focus:ring-[#6888ff]/40 text-xs text-[#69738c]"
              >
                <option value="">Seleccionar ejecutivo...</option>
                {mockEjecutivos.map(ej => (
                  <option key={ej.id} value={ej.id}>{ej.nombre} — {ej.cargo}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-0.5">
            <label className="block text-[11px] font-semibold text-[#69738c] uppercase tracking-wide">Valor Neto</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
              <input
                type="text"
                inputMode="numeric"
                value={state.valorNeto > 0 ? state.valorNeto.toLocaleString('es-CL') : ''}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\./g, '').replace(/ /g, '');
                  const neto = Number(rawValue) || 0;
                  dispatch({ type: 'SET_VALOR_NETO_MANUAL', payload: neto });
                }}
                onFocus={(e) => {
                  if (state.valorNeto > 0) {
                    e.target.value = state.valorNeto.toString();
                  }
                }}
                onBlur={(e) => {
                  const rawValue = e.target.value.replace(/\./g, '');
                  const neto = Number(rawValue) || 0;
                  if (neto > 0) {
                    e.target.value = neto.toLocaleString('es-CL');
                  }
                }}
                placeholder="0"
                className="w-full rounded-lg py-1.5 pl-9 pr-3 bg-[#dfeaff] shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] border-none outline-none focus:ring-1 focus:ring-[#6888ff]/40 text-sm font-bold text-[#6888ff]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Descripción (izq) | Clasificación (der) */}
      <div className="grid md:grid-cols-2 gap-3 items-start">
        <NeuromorphicTextarea
          label="Descripción del Contrato"
          value={state.descripcion}
          onChange={(value) => dispatch({ type: "SET_DESCRIPCION", payload: value })}
          placeholder="Describa el objetivo principal de esta campaña publicitaria..."
          rows={8}
          className="h-full"
        />
        <SelectorPropiedades
          selected={state.propiedadesSeleccionadas || []}
          onUpdate={(props) => dispatch({ type: "SET_PROPIEDADES", payload: props })}
          error={Object.keys(state.errors).some((k) => state.errors[k].includes("propiedad maestra"))
            ? "Debe clasificar el contrato con al menos una propiedad maestra."
            : undefined}
        />
      </div>

      {/* Resumen de errores de validación */}
      {Object.keys(state.errors).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-[#dfeaff]0/10 border border-[#bec8de]/20"
        >
          <p className="text-[11px] font-semibold text-[#9aa3b8] mb-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Complete los siguientes campos para continuar:
          </p>
          <ul className="text-[11px] text-[#9aa3b8] space-y-0.5 list-disc list-inside">
            {Object.values(state.errors).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default StepInfoFundamental;
