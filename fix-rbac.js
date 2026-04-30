const fs = require('fs');

const filePath = 'src/lib/security/rbac.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Find the line with 'venimientos.search';
const pattern = /\| 'venimientos\.search';/;
if (pattern.test(content)) {
    content = content.replace(pattern, `| 'venimientos.search'
  | 'backup_restore'
  | 'brand_safety'
  | 'encryption'
  | 'health_monitoring'
  | 'sellos'
  | 'cortex'
  | 'politicas'
  | 'sso'
  | 'monitoreo';`);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('File updated successfully');
} else {
    console.log('Pattern not found. Current content around search:');
    const match = content.match(/venimientos\.search[^;]{0,50}/);
    if (match) console.log(match[0]);
}