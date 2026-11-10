<?php
/**
 * Recebe o lead do formulario, valida e repassa para a automacao do n8n, que
 * cria o card no Kommo. Este arquivo e igual nas tres paginas da Despertar;
 * o que muda (nome da pagina e webhook) fica em pagina.php, ao lado.
 *
 * Por que PHP: a hospedagem (Turbo Cloud, cPanel + LiteSpeed) serve as paginas
 * como arquivos estaticos, e o PHP ja roda la para o WordPress. Compativel com
 * PHP 7.4, que e a versao do site hoje.
 *
 * Senha do webhook: se existir o arquivo ~/.despertar-lp.php (FORA da pasta
 * publica, ao lado da public_html) devolvendo ['token' => '...'], ela vai no
 * cabecalho "Authorization: Bearer ...". E o que protege o webhook, que esta
 * escrito num repositorio publico. O arquivo nao vai para o GitHub.
 *
 * Para testar com outro destino, defina a variavel de ambiente LEAD_WEBHOOK_URL.
 *
 * Se o envio falhar, responde erro: o formulario mostra a falha com o WhatsApp
 * e NAO conta conversao. Lead nunca e dado como enviado sem ter ido.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

function responder($status, $corpo)
{
    http_response_code($status);
    echo json_encode($corpo, JSON_UNESCAPED_UNICODE);
    exit;
}

function texto($valor, $limite = 200)
{
    if (!is_string($valor)) {
        return '';
    }
    $valor = trim($valor);
    return function_exists('mb_substr') ? mb_substr($valor, 0, $limite, 'UTF-8') : substr($valor, 0, $limite);
}

function tamanho($valor)
{
    return function_exists('mb_strlen') ? mb_strlen($valor, 'UTF-8') : strlen($valor);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    responder(405, ['ok' => false, 'erro' => 'metodo_nao_permitido']);
}

$pagina = require __DIR__ . '/pagina.php';

$corpo = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($corpo)) {
    responder(400, ['ok' => false, 'erro' => 'json_invalido']);
}

// Campo-isca preenchido = robo. Responde ok para ele nao tentar de novo, e nao repassa.
if (texto($corpo['empresa'] ?? '') !== '') {
    responder(200, ['ok' => true]);
}

$nome = texto($corpo['nome'] ?? '', 120);
$whatsapp = preg_replace('/\D/', '', texto($corpo['whatsapp'] ?? '', 40));
$idade = texto($corpo['idade'] ?? '', 60);
$quemIndicou = texto($corpo['quem_indicou'] ?? '', 80);

// A validacao completa (com as opcoes de cada pergunta) e feita no formulario;
// aqui so se barra o que nao pode virar card.
$erros = [];
if (tamanho($nome) < 2) {
    $erros['nome'] = 'Escreva seu nome.';
}
$local = (strlen($whatsapp) >= 12 && substr($whatsapp, 0, 2) === '55') ? substr($whatsapp, 2) : $whatsapp;
if (strlen($local) < 10 || strlen($local) > 11) {
    $erros['whatsapp'] = 'Confira o WhatsApp, com DDD.';
}
if ($idade === '') {
    $erros['idade'] = 'Responda a pergunta de idade.';
}
if ($erros) {
    responder(422, ['ok' => false, 'erro' => 'dados_invalidos', 'campos' => $erros]);
}

$rastreio = isset($corpo['rastreio']) && is_array($corpo['rastreio']) ? $corpo['rastreio'] : [];
$payload = [
    'pagina' => $pagina['nome'], // nota do card no Kommo ("Home", "LP Fono", "LP TO")
    'nome' => $nome,
    'whatsapp' => '55' . $local,
    'idade' => $idade, // campo "Idade da criança" no Kommo, nas tres paginas
    'quem_indicou' => $quemIndicou,
];
foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'] as $p) {
    $payload[$p] = texto($rastreio[$p] ?? '', 300);
}
$payload['referrer'] = texto($rastreio['referrer'] ?? '', 1000);
$payload['pagina_de_entrada'] = texto($rastreio['pagina_de_entrada'] ?? '', 1000);
$payload['enviado_em'] = gmdate('Y-m-d\TH:i:s\Z');

$destino = getenv('LEAD_WEBHOOK_URL') ?: $pagina['webhook'];

$cabecalhos = ['Content-Type: application/json'];
$arquivoDaSenha = dirname(rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), '/')) . '/.despertar-lp.php';
if (is_readable($arquivoDaSenha)) {
    $config = include $arquivoDaSenha;
    if (is_array($config) && !empty($config['token'])) {
        $cabecalhos[] = 'Authorization: Bearer ' . $config['token'];
    }
}

$json = json_encode($payload, JSON_UNESCAPED_UNICODE);
$status = 0;
if (function_exists('curl_init')) {
    $ch = curl_init($destino);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $json,
        CURLOPT_HTTPHEADER => $cabecalhos,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
    ]);
    curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $falha = curl_error($ch);
    curl_close($ch);
} else {
    $contexto = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => implode("\r\n", $cabecalhos),
        'content' => $json,
        'timeout' => 10,
        'ignore_errors' => true,
    ]]);
    $resposta = @file_get_contents($destino, false, $contexto);
    $falha = $resposta === false ? 'sem resposta' : '';
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s?/', $http_response_header[0], $m)) {
        $status = (int) $m[1];
    }
}

if ($status === 0) {
    error_log('[lead] falha ao repassar: ' . $falha);
    responder(502, ['ok' => false, 'erro' => 'destino_indisponivel']);
}
if ($status < 200 || $status >= 300) {
    error_log('[lead] destino respondeu ' . $status);
    responder(502, ['ok' => false, 'erro' => 'destino_recusou']);
}

responder(200, ['ok' => true]);
