# Silexar Pulse Quantum 🚀

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Better Auth](https://img.shields.io/badge/Better%20Auth-1.4-FFC107?style=flat-square)](https://www.better-auth.com/)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F015?style=flat-square)](https://orm.drizzle.team/)

[![Security Scan](https://github.com/silexartechnologies/silexar-pulse/actions/workflows/security-scan.yml/badge.svg)](https://github.com/silexartechnologies/silexar-pulse/actions/workflows/security-scan.yml)
[![Dependency Update](https://github.com/silexartechnologies/silexar-pulse/actions/workflows/dependency-update.yml/badge.svg)](https://github.com/silexartechnologies/silexar-pulse/actions/workflows/dependency-update.yml)
[![Security Report](https://github.com/silexartechnologies/silexar-pulse/actions/workflows/security-report.yml/badge.svg)](https://github.com/silexartechnologies/silexar-pulse/actions/workflows/security-report.yml)
[![CodeQL](https://github.com/silexartechnologies/silexar-pulse/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/silexartechnologies/silexar-pulse/security/code-scanning)

> **Sistema Enterprise de Gestión Publicitaria con IA** - Plataforma TIER 0 para la industria de medios y publicidad, con arquitectura Pentagon++ y optimización cuántica.

## 📋 Descripción

**Silexar Pulse Quantum** es una plataforma integral de gestión publicitaria diseñada para emisoras de radio, agencias de medios y anunciantes. Combina tecnología de vanguardia con inteligencia artificial (Cortex AI) para automatizar y optimizar todo el ciclo de vida de las campañas publicitarias:

- **Gestión de Campañas**: Creación, programación y seguimiento de campañas publicitarias
- **Contratos Inteligentes**: Negociación, firmas digitales y cumplimiento automatizado
- **Cuñas y Creativos**: Gestión de spots de audio y materiales publicitarios digitales
- **Programación Automática**: Optimización de grids y prevención de conflictos
- **Facturación Integrada**: Cierre mensual, conciliación y reportes financieros
- **Portal Cliente**: Acceso self-service para anunciantes y agencias
- **Analytics Predictivo**: Inteligencia de negocios con ML y forecasting

## 🏗️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 16.0.7 | Framework React con App Router |
| React | 19.2.1 | UI Library con Concurrent Features |
| TypeScript | 5.8.3 | Tipado estático estricto |
| Tailwind CSS | 3.4.17 | Estilos utility-first |
| Framer Motion | 12.23.24 | Animaciones y transiciones |
| Radix UI | 1.x | Componentes primitivos accesibles |
| Lucide React | 0.511.0 | Iconografía |
| Zustand | 5.0.3 | State management |

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Better Auth | 1.4.11 | Autenticación completa (OAuth, 2FA, RBAC) |
| tRPC | 11.7.2 | API type-safe |
| Drizzle ORM | 0.44.7 | ORM type-safe para PostgreSQL |
| PostgreSQL | 15+ | Base de datos principal |
| Redis | 7.x | Cache y rate limiting |
| Zod | 4.1.13 | Validación de schemas |

### Infraestructura
| Tecnología | Propósito |
|------------|-----------|
| Vercel | Hosting y Edge Functions |
| Sentry | Error tracking y performance |
| Docker | Containerización |
| Kubernetes | Orquestación de contenedores |

### Testing
| Tecnología | Propósito |
|------------|-----------|
| Vitest | Unit testing |
| Playwright | E2E testing |
| React Testing Library | Component testing |

## 🚀 Instalación

### Requisitos Previos
- Node.js 20+ (ver `.nvmrc`)
- PostgreSQL 15+
- Redis 7+
- npm 10+ o pnpm 8+

### Paso a Paso

```bash
# 1. Clonar el repositorio
git clone https://github.com/silexartechnologies/silexar-pulse.git
cd silexar-pulse

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Configurar base de datos
npm run db:generate
npm run db:migrate

# 5. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## 📜 Comandos Disponibles

### Desarrollo
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo con Turbopack |
| `npm run build` | Construye aplicación para producción |
| `npm run start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run check` | Verificación de tipos TypeScript |

### Base de Datos
| Comando | Descripción |
|---------|-------------|
| `npm run db:generate` | Genera migraciones Drizzle |
| `npm run db:migrate` | Ejecuta migraciones pendientes |
| `npm run db:push` | Sincroniza schema con base de datos |
| `npm run db:studio` | Abre Drizzle Studio (UI) |

### Testing
| Comando | Descripción |
|---------|-------------|
| `npm run test` | Ejecuta tests unitarios (Vitest) |
| `npm run test:ui` | Vitest con UI interactiva |
| `npm run test:coverage` | Reporte de cobertura |
| `npm run test:watch` | Modo watch |
| `npm run test:e2e` | Tests E2E con Playwright |

### Documentación
| Comando | Descripción |
|---------|-------------|
| `npm run storybook` | Inicia Storybook |
| `npm run build-storybook` | Construye Storybook |
| `npm run analyze` | Análisis de bundle |

## 📁 Estructura de Carpetas

```
silexar-pulse/
├── .agents/                 # Configuración de agentes IA
├── .github/                 # Workflows de GitHub Actions
├── docker/                  # Configuración Docker
├── docs/                    # Documentación del proyecto
├── drizzle/                 # Migraciones de base de datos
├── e2e/                     # Tests E2E (Playwright)
├── helm/                    # Charts de Kubernetes
├── k8s/                     # Manifiestos Kubernetes
├── monitoring/              # Configuración de monitoreo
├── public/                  # Assets estáticos
├── scripts/                 # Scripts de utilidad
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API Routes
│   │   ├── (routes)/        # Páginas de la aplicación
│   │   │   ├── campanas/    # Gestión de campañas
│   │   │   ├── contratos/   # Gestión de contratos
│   │   │   ├── cunas/       # Gestión de cuñas/spots
│   │   │   ├── dashboard/   # Dashboards
│   │   │   └── ...
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # Componentes React reutilizables
│   │   ├── ui/              # Componentes base (shadcn/ui)
│   │   └── ...
│   ├── lib/                 # Utilidades y lógica de negocio
│   │   ├── ai/              # Integraciones IA (Cortex)
│   │   ├── auth/            # Configuración Better Auth
│   │   ├── cache/           # Redis y caching
│   │   ├── cortex/          # Motor Cortex AI
│   │   ├── db/              # Schemas Drizzle
│   │   ├── security/        # Utilidades de seguridad
│   │   ├── services/        # Servicios de negocio
│   │   ├── trpc/            # Configuración tRPC
│   │   └── utils.ts         # Utilidades generales
│   ├── hooks/               # Custom React hooks
│   ├── types/               # Tipos TypeScript globales
│   └── styles/              # Estilos globales
├── tests/                   # Tests unitarios
├── .env.example             # Ejemplo de variables de entorno
├── next.config.js           # Configuración Next.js
├── tailwind.config.js       # Configuración Tailwind
├── tsconfig.json            # Configuración TypeScript
└── vitest.config.ts         # Configuración Vitest
```

## 🔐 Variables de Entorno

Ver [`.env.example`](.env.example) para la lista completa. Las principales:

```bash
# Aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/silexar_db

# Redis
REDIS_URL=redis://localhost:6379

# Autenticación (Better Auth)
JWT_SECRET=your-jwt-secret
AUTH_ALLOWED_ORIGINS=http://localhost:3000

# OAuth (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Monitoreo
SENTRY_DSN=
```

## 🧪 Testing

### Unit Tests (Vitest)
```bash
npm run test
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

### Cobertura
```bash
npm run test:coverage
```

## 📚 Documentación Adicional

- [Arquitectura](docs/ARCHITECTURE.md) - Diagramas y decisiones técnicas
- [API](docs/API.md) - Referencia de endpoints
- [Deployment](docs/DEPLOYMENT.md) - Guía de despliegue
- [Changelog](CHANGELOG.md) - Historial de cambios

## 🏆 Características Clave

### 🎨 Sistema de Diseño Neumórfico
- Paleta de colores cálidos (`#F0EDE8` base)
- Sombras suaves y realistas
- Modo oscuro completo
- Accesibilidad WCAG 2.1 AAA

### 🔒 Seguridad Pentagon++
- Autenticación JWT con refresh tokens
- Rate limiting distribuido (Redis)
- Encriptación AES-256 en reposo
- OWASP Top 10 compliance
- CSP headers estrictos

### ⚡ Performance TIER 0
- Core Web Vitals optimizados (LCP <1s)
- Bundle splitting automático
- Image optimization (WebP/AVIF)
- Edge caching
- Service Worker para PWA

### 🤖 Cortex AI
- Asistente comercial inteligente
- Predicción de demanda
- Optimización de campañas
- Detección de anomalías
- Análisis de sentimiento

## 🤝 Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para guías de contribución.

## 📄 Licencia

Propietario - Silexar Technologies © 2026

---

<div align="center">

**Built with ❤️ by Silexar Technologies**

*TIER 0 Supremacy - Pentagon++ Quantum Enhancement*

</div>
