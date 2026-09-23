<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/csrf.php';
forj3d_require_login();

$pdo = forj3d_db();

$isEdit = isset($_GET['id']);
$product = [
    'id' => null,
    'name' => '',
    'price' => '',
    'category' => '',
    'material' => '',
    'icon' => '',
    'description' => '',
    'featured' => 0,
];
$images = [];

if ($isEdit) {
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([(int) $_GET['id']]);
    $found = $stmt->fetch();
    if (!$found) {
        header('Location: index.php');
        exit;
    }
    $product = $found;

    $imgStmt = $pdo->prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC');
    $imgStmt->execute([$product['id']]);
    $images = $imgStmt->fetchAll();
}

$iconOptions = [
    '' => '(nenhum / usar foto)',
    'controle' => 'Controle',
    'vaso' => 'Vaso',
    'luminaria' => 'Luminária',
    'celular' => 'Celular',
    'miniatura' => 'Miniatura',
    'organizador' => 'Organizador',
    'porta_chaves' => 'Porta-chaves',
    'quadro' => 'Quadro',
    'porta_copo' => 'Porta-copo',
];

$categoryOptions = ['Acessórios', 'Colecionáveis', 'Utilidades', 'Organizadores', 'Decoração'];
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= $isEdit ? 'Editar produto' : 'Novo produto' ?> — Painel FORJ3D</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="stylesheet" href="assets/admin.css">
</head>
<body>
  <div class="admin-topbar">
    <div class="brand">FORJ<span class="dot">3D</span> · painel</div>
    <a class="logout" href="logout.php">Sair</a>
  </div>

  <div class="admin-wrap">
    <div class="admin-header-row">
      <h1><?= $isEdit ? 'Editar produto' : 'Novo produto' ?></h1>
      <a href="index.php" class="btn btn-outline">← Voltar à lista</a>
    </div>

    <form class="card" method="post" action="product-save.php" enctype="multipart/form-data">
      <?= forj3d_csrf_field() ?>
      <?php if ($isEdit): ?><input type="hidden" name="id" value="<?= (int) $product['id'] ?>"><?php endif; ?>

      <div class="field">
        <label for="name">Nome do produto</label>
        <input type="text" id="name" name="name" required maxlength="160"
               value="<?= htmlspecialchars($product['name'], ENT_QUOTES, 'UTF-8') ?>">
      </div>

      <div class="field-row">
        <div class="field">
          <label for="price">Preço (R$)</label>
          <input type="number" id="price" name="price" required min="0" step="0.01"
                 value="<?= htmlspecialchars((string) $product['price'], ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="field">
          <label for="category">Categoria</label>
          <input type="text" id="category" name="category" list="category-list" required maxlength="80"
                 value="<?= htmlspecialchars($product['category'], ENT_QUOTES, 'UTF-8') ?>">
          <datalist id="category-list">
            <?php foreach ($categoryOptions as $c): ?>
              <option value="<?= htmlspecialchars($c, ENT_QUOTES, 'UTF-8') ?>">
            <?php endforeach; ?>
          </datalist>
        </div>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="material">Material (opcional)</label>
          <input type="text" id="material" name="material" maxlength="120" placeholder="Ex.: PLA · fosco"
                 value="<?= htmlspecialchars($product['material'], ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="field">
          <label for="icon">Ícone reserva (se não tiver foto)</label>
          <select id="icon" name="icon">
            <?php foreach ($iconOptions as $value => $label): ?>
              <option value="<?= htmlspecialchars($value, ENT_QUOTES, 'UTF-8') ?>" <?= $product['icon'] === $value ? 'selected' : '' ?>>
                <?= htmlspecialchars($label, ENT_QUOTES, 'UTF-8') ?>
              </option>
            <?php endforeach; ?>
          </select>
        </div>
      </div>

      <div class="field">
        <label for="description">Descrição</label>
        <textarea id="description" name="description" rows="4"><?= htmlspecialchars($product['description'], ENT_QUOTES, 'UTF-8') ?></textarea>
      </div>

      <label class="checkbox-row">
        <input type="checkbox" name="featured" value="1" <?= $product['featured'] ? 'checked' : '' ?>>
        Mostrar este produto na vitrine da página inicial
      </label>

      <div class="field">
        <label>Fotos do produto</label>

        <?php if ($images): ?>
          <div class="photo-grid">
            <?php foreach ($images as $img): ?>
              <div class="photo">
                <img src="../<?= htmlspecialchars($img['path'], ENT_QUOTES, 'UTF-8') ?>" alt="">
                <label title="Excluir esta foto" style="position:absolute; inset:auto 0 0 0; background:rgba(0,0,0,.55); color:#fff; font-size:11px; text-align:center; padding:3px 0; cursor:pointer;">
                  <input type="checkbox" name="delete_images[]" value="<?= (int) $img['id'] ?>" style="vertical-align:middle;">
                  excluir
                </label>
              </div>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>

        <div class="upload-drop">
          Adicionar novas fotos (JPG, PNG, GIF ou WebP — até 8MB cada; são otimizadas automaticamente)
          <br>
          <input type="file" name="photos[]" accept="image/*" multiple>
        </div>
      </div>

      <button type="submit" class="btn btn-accent">Salvar produto</button>
    </form>
  </div>
</body>
</html>
