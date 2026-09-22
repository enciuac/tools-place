<?php
/**
 * Envío de formularios de toolsplace.es desde el propio servidor (Plesk), sin servicios externos.
 * Mismo sistema que catalogo.blizzcool.es: POST con FormData y respuesta JSON {"ok":true} / {"ok":false,"error":"..."}.
 *
 * Los destinatarios están fijados aquí (no los decide el formulario), así nadie puede usar
 * este script para mandar correos a otras direcciones.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/* ---------- Configuración ---------- */
const REMITENTE = 'no-reply@toolsplace.es';   // debe ser una dirección del dominio alojado en este servidor
const REMITENTE_NOMBRE = 'Web Tools Place';

const FORMULARIOS = [
    'contacto' => [
        'para'      => ['info@toolsplace.es'],
        'copia'     => [],
        'asunto'    => 'Nueva consulta web · Tools Place',
        'titulo'    => 'Nueva consulta desde la web',
        'requeridos'=> ['Nombre', 'Teléfono', 'email', 'Privacidad'],
    ],
    'aplazamiento' => [
        'para'      => ['administracion@toolsplace.es'],
        'copia'     => ['info@toolsplace.es'],
        'asunto'    => 'Solicitud de aplazamiento de pago · Tools Place',
        'titulo'    => 'Nueva solicitud de aplazamiento de pago',
        'requeridos'=> ['Razón social', 'DNI / CIF / NIF', 'Nombre y apellidos', 'Teléfono', 'email', 'Aviso legal y privacidad'],
    ],
];
const MAX_ENVIOS = 5;        // por IP…
const VENTANA_SEG = 600;     // …cada 10 minutos
const MAX_CAMPO = 5000;      // caracteres por campo
/* ----------------------------------- */

function responder(bool $ok, string $error = '', int $status = 200): void
{
    http_response_code($status);
    echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    responder(false, 'method-not-allowed', 405);
}

// Solo peticiones desde esta misma web
$origen = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origen !== '' && parse_url($origen, PHP_URL_HOST) !== parse_url('//' . ($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST)) {
    responder(false, 'forbidden', 403);
}

// Campo trampa: los bots lo rellenan; respondemos "ok" sin enviar nada
if (trim($_POST['_honey'] ?? '') !== '') {
    responder(true);
}

$tipo = $_POST['_form'] ?? '';
if (!isset(FORMULARIOS[$tipo])) {
    responder(false, 'unknown-form', 400);
}
$cfg = FORMULARIOS[$tipo];

// PHP convierte espacios y puntos de los nombres de campo en "_": recuperamos el nombre legible
$campos = [];
foreach ($_POST as $clave => $valor) {
    if ($clave === '' || $clave[0] === '_' || is_array($valor)) {
        continue;
    }
    $etiqueta = str_replace('_', ' ', $clave);
    $valor = trim((string) $valor);
    $campos[$etiqueta] = function_exists('mb_substr') ? mb_substr($valor, 0, MAX_CAMPO) : substr($valor, 0, MAX_CAMPO);
}

foreach ($cfg['requeridos'] as $req) {
    if (($campos[$req] ?? '') === '') {
        responder(false, 'missing-field', 422);
    }
}
$email = $campos['email'] ?? '';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(false, 'invalid-email', 422);
}

// Límite de envíos por IP (evita abusos)
$ip = $_SERVER['REMOTE_ADDR'] ?? 'desconocida';
$registro = sys_get_temp_dir() . '/tp_envios_' . md5($ip);
$ahora = time();
$marcas = array_filter(
    array_map('intval', @file($registro, FILE_IGNORE_NEW_LINES) ?: []),
    fn($t) => $t > $ahora - VENTANA_SEG
);
if (count($marcas) >= MAX_ENVIOS) {
    responder(false, 'too-many-requests', 429);
}
$marcas[] = $ahora;
@file_put_contents($registro, implode("\n", $marcas), LOCK_EX);

// Correo en HTML (tabla, como el de FormSubmit) + versión en texto
$e = fn($s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
$filas = '';
$texto = $cfg['titulo'] . "\n\n";
foreach ($campos as $etiqueta => $valor) {
    $filas .= '<tr><th style="text-align:left;vertical-align:top;padding:8px 12px;background:#f3f5f8;border:1px solid #e1e5eb;white-space:nowrap">'
        . $e($etiqueta) . '</th><td style="padding:8px 12px;border:1px solid #e1e5eb">' . nl2br($e($valor)) . '</td></tr>';
    $texto .= $etiqueta . ': ' . $valor . "\n";
}
$fecha = date('d/m/Y H:i');
$html = '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#1c2430">'
    . '<h2 style="margin:0 0 6px">' . $e($cfg['titulo']) . '</h2>'
    . '<p style="margin:0 0 16px;color:#6b778b">Recibida el ' . $fecha . ' desde ' . $e($_SERVER['HTTP_HOST'] ?? 'la web') . '</p>'
    . '<table style="border-collapse:collapse;font-size:14px">' . $filas . '</table>'
    . '<p style="margin-top:16px;color:#6b778b;font-size:12px">Puedes responder directamente a este correo para contestar a ' . $e($email) . '.</p>'
    . '</body></html>';
$texto .= "\nRecibida el $fecha";

$limpia = fn($s) => str_replace(["\r", "\n"], '', $s);   // evita inyección de cabeceras
$mime = fn($s) => '=?UTF-8?B?' . base64_encode($s) . '?=';
$limite = 'tp_' . bin2hex(random_bytes(12));

$cabeceras = [
    'From: ' . $mime(REMITENTE_NOMBRE) . ' <' . REMITENTE . '>',
    'Reply-To: ' . $mime($limpia($campos['Nombre'] ?? $campos['Nombre y apellidos'] ?? '')) . ' <' . $limpia($email) . '>',
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' . $limite . '"',
];
if ($cfg['copia']) {
    $cabeceras[] = 'Cc: ' . implode(', ', $cfg['copia']);
}
$cuerpo = "--$limite\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
    . chunk_split(base64_encode($texto))
    . "--$limite\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
    . chunk_split(base64_encode($html))
    . "--$limite--";

$enviado = mail(
    implode(', ', $cfg['para']),
    $mime($cfg['asunto']),
    $cuerpo,
    implode("\r\n", $cabeceras),
    '-f' . REMITENTE
);

if (!$enviado) {
    error_log('[enviar.php] mail() ha fallado para el formulario ' . $tipo);
    responder(false, 'send-failed', 500);
}
responder(true);
