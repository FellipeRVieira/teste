<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/csrf.php';
require_once __DIR__ . '/includes/upload.php';
require_once __DIR__ . '/includes/regenerate.php';
forj3d_require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

forj3d_csrf_check();

function forj3d_back_with_error(string $message, ?int $id): void {
    $_SESSION['flash'] = ['type' => 'error', 'message' => $message];
    $target = $id ? 'product-form.php?id=' . $id : 'product-form.php';
    header('Location: ' . $target);
    exit;
}

$id = isset($_POST['id']) ? (int) $_POST['id'] : null;
$name = trim($_POST['name'] ?? '');
$priceRaw = str_replace(',', '.', trim($_POST['price'] ?? ''));
$category = trim($_POST['category'] ?? '');
$material = trim($_POST['material'] ?? '');
$icon = trim($_POST['icon'] ?? '');
$description = trim($_POST['description'] ?? '');
$featured = !empty($_POST['featured']) ? 1 : 0;

if ($name === '') {
    forj3d_back_with_error('O nome do produto é obrigatório.', $id);
}
if (!is_numeric($priceRaw) || (float) $priceRaw < 0) {
    forj3d_back_with_error('Informe um preço válido.', $id);
}
if ($category === '') {
    forj3d_back_with_error('Informe a categoria.', $id);
}
$price = round((float) $priceRaw, 2);

$pdo = forj3d_db();

try {
    $pdo->beginTransaction();

    if ($id) {
        $stmt = $pdo->prepare('SELECT id FROM products WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            throw new RuntimeException('Produto não encontrado.');
        }

        $pdo->prepare(
            'UPDATE products SET name=?, price=?, category=?, material=?, icon=?, description=?, featured=? WHERE id=?'
        )->execute([$name, $price, $category, $material, $icon, $description, $featured, $id]);
    } else {
        // Produto novo sempre entra no fim da lista (maior sort_order + 1),
        // assim ele aparece depois dos que já existiam.
        $nextSort = (int) $pdo->query('SELECT COALESCE(MAX(sort_order), -1) + 1 FROM products')->fetchColumn();

        $pdo->prepare(
            'INSERT INTO products (name, price, category, material, icon, description, featured, sort_order) VALUES (?,?,?,?,?,?,?,?)'
        )->execute([$name, $price, $category, $material, $icon, $description, $featured, $nextSort]);
        $id = (int) $pdo->lastInsertId();
    }

    // ---- remove fotos marcadas para exclusão ----
    if (!empty($_POST['delete_images']) && is_array($_POST['delete_images'])) {
        $delIds = array_map('intval', $_POST['delete_images']);
        $placeholders = implode(',', array_fill(0, count($delIds), '?'));

        $stmt = $pdo->prepare("SELECT * FROM product_images WHERE product_id = ? AND id IN ($placeholders)");
        $stmt->execute([$id, ...$delIds]);
        $toDelete = $stmt->fetchAll();

        $pdo->prepare("DELETE FROM product_images WHERE product_id = ? AND id IN ($placeholders)")
            ->execute([$id, ...$delIds]);

        foreach ($toDelete as $img) {
            forj3d_delete_image_file($img['path']);
        }
    }

    // ---- novas fotos enviadas ----
    $slug = forj3d_slugify($name) . '-' . $id;
    $maxOrderStmt = $pdo->prepare('SELECT COALESCE(MAX(sort_order), -1) FROM product_images WHERE product_id = ?');
    $maxOrderStmt->execute([$id]);
    $nextOrder = (int) $maxOrderStmt->fetchColumn() + 1;

    if (!empty($_FILES['photos']) && is_array($_FILES['photos']['name'])) {
        $count = count($_FILES['photos']['name']);
        for ($i = 0; $i < $count; $i++) {
            if (($_FILES['photos']['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
                continue; // campo de arquivo vazio, ignora
            }
            $singleFile = [
                'name' => $_FILES['photos']['name'][$i],
                'type' => $_FILES['photos']['type'][$i],
                'tmp_name' => $_FILES['photos']['tmp_name'][$i],
                'error' => $_FILES['photos']['error'][$i],
                'size' => $_FILES['photos']['size'][$i],
            ];
            $path = forj3d_handle_uploaded_image($singleFile, $slug, $nextOrder);
            $pdo->prepare('INSERT INTO product_images (product_id, path, sort_order) VALUES (?,?,?)')
                ->execute([$id, $path, $nextOrder]);
            $nextOrder++;
        }
    }

    $pdo->commit();
    forj3d_regenerate_products_js();

    $_SESSION['flash'] = ['type' => 'success', 'message' => 'Produto salvo com sucesso.'];
    header('Location: index.php');
    exit;
} catch (Throwable $e) {
    $pdo->rollBack();
    forj3d_back_with_error('Não foi possível salvar: ' . $e->getMessage(), $id);
}
