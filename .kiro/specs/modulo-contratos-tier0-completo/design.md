# DISEÑO TÉCNICO: MÓDULO CONTRATOS TIER 0 COMPLETO

## 📐 OVERVIEW

Este diseño técnico transforma el módulo contratos actual (70% completo) en un sistema TIER 0 Fortune 10 mediante la implementación de entidades faltantes, servicios avanzados de IA, interfaces móviles nativas y integraciones empresariales críticas.

## 🏗️ ARQUITECTURA DEL SISTEMA

### Arquitectura de Alto Nivel
```
┌─────────────────────────────────────────────────────────────────┐
│                    MÓDULO CONTRATOS TIER 0                      │
├─────────────────────────────────────────────────────────────────┤
│  📱 Mobile App    🌐 Web Dashboard    💬 WhatsApp Integration   │
├─────────────────────────────────────────────────────────────────┤
│                    PRESENTATION LAYER                           │
│  Controllers | DTOs | Middleware | Routes | Mobile APIs        │
├─────────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                            │
│  Commands | Queries | Handlers | Workflows | Event Publishers  │
├─────────────────────────────────────────────────────────────────┤
│                      DOMAIN LAYER                               │
│  Entities | Value Objects | Domain Services | Repositories     │
├─────────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE LAYER                          │
│  Repositories | External Services | Message Queues | Cache     │
├─────────────────────────────────────────────────────────────────┤
│  🤖 Cortex-AI  📊 WideOrbit  ✍️ DocuSign  📱 WhatsApp  💾 DB   │
└─────────────────────────────────────────────────────────────────┘
```

### Patrones Arquitectónicos Aplicados
- **Domain-Driven Design (DDD)**: Separación clara de responsabilidades
- **CQRS**: Comandos y queries separados para optimización
- **Event Sourcing**: Auditoría completa de cambios
- **Microservices Ready**: Preparado para separación futura
- **Clean Architecture**: Dependencias hacia el dominio

## 🔧 COMPONENTES Y INTERFACES

### Nuevas Entidades del Dominio

#### 1. PlanPagos Entity
```typescript
export interface PlanPagosProps {
  id: string
  contratoId: string
  modalidad: 'hitos' | 'cuotas'
  numeroCuotas: number
  cuotas: CuotaPago[]
  fechaInicio: Date
  fechaUltimoPago: Date
  montoTotal: number
  montoRestante: number
  estado: EstadoPlanPagos
  alertasConfiguracion: AlertaConfiguracion[]
  creadoPor: string
  fechaCreacion: Date
}

export class PlanPagos {
  // Métodos de negocio
  generarCuotas(): CuotaPago[]
  calcularProximoVencimiento(): Date
  marcarCuotaComoPagada(numeroCuota: number): void
  generarAlertaVencimiento(): AlertaVencimiento
  recalcularPlan(nuevaFecha: Date): void
}
```###
# 2. ProductoContrato Entity
```typescript
export interface ProductoContratoProps {
  id: string
  contratoId: string
  productoId: string
  nombre: string
  categoria: CategoriaProducto
  descripcion: string
  precioUnitario: number
  cantidad: number
  descuentos: Descuento[]
  impuestos: Impuesto[]
  subtotal: number
  total: number
  metricas: MetricasProducto
  configuracion: ConfiguracionProducto
  fechaCreacion: Date
}

export class ProductoContrato {
  // Métodos de negocio
  calcularSubtotal(): number
  aplicarDescuento(descuento: Descuento): void
  calcularImpuestos(): number
  validarCoherenciaConContrato(): boolean
  generarEspecificacionesPauta(): EspecificacionPauta[]
}
```

#### 3. DocumentoContrato Entity
```typescript
export interface DocumentoContratoProps {
  id: string
  contratoId: string
  tipo: TipoDocumento
  plantillaId: string
  nombre: string
  contenido: string
  metadatos: MetadatosDocumento
  firmas: FirmaDigital[]
  versiones: VersionDocumento[]
  estado: EstadoDocumento
  configuracionFirma: ConfiguracionFirma
  fechaCreacion: Date
  fechaUltimaModificacion: Date
}

export class DocumentoContrato {
  // Métodos de negocio
  generarContenido(datos: DatosContrato): string
  enviarParaFirma(firmantes: Firmante[]): ProcesoFirma
  verificarFirmasCompletas(): boolean
  crearNuevaVersion(cambios: string): VersionDocumento
  exportarPDF(): Buffer
}
```

#### 4. OrdenPauta Entity
```typescript
export interface OrdenPautaProps {
  id: string
  contratoId: string
  numeroOrden: string
  medioId: string
  medio: string
  especificaciones: EspecificacionPauta[]
  fechaGeneracion: Date
  fechaEnvio: Date
  sistemaDestino: SistemaEmision
  estadoEnvio: EstadoEnvio
  respuestaSistema: RespuestaSistema
  configuracion: ConfiguracionOrden
}

export class OrdenPauta {
  // Métodos de negocio
  generarEspecificaciones(): EspecificacionPauta[]
  validarInventarioDisponible(): ValidacionInventario
  enviarASistemaEmision(): ResultadoEnvio
  procesarRespuestaSistema(respuesta: any): void
  regenerarOrden(): void
}
```

#### 5. AlertaSeguimiento Entity
```typescript
export interface AlertaSeguimientoProps {
  id: string
  contratoId: string
  tipo: TipoAlerta
  categoria: CategoriaAlerta
  prioridad: PrioridadAlerta
  titulo: string
  mensaje: string
  contexto: ContextoAlerta
  responsables: ResponsableAlerta[]
  acciones: AccionAlerta[]
  fechaCreacion: Date
  fechaVencimiento: Date
  fechaResolucion?: Date
  estado: EstadoAlerta
}

export class AlertaSeguimiento {
  // Métodos de negocio
  asignarResponsable(responsable: ResponsableAlerta): void
  escalarAlerta(): void
  marcarComoResuelta(resolucion: string): void
  enviarNotificaciones(): void
  calcularTiempoRespuesta(): number
}
```

#### 6. ValidacionInventario Entity
```typescript
export interface ValidacionInventarioProps {
  id: string
  contratoId: string
  medioId: string
  fechaValidacion: Date
  horarios: HorarioValidacion[]
  fechas: FechaValidacion[]
  conflictos: ConflictoInventario[]
  disponibilidad: DisponibilidadInventario
  sugerencias: SugerenciaAlternativa[]
  reservas: ReservaInventario[]
  sistemaOrigen: SistemaEmision
}

export class ValidacionInventario {
  // Métodos de negocio
  validarDisponibilidad(): ResultadoValidacion
  detectarConflictos(): ConflictoInventario[]
  generarSugerenciasAlternativas(): SugerenciaAlternativa[]
  reservarEspacios(duracion: number): ReservaInventario
  liberarReservas(): void
}
```

#### 7. AnalisisPredictivo Entity
```typescript
export interface AnalisisPredictivoProps {
  id: string
  contratoId: string
  fechaAnalisis: Date
  probabilidadRenovacion: number
  scoreRiesgoIncumplimiento: number
  factoresRiesgo: FactorRiesgo[]
  oportunidadesMejora: OportunidadMejora[]
  recomendaciones: RecomendacionIA[]
  prediccionesCortexFlow: PrediccionCortex[]
  benchmarking: BenchmarkIndustria
  confianza: number
}

export class AnalisisPredictivo {
  // Métodos de negocio
  calcularProbabilidadRenovacion(): number
  identificarFactoresRiesgo(): FactorRiesgo[]
  generarRecomendaciones(): RecomendacionIA[]
  compararConBenchmark(): BenchmarkComparacion
  actualizarPredicciones(): void
}
```

### Value Objects Adicionales

#### EstadoPlanPagos
```typescript
export type EstadoPlanPagosValor = 
  | 'activo' | 'pausado' | 'completado' | 'vencido' | 'cancelado'

export class EstadoPlanPagos {
  static activo(): EstadoPlanPagos
  static pausado(): EstadoPlanPagos
  static completado(): EstadoPlanPagos
  static vencido(): EstadoPlanPagos
  static cancelado(): EstadoPlanPagos
  
  puedeTransicionarA(nuevoEstado: EstadoPlanPagos): boolean
  requiereAccion(): boolean
  esActivo(): boolean
}
```

#### TipoDocumento
```typescript
export type TipoDocumentoValor = 
  | 'contrato_principal' | 'anexo' | 'orden_compra' | 'factura' 
  | 'carta_tercerización' | 'clausulas_especiales'

export class TipoDocumento {
  static contratoPrincipal(): TipoDocumento
  static anexo(): TipoDocumento
  static ordenCompra(): TipoDocumento
  
  requiereFirmaDigital(): boolean
  esObligatorio(): boolean
  getPlantillaDefecto(): string
}
```

## 📊 MODELOS DE DATOS

### Esquema de Base de Datos Extendido

#### Tabla: plan_pagos
```sql
CREATE TABLE plan_pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id),
  modalidad VARCHAR(20) NOT NULL CHECK (modalidad IN ('hitos', 'cuotas')),
  numero_cuotas INTEGER NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_ultimo_pago DATE NOT NULL,
  monto_total DECIMAL(15,2) NOT NULL,
  monto_restante DECIMAL(15,2) NOT NULL,
  estado VARCHAR(20) NOT NULL,
  configuracion JSONB,
  creado_por UUID NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plan_pagos_contrato ON plan_pagos(contrato_id);
CREATE INDEX idx_plan_pagos_estado ON plan_pagos(estado);
```

#### Tabla: cuotas_pago
```sql
CREATE TABLE cuotas_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_pagos_id UUID NOT NULL REFERENCES plan_pagos(id),
  numero_cuota INTEGER NOT NULL,
  monto DECIMAL(15,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  fecha_pago DATE,
  estado VARCHAR(20) NOT NULL,
  metodo_pago VARCHAR(50),
  referencia_pago VARCHAR(100),
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: productos_contrato
```sql
CREATE TABLE productos_contrato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id),
  producto_id UUID NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio_unitario DECIMAL(15,2) NOT NULL,
  cantidad INTEGER NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  configuracion JSONB,
  metricas JSONB,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: documentos_contrato
```sql
CREATE TABLE documentos_contrato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id),
  tipo VARCHAR(50) NOT NULL,
  plantilla_id UUID,
  nombre VARCHAR(200) NOT NULL,
  contenido TEXT,
  metadatos JSONB,
  estado VARCHAR(20) NOT NULL,
  configuracion_firma JSONB,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_ultima_modificacion TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: ordenes_pauta
```sql
CREATE TABLE ordenes_pauta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id),
  numero_orden VARCHAR(50) UNIQUE NOT NULL,
  medio_id UUID NOT NULL,
  medio VARCHAR(200) NOT NULL,
  especificaciones JSONB NOT NULL,
  fecha_generacion TIMESTAMP DEFAULT NOW(),
  fecha_envio TIMESTAMP,
  sistema_destino VARCHAR(50) NOT NULL,
  estado_envio VARCHAR(20) NOT NULL,
  respuesta_sistema JSONB,
  configuracion JSONB
);
```

#### Tabla: alertas_seguimiento
```sql
CREATE TABLE alertas_seguimiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id),
  tipo VARCHAR(50) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  prioridad VARCHAR(20) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  mensaje TEXT NOT NULL,
  contexto JSONB,
  responsables JSONB NOT NULL,
  acciones JSONB,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_vencimiento TIMESTAMP,
  fecha_resolucion TIMESTAMP,
  estado VARCHAR(20) NOT NULL
);
```

#### Tabla: validaciones_inventario
```sql
CREATE TABLE validaciones_inventario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id),
  medio_id UUID NOT NULL,
  fecha_validacion TIMESTAMP DEFAULT NOW(),
  horarios JSONB NOT NULL,
  fechas JSONB NOT NULL,
  conflictos JSONB,
  disponibilidad JSONB NOT NULL,
  sugerencias JSONB,
  reservas JSONB,
  sistema_origen VARCHAR(50) NOT NULL
);
```

#### Tabla: analisis_predictivos
```sql
CREATE TABLE analisis_predictivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id),
  fecha_analisis TIMESTAMP DEFAULT NOW(),
  probabilidad_renovacion DECIMAL(5,4) NOT NULL,
  score_riesgo_incumplimiento DECIMAL(5,4) NOT NULL,
  factores_riesgo JSONB NOT NULL,
  oportunidades_mejora JSONB,
  recomendaciones JSONB NOT NULL,
  predicciones_cortex_flow JSONB,
  benchmarking JSONB,
  confianza DECIMAL(5,4) NOT NULL
);
```

## 🔄 MANEJO DE ERRORES

### Estrategia de Error Handling

#### Errores de Dominio
```typescript
export class ContratosDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: any
  ) {
    super(message)
    this.name = 'ContratosDomainError'
  }
}

// Errores específicos
export class ContratoNoEncontradoError extends ContratosDomainError
export class EstadoInvalidoError extends ContratosDomainError
export class InventarioNoDisponibleError extends ContratosDomainError
export class AprobacionRequeridaError extends ContratosDomainError
```

#### Manejo de Errores en Servicios Externos
```typescript
export class ExternalServiceErrorHandler {
  async handleCortexRiskError(error: Error): Promise<RiesgoCredito> {
    // Fallback a análisis básico local
    return this.fallbackRiskAnalysis()
  }
  
  async handleInventoryValidationError(error: Error): Promise<ValidacionInventario> {
    // Usar cache de última validación conocida
    return this.getCachedValidation()
  }
  
  async handleDigitalSignatureError(error: Error): Promise<void> {
    // Notificar y permitir firma manual
    await this.notifyManualSignatureRequired()
  }
}
```

## 🧪 ESTRATEGIA DE TESTING

### Pirámide de Testing

#### Tests Unitarios (70%)
```typescript
// Ejemplo: Test de entidad PlanPagos
describe('PlanPagos', () => {
  it('debe generar cuotas correctamente', () => {
    const plan = PlanPagos.create({
      modalidad: 'cuotas',
      numeroCuotas: 3,
      montoTotal: 300000,
      fechaInicio: new Date('2025-01-01')
    })
    
    const cuotas = plan.generarCuotas()
    
    expect(cuotas).toHaveLength(3)
    expect(cuotas[0].monto).toBe(100000)
    expect(cuotas[0].fechaVencimiento).toEqual(new Date('2025-01-01'))
  })
})
```

#### Tests de Integración (20%)
```typescript
// Ejemplo: Test de integración con Cortex-Risk
describe('CortexRiskIntegrationService', () => {
  it('debe evaluar riesgo y crear contrato', async () => {
    const service = new CortexRiskIntegrationService(config)
    const command = new CrearContratoCommand(validData)
    
    const resultado = await contratoHandler.crearContrato(command)
    
    expect(resultado.riesgoCredito.nivel).toBeDefined()
    expect(resultado.alertas).toContain('Análisis de riesgo completado')
  })
})
```

#### Tests End-to-End (10%)
```typescript
// Ejemplo: Test E2E de flujo completo
describe('Flujo Completo Contrato', () => {
  it('debe crear, aprobar y firmar contrato', async () => {
    // Crear contrato
    const response1 = await request(app)
      .post('/api/contratos')
      .send(contratoData)
      .expect(201)
    
    // Aprobar contrato
    const response2 = await request(app)
      .post(`/api/contratos/${response1.body.data.contratoId}/aprobar`)
      .send({ justificacion: 'Test' })
      .expect(200)
    
    // Verificar estado
    expect(response2.body.data.estado).toBe('aprobado')
  })
})
```

### Cobertura de Testing
- **Entidades del dominio**: 100%
- **Value objects**: 100%
- **Handlers de aplicación**: 95%
- **Controladores**: 90%
- **Servicios externos**: 85%
- **Integración E2E**: 80%

---

**Próximo paso**: Crear el documento de tareas (tasks.md) con la implementación detallada paso a paso.