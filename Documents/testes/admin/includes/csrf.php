<?php
/**
 * Proteção contra CSRF: gera um token por sessão e confere ele em
 * todo formulário que muda dado (salvar/excluir produto).
 * Sem isso, um site malicioso poderia forçar o navegador do Sávio,
 * enquanto ele está logado, a excluir produtos sem ele saber.
 */

function forj3d_csrf_token(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function forj3d_csrf_field(): string {
    $token = htmlspecialchars(forj3d_csrf_token(), ENT_QUOTES, 'UTF-8');
    return '<input type="hidden" name="csrf_token" value="' . $token . '">';
}

function forj3d_csrf_check(): void {
    $sent = $_POST['csrf_token'] ?? '';
    $expected = $_SESSION['csrf_token'] ?? '';
    if (!$expected || !hash_equals($expected, $sent)) {
        http_response_code(400);
        exit('Sessão expirada ou formulário inválido. Volte e tente novamente.');
    }
}
