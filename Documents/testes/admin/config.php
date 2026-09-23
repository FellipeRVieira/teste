<?php
/**
 * FORJ3D — Configuração do painel de administração
 *
 * Preencha estes dados com os do banco MySQL criado no hPanel da
 * Hostinger (Bancos de Dados > Gerenciar). Depois de preencher,
 * este arquivo não precisa ser mexido de novo.
 */

// --- Banco de dados -----------------------------------------------
define('DB_HOST', 'localhost');
define('DB_NAME', 'troque_pelo_nome_do_banco');
define('DB_USER', 'troque_pelo_usuario');
define('DB_PASS', 'troque_pela_senha');

// --- Caminhos -------------------------------------------------------
// Pasta onde as fotos de produto são salvas (relativa à raiz do site).
define('UPLOAD_DIR', __DIR__ . '/../IMG/produtos');
define('UPLOAD_URL_BASE', 'IMG/produtos');

// Arquivo de catálogo que o painel gera sozinho — o site público lê
// esse arquivo pronto. Não é o mesmo que JS/products-data.js (esse
// aqui é só o catálogo; o outro tem configurações que continuam
// sendo mantidas pela HOD). Não precisa mexer aqui.
define('PRODUCTS_JS_PATH', __DIR__ . '/../JS/products-catalog.js');

// --- Sessão / segurança ----------------------------------------------
// Depois de 5 tentativas de senha erradas seguidas, a conta trava
// por este tempo (em minutos) antes de deixar tentar de novo.
define('LOGIN_MAX_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_MINUTES', 15);
