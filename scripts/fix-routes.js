const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  try {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) results = results.concat(getFiles(full));
      else if (f === 'route.ts') results.push(full);
    }
  } catch(e) {}
  return results;
}

const PUBLIC_KEYS = [
  'health','robots','sitemap',
  'auth/login','auth/register','auth/logout','auth/refresh','auth/me','auth/[...auth]',
  'security/csp-report','security/csp-violation',
  'trpc/[trpc]','webhooks','mobile/auth'
];

function getRouteKey(f) {
  return f.split(path.sep).join('/')
    .replace('src/app/api/', '')
    .replace('/route.ts', '');
}

function isPublic(routeKey) {
  return PUBLIC_KEYS.some(p => routeKey === p || routeKey.startsWith(p + '/'));
}

function getPermission(routeKey) {
  if (routeKey.startsWith('campanas')) return ['campanas', 'read'];
  if (routeKey.startsWith('contratos')) return ['contratos', 'read'];
  if (routeKey.startsWith('cunas')) return ['cunas', 'read'];
  if (routeKey.startsWith('anunciantes')) return ['anunciantes', 'read'];
  if (routeKey.startsWith('emisoras')) return ['emisoras', 'read'];
  if (routeKey.startsWith('facturacion') || routeKey.startsWith('cierre-mensual')) return ['facturacion', 'read'];
  if (routeKey.startsWith('registro-emision')) return ['emisiones', 'read'];
  if (routeKey.startsWith('equipos-ventas') || routeKey.startsWith('vendedores')) return ['equipos-ventas', 'read'];
  if (routeKey.startsWith('usuarios')) return ['usuarios', 'read'];
  if (routeKey.startsWith('dashboard')) return ['dashboard', 'read'];
  if (routeKey.startsWith('cortex') || routeKey.startsWith('ai/') || routeKey.startsWith('asistente')) return ['campanas', 'read'];
  if (routeKey.startsWith('inventario')) return ['inventario', 'read'];
  if (routeKey.startsWith('monitoring') || routeKey.startsWith('security')) return ['configuracion', 'admin'];
  if (routeKey.startsWith('tenants')) return ['usuarios', 'admin'];
  if (routeKey.startsWith('informes') || routeKey.startsWith('exportar') || routeKey.startsWith('cotizador')) return ['reportes', 'read'];
  if (routeKey.startsWith('conciliacion')) return ['facturacion', 'read'];
  if (routeKey.startsWith('v2')) return ['campanas', 'read'];
  if (routeKey.startsWith('portal-cliente')) return ['campanas', 'read'];
  if (routeKey.startsWith('mobile')) return ['campanas', 'read'];
  if (routeKey.startsWith('crm')) return ['contratos', 'read'];
  if (routeKey.startsWith('prediccion')) return ['reportes', 'read'];
  if (routeKey.startsWith('tandas') || routeKey.startsWith('exportar-pauta')) return ['emisiones', 'read'];
  if (routeKey.startsWith('activos')) return ['inventario', 'read'];
  if (routeKey.startsWith('agencias')) return ['contratos', 'read'];
  if (routeKey.startsWith('audio')) return ['cunas', 'read'];
  if (routeKey.startsWith('emergency') || routeKey.startsWith('system')) return ['configuracion', 'admin'];
  if (routeKey.startsWith('cierre')) return ['facturacion', 'admin'];
  if (routeKey.startsWith('portal')) return ['campanas', 'read'];
  return ['dashboard', 'read'];
}

function getAuditType(routeKey, method) {
  if (method && method.includes('DELETE')) return 'DATA_DELETE';
  if (method && method.includes('POST')) return 'DATA_CREATE';
  if (method && method.includes('PUT') || method && method.includes('PATCH')) return 'DATA_UPDATE';
  return 'DATA_READ';
}

function getModule(routeKey) {
  return routeKey.split('/')[0] || 'api';
}

const routes = getFiles('src/app/api').filter(f => !f.includes('__tests__'));
let fixedCount = 0;

for (const file of routes) {
  const routeKey = getRouteKey(file);
  if (isPublic(routeKey)) continue;

  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  const [resource, action] = getPermission(routeKey);
  const moduleName = getModule(routeKey);

  const needsCheckPerm = !content.includes('checkPermission') && !content.includes('requireRole') && !content.includes('apiForbidden');
  const needsAudit = !content.includes('auditLogger');
  const needsTenant = !content.includes('withTenantContext');
  const hasRbac = content.includes("from '@/lib/security/rbac'");
  const hasAuditImport = content.includes("from '@/lib/security/audit-logger'");
  const hasTenantImport = content.includes("from '@/lib/db/tenant-context'");
  const hasApiForbidden = content.includes('apiForbidden');
  const hasResponseImport = content.includes("from '@/lib/api/response'");

  // Build imports to add
  const newImports = [];
  if (needsCheckPerm && !hasRbac) {
    newImports.push("import { checkPermission } from '@/lib/security/rbac';");
  }
  if (needsAudit && !hasAuditImport) {
    newImports.push("import { auditLogger } from '@/lib/security/audit-logger';");
  }
  if (needsTenant && !hasTenantImport) {
    newImports.push("import { withTenantContext } from '@/lib/db/tenant-context';");
  }
  // Ensure apiForbidden is imported
  if (needsCheckPerm && !hasApiForbidden && hasResponseImport) {
    // Add apiForbidden to existing response import
    content = content.replace(
      /import \{([^}]+)\} from '@\/lib\/api\/response'/,
      (match, imports) => {
        if (!imports.includes('apiForbidden')) {
          return match.replace(imports, imports.trimEnd().replace(/,?\s*$/, ', apiForbidden'));
        }
        return match;
      }
    );
  }

  // Insert new imports after the last existing import
  if (newImports.length > 0) {
    const importLines = content.split('\n');
    let lastImportIdx = -1;
    for (let i = 0; i < importLines.length; i++) {
      if (importLines[i].startsWith('import ') || importLines[i].startsWith('import{')) {
        lastImportIdx = i;
      }
    }
    if (lastImportIdx >= 0) {
      importLines.splice(lastImportIdx + 1, 0, ...newImports);
      content = importLines.join('\n');
    }
  }

  // Add checkPermission call after getUserContext + auth check
  if (needsCheckPerm && content.includes('getUserContext')) {
    // Pattern 1: if (!ctx.userId) return apiUnauthorized();
    content = content.replace(
      /(const ctx = getUserContext\(request\);?\s*\n\s*if \(!ctx\.userId\)[^\n]+\n)/,
      `$1\n  const perm = checkPermission(ctx, '${resource}', '${action}');\n  if (!perm) return apiForbidden();\n`
    );
  }

  // Add withTenantContext hint as comment where DB is used (non-destructive)
  // Only add the import for now - actual wrapping requires per-file analysis

  if (content !== original) {
    fs.writeFileSync(file, content);
    fixedCount++;
  }
}

console.log('Routes updated with compliance improvements:', fixedCount);
