import fs from 'node:fs';

const files = ['src/data/hero.json', 'src/data/rows.json', 'src/data/top.json', 'src/data/spotlights.json'];
for (const file of files) JSON.parse(fs.readFileSync(file, 'utf8'));

const rows = JSON.parse(fs.readFileSync('src/data/rows.json', 'utf8'));
const broken = rows.flatMap((row) => row.cards.filter((card) => !card.title || !card.href || !card.poster).map((card) => `${row.title}:${card.title ?? 'sin título'}`));
if (broken.length) {
  console.error(`Catálogo inválido: ${broken.join(', ')}`);
  process.exit(1);
}
console.log(`Catálogo local verificado: ${rows.reduce((count, row) => count + row.cards.length, 0)} tarjetas.`);
