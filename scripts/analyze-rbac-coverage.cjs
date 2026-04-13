const fs = require("fs");
const path = require("path");

// Rutas intencionalmente públicas (no requieren protección RBAC)
const intentionallyPublicPatterns = [
  "api/health",
  "api/robots",
  "api/sitemap",
  "api/auth/[...auth]",
  "api/auth/login",
  "api/auth/register", 
  "api/auth/refresh",
  "api/auth/verify-2fa",
  "api/auth/logout",
  "api/auth/me",
  "api/webhooks",
  "api/security/csp-report",
  "api/security/csp-violation",
  "api/registro-emision/secure-link",
  "api/campanas/[id]/confirmaciones/preview.pdf",
  "api/campanas/[id]/confirmaciones/[confirmationId].pdf",
  "api/mobile/auth",
  "api/trpc",
  "api/emergency",
  "api/mobile/sync",
];

// Función para verificar si una ruta está protegida
function checkProtection(content) {
  const hasWithApiRoute = content.includes("withApiRoute");
  const hasCheckPermission = content.includes("checkPermission");
  const hasGetUserContext = content.includes("getUserContext");
  const hasRequireAuth = content.includes("requireAuth") || /auth\s*\(\s*\)/.test(content);
  const hasBetterAuth = content.includes("auth.api") || content.includes("betterAuth");
  const hasJwtGuard = content.includes("JwtAuthGuard") || content.includes("jwt-auth.guard");
  const hasProtectFn = content.includes("protect") && content.includes("auth");
  const hasMiddlewareAuth = content.includes("middleware") && (content.includes("auth") || content.includes("session"));
  
  return {
    protected: hasWithApiRoute || hasCheckPermission || hasGetUserContext || hasRequireAuth || 
               hasBetterAuth || hasJwtGuard || hasProtectFn || hasMiddlewareAuth,
    methods: {
      withApiRoute: hasWithApiRoute,
      checkPermission: hasCheckPermission,
      getUserContext: hasGetUserContext,
      requireAuth: hasRequireAuth,
      betterAuth: hasBetterAuth,
      jwtGuard: hasJwtGuard,
      protectFn: hasProtectFn,
      middlewareAuth: hasMiddlewareAuth
    }
  };
}

function matchesIntentionallyPublic(routePath) {
  const normalizedPath = routePath.replace("src/app/api/", "api/").replace(/\\/g, "/");
  
  for (const pattern of intentionallyPublicPatterns) {
    // Convertir patrón con [id] a regex
    const regexPattern = pattern
      .replace(/\[.*?\]/g, "[^/]+")
      .replace(/\./g, "\\.");
    
    if (new RegExp(regexPattern).test(normalizedPath)) {
      return true;
    }
    
    // Comparación directa sin [id]
    const patternWithoutParams = pattern.replace(/\[.*?\]/g, "");
    const routeWithoutParams = normalizedPath.replace(/\[[^\]]+\]/g, "").replace(/\/$/, "");
    
    if (routeWithoutParams.includes(patternWithoutParams.replace(/\/$/, ""))) {
      return true;
    }
  }
  
  return false;
}

// Leer todas las rutas API
const apiDir = path.join(process.cwd(), "src/app/api");
const routes = [];

function findRoutes(dir, basePath = "") {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.join(basePath, item.name);
    
    if (item.isDirectory()) {
      findRoutes(fullPath, relativePath);
    } else if (item.name === "route.ts") {
      routes.push("src/app/api/" + path.join(basePath, item.name).replace(/\\/g, "/"));
    }
  }
}

findRoutes(apiDir);

// Analizar cada ruta
const report = {
  generatedAt: new Date().toISOString(),
  totalRoutes: routes.length,
  protectedRoutes: 0,
  unprotectedRoutes: [],
  intentionallyPublic: [],
  details: []
};

for (const route of routes) {
  const content = fs.readFileSync(route, "utf-8");
  const protection = checkProtection(content);
  const isIntentionallyPublic = matchesIntentionallyPublic(route);
  
  const detail = {
    route: route,
    protected: protection.protected,
    isIntentionallyPublic: isIntentionallyPublic,
    protectionMethods: protection.methods
  };
  
  report.details.push(detail);
  
  if (protection.protected) {
    report.protectedRoutes++;
  } else if (isIntentionallyPublic) {
    report.intentionallyPublic.push(route);
  } else {
    report.unprotectedRoutes.push(route);
  }
}

// Calcular cobertura
const effectivelyProtected = report.protectedRoutes + report.intentionallyPublic.length;
report.coverage = parseFloat(((effectivelyProtected / report.totalRoutes) * 100).toFixed(2));
report.effectiveProtectedCount = effectivelyProtected;

// Guardar reporte
const reportPath = path.join(process.cwd(), "RBAC_COVERAGE_REPORT_DIA12.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📊 REPORTE RBAC - COBERTURA DE PROTECCIÓN`);
console.log(`========================================`);
console.log(`📁 Total de rutas API: ${report.totalRoutes}`);
console.log(`🔒 Rutas protegidas con RBAC: ${report.protectedRoutes}`);
console.log(`🌐 Rutas públicas intencionales: ${report.intentionallyPublic.length}`);
console.log(`⚠️  Rutas sin protección (crítico): ${report.unprotectedRoutes.length}`);
console.log(`📈 Cobertura efectiva: ${report.coverage}%`);
console.log(`========================================`);

if (report.unprotectedRoutes.length > 0) {
  console.log(`\n❌ RUTAS SIN PROTECCIÓN (${report.unprotectedRoutes.length}) - REQUIEREN ATENCIÓN:`);
  report.unprotectedRoutes.forEach(r => console.log(`   - ${r}`));
}

if (report.intentionallyPublic.length > 0) {
  console.log(`\n🌐 RUTAS PÚBLICAS INTENCIONALES (${report.intentionallyPublic.length}):`);
  report.intentionallyPublic.forEach(r => console.log(`   - ${r}`));
}

// Mostrar resumen de métodos de protección usados
const methodCounts = {
  withApiRoute: 0,
  checkPermission: 0,
  getUserContext: 0,
  requireAuth: 0,
  betterAuth: 0,
  jwtGuard: 0,
  protectFn: 0,
  middlewareAuth: 0
};

report.details.forEach(d => {
  if (d.protected) {
    Object.keys(d.protectionMethods).forEach(key => {
      if (d.protectionMethods[key]) methodCounts[key]++;
    });
  }
});

console.log(`\n📋 MÉTODOS DE PROTECCIÓN UTILIZADOS:`);
console.log(`   - withApiRoute: ${methodCounts.withApiRoute} rutas`);
console.log(`   - getUserContext: ${methodCounts.getUserContext} rutas`);
console.log(`   - checkPermission: ${methodCounts.checkPermission} rutas`);
console.log(`   - requireAuth: ${methodCounts.requireAuth} rutas`);
console.log(`   - betterAuth: ${methodCounts.betterAuth} rutas`);
console.log(`   - jwtGuard: ${methodCounts.jwtGuard} rutas`);
console.log(`   - protectFn: ${methodCounts.protectFn} rutas`);
console.log(`   - middlewareAuth: ${methodCounts.middlewareAuth} rutas`);

console.log(`\n✅ Reporte guardado en: ${reportPath}`);

// Salir con código de error si hay rutas sin protección
if (report.unprotectedRoutes.length > 0) {
  console.log(`\n⚠️  ADVERTENCIA: Hay ${report.unprotectedRoutes.length} rutas sin protección RBAC`);
  process.exit(1);
}
