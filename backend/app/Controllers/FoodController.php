<?php
namespace App\Controllers;
use App\Models\Store as DB;
use App\Services\Input as V;
use App\Services\HttpError;
use App\Middleware\Auth;
final class FoodController {
    public static function foods(): array {
        Auth::user(); $q=substr((string)($_GET['q']??''),0,100);
        return DB::all('SELECT * FROM alimentos WHERE nome LIKE ? ORDER BY nome LIMIT 100',['%'.$q.'%']);
    }
    public static function list(): array {
        $date=V::date(['data'=>$_GET['data']??date('Y-m-d')],'data');
        $meals=DB::all('SELECT * FROM refeicoes WHERE usuario_id=? AND data=? ORDER BY id',[Auth::user(),$date]);
        foreach($meals as &$m) $m['alimentos']=DB::all('SELECT ra.*,a.nome,a.fonte,ROUND(a.calorias*ra.gramas/100,2) calorias,ROUND(a.proteinas*ra.gramas/100,2) proteinas,ROUND(a.carboidratos*ra.gramas/100,2) carboidratos,ROUND(a.gorduras*ra.gramas/100,2) gorduras FROM refeicao_alimentos ra JOIN alimentos a ON a.id=ra.alimento_id WHERE refeicao_id=?',[$m['id']]);
        return $meals;
    }
    public static function save(?int $id): array {
        $uid=Auth::user();if($id) DB::owned('refeicoes',$id,$uid);
        $d=V::body();$name=V::text($d,'nome',2,100);$date=V::date($d,'data');$foods=$d['alimentos']??[];
        if(!is_array($foods)||count($foods)<1||count($foods)>40) throw new HttpError(422,'Adicione de 1 a 40 alimentos.');
        $rows=[];
        foreach($foods as $food){
            if(!is_array($food)) throw new HttpError(422,'Alimento inválido.');
            $fid=V::integer($food,'alimento_id',1,1000000);
            if(!DB::one('SELECT id FROM alimentos WHERE id=?',[$fid])) throw new HttpError(422,'Alimento inexistente.');
            $rows[]=[$fid,V::number($food,'gramas',1,5000)];
        }
        return DB::transaction(function()use($uid,$id,$name,$date,$rows){
            if($id){DB::run('UPDATE refeicoes SET nome=?,data=? WHERE id=? AND usuario_id=?',[$name,$date,$id,$uid]);DB::run('DELETE FROM refeicao_alimentos WHERE refeicao_id=?',[$id]);}
            else {DB::run('INSERT INTO refeicoes (usuario_id,nome,data) VALUES (?,?,?)',[$uid,$name,$date]);$id=DB::id();}
            foreach($rows as $row) DB::run('INSERT INTO refeicao_alimentos (refeicao_id,alimento_id,gramas) VALUES (?,?,?)',array_merge([$id],$row));return ['id'=>$id];
        });
    }
    public static function delete(int $id): array {DB::owned('refeicoes',$id,Auth::user());DB::run('DELETE FROM refeicoes WHERE id=?',[$id]);return ['ok'=>true];}
}
