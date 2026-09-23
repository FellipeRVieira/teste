<?php
require_once __DIR__ . '/includes/auth.php';
forj3d_start_session();

if (!empty($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = (string) ($_POST['password'] ?? '');

    if ($username === '' || $password === '') {
        $error = 'Preencha usuário e senha.';
    } elseif (forj3d_attempt_login($username, $password)) {
        header('Location: index.php');
        exit;
    } else {
        $error = 'Usuário ou senha incorretos, ou a conta está temporariamente bloqueada por várias tentativas erradas.';
    }
}
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Entrar — Painel FORJ3D</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="stylesheet" href="assets/admin.css">
</head>
<body>
  <div class="login-shell">
    <div class="login-card">
      <h1>Painel FORJ3D</h1>
      <p class="sub">Cadastro de produtos</p>

      <?php if ($error): ?>
        <div class="alert alert-error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
      <?php endif; ?>

      <form method="post" novalidate>
        <div class="field">
          <label for="username">Usuário</label>
          <input type="text" id="username" name="username" autocomplete="username" required autofocus>
        </div>
        <div class="field">
          <label for="password">Senha</label>
          <input type="password" id="password" name="password" autocomplete="current-password" required>
        </div>
        <button type="submit" class="btn btn-accent" style="width:100%; justify-content:center;">Entrar</button>
      </form>
    </div>
  </div>
</body>
</html>
