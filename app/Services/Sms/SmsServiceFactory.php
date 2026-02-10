<?php

namespace App\Services\Sms;

use App\Models\SmsProvider;

class SmsServiceFactory
{
    public static function make(SmsProvider $provider): SmsServiceInterface
    {
        return match ($provider->name) {
            'telnyx' => new TelnyxService($provider),
            'twilio' => new TwilioService($provider),
            'signalwire' => new SignalWireService($provider),
            default => throw new \Exception("Unknown SMS provider: {$provider->name}"),
        };
    }
}

