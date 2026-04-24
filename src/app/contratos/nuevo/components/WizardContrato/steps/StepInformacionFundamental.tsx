/**
 * 📋 SILEXAR PULSE - Step 1: Información Fundamental TIER 0
 *
 * @description Paso 1 del wizard con auto-inteligencia,
 * detección de contexto y validaciones en tiempo real.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  History,
  Plus,
  Search,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Anunciante {
  id: string;
  nombre: string;
  rut: string;
  industria: string;
  ejecutivoAsignado: string;
  ejecutivoNombre: string;
  scoreRiesgo: number;
  nivelRiesgo: "bajo" | "medio" | "alto" | "critico";
  limiteCredito: number;
  creditoDisponible: number;
  terminosPreferenciales?: {
    diasPago: number;
    descuentoBase: number;
  };
  contratosActivos: number;
  contratosHistoricos: number;
  valorTotalHistorico: number;
  ultimoContrato?: {
    numero: string;
    fecha: Date;
    valor: number;
  };
  alertas: string[];
}

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  tipoMedio: string;
  recomendado?: boolean;
  motivoRecomendacion?: string;
}

interface StepInformacionFundamentalProps {
  datos: {
    anuncianteId?: string;
    anuncianteNombre?: string;
    productoId?: string;
    productoNombre?: string;
    tipoContrato?: string;
    numeroContrato?: string;
  };
  contexto?: {
    origen: string;
    anuncianteId?: string;
  };
  onChange: (datos: Record<string, unknown>) => void;
  onValidationChange?: (isValid: boolean) => void;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockAnunciantes: Anunciante[] = [
  {
    id: "anun-001",
    nombre: "SuperMax SpA",
    rut: "76.123.456-7",
    industria: "Retail",
    ejecutivoAsignado: "ej-001",
    ejecutivoNombre: "Ana García",
    scoreRiesgo: 750,
    nivelRiesgo: "bajo",
    limiteCredito: 500000000,
    creditoDisponible: 320000000,
    terminosPreferenciales: { diasPago: 45, descuentoBase: 5 },
    contratosActivos: 3,
    contratosHistoricos: 12,
    valorTotalHistorico: 1200000000,
    ultimoContrato: {
      numero: "CON-2024-00845",
      fecha: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      valor: 95000000,
    },
    alertas: [],
  },
  {
    id: "anun-002",
    nombre: "Banco Nacional S.A.",
    rut: "97.030.000-7",
    industria: "Financiero",
    ejecutivoAsignado: "ej-002",
    ejecutivoNombre: "Carlos Mendoza",
    scoreRiesgo: 920,
    nivelRiesgo: "bajo",
    limiteCredito: 2000000000,
    creditoDisponible: 1500000000,
    terminosPreferenciales: { diasPago: 30, descuentoBase: 8 },
    contratosActivos: 5,
    contratosHistoricos: 28,
    valorTotalHistorico: 5800000000,
    ultimoContrato: {
      numero: "CON-2024-00842",
      fecha: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      valor: 280000000,
    },
    alertas: [],
  },
  {
    id: "anun-003",
    nombre: "TechCorp Ltda",
    rut: "76.890.123-4",
    industria: "Tecnología",
    ejecutivoAsignado: "ej-003",
    ejecutivoNombre: "Pedro Soto",
    scoreRiesgo: 580,
    nivelRiesgo: "medio",
    limiteCredito: 100000000,
    creditoDisponible: 25000000,
    contratosActivos: 1,
    contratosHistoricos: 4,
    valorTotalHistorico: 180000000,
    alertas: ["⚠️ Crédito disponible bajo", "📋 2 facturas pendientes"],
  },
];

const mockProductos: Producto[] = [
  {
    id: "prod-001",
    nombre: "Campaña Radio Nacional",
    descripcion: "Cobertura nacional en principales radios",
    precioBase: 5000000,
    tipoMedio: "RADIO",
    recomendado: true,
    motivoRecomendacion: "Popular en industria Retail",
  },
  {
    id: "prod-002",
    nombre: "Campaña TV Prime",
    descripcion: "Spots en horario prime canales abiertos",
    precioBase: 15000000,
    tipoMedio: "TV",
  },
  {
    id: "prod-003",
    nombre: "Campaña Digital 360",
    descripcion: "Redes sociales + display + video",
    precioBase: 8000000,
    tipoMedio: "DIGITAL",
    recomendado: true,
    motivoRecomendacion: "Alto ROI para Tecnología",
  },
  {
    id: "prod-004",
    nombre: "Vía Pública Metro",
    descripcion: "Pantallas y vallas en estaciones",
    precioBase: 12000000,
    tipoMedio: "VIA_PUBLICA",
  },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
};

const RiesgoBadge: React.FC<
  { nivel: Anunciante["nivelRiesgo"]; score: number }
> = ({ nivel, score }) => {
  const config = {
    bajo: { bg: "bg-green-100", text: "text-green-700", label: "Bajo Riesgo" },
    medio: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      label: "Riesgo Medio",
    },
    alto: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      label: "Riesgo Alto",
    },
    critico: {
      bg: "bg-red-100",
      text: "text-red-700",
      label: "Riesgo Crítico",
    },
  }[nivel];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bg}`}
    >
      <Shield className="w-4 h-4" />
      <span className={`text-sm font-medium ${config.text}`}>
        {score}/1000 • {config.label}
      </span>
    </div>
  );
};

const AnuncianteCard: React.FC<{
  anunciante: Anunciante;
  seleccionado: boolean;
  onClick: () => void;
}> = ({ anunciante, seleccionado, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.01 }}
    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
      seleccionado
        ? "border-indigo-500 bg-[#6888ff15]/50 shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]"
        : "border-[#bec8de40] bg-[#dfeaff] hover:border-[#bec8de50] hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]"
    }`}
  >
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-xl bg-[#6888ff15]">
        <Building2 className="w-6 h-6 text-[#6888ff]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-[#69738c]">{anunciante.nombre}</h4>
          {seleccionado && <CheckCircle2 className="w-5 h-5 text-[#6888ff]" />}
        </div>
        <p className="text-sm text-[#9aa3b8]">
          {anunciante.rut} • {anunciante.industria}
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-2">
          <RiesgoBadge
            nivel={anunciante.nivelRiesgo}
            score={anunciante.scoreRiesgo}
          />
          <span className="text-xs text-[#9aa3b8] flex items-center gap-1">
            <Users className="w-3 h-3" />
            {anunciante.ejecutivoNombre}
          </span>
        </div>

        {anunciante.terminosPreferenciales && (
          <div className="mt-2 p-2 rounded-lg bg-green-50 border border-green-100">
            <p className="text-xs text-green-700 flex items-center gap-1">
              <Star className="w-3 h-3" />
              Términos preferenciales:{" "}
              {anunciante.terminosPreferenciales.diasPago} días,{" "}
              {anunciante.terminosPreferenciales.descuentoBase}% desc. base
            </p>
          </div>
        )}

        {anunciante.alertas.length > 0 && (
          <div className="mt-2 space-y-1">
            {anunciante.alertas.map((alerta, idx) => (
              <p
                key={idx}
                className="text-xs text-amber-600 flex items-center gap-1"
              >
                <AlertTriangle className="w-3 h-3" />
                {alerta}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="text-right">
        <p className="text-xs text-[#9aa3b8]">Crédito disponible</p>
        <p className="font-bold text-emerald-600">
          {formatCurrency(anunciante.creditoDisponible)}
        </p>
        <p className="text-xs text-[#9aa3b8] mt-1">
          {anunciante.contratosActivos} contratos activos
        </p>
      </div>
    </div>
  </motion.button>
);

const ProductoCard: React.FC<{
  producto: Producto;
  seleccionado: boolean;
  onClick: () => void;
}> = ({ producto, seleccionado, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    className={`p-4 rounded-xl border-2 text-left transition-all ${
      seleccionado
        ? "border-indigo-500 bg-[#6888ff15]/50 shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]"
        : "border-[#bec8de40] bg-[#dfeaff] hover:border-[#bec8de50]"
    }`}
  >
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-[#69738c]">{producto.nombre}</h4>
          {producto.recomendado && (
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Recomendado
            </span>
          )}
        </div>
        <p className="text-sm text-[#9aa3b8] mt-1">{producto.descripcion}</p>
        {producto.motivoRecomendacion && (
          <p className="text-xs text-[#6888ff] mt-1">
            💡 {producto.motivoRecomendacion}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="font-bold text-[#69738c]">
          {formatCurrency(producto.precioBase)}
        </p>
        <p className="text-xs text-[#9aa3b8]">{producto.tipoMedio}</p>
      </div>
    </div>
  </motion.button>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function StepInformacionFundamental({
  datos,
  contexto,
  onChange,
  onValidationChange,
}: StepInformacionFundamentalProps) {
  const [busquedaAnunciante, setBusquedaAnunciante] = useState("");
  const [anuncianteSeleccionado, setAnuncianteSeleccionado] = useState<
    Anunciante | null
  >(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<
    Producto | null
  >(null);
  const [numeroContrato, setNumeroContrato] = useState("");
  const [cargando, setCargando] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mostrarHistorial, _setMostrarHistorial] = useState(false);

  // Generar número de contrato al iniciar
  useEffect(() => {
    if (!datos.numeroContrato) {
      const year = new Date().getFullYear();
      const secuencia = String(Math.floor(Math.random() * 99999) + 1).padStart(
        5,
        "0",
      );
      const nuevoNumero = `CON-${year}-${secuencia}`;
      setNumeroContrato(nuevoNumero);
      onChange({ ...datos, numeroContrato: nuevoNumero });
    } else {
      setNumeroContrato(datos.numeroContrato);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-cargar anunciante si viene del contexto
  useEffect(() => {
    if (contexto?.anuncianteId) {
      setCargando(true);
      // Simular carga del anunciante
      setTimeout(() => {
        const anunciante = mockAnunciantes.find((a) =>
          a.id === contexto.anuncianteId
        );
        if (anunciante) {
          setAnuncianteSeleccionado(anunciante);
          onChange({
            ...datos,
            anuncianteId: anunciante.id,
            anuncianteNombre: anunciante.nombre,
          });
        }
        setCargando(false);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contexto]);

  // Filtrar anunciantes
  const anunciantesFiltrados = busquedaAnunciante
    ? mockAnunciantes.filter((a) =>
      a.nombre.toLowerCase().includes(busquedaAnunciante.toLowerCase()) ||
      a.rut.includes(busquedaAnunciante)
    )
    : mockAnunciantes;

  // Validación
  useEffect(() => {
    const isValid = !!anuncianteSeleccionado && !!productoSeleccionado;
    onValidationChange?.(isValid);
  }, [anuncianteSeleccionado, productoSeleccionado, onValidationChange]);

  const handleAnuncianteSelect = (anunciante: Anunciante) => {
    setAnuncianteSeleccionado(anunciante);
    onChange({
      ...datos,
      anuncianteId: anunciante.id,
      anuncianteNombre: anunciante.nombre,
    });
  };

  const handleProductoSelect = (producto: Producto) => {
    setProductoSeleccionado(producto);
    onChange({
      ...datos,
      productoId: producto.id,
      productoNombre: producto.nombre,
    });
  };

  return (
    <div className="space-y-8">
      {/* Número de contrato generado */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-[#6888ff15] border border-[#6888ff30]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#6888ff25]">
              <FileText className="w-5 h-5 text-[#6888ff]" />
            </div>
            <div>
              <p className="text-sm text-[#69738c]">ID de Contrato Generado</p>
              <p className="text-xl font-bold font-mono text-[#6888ff]">
                {numeroContrato}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-[#9aa3b8]">
              <Clock className="w-3 h-3" />
              <span>Bloqueado para evitar duplicados</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Auditoría registrada</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sección Anunciante */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#6888ff]" />
            <h3 className="text-lg font-semibold text-[#69738c]">Anunciante</h3>
            {anuncianteSeleccionado && (
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                ✓ Seleccionado
              </span>
            )}
          </div>
          {contexto?.origen === "anunciante" && (
            <span className="px-3 py-1 rounded-full bg-[#6888ff25] text-[#6888ff] text-xs font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Pre-llenado automático
            </span>
          )}
        </div>

        {/* Búsqueda */}
        {!anuncianteSeleccionado && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9aa3b8]" />
            <input
              type="text"
              value={busquedaAnunciante}
              onChange={(e) => setBusquedaAnunciante(e.target.value)}
              placeholder="Buscar por nombre o RUT..."
              aria-label="Buscar anunciante por nombre o RUT"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#bec8de40] outline-none focus:ring-2 focus:ring-[#6888ff]/50"
            />
          </div>
        )}

        {/* Loading */}
        {cargando && (
          <div className="p-8 text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full border-2 border-[#6888ff30] border-t-indigo-500 animate-spin" />
            <p className="text-[#9aa3b8]">Cargando datos del anunciante...</p>
          </div>
        )}

        {/* Anunciante seleccionado */}
        {anuncianteSeleccionado && !cargando && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <AnuncianteCard
              anunciante={anuncianteSeleccionado}
              seleccionado={true}
              onClick={() => setAnuncianteSeleccionado(null)}
            />

            {/* Panel de información adicional */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#dfeaff] border border-[#bec8de40]">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-[#9aa3b8]" />
                  <span className="text-sm font-medium text-[#69738c]">
                    Límite de Crédito
                  </span>
                </div>
                <p className="text-xl font-bold text-[#69738c]">
                  {formatCurrency(anuncianteSeleccionado.limiteCredito)}
                </p>
                <p className="text-xs text-[#9aa3b8] mt-1">
                  Disponible:{" "}
                  <span className="text-emerald-600 font-medium">
                    {formatCurrency(anuncianteSeleccionado.creditoDisponible)}
                  </span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#dfeaff] border border-[#bec8de40]">
                <div className="flex items-center gap-2 mb-2">
                  <History className="w-4 h-4 text-[#9aa3b8]" />
                  <span className="text-sm font-medium text-[#69738c]">
                    Historial
                  </span>
                </div>
                <p className="text-xl font-bold text-[#69738c]">
                  {anuncianteSeleccionado.contratosHistoricos} contratos
                </p>
                <p className="text-xs text-[#9aa3b8] mt-1">
                  Valor total:{" "}
                  <span className="font-medium">
                    {formatCurrency(anuncianteSeleccionado.valorTotalHistorico)}
                  </span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#dfeaff] border border-[#bec8de40]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#9aa3b8]" />
                  <span className="text-sm font-medium text-[#69738c]">
                    Último Contrato
                  </span>
                </div>
                {anuncianteSeleccionado.ultimoContrato
                  ? (
                    <>
                      <p className="text-sm font-mono text-[#6888ff]">
                        {anuncianteSeleccionado.ultimoContrato.numero}
                      </p>
                      <p className="text-xs text-[#9aa3b8] mt-1">
                        {formatCurrency(
                          anuncianteSeleccionado.ultimoContrato.valor,
                        )} • hace {Math.floor(
                          (Date.now() -
                            anuncianteSeleccionado.ultimoContrato.fecha
                              .getTime()) / (1000 * 60 * 60 * 24),
                        )} días
                      </p>
                    </>
                  )
                  : (
                    <p className="text-sm text-[#9aa3b8]">
                      Sin contratos previos
                    </p>
                  )}
              </div>
            </div>

            <button
              onClick={() => setAnuncianteSeleccionado(null)}
              className="text-sm text-[#6888ff] hover:underline"
            >
              ← Cambiar anunciante
            </button>
          </motion.div>
        )}

        {/* Lista de anunciantes */}
        {!anuncianteSeleccionado && !cargando && (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {anunciantesFiltrados.map((anunciante) => (
              <AnuncianteCard
                key={anunciante.id}
                anunciante={anunciante}
                seleccionado={false}
                onClick={() => handleAnuncianteSelect(anunciante)}
              />
            ))}
            {anunciantesFiltrados.length === 0 && (
              <div className="p-8 text-center text-[#9aa3b8]">
                <Building2 className="w-12 h-12 mx-auto mb-2 text-[#9aa3b8]" />
                <p>No se encontraron anunciantes</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección Producto */}
      {anuncianteSeleccionado && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-[#69738c]">
                Producto / Campaña
              </h3>
              {productoSeleccionado && (
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  ✓ Seleccionado
                </span>
              )}
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-[#6888ff25] text-[#6888ff] text-sm font-medium flex items-center gap-1 hover:bg-indigo-200 transition-colors">
              <Plus className="w-4 h-4" />
              Crear Producto
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {mockProductos.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                seleccionado={productoSeleccionado?.id === producto.id}
                onClick={() => handleProductoSelect(producto)}
              />
            ))}
          </div>

          {/* Sugerencias IA */}
          <div className="mt-4 p-4 rounded-xl bg-[#f59e0b15] border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span className="font-medium text-amber-800">
                Sugerencias de Cortex IA
              </span>
            </div>
            <p className="text-sm text-amber-700">
              Basado en la industria{" "}
              <strong>{anuncianteSeleccionado.industria}</strong>{" "}
              y estacionalidad actual, recomendamos campañas de Radio y Digital
              con enfoque en audiencias masivas.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
