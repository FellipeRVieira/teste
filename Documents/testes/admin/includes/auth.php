<?php
/**
 * Autenticação do painel: login com usuário/senha guardados no banco
 * (senha sempre com hash, nunca em texto puro), sessão segura e
 * bloqueio temporário depois de várias senhas erradas seguidas
 * (evita que alguém fique tentando adivinhar a senha sem parar).
 */

require_once __DIR__ . '/../db.php';

function forj3d_start_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => !empty($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

/** Chame isso no topo de toda página que só o Sávio pode ver. */
function forj3d_require_login(): void {
    forj3d_start_session();
    if (empty($_SESSION['admin_id'])) {
        header('Location: login.php');
        exit;
    }
}

function forj3d_is_locked(array $user): bool {
    return !empty($user['locked_until']) && strtotime($user['locked_until']) > time();
}

/**
 * Confere usuário/senha. Retorna true/false e cuida de contar
 * tentativas erradas e travar a conta temporariamente se precisar.
 */
function forj3d_attempt_login(string $username, string $password): bool {
    $pdo = forj3d_db();

    $stmt = $pdo->prepare('SELECT * FROM admin_users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        // Mesmo sem achar o usuário, "gastamos" um tempinho parecido
        // com o de verificar senha, pra não dar pista por tempo de resposta.
        password_verify($password, '$2y$10$invalidinvalidinvalidinvalidinvalidinvalidinvalid');
        return false;
    }

    if (forj3d_is_locked($user)) {
        return false;
    }

    if (password_verify($password, $user['password_hash'])) {
        $pdo->prepare('UPDATE admin_users SET failed_attempts = 0, locked_until = NULL WHERE id = ?')
            ->execute([$user['id']]);

        forj3d_start_session();
        session_regenerate_id(true);
        $_SESSION['admin_id'] = $user['id'];
        $_SESSION['admin_username'] = $user['username'];
        return true;
    }

    $attempts = (int) $user['failed_attempts'] + 1;
    if ($attempts >= LOGIN_MAX_ATTEMPTS) {
        $lockedUntil = date('Y-m-d H:i:s', time() + LOGIN_LOCKOUT_MINUTES * 60);
        $pdo->prepare('UPDATE admin_users SET failed_attempts = ?, locked_until = ? WHERE id = ?')
            ->execute([$attempts, $lockedUntil, $user['id']]);
    } else {
        $pdo->prepare('UPDATE admin_users SET failed_attempts = ? WHERE id = ?')
            ->execute([$attempts, $user['id']]);
    }
    return false;
}

function forj3d_logout(): void {
    forj3d_start_session();
    $_SESSION = [];
    session_destroy();
}
