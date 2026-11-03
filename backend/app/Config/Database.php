<?php
namespace App\Config;
use PDO;
use RuntimeException;
final class Database {
    public static function connect(): PDO {
        static $db;
        if ($db) return $db;
        $options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false];
        $tls = Env::get('APP_ENV') === 'production' || Env::get('DB_REQUIRE_TLS') !== 'false';
        if ($tls) {
            $ca = Env::get('DB_SSL_CA');
            if ($ca !== '' && !str_starts_with($ca, '/') && !str_starts_with($ca, '\\') && !(strlen($ca) > 1 && $ca[1] === ':')) {
                $ca = dirname(__DIR__, 2) . '/' . $ca;
            }
            if (!$ca || !is_readable($ca)) throw new RuntimeException('Certificado CA obrigatório.');
            $options[PDO::MYSQL_ATTR_SSL_CA] = $ca;
            $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
        }
        $host = Env::get('DB_HOST') ?: 'localhost';
        $port = Env::get('DB_PORT') ?: '3306';
        $name = Env::get('DB_NAME') ?: 'forza';
        $db = new PDO("mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4", Env::get('DB_USER') ?: 'root', Env::get('DB_PASSWORD') ?: '', $options);
        if ($tls) {
            $cipher = $db->query("SHOW STATUS LIKE 'Ssl_cipher'")->fetch();
            if (empty($cipher['Value'])) throw new RuntimeException('A conexão não negociou TLS.');
        }
        return $db;
    }
}
