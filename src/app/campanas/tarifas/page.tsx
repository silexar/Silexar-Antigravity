/**
 * 💰 SILEXAR PULSE - Página Tarifas Campaña
 * 
 * @description Configuración financiera de campaña con IA predictiva
 * @version 2030.0.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  DollarSign, Calculator, TrendingUp, Percent, Package,
  Sparkles, CheckCircle, RefreshCw, Save
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════

const tarifasCampana = {
  campanaId: 'CMP-25-001',
  campanaNombre: 'Promoción Navidad Premium 2025',
  anunciante: 'BANCO DE CHILE',
  
  modalidad: 'paquete_acordado',
  valorPaquete: 2500000,
  
  descuentos: [
    { nombre: 'Cliente AAA', porcentaje: 5, emisora: 'Global', aplicado: true },
    { nombre: 'Volumen Navidad', porcentaje: 3, emisora: 'T13', aplicado: true },
    { nombre: 'Pronto Pago', porcentaje: 2, emisora: 'Global', aplicado: false }
  ],
  
  comisionAgencia: 15,
  
  resumen: {
    valorBruto: 2500000,
    descuentosAplicados: 200000,
    valorNeto: 2300000,
    comision: 345000,
    valorFinal: 2300000
  },
  
  lineas: [
    { id: 1, bloque: 'PRIME MATINAL', duracion: 30, cantidad: 50, valorUnitario: 85000, total: 4250000 },
    { id: 2, bloque: 'PRIME VESPERTINO', duracion: 30, cantidad: 40, valorUnitario: 75000, total: 3000000 },
    { id: 3, bloque: 'AUSPICIO', duracion: 15, cantidad: 30, valorUnitario: 45000, total: 1350000 }
  ],
  
  prediccionIA: {
    probabilidadAprobacion: 92,
    margenOptimo: 18,
    competidorReferencia: 'Ripley',
    precioMercado: 2400000,
    recomendacion: 'Precio competitivo, alta probabilidad de cierre'
  }
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const formatCurrency = (value: number) => `$${value.toLocaleString('es-CL')}`;

// ═══════════════════════════════════════════════════════════════
// PÁGINA
// ═══════════════════════════════════════════════════════════════

export default function TarifasCampanaPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _params = useParams();
  const [modalidad, setModalidad] = useState(tarifasCampana.modalidad);
  const [valorPaquete, setValorPaquete] = useState(tarifasCampana.valorPaquete);
  const [comision, setComision] = useState(tarifasCampana.comisionAgencia);
  const [descuentos, setDescuentos] = useState(tarifasCampana.descuentos);
  const [guardando, setGuardando] = useState(false);

  const toggleDescuento = (index: number) => {
    const nuevos = [...descuentos];
    nuevos[index].aplicado = !nuevos[index].aplicado;
    setDescuentos(nuevos);
  };

  const calcularTotal = () => {
    const descAplicados = descuentos.filter(d => d.aplicado).reduce((sum, d) => sum + d.porcentaje, 0);
    const descMonto = valorPaquete * (descAplicados / 100);
    const neto = valorPaquete - descMonto;
    const comisionMonto = neto * (comision / 100);
    return { bruto: valorPaquete, descuento: descMonto, neto, comisionMonto };
  };

  const totales = calcularTotal();

  const guardar = async () => {
    setGuardando(true);
    await new Promise(r => setTimeout(r, 1500));
    setGuardando(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
              <DollarSign className="w-10 h-10 text-emerald-500" />
              Configuración de Tarifas
            </h1>
            <p className="text-slate-500 mt-2">{tarifasCampana.campanaNombre} • {tarifasCampana.anunciante}</p>
          </div>
          
          <button
            onClick={guardar}
            disabled={guardando}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg"
          >
            {guardando ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar Cambios
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Modalidad */}
          <Card className="lg:col-span-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-emerald-500" />
              Modalidad de Tarificación
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${modalidad === 'paquete_acordado' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}>
                <input type="radio" name="modalidad" value="paquete_acordado" checked={modalidad === 'paquete_acordado'} onChange={(e) => setModalidad(e.target.value)} className="sr-only" />
                <div className="flex items-center gap-3">
                  <Package className={`w-6 h-6 ${modalidad === 'paquete_acordado' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <div>
                    <p className="font-medium text-slate-800">Paquete Acordado</p>
                    <p className="text-sm text-slate-500">Valor fijo total de campaña</p>
                  </div>
                </div>
              </label>
              
              <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${modalidad === 'tarifa_spot' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}>
                <input type="radio" name="modalidad" value="tarifa_spot" checked={modalidad === 'tarifa_spot'} onChange={(e) => setModalidad(e.target.value)} className="sr-only" />
                <div className="flex items-center gap-3">
                  <Calculator className={`w-6 h-6 ${modalidad === 'tarifa_spot' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <div>
                    <p className="font-medium text-slate-800">Tarifa por Spot</p>
                    <p className="text-sm text-slate-500">Valor individual por cuña</p>
                  </div>
                </div>
              </label>
            </div>

            {modalidad === 'paquete_acordado' && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <label className="text-sm text-slate-600 mb-2 block">Valor del Paquete</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={valorPaquete}
                    onChange={(e) => setValorPaquete(parseInt(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-white border border-slate-200 font-bold text-xl text-slate-800"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Predicción IA */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Análisis IA
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Prob. Aprobación</span>
                <span className="font-bold text-emerald-600">{tarifasCampana.prediccionIA.probabilidadAprobacion}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Margen Óptimo</span>
                <span className="font-bold text-purple-600">{tarifasCampana.prediccionIA.margenOptimo}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Precio Mercado</span>
                <span className="font-bold text-slate-700">{formatCurrency(tarifasCampana.prediccionIA.precioMercado)}</span>
              </div>
              <div className="p-3 bg-white/50 rounded-lg mt-3">
                <p className="text-sm text-purple-700">{tarifasCampana.prediccionIA.recomendacion}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Descuentos */}
        <Card>
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Percent className="w-5 h-5 text-emerald-500" />
            Descuentos Aplicables
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                  <th className="py-3 px-4">Aplicar</th>
                  <th className="py-3 px-4">Descuento</th>
                  <th className="py-3 px-4">Porcentaje</th>
                  <th className="py-3 px-4">Emisora</th>
                  <th className="py-3 px-4">Monto</th>
                </tr>
              </thead>
              <tbody>
                {descuentos.map((d, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-3 px-4">
                      <button onClick={() => toggleDescuento(i)} className={`w-6 h-6 rounded ${d.aplicado ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                        {d.aplicado && <CheckCircle className="w-6 h-6" />}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{d.nombre}</td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">{d.porcentaje}%</td>
                    <td className="py-3 px-4 text-slate-600">{d.emisora}</td>
                    <td className="py-3 px-4 text-slate-700">{d.aplicado ? formatCurrency(valorPaquete * d.porcentaje / 100) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Comisión */}
        <Card>
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Comisión de Agencia
          </h3>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="30"
              value={comision}
              onChange={(e) => setComision(parseInt(e.target.value))}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-2xl font-bold text-emerald-600 w-16">{comision}%</span>
          </div>
          <p className="text-sm text-slate-500 mt-2">Monto comisión: {formatCurrency(totales.comisionMonto)}</p>
        </Card>

        {/* Resumen */}
        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600">
          <h3 className="font-bold text-white flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5" />
            Resumen Financiero
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/20 rounded-xl">
              <p className="text-emerald-100 text-sm">Valor Bruto</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totales.bruto)}</p>
            </div>
            <div className="p-4 bg-white/20 rounded-xl">
              <p className="text-emerald-100 text-sm">Descuentos</p>
              <p className="text-2xl font-bold text-white">-{formatCurrency(totales.descuento)}</p>
            </div>
            <div className="p-4 bg-white/20 rounded-xl">
              <p className="text-emerald-100 text-sm">Comisión</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totales.comisionMonto)}</p>
            </div>
            <div className="p-4 bg-white/30 rounded-xl">
              <p className="text-emerald-100 text-sm">Valor Neto Final</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totales.neto)}</p>
            </div>
          </div>
        </Card>

        <div className="text-center text-slate-400 text-sm">
          <p>💰 Configuración Tarifas - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
