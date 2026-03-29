/**
 * Fix console.* in src/app (pages), src/components, src/modules, src/cortex
 * - Server-side files (.ts): replace with logger from @/lib/observability
 * - Client-side components (.tsx): replace with a client-safe logger
 */
const fs = require('fs');
const path = require('path');

function getFiles(dir, exts) {
  let results = [];
  try {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory() && f !== 'node_modules' && f !== '.next' && f !== '__tests__') {
        results = results.concat(getFiles(full, exts));
      } else if (exts.some(e => f.endsWith(e)) && !f.endsWith('.d.ts') && !f.includes('.test.') && !f.includes('.spec.') && !f.includes('.stories.')) {
        results.push(full);
      }
    }
  } catch(e) {}
  return results;
}

function isClientComponent(content) {
  return content.startsWith("'use client'") || content.startsWith('"use client"') || content.includes("'use client'");
}

let totalFixed = 0;

// Process server-side .ts files and non-client .tsx files in pages/modules/cortex
const serverDirs = ['src/app', 'src/modules', 'src/cortex'];

for (const dir of serverDirs) {
  const files = getFiles(dir, ['.ts', '.tsx']);
  for (const file of files) {
    const rel = file.split(path.sep).join('/');
    // Skip API routes (already handled), skip test files
    if (rel.includes('/api/') && rel.endsWith('route.ts')) continue;

    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    const isClient = isClientComponent(content);
    const hasConsole = /console\.(error|warn|log|info|debug)/.test(content);
    if (!hasConsole) continue;

    if (isClient) {
      // Client component: replace with simple noop in production
      // Replace console.log -> noop (don't add server logger)
      content = content.replace(/console\.(error|warn|log|info|debug)\(([^)]+)\)/g, (match, level) => {
        if (level === 'error') return `/* ${match} */`; // keep errors visible in dev
        return ''; // remove debug/info/log/warn from client components
      });
      // Clean up empty lines left behind
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    } else {
      // Server-side: replace with structured logger
      const hasLogger = content.includes("from '@/lib/observability'") || content.includes('from "@/lib/observability"');

      content = content.replace(/console\.error\(([^)]+)\)/g, (match, args) => {
        const a = args.trim();
        if (a.startsWith("'") || a.startsWith('"') || a.startsWith('`')) {
          return `logger.error(${a})`;
        }
        return `logger.error('Error', ${a} instanceof Error ? ${a} : new Error(String(${a})))`;
      });
      content = content.replace(/console\.warn\(([^)]+)\)/g, (match, args) => {
        const a = args.trim();
        return `logger.warn(${a.startsWith("'") || a.startsWith('"') || a.startsWith('`') ? a : 'String(' + a + ')'})`;
      });
      content = content.replace(/console\.(log|info|debug)\(([^)]+)\)/g, (match, level, args) => {
        const a = args.trim();
        return `logger.info(${a.startsWith("'") || a.startsWith('"') || a.startsWith('`') ? a : 'String(' + a + ')'})`;
      });

      // Add logger import if needed
      if (!hasLogger && (content.includes('logger.error') || content.includes('logger.warn') || content.includes('logger.info'))) {
        const firstImportMatch = content.match(/^(import [^\n]+\n)/m);
        if (firstImportMatch) {
          content = content.replace(firstImportMatch[0], firstImportMatch[0] + "import { logger } from '@/lib/observability';\n");
        } else {
          content = "import { logger } from '@/lib/observability';\n" + content;
        }
      }
    }

    if (content !== original) {
      fs.writeFileSync(file, content);
      totalFixed++;
    }
  }
}

// Process src/components - mostly client components
const compFiles = getFiles('src/components', ['.ts', '.tsx']);
for (const file of compFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  const isClient = isClientComponent(content);
  const hasConsole = /console\.(error|warn|log|info|debug)/.test(content);
  if (!hasConsole) continue;

  if (isClient || file.endsWith('.tsx')) {
    // Client components: silently remove debug/info/log, keep errors as-is for dev visibility
    content = content.replace(/console\.(log|info|debug)\([^)]+\);?/g, '');
    content = content.replace(/console\.(warn)\([^)]+\);?/g, '');
    // Keep console.error in client components (useful for debugging, shows in browser)
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  } else {
    // Pure TS utility files in components (rare)
    const hasLogger = content.includes("from '@/lib/observability'");
    content = content.replace(/console\.error\(([^)]+)\)/g, (match, args) => {
      const a = args.trim();
      return `logger.error(${a.startsWith("'") || a.startsWith('"') || a.startsWith('`') ? a : "'Error'"})`;
    });
    content = content.replace(/console\.(warn|log|info|debug)\(([^)]+)\)/g, (match, level, args) => {
      return '';
    });
    if (!hasLogger && content.includes('logger.')) {
      content = "import { logger } from '@/lib/observability';\n" + content;
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    totalFixed++;
  }
}

console.log('Files updated:', totalFixed);

// Final count
const allFiles = [
  ...getFiles('src/app', ['.ts', '.tsx']),
  ...getFiles('src/components', ['.ts', '.tsx']),
  ...getFiles('src/modules', ['.ts', '.tsx']),
  ...getFiles('src/cortex', ['.ts', '.tsx']),
];
let remaining = 0;
for (const file of allFiles) {
  const c = fs.readFileSync(file, 'utf8');
  if (/console\.(error|warn|log|info|debug)/.test(c) && !file.includes('observability') && !file.includes('jest.setup')) {
    remaining++;
  }
}
console.log('Files still with console.*:', remaining);
