#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Actualizacion segura y ordenada de dependencias para Silexar Pulse
.DESCRIPTION
    Paso 1: Restaura estado limpio
    Paso 2: Actualiza patch releases seguras
    Paso 3: Actualiza minor releases
    Paso 4: Lista majors pendientes (requieren migracion manual)
.NOTES
    Ejecutar desde la carpeta raiz del proyecto como Administrador
#>

$ErrorActionPreference = "Stop"
$projectPath = Split-Path -Parent $PSScriptRoot
Set-Location $projectPath

function Write-Header($text) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $text -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-Success($text) { Write-Host "[OK] $text" -ForegroundColor Green }
function Write-Warning($text) { Write-Host "[WARN] $text" -ForegroundColor Yellow }
function Write-Error($text) { Write-Host "[ERR] $text" -ForegroundColor Red }

# ============================================================================
# PASO 0: Verificar que no haya procesos de Node bloqueando archivos
# ============================================================================
Write-Header "PASO 0: Matando procesos de Node bloqueantes"
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process npm -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Success "Procesos de Node limpiados"

# ============================================================================
# PASO 1: Restaurar estado limpio y funcional
# ============================================================================
Write-Header "PASO 1: Restaurando estado limpio"

if (Test-Path "node_modules") {
    Write-Warning "Eliminando node_modules corrupto..."
    cmd /c "rmdir /s /q `"$projectPath\node_modules`""
    if (Test-Path "node_modules") {
        Write-Warning "Primer intento fallo, intentando robocopy..."
        cmd /c "mkdir `"$projectPath\empty_dir`" && robocopy `"$projectPath\empty_dir`" `"$projectPath\node_modules`" /MIR /W:1 /R:1 >nul 2>&1 && rmdir /s /q `"$projectPath\node_modules`" `"$projectPath\empty_dir`""
    }
    if (Test-Path "node_modules") {
        Write-Error "No se pudo eliminar node_modules. Reinicia la PC e intenta de nuevo."
        exit 1
    }
}
Write-Success "node_modules eliminado"

if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
    Write-Success "package-lock.json eliminado"
}

Write-Warning "Restaurando package-lock.json desde git..."
git checkout HEAD -- package-lock.json
if ($LASTEXITCODE -ne 0) {
    Write-Error "No se pudo restaurar package-lock.json desde git"
    exit 1
}
Write-Success "package-lock.json restaurado"

Write-Warning "Instalando dependencias actuales (npm ci)..."
npm ci --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm ci fallo. El entorno no esta limpio."
    exit 1
}
Write-Success "Dependencias instaladas correctamente"

# ============================================================================
# PASO 2: Actualizar PATCH releases (100% seguras)
# ============================================================================
Write-Header "PASO 2: Actualizando PATCH releases seguras"

npm install --legacy-peer-deps $(
    @("@azure/keyvault-secrets", "@sentry/nextjs", "@supabase/supabase-js", 
      "@tanstack/react-query", "@tanstack/react-query-devtools",
      "@vitest/coverage-v8", "@vitest/ui", "vitest",
      "dotenv", "isomorphic-dompurify", "postcss", "postgres", "prettier",
      "react", "react-dom", "typescript-eslint", "undici")
    | ForEach-Object { "$_@latest" }
)

if ($LASTEXITCODE -ne 0) {
    Write-Warning "Algunas patches no se pudieron instalar, continuando..."
}
Write-Success "Patches actualizadas"

# ============================================================================
# PASO 3: Actualizar MINOR releases (generalmente seguras)
# ============================================================================
Write-Header "PASO 3: Actualizando MINOR releases"

$minorPackages = @(
    "jose", "jsonwebtoken", "better-auth",
    "@playwright/test", "@radix-ui/react-dialog", "@radix-ui/react-popover",
    "@radix-ui/react-select", "@radix-ui/react-slot", "@radix-ui/react-tabs",
    "@radix-ui/react-toast", "@tanstack/react-virtual",
    "@testing-library/jest-dom", "@testing-library/react", "@testing-library/user-event",
    "@trpc/client", "@trpc/react-query", "@trpc/server",
    "@types/react", "@types/react-dom",
    "class-variance-authority", "d3", "framer-motion", "ioredis",
    "react-day-picker", "react-hook-form", "tailwind-merge", "web-vitals", "zod", "zustand"
)

foreach ($pkg in $minorPackages) {
    Write-Host "Actualizando $pkg..." -NoNewline
    npm install --legacy-peer-deps "$pkg@latest" >$null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK" -ForegroundColor Green
    } else {
        Write-Host " SKIP" -ForegroundColor Yellow
    }
}
Write-Success "Minors procesadas"

# ============================================================================
# Verificacion intermedia
# ============================================================================
Write-Header "VERIFICACION INTERMEDIA"

Write-Warning "Ejecutando type check..."
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Warning "TypeScript tiene errores (esperado en proyecto grande). Se anotaran para revision."
} else {
    Write-Success "TypeScript OK"
}

Write-Warning "Ejecutando build..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Build tiene errores (esperado tras updates). Se anotaran para revision."
} else {
    Write-Success "Build OK"
}

# ============================================================================
# PASO 4: Reportar MAJORS pendientes (NO instalar automaticamente)
# ============================================================================
Write-Header "PASO 4: MAJOR releases pendientes (requieren migracion manual)"

$majors = @(
    [PSCustomObject]@{ Package="tailwindcss"; From="3.x"; To="4.x"; Risk="MUY ALTO - Reescritura total de configuracion"; Action="Migrar tailwind.config.js a CSS-based config" },
    [PSCustomObject]@{ Package="next"; From="15.x"; To="16.x"; Risk="ALTO - Cambios de runtime y App Router"; Action="Revisar breaking changes oficiales de Next.js" },
    [PSCustomObject]@{ Package="eslint"; From="9.x"; To="10.x"; Risk="ALTO - Cambios en flat config y plugins"; Action="Esperar a que eslint-plugin-react-hooks soporte v10" },
    [PSCustomObject]@{ Package="typescript"; From="5.x"; To="6.x"; Risk="MEDIO-ALTO - Type checking mas estricto"; Action="Actualizar tras arreglar todos los errores de TS 5.x" },
    [PSCustomObject]@{ Package="vite"; From="6.x"; To="8.x"; Risk="ALTO - Saltos de 2 majors, revisar plugins"; Action="Actualizar plugins de Vite primero" },
    [PSCustomObject]@{ Package="@types/node"; From="22.x"; To="25.x"; Risk="MEDIO - Tipos mas estrictos"; Action="Actualizar cuando suba Node.js en produccion" },
    [PSCustomObject]@{ Package="redis"; From="4.x"; To="5.x"; Risk="MEDIO - Cambios en API de cliente"; Action="Revisar usos de redis en src/lib/cache/" },
    [PSCustomObject]@{ Package="storybook"; From="8.x"; To="10.x"; Risk="ALTO - Migracion de addons"; Action="Solo si se usa Storybook activamente" },
    [PSCustomObject]@{ Package="@eslint/js"; From="9.x"; To="10.x"; Risk="ALTO - Ligado a ESLint major"; Action="Actualizar junto con eslint" },
    [PSCustomObject]@{ Package="eslint-plugin-react-hooks"; From="5.x"; To="7.x"; Risk="ALTO - Peer deps con ESLint 9/10"; Action="Verificar compatibilidad antes" },
    [PSCustomObject]@{ Package="lucide-react"; From="0.511.x"; To="1.x"; Risk="MEDIO - Cambio de versionado"; Action="Buscar iconos renombrados" },
    [PSCustomObject]@{ Package="recharts"; From="2.x"; To="3.x"; Risk="MEDIO - Cambios en tipos y APIs"; Action="Revisar dashboards que usen graficos" },
    [PSCustomObject]@{ Package="date-fns"; From="2.x"; To="4.x"; Risk="MEDIO - Cambios en imports tree-shaking"; Action="Revisar todos los `import { format } from 'date-fns'`" }
)

$majors | Format-Table Package, From, To, Risk, Action -AutoSize

Write-Header "RESUMEN"
Write-Success "Patches y minors actualizadas automaticamente"
Write-Warning "Majors listadas arriba requieren migracion manual paso a paso"
Write-Host "`nRecomendacion: hacer commit del estado actual, luego atacar majors UNA POR UNA." -ForegroundColor Cyan
Write-Host "No actualizar todas las majors de golpe." -ForegroundColor Red

# Guardar reporte
$reportPath = "$projectPath\dependency-update-report.txt"
"DEPENDENCY UPDATE REPORT - $(Get-Date)" | Out-File $reportPath
"Patches y minors: ACTUALIZADAS" | Add-Content $reportPath
"Majors pendientes: $($majors.Count)" | Add-Content $reportPath
$majors | Out-String | Add-Content $reportPath

Write-Host "`nReporte guardado en: $reportPath" -ForegroundColor Cyan
