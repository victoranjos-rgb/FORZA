<?php
namespace App\Models;
use App\Config\Database;
use App\Services\HttpError;
final class Store {
    public static function run(string $sql, array $params = []): \PDOStatement {
        $s = Database::connect()->prepare($sql); $s->execute($params); return $s;
    }
    public static function all(string $sql, array $p = []): array { return self::run($sql, $p)->fetchAll(); }
    public static function one(string $sql, array $p = []): ?array { return self::run($sql, $p)->fetch() ?: null; }
    public static function id(): int { return (int)Database::connect()->lastInsertId(); }
    public static function owned(string $table, int $id, int $uid): array {
        if (!in_array($table, ['treinos','refeicoes','sessoes_treino','registros_peso','medidas_corporais'], true)) throw new \LogicException('Tabela inválida.');
        return self::one("SELECT * FROM $table WHERE id=? AND usuario_id=?", [$id,$uid]) ?? throw new HttpError(404, 'Registro não encontrado.');
    }
    public static function transaction(callable $fn): mixed {
        $db = Database::connect(); $db->beginTransaction();
        try { $result = $fn(); $db->commit(); return $result; }
        catch (\Throwable $e) { if ($db->inTransaction()) $db->rollBack(); throw $e; }
    }
}
