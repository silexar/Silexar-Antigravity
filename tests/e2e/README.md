# Tests E2E - Silexar Pulse

## 📁 Estructura

```
tests/e2e/
├── pages/              # Page Objects
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── CunasPage.ts
│   ├── CrearCunaPage.ts
│   ├── ContratosPage.ts
│   ├── WizardContratoPage.ts
│   └── index.ts        # Export centralizado
├── fixtures.ts         # Fixtures personalizados
├── auth/
│   └── login.spec.ts   # Tests de autenticación
├── cunas/
│   └── crear-cuna.spec.ts  # Tests de creación de cuñas
├── contratos/
│   └── wizard.spec.ts  # Tests del wizard de contratos
└── navigation/
    └── dashboard.spec.ts  # Tests de navegación
```

## 🚀 Ejecución

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar con UI
npm run test:e2e:ui

# Ejecutar un archivo específico
npx playwright test tests/e2e/auth/login.spec.ts

# Ejecutar en modo headed (ver el navegador)
npx playwright test --headed

# Ejecutar en modo debug
npx playwright test --debug
```

## 🧪 Tests Creados

### 1. Auth (`tests/e2e/auth/login.spec.ts`) - 9 tests
- ✅ Login exitoso con credenciales válidas
- ✅ Recordar credenciales ("Recordarme")
- ✅ Mostrar/ocultar contraseña
- ✅ Error con email no registrado
- ✅ Error con contraseña incorrecta
- ✅ Error cuando email está vacío
- ✅ Error cuando contraseña está vacía
- ✅ Mantener email tras error
- ✅ Cerrar sesión (logout)
- ✅ Limpiar cookies al logout
- ✅ Link a recuperar contraseña
- ✅ Navegación por teclado

### 2. Cuñas (`tests/e2e/cunas/crear-cuna.spec.ts`) - 12 tests
- ✅ Cargar página de cuñas desde navegación
- ✅ Mostrar métricas de cuñas
- ✅ Mostrar lista de cuñas existentes
- ✅ Búsqueda de cuñas
- ✅ Accesos rápidos funcionales
- ✅ Navegar al wizard de creación
- ✅ Completar paso 1: Información Básica
- ✅ Navegar entre pasos del wizard
- ✅ Completar wizard y crear cuña
- ✅ Verificar cuña en lista
- ✅ Verificar detalles de cuña creada
- ✅ Cancelar creación de cuña
- ✅ Validaciones de campos

### 3. Contratos (`tests/e2e/contratos/wizard.spec.ts`) - 15 tests
- ✅ Mostrar selector de tipo de contrato
- ✅ Seleccionar tipo "Nuevo" y continuar
- ✅ Seleccionar tipo "Renovación"
- ✅ Botón continuar deshabilitado hasta selección
- ✅ Completar Paso 1: Info Fundamental
- ✅ Navegar por todos los pasos
- ✅ Retroceder entre pasos
- ✅ Completar Paso 2: Términos Comerciales
- ✅ Completar Paso 3: Especificaciones
- ✅ Validar fecha fin posterior a inicio
- ✅ Completar wizard y generar contrato
- ✅ Mostrar mensaje de éxito
- ✅ Mostrar resumen del contrato
- ✅ Guardar como borrador
- ✅ Barra de progreso correcta
- ✅ Cancelar wizard

### 4. Navegación (`tests/e2e/navigation/dashboard.spec.ts`) - 16 tests
- ✅ Cargar dashboard correctamente
- ✅ Mostrar título y branding
- ✅ Mostrar métricas principales
- ✅ Mostrar estado del sistema
- ✅ Cargar en tiempo razonable
- ✅ Navegar a Campañas
- ✅ Navegar a Contratos
- ✅ Navegar a Cuñas
- ✅ Navegar a Anunciantes
- ✅ Navegar a Facturación
- ✅ Volver al dashboard
- ✅ Mostrar indicadores de salud
- ✅ Menú de navegación accesible
- ✅ Información del usuario
- ✅ Botón de refrescar datos
- ✅ Responsive en diferentes viewports
- ✅ Metadata SEO correcta
- ✅ Navegable por teclado
- ✅ Contraste adecuado
- ✅ Loading states

## **Total: 52 tests E2E**

## 🔧 Page Objects

Los Page Objects encapsulan la lógica de interacción con cada página:

- **LoginPage**: Formulario de login, errores, logout
- **DashboardPage**: Navegación principal, métricas
- **CunasPage**: Lista de cuñas, filtros, búsqueda
- **CrearCunaPage**: Wizard de creación de cuñas
- **ContratosPage**: Lista de contratos
- **WizardContratoPage**: Wizard de 6 pasos para contratos

## 🎭 Fixtures

El archivo `fixtures.ts` proporciona:

- **Page Objects** inyectados automáticamente
- **authenticatedPage**: Página ya autenticada
- **testUsers**: Usuarios de prueba configurables
- **Helpers**: Utilidades para generar datos de prueba

## ⚙️ Configuración

Variables de entorno para tests:

```bash
# .env.local
E2E_TEST_EMAIL=admin@silexar.test
E2E_TEST_PASSWORD=TestPass123!
BASE_URL=http://localhost:3000
```

## 📝 Buenas Prácticas

1. **Usar Page Objects** para encapsular selectores
2. **Usar fixtures** para setup común
3. **Tests independientes**: No dependen de estado de otros tests
4. **Limpieza**: Usar `test.afterEach` si es necesario
5. **Timeouts**: Ajustar según la velocidad de la app
