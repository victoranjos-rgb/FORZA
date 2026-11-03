<?php
namespace App\Controllers;
use App\Models\Store as DB;
use App\Services\Input as V;
use App\Middleware\Auth;
final class ProgressController {
    public static function list(): array {
        $uid=Auth::user();
        return ['pesos'=>DB::all('SELECT * FROM registros_peso WHERE usuario_id=? ORDER BY data,id',[$uid]),'medidas'=>DB::all('SELECT * FROM medidas_corporais WHERE usuario_id=? ORDER BY data,id',[$uid]),'sessoes'=>WorkoutController::sessions(),'cargas'=>DB::all('SELECT sr.nome_exercicio,DATE(s.iniciado_em) data,MAX(sr.carga) carga FROM series_realizadas sr JOIN sessoes_treino s ON s.id=sr.sessao_id WHERE s.usuario_id=? AND s.finalizado_em IS NOT NULL AND sr.concluida=1 GROUP BY sr.nome_exercicio,DATE(s.iniciado_em) ORDER BY data,sr.nome_exercicio',[$uid])];
    }
    public static function save(bool $measure): array {
        $uid=Auth::user();$d=V::body();$date=V::date($d,'data');
        if($measure) DB::run('INSERT INTO medidas_corporais (usuario_id,data,cintura,quadril,braco) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE cintura=VALUES(cintura),quadril=VALUES(quadril),braco=VALUES(braco)',[$uid,$date,V::number($d,'cintura',20,250),V::number($d,'quadril',20,250),V::number($d,'braco',10,100)]);
        else DB::transaction(function()use($uid,$date,$d){
            DB::run('INSERT INTO registros_peso (usuario_id,data,peso) VALUES (?,?,?) ON DUPLICATE KEY UPDATE peso=VALUES(peso)',[$uid,$date,V::number($d,'peso',25,400)]);
            $latest=DB::one('SELECT peso FROM registros_peso WHERE usuario_id=? ORDER BY data DESC LIMIT 1',[$uid]);
            DB::run('UPDATE perfis SET peso=? WHERE usuario_id=?',[$latest['peso'],$uid]);
        });return ['ok'=>true];
    }
    public static function delete(bool $measure,int $id): array {
        $uid=Auth::user();$table=$measure?'medidas_corporais':'registros_peso'; DB::owned($table,$id,$uid);DB::run("DELETE FROM $table WHERE id=?",[$id]);return ['ok'=>true];
    }
    public static function tips(): array {
        $uid=Auth::user();
        return DB::all('SELECT d.* FROM dicas d JOIN perfis p ON p.objetivo_id=d.objetivo_id WHERE p.usuario_id=? ORDER BY d.id',[$uid]);
    }
    public static function dashboard(): array {
        $uid=Auth::user();$date=date('Y-m-d');
        $stats=DB::one('SELECT COUNT(*) total,SUM(finalizado_em >= DATE_SUB(CURDATE(),INTERVAL WEEKDAY(CURDATE()) DAY)) semana FROM sessoes_treino WHERE usuario_id=? AND finalizado_em IS NOT NULL',[$uid]);
        $_GET['data']=$date;
        return ['estatisticas'=>$stats,'treinos'=>WorkoutController::list(),'refeicoes'=>FoodController::list(),'progresso'=>self::list(),'dicas'=>self::tips()];
    }
}
