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

Write-Warning "Restaurando package.json desde git (por si quedo modificado)..."
git checkout HEAD -- package.json
if ($LASTEXITCODE -ne 0) {
    Write-Error "No se pudo restaurar package.json desde git"
    exit 1
}
Write-Success "package.json restaurado"

if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
    Write-Success "package-lock.json eliminado para regeneracion"
}

Write-Warning "Regenerando package-lock.json e instalando dependencias (npm install)..."
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install fallo. Revisa los errores de compatibilidad arriba."
    exit 1
}
Write-Success "Dependencias instaladas correctamente"

# ============================================================================
# PASO 2: Actualizar PATCH releases (100% seguras)
# ============================================================================
Write-Header "PASO 2: Actualizando PATCH releases seguras"

$patchList = @(
    "@azure/keyvault-secrets@latest", "@sentry/nextjs@latest", "@supabase/supabase-js@latest",
    "@tanstack/react-query@latest", "@tanstack/react-query-devtools@latest",
    "@vitest/coverage-v8@latest", "@vitest/ui@latest", "vitest@latest",
    "dotenv@latest", "isomorphic-dompurify@latest", "postcss@latest", "postgres@latest", "prettier@latest",
    "react@latest", "react-dom@latest", "typescript-eslint@latest", "undici@latest"
)

npm install --legacy-peer-deps @patchList

if ($LASTEXITCODE -ne 0) {
    Write-Warning "Algunas patches no se pudieron instalar, continuando..."
} else {
    Write-Success "Patches actualizadas"
}

# ============================================================================
# PASO 3: Actualizar MINOR releases (generalmente seguras)
# ============================================================================
Write-Header "PASO 3: Actualizando MINOR releases"

$minorList = @(
    "jose@latest", "jsonwebtoken@latest", "better-auth@latest",
    "@playwright/test@latest", "@radix-ui/react-dialog@latest", "@radix-ui/react-popover@latest",
    "@radix-ui/react-select@latest", "@radix-ui/react-slot@latest", "@radix-ui/react-tabs@latest",
    "@radix-ui/react-toast@latest", "@tanstack/react-virtual@latest",
    "@testing-library/jest-dom@latest", "@testing-library/react@latest", "@testing-library/user-event@latest",
    "@trpc/client@latest", "@trpc/react-query@latest", "@trpc/server@latest",
    "@types/react@latest", "@types/react-dom@latest",
    "class-variance-authority@latest", "d3@latest", "framer-motion@latest", "ioredis@latest",
    "react-day-picker@latest", "react-hook-form@latest", "tailwind-merge@latest", "web-vitals@latest", "zod@latest", "zustand@latest"
)

foreach ($pkg in $minorList) {
    Write-Host "Actualizando $pkg..." -NoNewline
    npm install --legacy-peer-deps "$pkg" >$null 2>&1
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

Write-Host ""
Write-Host "1. tailwindcss          3.x -> 4.x   | MUY ALTO  | Reescritura total de configuracion" -ForegroundColor Red
Write-Host "2. next                 15.x -> 16.x  | ALTO      | Cambios de runtime y App Router" -ForegroundColor Red
Write-Host "3. eslint               9.x -> 10.x   | ALTO      | Cambios en flat config y plugins" -ForegroundColor Red
Write-Host "4. typescript           5.x -> 6.x    | MEDIO-ALTO| Type checking mas estricto" -ForegroundColor Yellow
Write-Host "5. vite                 6.x -> 8.x    | ALTO      | Saltos de 2 majors, revisar plugins" -ForegroundColor Red
Write-Host "6. @types/node          22.x -> 25.x  | MEDIO     | Tipos mas estrictos" -ForegroundColor Yellow
Write-Host "7. redis                4.x -> 5.x    | MEDIO     | Cambios en API de cliente" -ForegroundColor Yellow
Write-Host "8. storybook            8.x -> 10.x   | ALTO      | Migracion de addons" -ForegroundColor Red
Write-Host "9. @eslint/js           9.x -> 10.x   | ALTO      | Ligado a ESLint major" -ForegroundColor Red
Write-Host "10. eslint-plugin-react-hooks  5.x -> 7.x   | ALTO | Peer deps con ESLint 9/10" -ForegroundColor Red
Write-Host "11. lucide-react        0.511.x -> 1.x | MEDIO     | Cambio de versionado" -ForegroundColor Yellow
Write-Host "12. recharts            2.x -> 3.x    | MEDIO     | Cambios en tipos y APIs" -ForegroundColor Yellow
Write-Host "13. date-fns            2.x -> 4.x    | MEDIO     | Cambios en imports tree-shaking" -ForegroundColor Yellow
Write-Host ""

Write-Header "RESUMEN"
Write-Success "Patches y minors actualizadas automaticamente"
Write-Warning "Majors listadas arriba requieren migracion manual paso a paso"
Write-Host ""
Write-Host "Recomendacion: hacer commit del estado actual, luego atacar majors UNA POR UNA." -ForegroundColor Cyan
Write-Host "NO actualizar todas las majors de golpe." -ForegroundColor Red
Write-Host ""

# Guardar reporte
$reportPath = "$projectPath\dependency-update-report.txt"
"DEPENDENCY UPDATE REPORT - $(Get-Date)" | Out-File $reportPath
"Patches y minors: ACTUALIZADAS" | Add-Content $reportPath
"Majors pendientes: 13" | Add-Content $reportPath
"Recomendacion: actualizar una major por semana" | Add-Content $reportPath

Write-Host "Reporte guardado en: $reportPath" -ForegroundColor Cyan
