<?php
// Servidor local: php -S localhost:8000 router.php
$path=rawurldecode(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH));
if ($path === '/backend/public/index.php') {require __DIR__.'/backend/public/index.php';return true;}
if ($path === '/' || $path === '/index.php') {header('Location: /frontend/index.html');return true;}
$root=realpath(__DIR__.'/frontend');$file=realpath(__DIR__.$path);
if ($file && str_starts_with($file,$root.DIRECTORY_SEPARATOR) && is_file($file) && in_array(strtolower(pathinfo($file,PATHINFO_EXTENSION)),['html','css','js','svg','png','webp','jpg'],true)) return false;
http_response_code(404);echo 'P?gina n?o encontrada.';return true;
