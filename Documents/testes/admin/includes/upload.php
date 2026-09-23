<?php
/**
 * Upload de fotos de produto.
 *
 * Cuidados de segurança aqui (isso é o ponto mais sensível do painel,
 * porque é onde um arquivo de fora entra no servidor):
 *  - Nunca confiamos na extensão do arquivo nem no "tipo" que o
 *    navegador informa — a gente abre o arquivo de verdade
 *    (getimagesize) pra confirmar que é uma imagem legítima.
 *  - Toda imagem aceita é RECONVERTIDA do zero em WebP pelo PHP.
 *    Isso tem um efeito colateral ótimo: não existe como um arquivo
 *    malicioso "disfarçado" de imagem sobreviver, porque não
 *    copiamos o arquivo original — desenhamos uma imagem nova a
 *    partir dos pixels.
 *  - O nome do arquivo salvo é sempre gerado pelo sistema (nunca o
 *    nome que veio do computador do usuário), então não tem como
 *    sobrescrever outro arquivo do servidor ou escapar da pasta.
 *  - A pasta de upload tem um .htaccess que impede o Apache de
 *    executar PHP dentro dela (ver IMG/produtos/.htaccess) — então
 *    mesmo num cenário extremo isso nunca vira código rodando.
 */

const FORJ3D_MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB por foto enviada
const FORJ3D_MAX_DIMENSION = 1600; // lado maior da foto já otimizada
const FORJ3D_WEBP_QUALITY = 80;

function forj3d_slugify(string $text): string {
    $text = iconv('UTF-8', 'ASCII//TRANSLIT', $text) ?: $text;
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    $text = trim($text, '-');
    return $text !== '' ? $text : 'produto';
}

/**
 * Recebe um item de $_FILES (já isolado) e devolve o caminho
 * relativo salvo (ex.: "IMG/produtos/boneco-x/boneco-x-1-a1b2c3.webp"),
 * ou lança uma Exception com uma mensagem amigável se algo não bater.
 */
function forj3d_handle_uploaded_image(array $file, string $productSlug, int $index): string {
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        throw new RuntimeException('Nenhum arquivo enviado.');
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Falha ao enviar o arquivo (código ' . $file['error'] . ').');
    }
    if ($file['size'] <= 0 || $file['size'] > FORJ3D_MAX_UPLOAD_BYTES) {
        throw new RuntimeException('A foto precisa ter até 8MB.');
    }
    if (!is_uploaded_file($file['tmp_name'])) {
        throw new RuntimeException('Upload inválido.');
    }

    $info = @getimagesize($file['tmp_name']);
    if ($info === false) {
        throw new RuntimeException('O arquivo enviado não é uma imagem válida.');
    }

    [$width, $height, $type] = $info;

    $image = match ($type) {
        IMAGETYPE_JPEG => imagecreatefromjpeg($file['tmp_name']),
        IMAGETYPE_PNG => imagecreatefrompng($file['tmp_name']),
        IMAGETYPE_GIF => imagecreatefromgif($file['tmp_name']),
        IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? imagecreatefromwebp($file['tmp_name']) : false,
        default => false,
    };

    if (!$image) {
        throw new RuntimeException('Formato de imagem não suportado. Use JPG, PNG, GIF ou WebP.');
    }

    // Fundo branco por baixo de PNGs com transparência, pra não virar preto no WebP.
    $withBg = imagecreatetruecolor(imagesx($image), imagesy($image));
    imagefill($withBg, 0, 0, imagecolorallocate($withBg, 255, 255, 255));
    imagealphablending($withBg, true);
    imagecopy($withBg, $image, 0, 0, 0, 0, imagesx($image), imagesy($image));
    imagedestroy($image);
    $image = $withBg;

    // Redimensiona se for maior que o teto definido, mantendo proporção.
    $maxSide = max($width, $height);
    if ($maxSide > FORJ3D_MAX_DIMENSION) {
        $scale = FORJ3D_MAX_DIMENSION / $maxSide;
        $newW = (int) round($width * $scale);
        $newH = (int) round($height * $scale);
        $resized = imagecreatetruecolor($newW, $newH);
        imagecopyresampled($resized, $image, 0, 0, 0, 0, $newW, $newH, $width, $height);
        imagedestroy($image);
        $image = $resized;
    }

    $dir = rtrim(UPLOAD_DIR, '/') . '/' . $productSlug;
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('Não foi possível criar a pasta de destino.');
    }

    $filename = $productSlug . '-' . $index . '-' . bin2hex(random_bytes(3)) . '.webp';
    $fullPath = $dir . '/' . $filename;

    if (!imagewebp($image, $fullPath, FORJ3D_WEBP_QUALITY)) {
        imagedestroy($image);
        throw new RuntimeException('Falha ao salvar a imagem convertida.');
    }
    imagedestroy($image);
    chmod($fullPath, 0644);

    return rtrim(UPLOAD_URL_BASE, '/') . '/' . $productSlug . '/' . $filename;
}

function forj3d_delete_image_file(string $relativePath): void {
    $prefix = rtrim(UPLOAD_URL_BASE, '/') . '/';
    if (!str_starts_with($relativePath, $prefix)) {
        return; // nunca apaga nada fora da pasta de produtos
    }
    $full = rtrim(UPLOAD_DIR, '/') . '/' . substr($relativePath, strlen($prefix));
    $real = realpath($full);
    $realBase = realpath(UPLOAD_DIR);
    if ($real && $realBase && str_starts_with($real, $realBase) && is_file($real)) {
        @unlink($real);
    }
}
