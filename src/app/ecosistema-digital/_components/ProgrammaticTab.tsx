'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Target, Database, Zap, Shield, Plus, Settings } from 'lucide-react'

export function ProgrammaticTab() {
  return (
    <div className="space-y-6">
      {/* DSP/SSP Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand Side Platform (DSP) */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              Demand Side Platform (DSP)
            </CardTitle>
            <CardDescription className="text-slate-400">
              Compra programática automatizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">847</div>
                <div className="text-xs text-slate-400">Bid Requests/s</div>
              </div>
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <div className="text-2xl font-bold text-green-400">23.5%</div>
                <div className="text-xs text-slate-400">Win Rate</div>
              </div>
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">$2,450</div>
                <div className="text-xs text-slate-400">Avg CPM</div>
              </div>
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <div className="text-2xl font-bold text-orange-400">15ms</div>
                <div className="text-xs text-slate-400">Bid Latency</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Ad Exchanges Conectados</h4>
              <div className="space-y-2">
                {[
                  { name: 'Google Ad Exchange', status: 'active', qps: 450 },
                  { name: 'Amazon DSP', status: 'active', qps: 280 },
                  { name: 'The Trade Desk', status: 'active', qps: 320 },
                  { name: 'Adobe DSP', status: 'maintenance', qps: 0 },
                ].map((exchange) => (
                  <div key={exchange.name} className="flex items-center justify-between p-2 bg-slate-700/20 rounded">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${exchange.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                      <span className="text-sm text-slate-300">{exchange.name}</span>
                    </div>
                    <span className="text-xs text-slate-400">{exchange.qps} QPS</span>
                  </div>
                ))}
              </div>
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <Settings className="h-4 w-4 mr-2" />
              Configurar DSP
            </Button>
          </CardContent>
        </Card>

        {/* Supply Side Platform (SSP) */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-green-400" />
              Supply Side Platform (SSP)
            </CardTitle>
            <CardDescription className="text-slate-400">
              Monetización de inventario propio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <div className="text-2xl font-bold text-green-400">1.2M</div>
                <div className="text-xs text-slate-400">Inventory/día</div>
              </div>
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">89.2%</div>
                <div className="text-xs text-slate-400">Fill Rate</div>
              </div>
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">$3,200</div>
                <div className="text-xs text-slate-400">Avg eCPM</div>
              </div>
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <div className="text-2xl font-bold text-orange-400">12ms</div>
                <div className="text-xs text-slate-400">Response Time</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Demand Partners</h4>
              <div className="space-y-2">
                {[
                  { name: 'Google DV360', revenue: 45, share: '45%' },
                  { name: 'Amazon DSP', revenue: 28, share: '28%' },
                  { name: 'The Trade Desk', revenue: 18, share: '18%' },
                  { name: 'Direct Deals', revenue: 9, share: '9%' },
                ].map((partner) => (
                  <div key={partner.name} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{partner.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">{partner.share}</span>
                      <div className="w-16 bg-slate-600 rounded-full h-1">
                        <div className="bg-green-500 h-1 rounded-full" style={{ width: partner.share }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Database className="h-4 w-4 mr-2" />
              Configurar SSP
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Bidding Dashboard */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Real-Time Bidding Dashboard
          </CardTitle>
          <CardDescription className="text-slate-400">
            Monitoreo de subastas en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Actividad de Subastas */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white">Actividad de Subastas</h4>
              <div className="space-y-3">
                {[
                  { time: '14:32:15', type: 'Display', bid: '$2.45', status: 'won' },
                  { time: '14:32:14', type: 'Video', bid: '$8.90', status: 'lost' },
                  { time: '14:32:13', type: 'Audio', bid: '$3.20', status: 'won' },
                  { time: '14:32:12', type: 'Native', bid: '$1.85', status: 'won' },
                  { time: '14:32:11', type: 'Display', bid: '$4.10', status: 'lost' },
                ].map((auction) => (
                  <div key={`${auction.time}-${auction.type}`} className="flex items-center justify-between p-2 bg-slate-700/20 rounded text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">{auction.time}</span>
                      <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                        {auction.type}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{auction.bid}</span>
                      <div className={`w-2 h-2 rounded-full ${auction.status === 'won' ? 'bg-green-400' : 'bg-red-400'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuración de Bidding */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white">Configuración de Bidding</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Estrategia de Bid</label>
                  <select className="w-full bg-slate-600 border border-slate-500 text-white rounded px-2 py-1 text-sm">
                    <option>Maximize Clicks</option>
                    <option>Target CPA</option>
                    <option>Target ROAS</option>
                    <option>Manual Bidding</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Bid Floor ($)</label>
                  <Input type="number" aria-label="Bid Floor en dólares" placeholder="0.50" className="bg-slate-600 border-slate-500 text-white text-sm h-8" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Max Bid ($)</label>
                  <Input type="number" aria-label="Max Bid en dólares" placeholder="10.00" className="bg-slate-600 border-slate-500 text-white text-sm h-8" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Timeout (ms)</label>
                  <Input type="number" aria-label="Timeout en milisegundos" placeholder="100" className="bg-slate-600 border-slate-500 text-white text-sm h-8" />
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white">Performance Metrics</h4>
              <div className="space-y-3">
                {[
                  { label: 'Win Rate', value: '23.5%', color: 'bg-green-500 text-green-400', pct: '23.5%' },
                  { label: 'Bid Response Rate', value: '89.2%', color: 'bg-blue-500 text-blue-400', pct: '89.2%' },
                  { label: 'Avg Bid Latency', value: '15ms', color: 'bg-orange-500 text-orange-400', pct: '15%' },
                ].map((metric) => (
                  <div key={metric.label} className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-400">{metric.label}</span>
                      <span className={`text-sm font-medium ${metric.color.split(' ')[1]}`}>{metric.value}</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-1">
                      <div className={`${metric.color.split(' ')[0]} h-1 rounded-full`} style={{ width: metric.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Private Marketplace (PMP) */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Private Marketplace (PMP)
          </CardTitle>
          <CardDescription className="text-slate-400">
            Deals privados y inventario premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deals Activos */}
            <div>
              <h4 className="text-sm font-medium text-white mb-4">Deals Privados Activos</h4>
              <div className="space-y-3">
                {[
                  { id: 'PMP-001', buyer: 'Premium Advertiser A', type: 'Guaranteed', inventory: 'Radio Prime + Digital', price: '$5.50', volume: '500K', status: 'active' },
                  { id: 'PMP-002', buyer: 'Agency Network B', type: 'Preferred', inventory: 'Audio Streaming', price: '$3.20', volume: '250K', status: 'active' },
                  { id: 'PMP-003', buyer: 'Direct Client C', type: 'First Look', inventory: 'Video Pre-roll', price: '$8.90', volume: '100K', status: 'pending' },
                ].map((deal) => (
                  <div key={deal.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-white">{deal.id}</span>
                        <Badge className={`text-xs ${deal.status === 'active' ? 'bg-green-600' : deal.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'} text-white`}>
                          {deal.status}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">{deal.type}</Badge>
                    </div>
                    <div className="text-xs text-slate-400 mb-1">{deal.buyer}</div>
                    <div className="text-xs text-slate-300 mb-2">{deal.inventory}</div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Price: <span className="text-white">{deal.price}</span></span>
                      <span className="text-slate-400">Volume: <span className="text-white">{deal.volume}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuración PMP */}
            <div>
              <h4 className="text-sm font-medium text-white mb-4">Configuración PMP</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Tipo de Deal</label>
                  <select className="w-full bg-slate-600 border border-slate-500 text-white rounded-md px-3 py-2">
                    <option>Guaranteed Deal</option>
                    <option>Preferred Deal</option>
                    <option>First Look</option>
                    <option>Open Auction</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Buyer</label>
                  <Input placeholder="Nombre del comprador" aria-label="Nombre del comprador" className="bg-slate-600 border-slate-500 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Precio Fijo</label>
                    <Input type="number" aria-label="Precio Fijo" placeholder="5.50" className="bg-slate-600 border-slate-500 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Volumen</label>
                    <Input aria-label="Volumen" placeholder="500K" className="bg-slate-600 border-slate-500 text-white" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Inventario</label>
                  <div className="space-y-2">
                    {['Radio Prime', 'Digital Display', 'Audio Streaming', 'Video Pre-roll'].map((inv) => (
                      <label key={inv} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-slate-500" />
                        <span className="text-slate-300 text-sm">{inv}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Deal Privado
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
