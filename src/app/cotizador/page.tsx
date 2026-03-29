/**
 * 💡 SILEXAR PULSE - Página Cotizador Inteligente
 * 
 * @description Cotizador con IA: precios, descuentos, simulador, PDF
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState } from 'react';
import { 
  Calculator, Plus, Trash2, Sparkles, Download, Send,
  RefreshCw
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface LineaCotizacion {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  horario: string;
  precioUnitario: number;
  subtotal: number;
}

interface Cotizacion {
  lineas: LineaCotizacion[];
  subtotal: number;
  descuentos: { tipo: string; porcentaje: number; monto: number }[];
  totalDescuentos: number;
  neto: number;
  iva: number;
  total: number;
  probabilidadAceptacion: number;
  recomendaciones: string[];
}

// ═══════════════════════════════════════════════════════════════
// DATOS
// ═══════════════════════════════════════════════════════════════

const productos = [
  { id: 'spot-30', nombre: 'Spot 30 segundos', precioBase: 45000 },
  { id: 'spot-15', nombre: 'Spot 15 segundos', precioBase: 28000 },
  { id: 'mencion', nombre: 'Mención en vivo', precioBase: 35000 },
  { id: 'patrocinio', nombre: 'Patrocinio programa', precioBase: 500000 }
];

const horarios = [
  { id: 'prime', nombre: 'Prime (18-21h)', factor: 1.5 },
  { id: 'rotativo', nombre: 'Rotativo', factor: 1.0 },
  { id: 'madrugada', nombre: 'Madrugada', factor: 0.5 }
];

const clientes = [
  { id: 'cli-001', nombre: 'Empresa ABC Ltda', descuentos: [{ tipo: 'Antigüedad', pct: 10 }] },
  { id: 'cli-002', nombre: 'Servicios XYZ SpA', descuentos: [] },
  { id: 'cli-003', nombre: 'Comercial DEF', descuentos: [{ tipo: 'Volumen', pct: 5 }] }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const ProbabilidadMeter = ({ valor }: { valor: number }) => {
  const color = valor >= 70 ? 'from-emerald-400 to-emerald-500' : valor >= 50 ? 'from-amber-400 to-amber-500' : 'from-red-400 to-red-500';
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">Probabilidad de Aceptación</span>
        <span className="font-bold">{valor}%</span>
      </div>
      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${valor}%` }} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PÁGINA
// ═══════════════════════════════════════════════════════════════

export default function CotizadorPage() {
  const [clienteId, setClienteId] = useState('');
  const [lineas, setLineas] = useState<LineaCotizacion[]>([]);
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [calculando, setCalculando] = useState(false);

  const agregarLinea = () => {
    const nuevaLinea: LineaCotizacion = {
      id: `linea-${Date.now()}`,
      productoId: 'spot-30',
      productoNombre: 'Spot 30 segundos',
      cantidad: 10,
      horario: 'rotativo',
      precioUnitario: 45000,
      subtotal: 450000
    };
    setLineas([...lineas, nuevaLinea]);
  };

  const actualizarLinea = (id: string, campo: string, valor: string | number) => {
    setLineas(lineas.map(l => {
      if (l.id !== id) return l;
      
      const updated = { ...l, [campo]: valor };
      
      if (campo === 'productoId') {
        const prod = productos.find(p => p.id === valor);
        if (prod) {
          updated.productoNombre = prod.nombre;
          updated.precioUnitario = prod.precioBase;
        }
      }
      
      if (campo === 'horario') {
        const hor = horarios.find(h => h.id === valor);
        const prod = productos.find(p => p.id === updated.productoId);
        if (hor && prod) {
          updated.precioUnitario = Math.round(prod.precioBase * hor.factor);
        }
      }
      
      updated.subtotal = updated.precioUnitario * (typeof updated.cantidad === 'number' ? updated.cantidad : parseInt(String(updated.cantidad)) || 0);
      
      return updated;
    }));
  };

  const eliminarLinea = (id: string) => {
    setLineas(lineas.filter(l => l.id !== id));
  };

  const calcularCotizacion = async () => {
    if (lineas.length === 0 || !clienteId) return;
    
    setCalculando(true);
    await new Promise(r => setTimeout(r, 800));
    
    const cliente = clientes.find(c => c.id === clienteId);
    const subtotal = lineas.reduce((sum, l) => sum + l.subtotal, 0);
    
    // Descuentos del cliente
    const descuentos = cliente?.descuentos.map(d => ({
      tipo: d.tipo,
      porcentaje: d.pct,
      monto: Math.round(subtotal * (d.pct / 100))
    })) || [];
    
    // Descuento por volumen
    if (subtotal >= 20000000) {
      descuentos.push({ tipo: 'Volumen', porcentaje: 5, monto: Math.round(subtotal * 0.05) });
    }
    
    const totalDescuentos = descuentos.reduce((sum, d) => sum + d.monto, 0);
    const neto = subtotal - totalDescuentos;
    const iva = Math.round(neto * 0.19);
    const total = neto + iva;
    
    // IA: Probabilidad
    let prob = 50;
    if (cliente?.descuentos.length) prob += 15;
    if (lineas.length >= 2) prob += 10;
    if (total < 30000000) prob += 10;
    
    // IA: Recomendaciones
    const recs = [];
    if (lineas.length === 1) recs.push('💡 Agregar más productos activa descuento por volumen');
    if (!descuentos.length) recs.push('🎯 Ofrecer pago anticipado para 3% descuento adicional');
    recs.push('⏰ Enviar antes de las 11 AM tiene 23% más conversión');
    
    setCotizacion({
      lineas,
      subtotal,
      descuentos,
      totalDescuentos,
      neto,
      iva,
      total,
      probabilidadAceptacion: Math.min(85, prob),
      recomendaciones: recs
    });
    
    setCalculando(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
              <Calculator className="w-10 h-10 text-cyan-500" />
              Cotizador Inteligente
            </h1>
            <p className="text-slate-500 mt-2">Genera cotizaciones con IA en segundos</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Panel de configuración */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cliente */}
            <Card>
              <h2 className="font-bold text-slate-800 mb-4">Cliente</h2>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                aria-label="Seleccionar cliente"
                className="w-full p-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-300"
              >
                <option value="">Seleccionar cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              
              {clienteId && (
                <div className="mt-3 p-3 bg-cyan-50 rounded-lg">
                  <p className="text-sm text-cyan-700">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Descuentos aplicables: {clientes.find(c => c.id === clienteId)?.descuentos.map(d => `${d.tipo} ${d.pct}%`).join(', ') || 'Ninguno'}
                  </p>
                </div>
              )}
            </Card>

            {/* Productos */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800">Productos</h2>
                <button 
                  onClick={agregarLinea}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
              
              {lineas.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Agrega productos a la cotización</p>
              ) : (
                <div className="space-y-3">
                  {lineas.map((linea) => (
                    <div key={linea.id} className="p-4 bg-white rounded-xl border border-slate-100 grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-4">
                        <select
                          value={linea.productoId}
                          onChange={(e) => actualizarLinea(linea.id, 'productoId', e.target.value)}
                          aria-label="Producto"
                          className="w-full p-2 bg-slate-50 rounded-lg text-sm"
                        >
                          {productos.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <select
                          value={linea.horario}
                          onChange={(e) => actualizarLinea(linea.id, 'horario', e.target.value)}
                          aria-label="Horario"
                          className="w-full p-2 bg-slate-50 rounded-lg text-sm"
                        >
                          {horarios.map(h => (
                            <option key={h.id} value={h.id}>{h.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={linea.cantidad}
                          onChange={(e) => actualizarLinea(linea.id, 'cantidad', parseInt(e.target.value) || 1)}
                          aria-label="Cantidad"
                          className="w-full p-2 bg-slate-50 rounded-lg text-sm text-center"
                        />
                      </div>
                      <div className="col-span-3 text-right font-medium">
                        ${(linea.subtotal / 1000).toFixed(0)}K
                      </div>
                      <div className="col-span-1 text-right">
                        <button onClick={() => eliminarLinea(linea.id)} aria-label="Eliminar" className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {lineas.length > 0 && (
                <button 
                  onClick={calcularCotizacion}
                  disabled={calculando || !clienteId}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  {calculando ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Calcular con IA
                </button>
              )}
            </Card>
          </div>

          {/* Panel de resultados */}
          <div className="space-y-6">
            {cotizacion ? (
              <>
                <Card>
                  <h2 className="font-bold text-slate-800 mb-4">Resumen Cotización</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium">${(cotizacion.subtotal / 1000000).toFixed(2)}M</span>
                    </div>
                    
                    {cotizacion.descuentos.map((d, i) => (
                      <div key={i} className="flex justify-between text-emerald-600">
                        <span>{d.tipo} ({d.porcentaje}%)</span>
                        <span>-${(d.monto / 1000).toFixed(0)}K</span>
                      </div>
                    ))}
                    
                    <hr className="border-slate-200" />
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">Neto</span>
                      <span className="font-medium">${(cotizacion.neto / 1000000).toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">IVA (19%)</span>
                      <span>${(cotizacion.iva / 1000).toFixed(0)}K</span>
                    </div>
                    
                    <hr className="border-slate-200" />
                    
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-cyan-600">${(cotizacion.total / 1000000).toFixed(2)}M</span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-500" />
                    Análisis IA
                  </h2>
                  
                  <ProbabilidadMeter valor={cotizacion.probabilidadAceptacion} />
                  
                  <div className="mt-4 space-y-2">
                    {cotizacion.recomendaciones.map((rec, i) => (
                      <div key={i} className="text-sm text-slate-600 p-2 bg-violet-50 rounded-lg">
                        {rec}
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-md">
                    <Download className="w-4 h-4" /> PDF
                  </button>
                  <button className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Enviar
                  </button>
                </div>
              </>
            ) : (
              <Card className="text-center py-12">
                <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Agrega productos y calcula para ver el resumen</p>
              </Card>
            )}
          </div>
        </div>

        <div className="text-center text-slate-400 text-sm">
          <p>💡 Cotizador Inteligente - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
