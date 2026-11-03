<?php
require __DIR__.'/../bootstrap/app.php';
if ((int)($_SERVER['CONTENT_LENGTH']??0)>131072) throw new App\Services\HttpError(413,'Requisição muito grande.');
$method=$_SERVER['REQUEST_METHOD'];
if(!in_array($method,['GET','HEAD'],true)) App\Middleware\Auth::csrf();
$path=$_GET['route']??'/';
if(!is_string($path)) throw new App\Services\HttpError(400,'Rota inválida.');
foreach(require __DIR__.'/../app/Routes/api.php' as [$verb,$pattern,$handler]) {
    if($method===$verb && preg_match('~^'.$pattern.'$~D',$path,$matches)) {
        array_shift($matches);
        echo json_encode(['data'=>$handler(...$matches)],JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);exit;
    }
}
throw new App\Services\HttpError(404,'Endpoint não encontrado.');
