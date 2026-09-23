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

$id = (int) ($_POST['id'] ?? 0);
$pdo = forj3d_db();

$stmt = $pdo->prepare('SELECT path FROM product_images WHERE product_id = ?');
$stmt->execute([$id]);
$images = $stmt->fetchAll();

$pdo->prepare('DELETE FROM products WHERE id = ?')->execute([$id]);

foreach ($images as $img) {
    forj3d_delete_image_file($img['path']);
}

forj3d_regenerate_products_js();

$_SESSION['flash'] = ['type' => 'success', 'message' => 'Produto excluído.'];
header('Location: index.php');
exit;
