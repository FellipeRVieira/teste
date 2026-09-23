<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/csrf.php';
forj3d_require_login();

$pdo = forj3d_db();
$products = $pdo->query('SELECT * FROM products ORDER BY sort_order ASC, id ASC')->fetchAll();

$coverStmt = $pdo->prepare(
    'SELECT path FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC LIMIT 1'
);

$flash = $_SESSION['flash'] ?? null;
unset($_SESSION['flash']);
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Produtos — Painel FORJ3D</title>
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
      <h1>Produtos</h1>
      <a href="product-form.php" class="btn btn-accent">+ Novo produto</a>
    </div>

    <?php if ($flash): ?>
      <div class="alert alert-<?= $flash['type'] === 'error' ? 'error' : 'success' ?>">
        <?= htmlspecialchars($flash['message'], ENT_QUOTES, 'UTF-8') ?>
      </div>
    <?php endif; ?>

    <div class="card" style="padding: 0; overflow-x: auto;">
      <?php if (!$products): ?>
        <div class="empty-state">
          Nenhum produto cadastrado ainda. Clique em "Novo produto" para começar.
        </div>
      <?php else: ?>
        <table class="products-table">
          <thead>
            <tr>
              <th></th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Destaque</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($products as $p): ?>
              <?php
                $coverStmt->execute([$p['id']]);
                $cover = $coverStmt->fetchColumn();
              ?>
              <tr>
                <td>
                  <?php if ($cover): ?>
                    <img class="thumb" src="../<?= htmlspecialchars($cover, ENT_QUOTES, 'UTF-8') ?>" alt="">
                  <?php else: ?>
                    <div class="thumb" style="display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:10px;">sem foto</div>
                  <?php endif; ?>
                </td>
                <td><?= htmlspecialchars($p['name'], ENT_QUOTES, 'UTF-8') ?></td>
                <td><?= htmlspecialchars($p['category'], ENT_QUOTES, 'UTF-8') ?></td>
                <td>R$ <?= number_format((float) $p['price'], 2, ',', '.') ?></td>
                <td><?php if ($p['featured']): ?><span class="badge-featured">Em destaque</span><?php endif; ?></td>
                <td>
                  <div class="row-actions">
                    <a class="btn btn-outline" href="product-form.php?id=<?= (int) $p['id'] ?>">Editar</a>
                    <form method="post" action="product-delete.php" onsubmit="return confirm('Excluir este produto? Essa ação não pode ser desfeita.');">
                      <?= forj3d_csrf_field() ?>
                      <input type="hidden" name="id" value="<?= (int) $p['id'] ?>">
                      <button type="submit" class="btn btn-danger">Excluir</button>
                    </form>
                  </div>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      <?php endif; ?>
    </div>
  </div>
</body>
</html>
