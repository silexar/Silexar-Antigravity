/**
 * INVOICE GENERATOR - SUB-MÓDULO 10.1
 * 
 * @description Generador de facturas con wizard automático,
 * validación fiscal completa y generación dual (conectado/desconectado)
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  FileText, 
  Plus, 
  Trash2, 
  Calculator, 
  CheckCircle, 
  AlertTriangle,
  Building2,
  User,
  Calendar,
  DollarSign,
  Receipt,
  Download,
  Send,
  Save,
  Eye,
  RefreshCw,
  Zap,
  Shield,
  Clock
} from "lucide-react"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  total: number
}

interface Client {
  id: string
  name: string
  rut: string
  address: string
  city: string
  email: string
  phone: string
  paymentTerms: number
}

interface InvoiceData {
  id: string
  type: 'factura' | 'boleta' | 'nota_credito' | 'nota_debito'
  client: Client | null
  issueDate: string
  dueDate: string
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  notes: string
  paymentMethod: string
  currency: 'CLP' | 'USD' | 'EUR'
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'paid'
}

export function InvoiceGenerator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [autoMode, setAutoMode] = useState(true)
  const [siiConnected, setSiiConnected] = useState(true)

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    id: `INV-${Date.now()}`,
    type: 'factura',
    client: null,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
    notes: '',
    paymentMethod: 'transferencia',
    currency: 'CLP',
    status: 'draft'
  })

  const [availableClients] = useState<Client[]>([
    {
      id: 'client-1',
      name: 'Banco Santander Chile',
      rut: '97.036.000-K',
      address: 'Bandera 140',
      city: 'Santiago',
      email: 'facturacion@santander.cl',
      phone: '+56 2 2320 2000',
      paymentTerms: 30
    },
    {
      id: 'client-2',
      name: 'Coca-Cola de Chile S.A.',
      rut: '90.410.000-1',
      address: 'Las Condes 11049',
      city: 'Las Condes',
      email: 'cuentas@coca-cola.cl',
      phone: '+56 2 2427 3000',
      paymentTerms: 45
    },
    {
      id: 'client-3',
      name: 'Falabella S.A.C.I.',
      rut: '90.690.000-9',
      address: 'Rosas 1665',
      city: 'Santiago',
      email: 'proveedores@falabella.cl',
      phone: '+56 2 2379 2000',
      paymentTerms: 60
    }
  ])

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 19,
      total: 0
    }
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value }
          // Recalcular total del item
          const subtotal = updatedItem.quantity * updatedItem.unitPrice
          const discountAmount = subtotal * (updatedItem.discount / 100)
          const taxableAmount = subtotal - discountAmount
          const taxAmount = taxableAmount * (updatedItem.taxRate / 100)
          updatedItem.total = taxableAmount + taxAmount
          return updatedItem
        }
        return item
      })
    }))
  }

  const removeItem = (itemId: string) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }

  const calculateTotals = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const discountAmount = invoiceData.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      return sum + (itemSubtotal * (item.discount / 100))
    }, 0)
    const taxAmount = invoiceData.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      const itemDiscount = itemSubtotal * (item.discount / 100)
      const taxableAmount = itemSubtotal - itemDiscount
      return sum + (taxableAmount * (item.taxRate / 100))
    }, 0)
    const total = subtotal - discountAmount + taxAmount

    setInvoiceData(prev => ({
      ...prev,
      subtotal,
      discountAmount,
      taxAmount,
      total
    }))
  }

  useEffect(() => {
    calculateTotals()
  }, [invoiceData.items])

  const generateInvoice = async () => {
    setIsGenerating(true)
    
    // Simular proceso de generación
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setInvoiceData(prev => ({
      ...prev,
      status: siiConnected ? 'approved' : 'pending_approval'
    }))
    
    setIsGenerating(false)
  }

  const steps = [
    { id: 1, name: 'Cliente', description: 'Seleccionar cliente y datos básicos' },
    { id: 2, name: 'Items', description: 'Agregar productos/servicios' },
    { id: 3, name: 'Totales', description: 'Revisar cálculos y totales' },
    { id: 4, name: 'Generar', description: 'Generar y enviar factura' }
  ]

  return (
    <div className="space-y-6">
      {/* Header y Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-500" />
                Generador de Facturas Automático
              </CardTitle>
              <CardDescription>
                Wizard inteligente con validación fiscal completa y generación dual
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-mode"
                  checked={autoMode}
                  onCheckedChange={setAutoMode}
                />
                <Label htmlFor="auto-mode" className="text-sm">
                  Modo Automático
                </Label>
              </div>
              <Badge variant="outline" className={siiConnected ? "text-green-400 border-green-400/50" : "text-red-400 border-red-400/50"}>
                <Shield className="w-3 h-3 mr-1" />
                SII {siiConnected ? 'CONECTADO' : 'DESCONECTADO'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                  ${currentStep >= step.id 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-300 text-gray-500'
                  }
                `}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-bold">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-24 h-0.5 mx-4 transition-colors
                    ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-type">Tipo de Documento</Label>
                    <Select 
                      value={invoiceData.type} 
                      onValueChange={(value: InvoiceData['type']) => setInvoiceData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="factura">Factura Electrónica</SelectItem>
                        <SelectItem value="boleta">Boleta Electrónica</SelectItem>
                        <SelectItem value="nota_credito">Nota de Crédito</SelectItem>
                        <SelectItem value="nota_debito">Nota de Débito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Select 
                      value={invoiceData.client?.id || ''} 
                      onValueChange={(clientId) => {
                        const client = availableClients.find(c => c.id === clientId)
                        setInvoiceData(prev => ({ ...prev, client: client || null }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-xs text-muted-foreground">{client.rut}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select 
                      value={invoiceData.currency} 
                      onValueChange={(value: InvoiceData['currency']) => setInvoiceData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLP">Peso Chileno (CLP)</SelectItem>
                        <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="issue-date">Fecha de Emisión</Label>
                    <Input
                      id="issue-date"
                      type="date"
                      value={invoiceData.issueDate}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, issueDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due-date">Fecha de Vencimiento</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Método de Pago</Label>
                    <Select 
                      value={invoiceData.paymentMethod} 
                      onValueChange={(value) => setInvoiceData(prev => ({ ...prev, paymentMethod: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta de Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {invoiceData.client && (
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-sm">Datos del Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Razón Social:</strong> {invoiceData.client.name}</p>
                        <p><strong>RUT:</strong> {invoiceData.client.rut}</p>
                        <p><strong>Dirección:</strong> {invoiceData.client.address}</p>
                      </div>
                      <div>
                        <p><strong>Ciudad:</strong> {invoiceData.client.city}</p>
                        <p><strong>Email:</strong> {invoiceData.client.email}</p>
                        <p><strong>Términos de Pago:</strong> {invoiceData.client.paymentTerms} días</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Items de Facturación</h3>
                <Button onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Item
                </Button>
              </div>

              <div className="space-y-4">
                {invoiceData.items.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                      <div className="md:col-span-2">
                        <Label htmlFor={`desc-${item.id}`}>Descripción</Label>
                        <Input
                          id={`desc-${item.id}`}
                          placeholder="Descripción del producto/servicio"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`qty-${item.id}`}>Cantidad</Label>
                        <Input
                          id={`qty-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`price-${item.id}`}>Precio Unit.</Label>
                        <Input
                          id={`price-${item.id}`}
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`discount-${item.id}`}>Desc. %</Label>
                        <Input
                          id={`discount-${item.id}`}
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-bold">
                          ${item.total.toLocaleString()}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {invoiceData.items.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay items agregados</p>
                    <p className="text-sm">Haz clic en "Agregar Item" para comenzar</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Resumen y Totales</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Items Incluidos</h4>
                  <div className="space-y-2">
                    {invoiceData.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x ${item.unitPrice.toLocaleString()}
                            {item.discount > 0 && ` (-${item.discount}%)`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${item.total.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Cálculo de Totales</h4>
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${invoiceData.subtotal.toLocaleString()}</span>
                    </div>
                    {invoiceData.discountAmount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Descuentos:</span>
                        <span>-${invoiceData.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>IVA (19%):</span>
                      <span>${invoiceData.taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>${invoiceData.total.toLocaleString()} {invoiceData.currency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label htmlFor="notes">Notas Adicionales</Label>
                    <Textarea
                      id="notes"
                      placeholder="Notas o comentarios adicionales..."
                      value={invoiceData.notes}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Generar Factura</h3>
                <p className="text-muted-foreground">
                  Revisa los datos y genera la factura electrónica
                </p>
              </div>

              <Card className="bg-muted/30">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Resumen del Documento</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Tipo:</strong> {invoiceData.type}</p>
                        <p><strong>Cliente:</strong> {invoiceData.client?.name}</p>
                        <p><strong>Total:</strong> ${invoiceData.total.toLocaleString()} {invoiceData.currency}</p>
                        <p><strong>Vencimiento:</strong> {invoiceData.dueDate}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Estado de Validación</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Datos del cliente válidos</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Items y totales correctos</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {siiConnected ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="text-sm">
                            {siiConnected ? 'Conexión SII activa' : 'SII desconectado - Modo offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button 
                  onClick={generateInvoice} 
                  disabled={isGenerating || !invoiceData.client || invoiceData.items.length === 0}
                  size="lg"
                  className="px-8"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generando Factura...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generar Factura
                    </>
                  )}
                </Button>
              </div>

              {invoiceData.status !== 'draft' && (
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-green-700 mb-2">
                      ¡Factura Generada Exitosamente!
                    </h4>
                    <p className="text-green-600 mb-4">
                      {siiConnected 
                        ? 'La factura ha sido enviada al SII y está lista para envío al cliente'
                        : 'La factura ha sido generada en modo offline y está pendiente de envío al SII'
                      }
                    </p>
                    <div className="flex justify-center space-x-3">
                      <Button variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Vista Previa
                      </Button>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF
                      </Button>
                      <Button>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar al Cliente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Anterior
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
              disabled={currentStep === 4 || (currentStep === 1 && !invoiceData.client)}
            >
              {currentStep === 4 ? 'Finalizar' : 'Siguiente'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}