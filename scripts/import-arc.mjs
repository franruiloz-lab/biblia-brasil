#!/usr/bin/env node
/**
 * import-arc.mjs
 *
 * Importa o texto completo da Bíblia (ARC) para todos os 1.189 capítulos.
 * Fonte: thiagobodruk/biblia no GitHub (domínio público)
 *
 * - NÃO sobrescreve arquivos já existentes (preserva o conteúdo rico manual)
 * - Cria apenas os capítulos que ainda não têm arquivo JSON
 *
 * Uso:
 *   node scripts/import-arc.mjs
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../src/data/biblia');

// URLs para tentar em ordem (aa = Almeida Atualizada, arc = Almeida Revista e Corrigida)
const URLS = [
  'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/aa.json',
  'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/arc.json',
];

// Mapeamento de abreviações do dataset → slugs e metadados do projeto
const LIVROS = [
  { abbrev: 'gn',  slug: 'genesis',            nome: 'Gênesis',            testamento: 'AT', autor: 'Moisés' },
  { abbrev: 'ex',  slug: 'exodo',               nome: 'Êxodo',              testamento: 'AT', autor: 'Moisés' },
  { abbrev: 'lv',  slug: 'levitico',            nome: 'Levítico',           testamento: 'AT', autor: 'Moisés' },
  { abbrev: 'nm',  slug: 'numeros',             nome: 'Números',            testamento: 'AT', autor: 'Moisés' },
  { abbrev: 'dt',  slug: 'deuteronomio',        nome: 'Deuteronômio',       testamento: 'AT', autor: 'Moisés' },
  { abbrev: 'js',  slug: 'josue',               nome: 'Josué',              testamento: 'AT', autor: 'Josué' },
  { abbrev: 'jz',  slug: 'juizes',              nome: 'Juízes',             testamento: 'AT', autor: 'Desconhecido' },
  { abbrev: 'rt',  slug: 'rute',                nome: 'Rute',               testamento: 'AT', autor: 'Desconhecido' },
  { abbrev: '1sm', slug: '1-samuel',            nome: '1 Samuel',           testamento: 'AT', autor: 'Samuel / Natã / Gade' },
  { abbrev: '2sm', slug: '2-samuel',            nome: '2 Samuel',           testamento: 'AT', autor: 'Natã / Gade' },
  { abbrev: '1rs', slug: '1-reis',              nome: '1 Reis',             testamento: 'AT', autor: 'Jeremias (tradição)' },
  { abbrev: '2rs', slug: '2-reis',              nome: '2 Reis',             testamento: 'AT', autor: 'Jeremias (tradição)' },
  { abbrev: '1cr', slug: '1-cronicas',          nome: '1 Crônicas',         testamento: 'AT', autor: 'Esdras (tradição)' },
  { abbrev: '2cr', slug: '2-cronicas',          nome: '2 Crônicas',         testamento: 'AT', autor: 'Esdras (tradição)' },
  { abbrev: 'ed',  slug: 'esdras',              nome: 'Esdras',             testamento: 'AT', autor: 'Esdras' },
  { abbrev: 'ne',  slug: 'neemias',             nome: 'Neemias',            testamento: 'AT', autor: 'Neemias / Esdras' },
  { abbrev: 'et',  slug: 'ester',               nome: 'Ester',              testamento: 'AT', autor: 'Mardoqueu (tradição)' },
  { abbrev: 'jó',  slug: 'jo',                  nome: 'Jó',                 testamento: 'AT', autor: 'Desconhecido' },
  { abbrev: 'sl',  slug: 'salmos',              nome: 'Salmos',             testamento: 'AT', autor: 'Davi e outros' },
  { abbrev: 'pv',  slug: 'proverbios',          nome: 'Provérbios',         testamento: 'AT', autor: 'Salomão e outros' },
  { abbrev: 'ec',  slug: 'eclesiastes',         nome: 'Eclesiastes',        testamento: 'AT', autor: 'Salomão' },
  { abbrev: 'ct',  slug: 'cantares',            nome: 'Cantares',           testamento: 'AT', autor: 'Salomão' },
  { abbrev: 'is',  slug: 'isaias',              nome: 'Isaías',             testamento: 'AT', autor: 'Isaías' },
  { abbrev: 'jr',  slug: 'jeremias',            nome: 'Jeremias',           testamento: 'AT', autor: 'Jeremias' },
  { abbrev: 'lm',  slug: 'lamentacoes',         nome: 'Lamentações',        testamento: 'AT', autor: 'Jeremias' },
  { abbrev: 'ez',  slug: 'ezequiel',            nome: 'Ezequiel',           testamento: 'AT', autor: 'Ezequiel' },
  { abbrev: 'dn',  slug: 'daniel',              nome: 'Daniel',             testamento: 'AT', autor: 'Daniel' },
  { abbrev: 'os',  slug: 'oseias',              nome: 'Oseias',             testamento: 'AT', autor: 'Oseias' },
  { abbrev: 'jl',  slug: 'joel',                nome: 'Joel',               testamento: 'AT', autor: 'Joel' },
  { abbrev: 'am',  slug: 'amos',                nome: 'Amós',               testamento: 'AT', autor: 'Amós' },
  { abbrev: 'ob',  slug: 'obadias',             nome: 'Obadias',            testamento: 'AT', autor: 'Obadias' },
  { abbrev: 'jn',  slug: 'jonas',               nome: 'Jonas',              testamento: 'AT', autor: 'Jonas' },
  { abbrev: 'mq',  slug: 'miqueias',            nome: 'Miquéias',           testamento: 'AT', autor: 'Miquéias' },
  { abbrev: 'na',  slug: 'naum',                nome: 'Naum',               testamento: 'AT', autor: 'Naum' },
  { abbrev: 'hc',  slug: 'habacuque',           nome: 'Habacuque',          testamento: 'AT', autor: 'Habacuque' },
  { abbrev: 'sf',  slug: 'sofonias',            nome: 'Sofonias',           testamento: 'AT', autor: 'Sofonias' },
  { abbrev: 'ag',  slug: 'ageu',                nome: 'Ageu',               testamento: 'AT', autor: 'Ageu' },
  { abbrev: 'zc',  slug: 'zacarias',            nome: 'Zacarias',           testamento: 'AT', autor: 'Zacarias' },
  { abbrev: 'ml',  slug: 'malaquias',           nome: 'Malaquias',          testamento: 'AT', autor: 'Malaquias' },
  { abbrev: 'mt',  slug: 'mateus',              nome: 'Mateus',             testamento: 'NT', autor: 'Mateus (apóstolo)' },
  { abbrev: 'mc',  slug: 'marcos',              nome: 'Marcos',             testamento: 'NT', autor: 'João Marcos' },
  { abbrev: 'lc',  slug: 'lucas',               nome: 'Lucas',              testamento: 'NT', autor: 'Lucas (médico)' },
  { abbrev: 'jo',  slug: 'joao',                nome: 'João',               testamento: 'NT', autor: 'João (apóstolo)' },
  { abbrev: 'at',   slug: 'atos',               nome: 'Atos',               testamento: 'NT', autor: 'Lucas (médico)' },
  { abbrev: 'atos', slug: 'atos',              nome: 'Atos',               testamento: 'NT', autor: 'Lucas (médico)' },
  { abbrev: 'rm',  slug: 'romanos',             nome: 'Romanos',            testamento: 'NT', autor: 'Paulo (apóstolo)' },
  { abbrev: '1co', slug: '1-corintios',         nome: '1 Coríntios',        testamento: 'NT', autor: 'Paulo (apóstolo)' },
  { abbrev: '2co', slug: '2-corintios',         nome: '2 Coríntios',        testamento: 'NT', autor: 'Paulo (apóstolo)' },
  { abbrev: 'gl',  slug: 'galatas',             nome: 'Gálatas',            testamento: 'NT', autor: 'Paulo (apóstolo)' },
  { abbrev: 'ef',  slug: 'efesios',             nome: 'Efésios',            testamento: 'NT', autor: 'Paulo (apóstolo)' },
  { abbrev: 'fp',  slug: 'filipenses',          nome: 'Filipenses',         testamento: 'NT', autor: 'Paulo (apóstolo)' },
  { abbrev: 'cl',  slug: 'colossenses',         nome: 'Colossenses',        testamento: 'NT', autor: 'Paulo (apóstolo)' },
  { abbrev: '1ts', slug: '1-tessalonicenses',   nome: '1 Tessalonicenses',  testamento: 'NT', autor: 'Paulo (apóstolo)' },
  { abbrev: '2ts', slug: '2-tessalonicenses',   nome: '2 Tessalonicenses',  testamento: 'NT', autor: 'Paulo (apóstolo)' },
  { abbrev: '1tm', slug: '1-timoteo',           nome: '1 Timóteo',          testamento: 'NT', autor: 'Paulo (apóstolo)' },
  { abbrev: '2tm', slug: '2-timoteo',           nome: '2 Timóteo',          testamento: 'NT', autor: 'Paulo (apóstolo)' },
  { abbrev: 'tt',  slug: 'tito',                nome: 'Tito',               testamento: 'NT', autor: 'Paulo (apóstolo)' },
  { abbrev: 'fm',  slug: 'filemom',             nome: 'Filemom',            testamento: 'NT', autor: 'Paulo (apóstolo)' },
  { abbrev: 'hb',  slug: 'hebreus',             nome: 'Hebreus',            testamento: 'NT', autor: 'Desconhecido' },
  { abbrev: 'tg',  slug: 'tiago',               nome: 'Tiago',              testamento: 'NT', autor: 'Tiago (irmão de Jesus)' },
  { abbrev: '1pe', slug: '1-pedro',             nome: '1 Pedro',            testamento: 'NT', autor: 'Pedro (apóstolo)' },
  { abbrev: '2pe', slug: '2-pedro',             nome: '2 Pedro',            testamento: 'NT', autor: 'Pedro (apóstolo)' },
  { abbrev: '1jo', slug: '1-joao',              nome: '1 João',             testamento: 'NT', autor: 'João (apóstolo)' },
  { abbrev: '2jo', slug: '2-joao',              nome: '2 João',             testamento: 'NT', autor: 'João (apóstolo)' },
  { abbrev: '3jo', slug: '3-joao',              nome: '3 João',             testamento: 'NT', autor: 'João (apóstolo)' },
  { abbrev: 'jd',  slug: 'judas',               nome: 'Judas',              testamento: 'NT', autor: 'Judas (irmão de Jesus)' },
  { abbrev: 'ap',  slug: 'apocalipse',          nome: 'Apocalipse',         testamento: 'NT', autor: 'João (apóstolo)' },
];

// Índice para lookup rápido
const LIVRO_MAP = new Map(LIVROS.map(l => [l.abbrev, l]));

// --- Baixar dados ---
console.log('📖 Bíblia Brasil — Importador ARC\n');

let bibleData = null;
for (const url of URLS) {
  console.log(`⏳ Tentando: ${url}`);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    bibleData = await res.json();
    console.log(`✅ Dados baixados com sucesso!\n`);
    break;
  } catch (err) {
    console.warn(`   Falhou: ${err.message}`);
  }
}

if (!bibleData) {
  console.error('\n❌ Não foi possível baixar os dados. Verifique a conexão e tente novamente.');
  process.exit(1);
}

// --- Processar e salvar ---
let criados = 0;
let pulados = 0;
let livrosNaoMapeados = [];

for (const book of bibleData) {
  const info = LIVRO_MAP.get(book.abbrev);

  if (!info) {
    livrosNaoMapeados.push(`${book.abbrev} (${book.name})`);
    continue;
  }

  const bookDir = join(DATA_DIR, info.slug);
  if (!existsSync(bookDir)) {
    mkdirSync(bookDir, { recursive: true });
  }

  let criadosNesteLivro = 0;
  let puladosNesteLivro = 0;

  for (let capIdx = 0; capIdx < book.chapters.length; capIdx++) {
    const capNum = capIdx + 1;
    const filePath = join(bookDir, `${capNum}.json`);

    // Preserva arquivos existentes (conteúdo rico manual)
    if (existsSync(filePath)) {
      pulados++;
      puladosNesteLivro++;
      continue;
    }

    const versiculos = book.chapters[capIdx].map((texto, verIdx) => ({
      numero: verIdx + 1,
      versoes: { ARC: texto },
      temas: [],
      versiculosRelacionados: [],
      faq: [],
    }));

    const capitulo = {
      livro: info.slug,
      livroNome: info.nome,
      capitulo: capNum,
      testamento: info.testamento,
      titulo: '',
      autor: info.autor,
      versiculos,
      explicacao: {
        introducao: '',
        contexto: '',
        aplicacao: '',
      },
      versiculosDestaque: [],
      temas: [],
      versiculosRelacionadosExternos: [],
    };

    writeFileSync(filePath, JSON.stringify(capitulo, null, 2), 'utf-8');
    criados++;
    criadosNesteLivro++;
  }

  const status = puladosNesteLivro > 0
    ? `✅ ${info.nome.padEnd(22)} ${book.chapters.length} caps  (${puladosNesteLivro} preservados)`
    : `✅ ${info.nome.padEnd(22)} ${book.chapters.length} caps`;
  console.log(status);
}

// --- Relatório final ---
console.log('\n' + '─'.repeat(50));
console.log('📊 Relatório final:');
console.log(`   ✅ Criados:    ${criados} arquivos novos`);
console.log(`   ⏭️  Preservados: ${pulados} arquivos existentes (conteúdo rico mantido)`);
console.log(`   📚 Total:      ${criados + pulados} capítulos`);

if (livrosNaoMapeados.length > 0) {
  console.log(`\n⚠️  Livros não mapeados (verificar abbrev):`);
  livrosNaoMapeados.forEach(l => console.log(`   - ${l}`));
}

console.log('\n🎉 Importação concluída!');
console.log('   Execute "npm run build" para gerar todas as páginas.\n');
