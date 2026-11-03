<?php
namespace App\Services;
final class HttpError extends \RuntimeException {
    public function __construct(public int $status, string $message) { parent::__construct($message); }
}
