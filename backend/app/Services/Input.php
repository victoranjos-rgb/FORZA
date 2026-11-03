<?php
namespace App\Services;
final class Input {
    public static function body(): array {
        try { $data = json_decode(file_get_contents('php://input'), true, 32, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new HttpError(400, 'JSON inválido.'); }
        if (!is_array($data)) throw new HttpError(400, 'Envie um objeto JSON.');
        return $data;
    }
    public static function password(array $d, string $key, int $min = 1): string {
        $value = $d[$key] ?? null;
        if (!is_string($value) || strlen($value) < $min || strlen($value) > 72) throw new HttpError(422, 'Senha inválida. Use entre ' . $min . ' e 72 bytes.');
        return $value;
    }
    public static function text(array $d, string $key, int $min = 1, int $max = 200): string {
        $v = $d[$key] ?? null;
        if (!is_string($v) || strlen(trim($v)) < $min || strlen(trim($v)) > $max) throw new HttpError(422, "Campo $key inválido ($min–$max caracteres).");
        return trim($v);
    }
    public static function number(array $d, string $key, float $min, float $max): float {
        $v = $d[$key] ?? null;
        if (!is_numeric($v) || !is_finite((float)$v) || $v < $min || $v > $max) throw new HttpError(422, "Campo $key deve estar entre $min e $max.");
        return (float)$v;
    }
    public static function integer(array $d, string $key, int $min, int $max): int {
        $v = self::number($d, $key, $min, $max);
        if (floor($v) !== $v) throw new HttpError(422, "Campo $key deve ser inteiro.");
        return (int)$v;
    }
    public static function date(array $d, string $key): string {
        $v = self::text($d, $key, 10, 10);
        $parsed = \DateTimeImmutable::createFromFormat('!Y-m-d', $v);
        if (!$parsed || $parsed->format('Y-m-d') !== $v || $v > date('Y-m-d')) throw new HttpError(422, 'Data inválida ou futura.');
        return $v;
    }
    public static function choice(array $d, string $key, array $choices): string {
        $v = self::text($d, $key);
        if (!in_array($v, $choices, true)) throw new HttpError(422, "Campo $key inválido.");
        return $v;
    }
}
