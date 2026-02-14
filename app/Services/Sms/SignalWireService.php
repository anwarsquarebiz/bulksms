<?php

namespace App\Services\Sms;

use App\Models\SmsProvider;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SignalWireService implements SmsServiceInterface
{
    protected SmsProvider $provider;

    public function __construct(SmsProvider $provider)
    {
        $this->provider = $provider;
    }

    public function send(string $to, string $message, ?string $from = null, bool $unicode = false): array
    {
        $credentials = $this->provider->credentials;
        $projectId = $credentials['project_id'] ?? null;
        $authToken = $credentials['auth_token'] ?? null;
        $spaceUrl = $credentials['space_url'] ?? null;

        if (!$projectId || !$authToken || !$spaceUrl) {
            throw new \Exception('SignalWire credentials not configured');
        }

        $fromNumber = $from ?? $credentials['from_number'] ?? null;

        if (!$fromNumber) {
            throw new \Exception('SignalWire sender number not configured');
        }

        try {
            $http = Http::withBasicAuth($projectId, $authToken)
                ->asForm();

            // Disable SSL verification in local development (Windows cURL issue)
            if (app()->environment('local')) {
                $http = $http->withoutVerifying();
            }

            $response = $http->post("https://{$spaceUrl}/api/laml/2010-04-01/Accounts/{$projectId}/Messages.json", [
                'From' => $fromNumber,
                'To' => $to,
                'Body' => $message,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'message_id' => $data['sid'] ?? null,
                    'status' => 'sent',
                    'response' => $data,
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()['message'] ?? 'Unknown error',
                'status' => 'failed',
            ];
        } catch (\Exception $e) {
            Log::error('SignalWire SMS error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'status' => 'failed',
            ];
        }
    }
}

