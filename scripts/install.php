<?php
if (PHP_SAPI!=='cli') { http_response_code(404);exit; }
require __DIR__.'/../backend/bootstrap/app.php';
$db=App\Config\Database::connect();
if ($db->query('SHOW TABLES')->fetch()) { fwrite(STDERR,"Instalação recusada: o banco precisa estar vazio.\n");exit(1); }
$db->exec(file_get_contents(__DIR__.'/../database/schema.sql'));
$db->exec(file_get_contents(__DIR__.'/../database/seed.sql'));
echo "Schema e dados iniciais instalados.\n";
