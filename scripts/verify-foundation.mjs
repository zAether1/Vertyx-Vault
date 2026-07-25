import fs from 'node:fs';
import path from 'node:path';

const requiredFiles = [
  'src/app/api/catalog/search/route.ts',
  'src/app/api/catalog/[id]/source/route.ts',
  'src/app/api/library/route.ts',
  'src/app/api/session/route.ts',
  'src/app/profile/page.tsx',
  'src/server/catalog/remote.ts',
  'src/server/library/sync.ts',
  'src/server/session/index.ts',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Falta archivo requerido: ${file}`);
    process.exit(1);
  }
}

const layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
for (const token of ['<Analytics />', '<SpeedInsights />', '<LibrarySync />']) {
  if (!layout.includes(token)) {
    console.error(`Layout sin instrumentación requerida: ${token}`);
    process.exit(1);
  }
}

const navigation = fs.readFileSync('src/data/navigation.ts', 'utf8');
for (const route of ['/library', '/profile']) {
  if (!navigation.includes(route)) {
    console.error(`Navegación sin ruta requerida: ${route}`);
    process.exit(1);
  }
}

const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (/\.(tsx|ts)$/.test(entry.name)) sourceFiles.push(fullPath);
  }
}
walk('src');
const missingAlt = sourceFiles.filter((file) => /<img\b/i.test(fs.readFileSync(file, 'utf8')) && !/alt=/.test(fs.readFileSync(file, 'utf8')));
if (missingAlt.length) {
  console.error(`Imágenes sin alt detectadas: ${missingAlt.join(', ')}`);
  process.exit(1);
}
console.log('Fundación verificada: rutas, observabilidad, navegación y alt básicos correctos.');
