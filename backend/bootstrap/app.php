<?php
declare(strict_types=1);
spl_autoload_register(function(string $class): void {
    if (str_starts_with($class, 'App\\')) {
        $file = __DIR__ . '/../app/' . str_replace('\\', '/', substr($class, 4)) . '.php';
        if (is_file($file)) require $file;
    }
});
App\Config\Env::load(__DIR__ . '/../.env');

date_default_timezone_set('America/Sao_Paulo');
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
session_name('forza_session');
session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => (App\Config\Env::get('APP_ENV') === 'production' || (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')), 'httponly' => true, 'samesite' => 'Lax']);
session_start();
$_SESSION['csrf'] ??= bin2hex(random_bytes(32));
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
set_exception_handler(function(Throwable $e): void {
    $status = $e instanceof App\Services\HttpError ? $e->status : 500;
    if ($status === 500) error_log((string)$e);
    http_response_code($status);
    echo json_encode(['error' => $status === 500 ? 'Serviço indisponível. Confira a configuração do banco e tente novamente.' : $e->getMessage()], JSON_UNESCAPED_UNICODE);
});
