<?php
if (PHP_SAPI!=='cli') {http_response_code(404);exit;}
require __DIR__.'/../backend/bootstrap/app.php';
$db=App\Config\Database::connect();
echo 'Banco conectado. Versão: '.$db->query('SELECT VERSION()')->fetchColumn().PHP_EOL;
$ssl=$db->query("SHOW STATUS LIKE 'Ssl_cipher'")->fetch();
echo 'TLS: '.($ssl['Value']?:'desativado (somente desenvolvimento local)').PHP_EOL;
echo 'Tabelas: '.count($db->query('SHOW TABLES')->fetchAll()).PHP_EOL;
