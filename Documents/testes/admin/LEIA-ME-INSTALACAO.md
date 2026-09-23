# Painel de produtos FORJ3D — instalação na Hostinger

Este painel deixa o Sávio cadastrar, editar e excluir produtos sozinho
(com fotos), sem precisar pedir pra HOD mexer no código. Ele usa o
PHP + MySQL que já vêm inclusos no plano de hospedagem — **não tem
nenhum custo extra**.

## O que muda no site

- O catálogo de produtos deixa de morar em `JS/products-data.js` (que
  continua existindo, só que agora só tem configurações/ícones).
- Agora ele mora num banco de dados, e um arquivo novo —
  `JS/products-catalog.js` — é **gerado sozinho** pelo painel toda vez
  que algo é salvo. O site público continua igual, só lendo um arquivo
  `.js` (rápido, sem consultar banco a cada visita).
- A Home também muda: os produtos "em destaque" da vitrine agora vêm
  de um checkbox no formulário, não mais de uma lista fixa no código.

## Passo a passo (uma vez só)

**1. Criar o banco de dados**
No hPanel da Hostinger: **Bancos de Dados → Gerenciar → Criar novo
banco MySQL**. Anote o nome do banco, o usuário e a senha gerados.

**2. Importar a estrutura**
Abra o **phpMyAdmin** desse banco (ainda no hPanel) → aba **Importar**
→ selecione o arquivo `sql/schema.mysql.sql` deste pacote → Executar.

**3. Subir os arquivos**
Envie estas pastas/arquivos pro seu `public_html` (pelo Gerenciador de
Arquivos ou por SFTP), mantendo a mesma estrutura:
- `admin/` (o painel inteiro)
- `JS/products-data.js` (substitui o antigo — o catálogo foi retirado dele)
- `JS/index.js` (agora lê o campo "destaque" em vez da lista fixa)
- `index.html` e `produtos.html` (ganharam uma linha a mais no `<head>`
  carregando o `JS/products-catalog.js`)
- `IMG/produtos/.htaccess` (arquivo de segurança da pasta de fotos —
  não precisa mexer nele, só garantir que ele foi enviado)

**4. Preencher as credenciais**
Abra `admin/config.php` e troque `DB_NAME`, `DB_USER` e `DB_PASS`
pelos dados do passo 1. `DB_HOST` geralmente pode ficar `localhost`.

**5. Importar o catálogo que já existia**
No navegador, acesse:
`https://seusite.com.br/admin/migrate-import.php`

Isso cadastra automaticamente, no banco novo, os produtos que hoje
estão no código — sem precisar digitar nada de novo. As fotos não são
reenviadas nesse passo; elas continuam nos mesmos lugares (`IMG/produtos/...`)
e o script só aponta pra elas.

Se aparecer um aviso de "produtos com o mesmo número de identificação",
é porque o arquivo antigo tinha um erro de cadastro (dois produtos
com o mesmo código) — o script já corrige isso sozinho, é só uma
informação, não precisa fazer nada.

**6. Definir a senha real do Sávio**
Acesse `https://seusite.com.br/admin/set-password.php`, informe o
usuário (`savio`) e a senha que ele vai usar de verdade.

**7. Apagar os arquivos de uso único**
Depois que os passos 5 e 6 funcionarem, **apague estes arquivos do
servidor** (Gerenciador de Arquivos ou SFTP) — eles não são mais
necessários e, se ficarem no ar, qualquer pessoa poderia tentar usá-los:
- `admin/migrate-import.php`
- `admin/migrate-data.json`
- `admin/set-password.php`

**8. Pronto**
Agora é só acessar `https://seusite.com.br/admin/` e fazer login. O
Sávio pode cadastrar produtos novos, editar preço/descrição, subir
fotos (elas são otimizadas automaticamente) e marcar quais aparecem
em destaque na Home — tudo sem depender da HOD.

## Se precisar trocar a senha depois

Não existe uma tela de "esqueci minha senha" (de propósito, pra não
abrir mais uma porta de entrada). Se o Sávio esquecer a senha, é só a
HOD repetir os passos 6 e 7: subir o `set-password.php` de novo,
trocar a senha, apagar o arquivo de novo.
