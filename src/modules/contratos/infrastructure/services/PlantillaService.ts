/**
 * SERVICIO DE PLANTILLAS DINÁMICAS - TIER 0
 * 
 * @description Motor de templates con variables reemplazables y soporte multi-idioma
 */

export interface VariablePlantilla {
  nombre: string
  tipo: 'texto' | 'numero' | 'fecha' | 'booleano' | 'lista'
  requerida: boolean
  valorDefecto?: unknown
  validacion?: string
  descripcion: string
}

export interface PlantillaDocumento {
  id: string
  nombre: string
  tipo: string
  idioma: 'es' | 'en'
  contenido: string
  variables: VariablePlantilla[]
  estilos?: string
  version: number
  activa: boolean
  fechaCreacion: Date
  fechaActualizacion: Date
}

export interface DatosPlantilla {
  [key: string]: unknown
}

export class PlantillaService {
  private plantillas: Map<string, PlantillaDocumento> = new Map()

  constructor() {
    this.inicializarPlantillasBase()
  }

  private inicializarPlantillasBase(): void {
    // Plantilla de Contrato Principal en Español
    this.registrarPlantilla({
      id: 'plantilla_contrato_base',
      nombre: 'Contrato Principal Base',
      tipo: 'contrato_principal',
      idioma: 'es',
      contenido: this.obtenerContenidoContratoBase(),
      variables: this.obtenerVariablesContratoBase(),
      version: 1,
      activa: true,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    })

    // Plantilla de Orden de Compra
    this.registrarPlantilla({
      id: 'plantilla_orden_compra',
      nombre: 'Orden de Compra Estándar',
      tipo: 'orden_compra',
      idioma: 'es',
      contenido: this.obtenerContenidoOrdenCompra(),
      variables: this.obtenerVariablesOrdenCompra(),
      version: 1,
      activa: true,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    })

    // Plantilla de Propuesta Comercial
    this.registrarPlantilla({
      id: 'plantilla_propuesta',
      nombre: 'Propuesta Comercial',
      tipo: 'propuesta_comercial',
      idioma: 'es',
      contenido: this.obtenerContenidoPropuesta(),
      variables: this.obtenerVariablesPropuesta(),
      version: 1,
      activa: true,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    })
  }

  registrarPlantilla(plantilla: PlantillaDocumento): void {
    this.validarPlantilla(plantilla)
    this.plantillas.set(plantilla.id, plantilla)
  }

  private validarPlantilla(plantilla: PlantillaDocumento): void {
    if (!plantilla.id?.trim()) {
      throw new Error('ID de plantilla es requerido')
    }

    if (!plantilla.nombre?.trim()) {
      throw new Error('Nombre de plantilla es requerido')
    }

    if (!plantilla.contenido?.trim()) {
      throw new Error('Contenido de plantilla es requerido')
    }

    // Validar que las variables en el contenido estén definidas
    const variablesEnContenido = this.extraerVariablesDeContenido(plantilla.contenido)
    const variablesDefinidas = plantilla.variables.map(v => v.nombre)

    const variablesFaltantes = variablesEnContenido.filter(v => !variablesDefinidas.includes(v))
    if (variablesFaltantes.length > 0) {
      throw new Error(`Variables no definidas en plantilla: ${variablesFaltantes.join(', ')}`)
    }
  }

  private extraerVariablesDeContenido(contenido: string): string[] {
    const regex = /{{([^}]+)}}/g
    const variables: string[] = []
    let match

    while ((match = regex.exec(contenido)) !== null) {
      const variable = match[1].trim()
      if (!variables.includes(variable)) {
        variables.push(variable)
      }
    }

    return variables
  }

  obtenerPlantilla(id: string): PlantillaDocumento | null {
    return this.plantillas.get(id) || null
  }

  listarPlantillas(tipo?: string, idioma?: 'es' | 'en'): PlantillaDocumento[] {
    let plantillas = Array.from(this.plantillas.values()).filter(p => p.activa)

    if (tipo) {
      plantillas = plantillas.filter(p => p.tipo === tipo)
    }

    if (idioma) {
      plantillas = plantillas.filter(p => p.idioma === idioma)
    }

    return plantillas.sort((a, b) => a.nombre.localeCompare(b.nombre))
  }

  generarDocumento(plantillaId: string, datos: DatosPlantilla): string {
    const plantilla = this.obtenerPlantilla(plantillaId)
    if (!plantilla) {
      throw new Error(`Plantilla no encontrada: ${plantillaId}`)
    }

    // Validar datos requeridos
    this.validarDatos(plantilla, datos)

    // Procesar contenido
    let contenidoProcesado = plantilla.contenido

    // Reemplazar variables definidas
    plantilla.variables.forEach(variable => {
      const valor = datos[variable.nombre] ?? variable.valorDefecto ?? ''
      const valorFormateado = this.formatearValor(valor, variable.tipo)
      
      const regex = new RegExp(`{{${variable.nombre}}}`, 'g')
      contenidoProcesado = contenidoProcesado.replace(regex, valorFormateado)
    })

    // Reemplazar variables del sistema
    contenidoProcesado = this.reemplazarVariablesSistema(contenidoProcesado)

    // Procesar condicionales
    contenidoProcesado = this.procesarCondicionales(contenidoProcesado, datos)

    // Procesar bucles
    contenidoProcesado = this.procesarBucles(contenidoProcesado, datos)

    return contenidoProcesado
  }

  private validarDatos(plantilla: PlantillaDocumento, datos: DatosPlantilla): void {
    const errores: string[] = []

    plantilla.variables.forEach(variable => {
      const valor = datos[variable.nombre]

      // Validar campos requeridos
      if (variable.requerida && (valor === undefined || valor === null || valor === '')) {
        errores.push(`Variable requerida faltante: ${variable.nombre}`)
        return
      }

      // Validar tipos
      if (valor !== undefined && valor !== null) {
        const esValido = this.validarTipoVariable(valor, variable.tipo)
        if (!esValido) {
          errores.push(`Tipo inválido para ${variable.nombre}: esperado ${variable.tipo}`)
        }

        // Validar con regex si está definida
        if (variable.validacion && typeof valor === 'string') {
          const regex = new RegExp(variable.validacion)
          if (!regex.test(valor)) {
            errores.push(`Valor inválido para ${variable.nombre}: no cumple validación`)
          }
        }
      }
    })

    if (errores.length > 0) {
      throw new Error(`Errores de validación: ${errores.join(', ')}`)
    }
  }

  private validarTipoVariable(valor: unknown, tipo: string): boolean {
    switch (tipo) {
      case 'texto':
        return typeof valor === 'string'
      case 'numero':
        return typeof valor === 'number' && !isNaN(valor)
      case 'fecha':
        return valor instanceof Date || !isNaN(Date.parse(valor))
      case 'booleano':
        return typeof valor === 'boolean'
      case 'lista':
        return Array.isArray(valor)
      default:
        return true
    }
  }

  private formatearValor(valor: unknown, tipo: string): string {
    if (valor === undefined || valor === null) {
      return ''
    }

    switch (tipo) {
      case 'numero':
        return typeof valor === 'number' ? valor.toLocaleString('es-CL') : String(valor)
      case 'fecha':
        const fecha = valor instanceof Date ? valor : new Date(valor)
        return fecha.toLocaleDateString('es-CL')
      case 'booleano':
        return valor ? 'Sí' : 'No'
      case 'lista':
        return Array.isArray(valor) ? valor.join(', ') : String(valor)
      default:
        return String(valor)
    }
  }

  private reemplazarVariablesSistema(contenido: string): string {
    const fechaActual = new Date()
    
    return contenido
      .replace(/{{fecha_actual}}/g, fechaActual.toLocaleDateString('es-CL'))
      .replace(/{{año_actual}}/g, fechaActual.getFullYear().toString())
      .replace(/{{mes_actual}}/g, this.obtenerNombreMes(fechaActual.getMonth()))
      .replace(/{{dia_actual}}/g, fechaActual.getDate().toString())
      .replace(/{{hora_actual}}/g, fechaActual.toLocaleTimeString('es-CL'))
      .replace(/{{timestamp}}/g, fechaActual.getTime().toString())
  }

  private obtenerNombreMes(mes: number): string {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
    return meses[mes] || ''
  }

  private procesarCondicionales(contenido: string, datos: DatosPlantilla): string {
    // Procesar {{#if variable}} contenido {{/if}}
    const regexIf = /{{#if\s+(\w+)}}(.*?){{\/if}}/gs
    
    return contenido.replace(regexIf, (match, variable, contenidoCondicional) => {
      const valor = datos[variable]
      const mostrar = valor && valor !== '' && valor !== 0 && valor !== false
      return mostrar ? contenidoCondicional : ''
    })
  }

  private procesarBucles(contenido: string, datos: DatosPlantilla): string {
    // Procesar {{#each lista}} contenido {{/each}}
    const regexEach = /{{#each\s+(\w+)}}(.*?){{\/each}}/gs
    
    return contenido.replace(regexEach, (match, variable, contenidoBucle) => {
      const lista = datos[variable]
      if (!Array.isArray(lista)) {
        return ''
      }

      return lista.map((item, index) => {
        let contenidoItem = contenidoBucle
        
        // Reemplazar {{this}} con el item actual
        contenidoItem = contenidoItem.replace(/{{this}}/g, String(item))
        
        // Reemplazar {{@index}} con el índice
        contenidoItem = contenidoItem.replace(/{{@index}}/g, String(index))
        
        // Si el item es un objeto, reemplazar sus propiedades
        if (typeof item === 'object' && item !== null) {
          Object.entries(item).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g')
            contenidoItem = contenidoItem.replace(regex, String(value))
          })
        }
        
        return contenidoItem
      }).join('')
    })
  }

  // Plantillas base predefinidas
  private obtenerContenidoContratoBase(): string {
    return `
CONTRATO DE PRESTACIÓN DE SERVICIOS PUBLICITARIOS

Entre {{nombre_empresa}}, RUT {{rut_empresa}}, domiciliada en {{direccion_empresa}}, 
representada por {{representante_empresa}}, RUT {{rut_representante}}, en adelante "LA EMPRESA",
y {{nombre_cliente}}, RUT {{rut_cliente}}, domiciliada en {{direccion_cliente}}, 
representada por {{representante_cliente}}, RUT {{rut_representante_cliente}}, en adelante "EL CLIENTE",
se ha convenido el siguiente contrato:

PRIMERO: OBJETO DEL CONTRATO
LA EMPRESA se compromete a prestar servicios de {{tipo_servicio}} para EL CLIENTE, 
según las especificaciones detalladas en el Anexo A de este contrato.

SEGUNDO: VIGENCIA
El presente contrato tendrá vigencia desde el {{fecha_inicio}} hasta el {{fecha_fin}}.

TERCERO: VALOR Y FORMA DE PAGO
El valor total del contrato es de {{moneda}} {{valor_total}}, que se pagará de la siguiente forma:
{{#each plan_pagos}}
- Cuota {{@index}}: {{moneda}} {{monto}} con vencimiento {{fecha_vencimiento}}
{{/each}}

CUARTO: OBLIGACIONES DE LA EMPRESA
{{#each obligaciones_empresa}}
- {{this}}
{{/each}}

QUINTO: OBLIGACIONES DEL CLIENTE
{{#each obligaciones_cliente}}
- {{this}}
{{/each}}

{{#if clausulas_especiales}}
SEXTO: CLÁUSULAS ESPECIALES
{{clausulas_especiales}}
{{/if}}

Para constancia, se firma en {{ciudad}}, a {{fecha_actual}}.

_________________________                    _________________________
{{representante_empresa}}                    {{representante_cliente}}
LA EMPRESA                                   EL CLIENTE
`
  }

  private obtenerVariablesContratoBase(): VariablePlantilla[] {
    return [
      { nombre: 'nombre_empresa', tipo: 'texto', requerida: true, descripcion: 'Nombre de la empresa' },
      { nombre: 'rut_empresa', tipo: 'texto', requerida: true, descripcion: 'RUT de la empresa' },
      { nombre: 'direccion_empresa', tipo: 'texto', requerida: true, descripcion: 'Dirección de la empresa' },
      { nombre: 'representante_empresa', tipo: 'texto', requerida: true, descripcion: 'Representante legal empresa' },
      { nombre: 'rut_representante', tipo: 'texto', requerida: true, descripcion: 'RUT representante empresa' },
      { nombre: 'nombre_cliente', tipo: 'texto', requerida: true, descripcion: 'Nombre del cliente' },
      { nombre: 'rut_cliente', tipo: 'texto', requerida: true, descripcion: 'RUT del cliente' },
      { nombre: 'direccion_cliente', tipo: 'texto', requerida: true, descripcion: 'Dirección del cliente' },
      { nombre: 'representante_cliente', tipo: 'texto', requerida: true, descripcion: 'Representante legal cliente' },
      { nombre: 'rut_representante_cliente', tipo: 'texto', requerida: true, descripcion: 'RUT representante cliente' },
      { nombre: 'tipo_servicio', tipo: 'texto', requerida: true, descripcion: 'Tipo de servicio publicitario' },
      { nombre: 'fecha_inicio', tipo: 'fecha', requerida: true, descripcion: 'Fecha inicio del contrato' },
      { nombre: 'fecha_fin', tipo: 'fecha', requerida: true, descripcion: 'Fecha fin del contrato' },
      { nombre: 'moneda', tipo: 'texto', requerida: true, valorDefecto: 'CLP', descripcion: 'Moneda del contrato' },
      { nombre: 'valor_total', tipo: 'numero', requerida: true, descripcion: 'Valor total del contrato' },
      { nombre: 'plan_pagos', tipo: 'lista', requerida: true, descripcion: 'Plan de pagos del contrato' },
      { nombre: 'obligaciones_empresa', tipo: 'lista', requerida: false, descripcion: 'Obligaciones de la empresa' },
      { nombre: 'obligaciones_cliente', tipo: 'lista', requerida: false, descripcion: 'Obligaciones del cliente' },
      { nombre: 'clausulas_especiales', tipo: 'texto', requerida: false, descripcion: 'Cláusulas especiales' },
      { nombre: 'ciudad', tipo: 'texto', requerida: true, valorDefecto: 'Santiago', descripcion: 'Ciudad de firma' }
    ]
  }

  private obtenerContenidoOrdenCompra(): string {
    return `
ORDEN DE COMPRA N° {{numero_orden}}

Fecha: {{fecha_actual}}
Proveedor: {{nombre_proveedor}}
RUT: {{rut_proveedor}}

Solicitamos cotización para los siguientes servicios:

{{#each productos}}
{{@index}}. {{nombre}}
   Cantidad: {{cantidad}}
   Descripción: {{descripcion}}
   Valor Unitario: {{moneda}} {{valor_unitario}}
   Subtotal: {{moneda}} {{subtotal}}
{{/each}}

TOTAL NETO: {{moneda}} {{total_neto}}
IVA (19%): {{moneda}} {{iva}}
TOTAL: {{moneda}} {{total}}

Condiciones de Pago: {{condiciones_pago}}
Fecha de Entrega: {{fecha_entrega}}

{{#if observaciones}}
Observaciones: {{observaciones}}
{{/if}}

Solicitado por: {{solicitante}}
Cargo: {{cargo_solicitante}}
`
  }

  private obtenerVariablesOrdenCompra(): VariablePlantilla[] {
    return [
      { nombre: 'numero_orden', tipo: 'texto', requerida: true, descripcion: 'Número de orden de compra' },
      { nombre: 'nombre_proveedor', tipo: 'texto', requerida: true, descripcion: 'Nombre del proveedor' },
      { nombre: 'rut_proveedor', tipo: 'texto', requerida: true, descripcion: 'RUT del proveedor' },
      { nombre: 'productos', tipo: 'lista', requerida: true, descripcion: 'Lista de productos/servicios' },
      { nombre: 'moneda', tipo: 'texto', requerida: true, valorDefecto: 'CLP', descripcion: 'Moneda' },
      { nombre: 'total_neto', tipo: 'numero', requerida: true, descripcion: 'Total neto' },
      { nombre: 'iva', tipo: 'numero', requerida: true, descripcion: 'Monto IVA' },
      { nombre: 'total', tipo: 'numero', requerida: true, descripcion: 'Total con IVA' },
      { nombre: 'condiciones_pago', tipo: 'texto', requerida: true, descripcion: 'Condiciones de pago' },
      { nombre: 'fecha_entrega', tipo: 'fecha', requerida: true, descripcion: 'Fecha de entrega' },
      { nombre: 'observaciones', tipo: 'texto', requerida: false, descripcion: 'Observaciones adicionales' },
      { nombre: 'solicitante', tipo: 'texto', requerida: true, descripcion: 'Nombre del solicitante' },
      { nombre: 'cargo_solicitante', tipo: 'texto', requerida: true, descripcion: 'Cargo del solicitante' }
    ]
  }

  private obtenerContenidoPropuesta(): string {
    return `
PROPUESTA COMERCIAL

{{nombre_empresa}}
{{fecha_actual}}

Estimado/a {{nombre_contacto}},

Nos complace presentar nuestra propuesta comercial para {{nombre_cliente}}.

RESUMEN EJECUTIVO:
{{resumen_ejecutivo}}

SERVICIOS PROPUESTOS:
{{#each servicios}}
{{@index}}. {{nombre}}
   Descripción: {{descripcion}}
   Duración: {{duracion}}
   Inversión: {{moneda}} {{valor}}
{{/each}}

INVERSIÓN TOTAL: {{moneda}} {{inversion_total}}

CONDICIONES COMERCIALES:
- Forma de Pago: {{forma_pago}}
- Vigencia de la Propuesta: {{vigencia_propuesta}} días
- Tiempo de Implementación: {{tiempo_implementacion}}

{{#if beneficios_adicionales}}
BENEFICIOS ADICIONALES:
{{#each beneficios_adicionales}}
- {{this}}
{{/each}}
{{/if}}

Quedamos atentos a sus comentarios y esperamos poder trabajar juntos.

Saludos cordiales,

{{nombre_ejecutivo}}
{{cargo_ejecutivo}}
{{telefono_ejecutivo}}
{{email_ejecutivo}}
`
  }

  private obtenerVariablesPropuesta(): VariablePlantilla[] {
    return [
      { nombre: 'nombre_empresa', tipo: 'texto', requerida: true, descripcion: 'Nombre de la empresa' },
      { nombre: 'nombre_contacto', tipo: 'texto', requerida: true, descripcion: 'Nombre del contacto' },
      { nombre: 'nombre_cliente', tipo: 'texto', requerida: true, descripcion: 'Nombre del cliente' },
      { nombre: 'resumen_ejecutivo', tipo: 'texto', requerida: true, descripcion: 'Resumen ejecutivo' },
      { nombre: 'servicios', tipo: 'lista', requerida: true, descripcion: 'Lista de servicios propuestos' },
      { nombre: 'moneda', tipo: 'texto', requerida: true, valorDefecto: 'CLP', descripcion: 'Moneda' },
      { nombre: 'inversion_total', tipo: 'numero', requerida: true, descripcion: 'Inversión total' },
      { nombre: 'forma_pago', tipo: 'texto', requerida: true, descripcion: 'Forma de pago' },
      { nombre: 'vigencia_propuesta', tipo: 'numero', requerida: true, valorDefecto: 30, descripcion: 'Días de vigencia' },
      { nombre: 'tiempo_implementacion', tipo: 'texto', requerida: true, descripcion: 'Tiempo de implementación' },
      { nombre: 'beneficios_adicionales', tipo: 'lista', requerida: false, descripcion: 'Beneficios adicionales' },
      { nombre: 'nombre_ejecutivo', tipo: 'texto', requerida: true, descripcion: 'Nombre del ejecutivo' },
      { nombre: 'cargo_ejecutivo', tipo: 'texto', requerida: true, descripcion: 'Cargo del ejecutivo' },
      { nombre: 'telefono_ejecutivo', tipo: 'texto', requerida: true, descripcion: 'Teléfono del ejecutivo' },
      { nombre: 'email_ejecutivo', tipo: 'texto', requerida: true, descripcion: 'Email del ejecutivo' }
    ]
  }

  // Métodos de gestión de plantillas
  actualizarPlantilla(id: string, cambios: Partial<PlantillaDocumento>): void {
    const plantilla = this.obtenerPlantilla(id)
    if (!plantilla) {
      throw new Error(`Plantilla no encontrada: ${id}`)
    }

    const plantillaActualizada = {
      ...plantilla,
      ...cambios,
      version: plantilla.version + 1,
      fechaActualizacion: new Date()
    }

    this.validarPlantilla(plantillaActualizada)
    this.plantillas.set(id, plantillaActualizada)
  }

  desactivarPlantilla(id: string): void {
    const plantilla = this.obtenerPlantilla(id)
    if (!plantilla) {
      throw new Error(`Plantilla no encontrada: ${id}`)
    }

    plantilla.activa = false
    plantilla.fechaActualizacion = new Date()
  }

  clonarPlantilla(idOriginal: string, nuevoId: string, nuevoNombre: string): PlantillaDocumento {
    const original = this.obtenerPlantilla(idOriginal)
    if (!original) {
      throw new Error(`Plantilla original no encontrada: ${idOriginal}`)
    }

    const clon: PlantillaDocumento = {
      ...original,
      id: nuevoId,
      nombre: nuevoNombre,
      version: 1,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    }

    this.registrarPlantilla(clon)
    return clon
  }
}