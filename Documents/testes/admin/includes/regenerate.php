<?php
/**
 * Depois de qualquer salvar/excluir, regeneramos o arquivo
 * JS/products-catalog.js a partir do banco. O site público continua
 * lendo um arquivo .js estático (rápido, sem consultar banco a cada
 * visita) — só que agora esse arquivo é escrito pelo painel, não
 * digitado à mão.
 *
 * products-data.js (configurações, ícones, regras de cookie) não é
 * tocado por essa função — só o catálogo de produtos vive no banco.
 */

function forj3d_regenerate_products_js(): void {
    $pdo = forj3d_db();

    $products = $pdo->query(
        'SELECT * FROM products ORDER BY sort_order ASC, id ASC'
    )->fetchAll();

    $imagesStmt = $pdo->prepare(
        'SELECT path FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC'
    );

    $lines = [];
    $lines[] = '/* =========================================================';
    $lines[] = '   FORJ3D — Catálogo de produtos';
    $lines[] = '   GERADO AUTOMATICAMENTE pelo painel em admin/.';
    $lines[] = '   Não edite este arquivo à mão — a próxima alteração no';
    $lines[] = '   painel sobrescreve qualquer edição manual feita aqui.';
    $lines[] = '   ========================================================= */';
    $lines[] = '';
    $lines[] = 'window.FORJ3D_PRODUCTS = [';

    foreach ($products as $i => $p) {
        $imagesStmt->execute([$p['id']]);
        $images = array_column($imagesStmt->fetchAll(), 'path');

        $lines[] = '  {';
        $lines[] = '    id: ' . (int) $p['id'] . ',';
        $lines[] = '    name: ' . forj3d_js_string($p['name']) . ',';
        $lines[] = '    price: ' . number_format((float) $p['price'], 2, '.', '') . ',';
        $lines[] = '    category: ' . forj3d_js_string($p['category']) . ',';
        $lines[] = '    icon: ' . forj3d_js_string($p['icon']) . ',';
        $lines[] = '    material: ' . forj3d_js_string($p['material']) . ',';
        $lines[] = '    featured: ' . ($p['featured'] ? 'true' : 'false') . ',';
        $lines[] = '    images: [' . implode(', ', array_map('forj3d_js_string', $images)) . '],';
        $lines[] = '    description: ' . forj3d_js_string($p['description']);
        $lines[] = '  }' . ($i < count($products) - 1 ? ',' : '');
    }

    $lines[] = '];';
    $lines[] = '';

    $tmpPath = PRODUCTS_JS_PATH . '.tmp';
    file_put_contents($tmpPath, implode("\n", $lines));
    rename($tmpPath, PRODUCTS_JS_PATH); // troca atômica — nunca deixa o arquivo pela metade
}

/** Converte uma string PHP num literal de string JS seguro (aspas, quebras de linha, etc). */
function forj3d_js_string(?string $value): string {
    return json_encode($value ?? '', JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
