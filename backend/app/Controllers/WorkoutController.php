<?php
namespace App\Controllers;
use App\Models\Store as DB;
use App\Services\Input as V;
use App\Services\HttpError;
use App\Middleware\Auth;
final class WorkoutController {
    public static function library(): array { Auth::user(); return DB::all('SELECT * FROM exercicios ORDER BY nome'); }
    public static function list(): array {
        $items=DB::all('SELECT * FROM treinos WHERE usuario_id=? ORDER BY id DESC',[Auth::user()]);
        foreach($items as &$item) $item['exercicios']=DB::all('SELECT te.*,e.nome,e.grupo_muscular,e.equipamento FROM treino_exercicios te JOIN exercicios e ON e.id=te.exercicio_id WHERE treino_id=? ORDER BY ordem,id',[$item['id']]);
        return $items;
    }
    public static function save(?int $id): array {
        $uid=Auth::user(); if($id) DB::owned('treinos',$id,$uid);
        $d=V::body(); $name=V::text($d,'nome',2,100);
        $days=$d['dias']??[];
        if(!is_array($days)||count($days)<1||count($days)>7) throw new HttpError(422,'Selecione os dias da semana.');
        foreach($days as $day) if(!is_int($day)||$day<0||$day>6) throw new HttpError(422,'Dia inválido.');
        $ex=$d['exercicios']??[];
        if(!is_array($ex)||count($ex)<1||count($ex)>30) throw new HttpError(422,'Adicione de 1 a 30 exercícios.');
        $rows=[];
        foreach($ex as $i=>$e) {
            if(!is_array($e)) throw new HttpError(422,'Exercício inválido.');
            $eid=V::integer($e,'exercicio_id',1,1000000);
            if(!DB::one('SELECT id FROM exercicios WHERE id=?',[$eid])) throw new HttpError(422,'Exercício inexistente.');
            $rows[]=[$eid,V::integer($e,'series',1,20),V::integer($e,'repeticoes',1,100),V::number($e,'carga',0,1000),V::integer($e,'descanso',0,600),$i];
        }
        return DB::transaction(function()use($uid,$id,$name,$days,$rows){
            if($id) { DB::run('UPDATE treinos SET nome=?,dias=? WHERE id=? AND usuario_id=?',[$name,json_encode(array_values(array_unique($days))),$id,$uid]); DB::run('DELETE FROM treino_exercicios WHERE treino_id=?',[$id]); }
            else {DB::run('INSERT INTO treinos (usuario_id,nome,dias) VALUES (?,?,?)',[$uid,$name,json_encode(array_values(array_unique($days)))]);$id=DB::id();}
            foreach($rows as $row) DB::run('INSERT INTO treino_exercicios (treino_id,exercicio_id,series,repeticoes,carga,descanso,ordem) VALUES (?,?,?,?,?,?,?)',array_merge([$id],$row));
            return ['id'=>$id];
        });
    }
    public static function delete(int $id): array { DB::owned('treinos',$id,Auth::user()); DB::run('DELETE FROM treinos WHERE id=?',[$id]);return ['ok'=>true]; }
    public static function sessions(): array {
        $items=DB::all('SELECT * FROM sessoes_treino WHERE usuario_id=? ORDER BY id DESC',[Auth::user()]);
        foreach($items as &$s) $s['series']=DB::all('SELECT * FROM series_realizadas WHERE sessao_id=? ORDER BY id',[$s['id']]);
        return $items;
    }
    public static function start(): array {
        $uid=Auth::user();$d=V::body();$tid=V::integer($d,'treino_id',1,PHP_INT_MAX);
        return DB::transaction(function()use($uid,$tid){
            DB::run('SELECT id FROM usuarios WHERE id=? FOR UPDATE',[$uid]);
            $t=DB::owned('treinos',$tid,$uid);
            if(DB::one('SELECT id FROM sessoes_treino WHERE usuario_id=? AND finalizado_em IS NULL',[$uid])) throw new HttpError(409,'Você já tem uma sessão aberta. Retome pelo histórico.');
            $ex=DB::all('SELECT te.*,e.nome FROM treino_exercicios te JOIN exercicios e ON e.id=te.exercicio_id WHERE treino_id=? ORDER BY ordem,id',[$tid]);
            DB::run('INSERT INTO sessoes_treino (usuario_id,treino_id,nome_treino) VALUES (?,?,?)',[$uid,$tid,$t['nome']]);$sid=DB::id();
            foreach($ex as $e) for($n=1;$n<=$e['series'];$n++) DB::run('INSERT INTO series_realizadas (sessao_id,exercicio_id,nome_exercicio,numero,repeticoes,carga,descanso) VALUES (?,?,?,?,?,?,?)',[$sid,$e['exercicio_id'],$e['nome'],$n,$e['repeticoes'],$e['carga'],$e['descanso']]);
            return ['id'=>$sid];
        });
    }
    public static function set(int $sid,int $setid): array {
        $uid=Auth::user();$d=V::body();
        return DB::transaction(function()use($uid,$d,$sid,$setid){
            $s=DB::one('SELECT * FROM sessoes_treino WHERE id=? AND usuario_id=? FOR UPDATE',[$sid,$uid]);
            if(!$s) throw new HttpError(404,'Sessão não encontrada.');
            if($s['finalizado_em']) throw new HttpError(409,'Sessão já finalizada.');
            if(!DB::one('SELECT id FROM series_realizadas WHERE id=? AND sessao_id=?',[$setid,$sid])) throw new HttpError(404,'Série não encontrada.');
            DB::run('UPDATE series_realizadas SET concluida=?,repeticoes=?,carga=? WHERE id=? AND sessao_id=?',[V::integer($d,'concluida',0,1),V::integer($d,'repeticoes',1,100),V::number($d,'carga',0,1000),$setid,$sid]);return ['ok'=>true];
        });
    }
    public static function finish(int $id): array {
        $uid=Auth::user();
        return DB::transaction(function()use($id,$uid){
            $s=DB::one('SELECT * FROM sessoes_treino WHERE id=? AND usuario_id=? FOR UPDATE',[$id,$uid]);
            if(!$s) throw new HttpError(404,'Sessão não encontrada.');
            if($s['finalizado_em']) throw new HttpError(409,'Sessão já finalizada.');
            if(!DB::one('SELECT id FROM series_realizadas WHERE sessao_id=? AND concluida=1',[$id])) throw new HttpError(422,'Conclua ao menos uma série antes de finalizar.');
            DB::run('UPDATE sessoes_treino SET finalizado_em=NOW() WHERE id=?',[$id]);return ['ok'=>true];
        });
    }
}
