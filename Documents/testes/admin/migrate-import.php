<?php
/**
 * Script de UMA VEZ SÓ: importa o catálogo que já existia em
 * JS/products-data.js (os produtos que a HOD cadastrava direto no
 * código) para dentro do banco de dados novo.
 *
 * Depois de rodar com sucesso, APAGUE este arquivo e
 * admin/migrate-data.json do servidor — eles não são mais
 * necessários no dia a dia, só nesta migração inicial.
 *
 * As FOTOS não são reenviadas nem re-otimizadas aqui — os arquivos
 * já existem em IMG/produtos/... e continuam exatamente onde estão;
 * este script só cadastra os caminhos delas no banco.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/includes/regenerate.php';

header('Content-Type: text/plain; charset=utf-8');

$pdo = forj3d_db();

$already = (int) $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
if ($already > 0 && empty($_GET['force'])) {
    echo "Já existem $already produto(s) no banco — a importação não foi repetida\n";
    echo "(pra rodar de novo mesmo assim, abra este arquivo com ?force=1 na URL).\n";
    exit;
}

$jsonPath = __DIR__ . '/migrate-data.json';
if (!is_file($jsonPath)) {
    exit("Não encontrei migrate-data.json na mesma pasta.\n");
}

$products = json_decode(file_get_contents($jsonPath), true);
if (!is_array($products)) {
    exit("migrate-data.json inválido.\n");
}

$pdo->beginTransaction();
try {
    if (!empty($_GET['force'])) {
        $pdo->exec('DELETE FROM product_images');
        $pdo->exec('DELETE FROM products');
    }

    $insertProduct = $pdo->prepare(
        'INSERT INTO products (id, name, price, category, material, icon, description, featured, sort_order)
         VALUES (?,?,?,?,?,?,?,0,?)'
    );
    $insertImage = $pdo->prepare(
        'INSERT INTO product_images (product_id, path, sort_order) VALUES (?,?,?)'
    );

    // Alguns produtos no arquivo antigo compartilhavam o mesmo "id"
    // por engano (copiar/colar). Aqui a gente detecta isso e dá um
    // id novo pro duplicado, em vez de travar a importação.
    $maxId = 0;
    foreach ($products as $p) {
        $maxId = max($maxId, (int) ($p['id'] ?? 0));
    }
    $nextFreeId = $maxId + 1;
    $seenIds = [];
    $renamed = [];

    foreach ($products as $order => $p) {
        $id = (int) ($p['id'] ?? 0);
        if ($id <= 0) continue;

        if (isset($seenIds[$id])) {
            $oldId = $id;
            $id = $nextFreeId++;
            $renamed[] = "\"{$p['name']}\" tinha o mesmo id que outro produto (#$oldId) — recadastrado como #$id";
        }
        $seenIds[$id] = true;

        // Hoje a Home mostra sempre estes produtos fixos no código
        // (JS/index.js, variável featuredIds). Pra ninguém sentir
        // diferença assim que o painel entrar no ar, marcamos esses
        // mesmos como "em destaque" — dali em diante, quem decide isso
        // é o checkbox no formulário, não mais o código.
        $wasFeaturedBefore = in_array($id, [80, 108, 5, 4, 3, 45, 78], true) ? 1 : 0;

        $insertProduct->execute([
            $id,
            (string) ($p['name'] ?? ''),
            (float) ($p['price'] ?? 0),
            (string) ($p['category'] ?? ''),
            (string) ($p['material'] ?? ''),
            (string) ($p['icon'] ?? ''),
            (string) ($p['description'] ?? ''),
            $order,
        ]);
        $pdo->prepare('UPDATE products SET featured = ? WHERE id = ?')->execute([$wasFeaturedBefore, $id]);

        foreach (($p['images'] ?? []) as $i => $path) {
            if (!$path) continue;
            $insertImage->execute([$id, $path, $i]);
        }
    }

    // Próximo produto novo continua a numeração depois do maior ID importado.
    $pdo->exec('ALTER TABLE products AUTO_INCREMENT = ' . $nextFreeId);

    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    exit('Erro na importação: ' . $e->getMessage() . "\n");
}

forj3d_regenerate_products_js();

$count = count($products);
echo "Importação concluída: $count produtos cadastrados no banco.\n";
echo "JS/products-catalog.js foi gerado.\n\n";

if ($renamed) {
    echo "Aviso — alguns produtos tinham o mesmo número de identificação\n";
    echo "por engano no arquivo antigo e foram recadastrados com um novo:\n";
    foreach ($renamed as $line) {
        echo " - $line\n";
    }
    echo "\n";
}

echo "Agora apague admin/migrate-import.php e admin/migrate-data.json do servidor.\n";
