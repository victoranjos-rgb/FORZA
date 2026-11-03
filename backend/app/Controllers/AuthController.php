<?php
namespace App\Controllers;
use App\Models\Store as DB;
use App\Services\Input as V;
use App\Services\HttpError;
use App\Middleware\Auth;
final class AuthController {
    public static function me(): array {
        if (empty($_SESSION['uid'])) return ['user'=>null,'csrf'=>$_SESSION['csrf']];
        $u = DB::one('SELECT id,nome,email FROM usuarios WHERE id=?', [Auth::user()]);
        if (!$u) { unset($_SESSION['uid']); return ['user'=>null,'csrf'=>$_SESSION['csrf']]; }
        $u['perfil'] = DB::one('SELECT * FROM perfis WHERE usuario_id=?', [$u['id']]);
        return ['user'=>$u,'csrf'=>$_SESSION['csrf']];
    }
    public static function authenticate(bool $register): array {
        $d = V::body();
        $email = strtolower(V::text($d,'email',3,254));
        if (!filter_var($email,FILTER_VALIDATE_EMAIL)) throw new HttpError(422,'Email inválido.');
        $password = $d['senha'] ?? '';
        if (!is_string($password) || strlen($password)<8 || strlen($password)>72) throw new HttpError(422,'A senha deve ter entre 8 e 72 bytes.');
        $ip = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'local');
        $key = hash('sha256', $email);
        $attempts = DB::one('SELECT COUNT(*) AS n FROM tentativas_login WHERE (ip_hash=? OR email_hash=?) AND criado_em > DATE_SUB(NOW(), INTERVAL 15 MINUTE)',[$ip,$key]);
        if ((int)$attempts['n'] >= 10) throw new HttpError(429,'Muitas tentativas. Aguarde 15 minutos.');
        DB::run('INSERT INTO tentativas_login (ip_hash,email_hash) VALUES (?,?)',[$ip,$key]);
        DB::run('DELETE FROM tentativas_login WHERE criado_em < DATE_SUB(NOW(), INTERVAL 1 DAY)');
        if ($register) {
            $name = V::text($d,'nome',2,100);
            try { DB::run('INSERT INTO usuarios (nome,email,senha_hash) VALUES (?,?,?)',[$name,$email,password_hash($password,PASSWORD_DEFAULT)]); }
            catch (\PDOException $e) { if ($e->getCode()==='23000') throw new HttpError(409,'Este email já est? cadastrado.'); throw $e; }
            $uid = DB::id();
        } else {
            $u = DB::one('SELECT * FROM usuarios WHERE email=?',[$email]);
            if (!password_verify($password,$u['senha_hash'] ?? '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.')) throw new HttpError(401,'Email ou senha incorretos.');
            $uid = (int)$u['id'];
        }
        session_regenerate_id(true); $_SESSION['uid']=$uid; $_SESSION['csrf']=bin2hex(random_bytes(32));
        return self::me();
    }
    public static function logout(): array {
        $_SESSION=[]; session_regenerate_id(true); $_SESSION['csrf']=bin2hex(random_bytes(32)); return ['ok'=>true];
    }
    public static function password(): array {
        $uid=Auth::user(); $d=V::body();
        $u=DB::one('SELECT senha_hash FROM usuarios WHERE id=?',[$uid]);
        if (!password_verify(V::password($d,'senha_atual'),$u['senha_hash'])) throw new HttpError(422,'Senha atual incorreta.');
        $new=V::password($d,'nova_senha',8);
        DB::run('UPDATE usuarios SET senha_hash=? WHERE id=?',[password_hash($new,PASSWORD_DEFAULT),$uid]);
        session_regenerate_id(true); return ['ok'=>true];
    }
    public static function delete(): array {
        $uid=Auth::user(); $d=V::body();
        $u=DB::one('SELECT senha_hash FROM usuarios WHERE id=?',[$uid]);
        if (($d['confirmacao']??'')!=='EXCLUIR' || !password_verify(V::password($d,'senha'),$u['senha_hash'])) throw new HttpError(422,'Confirme com EXCLUIR e sua senha atual.');
        DB::run('DELETE FROM usuarios WHERE id=?',[$uid]); return self::logout();
    }
}
