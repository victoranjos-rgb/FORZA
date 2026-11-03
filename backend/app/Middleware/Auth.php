<?php
namespace App\Middleware;
use App\Services\HttpError;
final class Auth {
    public static function user(): int {
        if (empty($_SESSION['uid'])) throw new HttpError(401, 'Entre na sua conta para continuar.');
        return (int)$_SESSION['uid'];
    }
    public static function csrf(): void {
        if (!hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) throw new HttpError(403, 'Sessão expirada. Atualize a página.');
    }
}
