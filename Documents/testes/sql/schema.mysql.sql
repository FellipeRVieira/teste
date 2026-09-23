-- =========================================================
-- FORJ3D — Painel de administração de produtos
-- Schema para MySQL (Hostinger)
--
-- Como usar na Hostinger:
-- 1. No hPanel, crie um banco de dados MySQL (Bancos de Dados > Gerenciar).
-- 2. Anote: nome do banco, usuário, senha, host (geralmente "localhost").
-- 3. Abra o phpMyAdmin desse banco e importe este arquivo (aba "Importar").
-- 4. Preencha esses dados em admin/config.php.
-- =========================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Usuário inicial "savio", ainda SEM senha utilizável de propósito
-- (o valor abaixo não corresponde a nenhuma senha real — é só pra
-- a conta já existir). O login só vai funcionar depois que você
-- rodar admin/set-password.php e definir a senha de verdade — veja
-- o passo a passo em admin/LEIA-ME-INSTALACAO.md.
INSERT INTO admin_users (username, password_hash) VALUES
  ('savio', '$2y$10$zez5YxTvitclYNPzBv5DTuSf0.BwskJwiMy8uRQhZzyTPzR11G2IW')
ON DUPLICATE KEY UPDATE username = username;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category VARCHAR(80) NOT NULL DEFAULT '',
  material VARCHAR(120) NOT NULL DEFAULT '',
  icon VARCHAR(40) NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  path VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
