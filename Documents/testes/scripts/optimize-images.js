#!/usr/bin/env node
/* =========================================================
   FORJ3D — Otimizador de imagens de produtos
   ---------------------------------------------------------
   Gera, para cada foto original em IMG/produtos/**:
     nome.jpeg  ->  nome.webp         (versão "cheia": galeria/zoom)
                    nome-thumb.webp   (versão pequena: cards/miniaturas)

   As fotos originais NÃO são apagadas nem alteradas — ficam
   como estão no repositório, apenas como matéria-prima. O site
   passa a carregar as versões .webp, que são MUITO mais leves.

   USO:
     npm install         (só na primeira vez, instala o sharp)
     npm run optimize-images

   Rode isso sempre que adicionar fotos novas de produtos, antes
   de publicar o site.
========================================================= */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR = path.join(__dirname, '..', 'IMG', 'produtos');

const FULL_MAX = 1800;    // lado maior da versão grande (galeria + zoom)
const FULL_QUALITY = 80;
const THUMB_MAX = 480;    // lado maior da miniatura (cards/grade)
const THUMB_QUALITY = 70;

// GIFs animados (giro/detalhe de produto) pesam muito mais por serem
// várias dezenas de frames em resolução crua — usamos um teto de
// tamanho e qualidade mais agressivos só para eles.
const GIF_FULL_MAX = 800;
const GIF_FULL_QUALITY = 60;
const GIF_THUMB_MAX = 480;
const GIF_THUMB_QUALITY = 55;

const SOURCE_EXT = /\.(jpe?g|png|gif)$/i;
const GIF_EXT = /\.gif$/i;
const CONCURRENCY = 4; // processa N imagens em paralelo (evita estourar memória)

let processed = 0;
let skipped = 0;
let originalBytes = 0;
let newBytes = 0;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (SOURCE_EXT.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function processFile(srcPath) {
  const fullOut = srcPath.replace(SOURCE_EXT, '.webp');
  const thumbOut = srcPath.replace(SOURCE_EXT, '-thumb.webp');
  const srcStat = fs.statSync(srcPath);

  const needsFull = !fs.existsSync(fullOut) || fs.statSync(fullOut).mtimeMs < srcStat.mtimeMs;
  const needsThumb = !fs.existsSync(thumbOut) || fs.statSync(thumbOut).mtimeMs < srcStat.mtimeMs;

  if (!needsFull && !needsThumb) {
    skipped++;
    return;
  }

  const isGif = GIF_EXT.test(srcPath);
  const fullMax = isGif ? GIF_FULL_MAX : FULL_MAX;
  const fullQuality = isGif ? GIF_FULL_QUALITY : FULL_QUALITY;
  const thumbMax = isGif ? GIF_THUMB_MAX : THUMB_MAX;
  const thumbQuality = isGif ? GIF_THUMB_QUALITY : THUMB_QUALITY;
  // {animated:true} preserva todos os frames do GIF na conversão;
  // para jpeg/png não faz diferença (imagem de frame único).
  const readOpts = isGif ? { animated: true } : {};

  try {
    if (needsFull) {
      await sharp(srcPath, readOpts)
        .rotate() // respeita a orientação EXIF (fotos de celular)
        .resize({ width: fullMax, height: fullMax, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: fullQuality })
        .toFile(fullOut);
    }
    if (needsThumb) {
      await sharp(srcPath, readOpts)
        .rotate()
        .resize({ width: thumbMax, height: thumbMax, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: thumbQuality })
        .toFile(thumbOut);
    }

    originalBytes += srcStat.size;
    newBytes += (fs.existsSync(fullOut) ? fs.statSync(fullOut).size : 0)
              + (fs.existsSync(thumbOut) ? fs.statSync(thumbOut).size : 0);
    processed++;
    process.stdout.write(`\rProcessadas: ${processed}  |  Puladas (já otimizadas): ${skipped}   `);
  } catch (err) {
    console.error(`\nErro ao processar ${srcPath}:`, err.message);
  }
}

async function runQueue(files) {
  let index = 0;
  async function worker() {
    while (index < files.length) {
      const current = files[index++];
      await processFile(current);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

(async () => {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`Pasta não encontrada: ${SRC_DIR}`);
    process.exit(1);
  }

  console.log('Procurando fotos de produtos...');
  const files = walk(SRC_DIR);
  console.log(`Encontradas ${files.length} fotos/gifs (jpg/jpeg/png/gif).\n`);

  await runQueue(files);

  console.log('\n\n=========================================');
  console.log(`Concluído!`);
  console.log(`Imagens novas/atualizadas: ${processed}`);
  console.log(`Imagens já otimizadas (puladas): ${skipped}`);
  if (processed > 0) {
    console.log(`Tamanho original (dessas ${processed}): ${formatMB(originalBytes)}`);
    console.log(`Tamanho novo (.webp full+thumb):        ${formatMB(newBytes)}`);
    console.log(`Economia: ${(100 - (newBytes / originalBytes * 100)).toFixed(1)}%`);
  }
  console.log('=========================================');
})();
