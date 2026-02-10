<?php

namespace App\Services\Sms;

use App\Models\SmsProvider;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelnyxService implements SmsServiceInterface
{
    protected SmsProvider $provider;

    public function __construct(SmsProvider $provider)
    {
        $this->provider = $provider;
    }

    public function send(string $to, string $message, ?string $from = null, bool $unicode = false): array
    {
        $credentials = $this->provider->credentials;
        $apiKey = $credentials['api_key'] ?? null;

        if (!$apiKey) {
            throw new \Exception('Telnyx API key not configured');
        }

        $fromNumber = $from ?? $credentials['from_number'] ?? null;

        if (!$fromNumber) {
            throw new \Exception('Telnyx sender number not configured');
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->post('https://api.telnyx.com/v2/messages', [
                'from' => $fromNumber,
                'to' => $to,
                'text' => $message,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'message_id' => $data['data']['id'] ?? null,
                    'status' => 'sent',
                    'response' => $data,
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()['errors'][0]['detail'] ?? 'Unknown error',
                'status' => 'failed',
            ];
        } catch (\Exception $e) {
            Log::error('Telnyx SMS error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'status' => 'failed',
            ];
        }
    }
}

