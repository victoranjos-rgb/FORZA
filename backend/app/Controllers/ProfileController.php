<?php
namespace App\Controllers;
use App\Models\Store as DB;
use App\Services\Input as V;
use App\Middleware\Auth;
final class ProfileController {
    public static function save(): array {
        $uid=Auth::user(); $d=V::body();
        $name=V::text($d,'nome',2,100);
        $values=[$uid,V::integer($d,'idade',13,100),V::number($d,'altura',100,250),V::number($d,'peso',25,400),V::integer($d,'objetivo_id',1,3),V::choice($d,'nivel',['iniciante','intermediario','avancado']),V::integer($d,'dias_semana',1,7),V::integer($d,'minutos_treino',10,240),V::text($d,'equipamentos',1,500),V::choice($d,'unidade_carga',['kg','lb'])];
        DB::transaction(function() use($uid,$name,$values) {
            DB::run('UPDATE usuarios SET nome=? WHERE id=?',[$name,$uid]);
            DB::run('INSERT INTO perfis (usuario_id,idade,altura,peso,objetivo_id,nivel,dias_semana,minutos_treino,equipamentos,unidade_carga) VALUES (?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE idade=VALUES(idade),altura=VALUES(altura),peso=VALUES(peso),objetivo_id=VALUES(objetivo_id),nivel=VALUES(nivel),dias_semana=VALUES(dias_semana),minutos_treino=VALUES(minutos_treino),equipamentos=VALUES(equipamentos),unidade_carga=VALUES(unidade_carga)', $values);
        });
        return AuthController::me();
    }
}
