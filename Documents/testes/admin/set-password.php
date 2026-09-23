<?php
/**
 * Utilitário de UMA VEZ SÓ pra definir a senha real do Sávio.
 *
 * IMPORTANTE: depois de usar este arquivo, APAGUE-O do servidor
 * (pelo Gerenciador de Arquivos da Hostinger ou por FTP). Deixá-lo
 * no ar permitiria que qualquer pessoa trocasse a senha do painel.
 */

require_once __DIR__ . '/db.php';

$message = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = (string) ($_POST['password'] ?? '');
    $confirm = (string) ($_POST['confirm'] ?? '');

    if ($username === '' || $password === '') {
        $message = 'Preencha usuário e senha.';
    } elseif (strlen($password) < 8) {
        $message = 'Use uma senha com pelo menos 8 caracteres.';
    } elseif ($password !== $confirm) {
        $message = 'As senhas não são iguais.';
    } else {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $pdo = forj3d_db();
        $stmt = $pdo->prepare(
            'UPDATE admin_users SET password_hash = ?, failed_attempts = 0, locked_until = NULL WHERE username = ?'
        );
        $stmt->execute([$hash, $username]);

        if ($stmt->rowCount() > 0) {
            $success = true;
            $message = 'Senha atualizada! Agora apague este arquivo (set-password.php) do servidor e faça login normalmente.';
        } else {
            $message = 'Não encontrei um usuário com esse nome no banco (confira o schema.mysql.sql — o usuário padrão é "savio").';
        }
    }
}
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Definir senha — Painel FORJ3D</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="stylesheet" href="assets/admin.css">
</head>
<body>
  <div class="login-shell">
    <div class="login-card" style="max-width: 420px;">
      <h1>Definir a senha do painel</h1>
      <p class="sub">Use esta página uma única vez para trocar a senha temporária. Depois, apague este arquivo do servidor.</p>

      <?php if ($message): ?>
        <div class="alert <?= $success ? 'alert-success' : 'alert-error' ?>"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></div>
      <?php endif; ?>

      <?php if (!$success): ?>
        <form method="post">
          <div class="field">
            <label for="username">Usuário</label>
            <input type="text" id="username" name="username" value="savio" required>
          </div>
          <div class="field">
            <label for="password">Nova senha</label>
            <input type="password" id="password" name="password" required minlength="8">
          </div>
          <div class="field">
            <label for="confirm">Confirmar nova senha</label>
            <input type="password" id="confirm" name="confirm" required minlength="8">
          </div>
          <button type="submit" class="btn btn-accent" style="width:100%; justify-content:center;">Salvar senha</button>
        </form>
      <?php else: ?>
        <a href="login.php" class="btn btn-outline" style="width:100%; justify-content:center;">Ir para o login</a>
      <?php endif; ?>
    </div>
  </div>
</body>
</html>
