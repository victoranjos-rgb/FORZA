<?php
declare(strict_types=1);
namespace App\Config;

/** Configuration scoped to the PHP request, without process-wide putenv writes. */
final class Env {
    private static array $values = [];

    public static function load(string $file): void {
        self::$values = [];
        if (!is_file($file)) return;
        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) throw new \RuntimeException('Não foi possível ler a configuração.');
        foreach ($lines as $line) {
            $line = trim(ltrim($line, "\xEF\xBB\xBF"));
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            if (!preg_match('/^[A-Z][A-Z0-9_]*$/D', $key)) continue;
            $value = trim($value);
            if (strlen($value) >= 2 && in_array($value[0], ['"', "'"], true) && $value[0] === $value[strlen($value)-1]) {
                $value = substr($value, 1, -1);
            }
            self::$values[$key] = $value;
        }
    }

    public static function get(string $key, string $default = ''): string {
        if (array_key_exists($key, self::$values)) return self::$values[$key];
        $value = getenv($key);
        return $value === false ? $default : $value;
    }
}
