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

import { NeoPageHeader, NeoCard, NeoButton, NeoInput, N } from '../_lib/neumorphic';

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
    <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <NeoPageHeader
          title="Configuración de Tarifas"
          subtitle={`${tarifasCampana.campanaNombre} • ${tarifasCampana.anunciante}`}
          icon={DollarSign}
          backHref="/campanas"
        />

        <div className="flex justify-end">
          <NeoButton onClick={guardar} disabled={guardando} variant="primary">
            {guardando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios
          </NeoButton>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Modalidad */}
          <NeoCard className="lg:col-span-2">
            <h3 className="font-black flex items-center gap-2 mb-4" style={{ color: N.text }}>
              <Package className="w-5 h-5" style={{ color: N.accent }} />
              Modalidad de Tarificación
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <label 
                className="p-4 rounded-2xl cursor-pointer transition-all"
                style={{
                  background: N.base,
                  boxShadow: modalidad === 'paquete_acordado' 
                    ? `inset 4px 4px 8px ${N.dark}, inset -4px -4px 8px ${N.light}`
                    : `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}`,
                  border: modalidad === 'paquete_acordado' ? `2px solid ${N.accent}` : '2px solid transparent'
                }}
              >
                <input type="radio" name="modalidad" value="paquete_acordado" checked={modalidad === 'paquete_acordado'} onChange={(e) => setModalidad(e.target.value)} className="sr-only" />
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6" style={{ color: modalidad === 'paquete_acordado' ? N.accent : N.textSub }} />
                  <div>
                    <p className="font-bold" style={{ color: N.text }}>Paquete Acordado</p>
                    <p className="text-xs font-bold" style={{ color: N.textSub }}>Valor fijo total de campaña</p>
                  </div>
                </div>
              </label>
              
              <label 
                className="p-4 rounded-2xl cursor-pointer transition-all"
                style={{
                  background: N.base,
                  boxShadow: modalidad === 'tarifa_spot' 
                    ? `inset 4px 4px 8px ${N.dark}, inset -4px -4px 8px ${N.light}`
                    : `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}`,
                  border: modalidad === 'tarifa_spot' ? `2px solid ${N.accent}` : '2px solid transparent'
                }}
              >
                <input type="radio" name="modalidad" value="tarifa_spot" checked={modalidad === 'tarifa_spot'} onChange={(e) => setModalidad(e.target.value)} className="sr-only" />
                <div className="flex items-center gap-3">
                  <Calculator className="w-6 h-6" style={{ color: modalidad === 'tarifa_spot' ? N.accent : N.textSub }} />
                  <div>
                    <p className="font-bold" style={{ color: N.text }}>Tarifa por Spot</p>
                    <p className="text-xs font-bold" style={{ color: N.textSub }}>Valor individual por cuña</p>
                  </div>
                </div>
              </label>
            </div>

            {modalidad === 'paquete_acordado' && (
              <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark}, inset -4px -4px 8px ${N.light}` }}>
                <label className="text-xs font-black uppercase tracking-wider mb-2 block" style={{ color: N.textSub }}>Valor del Paquete</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: N.textSub }}>$</span>
                  <NeoInput
                    type="number"
                    aria-label="Valor del Paquete"
                    value={valorPaquete}
                    onChange={(e) => setValorPaquete(parseInt(e.target.value) || 0)}
                    className="pl-8 font-black text-xl"
                  />
                </div>
              </div>
            )}
          </NeoCard>

          {/* Predicción IA */}
          <NeoCard>
            <h3 className="font-black flex items-center gap-2 mb-4" style={{ color: N.text }}>
              <Sparkles className="w-5 h-5" style={{ color: N.accent }} />
              Análisis IA
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-bold" style={{ color: N.textSub }}>Prob. Aprobación</span>
                <span className="font-black" style={{ color: '#22c55e' }}>{tarifasCampana.prediccionIA.probabilidadAprobacion}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-bold" style={{ color: N.textSub }}>Margen Óptimo</span>
                <span className="font-black" style={{ color: N.accent }}>{tarifasCampana.prediccionIA.margenOptimo}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-bold" style={{ color: N.textSub }}>Precio Mercado</span>
                <span className="font-black" style={{ color: N.text }}>{formatCurrency(tarifasCampana.prediccionIA.precioMercado)}</span>
              </div>
              <div className="p-3 rounded-xl mt-3" style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}` }}>
                <p className="text-xs font-bold" style={{ color: N.accent }}>{tarifasCampana.prediccionIA.recomendacion}</p>
              </div>
            </div>
          </NeoCard>
        </div>

        {/* Descuentos */}
        <NeoCard>
          <h3 className="font-black flex items-center gap-2 mb-4" style={{ color: N.text }}>
            <Percent className="w-5 h-5" style={{ color: N.accent }} />
            Descuentos Aplicables
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `2px solid ${N.dark}40` }}>
                  <th className="py-3 px-4 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Aplicar</th>
                  <th className="py-3 px-4 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Descuento</th>
                  <th className="py-3 px-4 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Porcentaje</th>
                  <th className="py-3 px-4 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Emisora</th>
                  <th className="py-3 px-4 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {descuentos.map((d, i) => (
                  <tr key={d.nombre} style={{ borderBottom: `1px solid ${N.dark}30` }}>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => toggleDescuento(i)} 
                        className="w-6 h-6 rounded flex items-center justify-center transition-all"
                        style={{
                          background: d.aplicado ? N.accent : N.base,
                          boxShadow: d.aplicado 
                            ? `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}`
                            : `2px 2px 4px ${N.dark}, -2px -2px 4px ${N.light}`
                        }}
                      >
                        {d.aplicado && <CheckCircle className="w-4 h-4 text-white" />}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-bold" style={{ color: N.text }}>{d.nombre}</td>
                    <td className="py-3 px-4 font-black" style={{ color: N.accent }}>{d.porcentaje}%</td>
                    <td className="py-3 px-4" style={{ color: N.textSub }}>{d.emisora}</td>
                    <td className="py-3 px-4 font-bold" style={{ color: N.text }}>{d.aplicado ? formatCurrency(valorPaquete * d.porcentaje / 100) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeoCard>

        {/* Comisión */}
        <NeoCard>
          <h3 className="font-black flex items-center gap-2 mb-4" style={{ color: N.text }}>
            <TrendingUp className="w-5 h-5" style={{ color: N.accent }} />
            Comisión de Agencia
          </h3>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="30"
              value={comision}
              onChange={(e) => setComision(parseInt(e.target.value))}
              aria-label="Comisión de Agencia en porcentaje"
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
              style={{ 
                background: N.base, 
                boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}`,
                accentColor: N.accent
              }}
            />
            <span className="text-2xl font-black w-16" style={{ color: N.accent }}>{comision}%</span>
          </div>
          <p className="text-xs font-bold mt-2" style={{ color: N.textSub }}>Monto comisión: {formatCurrency(totales.comisionMonto)}</p>
        </NeoCard>

        {/* Resumen */}
        <NeoCard style={{ background: N.accent, boxShadow: `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}` }}>
          <h3 className="font-black text-white flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5" />
            Resumen Financiero
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.15)', boxShadow: `inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.2)` }}>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Valor Bruto</p>
              <p className="text-2xl font-black text-white">{formatCurrency(totales.bruto)}</p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.15)', boxShadow: `inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.2)` }}>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Descuentos</p>
              <p className="text-2xl font-black text-white">-{formatCurrency(totales.descuento)}</p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.15)', boxShadow: `inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.2)` }}>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Comisión</p>
              <p className="text-2xl font-black text-white">{formatCurrency(totales.comisionMonto)}</p>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.25)', boxShadow: `inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.3)` }}>
              <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Valor Neto Final</p>
              <p className="text-3xl font-black text-white">{formatCurrency(totales.neto)}</p>
            </div>
          </div>
        </NeoCard>

        <div className="text-center text-xs font-bold" style={{ color: N.textSub }}>
          <p>💰 Configuración Tarifas - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
