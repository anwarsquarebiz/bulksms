<?php

namespace App\Services\Sms;

interface SmsServiceInterface
{
    public function send(string $to, string $message, ?string $from = null, bool $unicode = false): array;
}

