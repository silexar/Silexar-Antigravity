const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') {
        files = files.concat(walk(full));
      } else if (e.isFile() && (e.name.endsWith('.tsx') || e.name.endsWith('.ts'))) {
        files.push(full);
      }
    }
  } catch {}
  return files;
}

const violations = [];
const files = walk('src/app');
for (const f of files) {
  try {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!/<input/.test(line)) continue;
      const ctx = lines.slice(i, i + 8).join('\n');
      if (/type=["']?(radio|checkbox|hidden|file|submit|button|reset)["']?/.test(ctx)) continue;
      if (/aria-label/.test(ctx)) continue;
      const idMatch = line.match(/id=["']([^"']+)["']/);
      if (idMatch) {
        const id = idMatch[1];
        const prevCtx = lines.slice(Math.max(0,i-5), i+1).join('\n');
        if (prevCtx.includes('htmlFor="' + id + '"') || prevCtx.includes("htmlFor='" + id + "'")) continue;
      }
      violations.push({ file: f.replace(/\\/g, '/'), line: i + 1, content: line.trim().substring(0, 80) });
    }
  } catch {}
}
console.log(JSON.stringify(violations, null, 2));
console.log('Total:', violations.length);
