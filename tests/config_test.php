<?php
declare(strict_types=1);
require __DIR__.'/../backend/app/Config/Env.php';
use App\Config\Env;
function verify(bool $result, string $message): void { if (!$result) throw new RuntimeException($message); }
$file = tempnam(sys_get_temp_dir(), 'forza-env-');
try {
    $prior = getenv('FORZA_CONFIG_TEST');
    file_put_contents($file, "\xEF\xBB\xBF# Test fixture\nFORZA_CONFIG_TEST=request-local\nDB_SSL_CA=ca.pem\nEMPTY=\nQUOTED=\" value=with#characters \"\n");
    Env::load($file);
    verify(Env::get('FORZA_CONFIG_TEST') === 'request-local', 'Valor não carregado.');
    verify(getenv('FORZA_CONFIG_TEST') === $prior, 'O ambiente global foi alterado.');
    verify(Env::get('DB_SSL_CA') === 'ca.pem', 'CA não carregado.');
    verify(Env::get('EMPTY','fallback') === '', 'Valor vazio não preservado.');
    verify(Env::get('QUOTED') === ' value=with#characters ', 'Valor entre aspas não preservado.');
    verify(Env::get('FORZA_MISSING_TEST','fallback') === 'fallback', 'Fallback inválido.');
    Env::load($file . '.absent');
    verify(Env::get('DB_SSL_CA', 'not-set') !== 'ca.pem', 'Valores vazaram entre carregamentos.');
    echo "PASS: configuração isolada, sem putenv, BOM, aspas, vazio e fallback.\n";
} finally { unlink($file); }
