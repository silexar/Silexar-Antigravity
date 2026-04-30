Manifiesto de Arquitectura Definitiva: Silexar Pulse
Versión: 9.0
Clasificación: Nivel Estratégico Máximo / Confidencial
Autor: Silexar
Directiva del Proyecto: Construir la infraestructura central de la nueva economía de la atención a través de una estrategia bifásica: primero, con una Plataforma de Orquestación de Resultados (Fase 1); y segundo, estableciendo el Mercado Financiero de Resultados de Medios (Fase 2).
1. Visión Estratégica y Manifiesto: El Nuevo Orden de los Medios
Silexar Pulse no es un software; es una campaña estratégica para redefinir la economía de la atención. Nuestra misión es crear un mercado líquido, transparente y eficiente para el activo más valioso del siglo XXI: la atención humana convertida en resultados de negocio. Para lograrlo, ejecutaremos un plan deliberado en dos fases.
Fase 1: El Orquestador Directo (El Producto del Año 1)
Objetivo: Establecer a Silexar Pulse como la plataforma operativa indispensable para los grupos de medios más importantes.
En esta fase, lanzamos Silexar Pulse como una solución B2B SaaS de élite para clientes como Megamedia, Prisa, etc. Les ofrecemos una herramienta para que gestionen sus propias operaciones de venta directa, pero bajo el revolucionario modelo de "venta por resultados". Les damos el poder de Cortex para que optimicen sus propios ingresos y ofrezcan un valor sin precedentes a sus anunciantes.
●	Modelo de Negocio (Fase 1): Licenciamiento por suscripción (SaaS).
●	Resultado (Fase 1): Generamos ingresos, construimos una red de socios estratégicos, perfeccionamos nuestra tecnología y acostumbramos al mercado a pensar en "resultados" en lugar de "espacios".
Fase 2: El Silexar Pulse Exchange (SPX) (La Singularidad del Mercado)
Objetivo: Convertir a Silexar en la infraestructura central del mercado publicitario.
Una vez que los principales medios operan sobre Pulse, ejecutamos la segunda fase. Invitamos a nuestros clientes de la Fase 1 a convertirse en los primeros participantes de un nuevo ecosistema: el Silexar Pulse Exchange (SPX). La plataforma evoluciona de ser una herramienta a ser un mercado financiero.
●	Modelo de Negocio (Fase 2): Comisión por transacción sobre cada "Contrato de Atención Verificada" (CAV) liquidado en el mercado.
●	Resultado (Fase 2): Dejamos de vender software y pasamos a operar la "bolsa de valores" de la publicidad.
2. El Motor de IA "Cortex": El Cerebro del Ecosistema
Cortex es el sistema nervioso central de Pulse, un conjunto de motores de IA especializados que operan en simbiosis.
●	Cortex-Orchestrator: Orquesta la mezcla de medios óptima para alcanzar los KPIs del cliente al menor costo posible (CPA). Utiliza Reinforcement Learning para aprender y mejorar continuamente sus estrategias de inversión.
●	Cortex-Trader: (Activado en Fase 2) El trader algorítmico que opera en el SPX, buscando las órdenes de compra más rentables y utilizando el inventario de los medios participantes para satisfacerlas.
●	Cortex-Risk: Analiza la salud financiera de los anunciantes a través de bureaus de crédito, generando un "Perfil de Riesgo Comercial" que influye en los términos de pago y en el "Silexar Trust Score".
●	Cortex-Flow: Automatiza los flujos de trabajo, operando en Modo Copiloto (sugiere y espera aprobación) o Modo Autónomo (ejecuta de extremo a extremo).
●	Cortex-Audience: Construye perfiles psicográficos y de intención de compra 360° de la audiencia.
●	Cortex-Voice: Genera creatividades de voz sintética con modulación emocional.
●	Cortex-Sense: Certifica la emisión broadcast (audio-fingerprinting), rastrea la atribución de conversiones digitales y audita el cumplimiento de las reglas de brand safety.
3. Arquitectura Tecnológica y de Seguridad de Grado Mundial
La fundación técnica es intransigente, diseñada para la máxima seguridad, rendimiento y escalabilidad.
3.1. Fundamentada en Google Cloud Platform (GCP)
Toda la arquitectura se construirá de forma nativa sobre GCP para aprovechar su ecosistema de servicios de clase mundial: Vertex AI para Cortex, Google Kubernetes Engine (GKE) para una escalabilidad y resiliencia auto-sanable, Cloud SQL y Redis para la gestión de datos, y Cloud Armor y Identity Platform como base de nuestra seguridad.
3.2. Stack Tecnológico Principal
●	Frontend: Next.js 14 + Tailwind CSS + TypeScript
●	Backend: NestJS + PostgreSQL + Redis
●	Arquitectura: Multi-tenant, Domain-Driven Design (DDD), CQRS con Event Sourcing para módulos críticos, y una arquitectura Data Mesh.
●	DevOps: Turborepo en un pipeline CI/CD con Blue/Green Deployments.
3.3. Seguridad de Grado Militar y Cuántico
●	Protección de Datos: Criptografía Post-Cuántica (PQC) para datos críticos y firmas. Sanitización automática de todas las entradas (DOMPurify, validator.js) para prevenir XSS, SQL Injection, etc.
●	Autenticación y Sesión: JWT con refresh tokens y rotación automática, Session y Device Fingerprinting, y un motor de análisis de comportamiento (UEBA) para detectar anomalías en tiempo real.
●	Defensa de Red: Rate limiting por IP y usuario, WAF con Cloud Armor, y CORS específico por módulo.
●	Auditoría: Logs inmutables y detallados para cada transacción, con anclaje a un ledger de blockchain para transacciones financieras críticas.
3.4. Calidad y Pruebas "Zero Bug Policy"
●	Cobertura Obligatoria: >85% en Unit Tests, 100% de los flujos críticos cubiertos por Integration y E2E Tests (Playwright).
●	Validación Sincronizada: Zod para una única fuente de verdad en validaciones front/back.
●	Base de Datos Robusta: Transacciones atómicas para todas las operaciones multi-paso.
3.5. Observabilidad y Resiliencia Auto-Sanable
●	Monitoreo 360°: Logging estructurado (Pino), Distributed Tracing (OpenTelemetry), y reporte automático a Datadog/Sentry.
●	Anti-Fragilidad: Implementación de patrones de Circuit Breaker, Timeouts y Retries automáticos. Infraestructura que predice y mitiga fallos antes de que ocurran.
3.6. Experiencia de Usuario (UX/UI) Premium
●	Rendimiento: Lazy loading, skeleton screens, optimistic updates.
●	Accesibilidad: Cumplimiento de WCAG 2.1 AA.
●	Inteligencia: Auto-guardado, auto-completado contextual.
4. Arquitectura Modular Funcional: El Plano de Construcción Completo
Este es el desglose completo y detallado de todos los módulos necesarios para ejecutar ambas fases.
Módulos de la Fase 1: Orquestador Directo (El Producto del Año 1)
●	Módulo 1: Núcleo de Configuración (Core Setup)
○	Propósito Estratégico: Establecer los cimientos operativos, de seguridad y de inteligencia de cada cliente, permitiendo una personalización profunda de la plataforma.
○	Sub-Funcionalidades Clave:
■	Gestión de la cuenta maestra del cliente (branding, datos fiscales, configuración regional).
■	Gestión de Usuarios y Roles (RBAC): Creación de usuarios, asignación a equipos y aplicación de perfiles de permisos granulares (ej. "Vendedor", "Programador", "Finanzas", "Administrador").
■	Selector de Modo Operativo: Switch global y por módulo/proceso para que el cliente elija entre "Modo Copiloto" o "Modo Autónomo".
■	Gestión de Políticas de Negocio: Interfaz para configurar reglas clave, como los umbrales para el pago por adelantado o las categorías de clientes de alto riesgo.
○	Integración con Cortex: Cortex-Flow puede sugerir configuraciones de roles y permisos basadas en las mejores prácticas para el tamaño y tipo de la empresa cliente.
○	Operación Dual:
■	Copiloto: El admin configura un nuevo rol y Cortex sugiere: "Para el rol 'Jefe de Ventas', recomiendo dar acceso de lectura a los informes de rendimiento y acceso de escritura a las propuestas comerciales. ¿Aplicar?".
■	Autónomo: No aplica directamente, ya que la configuración es una tarea inherentemente administrativa.
○	Entidades de Dominio: Tenant, User, Role, Permission, BusinessPolicy.
●	Módulo 2: Gestión de Propiedades y Activos
○	Propósito Estratégico: Crear un inventario digital unificado de todos los puntos de contacto con la audiencia, estableciendo las reglas de negocio y compliance para cada uno.
○	Sub-Funcionalidades Clave:
■	Creación de emisoras de Radio (FM/AM) y Canales de TV, con su estructura de programas, bloques comerciales y reglas de conflicto.
■	Creación de Propiedades Digitales (Sitios Web, Apps, Podcasts, Canales de Streaming) y sus respectivos espacios publicitarios (zonas de banners, slots de pre-roll, etc.).
■	Definición de Reglas de Compliance y Brand Safety: Interfaz para que el medio establezca sus políticas (ej. separación de competidores, exclusión de categorías de anuncios), que serán la base para el "Sello de Confianza Silexar".
○	Integración con Cortex: Cortex-Orchestrator ingiere esta información para modelar el "Inventario de Atención". Cortex-Sense utiliza las reglas de compliance para su auditoría continua.
○	Entidades de Dominio: Property, Program, AdBlock, DigitalPlacement, ComplianceRule.
●	Módulo 3: CRM Unificado (Anunciantes y Agencias)
○	Propósito Estratégico: Ser la única fuente de verdad para toda la información y las interacciones con los clientes, potenciado por inteligencia financiera proactiva.
○	Sub-Funcionalidades Clave:
■	Ficha 360° del anunciante con validación fiscal (SII), historial de campañas, contratos, facturación y resultados obtenidos.
■	Pipeline de ventas visual (Kanban) para gestionar oportunidades a través de etapas personalizables.
■	Análisis de Riesgo Comercial Integrado: Conexión con bureaus de crédito. Cortex-Risk genera un perfil de riesgo visible en la ficha del cliente.
○	Integración con Cortex: Cortex-Flow automatiza la creación de leads desde emails. Cortex-Orchestrator predice el Valor de Vida del cliente (LTV). Cortex-Risk evalúa la viabilidad financiera en tiempo real.
○	Operación Dual:
■	Copiloto: Un vendedor recibe una notificación: "Cortex sugiere que 'Zapatillas Veloz' es un buen candidato para una campaña de verano. ¿Deseas crear una nueva oportunidad en el pipeline?".
■	Autónomo: El sistema crea la oportunidad automáticamente y asigna la primera tarea al vendedor: "Contactar a 'Zapatillas Veloz' para calificar la oportunidad generada por IA".
○	Entidades de Dominio: Account, Contact, Opportunity, Contract, InteractionLog.
●	Módulo 4: Generador de Campañas Predictivas
○	Propósito Estratégico: Transformar la venta de publicidad de una negociación de precios a una consultoría de resultados.
○	Sub-Funcionalidades Clave:
■	Interfaz guiada para que el equipo de ventas (o el cliente en un portal de autoservicio) defina KPIs (leads, visitas, ventas), presupuesto, target y duración.
■	Presentación del plan de medios proyectado por la IA, incluyendo la probabilidad de éxito y el desglose de la inversión.
■	Simulador "What-If" para explorar diferentes escenarios de inversión.
■	Visibilidad de los "Sellos de Confianza" de los medios para la selección de socios.
○	Integración con Cortex: Este módulo es la interfaz directa de Cortex-Orchestrator.
○	Entidades de Dominio: CampaignGoal, CampaignPlan, Forecast.
●	Módulo 5: Orquestador de Campañas (Vista Interna)
○	Propósito Estratégico: Proporcionar un centro de mando unificado para la supervisión y ejecución de todas las campañas activas.
○	Sub-Funcionalidades Clave:
■	Dashboard de campañas activas con su estado y progreso hacia el KPI.
■	Visualización del plan de medios que la IA está ejecutando.
■	Herramientas para ajustar manualmente la estrategia (en Modo Copiloto), como pausar un canal o reasignar presupuesto.
○	Integración con Cortex: Cortex-Orchestrator es el motor, pero este módulo permite la supervisión y el control humano.
○	Entidades de Dominio: Campaign, Flight, Budget.
●	Módulo 6: Gestor de Activos Creativos
○	Propósito Estratégico: Ser el repositorio central y seguro para todos los materiales publicitarios, con capacidades de generación inteligente.
○	Sub-Funcionalidades Clave:
■	Carga, clasificación y gestión de audios (MP3, WAV), videos y banners.
■	Editor de Textos para Voz Sintética: Interfaz para escribir los guiones que Cortex-Voice convertirá en audio, con opciones para seleccionar la voz y la entonación.
■	Sistema de versionado y aprobación de creatividades.
○	Integración con Cortex: Cortex-Voice se integra para la generación de audios. Cortex-Sense puede analizar las creatividades para predecir su posible impacto.
○	Entidades de Dominio: CreativeAsset, VoiceScript, ApprovalWorkflow.
●	Módulo 7: Pauta y Ejecución Broadcast (Puente a Playout)
○	Propósito Estratégico: Ser el puente robusto y confiable entre la estrategia de Pulse y la ejecución en los sistemas de emisión tradicionales.
○	Sub-Funcionalidades Clave:
■	Interfaz de programación visual (drag-and-drop) para la construcción final de las tandas comerciales.
■	Optimizador de Tanda Emocional: Botón que permite a Cortex reorganizar la tanda para maximizar la retención.
■	Generador de Logs Nativos: El sistema genera los logs de exportación en los formatos exactos y específicos requeridos por los principales sistemas de playout del mercado (Dalet, Sara, WideOrbit Automation for Radio, etc.).
○	Integración con Cortex: Cortex-Orchestrator alimenta las órdenes de trabajo a este módulo. Cortex-Sense luego verifica que el log exportado coincida con la emisión real.
○	Entidades de Dominio: Playlist, BroadcastLog, TrafficOrder.
●	Módulo 8: API de Inserción Dinámica (DAI)
○	Propósito Estratégico: Ser el punto de conexión de alto rendimiento para la ejecución de publicidad personalizada en tiempo real en entornos digitales.
○	Sub-Funcionalidades Clave:
■	API REST/GraphQL de alto rendimiento y baja latencia.
■	Endpoint que recibe la solicitud con el ID del oyente y devuelve el anuncio óptimo en milisegundos.
■	SDKs para facilitar la integración con apps y webs.
○	Integración con Cortex: Es el punto de ejecución en tiempo real de Cortex-Audience, Cortex-Orchestrator y Cortex-Voice.
○	Entidades de Dominio: AdRequest, AdResponse.
●	Módulo 9: Dashboard de Resultados en Vivo
○	Propósito Estratégico: Ofrecer transparencia total y en tiempo real sobre el rendimiento de la campaña, cambiando el enfoque de "emisión" a "impacto".
○	Sub-Funcionalidades Clave:
■	Visualización en tiempo real de los KPIs del cliente (leads, visitas, etc.) vs. el objetivo.
■	Métricas de rendimiento como CPA, CPV, ROI.
■	Gráficos de atribución que muestran qué canales están contribuyendo más a los resultados.
○	Integración con Cortex: Cortex-Sense alimenta este dashboard con los datos de atribución y conversión.
○	Entidades de Dominio: PerformanceDataPoint, AttributionModel.
●	Módulo 10: Conciliación y Certificación de Resultados
○	Propósito Estratégico: Auditar y certificar de forma irrefutable que los resultados se entregaron, eliminando las disputas y generando confianza.
○	Sub-Funcionalidades Clave:
■	Certificación de emisión broadcast mediante audio-fingerprinting.
■	Certificación de resultados digitales (leads, clics) mediante la integración con plataformas de analítica.
■	Ledger Inmutable de Resultados: Cada resultado certificado se registra en un ledger a prueba de manipulaciones.
○	Integración con Cortex: Cortex-Sense es el motor de este módulo.
○	Entidades de Dominio: VerifiedImpression, VerifiedConversion, AuditTrail.
●	Módulo 11: Facturación por Resultados
○	Propósito Estratégico: Automatizar la facturación basada en los KPIs alcanzados y el riesgo del cliente, asegurando el flujo de caja.
○	Sub-Funcionalidades Clave:
■	Generación automática de facturas basadas en los resultados certificados en el ledger.
■	Términos de Pago Dinámicos y Configurables: El sistema exige el 100% del pago por adelantado para clientes de riesgo o campañas políticas, según las políticas definidas en el Módulo 1.
■	Integración con el SII para la emisión de DTE.
○	Integración con Cortex: Cortex-Flow automatiza todo el ciclo de facturación. Cortex-Risk informa las políticas de pago.
○	Entidades de Dominio: Invoice, PaymentTerm, Transaction.
Módulos de la Fase 2: El Ecosistema del SPX (La Expansión Futura)
●	Módulo 12: Motor de Transacciones del SPX (Trading Engine)
○	Propósito Estratégico: Ser el corazón del mercado, emparejando órdenes de compra de anunciantes con la capacidad de generación de los medios de forma eficiente y a gran escala.
○	Arquitectura: Servicios de ultra baja latencia (posiblemente en Rust/C++) para el emparejamiento de órdenes.
●	Módulo 13: Cámara de Compensación y Liquidación (Clearing House)
○	Propósito Estratégico: Gestionar la liquidación financiera de cada CAV transado, garantizando la seguridad y la confianza en las transacciones del mercado.
○	Arquitectura: Conexión con la blockchain/ledger para una liquidación transparente y auditable.
●	Módulo 14: Gestión de Activos Digitales (CAVs)
○	Propósito Estratégico: Definir, crear y gestionar el ciclo de vida de los Contratos de Atención Verificada como un activo digital estandarizado.
●	Módulo 15: Regulador de Mercado y Confianza
○	Propósito Estratégico: Calcular y gestionar el Silexar Trust Score (STS) y aplicar las reglas del mercado para asegurar un entorno justo y de alta calidad.
○	Integración con Cortex: Cortex-Risk y Cortex-Sense alimentan constantemente a este módulo para actualizar el STS de cada participante.
●	Módulo 16: Terminal de Trading del SPX
○	Propósito Estratégico: Proporcionar las interfaces para que los anunciantes coloquen sus órdenes de compra de CAVs y para que los medios monitoreen su rendimiento y sus ingresos en el mercado.
5. Conclusión Estratégica
Este plan de dos fases nos permite ser pragmáticos y visionarios al mismo tiempo. Nos enfocamos en construir y vender el "Orquestador Directo" (Módulos 1-11) durante el primer año, generando la base de clientes y los ingresos necesarios para financiar y lanzar el "Silexar Pulse Exchange" (Módulos 12-16), nuestro verdadero y definitivo diferenciador en el mercado global.

Plan de Acción: Módulo 1 - Núcleo de Configuración
Fase del Proyecto: Fase 1 - Orquestador Directo
Objetivo del Módulo: Crear la estructura fundamental que permitirá a Silexar administrar a sus clientes (los medios) y a esos clientes administrar sus propias operaciones internas, incluyendo usuarios, permisos y reglas de negocio clave.
1. Objetivo Estratégico
Este módulo es la base de nuestra arquitectura multi-tenant. Al completarlo, tendremos un sistema funcional capaz de alojar de forma segura y aislada a múltiples clientes, cada uno con su propia configuración, usuarios y políticas. Es el requisito indispensable para poder firmar con nuestro primer cliente.
2. Componentes Clave a Desarrollar
Dividiremos el trabajo en cuatro grandes funcionalidades interconectadas:
2.1. Gestión de Tenants (Clientes)
•	Propósito: La interfaz para que el equipo de Silexar administre a sus clientes.
•	Funcionalidades:
o	Creación de Tenant: Un formulario seguro donde un Super-Admin de Silexar puede crear una nueva cuenta para un cliente (ej. "Megamedia").
o	Asignación de Licencia: Se le asigna un plan (ej. "Plan Enterprise - 100 usuarios") y una fecha de vencimientos.
o	Generación de Administrador Maestro: Al crear el tenant, el sistema genera automáticamente el primer usuario (el "Usuario Maestro") con permisos de administrador total sobre ese tenant.
o	Dashboard de Tenants: Una vista para que Silexar vea a todos sus clientes, su estado (activo, suspendido, por vencer) y pueda acceder a su configuración.
2.2. Gestión de Usuarios y Roles (RBAC - Control de Acceso Basado en Roles)
•	Propósito: Permitir que cada cliente administre a sus propios equipos de forma segura.
•	Funcionalidades:
o	Gestión de Usuarios (Vista del Cliente): El Administrador Maestro de un cliente (ej. Megamedia) puede crear, editar, desactivar y eliminar a sus propios usuarios (vendedores, programadores, etc.).
o	Gestión de Roles: El Administrador Maestro puede ver los roles predefinidos (Vendedor, Programador, Finanzas) y, en el futuro, crear roles personalizados.
o	Asignación de Roles: Asignar uno o más roles a cada usuario para definir a qué módulos y funciones puede acceder.
2.3. Selector de Modo Operativo (Copiloto / Autónomo)
•	Propósito: Implementar el pilar de nuestra estrategia de "Simbiosis Adaptativa".
•	Funcionalidades:
o	Configuración Global: El Administrador Maestro tendrá un panel de configuración donde podrá establecer el modo operativo por defecto para toda su organización.
o	Configuración por Módulo: Podrá anular la configuración global para módulos específicos. Ejemplo: "Quiero que el CRM funcione en Modo Copiloto, pero que la Facturación opere en Modo Autónomo".
o	La selección se guardará y será consultada por los demás módulos para determinar su comportamiento.
2.4. Configuración de Políticas de Negocio
•	Propósito: Darle al cliente el control sobre las reglas financieras y de riesgo de su operación.
•	Funcionalidades:
o	Política de Pago por Adelantado: Una interfaz donde el Administrador Maestro puede definir las reglas para exigir el 100% del pago por adelantado. Por ejemplo:
	SI el "Perfil de Riesgo" del anunciante es "Alto", ENTONCES exigir 100% de adelanto.
	SI la "Categoría de Campaña" es "Política", ENTONCES exigir 100% de adelanto.
3. Arquitectura y Tecnología Aplicada
•	Backend (NestJS):
o	Se crearán los controladores, servicios y entidades para Tenant, User, Role, Permission y BusinessPolicy.
o	Se implementará la lógica para que cada solicitud a la API esté asociada a un tenantId, asegurando el aislamiento de los datos.
o	Se usarán DTOs (Data Transfer Objects) con class-validator para validar todas las entradas.
o	La autenticación se manejará con JWT, donde el token contendrá el userId, tenantId y los roles.
•	Frontend (Next.js):
o	Se construirá un layout de administración principal.
o	Se creará una sección de "Super-Admin" visible solo para Silexar para la gestión de tenants.
o	Dentro de la aplicación principal, se desarrollarán las vistas para que el Administrador Maestro gestione sus usuarios, roles y políticas.
o	Los formularios se construirán con React Hook Form y la validación se sincronizará con el backend usando Zod.
•	Base de Datos (PostgreSQL):
o	Se diseñará el esquema inicial con las siguientes tablas clave:
	tenants (id, name, license_plan, expiration_date)
	users (id, email, password_hash, role_id, tenant_id)
	roles (id, name, tenant_id)
	permissions (id, action, subject)
	role_permissions (role_id, permission_id)
	settings (tenant_id, key, value) -> para guardar el modo operativo y otras políticas.
4. Criterios de Aceptación (Definition of Done)
Sabremos que este módulo está completo y listo cuando se cumplan las siguientes condiciones:
1.	Un Super-Admin de Silexar puede crear, ver, editar y desactivar un cliente (tenant) desde su dashboard.
2.	Al crear un tenant, se genera automáticamente un Administrador Maestro y se le notifica de forma segura.
3.	Un Administrador Maestro puede iniciar sesión y solo ver los datos y usuarios de su propio tenant.
4.	El Administrador Maestro puede crear, ver, editar y desactivar a sus propios usuarios y asignarles roles.
5.	Los permisos se aplican correctamente: un usuario con rol "Vendedor" no puede acceder al panel de configuración del tenant.
6.	El Administrador Maestro puede configurar el "Modo Operativo" y las políticas de pago, y estos valores se guardan correctamente.
7.	Todas las funcionalidades están cubiertas por pruebas automatizadas (unitarias, de integración y E2E) con una cobertura superior al 85%.
5. Próximos Pasos
Una vez que este núcleo esté sólido y probado, el siguiente paso lógico será construir el Módulo 2: Gestión de Propiedades y Activos. Esto permitirá a nuestros clientes empezar a configurar sus emisoras, podcasts y sitios web dentro de la plataforma, preparando el terreno para la gestión de inventario.

Plan de Arquitectura Detallada: Silexar Pulse
Versión: 21.0 Clasificación: Nivel Estratégico Máximo / Confidencial Autor: Silexar - Arquitecto Principal Directiva del Proyecto: Construir la infraestructura central de la nueva economía de la atención a través de una estrategia bifásica: primero, con una Plataforma de Orquestación de Resultados (Fase 1); y segundo, estableciendo el Mercado Financiero de Resultados de Medios (Fase 2).
A. Arquitectura General y Estrategia
(La visión estratégica bifásica, el motor de IA Cortex, y la arquitectura tecnológica y de seguridad de grado mundial se mantienen como el fundamento para la siguiente estructura modular detallada).
B. Arquitectura Modular Funcional: El Plano de Construcción Completo
Esta sección detalla la estructura de navegación y los módulos de la Fase 1 con el máximo nivel de detalle.
Grupo I: Configuración del Sistema (El Engranaje Central)
•	Módulo 1: Núcleo de Administración (Core Setup)
o	Propósito Estratégico: Ser el centro de control absoluto tanto para Silexar (Super-Admin) como para los administradores de cada cliente (Tenant-Admin). Este módulo establece los cimientos operativos, de seguridad y de inteligencia de cada instancia de la plataforma.
Sub-Módulo 1.1: Panel de Super-Administración (Vista Silexar)
o	Propósito Estratégico: La torre de control desde donde Silexar gestiona toda la plataforma, monitorea su salud y administra a su base de clientes.
o	Interfaz y Flujo de Usuario:
	Un dashboard global (/super-admin) accesible solo para usuarios de Silexar con el rol correspondiente.
	Widget "Salud del Sistema": Tarjetas con métricas en tiempo real del rendimiento de la plataforma, uso de recursos de GCP (CPU, memoria), latencia promedio de la API y estado de los servicios clave (Base de Datos, Redis, Cortex API).
	Widget "Actividad de Tenants": Un gráfico de las últimas 24 horas mostrando los tenants con mayor actividad de API.
	Pestaña "Gestor de Tenants (Clientes)":
	Una tabla con todos los clientes. Columnas: ID Tenant, Nombre Cliente, Plan de Licencia, Fecha de Vencimientos, Estado (Activo/Suspendido), Acciones.
	Botón "Crear Tenant": Abre un formulario seguro para crear una nueva cuenta cliente. Campos: Nombre Cliente, RUT, Email del Administrador Maestro, Asignar Plan de Licencia (dropdown). Al guardar, se genera el Tenant, su base de datos aislada, y se envía un correo de bienvenida al Admin Maestro con un enlace para establecer su contraseña.
	Columna "Acciones":
	Editar: Modificar el plan de licencia o la fecha de vencimientos.
	Suspender/Activar: Cambiar el estado del tenant.
	Tomar Control (Impersonation): Botón que permite a un Super-Admin iniciar sesión como el Usuario Maestro de ese cliente para soporte. Cada acción en este modo se registra en un log de auditoría especial (impersonation_logs) para total transparencia.
Pestaña "Módulos y Licencias"
•	Se añadirá un toggle switch principal llamado "Activar Suite de Publicidad Digital y Programática".
•	Por defecto, estará desactivado. Solo los clientes que contraten esta suite de funcionalidades tendrán acceso a los siguientes módulos. Esto asegura que la interfaz se mantenga limpia y relevante para cada tipo de cliente.

o	Integración con Cortex:
	Copiloto: Cortex-Risk analiza patrones de uso y puede generar una alerta en el dashboard: "Alerta de Seguridad: El Tenant 'Radio Regional' ha tenido 50 intentos de inicio de sesión fallidos desde una nueva IP en la última hora. Se recomienda contactar al administrador".
Sub-Módulo 1.2: Panel de Administración del Cliente (Vista Tenant-Admin)
o	Propósito Estratégico: El centro de mando para que cada cliente configure su propio universo dentro de Silexar Pulse.
o	Interfaz y Flujo de Usuario:
	Una sección "Administración" en el menú principal, visible solo para usuarios con rol de administrador.
	Pestaña "Usuarios y Roles" (RBAC):
	Sub-pestaña "Usuarios": Tabla para crear, editar, desactivar y eliminar usuarios internos.
	Sub-pestaña "Roles": Vista de los roles predefinidos (Vendedor, Programador, Finanzas) y sus permisos. Futuramente, permitirá crear roles personalizados.
	Pestaña "Políticas de Negocio":
	Interfaz para configurar las reglas financieras, como los umbrales de riesgo (Cortex-Risk Score > 600) para exigir el 100% del pago por adelantado.
	Pestaña "Modo Operativo":
	Un switch global para Copiloto / Autónomo.
	Debajo, una lista de todos los módulos principales, cada uno con su propio switch para anular la configuración global, permitiendo una personalización granular.
	Pestaña "Configuraciones Generales":
	Sub-pestaña "Calendario": Definición de días festivos y eventos especiales.
	Sub-pestaña "Idioma y Región": Configuración de idioma, moneda y formato de fecha.
	Sub-pestaña "Historial de Cambios": Un log de auditoría de todas las configuraciones importantes realizadas en el sistema.
1.2.5: Sub-pestaña "Idioma y Región"
•	Propósito Estratégico: Definir la configuración de internacionalización (i18n) para cada cliente, permitiendo que la plataforma opere en múltiples idiomas y se adapte a diferentes convenciones regionales.
•	Configuraciones:
o	Idioma por Defecto: Un campo que mostrará "Español" como el idioma predeterminado de la plataforma.
o	Idiomas Habilitados: Un listado que mostrará los idiomas disponibles para los usuarios finales. Para el lanzamiento, estos serán:
	Español
	Inglés
Implementación Transversal en la Plataforma
Arquitectura de Internacionalización (i18n)
•	Tecnología: Se utilizará una librería estándar de la industria para Next.js, como next-i18next o el enrutamiento internacionalizado nativo.
•	Gestión de Textos: Todos los textos fijos de la interfaz (etiquetas de botones, títulos de menú, mensajes de error, etc.) se gestionarán a través de archivos de traducción (ej. es.json, en.json). Esto permitirá que añadir nuevos idiomas en el futuro sea un proceso escalable y ordenado.
Experiencia del Usuario Final
•	Selector de Idioma: En la barra de navegación principal de la aplicación, junto al perfil del usuario, se ubicará un menú desplegable que permitirá al usuario cambiar su idioma de preferencia en cualquier momento.
•	Idioma por Defecto: Al iniciar sesión por primera vez o al visitar la página de login, la interfaz se mostrará por defecto en español.
•	Persistencia de la Selección: Una vez que un usuario selecciona "Inglés", su preferencia se guardará en su perfil. En todos sus inicios de sesión posteriores, la plataforma se cargará directamente en inglés para él, hasta que decida cambiarla nuevamente.
Sub-Módulo 1.3: Configuración de Exportación (Playout)
o	Propósito Estratégico: Centralizar la configuración técnica de los formatos de exportación para los sistemas de playout, permitiendo una gestión flexible y escalable.
o	Interfaz y Flujo de Usuario:
	Una nueva pestaña "Formatos de Playout" dentro de la Administración del Cliente.
	Vista Principal: Una lista de los formatos de exportación ya creados (ej. "Dalet Galaxy v1", "Sara Lite").
	Botón "Crear Formato de Exportación": Abre un constructor visual.
	Constructor de Formato: Una interfaz avanzada que permite al usuario definir la estructura exacta del archivo de texto (.txt) de exportación. El usuario puede agregar campos, definir su orden, longitud de caracteres, caracteres de relleno y separadores, replicando la estructura requerida por cualquier sistema de playout.
o	Integración con Cortex:
	Copiloto: Cortex puede ofrecer plantillas predefinidas: "Hemos detectado que el nombre es 'Dalet'. ¿Deseas usar la plantilla de formato estándar para Dalet Galaxy?".
•	Módulo 2: Configuración de Medios, Emisoras y Tarifas
o	Propósito Estratégico: Ser la única fuente de verdad para todos los productos comerciales, desde auspicios de programas hasta tandas rotativas. Este módulo define qué se vende, a qué precio y, más importante, su disponibilidad en el tiempo (avails), proporcionando al equipo comercial una visión clara y en tiempo real del inventario para maximizar los ingresos.
Sub-Módulo 2.1: Gestión de Emisoras (Broadcast)
o	Propósito Estratégico: Definir las entidades de radio y TV como unidades operativas, configurando sus propiedades fundamentales y su conexión con el mundo exterior.
o	Interfaz y Flujo de Usuario:
	Vista Principal: Una pantalla completa con una tabla de todas las emisoras creadas.
	Barra de Herramientas: Botón "Agregar Emisora", campos de búsqueda por Nombre, Dial o Ciudad.
	Tabla de Emisoras: Columnas: ID Emisora, Nombre, Canal (FM/Digital), Área de Cobertura, Propietario. A la derecha de cada fila, un botón Editar.
	Formulario de Creación/Edición de Emisora (Modal o Página Completa):
	Pestaña "General":
	ID Emisora: Campo numérico, no editable, generado automáticamente.
	Nombre Emisora: Campo de texto.
	Propietario Emisora: Campo de texto (ej. "Megamedia").
	Área de Cobertura: Campo de texto (ej. "Región Metropolitana").
	Canal: Dropdown para seleccionar FM o Digital.
	Frecuencias: Un campo dinámico que permite agregar múltiples líneas, cada una con Ciudad (texto) y Dial (texto, ej. "99.3").
	Pestaña "Exportación a Playout":
	Directorio de Exportación: Campo de texto para pegar una ruta de red.
	Formato de Exportación: Un selector que se puebla con los formatos creados en el Sub-Módulo 1.3.
	Pestaña "Tarifas y Programas":
	Una tabla que muestra todos los Programas (del Sub-Módulo 2.2) asociados a esta emisora y los Tarifarios (del Sub-Módulo 2.3) vigentes.
	Metadata: Campos no editables para Última Modificación por: y Fecha de Modificación.
Sub-Módulo 2.2: Gestión de Propiedades y Programación
2.1: Gestor de Propiedades
Propósito Estratégico: Crear y administrar el portafolio de todas las marcas y medios (ej. estaciones de radio, sitios web, podcasts) que la empresa comercializa. Esta lista es la base sobre la cual se construyen los contratos y se planifican las campañas.
Interfaz y Flujo de Usuario 
•	La interfaz principal de este sub-módulo mostrará un listado de todas las Propiedades creadas.
•	Contará con un formulario simple para "Agregar Propiedad" que solicitará:
o	Nombre de la Propiedad: El nombre del activo de medios (ej. "Play FM", "Sonar FM", "Tele13 Radio").
•	La interfaz permitirá editar y eliminar las propiedades existentes.
Conexiones Clave con Otros Módulos:
•	Módulo 5 (Contratos): Al crear o editar un Contrato, habrá un campo obligatorio para seleccionar la Propiedad a la cual se asocia el acuerdo comercial. Esto define el marco en el que se ejecutará la publicidad del cliente.
•	Módulo 7 (Campañas): Cada Campaña heredará la Propiedad de su contrato padre, asegurando que toda la planificación operativa se realice dentro del medio correcto.
•	Módulo 13 (Informes): La Propiedad será una dimensión de análisis principal. Esto permitirá generar informes cruciales como "Ingresos por Propiedad", para comparar directamente el rendimiento financiero de cada marca o medio.
Sub-Módulo 2.3: Gestión de Tarifas y Paquetes
2.3: Gestor de Auspicios y Patrocinios (Vencimientos)
Esta es la herramienta para gestionar los productos de alto valor y cupos limitados, como los auspicios de programas.
Interfaz y Flujo de Usuario:
•	Vista Principal: Una interfaz tipo parrilla o "booking chart", inspirada en tus planillas. Las filas representarán los Programas de cada Emisora, y las columnas representarán los meses o semanas.
•	Vista Detallada del Programa: Al hacer clic en un programa, se expandirá una vista detallada mostrando los "slots" o cupos de auspicio. Cada slot tendrá la siguiente información:
o	Estado: Un indicador visual (ej. un punto de color). Verde para un auspicio activo, Rojo para uno vendido pero pendiente de inicio.
o	Cliente Contratado: Nombre del anunciante.
o	Tipo: El tipo de auspicio (ej. "Auspicio Completo Tipo A").
o	Rubro: La industria del cliente.
o	Vendedor: El ejecutivo a cargo.
o	Fechas: Fecha de inicio y término del contrato del cliente.
o	Contrato Nº: Un enlace directo al contrato en el Módulo 5.
•	Botón "Configurar Auspicio": Permitirá a un usuario con permisos (Programador) definir las propiedades comerciales de un programa.
Formulario de Configuración de Auspicio:
•	Derechos del Auspicio: Un campo de texto para detallar los beneficios (ej. "2 menciones diarias + logo en pantalla").
•	Cupos Totales: Número total de clientes que pueden auspiciar el programa simultáneamente.
•	Menciones por Cliente: Cantidad de menciones que incluye cada cupo.
•	Tarifario: Campos para definir el Valor Auspicio Completo y Valor Solo Menciones.
Cortex-Inventory: Motor de Gestión de Cupos
•	Este motor de IA analizará en tiempo real los contratos cerrados contra los cupos definidos.
•	Cálculo Automático: Determinará automáticamente la disponibilidad. Si un programa tiene 10 cupos y 9 están vendidos para agosto, el sistema mostrará un mensaje destacado en la vista de vendedores: "¡Último cupo disponible para 'Mesa Central' en Agosto!".
•	Proyección de Disponibilidad: Permitirá a los vendedores ver la disponibilidad futura, indicando "Sin cupos entre [fecha] y [fecha]" o "X cupos disponibles a partir de [fecha]".
2.4: Gestor de Tarifarios de Pauta Rotativa (Tandas)
Aquí se definen los paquetes comerciales estándar que se seleccionarán en los contratos.
•	Interfaz: Una sección para crear y gestionar "Paquetes Comerciales".
•	Creación de Paquete: El usuario define el nombre del paquete (ej. Prime, Repartido, Noche, Señal Temperatura, Micro).
•	Rate Card (Lista de Precios): Dentro de cada paquete, se crea una tabla de precios por duración. Ejemplo para el paquete "Prime":
o	5 segundos: $X
o	10 segundos: $Y
o	15 segundos: $Z
•	Conexión Clave: La información de estos paquetes y sus precios es la que se consume directamente desde el Módulo 5 (Contratos) en la pestaña "Especificaciones de la Emisora" al seleccionar un "Paquete".
2.5: Flujos de Trabajo y Notificaciones Inteligentes
Esta es la lógica que automatiza y conecta el módulo con el resto del sistema.
•	Flujo de Activación de Auspicio:
1.	Cuando un Contrato se marca como "Confirmado" y contiene una campaña asociada a un auspicio, el sistema no actualiza el cupo inmediatamente.
2.	Envía una notificación emergente y prioritaria únicamente al Programador asignado a la emisora correspondiente.
3.	El mensaje dirá: "Confirmación de Inicio: El cliente [Nombre del Cliente] ha contratado el auspicio para [Nombre del Programa]. Por favor, confirma el inicio de la emisión." con botones "Confirmar" y "Rechazar".
4.	Solo cuando el programador presiona "Confirmar", el sistema ocupa el cupo y cambia el estado a Verde en la vista de vencimientos.
•	Flujo de Alerta de Vencimientos:
1.	El sistema monitorea diariamente las fechas de término de los auspicios activos.
2.	24 horas antes de que un auspicio finalice, envía una notificación automática al programador correspondiente: "Recordatorio de Vencimientos: El auspicio de [Nombre del Cliente] en [Nombre del Programa] finaliza mañana. Por favor, realiza las modificaciones necesarias en las presentaciones y cierres del programa."
Sub-Módulo 2.6: Políticas de Compliance y Brand Safety
2.7: Gestor de Paquetes Especiales y Promociones
Propósito Estratégico: Dotar al equipo comercial de la agilidad necesaria para crear, gestionar y utilizar paquetes tácticos o promocionales de duración limitada. Estos paquetes especiales pueden ser diseñados para eventos, temporadas o negociaciones específicas con clientes, sin necesidad de alterar los tarifarios estándar.
Interfaz y Flujo de Usuario:
* 
Vista Principal (inspirada en la imagen ):
* Al acceder a este sub-módulo, el usuario verá una tabla con todos los paquetes especiales que se han creado. * 
Columnas: Nombre Paquete, Emisora, Fecha Inicio, Fecha Final, Activo.
* Barra de Herramientas: Contendrá un botón principal "Agregar Paquete".
* 
Formulario de Creación/Edición de Paquete (inspirado en la imagen ):
* Al hacer clic en "Agregar Paquete", se abrirá un formulario para ingresar la siguiente información: * Nombre del Paquete: Campo de texto para el nombre descriptivo (ej. "Paquete Especial Fiestas Patrias"). * Emisora: Un selector para asociar el paquete a una emisora específica. * Fecha de Inicio y Fecha de Término: Selectores de fecha para definir la vigencia del paquete. Solo podrá ser utilizado en contratos dentro de este rango. * Activo: Un toggle switch o checkbox para activar o desactivar la disponibilidad del paquete.
Conexiones con Otros Módulos:
La verdadera potencia de este módulo reside en cómo se integra con el resto de la plataforma:
•	Módulo 5 (Contratos):
o	Cuando un vendedor esté en la pestaña "Especificaciones de la Emisora" de un contrato, el campo de búsqueda "Paquete" ahora consultará y mostrará resultados de dos fuentes:
1.	Los paquetes estándar del tarifario (definidos en el Sub-Módulo 2.4).
2.	Los Paquetes Especiales activos y vigentes que se creen en este sub-módulo.
o	El sistema podrá tener un indicador visual (ej. una etiqueta "ESP") para que el vendedor distinga fácilmente un paquete especial de uno estándar.
•	Módulo 7 (Campañas):
o	La información del paquete especial utilizado se heredará en la campaña para fines de seguimiento y operaciones.
•	Módulo 13 (Informes):
o	El "Nombre del Paquete" será un campo disponible en el Constructor de Informes Personalizados, permitiendo a la gerencia analizar el rendimiento, la frecuencia de uso y la rentabilidad de estos paquetes especiales.
o	Propósito Estratégico: Establecer las reglas para el "Sello de Confianza Silexar".
2.8: Gestor de Propiedades y Placements Digitales
Propósito Estratégico: Crear el catálogo maestro de todo el inventario digital monetizable.
•	Creación de Propiedad Digital: Un formulario para dar de alta los activos principales.
o	Nombre de la Propiedad: Ej. "Podcast 'Mesa Central'", "Sitio Web 'PlayFM.cl'".
o	Tipo de Propiedad: Dropdown (Podcast, Sitio Web, Aplicación Móvil, Streaming en Vivo).
•	Creación de Placements (Espacios Publicitarios): Dentro de cada propiedad, se define el inventario específico.
o	Nombre del Placement: Ej. "Pre-roll Auspiciador", "Banner MPU Home".
o	Tipo de Anuncio: Audio, Banner Display, Video.
o	Dimensiones/Duración: Ej. 300x250px, 30 segundos.

•	Módulo 3: CRM Unificado (Cuentas y Contactos)
o	Propósito Estratégico: Ser la única fuente de verdad para toda la información de los clientes, potenciado por inteligencia financiera proactiva.
o	Sub-Módulos y Flujo:
	3.1: Gestión de Anunciantes: El hub central para cada cliente final, con la vista detallada 360° y todas sus pestañas (Contactos, Productos, Contratos, Campañas, etc.).
	3.2: Gestión de Agencias de Medios: Entidad separada para gestionar las agencias.
•	Módulo 4: Gestión de Equipos de Venta
o	Propósito Estratégico: Organizar, gestionar y potenciar a la fuerza comercial.
o	Sub-Módulos y Flujo:
	4.1: Gestión de Vendedores: Creación y administración de los perfiles individuales de cada vendedor, con la distinción clave de "Es Jefe de Equipo".
	4.2: Gestión de Equipos de Venta: Agrupación de vendedores en equipos con un jefe asignado.
	4.3: Asignación de Carteras: Herramienta visual para asignar cuentas a vendedores, potenciada por las sugerencias de Cortex.
Grupo III: Planificación y Venta (De la Oportunidad al Contrato)
Módulo 5: Gestión de Oportunidades y Contratos
Propósito Estratégico: Formalizar las relaciones comerciales y los acuerdos marco que gobernarán las campañas. Este módulo es el motor que convierte una negociación en un acuerdo ejecutable, registrando todos los términos comerciales, financieros y de pauta. Actúa como el pivote central que conecta la venta (CRM) con la operación (Centro de Mando de Campañas) y las finanzas (Facturación).
Interfaz y Flujo de Usuario
5.1: Vista Principal (Listado de Contratos)
Al ingresar al módulo, el usuario verá una vista de pantalla completa con un listado de todos los contratos existentes.
•	Barra de Herramientas Superior:
o	Botón "Crear Contrato": Inicia el flujo de creación de un nuevo contrato en una vista de página completa o modal.
o	Búsqueda Inteligente: Un único campo de búsqueda que permite encontrar contratos por número, nombre del anunciante, RUT, nombre del vendedor o estado.
•	Tabla de Contratos: Una grilla de datos con las siguientes columnas:
o	Número Contrato: ID único generado por el sistema (ej. CON-00001).
o	Tipo: Campo de texto corto (A, B, C).
o	Estado: Etiqueta visual con el estado actual (ej. Nuevo, Confirmado, Modificado, Pendiente, Rechazado).
o	Anunciante: Nombre del cliente final.
o	Comisión Agencia (%): Porcentaje de la comisión.
o	Fecha Inicio / Fecha Final: Rango de vigencia del contrato.
o	Valor Bruto / Valor Neto: Totales del contrato.
o	Saldo: Monto pendiente de pago.
o	Vendedor: Nombre del ejecutivo de ventas asignado.
5.2: Gestor de Contrato (Vista Detallada)
Al crear un nuevo contrato o editar uno existente, se presenta una interfaz de pantalla completa organizada en pestañas para una gestión clara y ordenada.
5.2.1: Pestaña "Resumen y Partes" (Tapa del Contrato)
Contiene la información fundamental del acuerdo.
•	Información General:
o	Nombre del Contrato: Texto descriptivo.
o	Fecha Inicio / Fecha Término: Selectores de fecha con calendario.
•	Partes Involucradas:
o	RUT del Anunciante: Campo de texto. Al ingresarlo, Cortex valida el RUT y autocompleta el campo Anunciante.
o	Anunciante: Campo autocompletado, pero puede ser modificado.
o	Producto: Dropdown con búsqueda inteligente de los productos asociados al anunciante.
	Botón "+ Crear Producto": Abre un modal para registrar un nuevo producto sin salir del flujo del contrato. Este modal contendrá:
1.	Nombre Producto: Campo de texto.
2.	Agencia de Publicidad Asociada: Búsqueda y selección desde el Módulo de Agencias.
3.	Agencia de Medios Asociada: Búsqueda y selección desde el Módulo de Agencias.
4.	Vendedor Principal: Búsqueda y selección desde el Módulo de Vendedores.
5.	Un botón de Guardar que verifica si ya existe un producto con las mismas características para evitar duplicados. Al guardar, el nuevo producto se asigna automáticamente al contrato.
o	Agencia de Publicidad / Agencia de Medios / Vendedor: Campos de selección con búsqueda inteligente en sus respectivos módulos.
o	Equipo de Venta: Selección del equipo responsable.
o	Dirección de Envío: Dropdown con opciones: Anunciante, Agencia de Publicidad, Agencia de Medios.
•	Términos Comerciales:
o	Comisión de Agencia (%): Campo numérico para el porcentaje.
o	Propiedades Asignadas: Un área de selección dual donde se listan todas las propiedades disponibles (del Módulo 2) para ser asignadas a este contrato.
•	Valores Totales (Solo Lectura):
o	Importe Neto Total / Importe Bruto Total: Campos que se actualizan automáticamente desde los cálculos en la pestaña "Detalle de Pauta".
5.2.2: Pestaña "Términos Financieros (Facturación)"
Define cómo y cuándo se facturará el contrato.
•	Opciones de Factura:
o	Modo de Facturación: Dropdown con opciones: Facturación por Hitos (equivalente a "Combinar por Campaña") y Facturación por Plazos (equivalente a "Cuotas").
o	Tipo de Factura: Dropdown con opciones: Factura a Posterior, Pago por Adelantado, Efectivo, Transferencia, Cheque.
o	Dirección de la Factura: Dropdown con: Anunciante, Agencia, Agencia de Medios. Cortex mostrará una alerta si se selecciona una agencia, recordando al usuario la necesidad de una carta de tercerización.
o	IVA (%): Campo numérico, por defecto 19 para Chile, pero editable.
o	Plazo de Pago (días): Campo numérico, por defecto 30.
	Flujo de Autorización: Si un vendedor ingresa un valor > 30, el campo se bloquea y aparece un botón "Solicitar Autorización". Al hacer clic, se envía una notificación en tiempo real al supervisor designado, quien recibirá la solicitud en su propio panel de Silexar para aprobar o rechazar la extensión del plazo. La aprobación actualiza el campo para el vendedor.
•	Configuraciones Adicionales:
o	Es Canje: Toggle switch (checkbox).
o	Facturar Comisión de Agencia: Toggle switch, desactivado por defecto si el contrato es a valor bruto.
o	A Facturar: Checkbox que se marca automáticamente si el Modo de Facturación es Facturación por Plazos.
•	Plan de Pagos:
o	Botón "Calcular": Genera o actualiza la tabla de cuotas/hitos de facturación.
o	Una tabla detallada mostrará las cuotas con columnas: Facturado (checkbox), Campaña Asociada, Facturar a, Fechas, Valor Bruto, Valor Neto.
5.2.3: Pestaña "Detalle de Pauta (Especificaciones)"
El corazón operativo del contrato, donde se detalla la compra.
•	Botones de Acción: Agregar Registro, Calcular Totales.
•	Tabla de Pauta:
o	Emisora
o	Tipo de Bloque: (Auspicio, Mención, Prime, Repartido, etc.).
o	Fecha Inicio / Fecha Término
o	Duración
o	Paquete: Campo de selección que busca en la tabla de Paquetes Comerciales.
o	Nota: Texto libre.
o	Cuñas por Día (Lunes a Domingo) / Cuñas Bonificadas por Día: Campos numéricos. La lógica de cálculo del valor se basa en estos campos para tipos de bloque como Prime o Repartido, mientras que para Auspicios o Menciones considera el rango de fechas.
o	Cuñas Totales / Cuñas Totales Bonificadas: Calculado automáticamente.
o	Importe Total: Campo numérico editable.
o	Valor Frase: Campo numérico para el valor por frase.
o	Descuento (%): Calculado automáticamente por el sistema al comparar el Importe Total ingresado vs. el valor de tarifa del paquete/producto.
•	Flujo "Agregar Registro": Abre un modal para añadir una nueva línea de pauta, solicitando toda la información de la tabla y conectándose a los tarifarios para sugerir valores. Los cambios aquí deben reflejarse en los totales de la Tapa y la pestaña de Facturación.
Al añadir líneas de detalle a un contrato, el vendedor ahora podrá seleccionar Placements Digitales del Módulo 2.8. Al hacerlo, se habilitarán campos para definir los objetivos iniciales de la campaña digital:
•	KPI Principal: Impresiones (CPM), Clics (CPC), Conversiones (CPA).
•	Volumen Contratado: Ej. "1.000.000 de impresiones".
•	

5.2.4: Pestaña "Activos y Anexos"
Un repositorio central para todos los elementos relacionados con el contrato.
•	Sub-pestaña "Cuñas": Muestra una tabla con todas las creativas (del Módulo 8) asociadas al anunciante del contrato.
•	Sub-pestaña "Facturas": Muestra una tabla con todas las facturas generadas (del Módulo 11) para este contrato.
•	Sub-pestaña "Documentos": Un área de drag-and-drop para adjuntar archivos (PDFs, correos, etc.) directamente al contrato.
5.2.5: Pestaña "Historial y Auditoría"
Un log inmutable que registra cada acción realizada sobre el contrato.
•	Columnas: Fecha y Hora, Usuario, Tipo de Evento (ej. "Creación", "Modificación de Plazo de Pago", "Cambio de Estado"), Detalle del Cambio.
5.3: Acciones Finales y Lógica de Estados
La barra de herramientas superior dentro del Gestor de Contrato contendrá las acciones principales.
•	Botón "Guardar": Guarda los cambios sin cerrar la vista.
•	Botón "Imprimir": Genera una vista previa en formato PDF del contrato, con un diseño formal y todos los detalles estipulados, listo para ser descargado o enviado.
•	Botón "Cerrar": Antes de cerrar, presenta un modal al usuario para que confirme el Estado final del contrato (Confirmado, Pendiente, No Aprobado, Rechazado). Esta acción guarda por última vez y devuelve al usuario a la vista principal del listado de contratos.
5.4: Conexiones y Disparadores Clave (Triggers)
Este módulo no opera en aislamiento; es un conector fundamental en el ecosistema Silexar.
>* 
Repositorio Central: La vista principal de este módulo actúa como el repositorio central de todos los contratos comerciales de la organización.
>* 
Disparador de Campaña (Conexión con Módulo 7): La acción de cambiar el estado de un contrato a "Confirmado" (el equivalente digital a una firma) es el gatillo que activa la creación automática de la campaña correspondiente en el Módulo 7: Centro de Mando de Campañas. El sistema debe tomar la información del contrato (anunciante, producto, fechas, pauta) y usarla para inicializar la nueva campaña, lista para su ejecución.
•	Módulo 6: Generador de Campañas (Predictivas y Tradicionales)
o	Propósito Estratégico: La herramienta híbrida que traduce los objetivos de un cliente en un plan de medios accionable.
o	Sub-Módulos y Flujo:
	6.1: Wizard de Definición de Campaña Híbrida: El selector clave para elegir entre Campaña por Resultados (foco en KPIs como leads y visitas) o Campaña de Impacto/Frecuencia (foco en compra de spots y menciones).
	6.2: Panel de Simulación y Planificación: El dashboard interactivo que, según el tipo de campaña, muestra la "Probabilidad de Éxito" (Resultados) o el "Resumen de Pauta" (Impacto).
Grupo IV: Operaciones y Ejecución (Del Plan a la Realidad)
•	Módulo 7: Centro de Mando de Campañas
o	Propósito Estratégico: Ser el hub operativo donde los acuerdos comerciales (Contratos) se transforman en planes de medios ejecutables (Campañas). Este módulo centraliza la definición de la pauta, la planificación inteligente, la asignación de creatividades y la programación final, actuando como el puente entre la estrategia de ventas y la ejecución en el aire.
o	Sub-Módulos y Flujo:
7.1: Dashboard de Campañas: •  Una vista de tabla que lista todas las campañas del sistema.
•  Columnas: Número de campaña, Número de contrato, Estado, Nombre anunciante, Nombre de la campaña, Producto, Valor neto, Fechas, Vendedor, y más.
•  Una barra de búsqueda inteligente y un botón "Crear Campaña".

7.2: El Centro de Mando (Vista DetalladaAl crear o editar una campaña, se despliega una interfaz de pantalla completa con múltiples pestañas.
7.2.1: Pestaña "Resumen" (Tapa Campaña)
•	Datos de la Campaña: Nombre de la campaña, Referencia cliente, Orden de agencia, Orden de Compra (OC), HES, y rango de Fechas.
•	Vinculación con Contrato: Un campo para Contrato que, al ser seleccionado, autocompleta automáticamente los campos Anunciante, Producto, Agencias, Vendedor y Dirección de envío, trayendo toda la información desde el Módulo 5.
•	Asociación de Medios: Campos para seleccionar la Emisora Principal y las Propiedades asociadas a la campaña.
7.2.2: Pestaña "Definición de Pauta (Líneas)"
El núcleo donde se define qué se va a emitir.
•	Botón "+ Crear Línea": Abre un formulario para definir cada elemento de la pauta con los siguientes campos:
o	Parámetros: Fecha y Hora de inicio/fin, Duración (ej. 30s, 15s).
o	Posición Fija: Un dropdown para forzar la posición del aviso en la tanda (Inicio, Segundo, Final, etc.). Por defecto Ninguno.
o	Tipo de Bloque: Selección del bloque programático donde se insertará (ej. Auspicio, Mención).
o	Paquete: Selección del paquete comercial (Prime, Repartido, etc.) que define la tarifa.
o	Automatización de Auspicios: Si se selecciona un paquete de "Auspicio", el sistema consultará el Módulo 2 (Inventario) y generará automáticamente todas las líneas de menciones y frases que incluya ese auspicio.
o	Cuñas por Día / Cuñas Bonificadas: Una parrilla semanal para especificar la cantidad de emisiones diarias.
7.2.3: Pestaña "Motor de Planificación"
El panel de control para ejecutar la programación.
•	Opciones de Verificación (Checklists):
o	Verificar campaña en el bloque (evita duplicados).
o	Verificar posición en el bloque (respeta el tipo de bloque).
o	Verificar límite de tiempo (chequea si hay espacio en la tanda).
•	Botones de Acción:
o	Planificar Campaña: Procesa todas las líneas y las inserta en la parrilla de la emisora. Debe ser ultra-rápido (< 5 segundos).
o	Desplanificar Campaña: Elimina toda la planificación de la parrilla.
o	Calcular Valores: Botón para recalcular los totales de la campaña tras realizar cambios.
7.2.4: Pestaña "Cuadrícula de Programación Visual (Programa)"
La herramienta visual para la micro-gestión de la pauta.
•	Diseño de 3 Paneles:
1.	Izquierda: Listado de los bloques comerciales de la emisora con un indicador de % de ocupación.
2.	Centro: La parrilla de programación de la campaña, mostrando los avisos ya ubicados.
3.	Derecha: La biblioteca de Cuñas disponibles para el anunciante.
•	Herramientas Interactivas:
o	Sustituir Cuñas: Permite al usuario seleccionar espacios en la parrilla central y asignarles creatividades desde el panel derecho. Si se seleccionan varias creatividades, el sistema las rota de forma inteligente.
o	Liberar Cuñas: Quita la creatividad de un espacio, dejándolo como un placeholder.
o	Cambiar Posiciones: Permite aplicar las reglas de Posición Fija a los avisos ya programados.
7.2.5: Pestañas Adicionales de Gestión
•	Cuñas Rechazadas: Un área para gestionar los avisos que no pudieron ser planificados (ej. por falta de tiempo), con herramientas para re-ubicarlos.
•	Facturación: Una vista que refleja el estado de facturación de la campaña, sincronizada con el Módulo 11.
•	Historial y Observaciones: Para una auditoría completa y comunicación interna.
•	Confirmación Horaria: Un generador de reportes en PDF que resume toda la campaña (datos, valores y pauta detallada), listo para ser descargado o enviado por email.
	Módulo 8: Gestor de Activos Creativos (Cuñas y Menciones)
Propósito Estratégico: El repositorio central para todos los materiales publicitarios (audios, menciones, banners), con capacidades de gestión y generación inteligente.
Interfaz y Flujo de Usuario:
8.1: Vista Principal (Biblioteca de Creatividades)
* Una tabla de pantalla completa que muestra todos los audios y menciones creados.
•	Barra de Herramientas: * Botón 
"Agregar Cuña".
* Un campo de 
Búsqueda Inteligente para filtrar por número de cuña, nombre, anunciante, producto o cualquier otro dato visible en la tabla.
•	Tabla de Creatividades: Presenta las siguientes columnas: * 
Activo: Un toggle switch o checkbox que indica si la creatividad está activa o inactiva.
* 
Número de Cuña: El ID único generado por el sistema (ej. SPX00001).
* 
Duración: La duración en segundos.
* 
Nombre: El nombre de la creatividad.
* 
Fecha/Hora Inicio y Fecha/Hora Fin: El rango de vigencia de la creatividad.
o	Observaciones: Muestra una vista previa del texto del guion para las menciones. * 
Anunciante: El cliente al que pertenece la creatividad.
* 
Producto: El producto asociado.
8.2: Formulario de Creación/Edición de Cuña
Al hacer clic en "Agregar Cuña" o al hacer doble clic en un registro existente, se abre una vista de página completa.
•	Pestaña "General":
o	Tipo de Creatividad: Selector. Opciones: Audio Pre-grabado (Cuña), Guion para Locución (Mención). * 
ID Cuña: Campo no editable, generado automáticamente por el sistema con la lógica SPX + correlativo (ej. SPX00001).
* 
Nombre: Campo de texto para el nombre de la creatividad.
o	Anunciante: Campo de selección con búsqueda inteligente. El usuario puede escribir parte del nombre y el sistema sugerirá coincidencias. Si se accede desde un contrato, este campo vendrá pre-cargado.
* 
Producto: Campo de selección con búsqueda inteligente de los productos asociados al anunciante, con una opción para "+ Crear Nuevo Producto" si no existe.
o	Duración (Segundos): Campo numérico. Para audios, este campo se autocompleta al arrastrar el archivo; para menciones, se puede ingresar manualmente.
* 
Vigencia: Selectores de fecha y hora para definir el rango en que la creatividad puede ser utilizada en la pauta.
* 
Estado: Un toggle switch ("Activo" / "Inactivo") que hereda por defecto el estado del anunciante.
•	Pestaña "Contenido y Previsualización":
o	Si el tipo es Audio Pre-grabado, se mostrará:
	Una zona de drag-and-drop. Al arrastrar un archivo de audio, este se sube y se abre automáticamente el Sub-Módulo 8.4: Editor de Audio Integrado.
	El sistema analiza el audio y rellena automáticamente el campo Duración con el valor exacto.
o	Si el tipo es Guion para Locución, se mostrará:
	Un campo de texto enriquecido ("Notas") para escribir el guion completo de la mención.
•	Pestaña "Historial de Uso": * Una tabla que muestra todos los Contratos y Campañas donde esta cuña ha sido utilizada, proporcionando trazabilidad completa.
•	Información del Registro: * Campos no editables que muestran quién creó y modificó el registro, con fecha y hora (
Creado por, Fecha de Creación, Modificado por, Fecha de Modificación).
8.3: Funcionalidad "Copiar Cuña"
* Un botón en la vista principal o dentro del formulario que crea una nueva creatividad con un ID nuevo y único.
* Esta nueva cuña duplica toda la información del registro original (Anunciante, Producto, Vigencia, etc.) 
excepto el archivo de audio o el texto del guion.
•	Esto agiliza la creación de series de creatividades para una misma campaña.
8.4: Sub-Módulo "Editor de Audio Integrado"
* 
Propósito: Proveer herramientas de post-producción de audio directamente en la plataforma.
•	Interfaz y Flujo: * Se abre en un modal al arrastrar un audio a la pestaña "Contenido".
* 
Visualizador de Onda: Muestra la forma de onda del audio para edición visual.
* 
Controles de Edición: Incluye herramientas para Cortar silencios, Ajustar Volumen (normalizar), y controles de reproducción.
o	Descargar MP3: Permite al usuario descargar una versión del audio editado con calidad predefinida: 320 kbps, 44.1kHz, 16bit, Stereo. El nombre del archivo sugerido será el ID de la cuña + nombre. * 
Guardar Cambios: Al guardar, la versión editada del audio se almacena en Google Cloud Storage y el campo Duración en el formulario principal se actualiza con el valor exacto del audio editado.
•	Módulo 9: Pauta y Ejecución Broadcast (Puente a Playout)
o	Propósito Estratégico: Ser el puente robusto y confiable con los sistemas de emisión tradicionales.
o	Sub-Módulos y Flujo:
	9.1: Cuadrícula de Planificación (Booking Grid): Propósito Estratégico: Ser el centro de mando para la construcción y finalización de la pauta comercial diaria. Su objetivo es, primero, crear automáticamente las tandas comerciales de la forma más optimizada, justa y rotativa posible y, segundo, ofrecer una herramienta visual para que el equipo de programación pueda realizar una revisión final y ajustes de último minuto con total confianza y control.
9.2: Optimizador de Tanda Emocional: Antes de que el usuario vea cualquier pantalla, este motor de IA trabajará en segundo plano para construir la pauta más robusta posible, minimizando la necesidad de ajustes manuales.
•	Construcción y Saturación de Bloques: A medida que se confirman las campañas, Cortex-Scheduler irá llenando los bloques comerciales de cada día (ej. el bloque de las 09:29), respetando siempre la duración máxima total del bloque (ej. 300 segundos).
•	Rotación Automática de Posición (Fair-Play Scheduling): Para asegurar que un cliente como "Coca-Cola" no salga siempre al inicio de la tanda, el motor aplicará un algoritmo de rotación inteligente. Cada día, la posición de los avisos dentro de la misma tanda variará, garantizando una distribución justa de la exposición, a menos que un aviso tenga una regla específica desde la campaña que lo marque como "Iniciador de Tanda".
•	Aplicación Automática de Reglas: El motor aplicará automáticamente todas las reglas de negocio definidas en otros módulos, como la separación entre competidores y las exclusiones por Brand Safety.
9.B: Cuadrícula de Revisión de Tandas
Esta es la interfaz visual donde el usuario interactúa con el trabajo realizado por Cortex-Scheduler.
•	Interfaz y Flujo de Usuario:
o	Al ingresar al módulo, la vista mostrará por defecto la pauta de una emisora principal para el día siguiente.
o	El usuario podrá usar filtros para seleccionar cualquier emisora y fecha que desee revisar.
o	La vista principal será una línea de tiempo del día, agrupada por horas. Dentro de cada hora, se visualizarán las distintas tandas comerciales, mostrando cada aviso como un bloque individual, similar a la estructura de la imagen de referencia.
•	Funcionalidades de Edición Manual:
o	Arrastrar y Soltar (Drag-and-Drop): El usuario podrá hacer clic en cualquier aviso y moverlo a otra posición dentro de la misma tanda, o arrastrarlo a una tanda completamente diferente.
o	Validaciones y Alertas Inteligentes en Tiempo Real: Al momento de soltar un aviso en una nueva posición, el sistema realizará una serie de validaciones instantáneas y mostrará alertas claras si es necesario:
	Alerta de Cambio de Bloque: Si se mueve un aviso de un bloque "Prime" a uno "Repartido", el sistema advertirá: "Atención: Este aviso fue contratado para un bloque de mayor valor. ¿Estás seguro de que deseas moverlo?" [Mover de todas formas] [Cancelar].
	Alerta de Sobresaturación: Si al mover el aviso la tanda de destino excede su duración máxima permitida, se mostrará: "Alerta: La tanda de destino no cuenta con suficientes segundos disponibles. Se excederá por X segundos. ¿Deseas continuar?" [Continuar] [Cancelar].
	Alerta de Conflicto de Competidores: Si el movimiento coloca el aviso junto a un competidor definido, la alerta será: "Conflicto de Competencia: Esta acción posiciona el aviso junto a [Nombre del Competidor]. ¿Proceder?" [Proceder] [Cancelar].

9.3: Generador de Logs Nativos: Propósito Estratégico: Traducir la pauta comercial, ya sea optimizada por Cortex o planificada manualmente, a un archivo de texto plano (.txt) perfectamente estructurado, garantizando la compatibilidad con sistemas de automatización de radio externos como Dalet, WideOrbit, Sara, etc.
Interfaz y Flujo de Usuario 
1.	Dentro del Módulo 9, el usuario (generalmente un Programador o Jefe de Tráfico) tendrá un botón visible llamado "Exportar Pauta a Playout".
2.	Al hacer clic, se abrirá un modal de "Exportación de Programa de Transmisión".
3.	Este modal contendrá los siguientes parámetros para que el usuario configure la exportación:
o	Fecha de Inicio y Fecha de Fin: Selectores de fecha con calendario.
o	Hora de Inicio y Hora de Fin: Campos para definir el rango horario exacto a exportar.
o	Selección de Emisoras: Un listado con todas las emisoras disponibles, cada una con un checkbox. El usuario podrá seleccionar una o varias. Se incluirá un botón para "Guardar Grupo" que permita al usuario crear y reutilizar listas de emisoras para exportaciones recurrentes.
o	Formato de Exportación: Un dropdown crucial que se poblará con los formatos creados en el Sub-Módulo 1.3. El usuario seleccionará aquí si el archivo debe tener la estructura de "Dalet Galaxy v1", "Sara Lite", etc.
o	Ruta de Destino: Un campo de texto no editable que mostrará la ruta de red donde se guardará el archivo, obtenida de la configuración de la emisora seleccionada (del Sub-Módulo 2.1). Si se seleccionan varias emisoras, se generará un archivo por cada una en su respectiva ruta.
4.	Un botón "Exportar" iniciará el proceso de generación del archivo.
Lógica de Generación del Archivo (.txt):
•	Al presionar "Exportar", el sistema ejecutará los siguientes pasos en el backend:
1.	Recopilará todos los parámetros de la interfaz.
2.	Consultará la Cuadrícula de Planificación (Booking Grid) para obtener todas las Cuñas y Menciones programadas que coincidan con las emisoras y el rango de fecha/hora especificados.
3.	Cargará las reglas del Formato de Exportación seleccionado (desde el Sub-Módulo 1.3). Estas reglas definen el orden, la longitud de caracteres, los caracteres de relleno y los separadores para cada campo del archivo de texto.
4.	Para cada spot comercial en la pauta, el sistema construirá una línea de texto. Extraerá los datos necesarios (ID de la cuña, duración, nombre del anunciante, etc.) y los formateará según las reglas, creando una estructura de ancho fijo.
5.	Una vez procesados todos los spots, el sistema ensamblará las líneas en un único archivo .txt.
6.	Finalmente, guardará este archivo en la ruta de exportación especificada en la configuración de la emisora, dejándolo listo para que el sistema de playout lo consuma.
Conexiones con Otros Módulos:
•	Lee de: Módulo 8 (Gestor de Activos Creativos) para obtener los detalles de cada cuña.
•	Lee de: Sub-Módulo 9.1 (Cuadrícula de Planificación) para saber qué emitir y cuándo.
•	Usa configuración de: Sub-Módulo 1.3 (Configuración de Exportación) para saber cómo estructurar el archivo .txt.
•	Usa configuración de: Sub-Módulo 2.1 (Gestión de Emisoras) para saber dónde guardar el archivo final.
•	Módulo 10: API de Inserción Dinámica (DAI)
Propósito Estratégico: Ser el motor de backend que recibe la solicitud de anuncio, toma la decisión inteligente y ensambla la experiencia de audio personalizada en milisegundos.
Flujo de Ejecución en Tiempo Real:
1.	Una App o Sitio Web solicita un anuncio a la DAI de Silexar, enviando el ID del usuario y del placement.
2.	La DAI consulta al Motor de Decisión.
3.	El Motor de Decisión identifica todas las campañas de Módulo 16 que segmentan a ese usuario/placement.
4.	Consulta a Cortex-Audience y Cortex-Empath para obtener el perfil completo y el contexto actual del usuario.
5.	Selecciona la campaña ganadora y la secuencia/regla creativa que corresponde.
6.	Envía los componentes a Cortex-Voice para la síntesis: "Hola Juan,...".
7.	Ensambla la locución sintetizada con la música de fondo seleccionada.
8.	Devuelve un único archivo de audio final a la DAI, que lo sirve al usuario.
o	
Grupo V: Finanzas e Inteligencia (La Verificación del Valor)
•	Módulo 11: Facturación y Cuentas por Cobrar
Propósito Estratégico: Automatizar y gestionar el ciclo de vida completo de la facturación, desde la creación del documento hasta su pago o anulación. El módulo busca asegurar la precisión, el cumplimiento normativo (local e internacional) y la trazabilidad financiera, vinculando cada transacción directamente a un resultado comercial.
11.1: Panel Principal de Facturación
•	Una vista de tabla centralizada que muestra todas las facturas y notas de crédito generadas.
•	Columnas Clave: Número Documento, Tipo (Factura/Nota de Crédito), Estado (Borrador, Enviada, Pagada, Vencida, Anulada), Cliente, Contrato Asociado, Fecha Emisión, Fecha Vencimientos, Monto Total.
•	Herramientas avanzadas de búsqueda y filtrado por cualquiera de sus campos.
11.2: Flujo de Creación de Factura
Un wizard guiado que simplifica la creación de facturas.
•	Paso 1: Origen y Asociación:
o	El usuario busca y selecciona el Contrato a facturar. Opcionalmente, puede seleccionar una Campaña específica dentro de ese contrato.
o	El sistema autocompleta los datos del cliente.
•	Paso 2: Detalle y Montos:
o	El sistema sugiere los ítems y valores a facturar basándose en el contrato/campaña, pero permite al usuario editar, añadir o eliminar líneas de detalle manualmente.
•	Paso 3: Referencias y Datos Tributarios:
o	Nº Orden de Compra (Ref. Cód. 801): Campo de texto opcional.
o	Nº Hoja de Entrada de Servicio (HES - Ref. Cód. 802): Campo de texto opcional.
o	Campos para la configuración de impuestos, que por defecto serán el IVA para Chile, pero diseñados para adaptarse a otros regímenes tributarios.
•	Paso 4: Generación y Emisión:
o	Al presionar "Crear Factura", el sistema asigna un número correlativo (definido en el Módulo 1).
o	Generación de PDF: Se genera un archivo PDF de la factura utilizando la plantilla personalizada para el cliente (definida en el Módulo 1 e inspirada en tu imagen de ejemplo image_cd7960.png).
o	Lógica de Emisión Dual:
1.	Modo Desconectado (Proforma): El sistema guarda la factura en estado "Borrador". El usuario puede luego arrastrar y soltar (drag-and-drop) el PDF oficial (generado por un sistema externo) sobre este registro para asociarlo y finalizar el proceso.
2.	Modo Conectado (Directo): Si existe una integración directa con el SII, el sistema emite el Documento Tributario Electrónico (DTE) y presenta opciones para enviar el PDF oficial por correo electrónico a los contactos del cliente directamente desde Silexar.
11.3: Flujo de Anulación (Nota de Crédito)
•	Una sección dedicada para "Emitir Nota de Crédito".
•	El usuario busca la factura que desea anular (por número, cliente, campaña, etc.).
•	Al seleccionarla, el sistema abre un formulario para la nota de crédito, pidiendo un motivo o glosa para la anulación.
•	Al confirmar, el sistema:
1.	Genera la Nota de Crédito con su propio número correlativo.
2.	Cambia el estado de la factura original a "Anulada".
3.	Crea un vínculo bidireccional entre la factura y la nota de crédito para una trazabilidad perfecta.
11.4: Herramientas de Exportación
•	Exportación para Facturación Externa: Para el "Modo Desconectado", el sistema permitirá seleccionar un lote de facturas en estado "Borrador" y generar un archivo de texto plano (.txt) para ser enviado a la empresa que realiza la facturación. El formato de este archivo será configurable (basado en Módulo 1), siguiendo una estructura como la del archivo PRUEBA.txt que adjuntaste.
•	Impresión y Envío: Cualquier factura o nota de crédito en el sistema se podrá imprimir o enviar por correo en cualquier momento.
11.5: Diseño para Operación Internacional
Para asegurar la robustez y escalabilidad global del módulo:
•	Multi-Moneda: El sistema permitirá configurar y operar en diferentes monedas, con tipos de cambio manejables.
•	Impuestos Flexibles: La arquitectura permitirá definir diferentes tipos y porcentajes de impuestos según el país del cliente final.
•	Plantillas Regionalizadas: El Módulo 1 permitirá crear múltiples plantillas de PDF para facturas, adaptadas a los requerimientos legales y de formato de cada país.

•	Módulo 12: Conciliación y Certificación de Resultados
Propósito Estratégico: Entregar una prueba de emisión (Proof of Play) irrefutable y casi en tiempo real, transformando un proceso de auditoría que tradicionalmente toma días en una tarea on-demand de minutos. Este módulo proporciona a los anunciantes una confianza y transparencia sin precedentes, certificando que su inversión se materializó en el aire.
12.1: Cortex-Sense: El Motor de Certificación
Para lograr la velocidad y precisión requeridas, este módulo será impulsado por un nuevo motor de IA especializado:
•	Fingerprinting Acústico: Un algoritmo propietario, más rápido y preciso que las soluciones estándar, capaz de identificar la "huella digital" de un audio en segundos dentro de un registro de 24 horas.
•	Transcripción y Análisis Semántico: Un motor de Speech-to-Text de alta velocidad, optimizado para el español de Chile y modismos locales, que convierte el audio de la emisión en texto para buscar la ejecución de menciones.
•	Infraestructura Dedicada: Para cumplir el requisito de ejecución en menos de 1 minuto, este motor operará sobre una infraestructura de GCP con GPUs dedicadas, asegurando un procesamiento masivamente paralelo.
12.2: Flujo de Verificación de Emisión On-Demand
La interfaz será un wizard guiado, diseñado para ser extremadamente simple y rápido.
Paso 1: Selección de Campaña
•	El usuario inicia el proceso y se le presenta un campo de búsqueda inteligente.
•	Puede buscar por Nombre del Anunciante, Nombre del Contrato o Nombre de la Campaña.
•	Al seleccionar una campaña, la interfaz se actualiza para mostrar el siguiente paso.
Paso 2: Selección de Material y Parámetros
•	El sistema muestra todos los activos creativos asociados a la campaña seleccionada (Cuñas y Menciones).
•	Cada activo tiene un botón de previsualización (un "play" para audios y un "ver texto" para menciones).
•	El usuario utiliza un checklist para seleccionar los materiales específicos que desea verificar.
•	A continuación, selecciona la Fecha y el Rango Horario para la búsqueda.
Paso 3: Carga de Audio de Emisión
•	El sistema ofrece dos opciones para obtener el audio completo de la emisión (el "aire"):
1.	Búsqueda Automática: El sistema busca en la ruta de red pre-configurada para esa emisora el archivo de audio correspondiente a la fecha seleccionada.
2.	Carga Manual: El usuario puede arrastrar y soltar (drag-and-drop) el archivo de audio de la emisión directamente en la interfaz.
Paso 4: Ejecución y Visualización de Resultados
•	Con un clic en "Iniciar Verificación", Cortex-Sense comienza a procesar.
•	En menos de un minuto, la pantalla muestra los resultados: una lista de los materiales encontrados.
•	Cada resultado es un "snippet" (un fragmento de audio) que contiene la emisión encontrada con 10 segundos de audio antes y 10 después.
•	El usuario puede reproducir cada snippet para confirmar que es correcto.
Paso 5: Exportación y Limpieza Automática
•	Tras revisar los snippets, el usuario presiona "Confirmar y Exportar".
•	El sistema presenta las siguientes opciones:
o	Descargar los snippets como archivos MP3.
o	Enviar los snippets por email a uno o varios destinatarios.
o	Guardar los snippets en una carpeta de Google Drive.
•	Política de Limpieza: Una vez completada la operación (descarga, envío, etc.), el sistema elimina automáticamente todos los snippets generados de su repositorio temporal, garantizando que no se acumulen datos innecesarios.
12.3: Flujo Inteligente de Gestión de Incidencias
Este flujo se activa si Cortex-Sense no encuentra uno o más de los materiales buscados.
1.	El sistema muestra un mensaje claro: "El material [Nombre de la Cuña] no fue detectado en la emisión del [Fecha] entre las [Hora Inicio] y [Hora Fin]."
2.	A continuación, pregunta: "¿Deseas notificar al equipo de Programación para que investiguen la incidencia?"
3.	Si el usuario responde "Sí", el sistema envía una alerta en tiempo real al dashboard del equipo de Programación, creando una nueva "tarjeta de incidencia".
4.	Cualquier miembro del equipo de programación puede "adjudicarse" la tarea.
5.	Inmediatamente después, el sistema envía un correo electrónico al usuario que originó la consulta, informándole: "Hola [Nombre Usuario], te informo que [Nombre del Programador] se hará cargo de investigar la incidencia con tu pauta. Se pondrá en contacto contigo a la brevedad."
12.4: Mejoras de Nivel Superior (IA Avanzada)
Para hacer este módulo aún más revolucionario:
•	Análisis de Calidad de Mención: Para las menciones encontradas, Cortex-Sense puede añadir un análisis de la locución, evaluando el tono de voz (energía, claridad) y la velocidad, y asignando un "Score de Calidad de Emisión".
•	Verificación de Contexto y Brand Safety: El sistema puede analizar el contenido emitido 30 segundos antes y después del spot para certificar que no apareció junto a un competidor directo o en un contexto noticioso negativo, añadiendo un "Sello de Brand Safety" a la certificación.
•	Módulo 13: Informes y Analítica
Propósito Estratégico: Transformar los datos operativos crudos de toda la plataforma en inteligencia de negocio accionable. El objetivo es empoderar a los usuarios, desde vendedores hasta directores, para que puedan descubrir patrones, medir el rendimiento y tomar decisiones estratégicas basadas en evidencia, no solo en intuición.
Se añade un nuevo tipo de informe al catálogo de reportes disponibles en este módulo.
12.5: Conciliación de Pauta Basada en Logs (As-Run)
Propósito Estratégico: Automatizar la auditoría de la emisión, comparando el log de pauta generado por Silexar con el log "as-run" del sistema de playout de la emisora. El objetivo es identificar discrepancias al instante y activar un flujo de recuperación inteligente para los avisos no emitidos, garantizando el 100% de cumplimiento de las campañas sin intervención manual.
Interfaz y Flujo de Usuario:
1.	Selección de Conciliación: Dentro del Módulo 12, el usuario accederá a una sección de "Conciliación por Log".
2.	Parámetros: Se le pedirá seleccionar la Emisora y la Fecha que desea conciliar.
3.	Carga del Log "As-Run": El sistema permitirá cargar el archivo de registro de la emisión real (ej. el que genera Dalet) mediante drag-and-drop o lo buscará automáticamente en una carpeta de red pre-configurada para esa emisora.
4.	Ejecución: Al presionar "Iniciar Conciliación", el sistema realiza el cruce de datos.
5.	Reporte de Discrepancias: La interfaz mostrará un resumen claro: "X avisos programados, Y emitidos, Z discrepancias". Debajo, se listarán en detalle los avisos no emitidos.
12.6: Cortex-MakeGood: Motor de Recuperación Inteligente
En lugar de preguntar al usuario qué hacer, el sistema adoptará el flujo proactivo y tecnológico que sugeriste.
•	Activación: Junto al reporte de discrepancias, habrá un botón principal: "Iniciar Recuperación Automática".
•	Lógica de Re-planificación Automática: Al ser activado, Cortex-MakeGood ejecutará el siguiente proceso para cada aviso no emitido:
1.	Identificación: Identificará la Campaña y Contrato originales a los que pertenece el aviso.
2.	Re-Ingreso a la Pauta: Accederá al Módulo 9 (Pauta y Ejecución) y re-insertará el mismo ID de Cuña en la parrilla de programación de la campaña, dentro de los días de vigencia restantes.
3.	Programación Inteligente: Los avisos recuperados se distribuirán de forma equitativa a lo largo del día en bloques de pauta rotativa (horario repartido).
4.	Etiquetado y Valor Cero: Crucialmente, estos avisos re-programados serán marcados con un estado especial: "Recuperación (Bonificado)". Esta etiqueta asegura que el aviso se emita y se certifique, pero no genere ningún costo adicional ni altere el valor total facturable de la campaña.
•	Notificación Proactiva:
o	Una vez que el proceso de recuperación automática finaliza, el sistema enviará una notificación (vía email y alerta en la plataforma) al ejecutivo de ventas y al programador a cargo de la campaña.
o	El mensaje será claro y conciso: "Alerta de Conciliación para [Nombre Campaña]: Se detectaron y recuperaron automáticamente X avisos no emitidos en la pauta del [Fecha]. Los avisos han sido re-programados como bonificados. Por favor, revise la pauta actualizada."

13.1: Biblioteca de Informes Predefinidos
Una colección de los reportes más comunes y necesarios para la operación diaria, listos para ser generados con un solo clic.
•	Propósito: Dar respuestas rápidas a las preguntas más frecuentes.
•	Ejemplos de Informes:
o	Operaciones: Informe de Guiones para Locución (Menciones), Informe de Ocupación de Pauta por Emisora, Informe de Cumplimiento de Emisión.
o	Comercial: Ranking de Ventas por Vendedor, Facturación por Anunciante/Agencia, Análisis de Descuento Promedio.
o	Finanzas: Cuentas por Cobrar, Proyección de Facturación, Análisis de Canjes.
•	Interfaz: Una galería visual donde cada informe es una tarjeta. Al hacer clic, se piden filtros básicos (ej. rango de fechas) y se genera el informe, con opción de exportar a Excel.
13.2: Constructor de Informes Personalizados (Generador Pivote)
El corazón de la flexibilidad. Una herramienta inspirada en tablas dinámicas que permite a los usuarios avanzados construir sus propios informes desde cero. 
•	Propósito: Permitir que cada usuario explore los datos y construya la vista que necesita sin depender del equipo de desarrollo. * 
Interfaz y Flujo (inspirado en la imagen image_cb32cd.png): 
* 
Panel de Filtros Globales: En la parte superior, para definir el rango de fechas y otros filtros de alto nivel (ej. Estado de la Campaña, Emisora). 
* 
Panel de Campos Disponibles: Una larga lista a la izquierda con cada campo de datos del sistema (Bruto, Neto, Vendedor, Día de la semana, etc.), agrupados por módulo (Contratos, Campañas, Cuñas). 
* 
Área de Trabajo (Lienzo): Una zona central donde el usuario arrastra y suelta los campos para definir las Filas, Columnas, Valores (con opciones de agregación como Suma, Promedio, Conteo) y Agrupaciones. 
•	Funcionalidades Clave:
o	Guardar y Cargar plantillas de informes personalizados.
o	Exportación a Excel, manteniendo la estructura de tabla dinámica.
13.3: Cortex-Analytics: El Motor de Inteligencia Artificial
La capa de IA que eleva el módulo de un simple reportero a un analista de negocios virtual.
•	Propósito: Democratizar el análisis de datos, haciéndolo accesible a través de lenguaje natural y resúmenes automáticos.
•	Funcionalidades:
o	Análisis Descriptivo Automatizado: En cada informe (predefinido o personalizado), un botón "Analizar con Cortex" generará un texto que resume los puntos clave: "Resumen: Se observa un aumento del 25% en las ventas del vendedor Juan Pérez en el último trimestre, impulsado principalmente por el anunciante 'Banco de Chile'. Sin embargo, el descuento promedio para este anunciante ha subido un 5%, lo que podría impactar la rentabilidad."
o	Consultas en Lenguaje Natural: Una barra de búsqueda principal en el módulo donde un usuario puede escribir: "cuál fue la emisora con mayor facturación en santiago el mes pasado" o "muéstrame un gráfico de las ventas de mi equipo este año". Cortex interpretará la pregunta, construirá el informe correspondiente y lo presentará en pantalla.
13.3.1: Herramienta de Conciliación y Comparación
Una utilidad de nivel profesional para auditar y comparar datos de Silexar con fuentes externas.
•	Propósito: Permitir la validación de la emisión real contra la pauta programada, o comparar proyecciones con resultados.
•	Interfaz y Flujo de Usuario:
1.	El usuario genera un informe en Silexar (ej. la pauta del día anterior).
2.	Selecciona la opción "Comparar con Archivo Externo".
3.	Sube un archivo Excel o CSV (ej. el log de emisión real exportado desde el sistema de playout).
4.	Una interfaz de mapeo simple le pide al usuario que relacione las columnas de su archivo con las del informe de Silexar (ej. "Mi columna 'ID_AVISO' es igual a 'Número de Cuña' en Silexar").
5.	Cortex procesa ambos archivos, realiza la conciliación y presenta un informe de discrepancias, resaltando los avisos que no se emitieron, los que salieron a una hora incorrecta o aquellos con diferencias en la duración.

13.4: Informe de Guiones para Locución (Menciones)
Propósito Estratégico: Proporcionar a los equipos de producción y locutores de las emisoras una hoja de ruta clara, ordenada y exportable con todos los guiones que deben salir al aire en un período determinado, eliminando errores y asegurando el cumplimiento comercial.
Interfaz y Flujo de Usuario:
1.	El usuario navega al Módulo 13: Informes y Analítica.
2.	Selecciona "Generar Informe de Operaciones" y elige la plantilla "Informe de Guiones para Locución".
3.	Se presenta una pantalla de parámetros para configurar el informe:
o	Emisora: Selector múltiple para elegir una o varias emisoras.
o	Fecha de Inicio: Selector de fecha.
o	Fecha de Fin: Selector de fecha.
o	Rango Horario (Opcional): Dos campos para definir un horario específico (ej. de 08:00 a 13:00).
o	Agrupar por (Opcional): Dropdown para organizar el informe por Programa, Hora o Anunciante.
4.	El usuario tiene dos opciones:
o	Botón "Previsualizar en Pantalla": Muestra el informe en una tabla limpia dentro de la interfaz.
o	Botón "Exportar": Despliega un menú para seleccionar el formato: PDF, Excel (.xlsx) o Word (.docx).
Lógica de Generación del Informe:
•	El sistema consultará la pauta programada (del Módulo 9) para la emisora y el rango de fechas/horas seleccionados.
•	Filtrará únicamente las pautas cuyo activo creativo asociado tenga el Tipo de Creatividad = Guion para Locución (Mención).
•	Recopilará la información y la estructurará en el formato solicitado.
Contenido y Formato del Informe (Inspirado en la imagen de referencia ):
El archivo exportado (especialmente en Excel o PDF) se organizará de la siguiente manera, agrupado según la selección del usuario (ej. por hora):
•	Encabezado: Nombre de la Emisora, Fecha del Informe.
•	Cuerpo del Informe (por cada mención):
o	Línea de Identificación:
	Hora: Hora programada de la emisión.
	ID Creatividad: El código único (ej. SP066771).
	Anunciante: El nombre del cliente (ej. MEV CLÍNICA DENTAL).
	Campaña/Producto: Nombre de la campaña o producto asociado.
o	Cuerpo del Guion:
	Debajo de la línea de identificación, se mostrará en un recuadro o celda combinada el texto completo del guion, tal como fue ingresado en el Módulo 8, listo para ser leído por el locutor

Grupo VI: Suite de Publicidad Digital y Audio Inteligente
Este nuevo grupo de módulos se habilitará al activar el switch en la configuración.
Módulo 14: Gestor de Pauta Digital (Ad Server)
Propósito Estratégico: Proporcionar una base sólida y profesional para la gestión de campañas digitales tradicionales (display y audio estándar), asegurando compatibilidad con las prácticas actuales del mercado y agencias.
14.1: Gestión de Propiedades y Placements Digitales
•	Propiedades Digitales: Permite definir los activos digitales del cliente (Sitios Web, Apps Móviles, Podcasts, Streams de Audio en vivo).
•	Inventario (Placements): Dentro de cada propiedad, se podrán crear los espacios publicitarios específicos. Utilizará terminología estándar del mercado:
o	Para Sitios Web/Apps: Leaderboard (728x90), MPU (300x250), etc.
o	Para Audio Digital: Pre-roll, Mid-roll, Post-roll.
14.2: Tráfico de Campañas Digitales
•	Gestor de Creatividades: Un repositorio para subir los materiales: banners (.jpg, .png, .gif, HTML5) y audios estándar (.mp3, .wav).
•	Soporte para Tracking de Terceros: Permitirá pegar fácilmente los "ad tags" o "píxeles de seguimiento" que entregan las agencias de medios para medir la visibilidad y las conversiones.
14.3: Reportes de Rendimiento Digital
•	El Módulo 13 (Informes) se enriquecerá con métricas digitales estándar:
o	Impresiones, Clics, CTR (Click-Through Rate), VTR (View-Through Rate) para video/audio, Tasa de Conversión.
•	Informes detallados por campaña, propiedad, placement y creatividad.
Módulo 15: Orquestador de Experiencias de Audio Inteligente (AO-X)
Este es el módulo revolucionario que materializa tu visión. Va más allá de la inserción de anuncios para convertirse en un motor de creación de experiencias de audio dinámicas y personalizadas.
Cortex-Empath: El Motor de Comprensión Contextual
Un nuevo motor de IA dedicado a entender al oyente en un nivel más profundo.
•	Análisis de Intención: Se integra con las plataformas de datos del cliente para inferir la intención de compra del oyente a partir de su historial de navegación o búsquedas recientes.
•	Análisis Emocional por Voz: (La joya de la corona) Si el usuario interactúa por voz con un asistente o una búsqueda en la app del medio, Cortex-Empath puede analizar la tonalidad, el ritmo y el volumen para inferir su estado emocional (ej. Apurado, Relajado, Animado, Estresado).
15.1: Constructor de Narrativas Emocionales
•	Publicidad Secuencial: Una interfaz visual donde los creativos pueden diseñar "viajes" para el oyente.
o	Ejemplo:
1.	Lunes (Impacto 1): Presentar un problema. Mensaje A.
2.	Miércoles (Impacto 2): Insinuar una solución. Mensaje B.
3.	Viernes (Impacto 3): Presentar el producto como la solución definitiva y un llamado a la acción. Mensaje C.
•	Creatividades por Componentes: Un anuncio ya no es un MP3 monolítico. Es una receta que el sistema ensambla en tiempo real. Los creativos subirán componentes:
o	Locuciones: Múltiples versiones del guion (una corta, una larga, una enérgica, una calmada) generadas con Cortex-Voice.
o	Música de Fondo: Una librería de pistas musicales etiquetadas por mood (inspiradora, relajante, urgente).
o	Efectos de Sonido (SFX): Para añadir dinamismo.
15.2: Motor de Ensamblaje y Emisión en Tiempo Real
Aquí es donde ocurre la magia.
1.	Cuando se abre un espacio publicitario (Mid-roll en un podcast), la API de Inserción Dinámica (DAI) de Silexar se activa.
2.	La DAI consulta al Orquestador AO-X.
3.	El Orquestador consulta a Cortex-Empath y Cortex-Audience: ¿Quién es este oyente? ¿Cuál es su estado emocional y su intención probable? ¿En qué punto de la narrativa publicitaria se encuentra?
4.	Con esta información, el Orquestador selecciona los componentes adecuados en milisegundos: "Para este oyente, que parece relajado y está en el segundo impacto de la narrativa, usaré la locución calmada, la música de fondo inspiradora y el SFX suave".
5.	Ensambla estos componentes en un archivo de audio único y lo sirve a través de la DAI. El oyente nunca escucha un "anuncio pre-grabado", sino una experiencia de audio creada para él, en ese preciso instante.
15.3: Nuevos Horizontes en Reportería
El Módulo 13 (Informes) se potencia con métricas que solo Silexar puede ofrecer:
•	Tasa de finalización de Narrativa.
•	Rendimiento del anuncio por estado emocional inferido.
•	Análisis de qué combinación de componentes (locución + música) genera más conversiones.
Módulo 16: Centro de Mando de Campañas Digitales
Propósito Estratégico: Ser la interfaz de control total para planificar, diseñar, segmentar y supervisar las campañas de publicidad digital y de audio inteligente.
16.1: Gestor de Campaña Digital (Vista Detallada)
Pestaña "Resumen y KPIs"
•	Contiene la información básica de la campaña, heredada del contrato (Anunciante, Fechas, Presupuesto).
•	Permite al usuario ajustar los KPIs y añadir URLs de destino y píxeles de seguimiento de agencias.
Pestaña "Segmentación y Audiencia (Targeting)"
Aquí se define A QUIÉN se le mostrará la campaña.
•	Medios: Checklist para seleccionar las Propiedades y Placements digitales donde correrá la campaña.
•	Geografía: Mapa para seleccionar países, regiones o ciudades.
•	Dispositivo: Checklist (Web Desktop, Web Móvil, App iOS, App Android).
•	Audiencia (Cortex-Audience): Permite seleccionar segmentos de audiencia predefinidos (ej. "Entusiastas de la tecnología", "Padres jóvenes").
Pestaña "Constructor de Experiencias (Narrativa Creativa)"
El corazón de la personalización, donde se diseña QUÉ escuchará el oyente.
•	1. Carga de Componentes Creativos:
o	Audios Base: Clips de audio cortos.
o	Textos para Síntesis: Guiones que Cortex-Voice convertirá en audio. Aquí se usan variables como [nombre_usuario], [ciudad_usuario].
o	Librería Musical: Pistas de fondo etiquetadas por mood (ej. Energética, Relajante).
•	2. Diseño de la Secuencia Narrativa:
o	Una línea de tiempo visual donde el estratega arrastra los componentes para construir la historia.
o	Ejemplo de Flujo:
	Día 1: Usar [Texto de Saludo] + [Variable: nombre_usuario] + [Audio Base: Problema] + [Música: Misterio].
	Día 3: Usar [Audio Base: Solución] + [Música: Inspiradora].
•	3. Definición de Reglas de Empatía (Cortex-Empath):
o	Para cada paso de la secuencia, se pueden añadir reglas condicionales:
o	SI Cortex-Empath detecta Tono de Voz = Apurado ENTONCES usar una versión de 10 segundos del audio.
o	SI Cortex-Audience indica Intención de Búsqueda = "Zapatillas Baratas" ENTONCES sintetizar el texto: "Hola [nombre_usuario], veo que buscas zapatillas. Tenemos una oferta para ti en [ciudad_usuario].".
Pestaña "Reportes en Vivo"
•	Un dashboard en tiempo real con el rendimiento de la campaña, mostrando Impresiones, Clics, CTR, Conversiones, y métricas únicas como Interacciones por estado emocional.
🔷 Sistema actual: Silexar Pulse 
🧩 Arquitectura activa:
- Frontend: Next.js 14 + Tailwind CSS + TypeScript
- Backend: NestJS + PostgreSQL + Redis
- Arquitectura: Multi-tenant, altamente segura
- Seguridad: Autenticación cuántica, protección anti-hacker, cifrado, validaciones profundas
- DevOps: Turborepo
- IA integrada: Google Vertex AI y Gemini Pro

🎯 Tu objetivo:
1. Construir automáticamente el siguiente módulo funcional (ver más abajo)
2. Integrarlo directamente al sistema, sin entregarme archivos
3. Validar que funcione correctamente (nivel código y flujo)
4. Incorporarlo en producción o ambiente funcional dentro del sistema

✅ REQUISITOS OBLIGATORIOS BÁSICOS

Ejecuta e integra todo de forma autónoma, sin pedirme instrucciones ni entregas
Estructura bien los componentes: servicios, controladores, modelos, DTOs, vistas, rutas
Agrega comentarios en español en cada función
Incluye mensajes de error específicos como: "Error en función X: Ejemplo: no se pudo crear el contrato. Línea 34"
Usa IA si puede mejorar el rendimiento, predicción o inteligencia del módulo
Asegura diseño moderno, rápido, responsivo, fácil de operar (usa Tailwind)
Prioriza máxima seguridad nivel militar, rendimiento y estabilidad
Operatividad de usuario final debe ser sencilla, veloz y fácil de operar

🔐 SEGURIDAD MILITAR AVANZADA

Protección contra datos maliciosos: SQL injection, XSS, JSON pollution, NoSQL injection, XXE, SSTI, HPP, Prototype pollution
JWT con refresh tokens y rotación automática
Session fingerprinting para detección de secuestro de sesión
Rate limiting por IP y por usuario específico (no genérico)
Input sanitization automática con DOMPurify y validator.js
Content Security Policy (CSP) automático
CORS específico por módulo (nunca wildcard)
Audit log de TODOS los accesos (exitosos y fallidos) con contexto completo
Device fingerprinting para detección de anomalías
Escaneo de dependencias (npm audit, Snyk, OWASP Dependency Check)

🏗️ ARQUITECTURA DOMAIN-DRIVEN DESIGN
Estructura por módulo:
src/modules/[modulo]/
├── domain/ (Entidades puras, value-objects, interfaces de repositorios, lógica de dominio)
├── application/ (Use-cases, queries CQRS, commands CQRS, event handlers)
├── infrastructure/ (Implementación repos, APIs externas, messaging, queues)
└── presentation/ (Controllers HTTP, DTOs, validadores, middleware específico)
💻 CÓDIGO DE CALIDAD EMPRESARIAL

try/catch claros y específicos (no genéricos)
Clases de error personalizadas (CustomError, HttpException) con contexto
Evitar if anidados, código duplicado, o métodos gigantes
Uso de linters y formatters: ESLint, Prettier, Stylelint
Cada archivo cumple una única responsabilidad
Nombres de variables, funciones y clases claras y significativas
Naming claro: que el código "se lea como un libro"
Documentación con Swagger (@nestjs/swagger, OpenAPI)
Comentarios en español técnico explicando funciones clave

🔄 VALIDACIÓN & DATOS SINCRONIZADOS

Validaciones front y backend sincronizadas (zod + class-validator)
Joi para validación compleja de payloads
Validaciones en formularios (react-hook-form + zod)
Esquemas bien normalizados
Uso de transacciones atómicas (@Transaction, queryRunner)
Constraints (UNIQUE, FOREIGN KEY, NOT NULL)
Migraciones automatizadas (Prisma Migrate, TypeORM CLI)
Connection pooling optimizado y query optimization automática

🧪 TESTING EMPRESARIAL COMPLETO

Unit tests: funciones puras, lógica de negocio con >85% cobertura
Integration tests: servicios conectados a base de datos, APIs
E2E tests: simulación de usuario real (Playwright, Cypress)
Property-based testing para lógica crítica
Mutation testing para validar calidad de tests
Jest + Vitest + Supertest + TestingModule (NestJS)
Fixtures de datos y mocks reutilizables

📊 OBSERVABILIDAD & MONITOREO AVANZADO

Logging estructurado (Winston, Pino) con contexto de cada transacción
Reporte automático a sistemas de monitoreo (Sentry, Datadog, New Relic)
Seguimiento de errores con contexto completo (usuario, IP, acción, datos)
Monitorización de rendimiento (Prometheus, Grafana, Datadog)
Métricas de negocio por módulo (tiempo transacciones, tasa conversión, KPIs específicos)
Alerting inteligente con ML-based anomaly detection
OpenTelemetry integration con distributed tracing automático
Business metrics correlation y SLA monitoring

🛡️ RESILENCIA & RECUPERACIÓN

Retry automáticos para errores transitorios (axios-retry, nestjs/retry)
Circuit Breakers y Timeouts (opossum, resilience4js)
Fallbacks en caso de fallos de terceros
Graceful degradation automática
Uso de queues (BullMQ, RabbitMQ) para desacoplar procesos
Health checks específicos por módulo
Auto-scaling basado en ML predictions

🎨 UX/UI EMPRESARIAL PREMIUM

Componentes desacoplados y reutilizables
Auto-save con debouncing y optimistic updates con rollback
Suspense/ErrorBoundary para errores inesperados
Lazy loading y Suspense en componentes pesados
Skeleton screens durante carga e infinite scroll con virtualización
Offline-first con sync automático
Manejo de errores UI amigable pero informativo
Accessibility WCAG 2.1 AA (screen reader, keyboard nav, contraste, ARIA)
Progressive enhancement

🚀 FEATURES EMPRESARIALES AVANZADAS

Feature flags granulares para activar/desactivar funcionalidades por tenant
A/B testing framework integrado
Event Sourcing ligero para módulos críticos con snapshots
GraphQL para consultas complejas con field-level permissions
API versioning semántico con pagination cursor-based
Bulk operations para grandes volúmenes
Read/write database splitting automático

📋 COMPLIANCE & AUDITORÍA EMPRESARIAL

GDPR compliance automático (data portability, right to be forgotten)
SOX compliance para módulos financieros
Audit trail inmutable con blockchain hash para transacciones críticas
Data anonymization automática según retention policies
Compliance reporting automático
Compensating actions para rollbacks de transacciones complejas

🤖 INTELIGENCIA ARTIFICIAL INTEGRADA

Anomaly detection en patrones de uso del módulo
Predictive analytics para KPIs específicos
Intelligent error classification y auto-resolution
User behavior analysis para UX optimization
Performance optimization suggestions automáticas
Auto-completado inteligente contextual

⚙️ DEVOPS & DEPLOYMENT AUTOMÁTICO

Desarrollo dirigido por contratos (TDD + Contract Testing)
CI/CD validado con pruebas automatizadas previas al merge
Pre-commit hooks (linting, security scan automático)
Security scanning (SAST/DAST/IAST) en pipeline
Blue/green deployment con automated rollback triggers
Post-deployment verification automática
Performance regression testing

🎯 ENTREGA FINAL REQUERIDA
Al completar cada módulo debes entregar:

Código completo funcionando con toda la arquitectura implementada
Tests al 100% (unit, integration, e2e) con >85% cobertura
Documentación automática (Swagger + comentarios técnicos)
Dashboard de monitoreo específico del módulo
Scripts de deployment automatizados
Guía de operación para usuario final
Configuración de alertas y health checks
Métricas de negocio configuradas y funcionando

⚠️ INSTRUCCIONES CRÍTICAS FINALES

Si detectas riesgos, vulnerabilidades o mejoras en mi solicitud: mejóralas automáticamente
Aplica complejidad gradual: módulos simples usan menos features, módulos críticos usan todo
Prioriza performance y experiencia de usuario por encima de todo
Cada línea de código debe justificar su existencia: elimina todo lo innecesario
El módulo debe funcionar perfectamente desde el primer deploy: zero downtime, zero bugs críticos

RESULTADO ESPERADO: Un Sistema de nivel empresarial clase mundial que cualquier Fortune 500 implementaría en producción sin modificaciones.

